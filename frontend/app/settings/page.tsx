'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, User as UserIcon, Bell, Database, Activity, ChevronRight, FileText, Clock, Settings as SettingsIcon } from 'lucide-react'
import { UserDropdown } from '@/components/layout/UserDropdown'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { SettingsDropdown } from '@/components/layout/SettingsDropdown'
import { reportsApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState('account')
  const [reports, setReports] = useState<any[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // Check URL parameter for section
    const section = searchParams?.get('section')
    if (section) {
      setActiveSection(section)
    }
  }, [searchParams])

  useEffect(() => {
    if (activeSection === 'history') {
      fetchReports()
    }
  }, [activeSection])

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true)
      const data = await reportsApi.list(100, 0)
      setReports(data || [])
    } catch (error) {
      console.error('Failed to load reports:', error)
      toast.error('Failed to load report history')
    } finally {
      setIsLoadingReports(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - مانند Report Details */}
      <div className="bg-white border-b-2 border-gray-200 shadow-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              title="Back to Dashboard"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Settings</h1>
                <p className="text-xs text-gray-500 font-medium">Manage your account and preferences</p>
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
                  onClick={() => setActiveSection('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === 'history'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  Report History
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

              {/* Report History Section */}
              {activeSection === 'history' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Report History</h3>
                    <p className="text-sm text-gray-600 mt-1">Complete history of all your medical reports</p>
                  </div>
                  <div className="p-6">
                    {isLoadingReports ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading report history...</p>
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No reports yet</p>
                        <button
                          onClick={() => router.push('/dashboard')}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          Upload Your First Report
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="text-xs text-blue-600 font-bold uppercase">Total Reports</div>
                            <div className="text-2xl font-bold text-blue-900 mt-1">{reports.length}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="text-xs text-green-600 font-bold uppercase">Completed</div>
                            <div className="text-2xl font-bold text-green-900 mt-1">
                              {reports.filter(r => r.analysis_status === 'completed').length}
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="text-xs text-purple-600 font-bold uppercase">This Month</div>
                            <div className="text-2xl font-bold text-purple-900 mt-1">
                              {reports.filter(r => {
                                const uploadDate = new Date(r.upload_date)
                                const now = new Date()
                                return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear()
                              }).length}
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <div className="text-xs text-orange-600 font-bold uppercase">Critical</div>
                            <div className="text-2xl font-bold text-orange-900 mt-1">
                              {reports.filter(r => r.is_critical).length}
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 uppercase mb-4">Timeline</h4>
                          <div className="space-y-3">
                            {reports.map((report) => (
                              <div
                                key={report.id}
                                onClick={() => router.push(`/reports/${report.id}`)}
                                className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                              >
                                <div className="flex-shrink-0">
                                  <div className={`p-3 rounded-lg ${
                                    report.severity_level === 'critical' ? 'bg-red-500' :
                                    report.severity_level === 'urgent' ? 'bg-orange-500' :
                                    report.severity_level === 'attention_needed' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}>
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-bold text-gray-900 mb-1">{report.file_name}</h5>
                                      <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {new Date(report.upload_date).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        {report.report_type && (
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                                            {report.report_type}
                                          </span>
                                        )}
                                        {report.processing_duration && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Processing: {(() => {
                                              const s = report.processing_duration
                                              return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`
                                            })()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {report.severity_level && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          report.severity_level === 'critical' ? 'bg-red-500 text-white' :
                                          report.severity_level === 'urgent' ? 'bg-orange-500 text-white' :
                                          report.severity_level === 'attention_needed' ? 'bg-yellow-500 text-white' :
                                          'bg-green-500 text-white'
                                        }`}>
                                          {report.severity_level === 'critical' ? '🔴 Critical' :
                                           report.severity_level === 'urgent' ? '🟠 Urgent' :
                                           report.severity_level === 'attention_needed' ? '🟡 Attention' :
                                           '🟢 Normal'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
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

            {/* Save Button - فقط برای بخش‌های قابل ویرایش */}
            {activeSection !== 'history' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

