'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Mobile-first responsive container
export function MobileContainer({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        // Mobile-first padding and spacing
        "px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6",
        // Responsive width constraints
        "w-full max-w-7xl mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-optimized card component
export function MobileCard({ 
  children, 
  className,
  padding = 'default',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  padding?: 'none' | 'sm' | 'default' | 'lg'
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div 
      className={cn(
        // Base card styling
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        // Mobile-first responsive padding
        paddingClasses[padding],
        // Touch-friendly minimum heights
        "min-h-[44px] touch-manipulation",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-friendly button component
export function MobileButton({ 
  children, 
  className,
  size = 'default',
  variant = 'default',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost'
}) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    default: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  }

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
  }

  return (
    <button 
      className={cn(
        // Base button styling
        "inline-flex items-center justify-center rounded-md font-medium",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors duration-200",
        // Touch-friendly sizing
        "touch-manipulation select-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Mobile grid system
export function MobileGrid({ 
  children, 
  className,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  gap = 4,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: number
  smCols?: number
  mdCols?: number
  lgCols?: number
  gap?: number
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <div 
      className={cn(
        'grid',
        gridCols[cols],
        smCols && `sm:${gridCols[smCols]}`,
        mdCols && `md:${gridCols[mdCols]}`,
        lgCols && `lg:${gridCols[lgCols]}`,
        gapClasses[gap as keyof typeof gapClasses] || 'gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-friendly input component
export function MobileInput({ 
  className,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        // Base input styling
        "w-full rounded-md border border-gray-300 dark:border-gray-600",
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        "px-3 py-2.5 text-base", // Larger text for mobile
        "placeholder-gray-500 dark:placeholder-gray-400",
        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
        "disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
        // Touch-friendly sizing
        "min-h-[44px] touch-manipulation",
        className
      )}
      {...props}
    />
  )
}

// Mobile-optimized table wrapper
export function MobileTable({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        // Mobile scroll behavior
        "overflow-x-auto -mx-4 sm:mx-0",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
        "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
        className
      )}
      {...props}
    >
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </table>
      </div>
    </div>
  )
}

// Mobile status badge
export function MobileStatusBadge({ 
  children, 
  className,
  variant = 'default',
  ...props 
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }

  return (
    <span 
      className={cn(
        // Base badge styling
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        // Touch-friendly sizing
        "min-h-[24px]",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Mobile-friendly modal/dialog backdrop
export function MobileModalBackdrop({ 
  children, 
  className,
  onClose,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void
}) {
  return (
    <div 
      className={cn(
        // Full-screen backdrop
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
        "bg-black bg-opacity-50 backdrop-blur-sm",
        "p-0 sm:p-4",
        className
      )}
      onClick={onClose}
      {...props}
    >
      <div 
        className="w-full sm:w-auto sm:max-w-lg sm:max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Mobile slide-up panel
export function MobileSlidePanel({ 
  children, 
  className,
  isOpen,
  onClose,
  title,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean
  onClose: () => void
  title?: string
}) {
  if (!isOpen) return null

  return (
    <MobileModalBackdrop onClose={onClose}>
      <div 
        className={cn(
          // Mobile-first slide-up design
          "w-full bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl",
          "max-h-[85vh] sm:max-h-[75vh] overflow-hidden",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
        {...props}
      >
        {title && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <MobileButton 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </MobileButton>
          </div>
        )}
        <div className="overflow-y-auto max-h-full">
          {children}
        </div>
      </div>
    </MobileModalBackdrop>
  )
}