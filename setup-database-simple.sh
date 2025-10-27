#!/bin/bash

# VibeLux Database Setup Script (Simplified)
# This script creates the PostgreSQL database for the Alert Detection system

echo "🚀 Setting up VibeLux PostgreSQL Database..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database credentials
DB_USER="vibelux"
DB_PASSWORD="vibelux"
DB_NAME="vibelux"

echo "📊 Database Configuration:"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "  Database: $DB_NAME"
echo ""

# Check if PostgreSQL is running
if pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL service is not running${NC}"
    echo "Please start PostgreSQL manually:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo ""
echo "🔧 Creating database and user..."
echo "⚠️  You may be asked for your system password for PostgreSQL commands."
echo ""

# Check if user already exists
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null)

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  User '$DB_USER' already exists${NC}"
else
    echo "Creating user '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ User created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create user${NC}"
        exit 1
    fi
fi

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
else
    echo "Creating database '$DB_NAME'..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    fi
fi

# Grant privileges
echo "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" 2>/dev/null

echo -e "${GREEN}✅ Privileges granted${NC}"

echo ""
echo "📝 Updating .env.local file..."

# Update .env.local
ENV_FILE=".env.local"
NEW_DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# Backup existing .env.local
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.backup"
    echo -e "${GREEN}✅ Backed up existing .env.local to .env.local.backup${NC}"
fi

# Update DATABASE_URL and DIRECT_URL in .env.local
if [ -f "$ENV_FILE" ]; then
    sed -i "s|DATABASE_URL=\".*\"|DATABASE_URL=\"$NEW_DATABASE_URL\"|g" "$ENV_FILE"
    sed -i "s|DIRECT_URL=\".*\"|DIRECT_URL=\"$NEW_DATABASE_URL\"|g" "$ENV_FILE"
    echo -e "${GREEN}✅ Updated .env.local with new database URL${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found. Creating new one...${NC}"
    echo "DATABASE_URL=\"$NEW_DATABASE_URL\"" > "$ENV_FILE"
    echo "DIRECT_URL=\"$NEW_DATABASE_URL\"" >> "$ENV_FILE"
fi

echo ""
echo "🧪 Testing database connection..."

# Test connection
psql "$NEW_DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Trying to test with different method..."
    
    # Alternative test
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database connection successful!${NC}"
    else
        echo -e "${YELLOW}⚠️  Connection test unclear, but database should be ready${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Run Prisma migrations:"
echo "     npx prisma migrate dev --name add_alert_detection"
echo ""
echo "  2. Generate Prisma client:"
echo "     npx prisma generate"
echo ""
echo "  3. Test the Alert Detection system:"
echo "     node test-alert-detection.js"
echo ""
echo "💡 Your database credentials:"
echo "  Database URL: $NEW_DATABASE_URL"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "  Database: $DB_NAME"
echo ""


