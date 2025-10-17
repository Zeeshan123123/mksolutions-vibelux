import { OnboardingStep, OnboardingModule } from '@/contexts/OnboardingContext'

export interface ElementPosition {
  top: number
  left: number
  width: number
  height: number
}

export interface TooltipPosition {
  top: number
  left: number
  placement: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Get the position of a DOM element
 */
export const getElementPosition = (selector: string): ElementPosition | null => {
  const element = document.querySelector(selector)
  if (!element) return null

  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  }
}

/**
 * Calculate tooltip position based on element position and preferred placement
 */
export const calculateTooltipPosition = (
  elementPosition: ElementPosition,
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right',
  tooltipSize: { width: number; height: number }
): TooltipPosition => {
  const { top, left, width, height } = elementPosition
  const { width: tooltipWidth, height: tooltipHeight } = tooltipSize
  
  const margin = 12 // Space between element and tooltip
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let placement = preferredPlacement
  let tooltipTop = top
  let tooltipLeft = left

  // Calculate position based on preferred placement
  switch (preferredPlacement) {
    case 'top':
      tooltipTop = top - tooltipHeight - margin
      tooltipLeft = left + (width / 2) - (tooltipWidth / 2)
      
      // Check if tooltip would go off screen
      if (tooltipTop < 0) {
        placement = 'bottom'
        tooltipTop = top + height + margin
      }
      break
      
    case 'bottom':
      tooltipTop = top + height + margin
      tooltipLeft = left + (width / 2) - (tooltipWidth / 2)
      
      if (tooltipTop + tooltipHeight > viewportHeight) {
        placement = 'top'
        tooltipTop = top - tooltipHeight - margin
      }
      break
      
    case 'left':
      tooltipTop = top + (height / 2) - (tooltipHeight / 2)
      tooltipLeft = left - tooltipWidth - margin
      
      if (tooltipLeft < 0) {
        placement = 'right'
        tooltipLeft = left + width + margin
      }
      break
      
    case 'right':
      tooltipTop = top + (height / 2) - (tooltipHeight / 2)
      tooltipLeft = left + width + margin
      
      if (tooltipLeft + tooltipWidth > viewportWidth) {
        placement = 'left'
        tooltipLeft = left - tooltipWidth - margin
      }
      break
  }

  // Ensure tooltip doesn't go off screen horizontally
  if (tooltipLeft < 0) {
    tooltipLeft = margin
  } else if (tooltipLeft + tooltipWidth > viewportWidth) {
    tooltipLeft = viewportWidth - tooltipWidth - margin
  }

  // Ensure tooltip doesn't go off screen vertically
  if (tooltipTop < 0) {
    tooltipTop = margin
  } else if (tooltipTop + tooltipHeight > viewportHeight) {
    tooltipTop = viewportHeight - tooltipHeight - margin
  }

  return {
    top: tooltipTop,
    left: tooltipLeft,
    placement
  }
}

/**
 * Scroll to an element smoothly
 */
export const scrollToElement = (selector: string, offset: number = 0) => {
  const element = document.querySelector(selector)
  if (!element) return

  const elementPosition = element.getBoundingClientRect()
  const offsetPosition = elementPosition.top + window.pageYOffset - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  })
}

/**
 * Wait for an element to appear in the DOM
 */
export const waitForElement = (selector: string, timeout: number = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}

/**
 * Check if user is on mobile device
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 768
}

/**
 * Create a spotlight effect for highlighting elements
 */
export const createSpotlight = (selector: string): HTMLElement => {
  const element = document.querySelector(selector)
  if (!element) throw new Error(`Element ${selector} not found`)

  const rect = element.getBoundingClientRect()
  const spotlight = document.createElement('div')
  
  spotlight.className = 'onboarding-spotlight'
  spotlight.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    pointer-events: none;
  `

  // Create the spotlight hole
  const spotlightHole = document.createElement('div')
  spotlightHole.style.cssText = `
    position: absolute;
    top: ${rect.top - 8}px;
    left: ${rect.left - 8}px;
    width: ${rect.width + 16}px;
    height: ${rect.height + 16}px;
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    background: transparent;
  `

  spotlight.appendChild(spotlightHole)
  document.body.appendChild(spotlight)

  return spotlight
}

/**
 * Remove spotlight effect
 */
export const removeSpotlight = () => {
  const spotlight = document.querySelector('.onboarding-spotlight')
  if (spotlight) {
    spotlight.remove()
  }
}

/**
 * Get user's preferred language for localization
 */
export const getUserLanguage = (): string => {
  return navigator.language || 'en-US'
}

/**
 * Format estimated time for display
 */
export const formatEstimatedTime = (time: string): string => {
  const match = time.match(/(\d+)\s*(minutes?|mins?|seconds?|secs?)/i)
  if (!match) return time

  const [, number, unit] = match
  const num = parseInt(number)
  const normalizedUnit = unit.toLowerCase().startsWith('min') ? 'minute' : 'second'
  
  return `${num} ${normalizedUnit}${num > 1 ? 's' : ''}`
}

/**
 * Generate completion rewards based on progress
 */
export const generateCompletionReward = (completedSteps: number, totalSteps: number) => {
  const progress = (completedSteps / totalSteps) * 100
  
  if (progress >= 100) {
    return {
      type: 'completion',
      title: 'Onboarding Complete!',
      description: 'You\'ve mastered the VibeLux platform basics',
      icon: '🎉',
      points: 500,
      badge: 'Platform Expert'
    }
  } else if (progress >= 75) {
    return {
      type: 'milestone',
      title: 'Almost There!',
      description: 'You\'re 75% through the onboarding',
      icon: '🌟',
      points: 200,
      badge: 'Advanced User'
    }
  } else if (progress >= 50) {
    return {
      type: 'milestone',
      title: 'Halfway Point',
      description: 'You\'re making great progress!',
      icon: '⭐',
      points: 100,
      badge: 'Intermediate User'
    }
  } else if (progress >= 25) {
    return {
      type: 'milestone',
      title: 'Getting Started',
      description: 'You\'re 25% through the basics',
      icon: '📈',
      points: 50,
      badge: 'Beginner'
    }
  }
  
  return null
}

/**
 * Validate if prerequisites are met for a module
 */
export const validatePrerequisites = (
  module: OnboardingModule,
  completedModules: string[]
): boolean => {
  if (!module.prerequisite || module.prerequisite.length === 0) {
    return true
  }
  
  return module.prerequisite.every(prereq => completedModules.includes(prereq))
}

/**
 * Get next recommended module based on completion and prerequisites
 */
export const getRecommendedModule = (
  modules: OnboardingModule[],
  completedModules: string[]
): OnboardingModule | null => {
  // Find modules that are not completed and have prerequisites met
  const availableModules = modules.filter(module => 
    !completedModules.includes(module.id) && 
    validatePrerequisites(module, completedModules)
  )
  
  if (availableModules.length === 0) return null
  
  // Prioritize getting-started modules first
  const gettingStartedModules = availableModules.filter(m => m.category === 'getting-started')
  if (gettingStartedModules.length > 0) {
    return gettingStartedModules[0]
  }
  
  // Then prioritize non-optional modules
  const requiredModules = availableModules.filter(m => !m.isOptional)
  if (requiredModules.length > 0) {
    return requiredModules[0]
  }
  
  // Finally, return any available module
  return availableModules[0]
}

/**
 * Save onboarding analytics event
 */
export const trackOnboardingEvent = (
  eventType: 'start' | 'complete' | 'skip' | 'step_complete' | 'step_skip',
  data: {
    moduleId?: string
    stepId?: string
    timeSpent?: number
    completionRate?: number
  }
) => {
  // This would integrate with your analytics service
  logger.info('api', 'Onboarding Analytics:', { data: { eventType, data, timestamp: new Date().toISOString() }})
  
  // Example: Send to analytics service
  // analytics.track('onboarding_event', {
  //   event_type: eventType,
  //   ...data
  // })
}

/**
 * Get device-specific onboarding adjustments
 */
export const getDeviceAdjustments = () => {
  const isMobileDevice = isMobile()
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024
  
  return {
    isMobile: isMobileDevice,
    isTablet,
    isDesktop: !isMobileDevice && !isTablet,
    tooltipSize: isMobileDevice ? { width: 280, height: 120 } : { width: 320, height: 140 },
    spotlightPadding: isMobileDevice ? 4 : 8,
    animationDuration: isMobileDevice ? 200 : 300
  }
}