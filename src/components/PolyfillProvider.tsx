import '../lib/polyfills';
import { useEffect } from 'react';

export function PolyfillProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Additional runtime checks
    if (typeof window !== 'undefined') {
      // Check for required features
      const features = {
        webgl: !!(document.createElement('canvas').getContext('webgl')),
        localstorage: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        })(),
        indexeddb: 'indexedDB' in window,
        serviceworker: 'serviceWorker' in navigator
      };
      
      console.log('Browser features:', features);
      
      // Store capabilities
      window.__VIBELUX_CAPABILITIES__ = features;
    }
  }, []);
  
  return <>{children}</>;
}
