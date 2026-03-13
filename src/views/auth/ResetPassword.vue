<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { resetPassword } from '@/services/authService'

const router = useRouter()
const toast = useToast()

const token = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)

const submit = async () => {
  loading.value = true
  try {
    await resetPassword({ token: token.value, email: email.value, password: password.value, password_confirmation: passwordConfirmation.value })
    toast.add({ severity: 'success', summary: 'Password reset', detail: 'Your password has been reset. Please log in.', life: 4000 })
    router.push('/login')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Reset failed', detail: msg, life: 6000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pt-24 pb-12">
    <div class="container-custom max-w-md">
      <h1 class="heading-md text-white mb-4">Reset Password</h1>
      <p class="text-(--text-secondary) mb-6">Enter the reset token sent to your email along with your new password.</p>

      <div class="grid gap-4">
        <input v-model="token" placeholder="Reset token" class="input" />
        <input v-model="email" placeholder="Email" class="input" />
        <input v-model="password" type="password" placeholder="New password" class="input" />
        <input v-model="passwordConfirmation" type="password" placeholder="Confirm password" class="input" />

        <button class="btn w-full" :disabled="loading" @click="submit">Reset Password</button>
      </div>
    </div>
  </div>
</template>
