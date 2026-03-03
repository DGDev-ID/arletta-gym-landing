import api from './api.js'

export async function getMemberships(params = {}) {
  const { data } = await api.get('/api/memberships', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to load memberships')
  return data.data
}

export async function getMembership(id) {
  const { data } = await api.get(`/api/memberships/${id}`)
  if (!data.success) throw new Error(data.message ?? 'Failed to load membership')
  return data.data
}

export default { getMemberships, getMembership }
