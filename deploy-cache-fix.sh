#!/bin/bash

echo "🚀 Deploying VibeLux with cache fixes..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Create a simple trigger file to force AWS to recognize changes
echo "$(date)" > deployment-trigger-$(date +%s).txt

# Commit this trigger
git add deployment-trigger-*.txt
git commit -m "Force deployment trigger - $(date)"

echo "🔄 Triggering AWS Amplify deployment..."

# Try to push
git push origin main

echo "✅ Deployment triggered!"
echo "🔍 Monitor deployment at: https://console.aws.amazon.com/amplify/home#/durvkgx9msa7n"
echo "🌐 Site will be live at: https://vibelux.ai in 2-3 minutes"

echo "💡 If cache issues persist:"
echo "   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "   - Incognito/Private browsing"
echo "   - Different browser"