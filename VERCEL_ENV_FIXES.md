# 🚨 URGENT: Vercel Environment Variable Fixes

## Critical Variables to ADD to Vercel:

### 1. Clerk Authentication (REQUIRED)
```
CLERK_SECRET_KEY=sk_live_xxxxx (get from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx (get from Clerk dashboard)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Fix Domain References (UPDATE THESE)
```
CLIENT_URL=https://vibelux.ai
NEXT_PUBLIC_APP_URL=https://vibelux.ai
NEXT_PUBLIC_SITE_URL=https://vibelux.ai
NEXT_AUTH_URL=https://vibelux.ai
```

### 3. Add Missing Stripe Price IDs
```
STRIPE_GROWER_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_GROWER_ANNUAL_PRICE_ID=price_xxxxx
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_DESIGN_SOLO_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_DESIGN_SOLO_ANNUAL_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_TEAMS_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_TEAMS_ANNUAL_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxxxx
```

### 4. Add Database Direct URL
```
DIRECT_URL=(same as DATABASE_URL but without connection pooling)
```

## Variables That Look WRONG:

1. **FROM_EMAIL** = `noreply@secondbloomauctions.com` 
   - Should be: `noreply@vibelux.ai`

2. **GOOGLE_SERVICE_ACCOUNT_EMAIL** = `secondbloom-ga-service@secondbloom...`
   - Should be a VibeLux service account

3. **S3_BUCKET_NAME** = `secondbloomauctions`
   - Should be: `vibelux` or similar

4. **ESCROW_COM_WEBHOOK_SECRET** = Points to secondbloom
   - Should be VibeLux webhook

## Variables That Are GOOD ✅:
- STRIPE_SECRET_KEY ✅
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✅
- DATABASE_URL ✅
- AWS keys ✅
- SENDGRID_API_KEY ✅
- Supabase keys ✅

## Steps to Fix:

1. **Go to Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Add all missing CLERK variables**
4. **Update all secondbloom references to vibelux**
5. **Add all Stripe price IDs**
6. **Redeploy**

## To Get Missing Values:

### Clerk Keys:
1. Go to https://dashboard.clerk.com
2. Select your VibeLux application
3. Copy the keys from API Keys section

### Stripe Price IDs:
1. Go to https://dashboard.stripe.com
2. Products → Create products for each tier
3. Copy the price IDs

## Test Locally First:
Create `.env.local` with these values and test:
```bash
npm run build
```

If it builds locally with these env vars, it will work on Vercel.