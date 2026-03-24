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
    const obj = (data && typeof data === 'object') ? (data as Record<string, unknown>) : null
    if (!obj) {
      setUser(null)
      return
    }

    // Detect role from 'roles' array (Laravel Spatie format: [{id, name, ...}])
    let roleName = ''
    const rolesArr = obj['roles']
    if (Array.isArray(rolesArr) && rolesArr.length > 0) {
      const firstRole = rolesArr[0] as Record<string, unknown> | string
      roleName = typeof firstRole === 'string' ? firstRole : String((firstRole as Record<string, unknown>)['name'] ?? '')
    } else if (typeof obj['role'] === 'string') {
      roleName = obj['role']
    }
    const role: 'member' | 'pt' = roleName.toLowerCase().includes('personal trainer') || roleName.toLowerCase().includes('pt') ? 'pt' : 'member'

    // Read userDetail for avatar
    const userDetail = (obj['userDetail'] ?? obj['user_detail'] ?? {}) as Record<string, unknown>

    setUser({
      id: Number(obj['id'] ?? 0),
      name: String(obj['name'] ?? ''),
      email: String(obj['email'] ?? ''),
      role,
      avatar: String(userDetail['avatar'] ?? obj['avatar'] ?? ''),
    })
  } catch {
    // silently ignore — user not authenticated or token invalid
    setUser(null)
  }
}

export default state
