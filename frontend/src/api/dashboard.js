import api from './axios'

export const getDashboardSummary = () => api.get('/v1/dashboard/summary')
export const getDashboardTrends = () => api.get('/v1/dashboard/monthly-summary')
export const getDashboardByCategory = () => api.get('/v1/dashboard/category-summary')
