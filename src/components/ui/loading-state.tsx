'use client';

import { cn } from '@/lib/utils';
import { Loader2, Activity, Zap, Leaf, BarChart3, Lightbulb } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'default' | 'card' | 'page' | 'inline' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  theme?: 'energy' | 'cannabis' | 'analytics' | 'general';
  className?: string;
}

export function LoadingState({ 
  variant = 'default', 
  size = 'md', 
  text = 'Loading...', 
  theme = 'general',
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      container: 'p-2 gap-2'
    },
    md: {
      icon: 'w-6 h-6',
      text: 'text-base',
      container: 'p-4 gap-3'
    },
    lg: {
      icon: 'w-8 h-8',
      text: 'text-lg',
      container: 'p-6 gap-4'
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'energy':
        return <Zap className={cn(sizeClasses[size].icon, 'animate-pulse')} />;
      case 'cannabis':
        return <Leaf className={cn(sizeClasses[size].icon, 'animate-pulse')} />;
      case 'analytics':
        return <BarChart3 className={cn(sizeClasses[size].icon, 'animate-pulse')} />;
      default:
        return <Loader2 className={cn(sizeClasses[size].icon, 'animate-spin')} />;
    }
  };

  const variantClasses = {
    default: 'flex items-center justify-center',
    card: 'bg-gray-800/50 border border-gray-700 rounded-lg',
    page: 'min-h-[400px] flex items-center justify-center',
    inline: 'inline-flex items-center',
    overlay: 'absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50'
  };

  const themeColors = {
    energy: 'text-yellow-400',
    cannabis: 'text-green-400',
    analytics: 'text-blue-400',
    general: 'text-purple-400'
  };

  return (
    <div className={cn(
      variantClasses[variant],
      sizeClasses[size].container,
      themeColors[theme],
      className
    )}>
      {getIcon()}
      <span className={cn(sizeClasses[size].text, 'text-gray-400')}>
        {text}
      </span>
    </div>
  );
}

// Skeleton loader component
export function SkeletonLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800/50", className)}
      {...props}
    />
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <SkeletonLoader className="h-8 w-8 rounded mb-4" />
      <SkeletonLoader className="h-6 w-3/4 mb-2" />
      <SkeletonLoader className="h-4 w-full mb-2" />
      <SkeletonLoader className="h-4 w-5/6" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-4 p-3 border-b border-gray-700">
        {[...Array(4)].map((_, i) => (
          <SkeletonLoader key={i} className="h-4" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-3">
          {[...Array(4)].map((_, j) => (
            <SkeletonLoader key={j} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader className="h-8 w-24" />
      </div>
      <div className="relative h-64">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2">
          {[...Array(12)].map((_, i) => (
            <SkeletonLoader
              key={i}
              className="flex-1"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-8 w-48" />
        <div className="flex gap-2">
          <SkeletonLoader className="h-10 w-32" />
          <SkeletonLoader className="h-10 w-32" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <ChartSkeleton />
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <ChartSkeleton />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <TableSkeleton />
      </div>
    </div>
  );
}

// Loading wrapper with error handling
export function LoadingWrapper({ 
  children, 
  isLoading, 
  error,
  loadingText,
  className 
}: { 
  children: React.ReactNode;
  isLoading: boolean;
  error?: Error | null;
  loadingText?: string;
  className?: string;
}) {
  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Activity className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">Error loading content</p>
          <p className="text-sm text-gray-400 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState variant="page" text={loadingText} className={className} />;
  }

  return <>{children}</>;
}