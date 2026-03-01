<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import ParticleBackground from '@/components/common/ParticleBackground.vue'
import PricingCard from '@/components/landing/membership/PricingCard.vue'

const membershipPlans = [
  {
    name: '1 Month',
    price: 300000,
    period: '1 month',
    description: 'One month membership. Full access to facilities and all classes.',
    promo: '',
    features: [
      'Unlimited gym access',
      'All fitness classes included',
      'Private locker',
      'Towel service',
      'Air-conditioned workout rooms',
      'Professional personal trainers',
      'Free WiFi',
      'Hot water / water heaters',
    ],
  },
  {
    name: '3 Months',
    price: 840000,
    period: '3 months',
    description: 'Three-month payment — equivalent to 280k/month.',
    promo: 'Free 1 month (pre-sale)',
    features: [
      'Unlimited gym access',
      'All fitness classes included',
      'Private locker',
      'Towel service',
      'Air-conditioned workout rooms',
      'Professional personal trainers',
      'Free WiFi',
      'Hot water / water heaters',
    ],
  },
  {
    name: '6 Months',
    price: 1560000,
    period: '6 months',
    description: 'Six-month payment — equivalent to 260k/month.',
    promo: 'Free 2 months (pre-sale)',
    features: [
      'Unlimited gym access',
      'All fitness classes included',
      'Private locker',
      'Towel service',
      'Air-conditioned workout rooms',
      'Professional personal trainers',
      'Free WiFi',
      'Hot water / water heaters',
    ],
  },
  {
    name: '1 Year',
    price: 2880000,
    period: '12 months',
    description: 'Annual payment — equivalent to 240k/month.',
    promo: 'Free 3 months (pre-sale)',
    features: [
      'Unlimited gym access',
      'All fitness classes included',
      'Private locker',
      'Towel service',
      'Air-conditioned workout rooms',
      'Professional personal trainers',
      'Free WiFi',
      'Hot water / water heaters',
    ],
  },
  {
    name: '18 Months',
    price: 3960000,
    period: '18 months',
    description: 'Eighteen-month payment — equivalent to 220k/month.',
    promo: 'Free 4 months (pre-sale)',
    features: [
      'Unlimited gym access',
      'All fitness classes included',
      'Private locker',
      'Towel service',
      'Air-conditioned workout rooms',
      'Professional personal trainers',
      'Free WiFi',
      'Hot water / water heaters',
    ],
  },
  {
    name: '24 Months',
    price: 4800000,
    period: '24 months',
    description: 'Twenty-four month payment — equivalent to 200k/month.',
    promo: 'Free 5 months (pre-sale)',
    features: [
      'Unlimited gym access',
      'All fitness classes included',
      'Private locker',
      'Towel service',
      'Air-conditioned workout rooms',
      'Professional personal trainers',
      'Free WiFi',
      'Hot water / water heaters',
    ],
  },
]

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
    <!-- Particle Background -->
    <ParticleBackground />

    <!-- Content with higher z-index -->
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

      <div class="max-w-8xl mx-auto">
        <div class="relative z-10">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <PricingCard
              v-for="plan in membershipPlans"
              :key="plan.name"
              :plan="plan"
              @signup="goToSignUp"
            />
          </div>
        </div>

        <!-- Payment modal for logged-in users -->
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
      </div>
    </div>
  </section>
</template>
