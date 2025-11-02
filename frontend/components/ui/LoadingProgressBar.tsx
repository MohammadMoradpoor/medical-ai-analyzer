'use client'

import { useEffect, useRef, useState } from 'react'

interface LoadingProgressBarProps {
  variant?: 'top-bar' | 'full-page'
  message?: string
  isNavigating?: boolean
  externalProgress?: number
}

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
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
      return
    }

    if (isNavigating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      setProgress(0)
      startTimeRef.current = Date.now()
      
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        let newProgress: number
        
        if (elapsed < 200) {
          newProgress = (elapsed / 200) * 30
        } else if (elapsed < 500) {
          newProgress = 30 + ((elapsed - 200) / 300) * 30
        } else if (elapsed < 1000) {
          newProgress = 60 + ((elapsed - 500) / 500) * 15
        } else if (elapsed < 2000) {
          newProgress = 75 + ((elapsed - 1000) / 1000) * 10
        } else if (elapsed < 4000) {
          newProgress = 85 + ((elapsed - 2000) / 2000) * 7
        } else {
          const remaining = 95 - 92
          const decayFactor = Math.exp(-(elapsed - 4000) / 5000)
          newProgress = 92 + remaining * (1 - decayFactor)
        }
        
        setProgress(Math.min(newProgress, 95))
      }, 50)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setProgress(0)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isNavigating, externalProgress])

  if (variant === 'top-bar') {
    if (!isNavigating) return null

    return (
      <div 
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page loading progress"
        className="fixed top-0 left-0 right-0 z-[99999] h-1 overflow-hidden bg-transparent"
        style={{ transform: 'translateZ(0)', willChange: 'contents' }}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 transition-all duration-300 ease-out shadow-lg shadow-blue-500/30"
          style={{ width: `${progress}%`, transform: 'translateZ(0)', willChange: 'width' }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            style={{ animation: 'shimmer 1.5s infinite', transform: 'translateZ(0)' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700 font-semibold">{message}</p>
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
        </div>
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, transform: 'translateZ(0)', willChange: 'width' }}
          />
        </div>
      </div>
    </div>
  )
}

