/** @type {import('next').NextConfig} */

/**
 * Memory-optimized Next.js configuration for VibeLux enterprise platform
 * Designed to handle 4,400+ TypeScript files with lazy loading and chunking
 */

const path = require('path');

let withBundleAnalyzer;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (error) {
  withBundleAnalyzer = (config) => config;
}

const nextConfig = {
  // Build optimizations for large codebases
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Experimental features for performance
  experimental: {
    // Optimize CSS for production builds
    optimizeCss: true,
    // Use SWC for faster transforms
    forceSwcTransforms: true,
    // Enable modern JavaScript features
    esmExternals: true,
  },
  
  // Image optimization
  images: {
    unoptimized: false, // Enable optimization
    domains: ['vibelux.ai', 'vibelux.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Performance optimizations
  productionBrowserSourceMaps: false,
  
  // Memory-optimized webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Memory optimization for large builds
    config.optimization = {
      ...config.optimization,
      
      // Smart chunk splitting for lazy loading
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          
          // 3D visualization components
          threejs: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'threejs',
            chunks: 'all',
            priority: 20,
          },
          
          // Charts and visualization
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3|plotly)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 15,
          },
          
          // UI components
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 5,
          },
          
          // Heavy analysis components
          analysis: {
            test: /[\\/]src[\\/]components[\\/].*(?:Analysis|CFD|3D|Visualization).*\.tsx?$/,
            name: 'analysis',
            chunks: 'all',
            priority: 8,
          },
          
          // Dashboard components
          dashboards: {
            test: /[\\/]src[\\/]components[\\/].*Dashboard.*\.tsx?$/,
            name: 'dashboards',
            chunks: 'all',
            priority: 8,
          }
        },
      },
      
      // Optimize runtime chunk
      runtimeChunk: {
        name: 'runtime',
      },
    };
    
    // Reduce memory pressure during builds
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.concatenateModules = false; // Reduce memory usage
    }
    
    // Optimize module resolution for large codebases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
  
  // Server external packages
  serverExternalPackages: ['sharp', 'canvas'],
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);