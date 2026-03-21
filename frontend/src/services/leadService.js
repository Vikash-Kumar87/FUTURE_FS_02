import { request, requestBlob } from './apiClient'

const withParams = (path, params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value))
    }
  })

  const query = search.toString()
  return query ? `${path}?${query}` : path
}

export const leadService = {
  async initializeMode() {
    await request({ endpoint: '/health' })
  },

  async getLeads({ token, search = '', status = '', priority = '', tag = '' }) {
    const data = await request({
      endpoint: withParams('/leads', { search, status, priority, tag }),
      token,
    })

    return data?.data || []
  },

  async createLead({ token, payload }) {
    const data = await request({
      endpoint: '/leads',
      method: 'POST',
      token,
      body: payload,
    })

    return data?.data
  },

  async updateLead({ token, id, payload }) {
    const data = await request({
      endpoint: `/leads/${id}`,
      method: 'PATCH',
      token,
      body: payload,
    })

    return data?.data
  },

  async deleteLead({ token, id }) {
    await request({
      endpoint: `/leads/${id}`,
      method: 'DELETE',
      token,
    })
  },

  async uploadAttachment({ token, id, file }) {
    const formData = new FormData()
    formData.append('file', file)

    const data = await request({
      endpoint: `/leads/${id}/attachment`,
      method: 'POST',
      token,
      body: formData,
      isFormData: true,
    })

    return data?.data
  },

  async addNote({ token, id, text }) {
    const data = await request({
      endpoint: `/leads/${id}/notes`,
      method: 'POST',
      token,
      body: { text },
    })

    return data?.data
  },

  async downloadAttachment({ token, id }) {
    return requestBlob({
      endpoint: `/leads/${id}/attachment`,
      token,
    })
  },

  async exportCsv({ token }) {
    return requestBlob({
      endpoint: '/leads/export/csv',
      token,
    })
  },
}
