"use client";

import { cn } from "@/lib/utils";

interface LoadingPulseProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "green" | "blue";
  className?: string;
  variant?: "circle" | "square" | "rectangle";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const rectangleSizeClasses = {
  sm: "h-4 w-8",
  md: "h-6 w-12",
  lg: "h-8 w-16",
  xl: "h-12 w-24"
};

const colorClasses = {
  primary: "bg-vibelux-purple/30",
  secondary: "bg-gray-400/30",
  green: "bg-vibelux-green/30",
  blue: "bg-blue-500/30"
};

export function LoadingPulse({ 
  size = "md", 
  color = "primary", 
  className,
  variant = "circle"
}: LoadingPulseProps) {
  const getSizeClass = () => {
    if (variant === "rectangle") {
      return rectangleSizeClasses[size];
    }
    return sizeClasses[size];
  };

  const getShapeClass = () => {
    switch (variant) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-md";
      case "rectangle":
        return "rounded-lg";
      default:
        return "rounded-full";
    }
  };

  return (
    <div 
      className={cn(
        "animate-pulse",
        getSizeClass(),
        getShapeClass(),
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingPulseGroup({ 
  count = 3,
  size = "md", 
  color = "primary", 
  className,
  variant = "circle",
  direction = "horizontal"
}: LoadingPulseProps & { 
  count?: number;
  direction?: "horizontal" | "vertical";
}) {
  const items = Array.from({ length: count }, (_, i) => (
    <LoadingPulse 
      key={i}
      size={size}
      color={color}
      variant={variant}
      style={{ animationDelay: `${i * 0.2}s` }}
    />
  ));

  return (
    <div 
      className={cn(
        "flex gap-2",
        direction === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      {items}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingPulseWave({ 
  size = "md", 
  color = "primary", 
  className
}: LoadingPulseProps) {
  const bars = Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      className={cn(
        "w-1 bg-current animate-pulse",
        size === "sm" ? "h-4" : size === "md" ? "h-6" : size === "lg" ? "h-8" : "h-12",
        colorClasses[color]
      )}
      style={{ 
        animationDelay: `${i * 0.1}s`,
        animationDuration: "1.2s"
      }}
    />
  ));

  return (
    <div 
      className={cn("flex items-end gap-1", className)}
      role="status"
      aria-label="Loading"
    >
      {bars}
      <span className="sr-only">Loading...</span>
    </div>
  );
}