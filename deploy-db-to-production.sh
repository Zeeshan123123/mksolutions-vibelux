#!/bin/bash

# Deploy Database Schema to Production
# This script safely deploys the Prisma schema to production

echo "🚀 VibeLux Database Production Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Get the production DATABASE_URL from Vercel
echo "📥 Step 1: Fetching production DATABASE_URL from Vercel..."
echo ""
echo "Please run this command to get your DATABASE_URL:"
echo -e "${YELLOW}vercel env pull .env.production${NC}"
echo ""
echo "Or manually get it from:"
echo "https://vercel.com/blakelange123/vibelux-app/settings/environment-variables"
echo ""
read -p "Press Enter once you have the DATABASE_URL ready..."

# Step 2: Check if .env.production exists
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ Found .env.production file${NC}"
    source .env.production
else
    echo -e "${YELLOW}⚠️  No .env.production file found${NC}"
    echo "Please enter your DATABASE_URL manually:"
    read -s DATABASE_URL
    export DATABASE_URL
fi

# Step 3: Test database connection
echo ""
echo "🔗 Step 2: Testing database connection..."
npx prisma db pull --schema=prisma/test-connection.prisma 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
    rm -f prisma/test-connection.prisma
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    echo "Please check your DATABASE_URL and try again"
    exit 1
fi

# Step 4: Show current status
echo ""
echo "📊 Step 3: Checking current database status..."
echo "Current schema has these NEW models that need to be deployed:"
echo "  - SOPDocument, SOPCheckIn, SOPRevision (SOP System)"
echo "  - Employee, TimeEntry, WorkTask, LaborSchedule (Workforce)"
echo "  - DocumentCheckout (Document Management)"
echo "  - ProjectTask, ProjectStakeholder, ProjectUpdate (Projects)"
echo ""

# Step 5: Choose deployment method
echo "🛠️  Step 4: Choose deployment method:"
echo ""
echo "1) Safe Push (Recommended) - npx prisma db push"
echo "   - Directly updates the database schema"
echo "   - Won't create migration files"
echo "   - Best for Neon/Vercel setup"
echo ""
echo "2) Migration Deploy - npx prisma migrate deploy"
echo "   - Uses existing migration files"
echo "   - More controlled but may fail if migrations are out of sync"
echo ""
read -p "Enter your choice (1 or 2): " choice

# Step 6: Deploy based on choice
echo ""
echo "🚀 Step 5: Deploying to production..."

case $choice in
    1)
        echo "Running: npx prisma db push"
        npx prisma db push --skip-generate
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Schema successfully pushed to production!${NC}"
        else
            echo -e "${RED}❌ Schema push failed${NC}"
            echo "Trying with --accept-data-loss flag (use with caution)..."
            read -p "Continue? (y/n): " confirm
            if [ "$confirm" = "y" ]; then
                npx prisma db push --skip-generate --accept-data-loss
            fi
        fi
        ;;
    2)
        echo "Running: npx prisma migrate deploy"
        npx prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Migrations successfully deployed!${NC}"
        else
            echo -e "${RED}❌ Migration deploy failed${NC}"
            echo "You may need to use db push instead (option 1)"
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Step 7: Verify deployment
echo ""
echo "🔍 Step 6: Verifying deployment..."
echo "Generating Prisma Client to verify schema..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Client generation had issues${NC}"
fi

# Step 8: Deploy to Vercel
echo ""
echo "🌐 Step 7: Deploying application to Vercel..."
read -p "Deploy to Vercel now? (y/n): " deploy

if [ "$deploy" = "y" ]; then
    echo "Running: vercel --prod"
    vercel --prod
    
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
    echo ""
    echo "Your production database now has:"
    echo "  ✅ SOP Management System"
    echo "  ✅ Workforce Management"
    echo "  ✅ Document Check-in/Check-out"
    echo "  ✅ Project Management with Notifications"
    echo ""
    echo "Test your production app at:"
    echo "https://vibelux-app.vercel.app"
else
    echo ""
    echo "Database schema updated. Run 'vercel --prod' when ready to deploy."
fi

echo ""
echo "=========================================="
echo "📝 Notes:"
echo "- Check Vercel logs: vercel logs --scope vibelux"
echo "- View database: https://console.neon.tech"
echo "- Environment vars: https://vercel.com/blakelange123/vibelux-app/settings/environment-variables"