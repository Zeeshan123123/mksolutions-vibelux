'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

// Virtual scrolling for large lists
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  )

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan)

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, startIndex, endIndex])

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Lazy loading image component with intersection observer
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  fallback?: string
  threshold?: number
  rootMargin?: string
}

export function LazyImage({
  src,
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  threshold = 0.1,
  rootMargin = '50px',
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(fallback)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image()
          img.onload = () => {
            setImageSrc(src)
            setIsLoaded(true)
          }
          img.onerror = () => {
            setIsError(true)
          }
          img.src = src
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [src, threshold, rootMargin])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-70',
        isError && 'bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    />
  )
}

// Progressive loading component
interface ProgressiveLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  className?: string
}

export function ProgressiveLoader({
  children,
  fallback = <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
  delay = 100,
  className
}: ProgressiveLoaderProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!isVisible) {
    return <div className={className}>{fallback}</div>
  }

  return <div className={className}>{children}</div>
}

// Intersection observer hook for performance monitoring
export function useIntersectionObserver(
  threshold = 0.1,
  rootMargin = '0px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = React.useRef<HTMLElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, rootMargin }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { elementRef, isIntersecting }
}

// Skeleton loading component
interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  className,
  variant = 'text'
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  )
}

// Mobile-optimized data table with virtual scrolling
interface MobileDataTableProps<T> {
  data: T[]
  columns: Array<{
    key: keyof T
    header: string
    render?: (value: T[keyof T], item: T) => React.ReactNode
    width?: string
  }>
  rowHeight?: number
  maxHeight?: number
  className?: string
  onRowClick?: (item: T) => void
}

export function MobileDataTable<T>({
  data,
  columns,
  rowHeight = 60,
  maxHeight = 400,
  className,
  onRowClick
}: MobileDataTableProps<T>) {
  const renderRow = useCallback((item: T, index: number) => (
    <div
      key={index}
      className={cn(
        'flex items-center border-b border-gray-200 dark:border-gray-700 px-4',
        'touch-manipulation cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
        onRowClick && 'active:bg-gray-100 dark:active:bg-gray-700'
      )}
      style={{ height: rowHeight }}
      onClick={() => onRowClick?.(item)}
    >
      {columns.map((column, colIndex) => {
        const value = item[column.key]
        const content = column.render ? column.render(value, item) : String(value)
        
        return (
          <div
            key={colIndex}
            className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate"
            style={{ width: column.width }}
          >
            {content}
          </div>
        )
      })}
    </div>
  ), [columns, rowHeight, onRowClick])

  return (
    <div className={cn('border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        {columns.map((column, index) => (
          <div
            key={index}
            className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate"
            style={{ width: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>
      
      {/* Virtual scrolling body */}
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={maxHeight}
        renderItem={renderRow}
      />
    </div>
  )
}

// Performance monitoring component
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }))
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }

    // Start FPS monitoring
    measureFPS()

    // Memory monitoring (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1048576) // Convert to MB
        }))
      }
      
      const memoryInterval = setInterval(updateMemory, 2000)
      return () => clearInterval(memoryInterval)
    }
  }, [])

  useEffect(() => {
    // Page load time
    if (document.readyState === 'complete') {
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(performance.now())
      }))
    } else {
      const handleLoad = () => {
        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(performance.now())
        }))
      }
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded z-50">
      <div>FPS: {metrics.fps}</div>
      {metrics.memory > 0 && <div>Memory: {metrics.memory}MB</div>}
      <div>Load: {metrics.loadTime}ms</div>
    </div>
  )
}

export default {
  VirtualList,
  LazyImage,
  ProgressiveLoader,
  Skeleton,
  MobileDataTable,
  PerformanceMonitor,
  useIntersectionObserver
}