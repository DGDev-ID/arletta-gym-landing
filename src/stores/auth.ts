import { reactive } from 'vue'
import { me as apiMe } from '@/services/authService'

type User = { id: number; name: string; email: string; role: 'member' | 'pt'; avatar?: string }

const state = reactive({
  isLoggedIn: false,
  user: null as User | null,
})

export function setUser(user: User | null) {
  state.user = user
  state.isLoggedIn = !!user
}

export function logout() {
  state.user = null
  state.isLoggedIn = false
}

export async function fetchMe(): Promise<void> {
  try {
    const data = await apiMe()
    // backend returns an object that includes 'member' or 'trainer' payloads for landing
    // attempt to map to our simple User shape
    const obj = (data && typeof data === 'object') ? (data as Record<string, unknown>) : null
    const u = obj ? ('member' in obj ? obj['member'] : ('trainer' in obj ? obj['trainer'] : obj)) : null
    if (!u || typeof u !== 'object') {
      setUser(null)
      return
    }
    const uObj = u as Record<string, unknown>
    const role = String((uObj['role'] as string | undefined) ?? (uObj['roles'] as string | undefined) ?? '').toLowerCase().includes('pt') ? 'pt' : 'member'
    setUser({
      id: Number(uObj['id'] ?? (uObj['user'] && (uObj['user'] as Record<string, unknown>)['id']) ?? 0),
      name: String(uObj['name'] ?? (uObj['user'] && (uObj['user'] as Record<string, unknown>)['name']) ?? ''),
      email: String(uObj['email'] ?? (uObj['user'] && (uObj['user'] as Record<string, unknown>)['email']) ?? ''),
      role: role as 'member' | 'pt',
      avatar: String(uObj['avatar'] ?? (uObj['user'] && (uObj['user'] as Record<string, unknown>)['avatar']) ?? ''),
    })
  } catch {
    // silently ignore — user not authenticated or token invalid
    setUser(null)
  }
}

export default state
