#!/bin/bash

# VibeLux Production Deployment Script for vibelux.ai
# This script prepares and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting VibeLux Production Deployment for vibelux.ai"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check for required environment files
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found. Please create it with your production variables.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment Checklist${NC}"
echo "1. ✅ Project directory verified"
echo "2. ✅ Production environment file found"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --only=production

# Build the application
echo -e "${YELLOW}🔨 Building application for production...${NC}"
NODE_ENV=production npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# Run type checking
echo -e "${YELLOW}🔍 Running TypeScript type checking...${NC}"
npm run type-check

# Run linting
echo -e "${YELLOW}🧹 Running ESLint...${NC}"
npm run lint

echo -e "${GREEN}✅ Pre-deployment checks completed successfully!${NC}"
echo ""
echo -e "${YELLOW}🌐 Ready for deployment to vibelux.ai${NC}"
echo ""
echo "Next steps:"
echo "1. Configure your hosting provider (Vercel, Netlify, etc.)"
echo "2. Set up your production environment variables in your hosting dashboard"
echo "3. Configure your custom domain (vibelux.ai) in your hosting settings"
echo "4. Set up your production database"
echo "5. Configure Clerk authentication with production keys"
echo ""
echo -e "${GREEN}🎉 VibeLux is ready for production deployment!${NC}"

# Optional: Start production server locally for testing
read -p "Would you like to start the production server locally for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚀 Starting production server on http://localhost:3000${NC}"
    npm start
fi