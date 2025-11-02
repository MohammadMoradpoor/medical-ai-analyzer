'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface PageTransitionContextType {
  isNavigating: boolean
  startNavigation: () => void
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null)

export function usePageTransition() {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider')
  }
  return context
}

/**
 * Professional page transition provider that tracks Next.js navigation state.
 * 
 * CRITICAL: The loading bar must show on the SOURCE page (before navigation),
 * never on the DESTINATION page (after navigation).
 * 
 * How it works:
 * 1. Navigation is triggered via startNavigation() BEFORE router.push()
 * 2. Loading bar shows on current page
 * 3. When pathname changes, we know navigation completed
 * 4. Hide loading bar immediately
 * 5. Show new page without loading bar
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [lastPath, setLastPath] = useState('')
  const isInitialMount = useRef(true)
  const navigationStartTime = useRef<number>(0)

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() || '')
    
    // Skip initial mount - don't show loading bar on first page load
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLastPath(currentPath)
      console.log(`[PageTransition] Initial mount: ${currentPath}`)
      return
    }

    // Skip if path hasn't actually changed
    if (currentPath === lastPath) {
      return
    }

    console.log(`[PageTransition] Pathname changed: ${lastPath} -> ${currentPath}`)
    
    // Pathname has changed = navigation completed
    // Hide loading bar immediately so it doesn't appear on the new page
    const elapsed = Date.now() - navigationStartTime.current
    console.log(`[PageTransition] Navigation completed in ${elapsed}ms`)
    
    // Update last path
    setLastPath(currentPath)
    
    // If we were navigating, complete it immediately
    if (isNavigating) {
      // Hide loading bar instantly - new page should never see it
      setIsNavigating(false)
    }
  }, [pathname, searchParams, lastPath, isNavigating])

  // Function to start navigation (must be called BEFORE router.push)
  const startNavigation = () => {
    console.log(`[PageTransition] Navigation started from: ${lastPath}`)
    navigationStartTime.current = Date.now()
    setIsNavigating(true)
  }

  const value: PageTransitionContextType = {
    isNavigating,
    startNavigation,
  }

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  )
}

