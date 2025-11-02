import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { PageTransitionProvider } from '@/contexts/PageTransitionContext'
import { ToasterProvider } from '@/components/ui/ToasterProvider'
import { PublicLoadingBar } from '@/components/ui/PublicLoadingBar'
import { PageTransitionWrapper } from '@/components/ui/PageTransitionWrapper'
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
        <PageTransitionProvider>
          <PublicLoadingBar />
          <AuthProvider>
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
            <ToasterProvider />
          </AuthProvider>
        </PageTransitionProvider>
      </body>
    </html>
  )
}
