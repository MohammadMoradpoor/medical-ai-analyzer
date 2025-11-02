import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePageTransition } from '@/contexts/PageTransitionContext'

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

  const easeOutCubic = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }, [])

  const calculateProgress = useCallback((elapsedTime: number): number => {
    if (elapsedTime < 200) {
      return easeOutCubic(elapsedTime / 200) * 30
    } else if (elapsedTime < 600) {
      const phase = (elapsedTime - 200) / 400
      return 30 + easeOutCubic(phase) * 40
    } else if (elapsedTime < 1200) {
      const phase = (elapsedTime - 600) / 600
      return 70 + easeOutCubic(phase) * 20
    } else {
      return 90
    }
  }, [easeOutCubic])

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

  const navigateTo = useCallback(async (path: string) => {
    if (navigationRef.current.isActive) {
      return
    }

    startNavigation()
    
    setIsNavigating(true)
    setProgress(0)
    navigationRef.current.isActive = true
    navigationRef.current.startTime = Date.now()

    try {
      router.prefetch(path)

      navigationRef.current.intervalId = setInterval(() => {
        const ref = navigationRef.current
        if (!ref.startTime || !ref.isActive) return

        const elapsed = Date.now() - ref.startTime
        const newProgress = calculateProgress(elapsed)
        
        setProgress(prev => Math.max(prev, newProgress))
      }, 16)

      await new Promise(resolve => {
        navigationRef.current.timeoutId = setTimeout(resolve, 400)
      })

      setProgress(100)
      await new Promise(resolve => setTimeout(resolve, 150))

      router.push(path)

      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
        cleanup()
      }, 300)

    } catch (error) {
      console.error('Navigation error:', error)
      setIsNavigating(false)
      setProgress(0)
      cleanup()
    }
  }, [router, calculateProgress, cleanup, startNavigation])

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
