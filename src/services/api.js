import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Set Authorization header for subsequent requests.
 * Call with null/undefined to clear the header.
 */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Initialize from localStorage if available
try {
  const saved = localStorage.getItem('auth_token')
  if (saved) setAuthToken(saved)
} catch {
  // ignore (e.g., SSR or unavailable localStorage)
}

export default api
