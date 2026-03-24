import api from './api.js'

/**
 * GET /api/pt-packages
 * Returns list of available PT packages (public endpoint, no auth required)
 */
export async function getPtPackages(params = {}) {
  const { data } = await api.get('/pt-packages', { params })
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch PT packages')
  return data.data
}

/**
 * GET /api/pt-packages/{id}
 * Returns a single PT package by id
 */
export async function getPtPackage(id) {
  const { data } = await api.get(`/pt-packages/${id}`)
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch PT package')
  return data.data
}

export default { getPtPackages, getPtPackage }
