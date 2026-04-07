<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import authService from '@/services/authService'
import { uploadFile } from '@/services/uploadService'
import { getMemberships } from '@/services/membershipService'
import { createSignature, createPayment } from '@/services/paymentService'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import SignatureVerificationModal from '@/components/booking/SignatureVerificationModal.vue'

interface Session {
  id: number
  name: string
  time: string
  trainer: string
  date: string
  status: string
  type: string
}

interface MemberMeResponse {
  member?: {
    name?: string
    email?: string
    phone?: string
    memberSince?: string
    avatar?: string
    memberId?: string
    [key: string]: unknown
  }
  membership?: {
    is_active?: boolean
    membership_end_at?: string
    gym_name?: string
    gym_id?: number
    [key: string]: unknown
  }
  upcomingClasses?: Session[]
  emergencyContact?: {
    emergency_name?: string
    emergency_phone?: string
    emergency_relation?: string
  }
}
import ProfileCard from '@/components/member/profile/ProfileCard.vue'
import MembershipCard from '@/components/member/profile/MembershipCard.vue'
import ScheduleCard from '@/components/member/profile/ScheduleCard.vue'

// Member state (will be fetched from API)
const profileLoading = ref(true)
const member = ref({
  name: '',
  email: '',
  phone: '',
  memberSince: '',
  membershipType: '',
  avatar: '',
  memberId: '',
})

// Edit profile state
const showEdit = ref(false)
const editMember = ref({ ...member.value })
const savingProfile = ref(false)

const openEdit = () => {
  editMember.value = { ...member.value }
  showEdit.value = true
}

const saveProfile = async () => {
  savingProfile.value = true
  try {
    const payload = {
      name: editMember.value.name,
      phone_number: editMember.value.phone,
    }
    const updated = await authService.updateUserMe(payload)
    // update local member with returned data (best-effort)
  const mRec = ((updated && (updated.user as Record<string, unknown>)) || (updated as Record<string, unknown>)) as Record<string, unknown>
  member.value.name = String(mRec.name ?? editMember.value.name)
  member.value.email = String(mRec.email ?? editMember.value.email)
  member.value.phone = String(mRec.phone_number ?? mRec.phone ?? editMember.value.phone)
  member.value.avatar = String(mRec.avatar ?? editMember.value.avatar)
    useToast().add({ severity: 'success', summary: 'Saved', detail: 'Profile updated.', life: 3000 })
    showEdit.value = false
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    useToast().add({ severity: 'error', summary: 'Failed', detail: msg, life: 6000 })
  } finally {
    savingProfile.value = false
  }
}

const uploadingAvatar = ref(false)

const onAvatarChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    const res = await uploadFile(file)
  const r = res as Record<string, unknown>
  const maybeUrl = r['url'] ?? r['path'] ?? r['file_url'] ?? ((r['file'] as Record<string, unknown> | undefined)?.['url'])
  const url = String(maybeUrl ?? '')
    if (url) {
      editMember.value.avatar = url
      toast.add({ severity: 'success', summary: 'Uploaded', detail: 'Avatar uploaded.', life: 2500 })
    } else {
      toast.add({ severity: 'warn', summary: 'Upload', detail: 'Upload succeeded but no URL returned.', life: 4000 })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Upload failed', detail: msg, life: 6000 })
  } finally {
    uploadingAvatar.value = false
    // clear the input so the same file can be re-selected if needed
    if (input) input.value = ''
  }
}

const membershipStatus = ref({
  status: '',
  expiresAt: '',
  daysRemaining: 0,
  startDate: '',
  duration: '',
})

// Store gym_id for payment flow
const memberGymId = ref<number | null>(null)

const upcomingClasses = ref<Session[]>([])

onMounted(async () => {
  try {
  const data = (await authService.memberMe()) as MemberMeResponse
    // Expected shape: { member: { ... }, membership: {...}, upcomingClasses: [...] }
  const m = data?.member ?? null
  const membership = data?.membership ?? null
  const upcoming = data?.upcomingClasses ?? []

    if (m) {
      member.value.name = m.name ?? ''
      member.value.email = m.email ?? ''
      member.value.phone = m.phone ?? ''
      member.value.memberSince = m.memberSince ?? ''
  member.value.avatar = (m.avatar ?? member.value.avatar) || ''
      member.value.memberId = m.memberId ?? ''
    }

    if (membership) {
      const endDate = membership.membership_end_at ? new Date(membership.membership_end_at) : null
      const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0

      membershipStatus.value = {
        status: membership.is_active ? 'Active' : 'Inactive',
        expiresAt: membership.membership_end_at ?? '',
        daysRemaining,
        startDate: '',
        duration: '',
      }
      member.value.membershipType = membership.gym_name ?? ''
      memberGymId.value = membership.gym_id ?? null
    }

    upcomingClasses.value = Array.isArray(upcoming) ? upcoming : []

    // Load emergency contact data
    const ec = data?.emergencyContact ?? null
    if (ec) {
      emergency_name.value = ec.emergency_name ?? ''
      emergency_phone.value = ec.emergency_phone ?? ''
      emergency_relation.value = ec.emergency_relation ?? ''
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    useToast().add({ severity: 'error', summary: 'Failed to load profile', detail: msg, life: 4000 })
  } finally {
    profileLoading.value = false
  }
})

// Emergency contact form
const toast = useToast()
const emergency_name = ref('')
const emergency_phone = ref('')
const emergency_relation = ref('')
const submittingEmergency = ref(false)

const submitEmergency = async () => {
  submittingEmergency.value = true
  try {
    await authService.emergencyContact({ emergency_name: emergency_name.value, emergency_phone: emergency_phone.value, emergency_relation: emergency_relation.value })
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Emergency contact saved.', life: 3000 })
    emergency_name.value = ''
    emergency_phone.value = ''
    emergency_relation.value = ''
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed', detail: msg, life: 6000 })
  } finally {
    submittingEmergency.value = false
  }
}

// ── Renew Membership Flow ──────────────────────────────────────────
interface MembershipPlan {
  id: number | string
  name: string
  price: number
  duration_in_days?: number
  gym?: { id?: number; name?: string } | null
}

const showRenewDialog = ref(false)
const showRenewSignature = ref(false)
const showRenewPayment = ref(false)
const renewPlans = ref<MembershipPlan[]>([])
const renewLoading = ref(false)
const selectedRenewPlan = ref<MembershipPlan | null>(null)
const renewPaymentProcessing = ref(false)

const openRenew = async () => {
  showRenewDialog.value = true
  renewLoading.value = true
  try {
    const raw = await getMemberships()
    renewPlans.value = (Array.isArray(raw) ? raw : []).map((p) => {
      const r = p as Record<string, unknown>
      return {
        id: r.id as number | string,
        name: String(r.name ?? ''),
        price: Number(r.price ?? 0),
        duration_in_days: r.duration_in_days as number | undefined,
        gym: r.gym as { id?: number; name?: string } | null,
      }
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed to load plans', detail: msg, life: 5000 })
  } finally {
    renewLoading.value = false
  }
}

const selectRenewPlan = (plan: MembershipPlan) => {
  selectedRenewPlan.value = plan
  showRenewDialog.value = false
  showRenewSignature.value = true
}

const onRenewSignatureConfirmed = async (signatureData?: string) => {
  if (!signatureData || !selectedRenewPlan.value) return
  showRenewSignature.value = false

  // Save signature first
  try {
    await createSignature({ signature_data: signatureData, membership_plan_id: Number(selectedRenewPlan.value.id) } as unknown as { signature_data: string; membership_plan_id?: number })
    toast.add({ severity: 'success', summary: 'Signature saved', detail: 'Signature verified.', life: 3000 })
    showRenewPayment.value = true
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Signature failed', detail: msg, life: 5000 })
  }
}

const processRenewPayment = async (method: 'va' | 'qris') => {
  if (!selectedRenewPlan.value) return
  renewPaymentProcessing.value = true
  try {
    const gymId = selectedRenewPlan.value.gym?.id ?? memberGymId.value
    if (!gymId) throw new Error('Gym information is missing')

    const payload: Record<string, unknown> = {
      gym_id: Number(gymId),
      transaction_type: 'membership',
      type_id: Number(selectedRenewPlan.value.id),
      payment_method: method,
    }
    const resp = await createPayment(payload as unknown as Record<string, unknown>)
    if ((resp as Record<string, unknown>).payment_url) {
      window.open((resp as Record<string, unknown>).payment_url as string, '_blank')
    } else if ((resp as Record<string, unknown>).snap_token) {
      const snapToken = (resp as Record<string, unknown>).snap_token as string
      window.open(`https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`, '_blank')
    }
    toast.add({ severity: 'success', summary: 'Payment created', detail: 'Transaction has been created.', life: 3000 })
    showRenewPayment.value = false
    selectedRenewPlan.value = null
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Payment failed', detail: msg, life: 5000 })
  } finally {
    renewPaymentProcessing.value = false
  }
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const formatDuration = (days?: number) => {
  if (!days) return ''
  if (days % 30 === 0) {
    const months = days / 30
    return `${months} bulan`
  }
  return `${days} hari`
}
</script>

<template>
  <div>
    <!-- Page -->
    <div class="pt-24 pb-12">
      <div class="container-custom">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="heading-md text-white mb-2">My Profile</h1>
          <p class="text-(--text-secondary)">Manage your account and view your fitness journey</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Skeleton loading state -->
          <template v-if="profileLoading">
            <!-- Profile skeleton -->
            <Card class="glass-card" :pt="{ root: { class: 'bg-transparent border-0' }, body: { class: 'p-6' }, content: { class: 'p-0' } }">
              <template #content>
                <div class="flex flex-col items-center gap-4">
                  <Skeleton shape="circle" size="6rem" />
                  <Skeleton width="60%" height="1.25rem" />
                  <Skeleton width="40%" height="0.875rem" />
                  <div class="w-full space-y-3 mt-4">
                    <div class="flex items-center gap-3">
                      <Skeleton shape="circle" size="1.25rem" />
                      <Skeleton width="70%" height="0.875rem" />
                    </div>
                    <div class="flex items-center gap-3">
                      <Skeleton shape="circle" size="1.25rem" />
                      <Skeleton width="55%" height="0.875rem" />
                    </div>
                  </div>
                  <Skeleton width="100%" height="2.5rem" borderRadius="8px" class="mt-4" />
                </div>
              </template>
            </Card>
            <!-- Membership skeleton -->
            <Card class="glass-card" :pt="{ root: { class: 'bg-transparent border-0' }, body: { class: 'p-6' }, content: { class: 'p-0' } }">
              <template #content>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <Skeleton width="40%" height="1.25rem" />
                    <Skeleton width="4rem" height="1.5rem" borderRadius="9999px" />
                  </div>
                  <div class="p-4 rounded-lg bg-white/5 space-y-2">
                    <Skeleton width="30%" height="0.75rem" />
                    <Skeleton width="55%" height="1rem" />
                  </div>
                  <div class="p-4 rounded-lg bg-white/5 space-y-2">
                    <Skeleton width="30%" height="0.75rem" />
                    <Skeleton width="40%" height="1.75rem" />
                  </div>
                  <div class="p-4 rounded-lg bg-white/5 flex justify-center">
                    <Skeleton width="9.5rem" height="9.5rem" />
                  </div>
                </div>
              </template>
            </Card>
            <!-- Schedule skeleton -->
            <Card class="glass-card" :pt="{ root: { class: 'bg-transparent border-0' }, body: { class: 'p-6' }, content: { class: 'p-0' } }">
              <template #content>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <Skeleton width="40%" height="1.25rem" />
                    <Skeleton shape="circle" size="2rem" />
                  </div>
                  <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <Skeleton width="2.5rem" height="2.5rem" borderRadius="8px" />
                    <div class="flex-1 space-y-1">
                      <Skeleton width="60%" height="0.875rem" />
                      <Skeleton width="40%" height="0.75rem" />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </template>

          <!-- Actual cards -->
          <template v-else>
          <!-- Profile Card -->
          <ProfileCard :member="member" @edit="openEdit" />

          <!-- Membership Status -->
          <MembershipCard :member="member" :membership-status="membershipStatus" @renew="openRenew" />

          <!-- Upcoming Classes -->
          <ScheduleCard :upcoming-classes="upcomingClasses" />
          </template>
        </div>

        <!-- Emergency Contact Section -->
        <div class="mt-10">
          <h2 class="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <i class="pi pi-heart-fill text-(--primary)" />
            Emergency Contact
          </h2>

          <Card
            class="glass-card max-w-2xl"
            :pt="{
              root: { class: 'bg-transparent border-0' },
              body: { class: 'p-0' },
              content: { class: 'p-0' },
            }"
          >
            <template #content>
              <div class="p-6">
                <!-- Info hint -->
                <div class="flex items-start gap-3 mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <i class="pi pi-info-circle text-amber-400 mt-0.5 shrink-0" />
                  <p class="text-sm text-amber-200">
                    Kontak darurat akan dihubungi jika terjadi situasi yang tidak diinginkan selama sesi latihan.
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <!-- Name -->
                  <div class="space-y-2">
                    <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest flex items-center gap-1.5">
                      <i class="pi pi-user text-(--primary) text-xs" />
                      Name
                    </label>
                    <InputText
                      v-model="emergency_name"
                      placeholder="Contact name"
                      class="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/50"
                    />
                  </div>

                  <!-- Phone -->
                  <div class="space-y-2">
                    <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest flex items-center gap-1.5">
                      <i class="pi pi-phone text-(--primary) text-xs" />
                      Phone
                    </label>
                    <InputText
                      v-model="emergency_phone"
                      placeholder="+62 8xx xxxx xxxx"
                      class="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/50"
                    />
                  </div>

                  <!-- Relation -->
                  <div class="space-y-2">
                    <label class="text-xs text-(--text-muted) font-semibold uppercase tracking-widest flex items-center gap-1.5">
                      <i class="pi pi-users text-(--primary) text-xs" />
                      Relation
                    </label>
                    <InputText
                      v-model="emergency_relation"
                      placeholder="e.g. Parent, Sibling"
                      class="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/50"
                    />
                  </div>
                </div>

                <!-- Saved preview (shown when data exists) -->
                <div
                  v-if="emergency_name || emergency_phone || emergency_relation"
                  class="mt-5 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3"
                >
                  <div class="w-9 h-9 rounded-full bg-(--primary)/20 flex items-center justify-center shrink-0">
                    <i class="pi pi-user text-(--primary) text-sm" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-sm font-medium truncate">{{ emergency_name || '—' }}</p>
                    <p class="text-(--text-muted) text-xs truncate">
                      {{ emergency_phone || '—' }}
                      <span v-if="emergency_relation" class="mx-1">·</span>
                      {{ emergency_relation }}
                    </p>
                  </div>
                  <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full shrink-0">Saved</span>
                </div>

                <div class="mt-5 flex justify-end border-t border-white/10 pt-5">
                  <Button
                    :label="submittingEmergency ? 'Saving…' : 'Save Emergency Contact'"
                    icon="pi pi-save"
                    :loading="submittingEmergency"
                    :disabled="submittingEmergency"
                    class="px-5"
                    @click="submitEmergency"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Teleport to="body">

      <!-- ── Renew: Step 1 — Plan Picker ───────────────────────────── -->
      <Dialog
        :visible="showRenewDialog"
        @update:visible="(v) => (showRenewDialog = v)"
        header="Pilih Paket Membership"
        modal
        :style="{ width: '520px' }"
        :breakpoints="{ '640px': '92vw' }"
        :pt="{
          root: { class: 'rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111114]' },
          mask: { class: 'backdrop-blur-md !bg-black/70' },
          header: { class: '!px-6 !pt-5 !pb-3 border-b border-white/[0.07] bg-black/30 !rounded-none' },
          content: { class: '!p-0 bg-transparent' },
        }"
      >
        <div v-if="renewLoading" class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-2xl text-(--primary)" />
        </div>
        <div v-else-if="renewPlans.length === 0" class="text-center py-12 text-(--text-muted)">
          <i class="pi pi-inbox text-4xl mb-3 block" />
          <p>Tidak ada paket tersedia saat ini.</p>
        </div>
        <div v-else class="flex flex-col gap-3 p-5">
          <div
            v-for="plan in renewPlans"
            :key="String(plan.id)"
            class="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/6 hover:border-(--primary)/40 transition-all cursor-pointer"
            @click="selectRenewPlan(plan)"
          >
            <div class="flex-1 min-w-0">
              <h4 class="text-white font-semibold text-sm">{{ plan.name }}</h4>
              <p class="text-xs text-(--text-muted) mt-0.5">
                {{ formatDuration(plan.duration_in_days) }}
                <span v-if="plan.gym?.name" class="ml-1">· {{ plan.gym.name }}</span>
              </p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-(--primary) font-bold">{{ formatPrice(plan.price) }}</span>
            </div>
          </div>
        </div>
      </Dialog>

      <!-- ── Renew: Step 2 — Signature ─────────────────────────────── -->
      <SignatureVerificationModal
        :visible="showRenewSignature"
        @update:visible="(v) => (showRenewSignature = v)"
        :member-name="member.name"
        :membership-plan="selectedRenewPlan?.name ?? 'Membership'"
        @confirmed="onRenewSignatureConfirmed"
      />

      <!-- ── Renew: Step 3 — Payment Method ──────────────────────── -->
      <Dialog
        :visible="showRenewPayment"
        @update:visible="(v) => (showRenewPayment = v)"
        header="Pilih Metode Pembayaran"
        modal
        :style="{ width: '460px' }"
        :breakpoints="{ '640px': '92vw' }"
        :pt="{
          root: { class: 'rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111114]' },
          mask: { class: 'backdrop-blur-md !bg-black/70' },
          header: { class: '!px-6 !pt-5 !pb-3 border-b border-white/[0.07] bg-black/30 !rounded-none' },
          content: { class: '!p-5 bg-transparent' },
        }"
      >
        <div v-if="selectedRenewPlan" class="space-y-4">
          <!-- Plan summary -->
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p class="text-white font-semibold text-sm">{{ selectedRenewPlan.name }}</p>
              <p class="text-xs text-(--text-muted) mt-0.5">{{ formatDuration(selectedRenewPlan.duration_in_days) }}</p>
            </div>
            <span class="text-(--primary) font-bold text-lg">{{ formatPrice(selectedRenewPlan.price) }}</span>
          </div>

          <!-- Payment buttons -->
          <div class="grid grid-cols-1 gap-3">
            <Button
              label="Virtual Account (Bank Transfer)"
              icon="pi pi-building"
              class="btn w-full justify-center"
              :loading="renewPaymentProcessing"
              @click="processRenewPayment('va')"
            />
            <Button
              label="QRIS"
              icon="pi pi-qrcode"
              class="btn w-full justify-center"
              :loading="renewPaymentProcessing"
              @click="processRenewPayment('qris')"
            />
            <Button
              label="Batal"
              severity="secondary"
              outlined
              class="w-full"
              @click="showRenewPayment = false"
            />
          </div>
        </div>
      </Dialog>

      <Transition name="modal">
        <div
          v-if="showEdit"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showEdit = false" />

          <!-- Modal Panel -->
          <div class="relative z-10 w-full max-w-lg bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                <i class="pi pi-user-edit text-(--primary)" />
                Edit Profile
              </h2>
              <button
                class="text-white/50 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
                @click="showEdit = false"
              >
                <i class="pi pi-times text-xl" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Avatar preview + upload -->
              <div class="flex items-center gap-4">
                <img
                  :src="editMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(editMember.name || 'member')}`"
                  alt="Avatar preview"
                  class="w-16 h-16 rounded-full border-2 border-(--primary) object-cover shrink-0"
                />
                <div class="flex-1">
                  <label class="text-sm text-(--text-muted) mb-1 block">Upload new avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-white/60
                      file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-(--primary)/20 file:text-(--primary)
                      hover:file:bg-(--primary)/30 cursor-pointer"
                    @change="onAvatarChange"
                  />
                  <div v-if="uploadingAvatar" class="text-xs text-(--text-muted) mt-1 flex items-center gap-1">
                    <i class="pi pi-spin pi-spinner text-xs" /> Uploading…
                  </div>
                </div>
              </div>

              <!-- Fields -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Full Name</label>
                  <input v-model="editMember.name" class="input w-full" placeholder="Full name" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Phone</label>
                  <input v-model="editMember.phone" class="input w-full" placeholder="Phone number" />
                </div>
                <div class="sm:col-span-2 space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Email</label>
                  <input
                    v-model="editMember.email"
                    class="input w-full opacity-60 cursor-not-allowed"
                    placeholder="Email address"
                    type="email"
                    disabled
                  />
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/2">
              <button class="btn btn-ghost" :disabled="savingProfile" @click="showEdit = false">
                Cancel
              </button>
              <button class="btn" :disabled="savingProfile" @click="saveProfile">
                <i v-if="savingProfile" class="pi pi-spin pi-spinner mr-2" />
                {{ savingProfile ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: translateY(-12px) scale(0.97);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: translateY(8px) scale(0.97);
  opacity: 0;
}
</style>

