# VibeLux Production Environment Variables Checklist

## ✅ Already Configured (InfluxDB Cloud)
- `INFLUXDB_URL` = `https://us-east-1-1.aws.cloud2.influxdata.com`
- `INFLUXDB_TOKEN` = `CNgxTJPBTyK98wFuyFV_L0GXKLiOKfOBdvWnBIldi3B1hu4Oci8InvuaAfacIgn9BzVSe4iRfgFFh59_X5yFfA==`
- `INFLUXDB_ORG` = `21b9d85add06d92f`
- `INFLUXDB_BUCKET` = `vibelux-sensors`

## 🔴 Critical - Need Setup ASAP

### Database (PostgreSQL)
- `DATABASE_URL` - **REQUIRED** for user data, projects, fixtures
- `DIRECT_URL` - Same as DATABASE_URL for Prisma

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - **REQUIRED** for user login
- `CLERK_SECRET_KEY` - **REQUIRED** for server-side auth
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/`

### Payment Processing (Stripe)
- `STRIPE_SECRET_KEY` - **REQUIRED** for subscriptions
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **REQUIRED** for checkout
- `STRIPE_WEBHOOK_SECRET` - **REQUIRED** for payment events

## 🟡 Important - For Full Features

### AI Features
- `OPENAI_API_KEY` - For AI design assistant and recommendations

### Email Service
- `EMAIL_API_KEY` - SendGrid or Resend for notifications
- `EMAIL_FROM` = `noreply@vibelux.ai`

### SMS Notifications
- `TWILIO_ACCOUNT_SID` - For SMS alerts
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## 🟢 Optional - Enhanced Features

### AWS Services (for file storage)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` = `us-west-2`
- `AWS_S3_BUCKET` = `vibelux-assets`

### External Integrations
- `ENSAVE_API_KEY` - Energy rebate calculations
- `ATLAS_API_KEY` - Equipment supplier
- `PRIVA_API_KEY` - Climate control integration

### Monitoring
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Analytics

## 🛠️ System Configuration
- `NODE_ENV` = `production`
- `NEXT_PUBLIC_SITE_URL` = `https://www.vibelux.ai`
- `NEXT_PUBLIC_API_URL` = `https://api.vibelux.ai`
- `API_RATE_LIMIT` = `100`
- `API_TIMEOUT` = `30000`

## Feature Flags
- `ENABLE_ENERGY_MONITORING` = `true`
- `ENABLE_AI_FEATURES` = `true`
- `ENABLE_DEMAND_RESPONSE` = `true`

---

## Quick Setup Commands

### For Vercel:
```bash
# Run the setup script
./setup-production-env.sh

# Or manually add critical ones:
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production
```

### For AWS/Other:
Use the values from `.env.influxdb` and this checklist to configure your deployment platform.