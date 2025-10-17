"use client";

import { cn } from "@/lib/utils";

interface LoadingBarProps {
  progress?: number;
  isIndeterminate?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "green" | "blue";
  className?: string;
  showPercentage?: boolean;
}

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3"
};

const colorClasses = {
  primary: "bg-vibelux-purple",
  secondary: "bg-gray-400",
  green: "bg-vibelux-green",
  blue: "bg-blue-500"
};

export function LoadingBar({ 
  progress = 0, 
  isIndeterminate = false,
  size = "md",
  color = "primary",
  className,
  showPercentage = false
}: LoadingBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "w-full rounded-full bg-gray-800/50",
        sizeClasses[size]
      )}>
        <div 
          className={cn(
            "rounded-full transition-all duration-300 ease-out",
            sizeClasses[size],
            colorClasses[color],
            isIndeterminate && "animate-pulse"
          )}
          style={{ 
            width: isIndeterminate ? "100%" : `${Math.min(progress, 100)}%`,
            ...(isIndeterminate && {
              animation: "loading-bar-slide 2s infinite ease-in-out"
            })
          }}
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showPercentage && !isIndeterminate && (
        <div className="mt-1 text-xs text-gray-400 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

export function LoadingBarWithLabel({ 
  label,
  progress = 0, 
  isIndeterminate = false,
  size = "md",
  color = "primary",
  className,
  showPercentage = false
}: LoadingBarProps & { label: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        {showPercentage && !isIndeterminate && (
          <span className="text-sm text-gray-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <LoadingBar 
        progress={progress}
        isIndeterminate={isIndeterminate}
        size={size}
        color={color}
      />
    </div>
  );
}

export function LoadingBarSteps({ 
  steps,
  currentStep = 0,
  size = "md",
  color = "primary",
  className
}: Omit<LoadingBarProps, 'progress' | 'isIndeterminate'> & { 
  steps: string[];
  currentStep?: number;
}) {
  const progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;
  
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">
            {steps[currentStep] || "Completed"}
          </span>
          <span className="text-sm text-gray-400">
            {currentStep + 1} of {steps.length}
          </span>
        </div>
        <LoadingBar 
          progress={progress}
          size={size}
          color={color}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        {steps.map((step, index) => (
          <span 
            key={index}
            className={cn(
              "transition-colors",
              index <= currentStep ? "text-gray-300" : "text-gray-600"
            )}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

// Add the keyframes for the sliding animation
const style = `
@keyframes loading-bar-slide {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}