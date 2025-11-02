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

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [lastPath, setLastPath] = useState('')
  const isInitialMount = useRef(true)
  const navigationStartTime = useRef<number>(0)

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() || '')
    
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLastPath(currentPath)
      console.log(`[PageTransition] Initial mount: ${currentPath}`)
      return
    }

    if (currentPath === lastPath) {
      return
    }

    console.log(`[PageTransition] Pathname changed: ${lastPath} -> ${currentPath}`)
    
    const elapsed = Date.now() - navigationStartTime.current
    console.log(`[PageTransition] Navigation completed in ${elapsed}ms`)
    
    setIsNavigating(false)
    setLastPath(currentPath)
  }, [pathname, searchParams, lastPath])

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

