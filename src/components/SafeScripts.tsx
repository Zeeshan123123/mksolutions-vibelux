'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupPWAInstallPrompt } from '@/utils/sw-register';

export default function SafeScripts() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Setup PWA install prompt
    setupPWAInstallPrompt();
  }, []);

  return null; // This component doesn't render anything
}