import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function usePublicNavigation() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  const navigateTo = async (path: string) => {
    // Start navigation
    setIsNavigating(true)
    setProgress(0)

    try {
      // Simulate progress (smooth animation on current page)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 50)

      // Prefetch the route (Next.js optimization)
      router.prefetch(path)

      // Wait for minimum display time (smooth UX)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Complete progress
      clearInterval(progressInterval)
      setProgress(100)

      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 100))

      // Instant navigation (no loading screen)
      router.push(path)

      // Reset after navigation
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)

    } catch (error) {
      console.error('Navigation error:', error)
      setIsNavigating(false)
      setProgress(0)
    }
  }

  return { navigateTo, isNavigating, progress }
}
