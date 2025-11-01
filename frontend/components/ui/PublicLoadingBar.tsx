'use client'

interface PublicLoadingBarProps {
  progress: number
  isNavigating: boolean
}

export function PublicLoadingBar({ progress, isNavigating }: PublicLoadingBarProps) {
  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 transition-all duration-300 ease-out shadow-lg shadow-indigo-500/50"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
