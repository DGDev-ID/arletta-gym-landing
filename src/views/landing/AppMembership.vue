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

const goToSignUp = () => {
  // If user already logged in, show signature verification first
  if (authState.isLoggedIn) {
    showSignatureModal.value = true
    return
  }
  router.push('/signup')
}

// After signature verification, show payment modal
const onSignatureConfirmed = () => {
  showSignatureModal.value = false
  showPaymentModal.value = true
}

const proceedToPayment = (method: string) => {
  // Placeholder: in real app this would call Midtrans SDK / server
  toast.add({
    severity: 'info',
    summary: 'Proceeding to payment',
    detail: `Opening ${method} checkout...`,
    life: 3000,
  })
  // open placeholder external link (replace with actual Midtrans flow)
  window.open('about:blank', '_blank')
  showPaymentModal.value = false
}

const membershipPlans = ref([])

const defaultFeatures = [
  'Unlimited gym access',
  'All fitness classes included',
  'Private locker',
  'Towel service',
  'Air-conditioned workout rooms',
  'Professional personal trainers',
  'Free WiFi',
  'Hot water / water heaters',
]

onMounted(async () => {
  try {
    const plans = await getMemberships()
    membershipPlans.value = plans.map((p) => {
      const rawPromos = p.active_promos || p.membershipPromos || p.membership_promos || p.promos || []
      const promos = (Array.isArray(rawPromos) ? rawPromos : []).map((pr) => {
        const type = pr.type ?? pr.pivot?.type ?? null
        const value = pr.value ?? pr.pivot?.value ?? pr.amount ?? null
        let label = ''
        if (type === 'percent') label = `${value}% off`
        else if (type === 'fixed') label = `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
        else label = String(value ?? '')
        return { ...pr, type, value, label }
      })

      if (!promos.length && rawPromos && Object.keys(rawPromos).length) {
        console.debug('Unexpected promos shape for plan', p.id, rawPromos)
      }

      const promoLabel = promos.length ? promos[0].label : ''

      const period = p.duration_in_days
        ? p.duration_in_days % 30 === 0
          ? `${p.duration_in_days / 30} month${p.duration_in_days / 30 > 1 ? 's' : ''}`
          : `${p.duration_in_days} days`
        : null

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        period: period,
        description: p.gym?.name ? `${p.gym.name} plan` : 'Premium membership plan',
        promo: promoLabel,
        promos: promos,
        features: defaultFeatures,
      }
    })
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
                @click="goToSignUp"
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
      v-model:visible="showPaymentModal"
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
      v-model:visible="showSignatureModal"
      :member-name="authState.user?.name"
      membership-plan="Premium Membership"
      @confirmed="onSignatureConfirmed"
    />
  </div>
</template>
