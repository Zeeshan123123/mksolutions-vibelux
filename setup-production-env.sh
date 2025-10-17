#!/bin/bash

# VibeLux Production Environment Setup Script
# This script sets up all required environment variables for production deployment

echo "🚀 Setting up VibeLux production environment variables..."
echo ""

# Check if we're in the right project
echo "📍 Current Vercel project context:"
vercel project

echo ""
echo "Setting up environment variables..."

# InfluxDB Cloud Configuration
echo "1. Setting up InfluxDB Cloud..."
echo "https://us-east-1-1.aws.cloud2.influxdata.com" | vercel env add INFLUXDB_URL production
echo "CNgxTJPBTyK98wFuyFV_L0GXKLiOKfOBdvWnBIldi3B1hu4Oci8InvuaAfacIgn9BzVSe4iRfgFFh59_X5yFfA==" | vercel env add INFLUXDB_TOKEN production
echo "21b9d85add06d92f" | vercel env add INFLUXDB_ORG production
echo "vibelux-sensors" | vercel env add INFLUXDB_BUCKET production

# Database Configuration (if using Supabase/Neon)
echo "2. Database configuration needed..."
echo "⚠️  You'll need to set DATABASE_URL manually with your PostgreSQL connection string"

# Essential Feature Flags
echo "3. Setting up feature flags..."
echo "true" | vercel env add ENABLE_ENERGY_MONITORING production
echo "true" | vercel env add ENABLE_AI_FEATURES production
echo "true" | vercel env add ENABLE_DEMAND_RESPONSE production

# API Configuration
echo "4. Setting up API configuration..."
echo "100" | vercel env add API_RATE_LIMIT production
echo "30000" | vercel env add API_TIMEOUT production

# Next.js Configuration
echo "5. Setting up Next.js configuration..."
echo "production" | vercel env add NODE_ENV production
echo "https://www.vibelux.ai" | vercel env add NEXT_PUBLIC_SITE_URL production
echo "https://api.vibelux.ai" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "✅ Core environment variables set up!"
echo ""
echo "🔧 Additional setup needed:"
echo "• DATABASE_URL - Your PostgreSQL connection string"
echo "• CLERK_SECRET_KEY - Authentication service"
echo "• STRIPE_SECRET_KEY - Payment processing"
echo "• OPENAI_API_KEY - AI features"
echo ""
echo "Run 'vercel env ls' to see all current environment variables"