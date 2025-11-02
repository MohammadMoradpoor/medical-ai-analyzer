'use client'

import React, { createContext, useContext, useState, useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { logger } from '@/lib/logger'

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

function PageTransitionProviderInternal({ children }: { children: React.ReactNode }) {
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
      logger.debug('PageTransition: Initial mount', { path: currentPath })
      return
    }

    if (currentPath === lastPath) {
      return
    }

    const elapsed = Date.now() - navigationStartTime.current
    logger.debug('PageTransition: Completed', { from: lastPath, to: currentPath, elapsed })
    
    setIsNavigating(false)
    setLastPath(currentPath)
  }, [pathname, searchParams, lastPath])

  const startNavigation = () => {
    logger.debug('PageTransition: Started', { from: lastPath })
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

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PageTransitionProviderInternal>{children}</PageTransitionProviderInternal>
    </Suspense>
  )
}

