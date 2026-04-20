import api from './api.js'

export async function getBookings(params) {
  const { data } = await api.get('/bookings', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch bookings')
  return data.data
}

export async function createBooking(payload) {
  // payload: { schedule_id: number, booking_type?: string, notes?: string }
  const { data } = await api.post('/bookings', payload)
  if (!data.success) throw new Error(data.message ?? 'Failed to create booking')
  return data.data
}

export async function joinWaitlist(schedule_id) {
  const { data } = await api.post('/waitlist', { schedule_id })
  if (!data.success) throw new Error(data.message ?? 'Failed to join waitlist')
  return data.data
}

export async function getWaitlist() {
  const { data } = await api.get('/waitlist')
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch waitlist')
  return data.data
}

export async function cancelBooking(bookingId, payload) {
  // payload: { verification: string, reason?: string }
  const { data } = await api.post(`/bookings/${bookingId}/cancel`, payload)
  if (!data.success) throw new Error(data.message ?? 'Failed to cancel booking')
  return data.data
}

export async function rescheduleBooking(bookingId, payload) {
  // payload: { new_schedule_id: number, reason: string }
  const { data } = await api.post(`/bookings/${bookingId}/reschedule`, payload)
  if (!data.success) throw new Error(data.message ?? 'Failed to reschedule booking')
  return data.data
}

export default {
  getBookings,
  createBooking,
  joinWaitlist,
  getWaitlist,
  cancelBooking,
  rescheduleBooking,
}
