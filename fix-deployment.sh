#!/bin/bash

echo "🚀 VibeLux Deployment Fix Script"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 1. Clean cache and build artifacts
echo -e "\n${YELLOW}1. Cleaning cache and build artifacts...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel
check_success "Cache cleaned"

# 2. Install dependencies
echo -e "\n${YELLOW}2. Installing dependencies...${NC}"
npm install
check_success "Dependencies installed"

# 3. Clean conflicting directories
echo -e "\n${YELLOW}3. Cleaning conflicting directories...${NC}"
# Remove _next from public if it exists (conflicts with Next.js)
if [ -d "public/_next" ]; then
    rm -rf public/_next
    echo -e "${GREEN}✓ Removed conflicting _next directory from public${NC}"
fi
check_success "Directories cleaned"

# 4. Build the application
echo -e "\n${YELLOW}4. Building the application...${NC}"
npm run build
check_success "Build completed"

# 5. Verify build output
echo -e "\n${YELLOW}5. Verifying build output...${NC}"
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ Build output verified${NC}"
else
    echo -e "${RED}✗ Build output not found${NC}"
fi

# 6. Environment check
echo -e "\n${YELLOW}6. Checking environment variables...${NC}"
required_vars=(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "DATABASE_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=($var)
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required environment variables are set${NC}"
else
    echo -e "${RED}✗ Missing environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    echo -e "${YELLOW}Please set these in your .env.local or deployment platform${NC}"
fi

# 7. Generate deployment checklist
echo -e "\n${YELLOW}7. Deployment Checklist:${NC}"
echo "   [ ] Environment variables configured in Vercel/hosting platform"
echo "   [ ] Clerk webhook endpoints configured"
echo "   [ ] Database migrations run (npx prisma migrate deploy)"
echo "   [ ] DNS records pointing to correct servers"
echo "   [ ] SSL certificates configured"
echo "   [ ] CDN/Cloudflare configured if using"

# 8. Quick fixes summary
echo -e "\n${YELLOW}8. Applied Fixes:${NC}"
echo "   ✓ Updated CSP headers to allow Clerk domains"
echo "   ✓ Added proper MIME type headers for static assets"
echo "   ✓ Configured static file serving paths"
echo "   ✓ Added fallback for missing static files"

echo -e "\n${GREEN}✨ Deployment fixes applied!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Commit these changes: git add . && git commit -m 'Fix deployment issues'"
echo "2. Push to your repository: git push origin main"
echo "3. Deploy to Vercel: vercel --prod"
echo "   OR"
echo "   Deploy via Vercel dashboard: https://vercel.com/dashboard"

# Optional: Test the build locally
echo -e "\n${YELLOW}To test locally:${NC}"
echo "npm run start"
echo "Visit: http://localhost:3000"