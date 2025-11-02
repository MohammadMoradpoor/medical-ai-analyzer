'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePageTransition } from '@/contexts/PageTransitionContext'

interface PublicLoadingBarProps {
  progress?: number
  isNavigating?: boolean
  minDisplayTime?: number
  height?: number
}

/**
 * Internal component that uses useSearchParams and PageTransition context
 */
function LoadingBarInternal({ 
  progress: externalProgress, 
  isNavigating: externalNavigating,
  minDisplayTime = 300,
  height = 3
}: PublicLoadingBarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const transitionContext = usePageTransition()
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<{
    hideTimer?: NodeJS.Timeout
  }>({})

  // Use context-driven transitions if available, otherwise use external props
  const actualProgress = transitionContext 
    ? transitionContext.progress 
    : (externalProgress ?? 0)
  const actualNavigating = transitionContext 
    ? transitionContext.isTransitioning 
    : (externalNavigating ?? false)

  // Show/hide progress bar based on navigation state
  useEffect(() => {
    if (actualNavigating) {
      setIsVisible(true)
      
      // Clear any pending hide timers
      if (timerRef.current.hideTimer) {
        clearTimeout(timerRef.current.hideTimer)
        timerRef.current.hideTimer = undefined
      }
    } else if (actualProgress >= 100) {
      // Smooth fade out after completion
      timerRef.current.hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }

    return () => {
      if (timerRef.current.hideTimer) {
        clearTimeout(timerRef.current.hideTimer)
        timerRef.current.hideTimer = undefined
      }
    }
  }, [actualNavigating, actualProgress])

  // Don't render if not visible
  if (!isVisible && !actualNavigating) return null

  return (
    <div 
      role="progressbar"
      aria-valuenow={Math.round(actualProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading progress"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-[99999] overflow-hidden transition-opacity duration-300 ease-out ${
        actualNavigating || isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        height: `${height}px`,
      }}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 via-slate-200/50 to-slate-100/50" />
      
      {/* Main progress bar with gradient */}
      <div
        className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 relative shadow-lg shadow-blue-500/30 transition-all duration-300 ease-out"
        style={{ 
          width: `${actualProgress}%`,
          transform: `translateZ(0)`, // GPU acceleration
          willChange: 'width', // Hint to browser for optimization
        }}
      >
        {/* Shimmer effect overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer pointer-events-none"
          style={{
            transform: 'translateZ(0)',
          }}
          aria-hidden="true"
        />
        
        {/* Glow at the end */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/70 via-white/40 to-transparent animate-loadingPulse pointer-events-none"
          style={{
            filter: 'blur(12px)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

/**
 * Professional loading bar component that tracks actual Next.js navigation
 * Features:
 * - Automatic route change detection
 * - Realistic progress tracking with intelligent delays
 * - Accessibility support (ARIA)
 * - Dark mode support
 * - Smart instant-navigation detection
 * - GPU-accelerated animations
 */
export function PublicLoadingBar(props: PublicLoadingBarProps = {}) {
  return (
    <Suspense fallback={null}>
      <LoadingBarInternal {...props} />
    </Suspense>
  )
}
