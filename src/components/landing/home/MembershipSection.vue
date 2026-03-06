<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import PricingCard from '@/components/landing/membership/PricingCard.vue'
import { getMemberships } from '@/services/membershipService'

interface ProcessedPlan {
  id: number | string | undefined
  name: string
  price: number | string | undefined
  period: string | null
  description: string
  promo: string
  promos: unknown[]
  features: string[]
}

const membershipPlans = ref<ProcessedPlan[]>([])

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

// Static pre-sale overlays for certain plans (months-based, with period-string fallback)
const staticPresaleByMonths: Record<number, { promo?: string; description?: string }> = {
  24: { promo: 'Free 5 months (pre-sale)', description: 'Twenty-four month payment — equivalent to 200k/month.' },
  18: { promo: 'Free 4 months (pre-sale)', description: 'Eighteen-month payment — equivalent to 220k/month.' },
  12: { promo: 'Free 3 months (pre-sale)', description: 'Annual payment — equivalent to 240k/month.' },
  6: { promo: 'Free 2 months (pre-sale)', description: 'Six-month payment — equivalent to 260k/month.' },
  3: { promo: 'Free 1 month (pre-sale)', description: 'Three-month payment — equivalent to 280k/month.' },
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

      const period = (planRaw['duration_in_days'] as number | undefined)
        ? (planRaw['duration_in_days'] as number) % 30 === 0
          ? `${(planRaw['duration_in_days'] as number) / 30} month${(planRaw['duration_in_days'] as number) / 30 > 1 ? 's' : ''}`
          : `${planRaw['duration_in_days']} days`
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
        features: defaultFeatures,
      }
    })
    // Reverse so shortest-duration plans appear first
    membershipPlans.value = membershipPlans.value.slice().reverse()
  } catch (err) {
    console.warn('Failed to load memberships', err)
  }
})

const toast = useToast()
const showPaymentModal = ref(false)

const goToSignUp = () => {
  if (authState.isLoggedIn) {
    showPaymentModal.value = true
    return
  }
  window.location.href = '/signup'
}

const proceedToPayment = (method: string) => {
  toast.add({
    severity: 'info',
    summary: 'Proceeding to payment',
    detail: `Opening ${method} checkout...`,
    life: 3000,
  })
  window.open('about:blank', '_blank')
  showPaymentModal.value = false
}
</script>

<template>
  <section id="membership" class="section-padding bg-(--bg-dark) relative overflow-hidden">
    <ParticleBackground />

    <div class="container-custom relative z-10">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-12"
      >
        <h2 class="heading-lg text-white mb-4">
          Become a <span class="text-gradient">Member</span>
        </h2>
        <p class="text-(--text-secondary) max-w-xl mx-auto">
          One membership, unlimited possibilities. Get full access to everything we offer.
        </p>
      </div>

      <!-- On mobile: stretch to section edges. On md+: normal grid -->
      <div class="-mx-10 sm:mx-0 px-4 sm:px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <PricingCard
          v-for="plan in membershipPlans"
          :key="plan.name"
          :plan="plan"
          @signup="goToSignUp"
        />
      </div>
    </div>

    <!-- Payment modal -->
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
  </section>
</template>
