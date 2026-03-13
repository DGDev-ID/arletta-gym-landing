<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { getTrainerMe, getTrainerSchedules, getTrainerClientsAll } from '@/services/trainerService'
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
  location?: string
  type?: string
  clientAvatar?: string
  status?: string
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

// Confirm cancel
const confirmCancel = () => {
  if (selectedSessionForCancel.value) {
    upcomingSessions.value = upcomingSessions.value.filter(
      (s) => s.id !== selectedSessionForCancel.value?.id,
    )
    toast.add({
      severity: 'success',
      summary: 'Schedule Cancelled',
      detail: `${selectedSessionForCancel.value.name} has been cancelled.`,
      life: 3000,
    })
  }
  showCancelModal.value = false
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

// Confirm reschedule
const confirmReschedule = (data: {
  id: number
  newDate: string
  newStartTime: string
  newEndTime: string
  newLocation: string
  reason: string
}) => {
  const session = upcomingSessions.value.find((s) => s.id === data.id)
  if (session) {
    session.date = data.newDate
    session.time = `${data.newStartTime} - ${data.newEndTime}`
    session.location = data.newLocation
    const sessionName =
      session.type === 'pt-session'
        ? `PT Session with ${session.clientName}`
        : (session.className ?? 'Class')
    toast.add({
      severity: 'success',
      summary: 'Jadwal Diubah',
      detail: `${sessionName} telah di-reschedule ke ${data.newDate} ${data.newStartTime} - ${data.newEndTime}.`,
      life: 4000,
    })
  }
  showRescheduleModal.value = false
}

// Add new PT session
const addNewSession = () => {
  if (
    !newSession.value.clientId ||
    !newSession.value.date ||
    !newSession.value.startTime ||
    !newSession.value.endTime
  )
    return

  const member = members.value.find((m) => m.id === newSession.value.clientId)
  if (!member) return

  const newId = Math.max(...upcomingSessions.value.map((s) => s.id)) + 1
  // newSession.date is validated above (not null) - coerce to ISO yyyy-mm-dd
  const dateObj = newSession.value.date! as Date
  const dateStr = String(dateObj.toISOString().split('T')[0])
  const timeStr = `${newSession.value.startTime} - ${newSession.value.endTime}`

  upcomingSessions.value.push({
    id: newId,
    type: 'pt-session',
    clientName: member.name,
    clientAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name.replace(/\s/g, '')}`,
    date: dateStr,
    time: timeStr,
    location: newSession.value.location,
    status: 'confirmed',
    notes: newSession.value.notes,
  })

  toast.add({
    severity: 'success',
    summary: 'PT Session Added',
    detail: `PT session with ${member.name} added on ${dateStr} ${timeStr}.`,
    life: 3000,
  })

  // Reset form and close modal
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
    // get current trainer id
    const trainer = await getTrainerMe()
    const id = (trainer?.id ?? trainer?.trainer_id) as string | number | undefined
    if (!id) return
    // populate members dropdown from server
    try {
      const all = await getTrainerClientsAll()
      members.value = (all || []).map((m: Record<string, unknown>) => ({
        id: Number(m.id ?? m.member_id ?? 0),
        name: String(m.name ?? m.full_name ?? m.fullName ?? 'Unknown'),
        avatar: String(m.avatar ?? m.photo ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(m.name ?? 'member'))}`),
      }))
    } catch (err) {
      console.error('Failed to load members for AddSessionModal', err)
    }

    const list = await getTrainerSchedules(id)

    const mapped = (list || []).map((s: Record<string, unknown>) => {
      const type = (s.type as string) || (s.kind as string) || (s.session_type as string) || 'pt-session'
      const date = String(s.date ?? s.start_date ?? s.session_date ?? '')
      const start = String(s.start_time ?? s.time ?? '')
      const end = String(s.end_time ?? '')
      const time = end ? `${start} - ${end}` : start
      return {
        id: Number(s.id ?? s.schedule_id ?? 0),
        type: type === 'class' || type === 'group' ? 'class' : 'pt-session',
        className: String(s.class_name ?? s.name ?? ''),
        clientName: String(s.client_name ?? s.client ?? s.full_name ?? ''),
        clientAvatar: String(s.client_avatar ?? s.avatar ?? s.photo ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(s.client_name ?? 'client'))}`),
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
      <PTStatsSection
        :total-sessions-this-week="weekSessions"
        :upcoming-count="upcomingSessions.length"
        :completed-this-month="completedThisMonth"
        :total-clients="totalClients"
      />

      <!-- Tab Navigation -->
      <TabNavigation :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

      <!-- Tab Content -->
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
