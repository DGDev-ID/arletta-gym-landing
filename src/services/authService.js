import { api } from './api.js'

/**
 * Login via backend API (/api/auth/login).
 * Returns { user, token } on success.
 */
export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password })
  if (!data.success) {
    throw new Error(data.message ?? 'Login failed')
  }
  return {
    user: data.data.user,
    token: data.data.token,
  }
}

/**
 * Logout via backend API (/api/auth/logout).
 */
export async function logout() {
  try {
    await api.post('/api/auth/logout')
  } catch {
    // ignore errors — local cleanup happens regardless
  }
}

export default { login, logout }
