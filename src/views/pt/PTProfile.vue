<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import authService from '@/services/authService'
import { uploadFile } from '@/services/uploadService'
import PTProfileCard from '@/components/pt/profile/PTProfileCard.vue'
import TodayScheduleCard from '@/components/pt/profile/TodayScheduleCard.vue'
import ClientsCard from '@/components/pt/profile/ClientsCard.vue'
import { getTrainerMe } from '@/services/trainerService'

// Trainer data (fetched from API) — starts empty, filled by onMounted
const trainer = ref<Record<string, unknown> | null>(null)
const trainerLoading = ref(true)
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
    // Merge API response back into trainer, keeping avatar from editTrainer if not returned
    trainer.value = {
      ...trainer.value,
      name:   String(tRec.name         ?? editTrainer.value.name   ?? ''),
      email:  String(tRec.email        ?? editTrainer.value.email  ?? ''),
      phone:  String(tRec.phone_number ?? tRec.phone ?? editTrainer.value.phone ?? ''),
      avatar: String(tRec.photo_url    ?? tRec.avatar ?? editTrainer.value.avatar ?? ''),
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
    trainerLoading.value = true
    const data = await getTrainerMe()
    // API: GET /trainers/me → { trainer, todaySchedule, recentClients }
    const t = (data ?? {}) as Record<string, unknown>
    const raw = (t['trainer'] as Record<string, unknown> | null) ?? {}

    // Normalise the trainer object — BE sends phone_number, photo_url, etc.
    trainer.value = {
      name:               String(raw['name']               ?? ''),
      email:              String(raw['email']              ?? ''),
      phone:              String(raw['phone']              ?? raw['phone_number'] ?? ''),
      specialty:          String(raw['specialty']          ?? ''),
      avatar:             String(raw['avatar']             ?? raw['photo_url']   ?? ''),
      rating:             Number(raw['rating']             ?? 0),
      totalClients:       Number(raw['totalClients']       ?? raw['total_clients']      ?? 0),
      completedSessions:  Number(raw['completedSessions']  ?? raw['completed_sessions'] ?? 0),
      joinedAt:           String(raw['joinedAt']           ?? raw['joined_at']   ?? ''),
      memberId:           String(raw['memberId']           ?? raw['member_id']   ?? ''),
    }

    const todayRaw = t['todaySchedule'] ?? t['today_schedule'] ?? t['today'] ?? []
    if (Array.isArray(todayRaw)) {
      todaySchedule.value = (todayRaw as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => ({
        id: Number(s.id ?? s.schedule_id ?? 0),
        clientName: String(s.client_name ?? s.client ?? s.clientName ?? ''),
        time: String(s.time ?? (s.start_time ? `${s.start_time}${s.end_time ? ' - ' + s.end_time : ''}` : '')),
        name: String(s.name ?? s.class_name ?? s.title ?? ''),
        status: String(s.status ?? s.state ?? 'scheduled'),
        type: String(s.type ?? s.session_type ?? 'pt-session'),
        date: String(s.date ?? s.start_date ?? s.session_date ?? ''),
        location: String(s.location ?? s.room ?? s.venue ?? ''),
        clientAvatar: String(s.client_avatar ?? s.avatar ?? s.photo ?? ''),
      } as SessionItem))
    }

    const clientsRaw = t['recentClients'] ?? t['recent_clients'] ?? t['clients'] ?? []
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
  } finally {
    trainerLoading.value = false
  }
})

const trainerCardData = computed(() => {
  const t = trainer.value as Record<string, unknown> | null
  const get = (key: string) => (t ? (t[key] ?? '') : '') as unknown

  return {
    name:              String(get('name')),
    email:             String(get('email')),
    phone:             String(get('phone')),
    specialty:         String(get('specialty')),
    avatar:            String(get('avatar') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(get('name') || 'pt'))}`),
    rating:            Number(get('rating')  || 0),
    totalClients:      Number(get('totalClients')      || 0),
    completedSessions: Number(get('completedSessions') || 0),
  }
})

const todaySchedule = ref<SessionItem[]>([])
const recentClients = ref<RecentClientItem[]>([])
</script>

<template>
  <div>
    <!-- Page -->
    <div class="pt-24 pb-12">
      <div class="container-custom">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="heading-md text-white mb-2">Trainer Dashboard</h1>
          <p class="text-(--text-secondary)">Manage your clients and schedule</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Profile Card skeleton while loading -->
          <template v-if="trainerLoading">
            <div class="glass-card rounded-2xl p-6 flex flex-col items-center gap-4 animate-pulse">
              <div class="w-24 h-24 rounded-full bg-white/10" />
              <div class="h-4 w-32 rounded bg-white/10" />
              <div class="h-3 w-24 rounded bg-white/10" />
              <div class="w-full h-16 rounded bg-white/10" />
            </div>
          </template>
          <template v-else>
            <PTProfileCard :trainer="trainerCardData" @edit="openEdit" />
          </template>

          <!-- Today's Schedule -->
          <TodayScheduleCard :today-schedule="todaySchedule" />

          <!-- My Clients -->
          <ClientsCard :recent-clients="recentClients" />
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
                  :src="String(editTrainer.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=pt')"
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
                  <input v-model="editTrainer.name" class="input w-full" placeholder="Full name" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Phone</label>
                  <input v-model="editTrainer.phone" class="input w-full" placeholder="Phone number" />
                </div>
                <div class="sm:col-span-2 space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Email</label>
                  <input
                    v-model="editTrainer.email"
                    class="input w-full opacity-60 cursor-not-allowed"
                    placeholder="Email address"
                    type="email"
                    disabled
                  />
                </div>
                <div class="sm:col-span-2 space-y-1">
                  <label class="text-xs text-(--text-muted) font-medium uppercase tracking-wide">Avatar URL</label>
                  <input v-model="editTrainer.avatar" class="input w-full" placeholder="https://…" />
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
/* Modal enter/leave transitions */
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
