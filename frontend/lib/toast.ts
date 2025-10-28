/**
 * Modern toast notifications using Sonner
 * Provides toast.success(), toast.error(), etc.
 */

import { toast as sonnerToast } from 'sonner'

const toastFn = (message: string, options?: any) => sonnerToast(message, options)

export const toast = Object.assign(toastFn, {
  success: (message: string, options?: any) => sonnerToast.success(message, options),
  error: (message: string, options?: any) => sonnerToast.error(message, options),
  info: (message: string, options?: any) => sonnerToast.info(message, options),
  loading: (message: string, options?: any) => sonnerToast.loading(message, options),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  message: sonnerToast.message,
})

// Default export for compatibility
export default toast

