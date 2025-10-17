#!/bin/bash

# This script removes quotes from environment variable values
# which can cause issues in Vercel

echo "=== Environment Variables for Vercel (without quotes) ==="
echo ""
echo "Copy these values to your Vercel project settings:"
echo "https://vercel.com/vibelux/vibelux-app/settings/environment-variables"
echo ""
echo "IMPORTANT: Do NOT include the quotes when pasting into Vercel!"
echo ""

# Read the .env.vercel file and remove quotes
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    if [[ -z "$key" || "$key" == \#* ]]; then
        continue
    fi
    
    # Remove surrounding quotes from value
    cleaned_value="${value%\"}"
    cleaned_value="${cleaned_value#\"}"
    
    # For sensitive values, show only partial
    if [[ "$key" == *"SECRET"* || "$key" == *"KEY"* || "$key" == *"TOKEN"* || "$key" == *"PASSWORD"* ]]; then
        if [[ ${#cleaned_value} -gt 10 ]]; then
            echo "$key=${cleaned_value:0:10}...[REDACTED]"
        else
            echo "$key=[REDACTED]"
        fi
    else
        echo "$key=$cleaned_value"
    fi
done < .env.vercel

echo ""
echo "=== Critical Variables Check ==="
echo ""

# Check for critical variables
for var in DATABASE_URL CLERK_SECRET_KEY NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY STRIPE_SECRET_KEY NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY; do
    if grep -q "^$var=" .env.vercel; then
        value=$(grep "^$var=" .env.vercel | cut -d'=' -f2-)
        cleaned_value="${value%\"}"
        cleaned_value="${cleaned_value#\"}"
        echo "✓ $var is set (length: ${#cleaned_value})"
    else
        echo "✗ $var is MISSING"
    fi
done

echo ""
echo "=== Instructions ==="
echo "1. Go to https://vercel.com/vibelux/vibelux-app/settings/environment-variables"
echo "2. Check each variable and remove any quotes from the values"
echo "3. DATABASE_URL should start with: postgres:// or postgresql:// (no quotes)"
echo "4. API keys should be pasted directly without quotes"
echo "5. After updating, trigger a new deployment"