'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface PublicLoadingBarProps {
  progress?: number
  isNavigating?: boolean
  minDisplayTime?: number
  height?: number
}

/**
 * Internal component that uses useSearchParams
 */
function LoadingBarInternal({ 
  progress: externalProgress, 
  isNavigating: externalNavigating,
  minDisplayTime = 300,
  height = 2
}: PublicLoadingBarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const timerRef = useRef<{
    progressInterval?: NodeJS.Timeout
    hideTimer?: NodeJS.Timeout
    startTime?: number
  }>({})

  // Use external props if provided (manual mode), otherwise auto-detect
  const actualProgress = externalProgress ?? progress
  const actualNavigating = externalNavigating ?? isNavigating

  // Intelligent progress calculation with realistic behavior
  const calculateRealisticProgress = (elapsed: number): number => {
    // Fast start for perceived responsiveness (0-150ms -> 0-35%)
    if (elapsed < 150) {
      const t = elapsed / 150
      return easeOutQuart(t) * 35
    }
    // Moderate pace (150-400ms -> 35-65%)
    else if (elapsed < 400) {
      const t = (elapsed - 150) / 250
      return 35 + easeOutQuart(t) * 30
    }
    // Slow down to show we're working (400-800ms -> 65-85%)
    else if (elapsed < 800) {
      const t = (elapsed - 400) / 400
      return 65 + easeOutCubic(t) * 20
    }
    // Crawl to maintain suspense (800-2000ms -> 85-92%)
    else if (elapsed < 2000) {
      const t = (elapsed - 800) / 1200
      return 85 + easeOutQuint(t) * 7
    }
    // Ultra-slow crawl for very slow connections (2000ms+ -> 92-95%)
    else {
      const t = Math.min((elapsed - 2000) / 3000, 1)
      return 92 + t * 3
    }
  }

  // Easing functions for natural motion
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

  // Auto-detect route changes (when not using external props)
  useEffect(() => {
    if (externalNavigating !== undefined) return // Skip if externally controlled

    // Route changed - start loading animation
    const startTime = Date.now()
    timerRef.current.startTime = startTime
    setIsVisible(true)
    setIsNavigating(true)
    setProgress(0)

    // Animate progress
    timerRef.current.progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = calculateRealisticProgress(elapsed)
      setProgress(prev => Math.max(prev, newProgress))
    }, 16) // 60fps

    // Check if page loaded quickly (< minDisplayTime)
    const checkQuickLoad = setTimeout(() => {
      if (document.readyState === 'complete') {
        completeProgress()
      }
    }, 50)

    // Auto-complete after reasonable time or on page load
    const handleLoad = () => {
      const elapsed = Date.now() - startTime
      if (elapsed < minDisplayTime) {
        // Wait for minimum display time to avoid flashing
        setTimeout(completeProgress, minDisplayTime - elapsed)
      } else {
        completeProgress()
      }
    }

    // Listen for page load completion
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      clearTimeout(checkQuickLoad)
      window.removeEventListener('load', handleLoad)
      cleanup()
    }
  }, [pathname, searchParams])

  // Handle external navigation prop changes
  useEffect(() => {
    if (externalNavigating === undefined) return

    if (externalNavigating) {
      timerRef.current.startTime = Date.now()
      setIsVisible(true)
      setIsNavigating(true)
    } else {
      completeProgress()
    }
  }, [externalNavigating, externalProgress])

  // Update progress from external prop
  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  const completeProgress = () => {
    cleanup()
    setProgress(100)
    setIsNavigating(false)

    // Smooth fade out after completion
    timerRef.current.hideTimer = setTimeout(() => {
      setIsVisible(false)
      setProgress(0)
    }, 400)
  }

  const cleanup = () => {
    if (timerRef.current.progressInterval) {
      clearInterval(timerRef.current.progressInterval)
      timerRef.current.progressInterval = undefined
    }
    if (timerRef.current.hideTimer) {
      clearTimeout(timerRef.current.hideTimer)
      timerRef.current.hideTimer = undefined
    }
  }

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
      className={`fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-transparent via-slate-200/30 dark:via-slate-700/30 to-transparent overflow-hidden transition-opacity duration-300 ease-out`}
      style={{
        height: `${height}px`,
        opacity: actualNavigating || isVisible ? 1 : 0,
      }}
    >
      {/* Main progress bar with gradient */}
      <div
        className="h-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-500 dark:via-blue-500 dark:to-cyan-500 relative shadow-lg shadow-indigo-500/50 dark:shadow-indigo-400/30 transition-all duration-500 ease-out"
        style={{ 
          width: `${actualProgress}%`,
          transform: `translateZ(0)`, // GPU acceleration
          willChange: 'width', // Hint to browser for optimization
        }}
      >
        {/* Shimmer effect overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/30 to-transparent animate-shimmer pointer-events-none"
          style={{
            transform: 'translateZ(0)',
          }}
          aria-hidden="true"
        />
        
        {/* Glow at the end */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/60 dark:from-white/40 via-white/30 dark:via-white/20 to-transparent animate-loadingPulse pointer-events-none"
          style={{
            filter: 'blur(10px)',
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
