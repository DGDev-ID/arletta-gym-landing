import { api } from './api.js'

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile including membership info.
 */
export async function getProfile() {
  const { data } = await api.get('/api/auth/me')
  if (!data.success) throw new Error(data.message ?? 'Failed to load profile')
  return data.data
}

/**
 * GET /api/bookings?status=confirmed
 * Returns the authenticated user's upcoming (confirmed) bookings.
 */
export async function getBookings(status = 'confirmed') {
  const params = status ? { status } : {}
  const { data } = await api.get('/api/bookings', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to load bookings')
  return data.data
}

export default { getProfile, getBookings }
