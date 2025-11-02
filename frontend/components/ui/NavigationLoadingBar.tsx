'use client'

import { usePageTransition } from '@/contexts/PageTransitionContext'
import { LoadingProgressBar } from './LoadingProgressBar'

export function NavigationLoadingBar() {
  const { isNavigating } = usePageTransition()
  
  return <LoadingProgressBar variant="top-bar" isNavigating={isNavigating} />
}

