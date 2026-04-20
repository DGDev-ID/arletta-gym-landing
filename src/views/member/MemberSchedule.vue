<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
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
  // bookClass as storeBookClass, (replaced with API calls)
  cancelBooking,
  confirmPTSession,
  canCancelClass,
  cancelPTSession,
  completeSession,
  classHistory,
  type AvailableClass,
  loadBookingsFromApi,
} from '@/stores/booking'
import {
  createBooking,
  joinWaitlist,
  cancelBooking as apiCancelBooking,
  rescheduleBooking as apiRescheduleBooking,
} from '@/services/bookingService'
import { getSchedules } from '@/services/scheduleService'

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
const rescheduleTargetBookingId = ref<number | null>(null)
const bookingHasConflict = ref(false)
const bookingSubmitting = ref(false)
const waitlistSubmitting = ref(false)

// Computed classes from store
const upcomingClasses = computed(() => storeUpcomingClasses.value)

// Waiting list classes
const waitingListClasses = computed(() => upcomingWaitingList.value)

// Past sessions history (use shared store history)
const sessionHistory = classHistory

// Available classes to book
const availableClasses = ref<AvailableClass[]>([])
const availableClassesLoading = ref(false)
const bookingsLoading = ref(true)

onMounted(async () => {
  // Load bookings from API
  bookingsLoading.value = true
  try {
    await loadBookingsFromApi()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    toast.add({ severity: 'error', summary: 'Bookings load failed', detail: msg, life: 5000 })
  } finally {
    bookingsLoading.value = false
  }

  // Load available classes from API
  try {
    availableClassesLoading.value = true
    const schedulesData = await getSchedules()
    if (Array.isArray(schedulesData)) {
      availableClasses.value = (schedulesData as Array<Record<string, unknown>>).map((s) => {
        const cls = (s['class'] ?? {}) as Record<string, unknown>
        const trainer = (s['trainer'] ?? {}) as Record<string, unknown>
        const startTime = String(s['start_time'] ?? '')
        const endTime = String(s['end_time'] ?? '')
        const time = startTime && endTime ? `${startTime} - ${endTime}` : startTime
        const trainerName = String(trainer['name'] ?? '')
        const capacity = Number(s['capacity'] ?? 0)
        const bookedCount = Number(s['booked_count'] ?? 0)
        return {
          id: Number(s['id'] ?? 0),
          name: String(cls['name'] ?? ''),
          trainer: trainerName,
          trainerAvatar: trainerName
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trainerName)}`
            : '',
          date: String(s['date'] ?? ''),
          time,
          location: String(s['location'] ?? ''),
          spotsLeft: Math.max(0, capacity - bookedCount),
          totalSpots: capacity,
          category: String(cls['category'] ?? ''),
          duration: cls['duration_minutes'] ? `${cls['duration_minutes']} min` : undefined,
          level: String(cls['level'] ?? ''),
          zoomLink: s['zoom_link'] ? 'available' : undefined,
        } as AvailableClass
      })
    }
  } catch (e: unknown) {
    console.warn('Failed to load available classes', e)
  } finally {
    availableClassesLoading.value = false
  }
})

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

// Join waiting list (call API)
const joinWaitingList = async () => {
  if (!selectedClassForBooking.value) {
    showBookingModal.value = false
    showOnlineClassModal.value = false
    return
  }

  const classItem = availableClasses.value.find((c) => c.id === selectedClassForBooking.value?.id)
  if (!classItem) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Class not found', life: 3000 })
    showBookingModal.value = false
    showOnlineClassModal.value = false
    return
  }

  waitlistSubmitting.value = true
  try {
    await joinWaitlist(classItem.id)
    await loadBookingsFromApi()
    toast.add({
      severity: 'success',
      summary: 'Joined Waitlist',
      detail: `You've been added to the waitlist for ${selectedClassForBooking.value.name}.`,
      life: 3000,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Waitlist failed', detail: message, life: 5000 })
  } finally {
    waitlistSubmitting.value = false
    showBookingModal.value = false
    showOnlineClassModal.value = false
  }
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
  const canCancel =
    isWaitlist ||
    (isPTSession ? session.status === 'pending' : canCancelClass(session.date, session.time))

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

// Open reschedule flow: open booking modal to pick a new class
const openReschedule = (session: { id: number; name: string }) => {
  rescheduleTargetBookingId.value = session.id
  // show booking modal to pick a new class (reuse booking confirm modal)
  showBookingModal.value = true
}

// Confirm cancel (accepts payload from modal: { verification, reason })
const confirmCancel = async (payload?: { verification?: string; reason?: string }) => {
  if (!selectedBookingForCancel.value) {
    showCancelModal.value = false
    return
  }

  const isWaitlist = selectedBookingForCancel.value.type === 'waitlist'
  const isPT = selectedBookingForCancel.value.type === 'pt-session'

  if (isPT) {
    // local PT cancel behavior
    cancelPTSession(selectedBookingForCancel.value.id)
    toast.add({
      severity: 'success',
      summary: 'PT Session Cancelled',
      detail: `PT session ${selectedBookingForCancel.value.name} cancelled.`,
      life: 3000,
    })
    showCancelModal.value = false
    return
  }

  if (isWaitlist) {
    // No backend endpoint for waitlist removal exposed; fall back to local store change
    const ok = cancelBooking(selectedBookingForCancel.value.id, true)
    if (ok) {
      toast.add({
        severity: 'success',
        summary: 'Left Waitlist',
        detail: `You have been removed from the waitlist for ${selectedBookingForCancel.value.name}.`,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to leave waitlist',
        life: 3000,
      })
    }
    showCancelModal.value = false
    return
  }

  // Regular booking cancellation -> call API
  try {
    const verifier = String(payload?.verification ?? '')
    const reason = String(payload?.reason ?? '')
    await apiCancelBooking(selectedBookingForCancel.value.id, { verification: verifier, reason })

    // refresh store
    await loadBookingsFromApi()

    toast.add({
      severity: 'success',
      summary: 'Class Cancelled',
      detail: `Your booking for ${selectedBookingForCancel.value.name} has been cancelled.`,
      life: 3000,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Cancel failed', detail: message, life: 5000 })
  } finally {
    showCancelModal.value = false
  }
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
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to confirm session',
      life: 3000,
    })
  }
}

// Confirm booking (call API)
const confirmBooking = async () => {
  if (!selectedClassForBooking.value) {
    showBookingModal.value = false
    showOnlineClassModal.value = false
    return
  }

  bookingSubmitting.value = true
  try {
    const wasReschedule = Boolean(rescheduleTargetBookingId.value)
    if (wasReschedule && rescheduleTargetBookingId.value) {
      await apiRescheduleBooking(rescheduleTargetBookingId.value, {
        new_schedule_id: selectedClassForBooking.value.id,
        reason: 'Rescheduled by member',
      })
    } else {
      await createBooking({ schedule_id: selectedClassForBooking.value.id })
    }
    await loadBookingsFromApi()
    toast.add({
      severity: 'success',
      summary: wasReschedule ? 'Rescheduled' : 'Booked',
      detail: `You've ${wasReschedule ? 'rescheduled to' : 'booked'} ${selectedClassForBooking.value.name}.`,
      life: 3000,
    })
    // clear target after success
    rescheduleTargetBookingId.value = null
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    toast.add({ severity: 'error', summary: 'Booking failed', detail: message, life: 5000 })
  } finally {
    bookingSubmitting.value = false
    showBookingModal.value = false
    showOnlineClassModal.value = false
  }
}

// Check-in handler (Scan QR) invoked from UpcomingTab
const handleCheckIn = (session: { id: number; name: string }) => {
  const ok = completeSession(session.id, true)
  if (ok) {
    toast.add({
      severity: 'success',
      summary: 'Checked In',
      detail: `You have checked in for ${session.name}.`,
      life: 3000,
    })
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to check in', life: 3000 })
  }
}

// Sweep: mark past sessions as missed if time passed and not checked-in
const sweepMissedSessions = () => {
  const now = Date.now()
  upcomingClasses.value.forEach((s) => {
    try {
      const parts = (s.time ?? '').split(' - ')
      if (!parts || parts.length < 2) return
      const end = String(parts[1])
      const endParts = end.split(':').map((v) => Number(v || 0))
      const endDt = new Date(
        `${s.date}T${String(endParts[0]).padStart(2, '0')}:${String(endParts[1]).padStart(2, '0')}:00`,
      )
      // if end time was more than 15 minutes ago and session is still confirmed, mark missed
      if (now > endDt.getTime() + 15 * 60 * 1000 && s.status === 'confirmed') {
        completeSession(s.id, false)
      }
    } catch {
      // ignore parse errors
    }
  })
}

// Run sweep on mount
onMounted(() => {
  sweepMissedSessions()
})

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
      <template v-if="bookingsLoading">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div v-for="i in 4" :key="i" class="glass-card rounded-xl p-4 space-y-2">
            <Skeleton width="40%" height="0.75rem" />
            <Skeleton width="60%" height="1.75rem" />
          </div>
        </div>
      </template>
      <StatsSection
        v-else
        :upcoming-count="upcomingClasses.length"
        :total-classes-this-month="totalClassesThisMonth"
        :pt-sessions-this-month="ptSessionsThisMonth"
        :attended-count="attendedCount"
      />

      <!-- Custom Tab Navigation -->
      <TabNavigation :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

      <!-- Tab Content -->
      <!-- Skeleton when bookings loading -->
      <div
        v-if="bookingsLoading && (activeTab === 'upcoming' || activeTab === 'history')"
        class="space-y-4 mt-6"
      >
        <div v-for="i in 3" :key="i" class="glass-card rounded-xl p-4 flex items-center gap-4">
          <Skeleton width="3rem" height="3rem" borderRadius="8px" />
          <div class="flex-1 space-y-2">
            <Skeleton width="50%" height="1rem" />
            <Skeleton width="35%" height="0.75rem" />
          </div>
          <Skeleton width="5rem" height="2rem" borderRadius="8px" />
        </div>
      </div>

      <UpcomingTab
        v-show="activeTab === 'upcoming'"
        :sessions="upcomingClasses"
        @cancel="openCancelModal"
        @confirm-pt="confirmPT"
        @check-in="handleCheckIn"
        @reschedule="openReschedule"
      />

      <!-- Book Tab with skeleton -->
      <div v-if="availableClassesLoading && activeTab === 'book'" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="glass-card rounded-xl p-6 space-y-3">
            <Skeleton width="65%" height="1.125rem" />
            <Skeleton width="45%" height="0.875rem" />
            <div class="flex items-center gap-2">
              <Skeleton shape="circle" size="1.5rem" />
              <Skeleton width="40%" height="0.75rem" />
            </div>
            <Skeleton width="50%" height="0.75rem" />
            <Skeleton width="100%" height="2.5rem" borderRadius="8px" class="mt-2" />
          </div>
        </div>
      </div>
      <BookTab
        v-show="activeTab === 'book' && !availableClassesLoading"
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
      :visible="showBookingModal"
      @update:visible="(v) => (showBookingModal = v)"
      :classInfo="selectedClassForBooking"
      :hasTimeConflict="bookingHasConflict"
      @confirm="confirmBooking"
      @join-waitlist="joinWaitingList"
    />

    <!-- Cancel Confirm Modal -->
    <CancelConfirmModal
      :visible="showCancelModal"
      @update:visible="(v) => (showCancelModal = v)"
      :bookingInfo="selectedBookingForCancel"
      userRole="member"
      @confirm="confirmCancel"
    />

    <!-- Online Class Modal (when class is full) -->
    <OnlineClassModal
      :visible="showOnlineClassModal"
      @update:visible="(v) => (showOnlineClassModal = v)"
      :classInfo="selectedClassForBooking"
      @join-waitlist="joinWaitlistFromOnline"
    />
  </div>
</template>
