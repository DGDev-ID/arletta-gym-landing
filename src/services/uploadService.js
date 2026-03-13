import api from './api.js'

/**
 * Upload a single file to the server using multipart/form-data.
 * Returns the API response data.data which is expected to contain the file URL/path.
 */
export async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)

  const { data } = await api.post('/uploads', form, {
    headers: {
      // Let axios set the proper multipart boundary
      'Content-Type': 'multipart/form-data',
    },
  })

  if (!data.success) {
    throw new Error(data.message ?? 'Upload failed')
  }

  return data.data
}

export default { uploadFile }
