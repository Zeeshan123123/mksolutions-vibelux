/**
 * Next.js configuration with optional Clerk disable switch.
 * Set DISABLE_CLERK=1 (or NEXT_PUBLIC_DISABLE_CLERK=1) to route
 * all Clerk imports to lightweight local stubs for builds/tests.
 */

const path = require('path')

const DISABLE = process.env.DISABLE_CLERK === '1' || process.env.NEXT_PUBLIC_DISABLE_CLERK === '1'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Reduce memory pressure during build on Vercel
  swcMinify: false,
  compress: false,
  webpack: (config) => {
    if (DISABLE) {
      const stubPath = path.resolve(__dirname, 'src/lib/stubs/clerk-nextjs/index.js')
      config.resolve = config.resolve || {}
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias['@clerk/nextjs'] = stubPath
      config.resolve.alias['@clerk/nextjs/server'] = stubPath
    }
    return config
  },
}

module.exports = nextConfig