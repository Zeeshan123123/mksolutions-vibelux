/**
 * Lazy-loaded 3D components for better performance
 * These components are loaded only when needed to reduce initial bundle size
 */

import { createLazyComponent } from './LazyComponent';

// Lazy load heavy 3D components
export const LazyRoom3DWebGL = createLazyComponent(
  () => import('@/components/Room3DWebGL'),
  {
    fallback: () => (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }
);

export const LazyRoom3DWebGLOptimized = createLazyComponent(
  () => import('@/components/Room3DWebGLOptimized'),
  {
    fallback: () => (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading Optimized 3D View...</p>
        </div>
      </div>
    )
  }
);

export const LazyCADViewer = createLazyComponent(
  () => import('@/components/cad/CADViewer'),
  {
    fallback: () => (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading CAD Viewer...</p>
        </div>
      </div>
    )
  }
);

// Lazy load chart components
export const LazyPerformanceChart = createLazyComponent(
  () => import('@/components/analytics/PerformanceChart'),
  {
    fallback: () => (
      <div className="h-64 bg-gray-800/50 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    )
  }
);

export const LazyHeatmap = createLazyComponent(
  () => import('@/components/analytics/Heatmap'),
  {
    fallback: () => (
      <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg animate-pulse" />
    )
  }
);

// Lazy load ML/AI components
export const LazyMLEngine = createLazyComponent(
  () => import('@/lib/ml/ml-engine').then(module => ({ default: module.MLEngine })),
  {
    fallback: () => (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400 text-xs">Loading AI Engine...</p>
        </div>
      </div>
    )
  }
);

// Lazy load complex calculators
export const LazyLightingCalculator = createLazyComponent(
  () => import('@/components/calculators/LightingCalculator'),
  {
    fallback: () => (
      <div className="h-32 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading calculator...</p>
      </div>
    )
  }
);

export const LazyEnergyCalculator = createLazyComponent(
  () => import('@/components/calculators/EnergyCalculator'),
  {
    fallback: () => (
      <div className="h-32 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading energy calculator...</p>
      </div>
    )
  }
);

// Lazy load admin components
export const LazyAdminDashboard = createLazyComponent(
  () => import('@/components/admin/AdminDashboard'),
  {
    fallback: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }
);

// Export all as a convenient object
export const LazyComponents = {
  Room3DWebGL: LazyRoom3DWebGL,
  Room3DWebGLOptimized: LazyRoom3DWebGLOptimized,
  CADViewer: LazyCADViewer,
  PerformanceChart: LazyPerformanceChart,
  Heatmap: LazyHeatmap,
  MLEngine: LazyMLEngine,
  LightingCalculator: LazyLightingCalculator,
  EnergyCalculator: LazyEnergyCalculator,
  AdminDashboard: LazyAdminDashboard,
} as const;