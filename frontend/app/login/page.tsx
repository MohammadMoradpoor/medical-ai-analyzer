'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    username?: string
    password?: string
    general?: string
  }>({})
  const [touched, setTouched] = useState<{
    username?: boolean
    password?: boolean
  }>({})
  const [shakeError, setShakeError] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {}
    
    if (touched.username && !username) {
      newErrors.username = 'Username is required'
    } else if (touched.username && username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    
    if (touched.password && !password) {
      newErrors.password = 'Password is required'
    } else if (touched.password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
  }, [username, password, touched])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({ username: true, password: true })
    
    // Validate
    if (!username || !password) {
      setErrors({
        general: 'Please fill in all fields'
      })
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }
    
    if (username.length < 3) {
      setErrors({ username: 'Username must be at least 3 characters' })
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }
    
    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }
    
    setIsLoading(true)
    setErrors({})

    try {
      await login(username, password)
      toast.success('Successfully logged in!', {
        icon: '🎉',
        duration: 2000
      })
      router.push('/dashboard')
    } catch (error: any) {
      let errorMsg = 'Login failed. Please check your credentials.'
      
      if (error?.response?.status === 401) {
        errorMsg = 'Incorrect username or password'
      } else if (error?.response?.status === 403) {
        errorMsg = 'Your account has been deactivated'
      } else if (error?.response?.data?.detail) {
        const detail = error.response.data.detail
        errorMsg = typeof detail === 'string' ? detail : 'Invalid credentials'
      } else if (error?.message?.includes('Network Error')) {
        errorMsg = 'Unable to connect to server. Please check your connection.'
      } else if (error?.message) {
        errorMsg = error.message
      }
      
      setErrors({ general: errorMsg })
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleBlur = (field: 'username' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className={`max-w-md w-full space-y-8 ${shakeError ? 'animate-shake' : ''}`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 rounded-2xl p-3 shadow-lg">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              create a new account
            </button>
          </p>
        </div>

        {/* General Error Alert */}
        {errors.general && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-slideDown">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  Authentication Failed
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {errors.general}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white shadow-xl rounded-2xl p-8" onSubmit={handleSubmit} method="POST" action="#">
          <input type="hidden" name="prevent-autofill" />
          
          <div className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors ${
                    errors.username ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }))
                  }}
                  onBlur={() => handleBlur('username')}
                  disabled={isLoading}
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border ${
                    errors.username 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter your username"
                />
                {touched.username && !errors.username && username.length >= 3 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-slideDown">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${
                    errors.password ? 'text-red-400' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }))
                  }}
                  onBlur={() => handleBlur('password')}
                  disabled={isLoading}
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-12 py-3 border ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors disabled:cursor-not-allowed"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-slideDown">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !!errors.username || !!errors.password}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Additional Options */}
          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => toast.info('Contact admin to reset password')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </form>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure login powered by{' '}
            <span className="font-semibold text-gray-700">Medical AI Analyzer</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
