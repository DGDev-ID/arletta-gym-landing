import { reactive } from 'vue'

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

export default state