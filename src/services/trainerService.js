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

export async function getTrainerClientsAll() {
  const { data } = await api.get('/trainers/clients/all')
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch all trainer clients')
  }
  return data.data
}

export async function getTrainerSchedules(id) {
  const { data } = await api.get(`/trainers/${id}/schedules`)
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to fetch trainer schedules')
  }
  return data.data
}

export default { getTrainers, getTrainer, getTrainerMe, getTrainerClients, getTrainerClientsAll, getTrainerSchedules }
