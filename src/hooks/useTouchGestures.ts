'use client'

import { useRef, useCallback, useEffect } from 'react'

interface TouchPoint {
  x: number
  y: number
  id: number
}

interface GestureCallbacks {
  onTap?: (point: TouchPoint) => void
  onDoubleTap?: (point: TouchPoint) => void
  onLongPress?: (point: TouchPoint) => void
  onPan?: (delta: { x: number; y: number }, point: TouchPoint) => void
  onPinch?: (scale: number, center: TouchPoint) => void
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void
}

interface TouchGestureOptions {
  doubleTapDelay?: number
  longPressDelay?: number
  swipeThreshold?: number
  pinchThreshold?: number
  preventDefault?: boolean
}

export function useTouchGestures(
  callbacks: GestureCallbacks,
  options: TouchGestureOptions = {}
) {
  const {
    doubleTapDelay = 300,
    longPressDelay = 500,
    swipeThreshold = 50,
    pinchThreshold = 10,
    preventDefault = true
  } = options

  const touchStartRef = useRef<TouchPoint[]>([])
  const lastTapRef = useRef<{ time: number; point: TouchPoint } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialDistanceRef = useRef<number>(0)
  const initialCenterRef = useRef<TouchPoint | null>(null)
  const isDraggingRef = useRef(false)
  const startTimeRef = useRef(0)

  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    id: touch.identifier
  })

  const getDistance = (p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getCenter = (p1: TouchPoint, p2: TouchPoint): TouchPoint => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    id: -1
  })

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    const touches = Array.from(e.touches).map(getTouchPoint)
    touchStartRef.current = touches
    startTimeRef.current = Date.now()
    isDraggingRef.current = false

    // Single touch - potential tap or long press
    if (touches.length === 1) {
      const point = touches[0]
      
      // Set up long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (!isDraggingRef.current) {
          callbacks.onLongPress?.(point)
        }
      }, longPressDelay)
    }

    // Two touches - potential pinch
    if (touches.length === 2) {
      clearLongPressTimer()
      const [p1, p2] = touches
      initialDistanceRef.current = getDistance(p1, p2)
      initialCenterRef.current = getCenter(p1, p2)
    }
  }, [callbacks, preventDefault, longPressDelay])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    const touches = Array.from(e.touches).map(getTouchPoint)
    const startTouches = touchStartRef.current

    if (touches.length === 1 && startTouches.length === 1) {
      // Single touch pan
      const currentTouch = touches[0]
      const startTouch = startTouches[0]
      const delta = {
        x: currentTouch.x - startTouch.x,
        y: currentTouch.y - startTouch.y
      }

      // Check if we've moved enough to consider this a drag
      const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y)
      if (distance > 5) {
        isDraggingRef.current = true
        clearLongPressTimer()
        callbacks.onPan?.(delta, currentTouch)
      }
    }

    if (touches.length === 2 && startTouches.length === 2) {
      // Two touch pinch
      const [p1, p2] = touches
      const currentDistance = getDistance(p1, p2)
      const currentCenter = getCenter(p1, p2)

      if (initialDistanceRef.current > 0) {
        const scale = currentDistance / initialDistanceRef.current
        
        // Only trigger pinch if scale change is significant
        if (Math.abs(scale - 1) > 0.1) {
          callbacks.onPinch?.(scale, currentCenter)
        }
      }
    }
  }, [callbacks, preventDefault])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    const endTime = Date.now()
    const duration = endTime - startTimeRef.current
    const touches = Array.from(e.changedTouches).map(getTouchPoint)
    const startTouches = touchStartRef.current

    clearLongPressTimer()

    // Single touch ended
    if (touches.length === 1 && startTouches.length === 1 && !isDraggingRef.current) {
      const endTouch = touches[0]
      const startTouch = startTouches[0]
      const distance = Math.sqrt(
        Math.pow(endTouch.x - startTouch.x, 2) + 
        Math.pow(endTouch.y - startTouch.y, 2)
      )

      // Check for swipe gesture
      if (duration < 300 && distance > swipeThreshold) {
        const deltaX = endTouch.x - startTouch.x
        const deltaY = endTouch.y - startTouch.y
        const velocity = distance / duration

        let direction: 'up' | 'down' | 'left' | 'right'
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left'
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
        }

        callbacks.onSwipe?.(direction, velocity)
      } else if (distance < 10) {
        // Check for double tap
        const currentTap = { time: endTime, point: endTouch }
        const lastTap = lastTapRef.current

        if (lastTap && 
            endTime - lastTap.time < doubleTapDelay &&
            getDistance(endTouch, lastTap.point) < 50) {
          callbacks.onDoubleTap?.(endTouch)
          lastTapRef.current = null // Prevent triple tap
        } else {
          // Single tap
          setTimeout(() => {
            // Only trigger single tap if no double tap occurred
            if (lastTapRef.current === currentTap) {
              callbacks.onTap?.(endTouch)
            }
          }, doubleTapDelay)
          lastTapRef.current = currentTap
        }
      }
    }

    // Reset state
    if (e.touches.length === 0) {
      touchStartRef.current = []
      initialDistanceRef.current = 0
      initialCenterRef.current = null
      isDraggingRef.current = false
    }
  }, [callbacks, preventDefault, swipeThreshold, doubleTapDelay])

  const attachListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer()
    }
  }, [])

  return { attachListeners }
}