import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add authentication headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authApi = {
  register: async (data: {
    email: string
    username: string
    password: string
    full_name?: string
    phone?: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (credentials: { username: string; password: string }) => {
    // Send as form data for OAuth2 compatibility
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}

// Reports API
export const reportsApi = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  list: async (limit = 50, skip = 0) => {
    const response = await api.get(`/reports/list?limit=${limit}&skip=${skip}`)
    return response.data
  },

  get: async (reportId: string) => {
    const response = await api.get(`/reports/${reportId}`)
    return response.data
  },

  delete: async (reportId: string) => {
    const response = await api.delete(`/reports/${reportId}`)
    return response.data
  },

  getAgentLogs: async (reportId: string) => {
    const response = await api.get(`/reports/${reportId}/agent-logs`)
    return response.data
  },
}

export default api

