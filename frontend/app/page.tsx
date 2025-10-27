'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/Loading'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // Redirect to login
      router.push('/login')
    }
  }, [router])

  // Loading state
  return <Loading fullScreen message="Loading..." />
}
