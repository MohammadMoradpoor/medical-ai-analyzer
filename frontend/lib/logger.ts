import { ENV } from './env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isProduction = ENV.IS_PRODUCTION

  private log(level: LogLevel, message: string, data?: any) {
    if (this.isProduction && level === 'debug') {
      return
    }

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'error':
        console.error(prefix, message, data || '')
        break
      case 'warn':
        console.warn(prefix, message, data || '')
        break
      case 'info':
      case 'debug':
        if (!this.isProduction) {
          console.log(prefix, message, data || '')
        }
        break
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: any) {
    this.log('error', message, error)
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }
}

export const logger = new Logger()

