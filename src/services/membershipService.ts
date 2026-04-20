import api from './api.js'

export async function getMemberships(params: Record<string, unknown> = {}) {
  const { data } = await api.get('/memberships', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to load memberships')
  return data.data
}

export async function getMembership(id: string | number) {
  const { data } = await api.get(`/memberships/${id}`)
  if (!data.success) throw new Error(data.message ?? 'Failed to load membership')
  return data.data
}

export async function checkPossibleSchedule(membershipId: number | string) {
  const { data } = await api.get(`/check-possible-schedule/${membershipId}`)
  if (!data.success) throw new Error(data.message ?? 'Failed to check schedule')
  return data.data as { status: boolean; membership_end_at?: string }
}

export default { getMemberships, getMembership, checkPossibleSchedule }
