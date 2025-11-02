'use client'

import { useEffect, useRef, useState } from 'react'

interface LoadingProgressBarProps {
  variant?: 'top-bar' | 'full-page'
  message?: string
  isNavigating?: boolean
  externalProgress?: number
}

/**
 * Professional loading progress bar component with intelligent progress calculation.
 * 
 * Features:
 * - Dynamic progress algorithm (fast start, then slows down asymptotically)
 * - Two display modes: top navigation bar or full-page with message
 * - Can be controlled externally or use internal progress calculation
 * - GPU-accelerated animations
 * - Never reaches 100% until explicitly completed
 * 
 * Based on proven implementation from case management reference system.
 */
export function LoadingProgressBar({ 
  variant = 'top-bar',
  message = 'Loading...',
  isNavigating = false,
  externalProgress 
}: LoadingProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    // If external progress is provided, use it directly
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
      return
    }

    // Otherwise, calculate progress internally
    if (isNavigating) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Start from 0%
      setProgress(0)
      startTimeRef.current = Date.now()
      
      // Update progress every 50ms (20fps - smooth enough, performant)
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        
        // Dynamic progress calculation - fast at first, then slows down
        // This algorithm is proven from the reference project
        let newProgress: number
        
        if (elapsed < 200) {
          // 0-200ms: Quick start to 30%
          newProgress = (elapsed / 200) * 30
        } else if (elapsed < 500) {
          // 200-500ms: Reach 60%
          newProgress = 30 + ((elapsed - 200) / 300) * 30
        } else if (elapsed < 1000) {
          // 500-1000ms: Reach 75%
          newProgress = 60 + ((elapsed - 500) / 500) * 15
        } else if (elapsed < 2000) {
          // 1000-2000ms: Crawl to 85%
          newProgress = 75 + ((elapsed - 1000) / 1000) * 10
        } else if (elapsed < 4000) {
          // 2000-4000ms: Slowly reach 92%
          newProgress = 85 + ((elapsed - 2000) / 2000) * 7
        } else {
          // 4000ms+: Asymptotically approach 95% but never reach it
          const remaining = 95 - 92
          const decayFactor = Math.exp(-(elapsed - 4000) / 5000)
          newProgress = 92 + remaining * (1 - decayFactor)
        }
        
        setProgress(Math.min(newProgress, 95)) // Cap at 95% until explicitly completed
      }, 50)
    } else {
      // Navigation complete - jump to 100%
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setProgress(100)
      
      // Reset after animation completes
      setTimeout(() => {
        setProgress(0)
      }, 300)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isNavigating, externalProgress])

  // Top bar variant - fixed position at top of page
  if (variant === 'top-bar') {
    // Don't render if progress is 0 and not navigating
    if (progress === 0 && !isNavigating) return null

    return (
      <div 
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page loading progress"
        className="fixed top-0 left-0 right-0 z-[99999] h-1 overflow-hidden bg-transparent"
        style={{
          transform: 'translateZ(0)', // GPU acceleration
          willChange: 'contents'
        }}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 transition-all duration-300 ease-out shadow-lg shadow-blue-500/30"
          style={{ 
            width: `${progress}%`,
            transform: 'translateZ(0)', // GPU acceleration
            willChange: 'width'
          }}
        >
          {/* Shimmer effect overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            style={{
              animation: 'shimmer 1.5s infinite',
              transform: 'translateZ(0)'
            }}
          />
        </div>
      </div>
    )
  }

  // Full-page variant - centered with message
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700 font-semibold">{message}</p>
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              transform: 'translateZ(0)',
              willChange: 'width'
            }}
          />
        </div>
      </div>
    </div>
  )
}

