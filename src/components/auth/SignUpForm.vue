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

const isLoading = ref(false)
const showVerificationModal = ref(false)

// Gender options for Select component
const genderOptions = [
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' },
]

const handleSignUp = async () => {
  // Basic validation
  if (!name.value || !email.value || !password.value || !confirmPassword.value) return
  if (password.value !== confirmPassword.value) return

  // Additional required fields validation
  if (!alamat.value || !tempatLahir.value || !tanggalLahir.value) return
  if (!noHp.value || !jenisKelamin.value || !pekerjaan.value || !noKtp.value) return
  if (!emergencyName.value || !emergencyPhone.value || !emergencyRelation.value) return

  isLoading.value = true

  // Simulate API call
  setTimeout(() => {
    isLoading.value = false
    showVerificationModal.value = true
  }, 1500)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <!--
  Sign up form (commented out - showing Coming Soon instead)
  <form
    @submit.prevent="handleSignUp"
    v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
    class="space-y-6 animate-fadeinup"
    style="animation-delay: 0.08s"
  >
    ...form markup preserved...
  </form>

  Email Verification Modal preserved (commented):
  <EmailVerificationModal v-model:visible="showVerificationModal" :email="email" />
  -->

  <div class="py-12 text-center">
    <h3 class="text-2xl font-bold text-white">Coming Soon</h3>
    <p class="text-(--text-secondary) mt-2">Sign up will be available shortly.</p>
  </div>
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
