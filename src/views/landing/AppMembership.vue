<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import HeroMembership from '@/components/landing/membership/HeroMembership.vue'
import BenefitsBar from '@/components/landing/membership/BenefitsBar.vue'
import PricingCard from '@/components/landing/membership/PricingCard.vue'
import { getMemberships } from '@/services/membershipService'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import AdditionalPerks from '@/components/landing/membership/AdditionalPerks.vue'
import FAQSection from '@/components/landing/membership/FAQSection.vue'
import MembershipCTA from '@/components/landing/membership/MembershipCTA.vue'
import SignatureVerificationModal from '@/components/booking/SignatureVerificationModal.vue'

const router = useRouter()
const toast = useToast()
const showPaymentModal = ref(false)
const showSignatureModal = ref(false)
const selectedPlan = ref<ProcessedPlan | null>(null)
let createdSignatureId: number | null = null

const goToSignUp = (plan?: ProcessedPlan) => {
  // Save selected plan so we can send plan id with signature/payment
  if (plan) selectedPlan.value = plan
  // If user already logged in, show signature verification first
  if (authState.isLoggedIn) {
    showSignatureModal.value = true
    return
  }
  router.push('/signup')
}

// After signature verification, call server to persist signature then show payment modal
import { createSignature, createPayment } from '@/services/paymentService'

const onSignatureConfirmed = async (signatureData?: string) => {
  try {
  if (!signatureData) throw new Error('Signature missing')
  const payloadSig: { signature: string; membership_plan_id?: number | string } = { signature: signatureData }
  if (selectedPlan.value && selectedPlan.value.id) payloadSig.membership_plan_id = selectedPlan.value.id as number | string
  const resp = await createSignature(payloadSig as unknown as { signature: string; membership_plan_id?: number })
    // store created signature id for use in payment creation
    createdSignatureId = resp?.id ?? null
    toast.add({ severity: 'success', summary: 'Signature saved', detail: 'Signature verified successfully.', life: 3000 })
    showSignatureModal.value = false
    showPaymentModal.value = true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Signature failed', detail: message, life: 5000 })
  }
}

const proceedToPayment = async (method: string) => {
  try {
    toast.add({ severity: 'info', summary: 'Creating payment', detail: `Creating ${method} checkout...`, life: 3000 })
  const payloadPayment: { method: string; membership_plan_id?: number | string; signature_id?: number | null } = { method }
  if (selectedPlan.value && selectedPlan.value.id) payloadPayment.membership_plan_id = selectedPlan.value.id as number | string
  if (createdSignatureId) payloadPayment.signature_id = createdSignatureId
  const resp = await createPayment(payloadPayment as unknown as { membership_plan_id?: number; method?: string; amount?: number; signature_id?: number })
    // Expecting resp.payment_url or resp.token depending on backend
    if (resp.payment_url) {
      window.open(resp.payment_url, '_blank')
    } else if (resp.token) {
      // If payment token provided (for JS SDK), open a blank and let SDK pick it up in real app
      window.open('about:blank', '_blank')
    } else {
      window.open('about:blank', '_blank')
    }
    showPaymentModal.value = false
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Payment creation failed', detail: message, life: 5000 })
  }
}

interface ProcessedPlan {
  id: number | string | undefined
  name: string
  price: number | string | undefined
  period: string | null
  description: string
  promo: string
  promos: unknown[]
  features: string[]
  gymName: string | undefined
}

const membershipPlans = ref<ProcessedPlan[]>([])

// Static pre-sale overlays for certain plans (only promo and description)
// Provide both a months-based map (for services that return duration in days like 365/730)
// and a fallback by the `period` string.
const staticPresaleByMonths: Record<number, { promo?: string; description?: string }> = {
  24: { promo: 'Free 5 months (pre-sale)', description: 'Equivalent to 200k/month.' },
  18: { promo: 'Free 4 months (pre-sale)', description: 'Equivalent to 220k/month.' },
  12: { promo: 'Free 3 months (pre-sale)', description: 'Equivalent to 240k/month.' },
  6: { promo: 'Free 2 months (pre-sale)', description: 'Equivalent to 260k/month.' },
  3: { promo: 'Free 1 month (pre-sale)', description: 'Equivalent to 280k/month.' },
  1: { promo: '', description: 'One month membership. Full access to facilities and all classes.' },
}

const staticPresale: Record<string, { promo?: string; description?: string } | undefined> = {
  '24 months': staticPresaleByMonths[24],
  '18 months': staticPresaleByMonths[18],
  '12 months': staticPresaleByMonths[12],
  '6 months': staticPresaleByMonths[6],
  '3 months': staticPresaleByMonths[3],
  '1 month': staticPresaleByMonths[1],
}

onMounted(async () => {
  try {
    const plans = await getMemberships()
    membershipPlans.value = plans.map((p) => {
      const planRaw = p as Record<string, unknown>
      const rawPromos =
        (planRaw['active_promos'] as unknown) || (planRaw['membershipPromos'] as unknown) ||
        (planRaw['membership_promos'] as unknown) || (planRaw['promos'] as unknown) || []
      const promos = (Array.isArray(rawPromos) ? rawPromos : []).map((pr) => {
        const promoObj = pr as Record<string, unknown>
        const pivot = (promoObj['pivot'] as Record<string, unknown> | undefined) ?? undefined
        const type = (promoObj['type'] as string | undefined) ?? (pivot && (pivot['type'] as string)) ?? null
        const value = (promoObj['value'] as unknown) ?? (pivot && pivot['value']) ?? promoObj['amount'] ?? null
        let label = ''
        if (type === 'percent') label = `${value}% off`
        else if (type === 'fixed') label = `Rp ${new Intl.NumberFormat('id-ID').format(value as number)}`
        else label = String(value ?? '')
        return { ...(promoObj as object), type, value, label }
      })

      if (!promos.length && rawPromos && Object.keys(rawPromos).length) {
        console.debug('Unexpected promos shape for plan', p.id, rawPromos)
      }

  const promoLabel = promos.length ? (promos[0] as Record<string, unknown>)['label'] ?? '' : ''

      const period = p.duration_in_days
        ? p.duration_in_days % 30 === 0
          ? `${p.duration_in_days / 30} month${p.duration_in_days / 30 > 1 ? 's' : ''}`
          : `${p.duration_in_days} days`
        : null

  // overlay static presale promo/description when available; prefer numeric months mapping
  const durationDays = planRaw['duration_in_days'] as number | undefined
  const months = typeof durationDays === 'number' ? Math.round(durationDays / 30) : null
  const overlay = months && staticPresaleByMonths[months] ? staticPresaleByMonths[months] : (typeof period === 'string' ? staticPresale[period] : undefined)
      return {
        id: planRaw['id'] as number | string | undefined,
        name: String(planRaw['name'] ?? ''),
        price: planRaw['price'] as number | string | undefined,
        period: period,
        description:
          overlay?.description ?? (planRaw['gym'] && (planRaw['gym'] as Record<string, unknown>)['name']
            ? `${(planRaw['gym'] as Record<string, unknown>)['name']} plan`
            : 'Premium membership plan'),
        promo: String(overlay?.promo ?? promoLabel ?? ''),
        promos: promos as unknown[],
        features: Array.isArray(planRaw['features']) ? (planRaw['features'] as string[]) : [],
        gymName: planRaw['gym'] && (planRaw['gym'] as Record<string, unknown>)['name']
          ? String((planRaw['gym'] as Record<string, unknown>)['name'])
          : undefined,
      }
    })
    // Reverse order so the shortest-duration / smallest monthly packages appear first on the page
    membershipPlans.value = membershipPlans.value.slice().reverse()
  } catch (err) {
    console.warn('Failed to load memberships', err)
  }
})

const additionalPerks = [
  {
    icon: 'pi-shield',
    title: 'Freeze Membership',
    description: 'Freeze your membership for up to 3 months per year at no extra cost',
  },
  {
    icon: 'pi-users',
    title: 'Bring a Friend',
    description: '2 guest passes per month so you can bring a workout buddy',
  },
  {
    icon: 'pi-calendar',
    title: 'No Lock-in',
    description: 'Flexible month-to-month; cancel anytime after 3 months',
  },
  {
    icon: 'pi-mobile',
    title: 'Mobile App Premium',
    description: 'Full access to tracking, class booking and workout programs',
  },
]

const faqs = [
  {
    question: 'Can I freeze my membership?',
    answer:
      'Yes — you can freeze your membership for up to 3 months per year at no extra cost. Contact the front desk or use the mobile app to request a freeze.',
  },
  {
    question: 'Is there a joining fee?',
    answer:
      'We often run promotions with no joining fee. The standard joining fee is Rp 150.000, which includes your fitness assessment and orientation session.',
  },
  {
    question: 'How do I cancel my membership?',
    answer:
      'You can cancel your membership with 30 days notice. There are no cancellation fees for members who have been with us for more than 3 months.',
  },
  {
    question: 'Do you offer corporate memberships?',
    answer:
      'Yes — we offer custom corporate packages for companies with 10+ employees. Contact our sales team for a tailored quote.',
  },
  {
    question: 'Can I try before I sign up?',
    answer:
      'Yes! We offer a 1-day free trial so you can experience our facilities and classes. Sign up via the website or visit the gym in person.',
  },
]

const benefits = [
  {
    icon: 'pi-clock',
    title: '24/7 Access',
    description: 'Work out anytime that fits your schedule',
  },
  { icon: 'pi-shield', title: 'No Lock-in', description: 'Flexible month-to-month memberships' },
  { icon: 'pi-users', title: 'Community', description: 'Join a supportive fitness community' },
  { icon: 'pi-mobile', title: 'Mobile App', description: 'Track progress and book classes easily' },
]
</script>

<template>
  <div class="min-h-screen bg-(--bg-dark)">
    <!-- Hero Section -->
    <HeroMembership
      title="Premium Membership"
      subtitle="One membership for all your fitness needs. Unlimited access to premium facilities and high-quality classes."
    />

    <!-- Benefits Bar -->
    <BenefitsBar :benefits="benefits" />

    <!-- Pricing Cards -->
    <section class="section-padding relative overflow-hidden" style="margin-top: -1px">
      <ParticleBackground />

      <!-- Bonus Merchandise (static) -->
      <div class="container-custom">
        <div
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="-mx-5 relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent"
        >
          <!-- Background glow -->
          <div
            class="absolute -top-8 -left-8 w-56 h-56 bg-[radial-gradient(ellipse,rgba(230,33,41,0.13)_0%,transparent_70%)] pointer-events-none"
          ></div>
          <div
            class="absolute -bottom-12 right-0 w-72 h-72 bg-[radial-gradient(ellipse,rgba(230,33,41,0.06)_0%,transparent_70%)] pointer-events-none"
          ></div>
          <!-- Subtle grid texture -->
          <div
            class="absolute inset-0 opacity-[0.03] pointer-events-none"
            style="
              background-image:
                linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
              background-size: 32px 32px;
            "
          ></div>

          <div class="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8">
            <!-- Image block -->
            <div class="relative flex-shrink-0">
              <div
                class="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(230,33,41,0.1)]"
              >
                <img
                  src="/image.png"
                  alt="Arletta T-shirt"
                  class="w-3/4 h-3/4 object-contain"
                />
              </div>
              <!-- Gift badge -->
              <div
                class="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-full bg-(--primary) border-2 border-[#0e0e11] flex items-center justify-center shadow-[0_0_14px_rgba(230,33,41,0.55)]"
              >
                <i class="pi pi-gift text-white text-xs"></i>
              </div>
            </div>

            <!-- Text -->
            <div class="flex-1 min-w-0 text-center md:text-left">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--primary)/15 border border-(--primary)/30 text-[10px] font-bold tracking-[0.14em] uppercase text-(--primary) mb-3"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full bg-(--primary) shadow-[0_0_5px_var(--primary)]"
                ></span>
                Limited Offer
              </div>

              <h3
                class="text-xl md:text-[1.4rem] font-extrabold text-white tracking-tight leading-tight mb-2"
              >
                Bonus Merchandise — <span class="text-(--primary)">Free T-shirt</span>
              </h3>

              <!-- Slots remaining -->
              <div
                class="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/50"
              >
                <i class="pi pi-users text-[11px] text-white/30"></i>
                <span><span class="text-white font-semibold">50 First</span> Member</span>
              </div>
            </div>

            <!-- CTA -->
            <div class="flex-shrink-0 flex flex-col items-center gap-1.5">
              <button
                class="group flex items-center gap-2 px-6 py-3 rounded-xl bg-(--primary) text-white text-sm font-bold shadow-[0_4px_20px_rgba(230,33,41,0.3)] hover:shadow-[0_6px_28px_rgba(230,33,41,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                @click="() => goToSignUp()"
              >
                <i class="pi pi-bolt text-xs"></i>
                Join Now
                <i
                  class="pi pi-arrow-right text-[10px] opacity-50 group-hover:translate-x-0.5 transition-transform duration-150"
                ></i>
              </button>
              <span class="text-[11px] text-white/25">No commitment required</span>
            </div>
          </div>
        </div>
      </div>

      <div class="container-custom relative z-10 py-12">
        <div class="h-12"></div>
        <div class="-mx-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <PricingCard
            v-for="plan in membershipPlans"
            :key="plan.name"
            :plan="plan"
            @signup="goToSignUp"
          />
        </div>
      </div>
    </section>

    <!-- Additional Perks -->
    <AdditionalPerks :perks="additionalPerks" />

    <!-- FAQ Section -->
    <FAQSection :faqs="faqs" />

    <!-- CTA Section -->
    <MembershipCTA @signup="goToSignUp" />

    <!-- Payment selection modal shown when user is already logged in -->
    <Dialog
      :visible="showPaymentModal"
      @update:visible="(v) => (showPaymentModal = v)"
      header="Choose payment method"
      :modal="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4 p-4">
        <p class="text-(--text-secondary)">
          Choose a payment method to complete your membership purchase.
        </p>
        <div class="grid grid-cols-1 gap-3">
          <Button
            label="Midtrans - Credit/Debit Card"
            class="btn"
            @click="proceedToPayment('Midtrans - Card')"
          />
          <Button
            label="Midtrans - Bank Transfer"
            class="btn"
            @click="proceedToPayment('Midtrans - Bank')"
          />
          <Button
            label="Cancel"
            class="p-button-text text-(--text-secondary)"
            @click="showPaymentModal = false"
          />
        </div>
      </div>
    </Dialog>

    <!-- Signature Verification Modal (shown before payment) -->
    <SignatureVerificationModal
      :visible="showSignatureModal"
      @update:visible="(v) => (showSignatureModal = v)"
      :member-name="authState.user?.name"
      :membership-plan="selectedPlan ? selectedPlan.name : 'Premium Membership'"
      @confirmed="onSignatureConfirmed"
    />
  </div>
</template>
