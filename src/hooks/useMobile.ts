import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
        setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      }
    };

    checkDevice();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkDevice);
      return () => window.removeEventListener('resize', checkDevice);
    }
  }, []);

  // Return false for all responsive states during SSR
  if (!mounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true
    };
  }

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}