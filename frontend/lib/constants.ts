export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 120000,
  DEFAULT_LIMIT: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/tiff'],
  ALLOWED_FILE_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
} as const

export const UI = {
  Z_INDEX: {
    LOADING_BAR: 99999,
    MODAL: 50,
    DROPDOWN: 50,
    CHAT_PANEL: 40,
  },
  ANIMATION: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 500,
  },
  DEBOUNCE: {
    SEARCH: 300,
    AUTO_SAVE: 1000,
  },
} as const

export const DASHBOARD = {
  AUTO_REFRESH_INTERVAL: 3000,
  DEFAULT_ITEMS_PER_PAGE: 10,
  ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
} as const

export const CHAT = {
  TTS_MAX_LENGTH: 4000,
  FAST_POLL_INTERVAL: 1000,
  FAST_POLL_MAX_COUNT: 15,
} as const

export const VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
} as const

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  URGENT: 'urgent',
  ATTENTION_NEEDED: 'attention_needed',
  NORMAL: 'normal',
} as const

export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  UPLOAD: '/upload',
} as const

