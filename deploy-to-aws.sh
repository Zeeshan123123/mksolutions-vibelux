#!/bin/bash

# VibeLux AWS Deployment Script
echo "🚀 Deploying VibeLux Enterprise Platform to AWS"
echo "================================================"

# Configuration
S3_BUCKET="vibelux-platform-prod"
DISTRIBUTION_ID="E37APIDWTTZ0VF"

# Build the application with AWS configuration
echo "🏗️ Building VibeLux with AWS optimizations..."
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Use AWS-specific configuration
cp next.config.aws.js next.config.js.backup
cp next.config.aws.js next.config.js

# Build with high memory allocation
NODE_OPTIONS="--max-old-space-size=16384" npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed - check the errors above"
    # Restore original config
    if [ -f next.config.js.backup ]; then
        mv next.config.js.backup next.config.js
    fi
    exit 1
fi

# Create S3 bucket if it doesn't exist
aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'
if [ $? -eq 0 ]; then
    echo "Creating S3 bucket: $S3_BUCKET"
    aws s3 mb "s3://$S3_BUCKET"
fi

# Deploy to S3
echo "📦 Uploading to S3..."
if [ -d "out" ]; then
    # Upload static files with long cache
    aws s3 sync out/_next/static/ "s3://$S3_BUCKET/_next/static/" --cache-control "public,max-age=31536000,immutable" --delete
    
    # Upload other files with shorter cache
    aws s3 sync out/ "s3://$S3_BUCKET/" --cache-control "public,max-age=3600" --exclude "_next/static/*" --delete
    
    echo "✅ Files uploaded to S3"
else
    echo "❌ No 'out' directory found - build may have failed"
    exit 1
fi

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

# Restore original Next.js config
if [ -f next.config.js.backup ]; then
    mv next.config.js.backup next.config.js
fi

echo ""
echo "🎉 VibeLux deployment completed!"
echo "🌐 Your platform is live at: https://d2jjniqi3t1tor.cloudfront.net"
echo ""
echo "Next steps:"
echo "1. Test your deployment"
echo "2. Set up custom domain (optional)"
echo "3. Configure monitoring"