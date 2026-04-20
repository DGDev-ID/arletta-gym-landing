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
    // backend GET /auth/me returns { id, name, email, roles: [{name: '...'}], userDetail, gyms }
    const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null
    if (!obj) {
      setUser(null)
      return
    }

    // Detect role from 'roles' array (Laravel Spatie format: [{id, name, ...}])
    // A PT user has TWO roles: 'User' AND 'Personal Trainer'.
    // We must scan ALL roles and prioritise 'pt' over 'member'.
    let isPt = false
    const rolesArr = obj['roles']
    if (Array.isArray(rolesArr) && rolesArr.length > 0) {
      for (const r of rolesArr) {
        const name =
          typeof r === 'string' ? r : String((r as Record<string, unknown>)['name'] ?? '')
        if (name.toLowerCase().includes('personal trainer') || name.toLowerCase() === 'pt') {
          isPt = true
          break
        }
      }
    } else if (typeof obj['role'] === 'string') {
      const roleName = obj['role']
      isPt = roleName.toLowerCase().includes('personal trainer') || roleName.toLowerCase() === 'pt'
    }
    const role: 'member' | 'pt' = isPt ? 'pt' : 'member'

    // Read userDetail for avatar
    const userDetail = (obj['userDetail'] ?? obj['user_detail'] ?? {}) as Record<string, unknown>

    setUser({
      id: Number(obj['id'] ?? 0),
      name: String(obj['name'] ?? ''),
      email: String(obj['email'] ?? ''),
      role,
      avatar: String(userDetail['photo'] ?? userDetail['avatar'] ?? obj['avatar'] ?? ''),
    })
  } catch {
    // silently ignore — user not authenticated or token invalid
    setUser(null)
  }
}

// Named export for the reactive state — use `import { authState } from '@/stores/auth'`
export const authState = state

// Default export — use `import authState from '@/stores/auth'`
export default state
