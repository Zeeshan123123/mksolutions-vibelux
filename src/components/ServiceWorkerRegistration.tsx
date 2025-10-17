"use client"

import { useEffect } from 'react'
import { logger } from '@/lib/logging/production-logger';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('VibeLux PWA: Service Worker registered successfully:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('VibeLux PWA: New version available');
                  }
                });
              }
            });
          })
          .catch((error) => {
            logger.error('system', 'Service Worker registration failed:', error )
          })
      } else {
      }
    }
  }, [])

  // Also add manifest link verification in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check if manifest is accessible
      fetch('/manifest.json')
        .then(response => {
          if (!response.ok) {
            logger.warn('system', 'PWA Manifest not accessible:', { data: response.status })
          } else {
          }
        })
        .catch(error => {
          logger.warn('system', 'PWA Manifest fetch error:', { data: error  })
        })
      
      // Check if favicon is accessible
      fetch('/favicon.ico')
        .then(response => {
          if (!response.ok) {
            logger.warn('system', 'PWA Favicon not accessible:', { data: response.status })
          } else {
          }
        })
        .catch(error => {
          logger.warn('system', 'PWA Favicon fetch error:', { data: error  })
        })
    }
  }, [])

  return null
}