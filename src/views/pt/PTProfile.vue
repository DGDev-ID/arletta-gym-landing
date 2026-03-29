<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import authService from '@/services/authService'
import { uploadFile } from '@/services/uploadService'
import PTProfileCard from '@/components/pt/profile/PTProfileCard.vue'
import TodayScheduleCard from '@/components/pt/profile/TodayScheduleCard.vue'
import ClientsCard from '@/components/pt/profile/ClientsCard.vue'
import { getTrainerMe } from '@/services/trainerService'

// Trainer data (fetched from API)
const trainer = ref<Record<string, unknown> | null>({
  name: 'Alex Johnson',
  email: 'alex@arlettagym.com',
  phone: '+62 812 9876 5432',
  joinedAt: '2023-06-01',
  specialty: 'Strength & Conditioning',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  rating: 4.9,
  totalClients: 48,
  completedSessions: 520,
  memberId: 'MBR-2023-00012',
  membershipType: 'Premium',
})
const toast = useToast()

// Typed shapes for schedule and clients used in the profile cards
interface SessionItem {
  id: number
  clientName: string
  time: string
  name: string
  status: string
  type: string
  date: string
  location: string
  clientAvatar?: string
}

interface RecentClientItem {
  name: string
  sessions: number
  progress: number
  avatar: string
}

// Edit profile state for trainers
const showEdit = ref(false)
const editTrainer = ref({ ...trainer.value })
const savingProfile = ref(false)
const uploadingAvatar = ref(false)

const openEdit = () => {
  editTrainer.value = { ...trainer.value }
  showEdit.value = true
}

const saveProfile = async () => {
  savingProfile.value = true
  try {
    const payload = {
      name: editTrainer.value.name,
      phone_number: editTrainer.value.phone,
    }
    const updated = await authService.updateUserMe(payload)
    const tRec = ((updated && (updated.user as Record<string, unknown>)) || (updated as Record<string, unknown>)) as Record<string, unknown>
    trainer.value = {
      ...trainer.value,
      name: String(tRec.name ?? editTrainer.value.name ?? ''),
      email: String(tRec.email ?? editTrainer.value.email ?? ''),
      phone: String(tRec.phone_number ?? tRec.phone ?? editTrainer.value.phone ?? ''),
      avatar: String(tRec.avatar ?? editTrainer.value.avatar ?? ''),
    }
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Profile updated.', life: 3000 })
    showEdit.value = false
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Failed', detail: msg, life: 6000 })
  } finally {
    savingProfile.value = false
  }
}

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
      editTrainer.value.avatar = url
      toast.add({ severity: 'success', summary: 'Uploaded', detail: 'Avatar uploaded.', life: 2500 })
    } else {
      toast.add({ severity: 'warn', summary: 'Upload', detail: 'Upload succeeded but no URL returned.', life: 4000 })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Upload failed', detail: msg, life: 6000 })
  } finally {
    uploadingAvatar.value = false
    if (input) input.value = ''
  }
}

onMounted(async () => {
  try {
    const data = await getTrainerMe()
    // API returns { trainer: {...}, recentClients: [...], todaySchedule: [...] }
    const t = (data ?? {}) as Record<string, unknown>
    trainer.value = (t['trainer'] as Record<string, unknown> | null) ?? trainer.value

    const todayRaw = t['today_schedule'] ?? t['todaySchedule'] ?? t['today'] ?? t['todaySchedules'] ?? []
    if (Array.isArray(todayRaw)) {
      todaySchedule.value = (todayRaw as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => ({
        id: Number(s.id ?? s.schedule_id ?? 0),
        clientName: String(s.client_name ?? s.client ?? s.full_name ?? s.clientName ?? ''),
        time: String((s['time'] as string) ?? (s['start_time'] as string) ? `${(s['start_time'] as string) ?? ''}${(s['end_time'] as string) ? ' - ' + (s['end_time'] as string) : ''}` : (s['time'] as string) ?? ''),
        name: String(s.name ?? s.class_name ?? s.title ?? ''),
        status: String(s.status ?? s.state ?? 'confirmed'),
        type: String((s.type ?? s.session_type ?? 'pt-session')),
        date: String(s.date ?? s.start_date ?? s.session_date ?? ''),
        location: String(s.location ?? s.room ?? s.venue ?? ''),
        clientAvatar: String(s.client_avatar ?? s.avatar ?? s.photo ?? ''),
      } as SessionItem))
    }

    const clientsRaw = t['recent_clients'] ?? t['recentClients'] ?? t['clients'] ?? []
    if (Array.isArray(clientsRaw)) {
      recentClients.value = (clientsRaw as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => ({
        name: String(c.name ?? c.full_name ?? c.client_name ?? ''),
        sessions: Number(c.sessions ?? c.total_sessions ?? c.sessions_count ?? 0),
        progress: Number(c.progress ?? c.completion ?? 0),
        avatar: String(c.avatar ?? c.photo ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(c.name ?? 'client'))}`),
      } as RecentClientItem))
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Failed to load trainer', detail: msg, life: 4000 })
  }
})

const trainerCardData = computed(() => {
  const t = trainer.value as Record<string, unknown> | null
  const get = (key: string) => (t && (t[key] ?? '')) as unknown

  return {
    name: String(get('name')),
    email: String(get('email')),
    phone: String(get('phone')),
    specialty: String(get('specialty')),
    avatar: String(get('avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=pt'),
    rating: Number(get('rating') || 0),
    totalClients: Number(get('totalClients') ?? get('clients') ?? 0),
    completedSessions: Number(get('completedSessions') ?? get('sessions_completed') ?? 0),
  }
})

const todaySchedule = ref<SessionItem[]>([])
const recentClients = ref<RecentClientItem[]>([])
</script>

<template>
  <div class="pt-24 pb-12">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="heading-md text-white mb-2">Trainer Dashboard</h1>
        <p class="text-(--text-secondary)">Manage your clients and schedule</p>
        <div class="mt-3">
          <button class="btn btn-secondary" @click="openEdit">Edit Profile</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Card -->
  <PTProfileCard :trainer="trainerCardData" />

        <!-- Today's Schedule -->
        <TodayScheduleCard :today-schedule="todaySchedule" />

        <!-- My Clients (spans remaining space) -->
        <ClientsCard :recent-clients="recentClients" />
      </div>
      
      <div class="mt-8">
        <div v-if="showEdit" class="mb-6 max-w-xl bg-white/5 p-4 rounded-lg">
          <h3 class="text-white font-semibold mb-2">Edit Profile</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input v-model="editTrainer.name" class="input" placeholder="Full name" />
            <input v-model="editTrainer.email" class="input" placeholder="Email" />
            <input v-model="editTrainer.phone" class="input" placeholder="Phone" />
            <input v-model="editTrainer.avatar" class="input" placeholder="Avatar URL" />
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
      </div>
    </div>
  </div>
</template>
