"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "text":
        return "rounded-sm";
      default:
        return "rounded-lg";
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case "circular":
        return "h-12 w-12";
      case "text":
        return "h-4 w-full";
      default:
        return "h-20 w-full";
    }
  };

  const skeletonClass = cn(
    "animate-pulse bg-gray-700/50 shimmer",
    getVariantClasses(),
    !width && !height && getDefaultSize(),
    className
  );

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              skeletonClass,
              i === lines - 1 && "w-3/4" // Last line shorter
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} style={style} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} />
      <div className="space-y-2">
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  );
}

export function SkeletonList({ 
  items = 5, 
  className 
}: { 
  items?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" width="70%" height={14} />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Table header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={16} />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ 
  height = 200, 
  className 
}: { 
  height?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
        <Skeleton variant="rectangular" height={height} />
        <div className="flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="text" width={40} height={12} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="80%" height={12} />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <SkeletonChart height={300} />
      
      {/* Data table */}
      <div className="glass-card p-6">
        <div className="space-y-4">
          <Skeleton variant="text" width="30%" height={20} />
          <SkeletonTable rows={8} columns={5} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonForm({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Form title */}
      <Skeleton variant="text" width="50%" height={24} />
      
      {/* Form fields */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="rectangular" height={40} />
          </div>
        ))}
      </div>
      
      {/* Form actions */}
      <div className="flex space-x-3">
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
      </div>
    </div>
  );
}

export function SkeletonCalculator({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-6 space-y-6", className)}>
      {/* Calculator title */}
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>
      
      {/* Input sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton variant="text" width="40%" height={18} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="50%" height={14} />
              <Skeleton variant="rectangular" height={36} />
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="rectangular" height={200} />
        </div>
      </div>
      
      {/* Results section */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <Skeleton variant="text" width="30%" height={18} />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton variant="text" width="60%" height={12} />
              <Skeleton variant="text" width="40%" height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}