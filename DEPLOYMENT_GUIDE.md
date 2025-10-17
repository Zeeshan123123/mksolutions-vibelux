# VibeLux Production Deployment Guide

This guide will walk you through deploying VibeLux to production. Estimated time: 2-3 hours.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Service Setup](#service-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Deployment](#deployment)
6. [Post-Deployment](#post-deployment)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- [ ] A domain name (e.g., vibelux.com)
- [ ] GitHub account (for deployment)
- [ ] Credit card for service signups
- [ ] 2-3 hours of uninterrupted time

---

## Service Setup

### 1. Vercel Account (Hosting)
**Time: 5 minutes**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. No configuration needed yet

### 2. PostgreSQL Database (Supabase)
**Time: 10 minutes**

1. Go to [supabase.com](https://supabase.com)
2. Create new project:
   - Project name: `vibelux-prod`
   - Database password: Generate strong password (SAVE THIS!)
   - Region: Choose closest to your users
3. Wait for project to initialize (~2 minutes)
4. Go to Settings → Database
5. Copy the "Connection string" - you'll need this

### 3. Clerk Authentication
**Time: 15 minutes**

1. Go to [clerk.com](https://clerk.com)
2. Sign up and create new application:
   - Application name: `VibeLux`
   - Sign-in options: Enable Email, Google, and optionally others
3. In Clerk Dashboard:
   - Go to "API Keys"
   - Copy both keys:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
4. Configure sign-up/sign-in pages:
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Email address" as identifier
   - Enable "Password" as authentication factor
5. Set up redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/onboarding`

### 4. Stripe Payment Processing
**Time: 20 minutes**

1. Go to [stripe.com](https://stripe.com)
2. Create account and activate it
3. In Stripe Dashboard:
   - Switch to "Test mode" initially
   - Go to "Developers" → "API keys"
   - Copy:
     - `STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
4. Create Products:
   - Go to "Products" → "Add product"
   - Create these products:
     ```
     Starter Plan - $299/month
     Professional Plan - $799/month
     Enterprise Plan - Custom pricing
     ```
5. Create Webhook:
   - Go to "Developers" → "Webhooks"
   - Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the "Signing secret" as `STRIPE_WEBHOOK_SECRET`

### 5. SendGrid Email Service
**Time: 15 minutes**

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account (100 emails/day free)
3. Complete sender verification:
   - Go to "Settings" → "Sender Authentication"
   - Choose "Single Sender Verification"
   - Add your email (e.g., noreply@vibelux.com)
   - Verify the email
4. Create API Key:
   - Go to "Settings" → "API Keys"
   - Create key with "Full Access"
   - Copy as `SENDGRID_API_KEY`

### 6. OpenAI (Optional but Recommended)
**Time: 5 minutes**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Go to "API keys" → "Create new secret key"
4. Copy as `OPENAI_API_KEY`

---

## Environment Configuration

### 1. Create Production Environment File

Create `.env.production.local` in your project root:

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"

# Authentication (from Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Payments (from Stripe)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (from SendGrid)
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@vibelux.com"

# AI Features (from OpenAI)
OPENAI_API_KEY="sk-..."

# App Configuration
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-random-32-char-string"

# Optional: Advanced Features
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""

# Optional: Monitoring
SENTRY_DSN=""
```

### 2. Generate Secure Secrets

For `NEXTAUTH_SECRET`, generate a secure random string:
```bash
openssl rand -base64 32
```

---

## Database Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Push Schema to Production
```bash
npx prisma db push
```

### 4. Run Migrations
```bash
npx prisma migrate deploy
```

### 5. (Optional) Seed Initial Data
```bash
npx prisma db seed
```

---

## Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Add production configuration"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: Default
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add each variable from your `.env.production.local`
   - ⚠️ Make sure to add them for "Production" environment
6. Click "Deploy"
7. Wait for deployment (~5 minutes)

### 3. Configure Custom Domain (Optional)

1. In Vercel project settings → "Domains"
2. Add your domain (e.g., vibelux.com)
3. Follow DNS configuration instructions

---

## Post-Deployment

### 1. Update Stripe Webhook URL

1. Go back to Stripe Dashboard
2. Update webhook endpoint to your production URL:
   - `https://vibelux.com/api/webhooks/stripe` (or your actual domain)

### 2. Update Clerk URLs

1. Go to Clerk Dashboard
2. Update production URLs in "Paths" section

### 3. Configure CORS (if needed)

In `next.config.js`, add your domain to allowed origins.

### 4. Set Up Monitoring (Recommended)

1. Sign up for [Sentry](https://sentry.io)
2. Create new project
3. Add `SENTRY_DSN` to environment variables
4. Redeploy

---

## Testing Checklist

### Critical User Flows

- [ ] **Authentication**
  - [ ] Sign up with email
  - [ ] Email verification works
  - [ ] Sign in works
  - [ ] Password reset works
  - [ ] Sign out works

- [ ] **Payments**
  - [ ] Stripe checkout loads
  - [ ] Test payment succeeds (use `4242 4242 4242 4242`)
  - [ ] Subscription appears in dashboard
  - [ ] Webhook creates user subscription

- [ ] **Core Features**
  - [ ] Calculators compute correctly
  - [ ] 3D Designer loads
  - [ ] Can save projects
  - [ ] PDF export works

- [ ] **Email**
  - [ ] Welcome email sent on signup
  - [ ] Payment confirmation sent
  - [ ] Password reset email works

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL certificate working

---

## Troubleshooting

### Common Issues

#### "Invalid Database URL"
- Check DATABASE_URL format
- Ensure no extra spaces
- Try connection pooling URL from Supabase

#### "Clerk API Error"
- Verify you're using production keys (start with `pk_live_`)
- Check domain is added to Clerk allowed origins

#### "Stripe Webhook Failed"
- Ensure webhook secret matches
- Check webhook URL is exact
- Verify events are selected

#### "Emails Not Sending"
- Verify sender email is authenticated in SendGrid
- Check API key permissions
- Look for bounced emails in SendGrid dashboard

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test database connection
npx prisma db pull

# Validate schema
npx prisma validate
```

---

## Going Live Checklist

### Before Launch
- [ ] Switch Stripe from test to live mode
- [ ] Update Stripe API keys to production
- [ ] Test with real payment
- [ ] Set up Google Analytics
- [ ] Configure SEO metadata
- [ ] Submit sitemap to Google

### After Launch
- [ ] Monitor error logs (Vercel Functions)
- [ ] Check Stripe webhook success rate
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Configure backups

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console for errors
3. Check service dashboards (Clerk, Stripe, etc.)
4. Database issues: `npx prisma studio` to inspect

For VibeLux-specific issues, check:
- `/api/health` - API health check
- `/api/debug/env` - Environment variable check (remove in production!)

---

## Cost Estimates

Monthly costs for small-medium operation:
- Vercel: $0-20 (Free tier usually sufficient)
- Supabase: $0-25 (Free tier includes 500MB)
- Clerk: $0-25 (Free up to 5,000 users)
- Stripe: 2.9% + $0.30 per transaction
- SendGrid: $0-15 (Free tier: 100 emails/day)
- OpenAI: $5-50 (depending on usage)

**Total: ~$20-50/month + Stripe fees**

---

## Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] Database has strong password
- [ ] Webhook endpoints verify signatures
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] XSS protection headers configured

---

Congratulations! Your VibeLux platform should now be live! 🎉