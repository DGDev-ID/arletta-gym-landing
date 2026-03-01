declare module '@/stores/auth' {
  export type User = {
    id: number
    name: string
    email: string
    role: 'member' | 'pt'
    avatar?: string
  }
  export const setUser: (user: User | null) => void
  export const logout: () => void
  const authState: { isLoggedIn: boolean; user: User | null }
  export default authState
}
