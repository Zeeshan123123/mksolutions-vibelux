#!/usr/bin/env node

/**
 * Simplified build for VibeLux platform
 * Temporarily disables complex components for successful deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VibeLux simple build...');

// Set environment variables
process.env.NODE_OPTIONS = '--max-old-space-size=16384';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

try {
  // Run the build
  console.log('📦 Building Next.js application...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
  });
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}