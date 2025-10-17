import { AlertTriangle, RefreshCw, X, Info, CheckCircle } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  type?: 'error' | 'warning' | 'info' | 'success'
  className?: string
}

export function ErrorMessage({ title = 'Error', message, onRetry, type = 'error', className = '' }: ErrorMessageProps) {
  const configs = {
    error: {
      icon: AlertTriangle,
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      title: title || 'Error'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      title: title || 'Warning'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      title: title || 'Information'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      title: title || 'Success'
    }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${config.bgColor} p-4 rounded-full mb-4`}>
        <Icon className={`w-8 h-8 ${config.textColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-100 mb-2">{config.title}</h3>
      <p className="text-gray-400 text-center max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

export function ErrorBanner({ 
  message, 
  onDismiss, 
  type = 'error' 
}: { 
  message: string
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info' | 'success'
}) {
  const configs = {
    error: {
      bgColor: 'bg-red-900/50',
      borderColor: 'border-red-800',
      textColor: 'text-red-300'
    },
    warning: {
      bgColor: 'bg-yellow-900/50',
      borderColor: 'border-yellow-800',
      textColor: 'text-yellow-300'
    },
    info: {
      bgColor: 'bg-blue-900/50',
      borderColor: 'border-blue-800',
      textColor: 'text-blue-300'
    },
    success: {
      bgColor: 'bg-green-900/50',
      borderColor: 'border-green-800',
      textColor: 'text-green-300'
    }
  }

  const config = configs[type]

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-center justify-between">
        <p className={`${config.textColor} text-sm`}>{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  // This would need to be implemented as a class component for React error boundary
  return <>{children}</>
}