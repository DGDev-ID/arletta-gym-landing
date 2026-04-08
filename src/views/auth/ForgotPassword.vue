<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import {
  forgotPasswordSendOtp,
  forgotPasswordSubmitToken,
  forgotPasswordChangePassword,
} from '@/services/authService'

const router = useRouter()
const toast = useToast()

// Step: 1 = email, 2 = token verification, 3 = new password
const step = ref(1)

const email = ref('')
const token = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)

const goHome = () => router.push('/')
const goToLogin = () => router.push('/login')

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

// Step 1: Send OTP
const handleSendOtp = async () => {
  if (!email.value) return
  isLoading.value = true
  try {
    await forgotPasswordSendOtp(email.value)
    step.value = 2
    toast.add({
      severity: 'success',
      summary: 'OTP Terkirim',
      detail: 'Kode OTP telah dikirim ke email Anda.',
      life: 3000,
    })
  } catch (err) {
    const msg = getErrorMessage(err) || 'Gagal mengirim OTP'
    toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })
  } finally {
    isLoading.value = false
  }
}

// Resend OTP
const handleResendOtp = async () => {
  if (!email.value) return
  isLoading.value = true
  try {
    await forgotPasswordSendOtp(email.value)
    toast.add({
      severity: 'success',
      summary: 'OTP Dikirim Ulang',
      detail: 'Kode OTP baru telah dikirim ke email Anda.',
      life: 3000,
    })
  } catch (err) {
    const msg = getErrorMessage(err) || 'Gagal mengirim ulang OTP'
    toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })
  } finally {
    isLoading.value = false
  }
}

// Step 2: Submit Token
const handleSubmitToken = async () => {
  if (!email.value || !token.value) return
  isLoading.value = true
  try {
    await forgotPasswordSubmitToken(email.value, token.value)
    step.value = 3
    toast.add({
      severity: 'success',
      summary: 'Token Valid',
      detail: 'Token berhasil diverifikasi. Silakan buat kata sandi baru.',
      life: 3000,
    })
  } catch (err) {
    const msg = getErrorMessage(err) || 'Token tidak valid'
    toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })
  } finally {
    isLoading.value = false
  }
}

// Step 3: Change Password
const handleChangePassword = async () => {
  if (!password.value || !passwordConfirmation.value) return
  if (password.value !== passwordConfirmation.value) {
    toast.add({
      severity: 'warn',
      summary: 'Kata sandi tidak cocok',
      detail: 'Pastikan konfirmasi kata sandi sama.',
      life: 3000,
    })
    return
  }
  isLoading.value = true
  try {
    await forgotPasswordChangePassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Kata sandi berhasil diubah. Silakan login.',
      life: 3000,
    })
    router.push('/login')
  } catch (err) {
    const msg = getErrorMessage(err) || 'Gagal mengubah kata sandi'
    toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })
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

    <!-- Right Side - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
      <div class="w-full max-w-md">
        <!-- Back to home -->
        <button
          class="flex items-center gap-2 text-(--text-secondary) hover:text-white mb-8 transition-colors"
          @click="goHome"
        >
          <i class="pi pi-arrow-left"></i>
          <span>Kembali ke Beranda</span>
        </button>

        <!-- Mobile Logo -->
        <div class="lg:hidden mb-8">
          <h2 class="text-3xl font-black">
            <span class="text-white">ARLETTA</span>
            <span class="text-(--primary)">GYM</span>
          </h2>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center gap-2 mb-6">
          <div
            v-for="s in 3"
            :key="s"
            class="flex-1 h-1 rounded-full transition-all duration-300"
            :class="s <= step ? 'bg-(--primary)' : 'bg-white/10'"
          ></div>
        </div>
        <p class="text-xs text-(--text-muted) mb-6">Langkah {{ step }} dari 3</p>

        <!-- ========== STEP 1: Enter Email ========== -->
        <div v-if="step === 1">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Lupa Kata Sandi?</h1>
            <p class="text-(--text-secondary)">
              Masukkan alamat email Anda dan kami akan mengirimkan kode OTP untuk mereset kata sandi.
            </p>
          </div>

          <form @submit.prevent="handleSendOtp" class="space-y-6 animate-fadeinup">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-(--text-secondary)">
                Alamat Email
              </label>
              <div class="relative">
                <i
                  class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <InputText
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="anda@contoh.com"
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              :label="isLoading ? 'Mengirim...' : 'Kirim Kode OTP'"
              :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-send'"
              iconPos="right"
              :disabled="isLoading || !email"
              class="btn w-full py-3.5 text-base font-semibold"
            />

            <p class="text-center text-(--text-secondary)">
              Ingat kata sandi Anda?
              <button
                type="button"
                class="text-(--primary) font-medium hover:underline ml-1"
                @click="goToLogin"
              >
                Masuk
              </button>
            </p>
          </form>
        </div>

        <!-- ========== STEP 2: Enter Token ========== -->
        <div v-else-if="step === 2">
          <div class="mb-8">
            <div
              class="w-16 h-16 bg-(--primary)/20 rounded-full flex items-center justify-center mb-4"
            >
              <i class="pi pi-key text-3xl text-(--primary)"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Verifikasi Token</h1>
            <p class="text-(--text-secondary)">
              Masukkan kode token yang telah dikirim ke
              <span class="text-white font-medium">{{ email }}</span>
            </p>
          </div>

          <form @submit.prevent="handleSubmitToken" class="space-y-6 animate-fadeinup">
            <!-- Email (disabled) -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-(--text-secondary)">
                Alamat Email
              </label>
              <div class="relative">
                <i
                  class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <InputText
                  :model-value="email"
                  disabled
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 transition-all"
                />
              </div>
            </div>

            <!-- Token -->
            <div class="space-y-2">
              <label for="token" class="block text-sm font-medium text-(--text-secondary)">
                Kode Token
              </label>
              <div class="relative">
                <i
                  class="pi pi-key absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <InputText
                  id="token"
                  v-model="token"
                  type="text"
                  placeholder="Masukkan kode token"
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              :label="isLoading ? 'Memverifikasi...' : 'Verifikasi Token'"
              :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
              iconPos="right"
              :disabled="isLoading || !token"
              class="btn w-full py-3.5 text-base font-semibold"
            />

            <p class="text-(--text-secondary) text-sm text-center">
              Tidak menerima kode?
              <button
                type="button"
                class="text-(--primary) font-medium hover:underline ml-1"
                :disabled="isLoading"
                @click="handleResendOtp"
              >
                {{ isLoading ? 'Mengirim ulang...' : 'Kirim ulang' }}
              </button>
            </p>
          </form>
        </div>

        <!-- ========== STEP 3: New Password ========== -->
        <div v-else>
          <div class="mb-8">
            <div
              class="w-16 h-16 bg-(--primary)/20 rounded-full flex items-center justify-center mb-4"
            >
              <i class="pi pi-lock text-3xl text-(--primary)"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Buat Kata Sandi Baru</h1>
            <p class="text-(--text-secondary)">
              Masukkan kata sandi baru untuk akun Anda.
            </p>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-6 animate-fadeinup">
            <!-- Email (disabled) -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-(--text-secondary)">
                Alamat Email
              </label>
              <div class="relative">
                <i
                  class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <InputText
                  :model-value="email"
                  disabled
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 transition-all"
                />
              </div>
            </div>

            <!-- Token (disabled) -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-(--text-secondary)">
                Kode Token
              </label>
              <div class="relative">
                <i
                  class="pi pi-key absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <InputText
                  :model-value="token"
                  disabled
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 transition-all"
                />
              </div>
            </div>

            <!-- New Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-(--text-secondary)">
                Kata Sandi Baru
              </label>
              <div class="relative">
                <i
                  class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <Password
                  id="password"
                  v-model="password"
                  placeholder="Masukkan kata sandi baru"
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

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label
                for="passwordConfirmation"
                class="block text-sm font-medium text-(--text-secondary)"
              >
                Konfirmasi Kata Sandi
              </label>
              <div class="relative">
                <i
                  class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
                ></i>
                <Password
                  id="passwordConfirmation"
                  v-model="passwordConfirmation"
                  placeholder="Konfirmasi kata sandi baru"
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

            <Button
              type="submit"
              :label="isLoading ? 'Menyimpan...' : 'Ubah Kata Sandi'"
              :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
              iconPos="right"
              :disabled="isLoading || !password || !passwordConfirmation"
              class="btn w-full py-3.5 text-base font-semibold"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-inputtext) {
  padding-left: 3rem !important;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
  padding-left: 3rem !important;
}
</style>
