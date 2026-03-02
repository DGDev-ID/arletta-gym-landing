declare module '@/services/userService' {
  export type Membership = {
    is_active?: boolean
    membership_end_at?: string
    [key: string]: unknown
  }

  export type QRData = {
    start_date?: string
    duration?: string
    [key: string]: unknown
  }

  export type Profile = {
    id: number
    name: string
    email: string
    phone_number?: string
    created_at?: string
    unique_id?: string | number
    membership?: Membership
    qr_data?: QRData
    role?: string
    [key: string]: unknown
  }

  export function getProfile(): Promise<Profile>
  export function getBookings(status?: string): Promise<Array<Record<string, unknown>>>

  const _default: {
    getProfile: typeof getProfile
    getBookings: typeof getBookings
  }

  export default _default
}

declare module '@/services/authService' {
  export type AuthUser = {
    id: number
    name: string
    email: string
    role?: string
    avatar?: string
    [key: string]: unknown
  }

  export function login(email: string, password: string): Promise<{ user: AuthUser; token: string }>
  export function logout(): Promise<void>

  const _default: {
    login: typeof login
    logout: typeof logout
  }

  export default _default
}

// Some imports may resolve with a `.js` suffix in certain toolchains (vue-tsc resolution),
// provide a lightweight fallback declaration to avoid TS7016 errors.
declare module '@/services/userService.js' {
  export function getProfile(): Promise<Record<string, unknown>>
  export function getBookings(status?: string): Promise<Array<Record<string, unknown>>>
  const _default: { getProfile: typeof getProfile; getBookings: typeof getBookings }
  export default _default
}
