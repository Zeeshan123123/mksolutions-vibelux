'use client'

import { useEffect } from 'react'

interface MobileLayoutWrapperProps {
  children: React.ReactNode
}

export function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  useEffect(() => {
    // Set CSS custom properties for viewport height handling
    function setViewportHeight() {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      document.documentElement.style.setProperty('--real-vh', `${vh}px`)
    }

    // Set initial viewport height
    setViewportHeight()

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100) // Delay for iOS
    })

    // Prevent zoom on double tap
    let lastTouchEnd = 0
    document.addEventListener('touchend', function (event) {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)

    // Improve scroll performance
    document.body.style.overscrollBehaviorY = 'none'

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])

  return (
    <div className="mobile-container min-h-screen-safe">
      {children}
    </div>
  )
}