'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, AlertCircle, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { reportsApi } from '@/lib/api'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  priority: string
  is_read: boolean
  created_at: string
  report_id?: string
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
    loadUnreadCount()
    
    // Auto-refresh unread count every 10 seconds
    const interval = setInterval(() => {
      loadUnreadCount()
      if (isOpen) {
        loadNotifications()
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [isOpen])

  const loadNotifications = async () => {
    try {
      const data = await reportsApi.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const data = await reportsApi.getUnreadCount()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await reportsApi.markNotificationAsRead(notification.id)
      
      // Immediately update local state
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Also refresh to get latest from server
      setTimeout(() => {
        loadNotifications()
        loadUnreadCount()
      }, 500)
    } catch (error) {
      console.error('Error marking as read:', error)
    }

    if (notification.report_id) {
      router.push(`/reports/${notification.report_id}`)
      setIsOpen(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    if (type === 'quality_issue') {
      return <AlertCircle className="h-5 w-5 text-orange-500" />
    }
        return <Info className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-4 w-4 text-gray-500" />
                  </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No notifications</p>
                <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900">{notification.title}</h4>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                        {notification.data?.quality_score && (
                          <div className="mt-2">
                            <span className={`text-xs font-bold ${
                              notification.data.quality_score >= 60 ? 'text-green-600' :
                              notification.data.quality_score >= 40 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              Quality: {notification.data.quality_score}/100
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
