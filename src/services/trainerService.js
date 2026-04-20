import api from './api.js'

export async function getTrainers(params = {}) {
  const { data } = await api.get('/trainers', { params })
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainers')
  }
  return data.data
}

export async function getTrainer(id) {
  const { data } = await api.get(`/trainers/${id}`)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainer')
  }
  return data.data
}

export async function getTrainerMe() {
  const { data } = await api.get('/trainers/me')
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainer profile')
  }
  return data.data
}

export async function getTrainerClients(id) {
  const { data } = await api.get(`/trainers/${id}/clients`)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainer clients')
  }
  return data.data
}

export async function getTrainerClientsAll(params = {}) {
  const { data } = await api.get('/trainers/clients/all', { params })
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch all trainer clients')
  }
  // Backend returns a Laravel paginator: data.data = { data: [...], current_page, total, ... }
  // Extract the items array; fall back gracefully if BE ever returns a plain array
  const payload = data.data
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

export async function getTrainerSchedules(id) {
  const { data } = await api.get(`/trainers/${id}/schedules`)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainer schedules')
  }
  return data.data
}

/** GET /api/trainers/stats — gym-wide trainer statistics (public) */
export async function getTrainerStats() {
  const { data } = await api.get('/trainers/stats')
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainer stats')
  }
  return data.data
}

/** POST /api/trainers/{trainerId}/sessions — trainer creates a new PT session */
export async function createSession(trainerId, payload) {
  // payload: { client_id, date, start_time, end_time, location, notes? }
  const { data } = await api.post(`/trainers/${trainerId}/sessions`, payload)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to create session')
  }
  return data.data
}

/** PUT /api/sessions/{id} — reschedule / update a PT session */
export async function updateSession(sessionId, payload) {
  // payload: { date?, start_time?, end_time?, location?, notes? }
  const { data } = await api.put(`/sessions/${sessionId}`, payload)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to update session')
  }
  return data.data
}

/** POST /api/sessions/{id}/cancel — cancel a PT session */
export async function cancelSession(sessionId, payload = {}) {
  // payload: { reason? }
  const { data } = await api.post(`/sessions/${sessionId}/cancel`, payload)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to cancel session')
  }
  return data.data
}

/** DELETE /api/sessions/{id} — hard-delete a session (trainer only) */
export async function deleteSession(sessionId) {
  const { data } = await api.delete(`/sessions/${sessionId}`)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to delete session')
  }
  return data.data
}

export default {
  getTrainers,
  getTrainer,
  getTrainerMe,
  getTrainerClients,
  getTrainerClientsAll,
  getTrainerSchedules,
  getTrainerStats,
  createSession,
  updateSession,
  cancelSession,
  deleteSession,
}
