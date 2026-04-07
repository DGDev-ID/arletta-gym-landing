<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { loginAndPersist as apiLogin } from '@/services/authService'
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
  const { user } = await apiLogin(email.value, password.value)
  isLoading.value = false
    toast.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: `Welcome back, ${user.name}!`,
      life: 3000,
    })

    // Detect role: check 'roles' array first (Spatie format), then fallback to 'role' string
    let isPt = false
    const rolesArr = (user as Record<string, unknown>).roles
    if (Array.isArray(rolesArr) && rolesArr.length > 0) {
      for (const r of rolesArr) {
        const name = typeof r === 'string' ? r : String((r as Record<string, unknown>).name ?? '')
        if (name.toLowerCase().includes('personal trainer') || name.toLowerCase() === 'pt') {
          isPt = true
          break
        }
      }
    } else {
      const roleName = String(user.role ?? '').toLowerCase()
      isPt = roleName.includes('personal trainer') || roleName === 'pt'
    }
    const role: 'member' | 'pt' = isPt ? 'pt' : 'member'
    const userObj = user as Record<string, unknown>
    const userDetail = (userObj['userDetail'] ?? userObj['user_detail'] ?? {}) as Record<string, unknown>
    const photoUrl = String(userDetail['photo'] ?? userObj['photo'] ?? userObj['avatar'] ?? '')
    setUser({
      id: Number(user.id),
      name: String(user.name ?? ''),
  email: String((user as { email?: string }).email ?? ''),
      role,
      avatar: photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(user.name ?? ''))}`,
    })

    router.push(role === 'pt' ? '/pt/profile' : '/member/profile')
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
  <!-- Login Form -->
  <form
    @submit.prevent="handleLogin"
    v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
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

    <!-- Password -->
    <div class="space-y-2">
      <div class="flex justify-between">
        <label for="password" class="block text-sm font-medium text-(--text-secondary)">
          Password
        </label>
        <a
          @click="goToForgotPassword"
          class="text-sm text-(--primary) hover:underline cursor-pointer"
        >
          Forgot password?
        </a>
      </div>
      <div class="relative">
        <i
          class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
        ></i>
        <Password
          id="password"
          v-model="password"
          placeholder="Enter your password"
          :feedback="false"
          toggleMask
          :pt="{
            root: { class: 'w-full' },
            pcInput: {
              root: {
                class:
                  'w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all',
              },
            },
            maskIcon: { class: 'text-(--text-muted) right-4' },
            unmaskIcon: { class: 'text-(--text-muted) right-4' },
          }"
        />
      </div>
    </div>

    <!-- Submit Button -->
    <Button
      type="submit"
      :label="isLoading ? 'Signing in...' : 'Sign In'"
      :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'"
      iconPos="right"
      :disabled="isLoading || !email || !password"
      class="btn w-full py-3.5 text-base font-semibold"
    />

    <!-- Divider -->
    <div class="flex items-center gap-4 my-8">
      <div class="flex-1 h-px bg-white/10"></div>
      <span class="text-(--text-muted) text-sm">or</span>
      <div class="flex-1 h-px bg-white/10"></div>
    </div>

    <!-- Sign Up Link -->
    <p class="text-center text-(--text-secondary)">
      Don't have an account?
      <button class="text-(--primary) font-medium hover:underline ml-1" @click="goToSignUp">
        Sign up for free
      </button>
    </p>
  </form>
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
