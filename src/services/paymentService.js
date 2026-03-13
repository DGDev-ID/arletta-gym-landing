import api from './api.js'

export async function createSignature(payload) {
  // payload: { signature: string (base64), membership_plan_id?: number }
  const { data } = await api.post('/signatures', payload)
  if (!data.success) throw new Error(data.message ?? 'Failed to create signature')
  return data.data
}

export async function createPayment(payload) {
  // payload: { membership_plan_id?: number, method?: string, amount?: number, signature_id?: number }
  const { data } = await api.post('/payments/create', payload)
  if (!data.success) throw new Error(data.message ?? 'Failed to create payment')
  return data.data
}

export default { createSignature, createPayment }
