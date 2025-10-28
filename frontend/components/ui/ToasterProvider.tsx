'use client'

import { Toaster } from 'sonner'

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      expand={false}
      duration={4000}
      toastOptions={{
        style: {
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        className: 'sonner-toast',
      }}
    />
  )
}

