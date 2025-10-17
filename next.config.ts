import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better error detection
  reactStrictMode: true,
  
  // Configure headers for CSP and security
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '0' // Disabled in favor of CSP
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Configure for CSP nonce support
  experimental: {
    // Enable experimental features for better CSP support
  },
  
  // Ensure proper handling of external scripts
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Allow images from required domains
  images: {
    domains: [
      'localhost',
      'vibelux.ai',
      'images.clerk.dev',
      'img.clerk.com',
      'www.gravatar.com',
      'lh3.googleusercontent.com',
      'res.cloudinary.com',
      'api.dicebear.com',
      'ui-avatars.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '**.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      }
    ]
  }
};

export default nextConfig;
