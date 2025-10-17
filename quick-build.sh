#!/bin/bash

echo "🚀 VibeLux Quick Build Script"
echo "============================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Clean everything first
echo -e "${YELLOW}Cleaning build artifacts...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel
rm -rf public/_next

# 2. Disable some heavy optimizations for faster build
echo -e "${YELLOW}Setting up fast build configuration...${NC}"
export ANALYZE=false
export SKIP_LINTING=true
export DISABLE_SENTRY=true

# 3. Use production mode but with minimal config
echo -e "${YELLOW}Building with optimized settings...${NC}"
NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' npx next build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build completed!${NC}"
else
    echo -e "\n${RED}❌ Build failed${NC}"
fi