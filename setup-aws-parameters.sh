#!/bin/bash

# Setup AWS Systems Manager Parameters for VibeLux Production
# This script helps you securely store all environment variables in AWS

set -e

echo "🔐 VibeLux AWS Parameter Store Setup"
echo "===================================="

REGION="us-east-1"
ENV_PREFIX="/vibelux/production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to store parameter
store_parameter() {
    local param_name="$1"
    local param_description="$2"
    local is_secret="${3:-true}"
    
    echo -e "${YELLOW}Setting up: $param_description${NC}"
    read -p "Enter value for $param_name: " -s param_value
    echo ""
    
    if [ -z "$param_value" ]; then
        echo -e "${RED}❌ Value cannot be empty${NC}"
        return 1
    fi
    
    local param_type="String"
    if [ "$is_secret" = "true" ]; then
        param_type="SecureString"
    fi
    
    aws ssm put-parameter \
        --name "$ENV_PREFIX/$param_name" \
        --value "$param_value" \
        --type "$param_type" \
        --description "$param_description" \
        --region "$REGION" \
        --overwrite > /dev/null
    
    echo -e "${GREEN}✅ Stored: $param_name${NC}"
    echo ""
}

echo "This script will help you store all required environment variables securely in AWS Systems Manager Parameter Store."
echo ""
echo -e "${YELLOW}⚠️  Important: Keep these values secure and never share them${NC}"
echo ""

# Database
echo -e "${YELLOW}📊 Database Configuration${NC}"
store_parameter "database-url" "PostgreSQL database connection URL" true

# Clerk Authentication
echo -e "${YELLOW}🔐 Clerk Authentication${NC}"
store_parameter "clerk-publishable-key" "Clerk publishable key (pk_live_...)" false
store_parameter "clerk-secret-key" "Clerk secret key (sk_live_...)" true
store_parameter "clerk-webhook-secret" "Clerk webhook secret (whsec_...)" true

# Security
echo -e "${YELLOW}🛡️  Security Keys${NC}"
store_parameter "nextauth-secret" "NextAuth secret (32+ characters)" true
store_parameter "encryption-key" "Encryption key (32 characters)" true
store_parameter "csrf-secret" "CSRF secret key" true

# API Keys
echo -e "${YELLOW}🤖 AI/ML APIs${NC}"
store_parameter "openai-api-key" "OpenAI API key (sk-...)" true
store_parameter "anthropic-api-key" "Anthropic API key (sk-ant-...)" true

# Payment Processing
echo -e "${YELLOW}💳 Payment Processing${NC}"
store_parameter "stripe-publishable-key" "Stripe publishable key (pk_live_...)" false
store_parameter "stripe-secret-key" "Stripe secret key (sk_live_...)" true
store_parameter "stripe-webhook-secret" "Stripe webhook secret (whsec_...)" true

# Email Service
echo -e "${YELLOW}📧 Email Service${NC}"
store_parameter "smtp-host" "SMTP host" false
store_parameter "smtp-port" "SMTP port (587)" false
store_parameter "smtp-user" "SMTP username" false
store_parameter "smtp-pass" "SMTP password" true

# External Services
echo -e "${YELLOW}☁️  External Services${NC}"
store_parameter "cloudinary-cloud-name" "Cloudinary cloud name" false
store_parameter "cloudinary-api-key" "Cloudinary API key" false
store_parameter "cloudinary-api-secret" "Cloudinary API secret" true

# Analytics
echo -e "${YELLOW}📈 Analytics & Monitoring${NC}"
store_parameter "google-analytics-id" "Google Analytics ID (G-...)" false
store_parameter "sentry-dsn" "Sentry DSN URL" false

echo -e "${GREEN}🎉 All parameters stored successfully!${NC}"
echo ""
echo "You can now deploy your application using:"
echo "  ./deploy-aws.sh"
echo ""
echo "To verify stored parameters:"
echo "  aws ssm get-parameters-by-path --path $ENV_PREFIX --recursive --region $REGION"