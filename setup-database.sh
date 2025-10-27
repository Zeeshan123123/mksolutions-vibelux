#!/bin/bash

# VibeLux Database Setup Script
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

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL first:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL service is not running. Starting...${NC}"
    sudo systemctl start postgresql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL service started${NC}"
    else
        echo -e "${RED}❌ Failed to start PostgreSQL service${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
fi

echo ""
echo "🔧 Creating database and user..."
echo ""

# Check if user already exists
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  User '$DB_USER' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing user..."
        sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER CASCADE;"
    else
        echo "Keeping existing user..."
    fi
fi

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        echo "Keeping existing database..."
    fi
fi

# Create user if it doesn't exist
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ "$USER_EXISTS" != "1" ]; then
    echo "Creating user '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ User created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create user${NC}"
        exit 1
    fi
fi

# Create database if it doesn't exist
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DB_EXISTS" != "1" ]; then
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
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"

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
    echo "Please check your PostgreSQL configuration"
    exit 1
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

