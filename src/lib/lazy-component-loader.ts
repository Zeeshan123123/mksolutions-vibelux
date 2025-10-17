import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import React from 'react';

/**
 * Universal lazy loading system for VibeLux enterprise platform
 * Reduces memory usage by loading components only when needed
 */

interface LazyLoadOptions {
  loading?: ComponentType;
  ssr?: boolean;
  suspense?: boolean;
}

const defaultLoadingComponent = () => React.createElement('div', {
  className: "flex items-center justify-center h-32"
}, [
  React.createElement('div', {
    key: 'spinner',
    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"
  }),
  React.createElement('span', {
    key: 'text',
    className: "ml-2 text-gray-400"
  }, 'Loading...')
]);

/**
 * Creates a lazy-loaded component with memory optimization
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions = {}
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options.loading || defaultLoadingComponent,
    ssr: options.ssr ?? false, // Disable SSR by default for performance
    suspense: options.suspense ?? false
  });
}

/**
 * Creates a lazy-loaded component with error boundary
 */
export function createSafeLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallbackComponent?: ComponentType<P>,
  options: LazyLoadOptions = {}
): ComponentType<P> {
  const LazyComponent = createLazyComponent(importFn, options);
  
  // If no fallback, return the lazy component as-is
  if (!fallbackComponent) {
    return LazyComponent;
  }
  
  // Return a component that falls back on error
  return function SafeLazyWrapper(props: P) {
    try {
      return LazyComponent(props);
    } catch (error) {
      console.warn('Lazy component failed to load, using fallback:', error);
      return fallbackComponent(props);
    }
  } as ComponentType<P>;
}

// Removed LazyLoaders to prevent webpack dynamic import issues in static export

/**
 * Memory-optimized component factory
 */
export class ComponentFactory {
  private static loadedComponents = new Map<string, ComponentType<any>>();
  
  static create<P = {}>(
    componentId: string,
    importFn: () => Promise<{ default: ComponentType<P> }>,
    options: LazyLoadOptions = {}
  ): ComponentType<P> {
    // Check if component already loaded (prevents duplicate loading)
    if (this.loadedComponents.has(componentId)) {
      return this.loadedComponents.get(componentId);
    }
    
    const component = createLazyComponent(importFn, options);
    this.loadedComponents.set(componentId, component);
    
    return component;
  }
  
  static preload(componentId: string): void {
    // Mark component for preloading (future enhancement)
    console.log(`Preloading component: ${componentId}`);
  }
  
  static clear(): void {
    this.loadedComponents.clear();
  }
}