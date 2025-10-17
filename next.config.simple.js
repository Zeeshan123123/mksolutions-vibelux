/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all optional features for fastest build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Skip image optimization
  },
  // Minimal webpack config
  webpack: (config, { isServer }) => {
    // Only essential fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Faster build
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // Skip static optimization
  experimental: {
    optimizeCss: false,
    webpackBuildWorker: false,
  },
}

module.exports = nextConfig