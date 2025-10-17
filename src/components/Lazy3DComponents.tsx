'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy loading wrapper for 3D components
const Loading3D = () => (
  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-sm text-gray-600">Loading 3D Visualization...</span>
    </div>
  </div>
);

// Lazy load all 3D components
export const LazyRoom3DWebGL = lazy(() => import('./Room3DWebGL').then(module => ({ default: module.default })));
export const LazyRoom3DWebGLEnhanced = lazy(() => import('./Room3DWebGLEnhanced').then(module => ({ default: module.default })));
export const LazyRoom3DEnhanced = lazy(() => import('./Room3DEnhanced').then(module => ({ default: module.default })));
export const LazyThreeDPPFDViewer = lazy(() => import('./ThreeDPPFDViewer').then(module => ({ default: module.default })));
export const LazyThreeDPPFDViewerEnhanced = lazy(() => import('./ThreeDPPFDViewerEnhanced').then(module => ({ default: module.default })));
export const LazyMultiTier3DView = lazy(() => import('./MultiTier3DView').then(module => ({ default: module.default })));
export const LazyBiomassGain3DVisualizer = lazy(() => import('./BiomassGain3DVisualizer').then(module => ({ default: module.default })));

// Canvas 3D components
export const LazyCanvas3D = lazy(() => import('./designer/canvas/Canvas3D').then(module => ({ default: module.default })));
export const LazyObjects3D = lazy(() => import('./designer/canvas/Objects3D').then(module => ({ default: module.default })));
export const LazyRoom3D = lazy(() => import('./designer/canvas/Room3D').then(module => ({ default: module.default })));
export const LazyEnhanced3DCanvas = lazy(() => import('./designer/canvas/Enhanced3DCanvas').then(module => ({ default: module.default })));
export const LazyHybridCanvas3D2D = lazy(() => import('./designer/canvas/HybridCanvas3D2D').then(module => ({ default: module.default })));

// Advanced 3D components
export const LazyEnhanced3DVisualization = lazy(() => import('./designer/Enhanced3DVisualization').then(module => ({ default: module.default })));
export const LazyThreeJS3DVisualization = lazy(() => import('./designer/visualization/ThreeJS3DVisualization').then(module => ({ default: module.default })));
export const LazyDigitalTwin3DVisualization = lazy(() => import('./simulation/DigitalTwin3DVisualization').then(module => ({ default: module.default })));
export const LazyDigitalTwinVisualization = lazy(() => import('./operations/DigitalTwinVisualization').then(module => ({ default: module.default })));

// HOC for consistent 3D component loading
export function with3DLoading<T extends object>(Component: ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={<Loading3D />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Export wrapped components for easy use
export const Room3DWebGL = with3DLoading(LazyRoom3DWebGL);
export const Room3DWebGLEnhanced = with3DLoading(LazyRoom3DWebGLEnhanced);
export const Room3DEnhanced = with3DLoading(LazyRoom3DEnhanced);
export const ThreeDPPFDViewer = with3DLoading(LazyThreeDPPFDViewer);
export const ThreeDPPFDViewerEnhanced = with3DLoading(LazyThreeDPPFDViewerEnhanced);
export const MultiTier3DView = with3DLoading(LazyMultiTier3DView);
export const BiomassGain3DVisualizer = with3DLoading(LazyBiomassGain3DVisualizer);

export const Canvas3D = with3DLoading(LazyCanvas3D);
export const Objects3D = with3DLoading(LazyObjects3D);
export const Room3D = with3DLoading(LazyRoom3D);
export const Enhanced3DCanvas = with3DLoading(LazyEnhanced3DCanvas);
export const HybridCanvas3D2D = with3DLoading(LazyHybridCanvas3D2D);

export const Enhanced3DVisualization = with3DLoading(LazyEnhanced3DVisualization);
export const ThreeJS3DVisualization = with3DLoading(LazyThreeJS3DVisualization);
export const DigitalTwin3DVisualization = with3DLoading(LazyDigitalTwin3DVisualization);
export const DigitalTwinVisualization = with3DLoading(LazyDigitalTwinVisualization);