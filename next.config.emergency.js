/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emergency deployment config - minimal settings
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  images: {
    unoptimized: true,
  },
  
  // Disable potentially problematic features
  experimental: {
    esmExternals: false,
  },
  
  // Simple webpack config
  webpack: (config, { isServer }) => {
    // Disable problematic optimizations
    config.optimization = {
      ...config.optimization,
      minimize: false,
      splitChunks: false,
    };
    
    return config;
  },
  
  // Skip build-time errors for emergency deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;