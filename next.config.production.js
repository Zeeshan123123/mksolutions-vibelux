/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-optimized build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Aggressive webpack optimizations for large codebase
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Memory optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 200000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            maxSize: 200000
          }
        }
      }
    };
    
    return config;
  },
  productionBrowserSourceMaps: false,
  experimental: {
    webpackBuildWorker: true,
    esmExternals: false,
  },
  // Skip static optimization for faster builds
  output: 'export',
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://accounts.vibelux.ai'
          }
        ]
      }
    ]
  },
}

module.exports = nextConfig