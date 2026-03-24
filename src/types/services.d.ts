// Lightweight type declarations for JS service modules used by the app.
// Keep these minimal and lint-friendly so vue-tsc can check usages.

declare module '@/services/authService' {
  export interface AuthUser {
    id: number | string
    name: string
    email?: string
    role?: string
    [key: string]: unknown
  }

  export function login(email: string, password: string): Promise<{ user: AuthUser; token: string }>
  export function logout(): Promise<void>
  export function register(payload: Record<string, unknown>): Promise<{ user: AuthUser; token: string }>
  export function registerAndPersist(payload: Record<string, unknown>): Promise<{ user: AuthUser; token: string }>
  export function loginAndPersist(email: string, password: string): Promise<{ user: AuthUser; token: string }>
  export function persistToken(token?: string | null): void
  export function forgotPassword(email: string): Promise<unknown>
  export function resetPassword(payload: { token: string; email: string; password: string; password_confirmation: string }): Promise<unknown>
  export function emergencyContact(payload: Record<string, unknown>): Promise<unknown>
  export function me(): Promise<unknown>
  export function memberMe(): Promise<unknown>
  export function updateUserMe(payload: Record<string, unknown>): Promise<Record<string, unknown>>

  const _default: {
    login: (email: string, password: string) => Promise<{ user: AuthUser; token: string }>
    logout: () => Promise<void>
    register: (payload: Record<string, unknown>) => Promise<{ user: AuthUser; token: string }>
    registerAndPersist: (payload: Record<string, unknown>) => Promise<{ user: AuthUser; token: string }>
    loginAndPersist: (email: string, password: string) => Promise<{ user: AuthUser; token: string }>
    persistToken: (token?: string | null) => void
    forgotPassword: (email: string) => Promise<unknown>
    resetPassword: (payload: { token: string; email: string; password: string; password_confirmation: string }) => Promise<unknown>
    emergencyContact: (payload: Record<string, unknown>) => Promise<unknown>
  me: () => Promise<unknown>
  memberMe: () => Promise<unknown>
  updateUserMe: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
  }
  export default _default
}

declare module '@/services/membershipService' {
  export interface MembershipRaw {
    id?: number | string
    name?: string
    price?: number
    duration_in_days?: number
    gym?: { name?: string } | null
    active_promos?: unknown
    membershipPromos?: unknown
    membership_promos?: unknown
    promos?: unknown
    [key: string]: unknown
  }

  export function getMemberships(): Promise<MembershipRaw[]>
  export function getMembership(id: string | number): Promise<MembershipRaw>

  const _default: {
    getMemberships: () => Promise<MembershipRaw[]>
    getMembership: (id: string | number) => Promise<MembershipRaw>
  }
  export default _default
}

declare module '@/services/trainerService' {
  export interface TrainerRaw {
    id?: number | string
    name?: string
    bio?: string
    avatar?: string
    expertise?: string[]
    [key: string]: unknown
  }

  export function getTrainers(params?: Record<string, unknown>): Promise<TrainerRaw[]>
  export function getTrainer(id: string | number): Promise<TrainerRaw>
  export function getTrainerMe(): Promise<TrainerRaw>
  export function getTrainerClients(id: string | number): Promise<Record<string, unknown>[]>
  export function getTrainerClientsAll(): Promise<Record<string, unknown>[]>
  export function getTrainerSchedules(id: string | number): Promise<Record<string, unknown>[]>

  

  const _default: {
    getTrainers: (params?: Record<string, unknown>) => Promise<TrainerRaw[]>
    getTrainer: (id: string | number) => Promise<TrainerRaw>
    getTrainerMe: () => Promise<TrainerRaw>
    getTrainerClients: (id: string | number) => Promise<Record<string, unknown>[]>
    getTrainerClientsAll: () => Promise<Record<string, unknown>[]>
    getTrainerSchedules: (id: string | number) => Promise<Record<string, unknown>[]>
  }
  export default _default
}

declare module '@/services/bookingService' {
  export interface BookingRaw {
    id?: number
    booking_type?: string
    status?: string
    notes?: string | null
    created_at?: string
    schedule?: {
      id?: number
      class_name?: string
      category?: string
      trainer_name?: string
      date?: string
      start_time?: string
      end_time?: string
      location?: string
    }
    trainer_name?: string
    date?: string
    start_time?: string
    end_time?: string
    location?: string
    [key: string]: unknown
  }

  export function getBookings(params?: Record<string, unknown>): Promise<BookingRaw[]>
  export function createBooking(payload: { schedule_id: number; booking_type?: string; notes?: string }): Promise<BookingRaw>
  export function joinWaitlist(schedule_id: number): Promise<{ id?: number; position?: number }>
  export function cancelBooking(bookingId: number, payload: { verification: string; reason?: string }): Promise<unknown>
  export function rescheduleBooking(bookingId: number, payload: { new_schedule_id: number; reason: string }): Promise<BookingRaw>

  const _default: {
    getBookings: (params?: Record<string, unknown>) => Promise<BookingRaw[]>
    createBooking: (payload: { schedule_id: number; booking_type?: string; notes?: string }) => Promise<BookingRaw>
    joinWaitlist: (schedule_id: number) => Promise<{ id?: number; position?: number }>
    cancelBooking: (bookingId: number, payload: { verification: string; reason?: string }) => Promise<unknown>
    rescheduleBooking: (bookingId: number, payload: { new_schedule_id: number; reason: string }) => Promise<BookingRaw>
  }
  export default _default
}

declare module '@/services/paymentService' {
  export function createSignature(payload: { signature: string; membership_plan_id?: number }): Promise<{ id?: number; token?: string }>
  export function createPayment(payload: { membership_plan_id?: number; method?: string; amount?: number; signature_id?: number }): Promise<{ payment_url?: string; token?: string }>

  const _default: {
    createSignature: (payload: { signature: string; membership_plan_id?: number }) => Promise<{ id?: number; token?: string }>
    createPayment: (payload: { membership_plan_id?: number; method?: string; amount?: number; signature_id?: number }) => Promise<{ payment_url?: string; token?: string }>
  }
  export default _default
}

declare module '@/services/scheduleService' {
  export function getSchedules(params?: Record<string, unknown>): Promise<Record<string, unknown>>
  export function getClasses(params?: Record<string, unknown>): Promise<Record<string, unknown>[]>

  const _default: {
    getSchedules: (params?: Record<string, unknown>) => Promise<Record<string, unknown>>
    getClasses: (params?: Record<string, unknown>) => Promise<Record<string, unknown>[]>
  }
  export default _default
}

declare module '@/services/uploadService' {
  export function uploadFile(file: File): Promise<Record<string, unknown>>

  const _default: {
    uploadFile: (file: File) => Promise<Record<string, unknown>>
  }
  export default _default
}
