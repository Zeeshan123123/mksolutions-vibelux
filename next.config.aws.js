/** @type {import('next').NextConfig} */

const path = require('path');

const nextConfig = {
  // Enable standalone mode for Docker deployment
  output: 'standalone',
  
  // Optimize for production
  swcMinify: true,
  compress: true,
  
  // Performance optimizations
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
    // Optimize bundle size
    optimizeCss: true,
    // Enable partial prerendering for better performance
    ppr: false, // Disable for compatibility
  },
  
  // Environment configuration
  env: {
    NEXT_RUNTIME: 'nodejs',
    NODE_ENV: 'production',
  },
  
  // Image optimization for CloudFront
  images: {
    domains: ['vibelux.ai', 'assets.vibelux.ai'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate Prisma client for better caching
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'prisma',
            priority: 10,
            chunks: 'all',
          },
          // Separate UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
            name: 'ui',
            priority: 5,
            chunks: 'all',
          },
        },
      },
    };
    
    // Reduce bundle size by excluding unnecessary files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // Production optimizations
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // TypeScript configuration
  typescript: {
    // Allow production builds even if there are TypeScript errors
    // Remove this in production if you want strict type checking
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Disable ESLint during builds for faster deployment
    ignoreDuringBuilds: false,
  },
  
  // Logging configuration for production
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Disable telemetry in production
  telemetry: false,
  
  // Server-side configuration
  serverRuntimeConfig: {
    // Runtime config for server-side only
  },
  
  // Public runtime configuration
  publicRuntimeConfig: {
    // Runtime config for both server and client
  },
  
  // Redirects and rewrites
  async redirects() {
    return [
      // Add any redirects needed for production
    ];
  },
  
  async rewrites() {
    return [
      // Add any rewrites needed for production
    ];
  },
};

module.exports = nextConfig;