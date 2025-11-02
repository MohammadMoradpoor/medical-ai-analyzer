'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { usePageTransition } from '@/contexts/PageTransitionContext'

export function useNavigate() {
  const router = useRouter()
  const { startNavigation } = usePageTransition()
  
  const navigate = useCallback((path: string) => {
    startNavigation()
    router.push(path)
  }, [router, startNavigation])
  
  return navigate
}

