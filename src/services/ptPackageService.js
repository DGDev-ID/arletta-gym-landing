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

/**
 * GET /api/members/me/pt-packages
 * Returns purchased PT packages for the current member (auth required)
 */
export async function getMemberPtPackages() {
  const { data } = await api.get('/members/me/pt-packages')
  if (!data.success) throw new Error(data.message ?? 'Failed to fetch your PT packages')
  return data.data
}

/**
 * POST /api/members/me/pt-packages/plot-trainer
 * Assign a trainer to a purchased PT package
 */
export async function plotTrainer(payload) {
  const { data } = await api.post('/members/me/pt-packages/plot-trainer', payload)
  if (!data.success) throw new Error(data.message ?? 'Failed to assign trainer')
  return data.data
}

export default { getPtPackages, getPtPackage, getMemberPtPackages, plotTrainer }
