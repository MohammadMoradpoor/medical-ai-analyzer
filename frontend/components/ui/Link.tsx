'use client'

import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { usePageTransition } from '@/contexts/PageTransitionContext'
import { useRouter } from 'next/navigation'

interface LinkProps extends Omit<NextLinkProps, 'href'> {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export function Link({ href, children, className, onClick, ...props }: LinkProps) {
  const { startNavigation } = usePageTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    
    if (e.defaultPrevented) {
      return
    }

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }

    if (e.button !== 0) {
      return
    }

    e.preventDefault()
    startNavigation()
    router.push(href)
  }

  return (
    <NextLink 
      href={href} 
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </NextLink>
  )
}

