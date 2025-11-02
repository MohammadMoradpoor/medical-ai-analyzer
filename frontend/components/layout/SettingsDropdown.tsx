'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, ChevronDown, Shield, Bell, FileText, Activity } from 'lucide-react'
import toast from '@/lib/toast'
import { usePageTransition } from '@/contexts/PageTransitionContext'

const settingsMenuItems = [
  { id: 'account', label: 'Account Settings', icon: Shield, action: 'account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, action: 'notifications' },
  { id: 'reports', label: 'Report History', icon: FileText, action: 'reports' },
  { id: 'usage', label: 'Usage & Costs', icon: Activity, action: 'usage' },
]

export function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { startNavigation } = usePageTransition()

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

  const handleMenuClick = (action: string) => {
    startNavigation()
    
    switch (action) {
      case 'account':
        router.push('/settings?section=account')
        break
      case 'notifications':
        router.push('/settings?section=notifications')
        break
      case 'reports':
        router.push('/settings?section=history')
        break
      case 'usage':
        router.push('/settings?section=usage')
        break
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
          isOpen
            ? 'bg-gray-100'
            : 'hover:bg-gray-100'
        }`}
      >
        <Settings className="w-5 h-5 text-gray-600" />
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="py-1">
            {settingsMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.action)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

