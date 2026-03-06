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

  const _default: {
    login: (email: string, password: string) => Promise<{ user: AuthUser; token: string }>
    logout: () => Promise<void>
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
