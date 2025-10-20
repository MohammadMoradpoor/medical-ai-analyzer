'use client'

import { Activity, Search, Bell, Settings, HelpCircle, User, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

const navigationTabs = [
  { id: 'home', label: 'Home', path: '/dashboard' },
  { id: 'patients', label: 'Patients', path: '/patients' },
  { id: 'reports', label: 'Reports', path: '/dashboard' },
  { id: 'tests', label: 'Tests', path: '/tests' },
  { id: 'analytics', label: 'Analytics', path: '/analytics' },
  { id: 'settings', label: 'Settings', path: '/settings' },
]

const settingsMenuItems = [
  { id: 'general', label: 'General Settings', path: '/settings' },
  { id: 'profile', label: 'User Profile', path: '/settings/profile' },
  { id: 'notifications', label: 'Notifications', path: '/settings/notifications' },
  { id: 'security', label: 'Security', path: '/settings/security' },
  { id: 'api', label: 'API Configuration', path: '/settings/api' },
]

export function NavigationHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Determine active tab based on pathname
    if (pathname === '/' || pathname === '/dashboard') {
      setActiveTab('home')
    } else if (pathname?.startsWith('/patients')) {
      setActiveTab('patients')
    } else if (pathname?.startsWith('/reports')) {
      setActiveTab('reports')
    } else if (pathname?.startsWith('/tests')) {
      setActiveTab('tests')
    } else if (pathname?.startsWith('/analytics')) {
      setActiveTab('analytics')
    } else if (pathname?.startsWith('/settings')) {
      setActiveTab('settings')
    }
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false)
      }
    }

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettingsDropdown])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleTabClick = (tab: typeof navigationTabs[0]) => {
    setActiveTab(tab.id)
    router.push(tab.path)
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="grid grid-cols-3 items-center px-4 py-2 bg-gray-950">
        {/* Left - Logo */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">Medical AI Analyzer</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex justify-center">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Search reports, tests, analysis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center justify-end gap-4">
          {/* System Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Auto Mode</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">System Status</span>
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Help */}
          <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsDropdownRef}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className={clsx(
                'flex items-center gap-1 p-2 rounded transition-colors',
                showSettingsDropdown || pathname?.startsWith('/settings')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              )}
            >
              <Settings className="w-5 h-5" />
              <ChevronDown className={clsx(
                'w-3 h-3 transition-transform',
                showSettingsDropdown && 'rotate-180'
              )} />
            </button>

            {showSettingsDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {settingsMenuItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowSettingsDropdown(false)
                          router.push(item.path)
                        }}
                        className={clsx(
                          'flex items-center w-full px-4 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">
            <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            <div className="text-sm">
              <div className="font-medium">User</div>
              <div className="text-xs text-blue-200">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 bg-gray-900">
        <div className="flex gap-0 overflow-x-auto">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={clsx(
                'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-white border-blue-400 bg-gray-800'
                  : 'text-gray-300 border-transparent hover:text-white hover:bg-gray-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
