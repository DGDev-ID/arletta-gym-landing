<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'

defineProps<{ title?: string; subtitle?: string; image?: string }>()
const toast = useToast()
const showPaymentModal = ref(false)

const handleCTA = () => {
  if (authState.isLoggedIn) {
    showPaymentModal.value = true
  } else {
    emit('signup')
  }
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

const emit = defineEmits<{ signup: [] }>()
</script>

<template>
  <section class="relative py-20">
    <div class="absolute inset-0 overflow-hidden">
      <img
        :src="
          image ||
          'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=1600&h=900&fit=crop'
        "
        alt="Gym background"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-(--primary)/80"></div>
      <div class="absolute inset-0 bg-linear-to-b from-transparent to-(--bg-dark)/60"></div>
    </div>

    <div
      v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
      class="container-custom relative z-10 text-center text-white"
    >
      <h2 class="text-3xl font-bold text-white mb-4">
        {{ title || 'Ready to Start Your Fitness Journey?' }}
      </h2>
      <p class="text-white/80 mb-8 max-w-xl mx-auto">
        {{
          subtitle || 'Join thousands of members who have transformed their lives at Arletta Gym..'
        }}
      </p>
      <Button
        label="Sign Up Now"
        icon="pi pi-arrow-right"
        iconPos="right"
        :disabled="authState.user?.role === 'pt'"
        :class="[
          authState.user?.role === 'pt' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/90',
        ]"
        class="bg-white text-(--primary) px-8 py-3 font-semibold"
        @click="handleCTA"
      />
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
  </section>
</template>
