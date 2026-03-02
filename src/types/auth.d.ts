declare module '@/stores/auth' {
  export type User = {
    id: number
    name: string
    email: string
    role: 'member' | 'pt'
    avatar?: string
  }
  export function setUser(user: User | null, token?: string): void
  export function logout(): void
  const authState: { isLoggedIn: boolean; user: User | null; token: string | null }
  export default authState
}
