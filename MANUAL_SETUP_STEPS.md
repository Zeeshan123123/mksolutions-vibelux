# VibeLux Manual Setup Steps

This guide contains all the manual steps you need to complete to fully set up the VibeLux application with authentication and payments.

## ✅ Completed Setup

I've already implemented:
1. **Stripe Webhook Handlers** - All subscription events are handled
2. **Clerk Webhook Integration** - Creates Stripe customers on signup
3. **Subscription Context** - Fetches real subscription data
4. **Pricing Page Integration** - Checkout buttons connected
5. **Success Message Handler** - Shows confirmation after payment
6. **Environment Variable Template** - Complete list of required vars
7. **Stripe Setup Script** - Automated product creation

## 📋 Manual Steps Required

### 1. Set Up Stripe Products (5 minutes)

```bash
# In your terminal:
cd /Users/blakelange/vibelux-app

# Set your Stripe secret key (get from https://dashboard.stripe.com/apikeys)
export STRIPE_SECRET_KEY=sk_test_... # Use your actual key

# Run the setup script
./scripts/run-stripe-setup.sh

# Copy the output environment variables for step 3
```

### 2. Configure Stripe Webhook (5 minutes)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://vibelux.vercel.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`  
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### 3. Add Environment Variables to Vercel (10 minutes)

Go to: https://vercel.com/[your-team]/vibelux-app/settings/environment-variables

Add these variables for **Production** environment:

#### Database
- `DATABASE_URL` - Your PostgreSQL connection string
- `DIRECT_URL` - Same as DATABASE_URL

#### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `CLERK_WEBHOOK_SECRET` - From Clerk webhook settings

#### Stripe Core
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - From step 2 above

#### Stripe Price IDs (from setup script output)
- `STRIPE_GROWER_MONTHLY_PRICE_ID`
- `STRIPE_GROWER_ANNUAL_PRICE_ID`
- `STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID`
- `STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID`
- `STRIPE_BUSINESS_MONTHLY_PRICE_ID`
- `STRIPE_BUSINESS_ANNUAL_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_QUERIES_25_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_QUERIES_100_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_QUERIES_500_PRICE_ID`

#### App Configuration
- `NEXT_PUBLIC_APP_URL` - `https://vibelux.vercel.app` (or your custom domain)
- `NODE_ENV` - `production`

### 4. Configure Clerk Webhook (5 minutes)

1. Go to Clerk Dashboard > Webhooks
2. Create endpoint with URL: `https://vibelux.vercel.app/api/webhooks/clerk`
3. Select "user.created" event
4. Copy the signing secret and add as `CLERK_WEBHOOK_SECRET` in Vercel

### 5. Update Database Schema (5 minutes)

```bash
# Ensure your database has the subscription fields
npx prisma db push

# Or if using migrations:
npx prisma migrate deploy
```

### 6. Test the Integration (5 minutes)

1. Visit https://vibelux.vercel.app/pricing
2. Click "Start Free Trial" on any paid plan
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify you're redirected to dashboard with success message
6. Check user in database has subscription fields updated

### 7. Configure Stripe Customer Portal (2 minutes)

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Activate the customer portal
3. Configure:
   - Allow customers to cancel subscriptions
   - Allow switching plans
   - Allow updating payment methods

## 🔍 Verification Checklist

- [ ] Stripe products created and price IDs saved
- [ ] All environment variables added to Vercel
- [ ] Stripe webhook endpoint configured and active
- [ ] Clerk webhook endpoint configured
- [ ] Test checkout flow works end-to-end
- [ ] Subscription data appears in database
- [ ] Customer portal accessible from user settings

## 🚨 Troubleshooting

### Checkout not working
- Check browser console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Ensure price IDs are correctly set

### Webhooks not processing
- Check webhook signing secrets match
- Look at Stripe webhook logs for errors
- Check Vercel function logs

### Subscription not updating
- Verify database connection
- Check Prisma schema has subscription fields
- Look at webhook handler logs

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Review Stripe webhook event logs
3. Verify all environment variables are set correctly
4. Ensure database migrations are applied