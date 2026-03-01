<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { login } from '@/services/mockAuth'
import { setUser } from '@/stores/auth'

const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) return

  isLoading.value = true
  try {
    const user = await login(email.value, password.value)
    isLoading.value = false
    toast.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: `Welcome back, ${user.name}!`,
      life: 3000,
    })
    // route based on role
    if (user.role === 'pt') {
      // save auth state and route
      setUser({
        ...user,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
      })
      router.push('/pt/profile')
    } else {
      setUser({
        ...user,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
      })
      router.push('/member/profile')
    }
  } catch (err) {
    isLoading.value = false
    // simple feedback — in a real app show toast/error
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: 'Invalid email or password. Please try again.',
      life: 3000,
    })
    console.warn('Login failed', err)
  }
}

const goToSignUp = () => {
  router.push('/signup')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <!--
  Login Form (commented out - showing Coming Soon instead)
  <form
    @submit.prevent="handleLogin"
    v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
    class="space-y-6 animate-fadeinup"
    style="animation-delay: 0.08s"
  >
    ...form markup preserved...
  </form>
  -->

  <div class="py-12 text-center">
    <h3 class="text-2xl font-bold text-white">Coming Soon</h3>
    <p class="text-(--text-secondary) mt-2">Login functionality will be available shortly.</p>
  </div>
</template>

<style scoped>
/* Override PrimeVue Password input styles */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

/* Ensure PrimeVue inputs have enough left padding so icons don't overlap placeholder text */
:deep(.p-inputtext) {
  padding-left: 3rem !important; /* matches the icon position */
}

:deep(.p-password-input) {
  padding-left: 3rem !important; /* ensure password input also has space */
}
</style>
