<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import PricingCard from '@/components/landing/membership/PricingCard.vue'
import { getMemberships } from '@/services/membershipService'

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
