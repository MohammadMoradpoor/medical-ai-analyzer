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

/**
 * Custom Link component that integrates with the loading bar system.
 * 
 * CRITICAL: This triggers the loading bar BEFORE navigation, ensuring
 * the bar shows on the current page, not the destination page.
 * 
 * Usage:
 * ```tsx
 * import { Link } from '@/components/ui/Link'
 * 
 * <Link href="/dashboard">Go to Dashboard</Link>
 * ```
 */
export function Link({ href, children, className, onClick, ...props }: LinkProps) {
  const { startNavigation } = usePageTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow custom onClick to run first
    onClick?.(e)
    
    // If default prevented by custom onClick, don't navigate
    if (e.defaultPrevented) {
      return
    }

    // Check for modifier keys (Ctrl, Cmd, Shift) - let browser handle these normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }

    // Check for middle click or right click
    if (e.button !== 0) {
      return
    }

    // Prevent default link behavior
    e.preventDefault()

    // CRITICAL: Start navigation BEFORE router.push
    // This shows the loading bar on the CURRENT page
    startNavigation()

    // Navigate programmatically
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

