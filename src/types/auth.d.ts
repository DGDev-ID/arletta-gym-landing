declare module '@/stores/auth' {
  export type User = {
    id: number
    name: string
    email: string
    role: 'member' | 'pt'
    avatar?: string
  }
  export function setUser(user: User | null): void
  export function logout(): void
  export function fetchMe(): Promise<void>
  export const authState: { isLoggedIn: boolean; user: User | null }
  const state: { isLoggedIn: boolean; user: User | null }
  export default state
}
