"use client"

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { getElementPosition, calculateTooltipPosition } from '@/lib/onboarding/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  X, 
  ExternalLink, 
  BookOpen, 
  Lightbulb,
  Info,
  AlertCircle
} from 'lucide-react'

interface ContextualTooltipProps {
  elementId: string
  title: string
  content: string
  type?: 'info' | 'tip' | 'warning' | 'help'
  learnMoreUrl?: string
  showOnHover?: boolean
  showOnClick?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  persistent?: boolean
  children?: React.ReactNode
}

export default function ContextualTooltip({
  elementId,
  title,
  content,
  type = 'info',
  learnMoreUrl,
  showOnHover = true,
  showOnClick = false,
  position = 'top',
  delay = 500,
  persistent = false,
  children
}: ContextualTooltipProps) {
  const { shouldShowTooltip, markElementSeen, state } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, placement: 'top' as const })
  const [isHovered, setIsHovered] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Don't show if user has disabled contextual help
  if (!state.userPreferences.showContextualHelp) {
    return children || null
  }

  // Don't show if user has already seen this tooltip (unless persistent)
  if (!persistent && !shouldShowTooltip(elementId)) {
    return children || null
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      case 'help':
        return <HelpCircle className="w-4 h-4 text-blue-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'tip':
        return 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400'
      case 'warning':
        return 'bg-orange-600/20 border-orange-500/30 text-orange-400'
      case 'help':
        return 'bg-blue-600/20 border-blue-500/30 text-blue-400'
      default:
        return 'bg-blue-600/20 border-blue-500/30 text-blue-400'
    }
  }

  const updateTooltipPosition = () => {
    const elementPosition = getElementPosition(`[data-onboarding-help="${elementId}"]`)
    if (!elementPosition) return

    const calculatedPosition = calculateTooltipPosition(
      elementPosition,
      position,
      { width: 300, height: 120 }
    )

    setTooltipPosition(calculatedPosition)
  }

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      updateTooltipPosition()
      setIsVisible(true)
      if (!persistent) {
        markElementSeen(elementId)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (!isHovered) {
      setIsVisible(false)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (showOnHover) {
      showTooltip()
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (showOnHover) {
      hideTooltip()
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (showOnClick) {
      e.stopPropagation()
      if (isVisible) {
        hideTooltip()
      } else {
        showTooltip()
      }
    }
  }

  useEffect(() => {
    const element = document.querySelector(`[data-onboarding-help="${elementId}"]`)
    if (!element) return

    if (showOnHover) {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
    }

    if (showOnClick) {
      element.addEventListener('click', handleClick)
    }

    // Update position on scroll/resize
    const handleResize = () => {
      if (isVisible) {
        updateTooltipPosition()
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)

    return () => {
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
        element.removeEventListener('click', handleClick)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [elementId, showOnHover, showOnClick, isVisible])

  const getArrowPosition = () => {
    const { placement } = tooltipPosition
    const arrowClasses = "absolute w-3 h-3 bg-gray-800 border-l border-t border-gray-700 rotate-45"
    
    switch (placement) {
      case 'top':
        return <div className={`${arrowClasses} -bottom-1.5 left-1/2 transform -translate-x-1/2`} />
      case 'bottom':
        return <div className={`${arrowClasses} -top-1.5 left-1/2 transform -translate-x-1/2 rotate-[225deg]`} />
      case 'left':
        return <div className={`${arrowClasses} -right-1.5 top-1/2 transform -translate-y-1/2 rotate-[315deg]`} />
      case 'right':
        return <div className={`${arrowClasses} -left-1.5 top-1/2 transform -translate-y-1/2 rotate-[135deg]`} />
      default:
        return null
    }
  }

  const tooltipContent = (
    <Card 
      ref={tooltipRef}
      className="fixed z-[9999] w-80 max-w-[90vw] bg-gray-800 border-gray-700 shadow-xl"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getArrowPosition()}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getTypeColor()} text-xs`}>
              {getTypeIcon()}
              <span className="ml-1 capitalize">{type}</span>
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="text-gray-300">
          {content}
        </CardDescription>

        {learnMoreUrl && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(learnMoreUrl, '_blank')}
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Learn More
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <>
      {children}
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  )
}

// Helper component to wrap elements with contextual help
interface HelpWrapperProps {
  elementId: string
  title: string
  content: string
  type?: 'info' | 'tip' | 'warning' | 'help'
  learnMoreUrl?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  children: React.ReactNode
}

export function HelpWrapper({
  elementId,
  title,
  content,
  type = 'info',
  learnMoreUrl,
  position = 'top',
  className = '',
  children
}: HelpWrapperProps) {
  return (
    <div 
      data-onboarding-help={elementId}
      className={`relative ${className}`}
    >
      {children}
      <ContextualTooltip
        elementId={elementId}
        title={title}
        content={content}
        type={type}
        learnMoreUrl={learnMoreUrl}
        position={position}
      />
    </div>
  )
}

// Hook for programmatic tooltip control
export function useContextualHelp() {
  const { shouldShowTooltip, markElementSeen, state } = useOnboarding()

  const showTooltip = (elementId: string) => {
    if (!state.userPreferences.showContextualHelp) return false
    return shouldShowTooltip(elementId)
  }

  const hideTooltip = (elementId: string) => {
    markElementSeen(elementId)
  }

  return {
    showTooltip,
    hideTooltip,
    isEnabled: state.userPreferences.showContextualHelp
  }
}