import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePageTransition } from '@/contexts/PageTransitionContext'

/**
 * Enhanced navigation hook with realistic progress tracking
 * Uses easing functions for natural-feeling progress animations
 * 
 * CRITICAL: Integrates with global loading bar to ensure bar shows
 * on current page before navigation, not on destination page.
 */
export function usePublicNavigation() {
  const router = useRouter()
  const { startNavigation } = usePageTransition()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const navigationRef = useRef<{
    intervalId?: NodeJS.Timeout
    timeoutId?: NodeJS.Timeout
    startTime?: number
    isActive: boolean
  }>({ isActive: false })

  /**
   * Easing function for natural progress curve
   * Fast at start, slows down as it approaches completion
   */
  const easeOutCubic = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }, [])

  /**
   * Calculate realistic progress based on elapsed time
   * Phases:
   * 0-200ms: Quick jump to 30% (route prefetch)
   * 200-600ms: Smooth progress to 70% (simulated data fetch)
   * 600ms+: Slow crawl to 90% (waiting for actual navigation)
   * Manual trigger: Jump to 100% (navigation complete)
   */
  const calculateProgress = useCallback((elapsedTime: number): number => {
    if (elapsedTime < 200) {
      // Fast initial progress (0 -> 30%)
      return easeOutCubic(elapsedTime / 200) * 30
    } else if (elapsedTime < 600) {
      // Steady middle progress (30% -> 70%)
      const phase = (elapsedTime - 200) / 400
      return 30 + easeOutCubic(phase) * 40
    } else if (elapsedTime < 1200) {
      // Slow final progress (70% -> 90%)
      const phase = (elapsedTime - 600) / 600
      return 70 + easeOutCubic(phase) * 20
    } else {
      // Cap at 90% until navigation completes
      return 90
    }
  }, [easeOutCubic])

  /**
   * Clean up any running timers and intervals
   */
  const cleanup = useCallback(() => {
    const ref = navigationRef.current
    if (ref.intervalId) {
      clearInterval(ref.intervalId)
      ref.intervalId = undefined
    }
    if (ref.timeoutId) {
      clearTimeout(ref.timeoutId)
      ref.timeoutId = undefined
    }
    ref.isActive = false
    ref.startTime = undefined
  }, [])

  /**
   * Navigate to a new path with smooth progress indication
   * 
   * CRITICAL: Calls startNavigation() BEFORE router.push() to ensure
   * the global loading bar shows on current page, not destination page.
   */
  const navigateTo = useCallback(async (path: string) => {
    // Prevent multiple simultaneous navigations
    if (navigationRef.current.isActive) {
      return
    }

    // CRITICAL: Start global navigation FIRST
    // This ensures the top loading bar shows on the CURRENT page
    startNavigation()

    // Initialize navigation state
    setIsNavigating(true)
    setProgress(0)
    navigationRef.current.isActive = true
    navigationRef.current.startTime = Date.now()

    try {
      // Prefetch the route for faster navigation
      router.prefetch(path)

      // Start progress animation
      navigationRef.current.intervalId = setInterval(() => {
        const ref = navigationRef.current
        if (!ref.startTime || !ref.isActive) return

        const elapsed = Date.now() - ref.startTime
        const newProgress = calculateProgress(elapsed)
        
        setProgress(prev => {
          // Ensure progress always moves forward
          return Math.max(prev, newProgress)
        })
      }, 16) // ~60fps for smooth animation

      // Wait for minimum display time for better UX
      // Users should see the progress bar for at least this duration
      await new Promise(resolve => {
        navigationRef.current.timeoutId = setTimeout(resolve, 400)
      })

      // Complete progress to 100%
      setProgress(100)

      // Brief pause to show completion
      await new Promise(resolve => setTimeout(resolve, 150))

      // Perform the actual navigation
      // Global loading bar will hide automatically when pathname changes
      router.push(path)

      // Reset state after navigation with smooth fade out
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
        cleanup()
      }, 300)

    } catch (error) {
      console.error('Navigation error:', error)
      // Immediate cleanup on error
      setIsNavigating(false)
      setProgress(0)
      cleanup()
    }
  }, [router, calculateProgress, cleanup, startNavigation])

  /**
   * Cancel ongoing navigation (useful for fast successive clicks)
   */
  const cancelNavigation = useCallback(() => {
    setIsNavigating(false)
    setProgress(0)
    cleanup()
  }, [cleanup])

  return { 
    navigateTo, 
    cancelNavigation,
    isNavigating, 
    progress 
  }
}
