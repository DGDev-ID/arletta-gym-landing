import { ref, computed } from 'vue'

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
const bookedClasses = ref<BookedClass[]>([
  // Upcoming confirmed classes
  {
    id: 1,
    classId: 101,
    name: 'HIIT Burn',
    trainer: 'Sarah Johnson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: '2026-03-03',
    time: '09:00 - 09:45',
    location: 'Studio A',
    type: 'class',
    status: 'confirmed',
    bookedAt: '2026-02-25T10:00:00',
    canCancel: true,
  },
  {
    id: 2,
    classId: 102,
    name: 'Power Yoga',
    trainer: 'Maya Chen',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    date: '2026-03-04',
    time: '18:00 - 19:00',
    location: 'Studio B',
    type: 'class',
    status: 'confirmed',
    bookedAt: '2026-02-25T11:00:00',
    canCancel: true,
  },
  // Two overlapping bookings to demonstrate time conflict
  {
    id: 3,
    classId: 103,
    name: 'Boxing Fundamentals',
    trainer: 'Carlos Rodriguez',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    date: '2026-03-05',
    time: '17:00 - 18:00',
    location: 'Boxing Ring',
    type: 'class',
    status: 'confirmed',
    bookedAt: '2026-02-26T14:00:00',
    canCancel: true,
  },
  {
    id: 4,
    classId: 104,
    name: 'Evening Mobility',
    trainer: 'Alex Park',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    date: '2026-03-05',
    time: '17:30 - 18:15',
    location: 'Studio C',
    type: 'class',
    status: 'confirmed',
    bookedAt: '2026-02-26T15:00:00',
    canCancel: true,
  },
])

const waitingList = ref<BookedClass[]>([
  {
    id: 100,
    classId: 201,
    name: 'Spin Cycle',
    trainer: 'David Kim',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    date: '2026-03-02',
    time: '06:00 - 06:45',
    location: 'Cycling Studio',
    type: 'class',
    status: 'waitlist',
    bookedAt: '2026-02-28T09:00:00',
    canCancel: true, // waiting list can always be cancelled
  },
  {
    id: 101,
    classId: 204,
    name: 'Pilates Core',
    trainer: 'Emma Wilson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    date: '2026-03-07',
    time: '09:00 - 09:45',
    location: 'Studio C',
    type: 'class',
    status: 'waitlist',
    bookedAt: '2026-02-28T12:00:00',
    canCancel: true,
  },
  {
    id: 102,
    classId: 202,
    name: 'Core Crusher',
    trainer: 'Lisa Park',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    date: '2026-03-05',
    time: '12:00 - 12:30',
    location: 'Studio A',
    type: 'class',
    status: 'waitlist',
    bookedAt: '2026-02-27T08:30:00',
    canCancel: true,
  },
])

const ptSessions = ref<BookedClass[]>([
  {
    id: 201,
    classId: 0,
    name: 'Personal Training',
    trainer: 'Mike Torres',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    date: '2026-03-06',
    time: '14:00 - 15:00',
    location: 'Weight Room',
    type: 'pt-session',
    status: 'confirmed',
    bookedAt: '2026-02-20T10:00:00',
    canCancel: false, // Only PT can cancel
  },
  // Pending session created by trainer, awaiting member confirmation
  {
    id: 202,
    classId: 0,
    name: 'PT - Assessment Session',
    trainer: 'Rita Lestari',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rita',
    date: '2026-03-04',
    time: '11:00 - 12:00',
    location: 'Consultation Room',
    type: 'pt-session',
    status: 'pending',
    bookedAt: '2026-02-28T09:30:00',
    canCancel: true, // member can decline pending
  },
])

const classHistory = ref<BookedClass[]>([
  {
    id: 301,
    classId: 101,
    name: 'HIIT Burn',
    trainer: 'Sarah Johnson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: '2026-02-10',
    time: '09:00 - 09:45',
    location: 'Studio A',
    type: 'class',
    status: 'confirmed',
    bookedAt: '2026-01-20T10:00:00',
    canCancel: false,
  },
])

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
  const today = new Date().toISOString().split('T')[0] ?? ''
  return [...bookedClasses.value, ...ptSessions.value]
    .filter((b) => b.date >= today && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

export const upcomingWaitingList = computed(() => {
  const today = new Date().toISOString().split('T')[0] ?? ''
  return waitingList.value
    .filter((b) => b.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Export refs for direct access
export { bookedClasses, waitingList, ptSessions, classHistory }
