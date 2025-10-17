'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { logger } from '@/lib/client-logger';
import { useTouchGestures } from '@/hooks/useTouchGestures'
import { cn } from '@/lib/utils'

interface CanvasObject {
  id: string
  type: 'fixture' | 'room' | 'measurement'
  x: number
  y: number
  width: number
  height: number
  selected?: boolean
}

interface TouchOptimizedCanvasProps {
  className?: string
  objects?: CanvasObject[]
  onObjectSelect?: (id: string | null) => void
  onObjectMove?: (id: string, x: number, y: number) => void
  onCanvasUpdate?: (objects: CanvasObject[]) => void
}

export function TouchOptimizedCanvas({
  className,
  objects = [],
  onObjectSelect,
  onObjectMove,
  onCanvasUpdate
}: TouchOptimizedCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [viewTransform, setViewTransform] = useState({
    x: 0,
    y: 0,
    scale: 1
  })
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    
    const rect = canvasRef.current.getBoundingClientRect()
    const canvasX = (screenX - rect.left - viewTransform.x) / viewTransform.scale
    const canvasY = (screenY - rect.top - viewTransform.y) / viewTransform.scale
    
    return { x: canvasX, y: canvasY }
  }, [viewTransform])

  // Find object at given canvas coordinates
  const getObjectAtPoint = useCallback((canvasX: number, canvasY: number) => {
    // Check in reverse order to handle overlapping objects
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      if (canvasX >= obj.x && 
          canvasX <= obj.x + obj.width &&
          canvasY >= obj.y && 
          canvasY <= obj.y + obj.height) {
        return obj
      }
    }
    return null
  }, [objects])

  const handleTap = useCallback((point: { x: number; y: number }) => {
    const canvasPoint = screenToCanvas(point.x, point.y)
    const clickedObject = getObjectAtPoint(canvasPoint.x, canvasPoint.y)
    
    if (clickedObject) {
      setSelectedObject(clickedObject.id)
      onObjectSelect?.(clickedObject.id)
      
      // Calculate drag offset for smooth dragging
      setDragOffset({
        x: canvasPoint.x - clickedObject.x,
        y: canvasPoint.y - clickedObject.y
      })
    } else {
      setSelectedObject(null)
      onObjectSelect?.(null)
    }
  }, [screenToCanvas, getObjectAtPoint, onObjectSelect])

  const handleDoubleTap = useCallback((point: { x: number; y: number }) => {
    // Zoom to point on double tap
    const canvasPoint = screenToCanvas(point.x, point.y)
    const newScale = viewTransform.scale < 2 ? 2 : 1
    
    setViewTransform(prev => ({
      ...prev,
      scale: newScale,
      x: prev.x - (canvasPoint.x * (newScale - prev.scale)),
      y: prev.y - (canvasPoint.y * (newScale - prev.scale))
    }))
  }, [screenToCanvas, viewTransform.scale])

  const handleLongPress = useCallback((point: { x: number; y: number }) => {
    const canvasPoint = screenToCanvas(point.x, point.y)
    const clickedObject = getObjectAtPoint(canvasPoint.x, canvasPoint.y)
    
    if (clickedObject) {
      // Show context menu or additional options
      logger.info('system', 'Long press on object:', { data: clickedObject.id })
    }
  }, [screenToCanvas, getObjectAtPoint])

  const handlePan = useCallback((delta: { x: number; y: number }, point: { x: number; y: number }) => {
    if (selectedObject && !isDragging) {
      // Start dragging selected object
      setIsDragging(true)
    }
    
    if (isDragging && selectedObject) {
      // Move selected object
      const canvasPoint = screenToCanvas(point.x, point.y)
      const newX = canvasPoint.x - dragOffset.x
      const newY = canvasPoint.y - dragOffset.y
      
      onObjectMove?.(selectedObject, newX, newY)
    } else {
      // Pan canvas view
      setViewTransform(prev => ({
        ...prev,
        x: prev.x + delta.x,
        y: prev.y + delta.y
      }))
    }
  }, [selectedObject, isDragging, dragOffset, screenToCanvas, onObjectMove])

  const handlePinch = useCallback((scale: number, center: { x: number; y: number }) => {
    const canvasCenter = screenToCanvas(center.x, center.y)
    
    setViewTransform(prev => {
      const newScale = Math.max(0.25, Math.min(4, prev.scale * scale))
      return {
        ...prev,
        scale: newScale,
        x: prev.x - (canvasCenter.x * (newScale - prev.scale)),
        y: prev.y - (canvasCenter.y * (newScale - prev.scale))
      }
    })
  }, [screenToCanvas])

  const handleSwipe = useCallback((direction: 'up' | 'down' | 'left' | 'right', velocity: number) => {
    // Quick pan based on swipe
    const multiplier = Math.min(velocity * 100, 500)
    
    let deltaX = 0
    let deltaY = 0
    
    switch (direction) {
      case 'left':
        deltaX = -multiplier
        break
      case 'right':
        deltaX = multiplier
        break
      case 'up':
        deltaY = -multiplier
        break
      case 'down':
        deltaY = multiplier
        break
    }
    
    setViewTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
  }, [])

  // Touch gesture handling
  const { attachListeners } = useTouchGestures({
    onTap: handleTap,
    onDoubleTap: handleDoubleTap,
    onLongPress: handleLongPress,
    onPan: handlePan,
    onPinch: handlePinch,
    onSwipe: handleSwipe
  })

  // Stop dragging when touch ends
  useEffect(() => {
    const handleGlobalTouchEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('touchend', handleGlobalTouchEnd)
    document.addEventListener('touchcancel', handleGlobalTouchEnd)
    
    return () => {
      document.removeEventListener('touchend', handleGlobalTouchEnd)
      document.removeEventListener('touchcancel', handleGlobalTouchEnd)
    }
  }, [])

  // Attach touch listeners
  useEffect(() => {
    if (canvasRef.current) {
      return attachListeners(canvasRef.current)
    }
  }, [attachListeners])

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800 touch-none select-none",
        "border border-gray-300 dark:border-gray-600 rounded-lg",
        className
      )}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: `${20 * viewTransform.scale}px ${20 * viewTransform.scale}px`,
          backgroundPosition: `${viewTransform.x}px ${viewTransform.y}px`,
          color: 'rgb(107 114 128)'
        }}
      />
      
      {/* Canvas objects */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`
        }}
      >
        {objects.map((obj) => (
          <div
            key={obj.id}
            className={cn(
              "absolute border-2 transition-colors duration-150",
              obj.selected || selectedObject === obj.id
                ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                : obj.type === 'fixture'
                  ? "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30"
                  : obj.type === 'room'
                    ? "border-gray-500 bg-transparent"
                    : "border-green-500 bg-green-100 dark:bg-green-900/30",
              // Add visual feedback for touch
              "active:scale-105 active:shadow-lg"
            )}
            style={{
              left: obj.x,
              top: obj.y,
              width: obj.width,
              height: obj.height,
              transformOrigin: 'center'
            }}
          >
            {/* Object content based on type */}
            {obj.type === 'fixture' && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
            )}
            
            {obj.type === 'measurement' && (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono">
                {obj.width.toFixed(1)}'
              </div>
            )}
            
            {/* Selection handles for selected objects */}
            {(obj.selected || selectedObject === obj.id) && (
              <>
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Canvas info overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Scale: {Math.round(viewTransform.scale * 100)}%
      </div>
      
      {/* Touch hints for empty canvas */}
      {objects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm mb-2">Touch to interact:</p>
            <ul className="text-xs space-y-1">
              <li>• Tap to select</li>
              <li>• Double tap to zoom</li>
              <li>• Pinch to zoom</li>
              <li>• Drag to pan or move objects</li>
              <li>• Long press for options</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default TouchOptimizedCanvas