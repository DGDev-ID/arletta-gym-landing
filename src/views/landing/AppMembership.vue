<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import HeroMembership from '@/components/landing/membership/HeroMembership.vue'
import BenefitsBar from '@/components/landing/membership/BenefitsBar.vue'
import PricingCard from '@/components/landing/membership/PricingCard.vue'
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
<section class="relative overflow-hidden" style="margin-top: -1px;">
  <ParticleBackground />

  <div class="container-custom relative z-10 py-12">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
