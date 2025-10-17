/**
 * Enhanced Core Library - Extends existing functionality
 * 
 * This module ADDS new capabilities while preserving all existing features
 */

import { logger } from '@/lib/logging/production-logger';

// Enhanced utilities that extend (don't replace) existing functionality
export interface EnhancedLibraryConfig {
  preserveAllFeatures: boolean;
  enhancePerformance: boolean;
  addAdvancedFeatures: boolean;
  maintainBackwardCompatibility: boolean;
}

export const DEFAULT_ENHANCED_CONFIG: EnhancedLibraryConfig = {
  preserveAllFeatures: true,
  enhancePerformance: true,
  addAdvancedFeatures: true,
  maintainBackwardCompatibility: true
};

/**
 * Enhanced component wrapper that adds performance optimizations
 * while preserving all existing component functionality
 */
export const enhanceComponent = <T extends React.ComponentType<any>>(
  OriginalComponent: T,
  enhancements: {
    memoization?: boolean;
    lazyLoading?: boolean;
    performanceTracking?: boolean;
    errorBoundary?: boolean;
  } = {}
): T => {
  const EnhancedComponent = React.memo(
    React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
      // Add performance tracking if enabled
      if (enhancements.performanceTracking) {
        React.useEffect(() => {
          const startTime = Date.now();
          return () => {
            const renderTime = Date.now() - startTime;
            logger.info('api', `Component ${OriginalComponent.name} render time: ${renderTime}ms`);
          };
        });
      }

      // Render original component with ALL original functionality preserved
      return React.createElement(OriginalComponent, { ref, ...props });
    })
  ) as T;

  // Preserve all original component properties and methods
  Object.setPrototypeOf(EnhancedComponent, OriginalComponent);
  Object.assign(EnhancedComponent, OriginalComponent);

  return EnhancedComponent;
};

/**
 * Enhanced state management that extends existing patterns
 */
export const createEnhancedState = <T>(
  initialState: T,
  options: {
    persistence?: boolean;
    undoRedo?: boolean;
    validation?: (state: T) => boolean;
    onStateChange?: (newState: T, prevState: T) => void;
  } = {}
) => {
  const [state, setState] = React.useState<T>(initialState);
  const [history, setHistory] = React.useState<T[]>([initialState]);
  const historyIndexRef = React.useRef(0);

  const enhancedSetState = React.useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' ? (newState as Function)(prevState) : newState;
      
      // Validate if validator provided
      if (options.validation && !options.validation(nextState)) {
        logger.warn('api', 'State validation failed, keeping previous state');
        return prevState;
      }

      // Add to history for undo/redo if enabled
      if (options.undoRedo) {
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndexRef.current + 1);
          newHistory.push(nextState);
          historyIndexRef.current = newHistory.length - 1;
          return newHistory;
        });
      }

      // Persist if enabled
      if (options.persistence) {
        try {
          localStorage.setItem('enhanced-state', JSON.stringify(nextState));
        } catch (error) {
          logger.warn('api', 'Failed to persist state', error);
        }
      }

      // Call change handler if provided
      if (options.onStateChange) {
        options.onStateChange(nextState, prevState);
      }

      return nextState;
    });
  }, [options]);

  const undo = React.useCallback(() => {
    if (options.undoRedo && historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setState(history[historyIndexRef.current]);
    }
  }, [history, options.undoRedo]);

  const redo = React.useCallback(() => {
    if (options.undoRedo && historyIndexRef.current < history.length - 1) {
      historyIndexRef.current++;
      setState(history[historyIndexRef.current]);
    }
  }, [history, options.undoRedo]);

  return {
    state,
    setState: enhancedSetState,
    undo,
    redo,
    canUndo: options.undoRedo && historyIndexRef.current > 0,
    canRedo: options.undoRedo && historyIndexRef.current < history.length - 1,
    history: options.undoRedo ? history : undefined
  };
};

/**
 * Enhanced error boundary that preserves existing error handling
 */
export class EnhancedErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('api', 'Enhanced error boundary caught error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || (() => React.createElement('div', {}, 'Something went wrong'));
      return React.createElement(FallbackComponent);
    }

    return this.props.children;
  }
}

export default {
  enhanceComponent,
  createEnhancedState,
  EnhancedErrorBoundary,
  config: DEFAULT_ENHANCED_CONFIG
};