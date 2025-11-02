import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToasterProvider } from '@/components/ui/ToasterProvider'
import { PublicLoadingBar } from '@/components/ui/PublicLoadingBar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Medical AI Analyzer',
  description: 'AI-powered medical test analysis and interpretation',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <PublicLoadingBar />
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  )
}
