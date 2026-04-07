import api from './api.js'

export interface Gym {
  id: number
  name: string
  address?: string
}

export async function getGyms(): Promise<Gym[]> {
  const { data } = await api.get('/gyms')
  if (!data.success) throw new Error(data.message ?? 'Failed to load gyms')
  return data.data as Gym[]
}

export default { getGyms }
