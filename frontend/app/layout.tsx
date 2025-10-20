import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Medical AI Analyzer',
  description: 'AI-powered medical test analysis and interpretation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                maxWidth: '400px',
              },
              // Success notifications
              success: {
                duration: 3000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #86efac',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              // Error notifications
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              // Loading notifications
              loading: {
                style: {
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #93c5fd',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#eff6ff',
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
