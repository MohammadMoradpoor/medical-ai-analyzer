'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { usePageTransition } from '@/contexts/PageTransitionContext'

/**
 * Custom hook for seamless page navigation with automatic loading bar.
 * 
 * CRITICAL: This hook triggers the loading bar BEFORE navigation starts,
 * ensuring the bar shows on the current page, not the destination page.
 * 
 * Usage:
 * ```tsx
 * const navigate = useNavigate()
 * navigate('/dashboard')  // Loading bar appears, then navigates
 * ```
 */
export function useNavigate() {
  const router = useRouter()
  const { startNavigation } = usePageTransition()
  
  const navigate = useCallback((path: string) => {
    // CRITICAL: Start navigation BEFORE router.push
    // This shows the loading bar on the CURRENT page
    startNavigation()
    
    // Then navigate - loading bar will hide when pathname changes
    router.push(path)
  }, [router, startNavigation])
  
  return navigate
}

