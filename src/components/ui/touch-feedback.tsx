'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Haptic feedback for supported devices
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20])
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 10, 50, 10, 50])
    }
  }
}

// Touch-optimized button with visual and haptic feedback
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  haptic?: keyof typeof hapticFeedback | false
  ripple?: boolean
}

export function TouchButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  haptic = 'light',
  ripple = true,
  onClick,
  disabled,
  ...props
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([])

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    default: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return
    
    setIsPressed(true)
    
    if (haptic) {
      hapticFeedback[haptic]()
    }

    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      const rippleId = `ripple-${Date.now()}`
      setRipples(prev => [...prev, { id: rippleId, x, y }])
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId))
      }, 600)
    }

    props.onTouchStart?.(e)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(false)
    props.onTouchEnd?.(e)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onClick?.(e)
    }
  }

  return (
    <button
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center rounded-md font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-150',
        'touch-manipulation select-none overflow-hidden',
        // Touch feedback
        isPressed && !disabled && 'scale-95 brightness-95',
        // Variant and size classes
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="block w-0 h-0 rounded-full bg-white/30 animate-ping" 
                style={{ animationDuration: '0.6s' }} />
        </span>
      ))}
    </button>
  )
}

// Touch-optimized slider component
interface TouchSliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
  haptic?: boolean
}

export function TouchSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  haptic = true
}: TouchSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [lastHapticValue, setLastHapticValue] = useState(value)

  const handleValue = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newValue = min + (max - min) * percentage
    const steppedValue = Math.round(newValue / step) * step
    
    onChange(Math.max(min, Math.min(max, steppedValue)))
    
    // Haptic feedback on value change
    if (haptic && Math.abs(steppedValue - lastHapticValue) >= step) {
      hapticFeedback.light()
      setLastHapticValue(steppedValue)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    handleValue(e.touches[0].clientX, e.currentTarget as HTMLElement)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleValue(e.touches[0].clientX, e.currentTarget as HTMLElement)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div
      className={cn(
        'relative h-12 flex items-center touch-manipulation',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Track */}
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        {/* Progress */}
        <div
          className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-lg',
            'transform -translate-y-1/2 transition-all duration-150',
            isDragging && 'scale-125 shadow-xl'
          )}
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
    </div>
  )
}

// Touch-optimized swipe container
interface SwipeContainerProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function SwipeContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className
}: SwipeContainerProps) {
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setStartPoint({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startPoint) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startPoint.x
    const deltaY = touch.clientY - startPoint.y

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine swipe direction
    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.()
          hapticFeedback.light()
        } else {
          onSwipeLeft?.()
          hapticFeedback.light()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
          hapticFeedback.light()
        } else {
          onSwipeUp?.()
          hapticFeedback.light()
        }
      }
    }

    setStartPoint(null)
  }

  return (
    <div
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// Touch-optimized long press component
interface LongPressProps {
  children: React.ReactNode
  onLongPress: () => void
  delay?: number
  className?: string
}

export function LongPress({
  children,
  onLongPress,
  delay = 500,
  className
}: LongPressProps) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleTouchStart = () => {
    setIsPressed(true)
    timeoutRef.current = setTimeout(() => {
      onLongPress()
      hapticFeedback.medium()
      setIsPressed(false)
    }, delay)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        'touch-manipulation select-none transition-transform duration-150',
        isPressed && 'scale-95',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  )
}