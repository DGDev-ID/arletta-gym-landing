<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

defineProps<{
  email: string
}>()

const visible = defineModel<boolean>('visible', { default: false })

const toast = useToast()
const isResending = ref(false)

const handleResend = async () => {
  isResending.value = true
  // Simulate API call
  setTimeout(() => {
    isResending.value = false
    toast.add({
      severity: 'success',
      summary: 'Email Sent',
      detail: 'Verification email has been resent to your inbox.',
      life: 3000,
    })
  }, 1500)
}

const openEmailApp = () => {
  window.open('mailto:', '_blank')
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="true"
    :draggable="false"
    class="w-full max-w-md mx-4"
    :pt="{
      root: { class: 'border-none' },
      mask: { class: 'backdrop-blur-sm' },
      header: { class: 'bg-(--bg-card) border-b border-white/10 p-4' },
      content: { class: 'bg-(--bg-card) p-6' },
      footer: { class: 'bg-(--bg-card) border-t border-white/10 p-4' },
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-(--primary)/20 rounded-full flex items-center justify-center">
          <i class="pi pi-envelope text-lg text-(--primary)"></i>
        </div>
        <h3 class="text-lg font-semibold text-white">Verify Your Email</h3>
      </div>
    </template>

    <div class="text-center py-4">
      <!-- Icon -->
      <div
        class="w-24 h-24 bg-(--primary)/20 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <i class="pi pi-envelope text-5xl text-(--primary)"></i>
      </div>

      <!-- Message -->
      <h2 class="text-xl font-bold text-white mb-2">Check Your Email</h2>
      <p class="text-(--text-secondary) mb-4">We've sent a verification link to</p>
      <p class="text-white font-semibold mb-6 break-all">{{ email }}</p>

      <p class="text-(--text-muted) text-sm mb-6">
        Click the link in the email to verify your account and complete your registration.
      </p>

      <!-- Actions -->
      <div class="space-y-3">
        <Button
          label="Open Email App"
          icon="pi pi-external-link"
          iconPos="right"
          class="btn w-full py-3 text-base font-semibold"
          @click="openEmailApp"
        />

        <div class="flex items-center justify-center gap-1 text-sm">
          <span class="text-(--text-secondary)">Didn't receive the email?</span>
          <button
            type="button"
            class="text-(--primary) font-medium hover:underline disabled:opacity-50"
            :disabled="isResending"
            @click="handleResend"
          >
            {{ isResending ? 'Resending...' : 'Resend' }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-center">
        <p class="text-(--text-muted) text-xs text-center">
          <i class="pi pi-info-circle mr-1"></i>
          Please check your spam folder if you don't see the email in your inbox.
        </p>
      </div>
    </template>
  </Dialog>
</template>
