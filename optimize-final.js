#!/usr/bin/env node

/**
 * Final Build Optimization Script
 * Applies all remaining optimizations for fastest possible build
 */

const fs = require('fs');
const path = require('path');

class FinalOptimizer {
  constructor() {
    this.optimizations = [];
  }

  log(message) {
    console.log(`[OPTIMIZER] ${message}`);
  }

  addOptimization(name, fn) {
    this.optimizations.push({ name, fn });
  }

  async runAll() {
    this.log('Starting final build optimizations...');
    
    for (const { name, fn } of this.optimizations) {
      try {
        this.log(`Applying: ${name}`);
        await fn();
        this.log(`✅ Completed: ${name}`);
      } catch (error) {
        this.log(`❌ Failed: ${name} - ${error.message}`);
      }
    }
    
    this.log('All optimizations completed!');
  }

  // Optimization 1: Update Sentry file structure
  optimizeSentryConfig() {
    const sentryClientPath = path.join(__dirname, 'sentry.client.config.ts');
    const instrumentationClientPath = path.join(__dirname, 'instrumentation-client.ts');
    
    if (fs.existsSync(sentryClientPath) && !fs.existsSync(instrumentationClientPath)) {
      const content = fs.readFileSync(sentryClientPath, 'utf8');
      fs.writeFileSync(instrumentationClientPath, content);
      this.log('Created instrumentation-client.ts from sentry.client.config.ts');
    }
  }

  // Optimization 2: Enable experimental features for production
  enableProductionFeatures() {
    const nextConfigPath = path.join(__dirname, 'next.config.js');
    let content = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Re-enable optimized experimental features
    content = content.replace(
      /optimizeCss: false,/g,
      'optimizeCss: true,'
    );
    content = content.replace(
      /webpackBuildWorker: false,/g,
      'webpackBuildWorker: true,'
    );
    content = content.replace(
      /optimizePackageImports: \[\],/g,
      "optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],"
    );
    
    fs.writeFileSync(nextConfigPath, content);
    this.log('Re-enabled production optimization features');
  }

  // Optimization 3: Create build cache directory
  createBuildCache() {
    const cacheDir = path.join(__dirname, '.next', 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      this.log('Created build cache directory');
    }
  }

  // Optimization 4: Optimize package.json scripts
  optimizeScripts() {
    const packagePath = path.join(__dirname, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add optimized build script
    pkg.scripts['build:fast'] = 'NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 next build';
    pkg.scripts['build:analyze'] = 'cross-env ANALYZE=true npm run build:fast';
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    this.log('Added optimized build scripts');
  }

  // Optimization 5: Create .env.production for build optimizations
  createProductionEnv() {
    const envPath = path.join(__dirname, '.env.production');
    const envContent = `# Production build optimizations
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
NEXT_PHASE=phase-production-build
SKIP_ENV_VALIDATION=true

# Disable heavy features during build
DISABLE_SENTRY_SOURCE_MAPS=true
DISABLE_WEBPACK_ANALYZE=true
`;
    
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envContent);
      this.log('Created .env.production with build optimizations');
    }
  }

  // Setup all optimizations
  setup() {
    this.addOptimization('Optimize Sentry Configuration', () => this.optimizeSentryConfig());
    this.addOptimization('Enable Production Features', () => this.enableProductionFeatures());
    this.addOptimization('Create Build Cache', () => this.createBuildCache());
    this.addOptimization('Optimize Scripts', () => this.optimizeScripts());
    this.addOptimization('Create Production Environment', () => this.createProductionEnv());
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new FinalOptimizer();
  optimizer.setup();
  optimizer.runAll().then(() => {
    console.log('\n🚀 Build optimization complete!');
    console.log('Run "npm run build:fast" for optimized build');
    console.log('Run "npm run build:monitor" to monitor performance');
  }).catch(console.error);
}

module.exports = FinalOptimizer;