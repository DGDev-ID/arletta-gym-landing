<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import CancelConfirmModal from '@/components/booking/CancelConfirmModal.vue'
import PTStatsSection from '@/components/pt/schedule/PTStatsSection.vue'
import TabNavigation from '@/components/member/schedule/TabNavigation.vue'
import PTUpcomingTab from '@/components/pt/schedule/PTUpcomingTab.vue'
import PTHistoryTab from '@/components/pt/schedule/PTHistoryTab.vue'
import AddSessionModal from '@/components/pt/schedule/AddSessionModal.vue'

const toast = useToast()

// Active tab
const activeTab = ref('upcoming')

// Modal states
const showAddSessionModal = ref(false)
const showCancelModal = ref(false)
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

// Members list (mock) - pulled from membership registry in real app
const members = ref([
  { id: 1, name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: 2, name: 'Sarah Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 3, name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeJ' },
  { id: 4, name: 'Emily Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
  { id: 5, name: 'David Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
])

// New session form
const newSession = ref({
  clientId: null as number | null,
  date: null as Date | null,
  startTime: '',
  endTime: '',
  location: 'Weight Room',
  notes: '',
})

// Mock upcoming sessions for trainer
const upcomingSessions = ref([
  {
    id: 1,
    type: 'pt-session',
    clientName: 'John Doe',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    date: '2026-01-28',
    time: '09:00 - 10:00',
    location: 'Weight Room',
    status: 'confirmed',
    notes: 'Focus on lower body strength',
  },
  {
    id: 2,
    type: 'class',
    className: 'HIIT Burn',
    date: '2026-01-28',
    time: '11:00 - 11:45',
    location: 'Studio A',
    status: 'confirmed',
    participants: 18,
    maxParticipants: 20,
  },
  {
    id: 3,
    type: 'pt-session',
    clientName: 'Sarah Smith',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: '2026-01-28',
    time: '14:00 - 15:00',
    location: 'Private Studio',
    status: 'confirmed',
    notes: 'Post-injury rehabilitation',
  },
  {
    id: 4,
    type: 'class',
    className: 'Core Strength',
    date: '2026-01-29',
    time: '10:00 - 10:45',
    location: 'Studio B',
    status: 'confirmed',
    participants: 12,
    maxParticipants: 15,
  },
  {
    id: 5,
    type: 'pt-session',
    clientName: 'Mike Johnson',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeJ',
    date: '2026-01-29',
    time: '16:00 - 17:00',
    location: 'Weight Room',
    status: 'confirmed',
    notes: 'Initial assessment session',
  },
  {
    id: 6,
    type: 'pt-session',
    clientName: 'Emily Brown',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    date: '2026-01-30',
    time: '09:00 - 10:00',
    location: 'Private Studio',
    status: 'confirmed',
    notes: 'Weight loss program - week 4',
  },
])

// Session history
const sessionHistory = ref([
  {
    id: 101,
    type: 'pt-session',
    clientName: 'John Doe',
    date: '2026-01-25',
    time: '09:00 - 10:00',
    status: 'completed',
    rating: 5,
  },
  {
    id: 102,
    type: 'class',
    className: 'HIIT Burn',
    date: '2026-01-25',
    time: '11:00 - 11:45',
    status: 'completed',
    participants: 20,
  },
  {
    id: 103,
    type: 'pt-session',
    clientName: 'Sarah Smith',
    date: '2026-01-24',
    time: '14:00 - 15:00',
    status: 'completed',
    rating: 5,
  },
  {
    id: 104,
    type: 'pt-session',
    clientName: 'Mike Johnson',
    date: '2026-01-23',
    time: '10:00 - 11:00',
    status: 'cancelled',
  },
])

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
const todaySessions = computed(() => {
  // In real app, compare with actual today's date
  return upcomingSessions.value.filter((s) => s.date === '2026-01-28').length
})

const weekSessions = computed(() => upcomingSessions.value.length)

const totalClients = computed(() => {
  const clientSessions = upcomingSessions.value.filter((s) => s.type === 'pt-session')
  const uniqueClients = new Set(clientSessions.map((s) => s.clientName))
  return uniqueClients.size
})

const classesThisWeek = computed(() => {
  return upcomingSessions.value.filter((s) => s.type === 'class').length
})

const completedThisMonth = computed(() => {
  return sessionHistory.value.filter((s) => s.status === 'completed').length
})

const tabs = [
  { key: 'upcoming', label: 'Upcoming', icon: 'pi-calendar' },
  { key: 'history', label: 'History', icon: 'pi-history' },
]
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
      />

      <PTHistoryTab v-show="activeTab === 'history'" :session-history="sessionHistory" />
    </div>

    <!-- Add PT Session Modal -->
    <AddSessionModal
      v-model:visible="showAddSessionModal"
      v-model:new-session="newSession"
      :members="members"
      @add="addNewSession"
    />

    <!-- Cancel Confirm Modal -->
    <CancelConfirmModal
      v-model:visible="showCancelModal"
      :booking-info="selectedSessionForCancel"
      user-role="pt"
      @confirm="confirmCancel"
    />
  </div>
</template>
