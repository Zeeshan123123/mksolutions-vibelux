"use client";

import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "green";
  className?: string;
}

const sizeClasses = {
  sm: "h-1 w-1",
  md: "h-2 w-2",
  lg: "h-3 w-3"
};

const colorClasses = {
  primary: "bg-vibelux-purple",
  secondary: "bg-gray-400",
  white: "bg-white",
  green: "bg-vibelux-green"
};

export function LoadingDots({ 
  size = "md", 
  color = "primary", 
  className 
}: LoadingDotsProps) {
  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      role="status"
      aria-label="Loading"
    >
      <div 
        className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <div 
        className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <div 
        className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: "300ms" }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingDotsText({ 
  text = "Loading",
  size = "md", 
  color = "primary",
  className 
}: LoadingDotsProps & { text?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-300">{text}</span>
      <LoadingDots size={size} color={color} />
    </div>
  );
}

export function LoadingDotsTyping({ 
  size = "md", 
  color = "primary",
  className 
}: LoadingDotsProps) {
  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      role="status"
      aria-label="Typing"
    >
      <div 
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
      />
      <div 
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}
      />
      <div 
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}
      />
      <span className="sr-only">Typing...</span>
    </div>
  );
}