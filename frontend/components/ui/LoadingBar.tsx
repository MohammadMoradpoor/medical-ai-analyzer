'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function LoadingBar() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track actual resource loading
  const trackResourceLoading = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (!navigation) return 0

    const totalDuration = navigation.loadEventEnd - navigation.fetchStart
    const currentTime = performance.now()
    const elapsed = currentTime - navigation.fetchStart

    // Calculate actual progress based on navigation timing
    if (totalDuration > 0) {
      return Math.min((elapsed / totalDuration) * 100, 95)
    }

    // Calculate based on loaded resources
    const totalResources = resources.length
    const loadedResources = resources.filter(r => r.responseEnd > 0).length
    
    if (totalResources > 0) {
      return Math.min((loadedResources / totalResources) * 90, 90)
    }

    return 0
  }, [])

  // Monitor document ready state
  const checkDocumentReady = useCallback(() => {
    const state = document.readyState
    
    switch (state) {
      case 'loading':
        return 15
      case 'interactive':
        return 50
      case 'complete':
        return 100
      default:
        return 0
    }
  }, [])

  // Track actual loading progress
  useEffect(() => {
    let mounted = true
    let animationFrame: number
    let progressInterval: NodeJS.Timeout

    const startLoading = () => {
      if (!mounted) return

      setLoading(true)
      setProgress(10) // Initial navigation started

      // Track actual progress
      const updateProgress = () => {
        if (!mounted) return

        // Get real progress from document state
        const docProgress = checkDocumentReady()
        
        // Get progress from resource loading
        const resourceProgress = trackResourceLoading()
        
        // Use the maximum of both for more accurate tracking
        const actualProgress = Math.max(docProgress, resourceProgress)
        
        setProgress(prev => {
          // Ensure progress always moves forward
          const newProgress = Math.max(prev, actualProgress)
          // Cap at 95 until fully complete
          return Math.min(newProgress, 95)
        })

        // Continue tracking if not complete
        if (actualProgress < 95) {
          animationFrame = requestAnimationFrame(updateProgress)
        }
      }

      // Start tracking immediately
      updateProgress()

      // Also use interval as backup for smoother updates
      progressInterval = setInterval(() => {
        if (document.readyState === 'complete') {
          setProgress(100)
          setTimeout(() => {
            if (mounted) {
              setLoading(false)
              setProgress(0)
            }
          }, 300)
          clearInterval(progressInterval)
        } else {
          updateProgress()
        }
      }, 100)
    }

    // Listen to actual DOM events
    const handleDOMContentLoaded = () => {
      if (mounted) setProgress(prev => Math.max(prev, 60))
    }

    const handleLoad = () => {
      if (mounted) {
        setProgress(100)
        setTimeout(() => {
          if (mounted) {
            setLoading(false)
            setProgress(0)
          }
        }, 300)
      }
    }

    // Start loading on route change
    startLoading()

    // Add event listeners for real loading events
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
    window.addEventListener('load', handleLoad)

    // Fallback: if already loaded, complete immediately
    if (document.readyState === 'complete') {
      handleLoad()
    }

    return () => {
      mounted = false
      if (animationFrame) cancelAnimationFrame(animationFrame)
      if (progressInterval) clearInterval(progressInterval)
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      window.removeEventListener('load', handleLoad)
    }
  }, [pathname, searchParams, checkDocumentReady, trackResourceLoading])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 shadow-lg shadow-indigo-500/50 transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading ? 1 : 0
        }}
      >
        {/* Animated glow effect */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/40 to-transparent animate-pulse" />
      </div>
    </div>
  )
}

