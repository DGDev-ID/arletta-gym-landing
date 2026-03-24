<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import authService from '@/services/authService'
import { uploadFile } from '@/services/uploadService'

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
      membershipStatus.value = {
        status: membership.is_active ? 'Active' : 'Inactive',
        expiresAt: membership.membership_end_at ?? '',
        daysRemaining: 0,
        startDate: '',
        duration: '',
      }
      member.value.membershipType = membership.gym_name ?? ''
    }

    upcomingClasses.value = Array.isArray(upcoming) ? upcoming : []
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
  <div class="pt-24 pb-12">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="heading-md text-white mb-2">My Profile</h1>
        <p class="text-(--text-secondary)">Manage your account and view your fitness journey</p>
        <div class="mt-3">
          <button class="btn btn-secondary" @click="openEdit">Edit Profile</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <ProfileCard :member="member" />

        <!-- Membership Status -->
        <MembershipCard :member="member" :membership-status="membershipStatus" />

        <!-- Upcoming Classes -->
        <ScheduleCard :upcoming-classes="upcomingClasses" />
      </div>
      
      <div class="mt-8">
        <div v-if="showEdit" class="mb-6 max-w-xl bg-white/5 p-4 rounded-lg">
          <h3 class="text-white font-semibold mb-2">Edit Profile</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input v-model="editMember.name" class="input" placeholder="Full name" />
            <input v-model="editMember.email" class="input" placeholder="Email" />
            <input v-model="editMember.phone" class="input" placeholder="Phone" />
            <input v-model="editMember.avatar" class="input" placeholder="Avatar URL" />
            <div class="col-span-2">
              <label class="text-sm text-(--text-muted) mb-1 inline-block">Upload avatar</label>
              <input type="file" accept="image/*" @change="onAvatarChange" class="input mt-1" />
              <div v-if="uploadingAvatar" class="text-xs text-(--text-muted) mt-1">Uploading...</div>
            </div>
          </div>
          <div class="mt-3 flex gap-3">
            <button class="btn" :disabled="savingProfile" @click="saveProfile">Save</button>
            <button class="btn btn-ghost" @click="showEdit = false">Cancel</button>
          </div>
        </div>
        <h2 class="text-white font-bold mb-3">Emergency Contact</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
          <input v-model="emergency_name" placeholder="Contact name" class="input" />
          <input v-model="emergency_phone" placeholder="Phone" class="input" />
          <input v-model="emergency_relation" placeholder="Relation" class="input" />
        </div>
        <div class="mt-3">
          <button class="btn" :disabled="submittingEmergency" @click="submitEmergency">Save Emergency Contact</button>
        </div>
      </div>
    </div>
  </div>
</template>
