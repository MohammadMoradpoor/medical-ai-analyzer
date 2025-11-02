'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PageTransitionContextType {
  isTransitioning: boolean
  progress: number
  currentPage: string | null
  targetPage: string | null
  navigate: (path: string) => void
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null)

export function usePageTransition() {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider')
  }
  return context
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState<string | null>(pathname)
  const [targetPage, setTargetPage] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const navigationRef = useRef<{ resolve: () => void } | null>(null)

  // Intelligent progress calculation with realistic behavior
  const calculateRealisticProgress = useCallback((elapsed: number): number => {
    // Fast start for perceived responsiveness (0-200ms -> 0-40%)
    if (elapsed < 200) {
      const t = elapsed / 200
      return easeOutQuart(t) * 40
    }
    // Moderate pace (200-500ms -> 40-70%)
    else if (elapsed < 500) {
      const t = (elapsed - 200) / 300
      return 40 + easeOutQuart(t) * 30
    }
    // Slow down to show we're working (500-1000ms -> 70-85%)
    else if (elapsed < 1000) {
      const t = (elapsed - 500) / 500
      return 70 + easeOutCubic(t) * 15
    }
    // Crawl to maintain suspense (1000-2000ms -> 85-92%)
    else if (elapsed < 2000) {
      const t = (elapsed - 1000) / 1000
      return 85 + easeOutQuint(t) * 7
    }
    // Ultra-slow crawl for very slow connections (2000ms+ -> 92-95%)
    else {
      const t = Math.min((elapsed - 2000) / 3000, 1)
      return 92 + t * 3
    }
  }, [])

  // Easing functions for natural motion
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

  const completeTransition = useCallback(() => {
    // Cleanup intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Complete the progress bar
    setProgress(100)

    // Wait for smooth animation completion, then swap pages instantly
    setTimeout(() => {
      if (navigationRef.current) {
        navigationRef.current.resolve()
        navigationRef.current = null
      }
      
      setIsTransitioning(false)
      setProgress(0)
      setTargetPage(null)
      
      // Update current page after transition completes
      if (targetPage) {
        setCurrentPage(targetPage)
      }
    }, 200) // Reduced to 200ms for faster perceived transition
  }, [targetPage])

  const navigate = useCallback((path: string) => {
    // Don't navigate if already on the same page
    if (path === pathname) return

    // Don't allow navigation if already transitioning
    if (isTransitioning) return

    setIsTransitioning(true)
    setTargetPage(path)
    setProgress(0)

    const startTime = Date.now()

    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = calculateRealisticProgress(elapsed)
      setProgress(newProgress)
    }, 16) // 60fps

    // Create a promise that will be resolved when page is ready
    const navigationPromise = new Promise<void>((resolve) => {
      navigationRef.current = { resolve }
    })

    // Start loading the new page in background
    router.prefetch(path)
    
    // Use requestIdleCallback for better performance, fallback to setTimeout
    const scheduleNavigation = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          router.push(path)
          // Simulate page readiness detection (in real app, this would be more sophisticated)
          checkPageReady(path, navigationPromise)
        })
      } else {
        setTimeout(() => {
          router.push(path)
          checkPageReady(path, navigationPromise)
        }, 0)
      }
    }

    scheduleNavigation()

    // Minimum display time to avoid flashing (300ms)
    timerRef.current = setTimeout(() => {
      completeTransition()
    }, 300)
  }, [pathname, isTransitioning, router, calculateRealisticProgress, completeTransition])

  const checkPageReady = (path: string, promise: Promise<void>) => {
    // Wait for Next.js to finish rendering
    // Check if document is ready and images/resources are loaded
    const checkReady = () => {
      if (document.readyState === 'complete') {
        // Additional check: wait for any pending images
        const images = Array.from(document.images)
        const allImagesLoaded = images.every(img => img.complete)
        
        if (allImagesLoaded) {
          return true
        }
      }
      return false
    }

    // Poll for page readiness
    const pollInterval = setInterval(() => {
      if (checkReady()) {
        clearInterval(pollInterval)
        // Don't resolve yet - let the progress bar complete naturally
      }
    }, 50)

    // Cleanup after 5 seconds max
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 5000)
  }

  // Update current page when pathname changes externally
  useEffect(() => {
    if (!isTransitioning) {
      setCurrentPage(pathname)
    }
  }, [pathname, isTransitioning])

  const value: PageTransitionContextType = {
    isTransitioning,
    progress,
    currentPage,
    targetPage,
    navigate,
  }

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  )
}

