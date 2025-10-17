'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string; // CSS selector
}

export function KeyboardNavigation({ 
  children, 
  trapFocus = false, 
  restoreFocus = true,
  initialFocus 
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { settings } = useAccessibility();
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Track keyboard usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-nav-visible');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-nav-visible');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Focus management
  useEffect(() => {
    if (!containerRef.current || !settings.keyboardNavigation) return;

    // Store previous focus
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Set initial focus
    if (initialFocus) {
      const initialElement = containerRef.current.querySelector(initialFocus) as HTMLElement;
      if (initialElement) {
        initialElement.focus();
      }
    }

    // Focus trap
    if (trapFocus) {
      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }

        // Escape key to exit
        if (e.key === 'Escape') {
          if (restoreFocus && previousFocusRef.current) {
            previousFocusRef.current.focus();
          }
        }
      };

      containerRef.current.addEventListener('keydown', handleKeyDown);

      return () => {
        containerRef.current?.removeEventListener('keydown', handleKeyDown);
        
        // Restore focus on cleanup
        if (restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [trapFocus, restoreFocus, initialFocus, settings.keyboardNavigation]);

  return (
    <div 
      ref={containerRef}
      className={trapFocus ? 'focus-trap' : undefined}
      role={trapFocus ? 'dialog' : undefined}
      aria-modal={trapFocus ? 'true' : undefined}
    >
      {children}
    </div>
  );
}

// Helper function to get focusable elements
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

// Keyboard shortcut hook
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'meta', 
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Live region for announcements
export function LiveRegion({ 
  message, 
  politeness = 'polite' 
}: { 
  message: string; 
  politeness?: 'polite' | 'assertive' | 'off' 
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Focus management utilities
export const focusUtils = {
  // Move focus to element
  focusElement: (selector: string | HTMLElement) => {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  // Get next focusable element
  getNextFocusable: (current: HTMLElement): HTMLElement | null => {
    const focusables = getFocusableElements(document.body);
    const currentIndex = focusables.indexOf(current);
    return focusables[currentIndex + 1] || focusables[0];
  },

  // Get previous focusable element  
  getPreviousFocusable: (current: HTMLElement): HTMLElement | null => {
    const focusables = getFocusableElements(document.body);
    const currentIndex = focusables.indexOf(current);
    return focusables[currentIndex - 1] || focusables[focusables.length - 1];
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    return getFocusableElements(document.body).includes(element);
  }
};