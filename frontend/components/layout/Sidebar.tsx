'use client'

import { Home, Upload, FileText, BarChart3, Settings, Users } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'
import { usePageTransition } from '@/contexts/PageTransitionContext'

const menuItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { startNavigation } = usePageTransition()

  return (
    <div className="w-64 bg-gray-900 text-white flex-shrink-0 border-r border-gray-800">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/')
          const Icon = item.icon
          
          return (
            <button
              key={item.path}
              onClick={() => {
                startNavigation()
                router.push(item.path)
              }}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

