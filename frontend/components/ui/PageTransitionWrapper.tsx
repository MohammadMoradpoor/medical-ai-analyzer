'use client'

import { usePageTransition } from '@/contexts/PageTransitionContext'
import { useEffect, useState, useRef } from 'react'

/**
 * PageTransitionWrapper provides smooth transitions during page navigation.
 * 
 * CRITICAL: Keeps the current page visible while the loading bar is active,
 * then instantly swaps to the new page when navigation completes.
 * 
 * This ensures:
 * - Loading bar shows on Page 1 (source page)
 * - Page 1 stays visible during navigation
 * - When ready, instantly show Page 2 without loading bar
 */
export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const { isNavigating } = usePageTransition()
  const [displayContent, setDisplayContent] = useState(children)
  const previousChildren = useRef(children)

  useEffect(() => {
    if (!isNavigating) {
      // Navigation complete - update to new page content immediately
      // No delay needed because loading bar already hid
      setDisplayContent(children)
      previousChildren.current = children
    }
    // If isNavigating is true, keep showing the old content
    // (displayContent stays as the previous page)
  }, [isNavigating, children])

  return <>{displayContent}</>
}

