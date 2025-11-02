'use client'

import { usePageTransition } from '@/contexts/PageTransitionContext'

/**
 * Custom hook for seamless page navigation with progress bar
 * 
 * Usage:
 * ```tsx
 * const navigate = useNavigate()
 * navigate('/dashboard')
 * ```
 */
export function useNavigate() {
  const { navigate } = usePageTransition()
  return navigate
}

