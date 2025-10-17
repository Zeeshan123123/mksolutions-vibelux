import Image from 'next/image';

interface VibeLuxLogoProps {
  width?: number;
  height?: number;
  className?: string;
  linkToHome?: boolean;
}

export function VibeLuxLogo({ 
  width = 150, 
  height = 50, 
  className = "h-10 w-auto",
  linkToHome = false 
}: VibeLuxLogoProps) {
  const logo = (
    <Image
      src="/vibelux-logo.png"
      alt="VibeLux"
      width={width}
      height={height}
      className={className}
      priority
    />
  );

  if (linkToHome) {
    return <a href="/" className="inline-block">{logo}</a>;
  }
  return logo;
}

// Text-only version for places where the image can't be used
export function VibeLuxLogoText({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold ${className}`}>
      <span className="text-purple-500">Vibe</span>
      <span className="text-teal-500">Lux</span>
    </span>
  );
}