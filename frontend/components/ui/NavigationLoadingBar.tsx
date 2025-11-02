'use client'

import { usePageTransition } from '@/contexts/PageTransitionContext'
import { LoadingProgressBar } from './LoadingProgressBar'

/**
 * Navigation loading bar that connects to PageTransitionContext.
 * Displays the loading progress bar at the top of the page during navigation.
 * 
 * This component should be placed in the root layout to work across all pages.
 */
export function NavigationLoadingBar() {
  const { isNavigating } = usePageTransition()
  
  return (
    <LoadingProgressBar 
      variant="top-bar"
      isNavigating={isNavigating}
    />
  )
}

