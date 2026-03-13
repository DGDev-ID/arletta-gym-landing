<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { forgotPassword as apiForgotPassword } from '@/services/authService'

const router = useRouter()
const toast = useToast()

const email = ref('')
const isLoading = ref(false)
const emailSent = ref(false)

const goHome = () => router.push('/')
const goToLogin = () => router.push('/login')
const openEmailApp = () => window.open('mailto:', '_blank')

function getErrorMessage(e: unknown): string {
  if (!e) return ''
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message
  const obj = e as Record<string, unknown>
  if (obj) {
    if ('response' in obj && obj.response && typeof obj.response === 'object') {
      const resp = obj.response as Record<string, unknown>
      if ('data' in resp && resp.data && typeof resp.data === 'object') {
        const data = resp.data as Record<string, unknown>
        if ('message' in data && typeof data.message === 'string') return data.message
      }
    }
    if ('message' in obj && typeof obj.message === 'string') return obj.message
  }
  try {
    return String(e)
  } catch {
    return ''
  }
}

const handleSubmit = async () => {
  if (!email.value) return

  isLoading.value = true
  try {
    await apiForgotPassword(email.value)
    emailSent.value = true
    toast.add({ severity: 'success', summary: 'Email Sent', detail: 'Password reset instructions have been sent to your email.', life: 3000 })
  } catch (err) {
    console.warn('Forgot password failed', err)
    const msg = getErrorMessage(err) || 'Unable to send reset link'
    toast.add({ severity: 'error', summary: 'Failed to send', detail: msg, life: 5000 })
  } finally {
    isLoading.value = false
  }
}

const handleResend = async () => {
  if (!email.value) return
  isLoading.value = true
  try {
    await apiForgotPassword(email.value)
    toast.add({ severity: 'success', summary: 'Email Resent', detail: 'Password reset instructions have been resent to your email.', life: 3000 })
  } catch (err) {
    console.warn('Resend failed', err)
    const msg = getErrorMessage(err) || 'Unable to resend link'
    toast.add({ severity: 'error', summary: 'Failed to resend', detail: msg, life: 5000 })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="h-screen bg-(--bg-dark) flex overflow-hidden">
    <!-- Left Side - Image -->
    <div class="hidden lg:flex lg:w-1/2 relative">
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=1600&fit=crop"
        alt="Gym"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-r from-transparent to-(--bg-dark)"></div>
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- Branding overlay -->
      <div class="absolute bottom-12 left-12 z-10">
        <h2 class="text-4xl font-black text-white mb-2">
          <span>ARLETTA</span>
          <span class="text-(--primary)">GYM</span>
        </h2>
        <p class="text-(--text-secondary) text-lg">Transform Your Body. Elevate Your Life.</p>
      </div>
    </div>

    <!-- Right Side - Forgot Password Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
      <div class="w-full max-w-md">
        <!-- Back to home -->
        <button
          class="flex items-center gap-2 text-(--text-secondary) hover:text-white mb-8 transition-colors"
          @click="goHome"
        >
          <i class="pi pi-arrow-left"></i>
          <span>Back to Home</span>
        </button>

        <!-- Mobile Logo -->
        <div class="lg:hidden mb-8">
          <h2 class="text-3xl font-black">
            <span class="text-white">ARLETTA</span>
            <span class="text-(--primary)">GYM</span>
          </h2>
        </div>

        <!-- Content based on state -->
        <div v-if="!emailSent">
          <!-- Forgot Password Text -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p class="text-(--text-secondary)">
              No worries! Enter your email address and we'll send you reset instructions.
            </p>
          </div>

          <!-- Forgot Password Form -->
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 animate-fadeinup"
            style="animation-delay: 0.08s"
          >
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-(--text-secondary)">
                Email Address
              </label>
              <div class="relative">
                <i
                  class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <InputText
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              :label="isLoading ? 'Sending...' : 'Send Reset Instructions'"
              :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-send'"
              iconPos="right"
              :disabled="isLoading || !email"
              class="btn w-full py-3.5 text-base font-semibold"
            />

            <!-- Back to Login -->
            <p class="text-center text-(--text-secondary)">
              Remember your password?
              <button
                type="button"
                class="text-(--primary) font-medium hover:underline ml-1"
                @click="goToLogin"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>

        <!-- Email Sent State -->
        <div v-else class="text-center animate-fadeinup">
          <div
            class="w-20 h-20 bg-(--primary)/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <i class="pi pi-envelope text-4xl text-(--primary)"></i>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p class="text-(--text-secondary) mb-8">
            We've sent password reset instructions to
            <span class="text-white font-medium">{{ email }}</span>
          </p>

          <div class="space-y-4">
            <Button
              label="Open Email App"
              icon="pi pi-external-link"
              iconPos="right"
              class="btn w-full py-3.5 text-base font-semibold"
              @click="openEmailApp"
            />

            <p class="text-(--text-secondary) text-sm">
              Didn't receive the email?
              <button
                type="button"
                class="text-(--primary) font-medium hover:underline ml-1"
                :disabled="isLoading"
                @click="handleResend"
              >
                {{ isLoading ? 'Resending...' : 'Click to resend' }}
              </button>
            </p>

            <button
              type="button"
              class="text-(--text-secondary) hover:text-white transition-colors text-sm"
              @click="goToLogin"
            >
              <i class="pi pi-arrow-left mr-2"></i>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure PrimeVue inputs have enough left padding so icons don't overlap placeholder text */
:deep(.p-inputtext) {
  padding-left: 3rem !important;
}
</style>
