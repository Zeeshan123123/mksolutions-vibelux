# Stripe Configuration Setup Guide

## Current Issues

1. **Missing Environment Variables in Vercel:**
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (currently named without NEXT_PUBLIC_ prefix)
   - All subscription price IDs are missing
   - Query credit price IDs are missing

2. **Inconsistent Pricing Tiers:**
   - Code references 3 different naming conventions:
     - Grower/Professional/Business (in stripe.ts)
     - Essential/Professional/Enterprise (in webhook)
     - Starter/Pro/Enterprise (in examples)

## Required Steps to Fix

### 1. Create Products in Stripe Dashboard

Log into your Stripe Dashboard and create the following products and prices:

#### Subscription Products:

**1. VibeLux Grower Plan**
- Monthly Price: $29/month (recurring)
- Annual Price: $276/year ($23/month billed annually)

**2. VibeLux Professional Plan**
- Monthly Price: $99/month (recurring)
- Annual Price: $948/year ($79/month billed annually)

**3. VibeLux Business Plan**
- Monthly Price: $299/month (recurring)
- Annual Price: $2,868/year ($239/month billed annually)

#### AI Query Credit Products:

**1. 25 AI Queries**
- One-time payment: $10

**2. 100 AI Queries**
- One-time payment: $35

**3. 500 AI Queries**
- One-time payment: $150

### 2. Update Vercel Environment Variables

After creating products in Stripe, add these environment variables in Vercel:

```bash
# Fix the publishable key name
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Copy the value from your existing STRIPE_PUBLISHABLE_KEY

# Add subscription price IDs
vercel env add STRIPE_GROWER_MONTHLY_PRICE_ID production
vercel env add STRIPE_GROWER_ANNUAL_PRICE_ID production
vercel env add STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID production
vercel env add STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID production
vercel env add STRIPE_BUSINESS_MONTHLY_PRICE_ID production
vercel env add STRIPE_BUSINESS_ANNUAL_PRICE_ID production

# Add query credit price IDs
vercel env add NEXT_PUBLIC_STRIPE_QUERIES_25_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_QUERIES_100_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_QUERIES_500_PRICE_ID production
```

### 3. Fix Naming Inconsistencies

The webhook route expects different environment variables. Either:

Option A: Add these additional variables:
```bash
vercel env add NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL production
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL production
vercel env add NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE production
```

Option B: Update the webhook code to use the existing naming convention.

### 4. Test Price IDs

Example price IDs from Stripe will look like:
- `price_1QFxxxxxxxxxxxxxxxxxxx` (for live mode)
- `price_1QFxxxxxxxxxxxxxxxxxxx` (for test mode)

### 5. Update Local Development

For local development, update your `.env.local`:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_51Qxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Qxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx

# Subscription Price IDs (Test Mode)
STRIPE_GROWER_MONTHLY_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
STRIPE_GROWER_ANNUAL_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx

# Query Credit Price IDs
NEXT_PUBLIC_STRIPE_QUERIES_25_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_QUERIES_100_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_QUERIES_500_PRICE_ID=price_1Qxxxxxxxxxxxxxxxxxx
```

### 6. Webhook Configuration

Make sure your webhook endpoint is configured in Stripe Dashboard:
- Endpoint URL: `https://vibelux.ai/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## Verification Steps

1. Check that all environment variables are set:
   ```bash
   vercel env pull
   ```

2. Test checkout flow:
   - Visit `/pricing` page
   - Click on subscription plan
   - Should redirect to Stripe Checkout

3. Test webhook:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Current Pricing Structure (from stripe.ts)

- **Free**: $0/month
  - 1 grow room
  - 2 saved designs
  - 5 AI queries/month

- **Grower**: $29/month ($23/month annually)
  - 10 grow rooms
  - 50 saved designs
  - 50 AI queries/month
  - 5 CAD imports/month

- **Professional**: $99/month ($79/month annually)
  - 50 grow rooms
  - Unlimited designs
  - 250 AI queries/month
  - 20 CAD imports/month
  - API access

- **Business**: $299/month ($239/month annually)
  - Unlimited everything
  - White label options
  - Dedicated support