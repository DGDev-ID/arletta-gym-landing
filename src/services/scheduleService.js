import api from './api.js'

export async function getSchedules(params) {
  const { data } = await api.get('/schedules', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch schedules')
  return data.data
}

export async function getClasses(params) {
  const { data } = await api.get('/classes', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch classes')
  return data.data
}

export async function getClassCategories() {
  const { data } = await api.get('/class-categories')
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch class categories')
  return data.data
}

export default { getSchedules, getClasses, getClassCategories }
