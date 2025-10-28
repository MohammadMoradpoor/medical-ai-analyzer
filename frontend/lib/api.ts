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
  upload: async (file: File, userNotes?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (userNotes) {
      formData.append('user_notes', userNotes)
    }
    
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

  downloadPDF: async (reportId: string) => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/${reportId}/download-pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to download PDF')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medical_report_${reportId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  getAgentLogs: async (reportId: string) => {
    const response = await api.get(`/reports/${reportId}/agent-logs`)
    return response.data
  },

  updateExtractedData: async (reportId: string, extractedData: any) => {
    const response = await api.put(`/reports/${reportId}/extracted-data`, extractedData)
    return response.data
  },

  reprocess: async (reportId: string) => {
    const response = await api.post(`/reports/${reportId}/reprocess`)
    return response.data
  },

  getUsageStats: async () => {
    const response = await api.get('/reports/usage-stats')
    return response.data
  },

  // Chat API
  sendChatMessage: async (reportId: string, question: string, conversationId?: string) => {
    const response = await api.post(`/reports/${reportId}/chat`, {
      question,
      conversation_id: conversationId
    })
    return response.data
  },

  getChatHistory: async (reportId: string, conversationId?: string) => {
    const params = conversationId ? `?conversation_id=${conversationId}` : ''
    const response = await api.get(`/reports/${reportId}/chat/history${params}`)
    return response.data
  },

  getSuggestedQuestions: async (reportId: string) => {
    const response = await api.get(`/reports/${reportId}/chat/suggested-questions`)
    return response.data
  },

  clearChatHistory: async (reportId: string, conversationId?: string) => {
    const params = conversationId ? `?conversation_id=${encodeURIComponent(conversationId)}` : ''
    console.log('[API] Deleting chat history with params:', params)
    const response = await api.delete(`/reports/${reportId}/chat${params}`)
    console.log('[API] Delete response:', response.data)
    return response.data
  },

  getChatStats: async (reportId: string) => {
    const response = await api.get(`/reports/${reportId}/chat/stats`)
    return response.data
  },

  submitChatFeedback: async (reportId: string, messageId: string, isHelpful: boolean) => {
    const response = await api.post(`/reports/${reportId}/chat/${messageId}/feedback`, {
      is_helpful: isHelpful
    })
    return response.data
  },

  // Real-time streaming chat responses
  sendChatMessageStreaming: async (
    reportId: string, 
    question: string, 
    conversationId?: string,
    onChunk?: (chunk: string) => void,
    onComplete?: (messageId: string) => void,
    onError?: (error: string) => void
  ) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question,
          conversation_id: conversationId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6))
            
            if (data.type === 'content' && onChunk) {
              onChunk(data.content)
            } else if (data.type === 'message_id' && onComplete) {
              onComplete(data.message_id)
            } else if (data.type === 'error' && onError) {
              onError(data.error)
            }
          }
        }
      }
    } catch (error: any) {
      if (onError) {
        onError(error.message || 'Streaming failed')
      }
      throw error
    }
  },
}

export default api

