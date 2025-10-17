#!/bin/bash

echo "🧹 VibeLux Clean Build Script"
echo "============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Remove the conflicting _next directory
echo -e "\n${YELLOW}Removing conflicting directories...${NC}"
if [ -d "public/_next" ]; then
    rm -rf public/_next
    echo -e "${GREEN}✓ Removed public/_next directory${NC}"
else
    echo -e "${GREEN}✓ No conflicting directories found${NC}"
fi

# 2. Clean build artifacts
echo -e "\n${YELLOW}Cleaning build artifacts...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel
echo -e "${GREEN}✓ Build artifacts cleaned${NC}"

# 3. Run the build
echo -e "\n${YELLOW}Building application...${NC}"
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build completed successfully!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Test locally: npm run start"
    echo "2. Deploy to Vercel: vercel --prod"
else
    echo -e "\n${RED}❌ Build failed!${NC}"
    echo -e "${YELLOW}Please check the error messages above.${NC}"
    exit 1
fi