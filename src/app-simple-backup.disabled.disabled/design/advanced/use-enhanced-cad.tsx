'use client';

import { useState, useEffect } from 'react';

/**
 * Feature flag to enable enhanced CAD features
 * Can be controlled via localStorage or environment variable
 */
export function useEnhancedCAD() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('vibelux_enhanced_cad');
    if (stored === 'true') {
      setEnabled(true);
      return;
    }

    // Check URL params (for testing)
    const params = new URLSearchParams(window.location.search);
    if (params.get('enhanced_cad') === 'true') {
      setEnabled(true);
      localStorage.setItem('vibelux_enhanced_cad', 'true');
    }
  }, []);

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('vibelux_enhanced_cad', String(newValue));
  };

  return { enabled, toggle };
}