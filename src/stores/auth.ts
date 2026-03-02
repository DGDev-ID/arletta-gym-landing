import { reactive } from 'vue'

type User = { id: number; name: string; email: string; role: 'member' | 'pt'; avatar?: string }

const TOKEN_KEY = 'arletta_token'

const state = reactive({
  isLoggedIn: false,
  user: null as User | null,
  token: localStorage.getItem(TOKEN_KEY) ?? null as string | null,
})

export function setUser(user: User | null, token?: string) {
  state.user = user
  state.isLoggedIn = !!user
  if (token !== undefined) {
    state.token = token
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
}

export function logout() {
  state.user = null
  state.isLoggedIn = false
  state.token = null
  localStorage.removeItem(TOKEN_KEY)
}

export default state
