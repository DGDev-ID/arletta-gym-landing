<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import authService from '@/services/authService'
import { uploadFile } from '@/services/uploadService'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'

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
          <!-- Profile Card -->
          <ProfileCard :member="member" @edit="openEdit" />

          <!-- Membership Status -->
          <MembershipCard :member="member" :membership-status="membershipStatus" />

          <!-- Upcoming Classes -->
          <ScheduleCard :upcoming-classes="upcomingClasses" />
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
                <div class="sm:col-span-2 space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Avatar URL</label>
                  <input v-model="editMember.avatar" class="input w-full" placeholder="https://…" />
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

