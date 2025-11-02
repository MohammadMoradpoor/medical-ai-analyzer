'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings as SettingsIcon, ChevronDown, Activity } from 'lucide-react'
import toast from '@/lib/toast'

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigateTo = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    toast.success('Logged out successfully')
    router.push('/login')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isOpen
            ? 'bg-gray-100'
            : 'hover:bg-gray-100'
        }`}
      >
        {/* User Avatar */}
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900">User</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* User Details */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">User Account</p>
                <p className="text-xs text-gray-500">user@medical.ai</p>
                <p className="text-xs text-gray-400 mt-1">Admin</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => navigateTo('/profile')}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => navigateTo('/settings')}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => navigateTo('/dashboard')}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* User Stats */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Account Type</p>
                <p className="font-medium text-gray-700">Admin</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="font-medium text-green-700">Active</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

