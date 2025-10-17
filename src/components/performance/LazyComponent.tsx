'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  fallback?: React.ComponentType;
  error?: React.ComponentType<{ error: Error; retry: () => void }>;
}

// Generic lazy loading wrapper with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFn);
  
  const DefaultFallback = options.fallback || (() => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      <span className="ml-2 text-gray-400">Loading component...</span>
    </div>
  ));

  const DefaultError = options.error || (({ error, retry }: { error: Error; retry: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-700/50 rounded-lg">
      <p className="text-red-400 mb-2">Failed to load component</p>
      <p className="text-sm text-gray-400 mb-4">{error.message}</p>
      <button 
        onClick={retry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
      >
        Retry
      </button>
    </div>
  ));

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<DefaultFallback />}>
        <ErrorBoundary fallback={DefaultError}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      return (
        <Fallback 
          error={this.state.error} 
          retry={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

// Intersection Observer lazy loading
export function useIntersectionLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (hasLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
}

// Viewport-based lazy loading wrapper
export function ViewportLazyComponent({ 
  children, 
  fallback,
  threshold = 0.1 
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}) {
  const { ref, isVisible } = useIntersectionLazyLoad(threshold);

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <div className="h-48 bg-gray-800/50 animate-pulse rounded-lg" />)}
    </div>
  );
}