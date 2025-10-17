import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600`} />
      {text && <p className="mt-4 text-gray-400">{text}</p>}
    </div>
  )
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        <span className="text-white font-medium">{message}</span>
      </div>
    </div>
  )
}

export function LoadingCard({ title = 'Loading...' }: { title?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        <span className="text-gray-300">{title}</span>
      </div>
    </div>
  )
}

export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600`} />
  )
}