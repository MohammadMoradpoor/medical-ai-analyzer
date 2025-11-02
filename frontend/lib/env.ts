function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value
}

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const

export function validateEnv() {
  if (ENV.IS_PRODUCTION && ENV.API_URL.includes('localhost')) {
    console.warn('⚠️  WARNING: Production build using localhost API URL')
  }
}

if (typeof window === 'undefined') {
  validateEnv()
}

