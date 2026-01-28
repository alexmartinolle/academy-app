import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getStudentDistribution: () => api.get('/dashboard/students/distribution'),
  getRevenueTrend: (year) => api.get(`/dashboard/revenue/trend${year ? `/${year}` : ''}`),
  getPlanDistribution: () => api.get('/dashboard/plans/distribution'),
}

// Students API
export const studentsAPI = {
  getAll: (params = {}) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByStatus: (status) => api.get(`/students/status/${status}`),
  getInactive: () => api.get('/students/inactive'),
}

// Payments API
export const paymentsAPI = {
  getAll: (params = {}) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getByStudent: (studentId) => api.get(`/payments/student/${studentId}`),
  getMonthly: (year, month) => api.get(`/payments/month/${year}/${month}`),
  getRevenueStats: (year, month) => api.get(`/payments/revenue/${year}/${month}`),
  getYearlyRevenue: (year) => api.get(`/payments/revenue/year/${year}`),
}

// Plans API
export const plansAPI = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
  getByType: (type) => api.get(`/plans/type/${type}`),
}

// Statistics API (using dashboard endpoints)
export const statisticsAPI = {
  getOverview: () => api.get('/dashboard/stats'),
  getStudentStatus: () => api.get('/dashboard/students/distribution'),
  getPlanDistribution: () => api.get('/dashboard/plans/distribution'),
  getMonthlyTrend: (year) => api.get(`/dashboard/revenue/trend${year ? `/${year}` : ''}`),
  getRevenueStats: (year, month) => api.get(`/payments/revenue/${year}/${month}`),
}

export default api
