'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Mail, Calendar, Activity, ChevronRight } from 'lucide-react'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'
import { usePageTransition } from '@/contexts/PageTransitionContext'

export default function ProfilePage() {
  const router = useRouter()
  const { startNavigation } = usePageTransition()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - مانند Report Details */}
      <div className="bg-white border-b-2 border-gray-200 shadow-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                startNavigation()
                router.push('/dashboard')
              }}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              title="Back to Dashboard"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Profile</h1>
                <p className="text-xs text-gray-500 font-medium">Manage your account</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <SettingsDropdown />
            <div className="h-8 w-px bg-gray-300"></div>
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="px-6 py-8 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Administrator</h2>
                  <p className="text-sm text-gray-600">Account created on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    Username
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium">
                    admin
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-600" />
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium">
                    admin@medical.ai
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Account Type</label>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                    Administrator
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-bold">
                    Active
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Account Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                    <div className="text-xs text-gray-600 font-semibold mb-1">Reports Uploaded</div>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-lg">
                    <div className="text-xs text-gray-600 font-semibold mb-1">Analyses Completed</div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-lg">
                    <div className="text-xs text-gray-600 font-semibold mb-1">Member Since</div>
                    <div className="text-sm font-bold text-purple-600">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

