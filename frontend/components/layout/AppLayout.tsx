'use client'

import { ReactNode } from 'react'
import { NavigationHeader } from './NavigationHeader'
import { Sidebar } from './Sidebar'
import { QuickActionBar } from './QuickActionBar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <div className="flex-shrink-0">
        <NavigationHeader />
      </div>
      
      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex-shrink-0">
        <QuickActionBar />
      </div>
    </div>
  )
}

