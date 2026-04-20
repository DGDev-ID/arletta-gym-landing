<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'
import authState from '@/stores/auth'
import {
  getTrainerMe,
  getTrainerSchedules,
  getTrainerClients,
  createSession,
  updateSession,
  cancelSession,
} from '@/services/trainerService'
import CancelConfirmModal from '@/components/booking/CancelConfirmModal.vue'
import PTStatsSection from '@/components/pt/schedule/PTStatsSection.vue'
import TabNavigation from '@/components/member/schedule/TabNavigation.vue'
import PTUpcomingTab from '@/components/pt/schedule/PTUpcomingTab.vue'
import PTHistoryTab from '@/components/pt/schedule/PTHistoryTab.vue'
import AddSessionModal from '@/components/pt/schedule/AddSessionModal.vue'
import RescheduleModal from '@/components/pt/schedule/RescheduleModal.vue'

const toast = useToast()

interface PTSession {
  id: number
  clientName?: string
  className?: string
  date: string
  time: string
  location: string
  type: string
  clientAvatar?: string
  status: string
  participants?: number
  maxParticipants?: number
  notes?: string
  rating?: number
}

// Active tab
const activeTab = ref('upcoming')

// Modal states
const showAddSessionModal = ref(false)
const showCancelModal = ref(false)
const showRescheduleModal = ref(false)
const selectedSessionForReschedule = ref<{
  id: number
  clientName?: string
  className?: string
  date: string
  time: string
  location: string
  type: string
} | null>(null)
const selectedSessionForCancel = ref<{
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  type: 'class' | 'pt-session' | 'waitlist'
  canCancel: boolean
} | null>(null)

// Members dropdown (populated from API)
const members = ref<Array<{ id: number; name: string; avatar: string }>>([])

// New session form
const newSession = ref({
  clientId: null as number | null,
  date: null as Date | null,
  startTime: '',
  endTime: '',
  location: 'Weight Room',
  notes: '',
})

// Upcoming sessions for trainer (fetched from API)
const upcomingSessions = ref<PTSession[]>([])
const upcomingLoading = ref(false)

// Session history (fetched from API)
const sessionHistory = ref<PTSession[]>([])
const historyLoading = ref(false)

// Note: sessions are created as 'confirmed' by default. The previous "pending" flow
// (confirm button) has been removed — trainers create confirmed sessions directly.

// Open cancel modal
const openCancelModal = (session: {
  id: number
  clientName?: string
  className?: string
  date: string
  time: string
  location: string
  type: string
}) => {
  selectedSessionForCancel.value = {
    id: session.id,
    name:
      session.type === 'pt-session'
        ? `PT Session with ${session.clientName}`
        : (session.className ?? 'Class'),
    trainer: 'You',
    date: session.date,
    time: session.time,
    location: session.location,
    type: session.type === 'pt-session' ? 'pt-session' : 'class',
    canCancel: true, // PT can always cancel their own sessions
  }
  showCancelModal.value = true
}

// Trainer id (set in onMounted after getTrainerMe)
const currentTrainerId = ref<number | string | null>(null)

// Helper: reload trainer schedules from API and split into upcoming / history
const reloadSchedules = async () => {
  if (!currentTrainerId.value) return
  const list = await getTrainerSchedules(currentTrainerId.value)
  const mapped = (list || []).map((s: Record<string, unknown>) => {
    const type =
      (s.type as string) || (s.kind as string) || (s.session_type as string) || 'pt-session'
    const date = String(s.date ?? s.start_date ?? s.session_date ?? '')
    const start = String(s.start_time ?? s.time ?? '')
    const end = String(s.end_time ?? '')
    const time = end ? `${start} - ${end}` : start
    return {
      id: Number(s.id ?? s.schedule_id ?? 0),
      type: type === 'class' || type === 'group' ? 'class' : 'pt-session',
      className: String(s.class_name ?? s.name ?? ''),
      clientName: String(s.client_name ?? s.client ?? s.full_name ?? ''),
      clientAvatar: String(
        s.client_avatar ??
          s.avatar ??
          s.photo ??
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(s.client_name ?? 'client'))}`,
      ),
      date,
      time,
      location: String(s.location ?? s.room ?? s.venue ?? ''),
      status: String(s.status ?? s.state ?? 'confirmed'),
      participants: Number(s.participants ?? s.attendees ?? 0),
      maxParticipants: Number(s.max_participants ?? s.capacity ?? 0),
      notes: String(s.notes ?? s.note ?? ''),
      rating: Number(s.rating ?? 0),
    }
  })
  upcomingSessions.value = mapped.filter((m) => !['completed', 'cancelled'].includes(m.status))
  sessionHistory.value = mapped.filter((m) => ['completed', 'cancelled'].includes(m.status))
}

// Confirm cancel — call API then refresh
const confirmCancel = async () => {
  if (!selectedSessionForCancel.value) {
    showCancelModal.value = false
    return
  }
  const sessionName = selectedSessionForCancel.value.name
  try {
    await cancelSession(selectedSessionForCancel.value.id, { reason: '' })
    await reloadSchedules()
    toast.add({
      severity: 'success',
      summary: 'Schedule Cancelled',
      detail: `${sessionName} has been cancelled.`,
      life: 3000,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Cancel failed', detail: msg, life: 5000 })
  } finally {
    showCancelModal.value = false
  }
}

// Open reschedule modal
const openRescheduleModal = (session: {
  id: number
  clientName?: string
  className?: string
  date: string
  time: string
  location: string
  type: string
}) => {
  selectedSessionForReschedule.value = session
  showRescheduleModal.value = true
}

// Confirm reschedule — call API then refresh
const confirmReschedule = async (data: {
  id: number
  newDate: string
  newStartTime: string
  newEndTime: string
  newLocation: string
  reason: string
}) => {
  try {
    await updateSession(data.id, {
      date: data.newDate,
      start_time: data.newStartTime,
      end_time: data.newEndTime,
      location: data.newLocation,
    })
    await reloadSchedules()
    toast.add({
      severity: 'success',
      summary: 'Jadwal Diubah',
      detail: `Session telah di-reschedule ke ${data.newDate} ${data.newStartTime} - ${data.newEndTime}.`,
      life: 4000,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Reschedule failed', detail: msg, life: 5000 })
  } finally {
    showRescheduleModal.value = false
  }
}

// Add new PT session — call API then refresh
const addNewSession = async () => {
  if (
    !newSession.value.clientId ||
    !newSession.value.date ||
    !newSession.value.startTime ||
    !newSession.value.endTime ||
    !currentTrainerId.value
  )
    return

  const member = members.value.find((m) => m.id === newSession.value.clientId)
  if (!member) return

  const dateObj = newSession.value.date as Date
  const dateStr = String(dateObj.toISOString().split('T')[0])

  try {
    await createSession(currentTrainerId.value, {
      client_id: member.id,
      date: dateStr,
      start_time: newSession.value.startTime,
      end_time: newSession.value.endTime,
      location: newSession.value.location,
      notes: newSession.value.notes,
    })
    await reloadSchedules()
    toast.add({
      severity: 'success',
      summary: 'PT Session Added',
      detail: `PT session with ${member.name} added on ${dateStr} ${newSession.value.startTime} - ${newSession.value.endTime}.`,
      life: 3000,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Failed to add session', detail: msg, life: 5000 })
  } finally {
    // Reset form and close modal regardless of success/failure
    newSession.value = {
      clientId: null,
      date: null,
      startTime: '',
      endTime: '',
      location: 'Weight Room',
      notes: '',
    }
    showAddSessionModal.value = false
  }
}

// Stats
const weekSessions = computed(() => upcomingSessions.value.length)

const totalClients = computed(() => {
  const clientSessions = upcomingSessions.value.filter((s) => s.type === 'pt-session')
  const uniqueClients = new Set(clientSessions.map((s) => s.clientName))
  return uniqueClients.size
})

const completedThisMonth = computed(() => {
  return sessionHistory.value.filter((s) => s.status === 'completed').length
})

const tabs = [
  { key: 'upcoming', label: 'Upcoming', icon: 'pi-calendar' },
  { key: 'history', label: 'History', icon: 'pi-history' },
]

// Fetch trainer schedules and map into upcoming/history lists
onMounted(async () => {
  try {
    upcomingLoading.value = true
    historyLoading.value = true
    // get current trainer id and store it
    const trainerData = (await getTrainerMe()) as unknown as Record<string, unknown>
    const trainerObj = (trainerData?.['trainer'] ?? trainerData) as Record<string, unknown>
    const id = (trainerObj?.['id'] ?? trainerData?.['id'] ?? authState.user?.id) as
      | string
      | number
      | undefined
    if (!id) return
    currentTrainerId.value = id
    // populate members dropdown from trainer's own clients
    try {
      const all = await getTrainerClients(id)
      members.value = (all || []).map((m: Record<string, unknown>) => ({
        id: Number(m.id ?? m.member_id ?? m.client_id ?? 0),
        name: String(m.name ?? m.full_name ?? m.fullName ?? 'Unknown'),
        avatar: String(
          m.avatar ??
            m.photo ??
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(m.name ?? 'member'))}`,
        ),
      }))
    } catch (err) {
      console.error('Failed to load clients for AddSessionModal', err)
    }
    // load schedules using shared helper
    await reloadSchedules()
  } catch (err) {
    console.error('Failed to load trainer schedules', err)
  } finally {
    upcomingLoading.value = false
    historyLoading.value = false
  }
})
</script>

<template>
  <div class="pt-24 pb-12 min-h-screen">
    <div class="container-custom">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="heading-md text-white mb-2">My Schedule</h1>
          <p class="text-(--text-secondary)">Manage your training sessions and classes</p>
        </div>
        <Button
          label="Add PT Session"
          icon="pi pi-plus"
          class="btn mt-4 md:mt-0"
          @click="showAddSessionModal = true"
        />
      </div>

      <!-- Stats Cards -->
      <template v-if="upcomingLoading">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div v-for="i in 4" :key="i" class="glass-card rounded-xl p-4 space-y-2">
            <Skeleton width="40%" height="0.75rem" />
            <Skeleton width="60%" height="1.75rem" />
          </div>
        </div>
      </template>
      <PTStatsSection
        v-else
        :total-sessions-this-week="weekSessions"
        :upcoming-count="upcomingSessions.length"
        :completed-this-month="completedThisMonth"
        :total-clients="totalClients"
      />

      <!-- Tab Navigation -->
      <TabNavigation :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

      <!-- Tab Content -->
      <!-- Skeleton when loading -->
      <div v-if="upcomingLoading || historyLoading" class="space-y-4 mt-6">
        <div v-for="i in 4" :key="i" class="glass-card rounded-xl p-4 flex items-center gap-4">
          <Skeleton shape="circle" size="2.75rem" />
          <div class="flex-1 space-y-2">
            <Skeleton width="45%" height="1rem" />
            <Skeleton width="30%" height="0.75rem" />
          </div>
          <Skeleton width="5rem" height="1.5rem" borderRadius="9999px" />
          <Skeleton width="5rem" height="2rem" borderRadius="8px" />
        </div>
      </div>

      <PTUpcomingTab
        v-show="activeTab === 'upcoming'"
        :sessions="upcomingSessions"
        @cancel="openCancelModal"
        @reschedule="openRescheduleModal"
      />

      <PTHistoryTab v-show="activeTab === 'history'" :session-history="sessionHistory" />
    </div>

    <!-- Add PT Session Modal -->
    <AddSessionModal
      :visible="showAddSessionModal"
      @update:visible="(v) => (showAddSessionModal = v)"
      :new-session="newSession"
      @update:new-session="(v) => (newSession = v)"
      :members="members"
      @add="addNewSession"
    />

    <!-- Cancel Confirm Modal -->
    <CancelConfirmModal
      :visible="showCancelModal"
      @update:visible="(v) => (showCancelModal = v)"
      :booking-info="selectedSessionForCancel"
      user-role="pt"
      @confirm="confirmCancel"
    />

    <!-- Reschedule Modal -->
    <RescheduleModal
      :visible="showRescheduleModal"
      @update:visible="(v) => (showRescheduleModal = v)"
      :session="selectedSessionForReschedule"
      @confirm="confirmReschedule"
    />
  </div>
</template>
