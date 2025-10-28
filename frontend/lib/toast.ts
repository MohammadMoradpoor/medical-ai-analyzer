/**
 * Modern toast notifications using Sonner
 * Provides toast.success(), toast.error(), etc.
 */

import { toast as sonnerToast } from 'sonner'

// Wrapper function that can be called directly
function toast(message: string, options?: any) {
  return sonnerToast(message, options)
}

// Add methods to the function
toast.success = (message: string, options?: any) => sonnerToast.success(message, options)
toast.error = (message: string, options?: any) => sonnerToast.error(message, options)
toast.info = (message: string, options?: any) => sonnerToast.info(message, options)
toast.loading = (message: string, options?: any) => sonnerToast.loading(message, options)
toast.promise = sonnerToast.promise
toast.dismiss = sonnerToast.dismiss
toast.message = sonnerToast.message

// Export
export { toast }
export default toast

