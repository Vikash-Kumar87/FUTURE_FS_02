import { API_BASE_URL } from '../utils/constants'

const normalizeApiErrorMessage = ({ status, message }) => {
  const text = String(message || '').toLowerCase()

  if (status === 401) {
    return 'Session expired or invalid. Please login again.'
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (text.includes('firebase_project_id is missing')) {
    return 'Authentication configuration is missing on backend. Set FIREBASE_PROJECT_ID in backend/.env.'
  }

  return message || 'Request failed'
}

export const request = async ({
  endpoint,
  method = 'GET',
  token,
  body,
  isFormData = false,
}) => {
  const headers = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(
      normalizeApiErrorMessage({
        status: response.status,
        message: payload.message,
      }),
    )
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const requestBlob = async ({ endpoint, method = 'GET', token }) => {
  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(
      normalizeApiErrorMessage({
        status: response.status,
        message: payload.message,
      }),
    )
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') || ''
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)

  return {
    blob,
    fileName: filenameMatch?.[1] || 'attachment',
  }
}
