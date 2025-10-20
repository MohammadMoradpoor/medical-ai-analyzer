'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Activity, Shield, Zap, FileText } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            {/* Navigation */}
            <nav className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-2xl font-bold text-gray-900">
                    Medical AI Analyzer
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </nav>

            {/* Hero Content */}
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">AI-Powered Medical</span>
                  <span className="block text-blue-600">Test Analysis</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Upload your medical test reports and receive accurate, AI-powered analysis with detailed insights and recommendations.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Advanced analysis powered by artificial intelligence
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Fast Analysis</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Automated report analysis in under one minute
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Secure & Private</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Your data is completely secure and confidential
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Comprehensive Reports</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Receive detailed and easy-to-understand health reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
