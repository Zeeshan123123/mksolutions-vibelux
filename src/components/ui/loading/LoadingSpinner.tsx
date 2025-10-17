"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "green";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const colorClasses = {
  primary: "text-vibelux-purple",
  secondary: "text-gray-400",
  white: "text-white",
  green: "text-vibelux-green"
};

export function LoadingSpinner({ 
  size = "md", 
  color = "primary", 
  className 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
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

export function LoadingSpinnerWithText({ 
  text = "Loading...", 
  size = "md", 
  color = "primary",
  className 
}: LoadingSpinnerProps & { text?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LoadingSpinner size={size} color={color} />
      <span className={cn("text-sm", colorClasses[color])}>
        {text}
      </span>
    </div>
  );
}

export function LoadingSpinnerCentered({ 
  size = "lg", 
  color = "primary",
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-32", className)}>
      <LoadingSpinner size={size} color={color} />
    </div>
  );
}

export function LoadingSpinnerFullPage({ 
  size = "xl", 
  color = "primary",
  text = "Loading VibeLux...",
  className 
}: LoadingSpinnerProps & { text?: string }) {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",
      className
    )}>
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={size} color={color} />
        <p className={cn("text-lg font-medium", colorClasses[color])}>
          {text}
        </p>
      </div>
    </div>
  );
}