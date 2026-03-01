<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import BookingConfirmModal from '@/components/booking/BookingConfirmModal.vue'
import CancelConfirmModal from '@/components/booking/CancelConfirmModal.vue'
import OnlineClassModal from '@/components/booking/OnlineClassModal.vue'
import StatsSection from '@/components/member/schedule/StatsSection.vue'
import TabNavigation from '@/components/member/schedule/TabNavigation.vue'
import UpcomingTab from '@/components/member/schedule/UpcomingTab.vue'
import WaitlistTab from '@/components/member/schedule/WaitlistTab.vue'
import BookTab from '@/components/member/schedule/BookTab.vue'
import HistoryTab from '@/components/member/schedule/HistoryTab.vue'
import {
  upcomingClasses as storeUpcomingClasses,
  upcomingWaitingList,
  hasTimeConflict,
  bookClass as storeBookClass,
  cancelBooking,
  confirmPTSession,
  canCancelClass,
  cancelPTSession,
  type AvailableClass,
} from '@/stores/booking'

const router = useRouter()
const toast = useToast()

// Active tab
const activeTab = ref('upcoming')

// Modal states
const showBookingModal = ref(false)
const showCancelModal = ref(false)
const showOnlineClassModal = ref(false)
const selectedClassForBooking = ref<{
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  spotsLeft?: number
  isFull?: boolean
  trainerAvatar?: string
  totalSpots?: number
  zoomLink?: string
} | null>(null)
const selectedBookingForCancel = ref<{
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  type: 'class' | 'pt-session' | 'waitlist'
  canCancel: boolean
} | null>(null)
const bookingHasConflict = ref(false)

// Computed classes from store
const upcomingClasses = computed(() => storeUpcomingClasses.value)

// Waiting list classes
const waitingListClasses = computed(() => upcomingWaitingList.value)

// Past sessions history
const sessionHistory = ref([
  {
    id: 101,
    name: 'HIIT Burn',
    trainer: 'Sarah Johnson',
    date: '2026-01-25',
    time: '09:00 - 09:45',
    type: 'class',
    status: 'attended',
  },
  {
    id: 102,
    name: 'Personal Training',
    trainer: 'Mike Torres',
    date: '2026-01-24',
    time: '14:00 - 15:00',
    type: 'pt-session',
    status: 'attended',
  },
  {
    id: 103,
    name: 'Boxing Fundamentals',
    trainer: 'Carlos Rodriguez',
    date: '2026-01-22',
    time: '17:00 - 18:00',
    type: 'class',
    status: 'missed',
  },
  {
    id: 104,
    name: 'Power Yoga',
    trainer: 'Maya Chen',
    date: '2026-01-20',
    time: '18:00 - 19:00',
    type: 'class',
    status: 'attended',
  },
])

// Available classes to book
const todayStr = new Date().toISOString().split('T')[0]

// Available classes to book
const availableClasses = ref<AvailableClass[]>([
  {
    id: 201,
    name: 'Spin Cycle',
    trainer: 'David Kim',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    date: '2026-01-28',
    time: '06:00 - 06:45',
    location: 'Cycling Studio',
    spotsLeft: 8,
    totalSpots: 20,
  },
  {
    id: 202,
    name: 'Core Crusher',
    trainer: 'Lisa Park',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    date: '2026-01-28',
    time: '12:00 - 12:30',
    location: 'Studio A',
    spotsLeft: 3,
    totalSpots: 15,
  },
  {
    id: 203,
    name: 'Boxing Fundamentals',
    trainer: 'Carlos Rodriguez',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    date: '2026-01-29',
    time: '17:00 - 18:00',
    location: 'Boxing Ring',
    spotsLeft: 12,
    totalSpots: 16,
  },
  {
    id: 204,
    name: 'Pilates Core',
    trainer: 'Emma Wilson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    date: '2026-01-28',
    time: '09:00 - 09:45',
    location: 'Studio C',
    spotsLeft: 0,
    totalSpots: 12,
  },
  // Sample: class that already started with Zoom link available
  {
    id: 205,
    name: 'Morning Stretch (Live)',
    trainer: 'Sandy Wibowo',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sandy',
    date: todayStr as string,
    time: '08:00 - 08:45',
    location: 'Studio D / Zoom',
    spotsLeft: 0,
    totalSpots: 20,
    zoomLink: 'https://zoom.us/j/1234567890',
  },
])

// Open booking confirmation modal
const openBookingModal = (classItem: AvailableClass) => {
  selectedClassForBooking.value = {
    id: classItem.id,
    name: classItem.name,
    trainer: classItem.trainer,
    date: classItem.date,
    time: classItem.time,
    location: classItem.location,
    spotsLeft: classItem.spotsLeft,
    isFull: classItem.spotsLeft === 0,
    trainerAvatar: classItem.trainerAvatar,
    totalSpots: classItem.totalSpots,
  }

  // If class is full, show online class option modal instead
  if (classItem.spotsLeft === 0) {
    // preserve optional zoom link when showing online modal
    selectedClassForBooking.value = {
      ...selectedClassForBooking.value!,
      zoomLink: (classItem as unknown as { zoomLink?: string }).zoomLink,
    }
    showOnlineClassModal.value = true
    return
  }

  bookingHasConflict.value = hasTimeConflict(classItem.date, classItem.time)
  showBookingModal.value = true
}

// Confirm booking
const confirmBooking = () => {
  if (selectedClassForBooking.value) {
    const classItem = availableClasses.value.find((c) => c.id === selectedClassForBooking.value?.id)
    if (classItem) {
      storeBookClass(classItem, classItem.spotsLeft > 0)
      // Remove from available classes list (mock behavior)
      if (classItem.spotsLeft > 0) {
        classItem.spotsLeft--
      }
      toast.add({
        severity: 'success',
        summary: 'Booking Confirmed',
        detail: `You have successfully booked ${selectedClassForBooking.value.name}.`,
        life: 3000,
      })
    }
  }
  showBookingModal.value = false
}

// Join waiting list
const joinWaitingList = () => {
  if (selectedClassForBooking.value) {
    const classItem = availableClasses.value.find((c) => c.id === selectedClassForBooking.value?.id)
    if (classItem) {
      storeBookClass(classItem, false)
      toast.add({
        severity: 'success',
        summary: 'Joined Waitlist',
        detail: `You've been added to the waitlist for ${selectedClassForBooking.value.name}.`,
        life: 3000,
      })
    }
  }
  showBookingModal.value = false
  showOnlineClassModal.value = false
}

// Join online class (Zoom)
// Note: joining online is not an immediate action when class is full.
// The Zoom link will be provided at class start; modal is informational.

// Join waitlist from online modal
const joinWaitlistFromOnline = () => {
  joinWaitingList()
}

// Open Zoom modal (when class started)
const viewZoom = (classItem: AvailableClass) => {
  selectedClassForBooking.value = {
    id: classItem.id,
    name: classItem.name,
    trainer: classItem.trainer,
    date: classItem.date,
    time: classItem.time,
    location: classItem.location,
    spotsLeft: classItem.spotsLeft,
    isFull: classItem.spotsLeft === 0,
    trainerAvatar: classItem.trainerAvatar,
    totalSpots: classItem.totalSpots,
    zoomLink: (classItem as unknown as { zoomLink?: string }).zoomLink,
  }
  showOnlineClassModal.value = true
}

// Open cancel confirmation modal
const openCancelModal = (session: {
  id: number
  name: string
  trainer: string
  date: string
  time: string
  location: string
  type: string
  status: string
}) => {
  const isWaitlist = session.status === 'waitlist'
  const isPTSession = session.type === 'pt-session'
  // Members should be able to decline pending PT session requests
  const canCancel = isWaitlist || (isPTSession ? session.status === 'pending' : canCancelClass(session.date, session.time))

  selectedBookingForCancel.value = {
    id: session.id,
    name: session.name,
    trainer: session.trainer,
    date: session.date,
    time: session.time,
    location: session.location,
    type: isWaitlist ? 'waitlist' : isPTSession ? 'pt-session' : 'class',
    canCancel,
  }
  showCancelModal.value = true
}

// Confirm cancel
const confirmCancel = () => {
  if (selectedBookingForCancel.value) {
    const isWaitlist = selectedBookingForCancel.value.type === 'waitlist'
    const isPT = selectedBookingForCancel.value.type === 'pt-session'
    if (isPT) {
      cancelPTSession(selectedBookingForCancel.value.id)
    } else {
      cancelBooking(selectedBookingForCancel.value.id, isWaitlist)
    }
    toast.add({
      severity: 'success',
      summary: isWaitlist ? 'Left Waitlist' : 'Class Cancelled',
      detail: isWaitlist
        ? `You have been removed from the waitlist for ${selectedBookingForCancel.value.name}.`
        : `Your booking for ${selectedBookingForCancel.value.name} has been cancelled.`,
      life: 3000,
    })
  }
  showCancelModal.value = false
}

// Member confirms a PT session request
const confirmPT = (session: { id: number; name: string }) => {
  const ok = confirmPTSession(session.id)
  if (ok) {
    toast.add({
      severity: 'success',
      summary: 'PT Session Confirmed',
      detail: `You have confirmed the PT session ${session.name}.`,
      life: 3000,
    })
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to confirm session', life: 3000 })
  }
}

// Stats
const totalClassesThisMonth = computed(() => {
  return (
    sessionHistory.value.filter((s) => s.status === 'attended').length +
    upcomingClasses.value.filter((c) => c.status === 'confirmed').length
  )
})

const ptSessionsThisMonth = computed(() => {
  return (
    upcomingClasses.value.filter((c) => c.type === 'pt-session').length +
    sessionHistory.value.filter((s) => s.type === 'pt-session' && s.status === 'attended').length
  )
})

const attendedCount = computed(() => {
  return sessionHistory.value.filter((s) => s.status === 'attended').length
})

const tabs = [
  { key: 'upcoming', label: 'Upcoming', icon: 'pi-calendar' },
  {
    key: 'waitlist',
    label: 'Waiting List',
    icon: 'pi-clock',
    badge: waitingListClasses.value.length,
  },
  { key: 'book', label: 'Book a Class', icon: 'pi-plus-circle' },
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
          <p class="text-(--text-secondary)">Manage your classes and training sessions</p>
        </div>
        <Button
          label="Browse All Classes"
          icon="pi pi-search"
          class="btn mt-4 md:mt-0"
          @click="router.push('/programs')"
        />
      </div>

      <!-- Stats Cards -->
      <StatsSection
        :upcoming-count="upcomingClasses.length"
        :total-classes-this-month="totalClassesThisMonth"
        :pt-sessions-this-month="ptSessionsThisMonth"
        :attended-count="attendedCount"
      />

      <!-- Custom Tab Navigation -->
      <TabNavigation :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

      <!-- Tab Content -->
      <UpcomingTab
        v-show="activeTab === 'upcoming'"
        :sessions="upcomingClasses"
        @cancel="openCancelModal"
        @confirm-pt="confirmPT"
      />

      <BookTab
        v-show="activeTab === 'book'"
        :available-classes="availableClasses"
        @book="openBookingModal"
        @view-zoom="viewZoom"
      />

      <WaitlistTab
        v-show="activeTab === 'waitlist'"
        :waitlist-classes="waitingListClasses"
        @cancel="openCancelModal"
      />

      <HistoryTab v-show="activeTab === 'history'" :session-history="sessionHistory" />
    </div>

    <!-- Booking Confirm Modal -->
    <BookingConfirmModal
      v-model:visible="showBookingModal"
      :classInfo="selectedClassForBooking"
      :hasTimeConflict="bookingHasConflict"
      @confirm="confirmBooking"
      @join-waitlist="joinWaitingList"
    />

    <!-- Cancel Confirm Modal -->
    <CancelConfirmModal
      v-model:visible="showCancelModal"
      :bookingInfo="selectedBookingForCancel"
      userRole="member"
      @confirm="confirmCancel"
    />

    <!-- Online Class Modal (when class is full) -->
    <OnlineClassModal
      v-model:visible="showOnlineClassModal"
      :classInfo="selectedClassForBooking"
      @join-waitlist="joinWaitlistFromOnline"
    />
  </div>
</template>
