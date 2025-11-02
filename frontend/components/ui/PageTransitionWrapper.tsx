'use client'

import { usePageTransition } from '@/contexts/PageTransitionContext'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * PageTransitionWrapper keeps the current page visible while the next page loads
 * This prevents white screens and ensures smooth transitions
 */
export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const { isTransitioning, currentPage, targetPage } = usePageTransition()
  const pathname = usePathname()
  const [displayContent, setDisplayContent] = useState(children)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isTransitioning) {
      // Keep showing the current page content
      setIsVisible(true)
    } else {
      // Show new page content after transition completes
      setDisplayContent(children)
      setIsVisible(true)
    }
  }, [isTransitioning, children])

  return (
    <div
      className={`transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {isTransitioning ? displayContent : children}
    </div>
  )
}

