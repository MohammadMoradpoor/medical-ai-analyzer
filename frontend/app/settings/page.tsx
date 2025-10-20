'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, User as UserIcon, Bell, Database, Activity } from 'lucide-react'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('account')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medical AI Analyzer</h1>
              <p className="text-xs text-gray-500">Settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
            >
              ← Back to Dashboard
            </button>
            <NotificationDropdown />
            <SettingsDropdown />
            <div className="h-8 w-px bg-gray-300 mx-1"></div>
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
            <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <div className="col-span-3">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('account')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'account'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  Account
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'security'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  Security
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'notifications'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveSection('data')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'data'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Database className="h-5 w-5" />
                  Data & Privacy
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="col-span-9">
              {/* Account Section */}
              {activeSection === 'account' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Account Information</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your account details and preferences</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                        admin
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                        admin@medical.ai
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Account Type</label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                          Administrator
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toast('Password change functionality coming soon')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your security and authentication settings</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Data Encryption</div>
                        <div className="text-xs text-gray-600 mt-0.5">All data is encrypted at rest using AES-256</div>
                      </div>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold">
                        Enabled
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">JWT Authentication</div>
                        <div className="text-xs text-gray-600 mt-0.5">Secure token-based authentication</div>
                      </div>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Two-Factor Authentication</div>
                        <div className="text-xs text-gray-600 mt-0.5">Add an extra layer of security to your account</div>
                      </div>
                      <button
                        onClick={() => toast('2FA setup coming soon')}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                      >
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                    <p className="text-sm text-gray-600 mt-1">Choose how you want to be notified</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Analysis Complete</div>
                        <div className="text-xs text-gray-600 mt-0.5">Get notified when report analysis is complete</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Critical Findings</div>
                        <div className="text-xs text-gray-600 mt-0.5">Alert me when critical findings are detected</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">System Updates</div>
                        <div className="text-xs text-gray-600 mt-0.5">Receive notifications about system updates</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Privacy Section */}
              {activeSection === 'data' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Data & Privacy</h3>
                    <p className="text-sm text-gray-600 mt-1">Control how your data is stored and managed</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Auto-delete old reports</div>
                        <div className="text-xs text-gray-600 mt-0.5">Automatically delete reports older than 1 year</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Share usage data</div>
                        <div className="text-xs text-gray-600 mt-0.5">Help improve the application by sharing anonymous usage data</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-2">Data Export</div>
                      <p className="text-xs text-blue-800 mb-3">Download all your medical reports and analysis data</p>
                      <button
                        onClick={() => toast('Data export functionality coming soon')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        Export My Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="col-span-9">
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Settings saved successfully!')
                    setTimeout(() => router.push('/dashboard'), 1000)
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

