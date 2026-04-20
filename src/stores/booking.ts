import { ref, computed } from 'vue'
import bookingService from '@/services/bookingService'

// Types
export interface BookedClass {
  id: number
  classId: number
  name: string
  trainer: string
  trainerAvatar: string
  date: string
  time: string
  location: string
  type: 'class' | 'pt-session'
  // status now includes attendance markers for history
  status: 'confirmed' | 'waitlist' | 'cancelled' | 'pending' | 'attended' | 'missed'
  bookedAt: string
  canCancel: boolean
}

export interface AvailableClass {
  id: number
  name: string
  trainer: string
  trainerAvatar: string
  date: string
  time: string
  location: string
  spotsLeft: number
  totalSpots: number
  isFull?: boolean
  zoomLink?: string
  category?: string
  duration?: string
  level?: string
}

export interface PTSession {
  id: number
  clientId: number
  clientName: string
  clientAvatar: string
  date: string
  time: string
  location: string
  notes?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
}

// Store state
const bookedClasses = ref<BookedClass[]>([])

const waitingList = ref<BookedClass[]>([])

const ptSessions = ref<BookedClass[]>([])

const classHistory = ref<BookedClass[]>([])

// Helper: Check if class can be cancelled (H-1 rule)
export const canCancelClass = (classDate: string, classTime: string): boolean => {
  const now = new Date()
  const [startTime] = classTime.split(' - ')
  const classDateTime = new Date(`${classDate}T${startTime}:00`)

  // Calculate hours difference
  const hoursDiff = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Can cancel if more than 24 hours before class
  return hoursDiff >= 24
}

// Helper: Check time conflict
export const hasTimeConflict = (date: string, time: string): boolean => {
  const timeParts = time.split(' - ')
  const newStart = timeParts[0]?.trim() ?? ''
  const newEnd = timeParts[1]?.trim() ?? ''

  const allBooked = [...bookedClasses.value, ...ptSessions.value, ...waitingList.value]

  return allBooked.some((booked) => {
    if (booked.date !== date || booked.status === 'cancelled') return false

    const bookedParts = booked.time.split(' - ')
    const bookedStart = bookedParts[0]?.trim() ?? ''
    const bookedEnd = bookedParts[1]?.trim() ?? ''

    // Check overlap
    const newStartMins = timeToMinutes(newStart)
    const newEndMins = timeToMinutes(newEnd)
    const bookedStartMins = timeToMinutes(bookedStart)
    const bookedEndMins = timeToMinutes(bookedEnd)

    return newStartMins < bookedEndMins && newEndMins > bookedStartMins
  })
}

const timeToMinutes = (time: string): number => {
  const parts = time.split(':')
  const hours = parseInt(parts[0] ?? '0', 10)
  const minutes = parseInt(parts[1] ?? '0', 10)
  return hours * 60 + minutes
}

// Helper: Format date for display
export const formatClassDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
}

// Actions
let nextId = 1000

export const bookClass = (classInfo: AvailableClass, spotsAvailable: boolean): BookedClass => {
  const newBooking: BookedClass = {
    id: nextId++,
    classId: classInfo.id,
    name: classInfo.name,
    trainer: classInfo.trainer,
    trainerAvatar: classInfo.trainerAvatar,
    date: classInfo.date,
    time: classInfo.time,
    location: classInfo.location,
    type: 'class',
    status: spotsAvailable ? 'confirmed' : 'waitlist',
    bookedAt: new Date().toISOString(),
    canCancel: true,
  }

  if (spotsAvailable) {
    bookedClasses.value.push(newBooking)
  } else {
    waitingList.value.push(newBooking)
  }

  return newBooking
}

export const cancelBooking = (bookingId: number, isWaitingList: boolean = false): boolean => {
  if (isWaitingList) {
    const index = waitingList.value.findIndex((b) => b.id === bookingId)
    if (index > -1) {
      waitingList.value.splice(index, 1)
      return true
    }
  } else {
    const booking = bookedClasses.value.find((b) => b.id === bookingId)
    if (booking && canCancelClass(booking.date, booking.time)) {
      const index = bookedClasses.value.findIndex((b) => b.id === bookingId)
      bookedClasses.value.splice(index, 1)

      // Promote first person in waiting list for same class
      promoteFromWaitingList(booking.classId, booking.date, booking.time)
      return true
    }
  }
  return false
}

const promoteFromWaitingList = (classId: number, date: string, time: string) => {
  const waitingIndex = waitingList.value.findIndex(
    (w) => w.classId === classId && w.date === date && w.time === time,
  )

  if (waitingIndex > -1) {
    const promoted = waitingList.value.splice(waitingIndex, 1)[0]
    if (promoted) {
      promoted.status = 'confirmed'
      bookedClasses.value.push(promoted)
    }
  }
}

export const addPTSession = (
  session: Omit<BookedClass, 'id' | 'bookedAt' | 'canCancel' | 'classId' | 'type' | 'status'>,
): BookedClass => {
  const newSession: BookedClass = {
    id: nextId++,
    classId: 0,
    ...session,
    type: 'pt-session',
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    canCancel: false, // Member cannot cancel PT session
  }

  ptSessions.value.push(newSession)
  return newSession
}

// Add a PT session created by a trainer that requires member confirmation
export const addPTSessionPending = (
  session: Omit<BookedClass, 'id' | 'bookedAt' | 'canCancel' | 'classId' | 'type' | 'status'>,
): BookedClass => {
  const newSession: BookedClass = {
    id: nextId++,
    classId: 0,
    ...session,
    type: 'pt-session',
    status: 'pending',
    bookedAt: new Date().toISOString(),
    canCancel: true, // member can decline pending request
  }

  ptSessions.value.push(newSession)
  return newSession
}

// Member confirms a pending PT session (trainer created)
export const confirmPTSession = (sessionId: number): boolean => {
  const idx = ptSessions.value.findIndex((s) => s.id === sessionId)
  if (idx === -1) return false
  const session = ptSessions.value[idx]
  if (!session) return false
  session.status = 'confirmed'
  // after confirming, member cannot cancel directly (business rule)
  session.canCancel = false
  return true
}

export const cancelPTSession = (sessionId: number): boolean => {
  const index = ptSessions.value.findIndex((s) => s.id === sessionId)
  if (index > -1) {
    ptSessions.value.splice(index, 1)
    return true
  }
  return false
}

// Mark a session as completed (attended) or missed and move to history
export const completeSession = (bookingId: number, attended: boolean): boolean => {
  // Search in ptSessions first
  let idx = ptSessions.value.findIndex((s) => s.id === bookingId)
  if (idx > -1) {
    const session = ptSessions.value.splice(idx, 1)[0]
    if (!session) return false
    const historyItem: BookedClass = {
      ...session,
      status: attended ? ('attended' as const) : ('missed' as const),
      // keep bookedAt as original, canCancel false
      canCancel: false,
    }
    classHistory.value.push(historyItem)
    return true
  }

  // Search in bookedClasses
  idx = bookedClasses.value.findIndex((s) => s.id === bookingId)
  if (idx > -1) {
    const session = bookedClasses.value.splice(idx, 1)[0]
    if (!session) return false
    const historyItem: BookedClass = {
      ...session,
      status: attended ? ('attended' as const) : ('missed' as const),
      canCancel: false,
    }
    classHistory.value.push(historyItem)
    return true
  }

  return false
}

// Check if class is already booked
export const isClassBooked = (classId: number, date: string, time: string): boolean => {
  return (
    bookedClasses.value.some((b) => b.classId === classId && b.date === date && b.time === time) ||
    waitingList.value.some((w) => w.classId === classId && w.date === date && w.time === time)
  )
}

// Computed
export const upcomingClasses = computed(() => {
  const now = new Date()
  const today = now.toISOString().split('T')[0] ?? ''
  const currentTime = now.toTimeString().slice(0, 8) // HH:mm:ss
  return [...bookedClasses.value, ...ptSessions.value]
    .filter((b) => {
      if (b.status === 'cancelled') return false
      if (b.date > today) return true
      if (b.date === today) {
        const endTime = (b as Record<string, unknown>).endTime as string | undefined
        return (endTime ?? b.time ?? '') > currentTime
      }
      return false
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

export const upcomingWaitingList = computed(() => {
  const now = new Date()
  const today = now.toISOString().split('T')[0] ?? ''
  const currentTime = now.toTimeString().slice(0, 8)
  return waitingList.value
    .filter((b) => {
      if (b.date > today) return true
      if (b.date === today) {
        const endTime = (b as Record<string, unknown>).endTime as string | undefined
        return (endTime ?? b.time ?? '') > currentTime
      }
      return false
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Export refs for direct access
export { bookedClasses, waitingList, ptSessions, classHistory }

// Load bookings from backend and populate store refs
export async function loadBookingsFromApi(params?: Record<string, unknown>) {
  const remote = await bookingService.getBookings(params)

  // reset current lists
  bookedClasses.value = []
  waitingList.value = []
  ptSessions.value = []
  classHistory.value = []

  if (!Array.isArray(remote)) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  remote.forEach((b: unknown) => {
    const booking = (b ?? {}) as Record<string, unknown>
    const s = (booking.schedule ?? {}) as Record<string, unknown>
    const start = String(s.start_time ?? '')
    const end = String(s.end_time ?? '')
    const time = start && end ? `${start} - ${end}` : start

    const status = String(booking.status ?? 'confirmed')
    const category = String(s.category ?? '').toLowerCase()
    const className = String(s.class_name ?? '')
    // Detect PT sessions by category or class name
    const isPT =
      category.includes('pt') ||
      category.includes('personal') ||
      className.toLowerCase().includes('personal training')

    // Determine if the schedule date is in the past
    const scheduleDate = new Date(String(s.date ?? booking.date ?? ''))
    const isPast = !isNaN(scheduleDate.getTime()) && scheduleDate < today

    const item: BookedClass = {
      id: Number(booking.id ?? 0),
      classId: Number(s.id ?? 0),
      name: className,
      trainer: String(s.trainer_name ?? ''),
      trainerAvatar: s.trainer_name
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(s.trainer_name))}`
        : '',
      date: String(s.date ?? booking.date ?? ''),
      time: time,
      location: String(s.location ?? ''),
      type: isPT ? 'pt-session' : 'class',
      status: status as unknown as BookedClass['status'],
      bookedAt: String(booking.created_at ?? ''),
      canCancel: status === 'confirmed' ? canCancelClass(String(s.date ?? ''), time) : false,
    }

    // Cancelled bookings or past confirmed/attended → history
    if (status === 'cancelled' || isPast) {
      classHistory.value.push(item)
      return
    }

    if (isPT) {
      ptSessions.value.push(item)
    } else {
      bookedClasses.value.push(item)
    }
  })

  // Fetch waitlist entries from dedicated endpoint
  try {
    const waitlistData = await bookingService.getWaitlist()
    if (Array.isArray(waitlistData)) {
      waitlistData.forEach((w: unknown) => {
        const entry = (w ?? {}) as Record<string, unknown>
        const s = (entry.schedule ?? {}) as Record<string, unknown>
        const start = String(s.start_time ?? '')
        const end = String(s.end_time ?? '')
        const time = start && end ? `${start} - ${end}` : start

        const item: BookedClass = {
          id: Number(entry.id ?? 0),
          classId: Number(s.id ?? 0),
          name: String(s.class_name ?? ''),
          trainer: String(s.trainer_name ?? ''),
          trainerAvatar: s.trainer_name
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(s.trainer_name))}`
            : '',
          date: String(s.date ?? ''),
          time: time,
          location: String(s.location ?? ''),
          type: 'class',
          status: 'waitlist',
          bookedAt: String(entry.created_at ?? ''),
          canCancel: true, // user can always leave a waitlist
        }
        waitingList.value.push(item)
      })
    }
  } catch {
    // Waitlist fetch failed silently — the tab will just show empty
  }
}
