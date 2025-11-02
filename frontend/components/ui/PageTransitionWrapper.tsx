'use client'

import { usePageTransition } from '@/contexts/PageTransitionContext'
import { useEffect, useState, useRef } from 'react'

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const { isNavigating } = usePageTransition()
  const [displayContent, setDisplayContent] = useState(children)
  const previousChildren = useRef(children)

  useEffect(() => {
    if (!isNavigating) {
      setDisplayContent(children)
      previousChildren.current = children
    }
  }, [isNavigating, children])

  return <>{displayContent}</>
}

