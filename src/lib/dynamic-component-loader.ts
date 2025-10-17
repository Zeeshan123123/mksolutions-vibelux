import * as React from 'react';
import dynamic from 'next/dynamic';
import { isComponentRestored, type RestorableComponent } from './feature-restoration';

/**
 * Safely loads components with fallback to stub versions
 * This prevents build failures while allowing gradual restoration
 */
export function createRestoredComponent<T = any>(
  componentName: RestorableComponent,
  stubImportPath: string,
  realImportPath: string,
  options?: {
    ssr?: boolean;
    loading?: React.ComponentType;
  }
) {
  const isRestored = isComponentRestored(componentName);
  const importPath = isRestored ? realImportPath : stubImportPath;
  
  return dynamic(
    () => import(importPath),
    {
      ssr: options?.ssr ?? false,
      loading: options?.loading ?? (() => React.createElement('div', 
        { className: "flex items-center justify-center h-32" },
        React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" }),
        React.createElement('span', { className: "ml-2 text-gray-400" },
          `Loading ${isRestored ? 'Enhanced' : 'Basic'} Component...`
        )
      ))
    }
  );
}

/**
 * Creates a component that can be safely enabled via feature flags
 */
export function createSafeComponent<T = any>(
  componentName: RestorableComponent,
  stubImportPath: string,
  realImportPath: string
) {
  return createRestoredComponent(componentName, stubImportPath, realImportPath, {
    ssr: false // Always disable SSR for restored components to prevent issues
  });
}