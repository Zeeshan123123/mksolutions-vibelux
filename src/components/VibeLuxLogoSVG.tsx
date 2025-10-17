import React from 'react';
import Link from 'next/link';

interface VibeLuxLogoSVGProps {
  width?: number;
  height?: number;
  className?: string;
  linkToHome?: boolean;
}

export function VibeLuxLogoSVG({ 
  width = 200, 
  height = 60, 
  className = "",
  linkToHome = false 
}: VibeLuxLogoSVGProps) {
  // Calculate proportional sizing
  const aspectRatio = 200 / 60;
  const actualHeight = height;
  const actualWidth = width || (height * aspectRatio);
  
  const logo = (
    <svg 
      width={actualWidth} 
      height={actualHeight} 
      viewBox="0 0 600 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VibeLux Logo"
    >
      {/* V in purple */}
      <text 
        x="0" 
        y="90" 
        fontSize="100" 
        fontWeight="bold" 
        fill="#8B5CF6"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        V
      </text>
      
      {/* ibe in purple */}
      <text 
        x="80" 
        y="90" 
        fontSize="100" 
        fontWeight="bold" 
        fill="#8B5CF6"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ibe
      </text>
      
      {/* L in teal */}
      <text 
        x="320" 
        y="90" 
        fontSize="100" 
        fontWeight="bold" 
        fill="#06B6D4"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        L
      </text>
      
      {/* ux in teal */}
      <text 
        x="400" 
        y="90" 
        fontSize="100" 
        fontWeight="bold" 
        fill="#06B6D4"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ux
      </text>
    </svg>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}

// Compact version for favicon or small displays
export function VibeLuxLogoCompact({ 
  size = 32,
  className = ""
}: { 
  size?: number;
  className?: string;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* V in purple */}
      <text 
        x="10" 
        y="80" 
        fontSize="60" 
        fontWeight="bold" 
        fill="#8B5CF6"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        V
      </text>
      
      {/* L in teal */}
      <text 
        x="50" 
        y="80" 
        fontSize="60" 
        fontWeight="bold" 
        fill="#06B6D4"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        L
      </text>
    </svg>
  );
}