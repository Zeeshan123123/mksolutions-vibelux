#!/bin/bash

echo "🚨 Emergency Deploy Script"
echo "========================"

# 1. First, kill any hanging Node processes
echo "Stopping any hanging build processes..."
pkill -f "node.*next build" || true
pkill -f "node.*webpack" || true

# 2. Clean everything
echo "Cleaning all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel
rm -rf public/_next
rm -rf .swc

# 3. Backup current config
echo "Backing up configuration..."
cp next.config.js next.config.js.backup

# 4. Use minimal config
echo "Using minimal build configuration..."
cp next.config.simple.js next.config.js

# 5. Try a simple build
echo "Starting minimal build..."
NODE_ENV=production npx next build --no-lint

# 6. Restore original config after build
echo "Restoring configuration..."
cp next.config.js.backup next.config.js

echo "✅ Emergency build complete!"
echo ""
echo "If this worked, you can deploy with:"
echo "  vercel --prod"
echo ""
echo "Or start locally with:"
echo "  npm start"