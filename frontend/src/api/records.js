import api from './axios'

export const getRecords = (params) => api.get('/v1/records', { params })
export const createRecord = (data) => api.post('/v1/records', data)
export const updateRecord = (id, data) => api.put(`/v1/records/${id}`, data)
export const deleteRecord = (id) => api.delete(`/v1/records/${id}`)
