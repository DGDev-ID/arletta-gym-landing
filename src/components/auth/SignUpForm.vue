<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import EmailVerificationModal from '@/components/auth/EmailVerificationModal.vue'
import HealthPolicyModal from '@/components/auth/HealthPolicyModal.vue'
import { useToast } from 'primevue/usetoast'
import { registerAndPersist as apiRegister } from '@/services/authService'
import { setUser } from '@/stores/auth'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
// New accounts are created as 'member' by default. PT accounts are created by admin.

// Additional personal fields
const alamat = ref('')
const tempatLahir = ref('')
const tanggalLahir = ref<Date | null>(null)
const noHp = ref('')
const club = ref('')
const pekerjaan = ref('')
const noKtp = ref('')
const jenisKelamin = ref('')

// Emergency contact fields
const emergencyName = ref('')
const emergencyPhone = ref('')
const emergencyRelation = ref('')

// Health policy agreement state
const showHealthPolicy = ref(false)
const healthPolicyAccepted = ref(false)

const isLoading = ref(false)
const showVerificationModal = ref(false)

// Gender options for Select component
const genderOptions = [
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' },
]

const toast = useToast()

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

const handleSignUp = async () => {
  // Must accept health policy first
  if (!healthPolicyAccepted.value) {
    showHealthPolicy.value = true
    return
  }

  // Basic validation
  if (!name.value || !email.value || !password.value || !confirmPassword.value) return
  if (password.value !== confirmPassword.value) return

  // Additional required fields validation
  if (!alamat.value || !tempatLahir.value || !tanggalLahir.value) return
  if (!noHp.value || !jenisKelamin.value || !pekerjaan.value || !noKtp.value) return
  if (!emergencyName.value || !emergencyPhone.value || !emergencyRelation.value) return

  isLoading.value = true

  try {
    const payload: Record<string, unknown> = {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
      phone_number: noHp.value || undefined,
      nik: noKtp.value || undefined,
      birth_place: tempatLahir.value || undefined,
      birth_date: tanggalLahir.value ? new Date(tanggalLahir.value).toISOString().split('T')[0] : undefined,
      gender: jenisKelamin.value === 'Laki-laki' ? 'male' : jenisKelamin.value === 'Perempuan' ? 'female' : undefined,
      address: alamat.value || undefined,
      emergency_name: emergencyName.value || undefined,
      emergency_phone: emergencyPhone.value || undefined,
      emergency_relation: emergencyRelation.value || undefined,
      // minimal health policy payload so backend knows user accepted terms
      health_policy: {
        agreed_terms: !!healthPolicyAccepted.value,
      },
    }

    const { user, token } = await apiRegister(payload)

    // Persist token and set authorization header (use registerAndPersist helper)
    try {
      const auth = await import('@/services/authService')
      if (auth && typeof auth.registerAndPersist === 'function') {
        await auth.registerAndPersist(payload)
      } else {
        try {
          localStorage.setItem('auth_token', token)
        } catch {}
      }
    } catch {
      try { localStorage.setItem('auth_token', token) } catch {}
    }

    // Optionally set user into auth store (consistent with login behavior)
    const userObj = user as Record<string, unknown>
    const userDetailReg = (userObj['userDetail'] ?? userObj['user_detail'] ?? {}) as Record<string, unknown>
    const photoUrlReg = String(userDetailReg['photo'] ?? userObj['avatar'] ?? '')
    setUser({
      id: Number(user.id),
      name: String(user.name ?? ''),
      email: String(user.email ?? ''),
      role: (user.role === 'pt' ? 'pt' : 'member') as 'member' | 'pt',
      avatar: photoUrlReg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(user.name ?? ''))}`,
    })

    toast.add({ severity: 'success', summary: 'Account created', detail: 'Registration successful', life: 3000 })
    showVerificationModal.value = true
  } catch (err) {
    console.warn('Registration failed', err)
    const errorMsg = getErrorMessage(err) || 'Please check your input'
    toast.add({ severity: 'error', summary: 'Registration failed', detail: errorMsg, life: 5000 })
  } finally {
    isLoading.value = false
  }
}

const startSignUp = () => {
  showHealthPolicy.value = true
}

const onHealthPolicyAccepted = () => {
  healthPolicyAccepted.value = true
  showHealthPolicy.value = false
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <form
    @submit.prevent="handleSignUp"
    v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
    class="space-y-6 animate-fadeinup"
    style="animation-delay: 0.08s"
  >
    <!-- Role selection removed: new accounts are created as 'member' by default. -->

    <!-- Full Name -->
    <div class="space-y-2">
      <label for="name" class="block text-sm font-medium text-(--text-secondary)">
        Full Name
      </label>
      <div class="relative">
        <i
          class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
        ></i>
        <InputText
          id="name"
          v-model="name"
          type="text"
          placeholder="John Doe"
          class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
        />
      </div>
    </div>

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
      <label for="password" class="block text-sm font-medium text-(--text-secondary)">
        Password
      </label>
      <div class="relative">
        <i
          class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
        ></i>
        <Password
          id="password"
          v-model="password"
          placeholder="Create a password"
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
      <label for="confirmPassword" class="block text-sm font-medium text-(--text-secondary)">
        Confirm Password
      </label>
      <div class="relative">
        <i
          class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
        ></i>
        <Password
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Confirm your password"
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

    <!-- Personal Information Section -->
    <div class="pt-4 border-t border-white/10">
      <h3 class="text-lg font-semibold text-white mb-4">Personal Information</h3>

      <!-- Alamat - Using PrimeVue Textarea -->
      <div class="space-y-2 mb-4">
        <label for="alamat" class="block text-sm font-medium text-(--text-secondary)">
          Alamat
        </label>
        <div class="relative">
          <i
            class="pi pi-map-marker absolute left-4 top-4 text-(--text-muted) z-10 pointer-events-none"
          ></i>
          <Textarea
            id="alamat"
            v-model="alamat"
            rows="3"
            placeholder="Alamat lengkap Anda"
            :pt="{
              root: {
                class:
                  'w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all resize-none',
              },
            }"
          />
        </div>
      </div>

      <!-- Tempat & Tanggal Lahir -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label for="tempatLahir" class="block text-sm font-medium text-(--text-secondary)">
            Tempat Lahir
          </label>
          <div class="relative">
            <i
              class="pi pi-map absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <InputText
              id="tempatLahir"
              v-model="tempatLahir"
              type="text"
              placeholder="Kota kelahiran"
              class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label for="tanggalLahir" class="block text-sm font-medium text-(--text-secondary)">
            Tanggal Lahir
          </label>
          <div class="relative">
            <i
              class="pi pi-calendar absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <DatePicker
              id="tanggalLahir"
              v-model="tanggalLahir"
              dateFormat="dd/mm/yy"
              placeholder="Pilih tanggal lahir"
              showIcon
              iconDisplay="input"
              :pt="{
                pcInput: {
                  root: {
                    class:
                      'w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all',
                  },
                },
                dropdown: {
                  class: 'absolute right-4 text-(--text-muted)',
                },
              }"
            />
          </div>
        </div>
      </div>

      <!-- No HP & Jenis Kelamin -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label for="noHp" class="block text-sm font-medium text-(--text-secondary)">
            No HP
          </label>
          <div class="relative">
            <i
              class="pi pi-phone absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <InputText
              id="noHp"
              v-model="noHp"
              type="tel"
              placeholder="08xxxxxxxxxx"
              class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label for="jenisKelamin" class="block text-sm font-medium text-(--text-secondary)">
            Jenis Kelamin
          </label>
          <div class="relative">
            <i
              class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <Select
              id="jenisKelamin"
              v-model="jenisKelamin"
              :options="genderOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih jenis kelamin"
              :pt="{
                root: {
                  class: 'w-full',
                },
                input: {
                  class:
                    'w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all',
                },
                dropdown: {
                  class: 'text-(--text-muted)',
                },
                overlay: {
                  class: 'bg-(--bg-card) border border-white/10 rounded-lg',
                },
                list: {
                  class: 'p-2',
                },
                option: {
                  class:
                    'px-4 py-2 text-white hover:bg-white/10 rounded cursor-pointer transition-colors',
                },
              }"
            />
          </div>
        </div>
      </div>

      <!-- Pekerjaan & No KTP -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label for="pekerjaan" class="block text-sm font-medium text-(--text-secondary)">
            Pekerjaan
          </label>
          <div class="relative">
            <i
              class="pi pi-briefcase absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <InputText
              id="pekerjaan"
              v-model="pekerjaan"
              type="text"
              placeholder="Pekerjaan Anda"
              class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label for="noKtp" class="block text-sm font-medium text-(--text-secondary)">
            No KTP
          </label>
          <div class="relative">
            <i
              class="pi pi-id-card absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <InputText
              id="noKtp"
              v-model="noKtp"
              type="text"
              placeholder="16 digit nomor KTP"
              class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Club (Optional) -->
      <div class="space-y-2 mb-4">
        <label for="club" class="block text-sm font-medium text-(--text-secondary)">
          Club <span class="text-(--text-muted) text-xs">(Opsional)</span>
        </label>
        <div class="relative">
          <i
            class="pi pi-building absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
          ></i>
          <InputText
            id="club"
            v-model="club"
            type="text"
            placeholder="Nama club atau cabang gym"
            class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Emergency Contact Section -->
    <div class="pt-4 border-t border-white/10">
      <h3 class="text-lg font-semibold text-white mb-4">Kontak Darurat</h3>

      <!-- Emergency Name -->
      <div class="space-y-2 mb-4">
        <label for="emergencyName" class="block text-sm font-medium text-(--text-secondary)">
          Nama
        </label>
        <div class="relative">
          <i
            class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
          ></i>
          <InputText
            id="emergencyName"
            v-model="emergencyName"
            type="text"
            placeholder="Nama kontak darurat"
            class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
          />
        </div>
      </div>

      <!-- Emergency Phone & Relation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label for="emergencyPhone" class="block text-sm font-medium text-(--text-secondary)">
            No HP
          </label>
          <div class="relative">
            <i
              class="pi pi-phone absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <InputText
              id="emergencyPhone"
              v-model="emergencyPhone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label for="emergencyRelation" class="block text-sm font-medium text-(--text-secondary)">
            Hubungan
          </label>
          <div class="relative">
            <i
              class="pi pi-users absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none"
            ></i>
            <InputText
              id="emergencyRelation"
              v-model="emergencyRelation"
              type="text"
              placeholder="Contoh: Orang tua, Saudara"
              class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-(--text-muted) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Health Policy Checkbox (Terms & Conditions style) -->
    <div class="mt-4">
      <div
        class="flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer"
        :class="
          healthPolicyAccepted
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-white/5 border-white/10 hover:border-white/20'
        "
        @click="healthPolicyAccepted ? (healthPolicyAccepted = false) : startSignUp()"
      >
        <!-- Custom Checkbox Box -->
        <div
          class="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center"
          :class="
            healthPolicyAccepted
              ? 'bg-(--primary) border-(--primary)'
              : 'bg-transparent border-white/30'
          "
        >
          <i v-if="healthPolicyAccepted" class="pi pi-check text-white text-xs font-bold"></i>
        </div>

        <!-- Label Text -->
        <span
          class="text-sm leading-relaxed select-none"
          :class="healthPolicyAccepted ? 'text-green-300' : 'text-(--text-secondary)'"
        >
          Saya telah membaca dan menyetujui
          <button
            type="button"
            @click.stop="startSignUp"
            class="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            :class="healthPolicyAccepted ? 'text-green-400' : 'text-(--primary)'"
          >
            Kebijakan Kesehatan
          </button>
          yang berlaku.
        </span>
      </div>
    </div>

    <Button
      type="submit"
      :label="isLoading ? 'Creating account...' : 'Create Account'"
      :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'"
      iconPos="right"
      :disabled="
        isLoading || !name || !email || !password || !confirmPassword || !healthPolicyAccepted
      "
      class="btn w-full py-3.5 text-base font-semibold"
    />

    <!-- Divider -->
    <div class="flex items-center gap-4 my-8">
      <div class="flex-1 h-px bg-white/10"></div>
      <span class="text-(--text-muted) text-sm">or</span>
      <div class="flex-1 h-px bg-white/10"></div>
    </div>

    <!-- Login Link -->
    <p class="text-center text-(--text-secondary) pb-8">
      Already have an account?
      <button class="text-(--primary) font-medium hover:underline ml-1" @click="goToLogin">
        Sign in
      </button>
    </p>
  </form>

  <!-- Email Verification Modal -->
  <EmailVerificationModal v-model:visible="showVerificationModal" :email="email" />

  <!-- Health Policy Modal -->
  <HealthPolicyModal v-model:visible="showHealthPolicy" @accepted="onHealthPolicyAccepted" />
</template>

<style scoped>
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

/* Ensure PrimeVue inputs have enough left padding so icons don't overlap placeholder text */
:deep(.p-inputtext) {
  padding-left: 3rem !important;
}

:deep(.p-password-input) {
  padding-left: 3rem !important;
}

/* Textarea styling */
:deep(.p-textarea) {
  padding-left: 3rem !important;
  font-family: inherit;
}

/* DatePicker styling */
:deep(.p-datepicker) {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

:deep(.p-datepicker-header) {
  background: var(--bg-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.p-datepicker-title) {
  color: white;
}

:deep(.p-datepicker-calendar td > span) {
  color: white;
}

:deep(.p-datepicker-calendar td > span:hover) {
  background: var(--primary);
}

:deep(.p-datepicker-calendar td.p-datepicker-today > span) {
  background: rgba(230, 33, 41, 0.2);
  color: var(--primary);
}

:deep(.p-datepicker .p-datepicker-buttonbar) {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Select dropdown styling */
:deep(.p-select-overlay) {
  background: var(--bg-card) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.p-select-option) {
  color: white !important;
}

:deep(.p-select-option:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.p-select-option.p-select-option-selected) {
  background: var(--primary) !important;
}

/* Ensure Select trigger has left padding so the icon doesn't overlap the placeholder/label */
:deep(.p-select .p-select-label),
:deep(.p-select .p-select-value),
:deep(.p-dropdown .p-dropdown-label) {
  padding-left: 3rem !important;
}

/* Placeholder color for Select */
:deep(.p-select .p-placeholder),
:deep(.p-dropdown .p-dropdown-label.p-placeholder) {
  color: var(--text-muted) !important;
}
</style>
