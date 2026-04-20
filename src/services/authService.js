import api, { setAuthToken } from './api.js'

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  if (!data.success) {
    throw new Error(data.message ?? 'Login failed')
  }
  return {
    user: data.data.user,
    token: data.data.token,
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch {
    // ignore
  }
}

export async function register(payload) {
  // payload should include at minimum: name, email, password, password_confirmation
  const { data } = await api.post('/auth/register', payload)
  if (!data.success) {
    throw new Error(data.message ?? 'Registration failed')
  }
  return {
    user: data.data.user,
    token: data.data.token,
  }
}

// Persist token when present (helper used by UI flows)
export function persistToken(token) {
  try {
    if (token) {
      localStorage.setItem('auth_token', token)
      setAuthToken(token)
    } else {
      localStorage.removeItem('auth_token')
      setAuthToken(null)
    }
  } catch {
    // ignore
  }
}

// Convenience: call persistToken automatically when login/register succeed
export async function loginAndPersist(email, password) {
  const res = await login(email, password)
  if (res && res.token) persistToken(res.token)
  return res
}

export async function registerAndPersist(payload) {
  const res = await register(payload)
  if (res && res.token) persistToken(res.token)
  return res
}

export async function forgotPasswordSendOtp(email) {
  const { data } = await api.post('/auth/forgot-password/send-otp', { email })
  if (!data.success && data.message) {
    throw new Error(data.message)
  }
  return data
}

export async function forgotPasswordSubmitToken(email, token) {
  const { data } = await api.post('/auth/forgot-password/submit-token', { email, token })
  if (!data.success && data.message) {
    throw new Error(data.message)
  }
  return data
}

export async function forgotPasswordChangePassword(payload) {
  // payload: { email, token, password, password_confirmation }
  const { data } = await api.post('/auth/forgot-password/change-password', payload)
  if (!data.success && data.message) {
    throw new Error(data.message)
  }
  return data
}

export async function emergencyContact(payload) {
  // payload should include emergency contact fields, e.g. name, phone, relation
  const { data } = await api.post('/auth/emergency-contact', payload)
  if (!data.success && data.message) {
    throw new Error(data.message)
  }
  return data
}

export async function me() {
  const { data } = await api.get('/auth/me')
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch profile')
  }
  return data.data
}

// Member-specific profile for landing
export async function memberMe() {
  const { data } = await api.get('/members/me')
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch member profile')
  }
  return data.data
}

export async function updateUserMe(payload) {
  const { data } = await api.put('/users/me', payload)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to update profile')
  }
  return data.data
}

export default {
  login,
  logout,
  register,
  forgotPasswordSendOtp,
  forgotPasswordSubmitToken,
  forgotPasswordChangePassword,
  emergencyContact,
  me,
  memberMe,
  updateUserMe,
  persistToken,
  loginAndPersist,
  registerAndPersist,
}
