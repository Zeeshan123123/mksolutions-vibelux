# VibeLux Production Configuration 🚀

## Environment Variables Required

### Authentication (Clerk)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Database (Prisma)
```env
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database
```

### Payment Processing (Stripe)
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Price IDs for subscription tiers
NEXT_PUBLIC_STRIPE_PRICE_SOLO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAMS=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

### AI Integrations
```env
# Google Vision API (for Plant Health AI)
GOOGLE_VISION_API_KEY=xxxxx

# Claude AI (via Anthropic)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# AWS Rekognition (optional)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
```

### Analytics & Monitoring
```env
# Vercel Analytics (auto-configured)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxx

# Sentry Error Tracking (optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx
```

### Email Service
```env
# SendGrid or similar
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=support@vibelux.ai
```

## Production Deployment Checklist

### 1. Database Setup
- [ ] Create production PostgreSQL database
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Seed initial data if needed: `npx prisma db seed`

### 2. Authentication (Clerk)
- [ ] Configure production Clerk instance
- [ ] Set up custom domain (optional)
- [ ] Configure OAuth providers (Google, GitHub, etc.)
- [ ] Set up webhook endpoints for user events

### 3. Payment Processing (Stripe)
- [ ] Create Stripe products and prices for each tier
- [ ] Set up webhook endpoint for subscription events
- [ ] Configure customer portal
- [ ] Test payment flow in Stripe test mode first

### 4. Domain & SSL
- [ ] Verify domain ownership in Vercel
- [ ] SSL certificate auto-configured by Vercel
- [ ] Set up www redirect if needed

### 5. Performance Optimizations
- [ ] Enable Vercel Edge Functions
- [ ] Configure CDN for static assets
- [ ] Enable ISR for appropriate pages
- [ ] Set up caching headers

### 6. Security
- [ ] Review and update CSP headers
- [ ] Enable rate limiting on API routes
- [ ] Set up CORS policies
- [ ] Review authentication middleware

### 7. Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical errors

## Production Commands

### Deploy to Production
```bash
# Push to main branch (auto-deploys via Vercel)
git push origin main

# Or manual deploy
vercel --prod
```

### Database Management
```bash
# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (CAUTION!)
npx prisma migrate reset
```

### Monitoring
```bash
# View logs
vercel logs --prod

# Check deployment status
vercel list

# Inspect environment variables
vercel env ls --prod
```

## Feature Flags for Gradual Rollout

### Currently Implemented
- **FREE_TIER_LIMITS**: Enforced (5 fixtures max)
- **AUTHENTICATION**: Soft enforcement (allows limited free access)
- **SUBSCRIPTION_TIERS**: Ready for activation
- **CLOUD_SAVES**: Requires authentication
- **AI_FEATURES**: Credit-based system ready

### Recommended Rollout Strategy

#### Phase 1: Soft Launch (Current)
- ✅ Free access to basic features
- ✅ Authentication optional
- ✅ Subscription tiers visible but not enforced
- ✅ Collect user feedback

#### Phase 2: Authentication Required (Week 1-2)
- Enable mandatory sign-in for advanced features
- Keep basic designer free
- Start collecting user data
- Monitor conversion rates

#### Phase 3: Payment Activation (Week 2-4)
- Enable Stripe integration
- Start charging for subscriptions
- Grandfather early users with special pricing
- Launch affiliate program

#### Phase 4: Full Features (Month 2)
- Enable all AI integrations
- Activate marketplace transactions
- Launch enterprise features
- Enable white-label options

## Performance Targets

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Application Metrics
- **Page Load**: < 3s
- **API Response**: < 500ms
- **Designer Load**: < 2s
- **PPFD Calculation**: < 100ms

### Uptime & Reliability
- **Target Uptime**: 99.9%
- **Error Rate**: < 0.1%
- **API Success Rate**: > 99.5%

## Support & Maintenance

### Customer Support
- **Email**: support@vibelux.ai
- **Response Time**: < 24 hours
- **Priority Support**: Pro+ tiers

### Update Schedule
- **Bug Fixes**: As needed
- **Features**: Bi-weekly
- **Security**: Immediate
- **Major Updates**: Monthly

## Backup & Recovery

### Data Backup
- Database: Daily automated backups
- User designs: Real-time replication
- Retention: 30 days minimum

### Disaster Recovery
- **RTO**: 4 hours
- **RPO**: 1 hour
- **Backup Region**: US-West-2

## Legal & Compliance

### Required Documents
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR Compliance
- [ ] CCPA Compliance

### Data Protection
- User data encrypted at rest
- TLS 1.3 for data in transit
- PCI compliance for payments
- Regular security audits

---

## Quick Start for Production

1. **Set all required environment variables in Vercel**
2. **Run database migrations**
3. **Configure Stripe products**
4. **Enable Clerk production mode**
5. **Deploy to production**

```bash
# Verify everything is ready
npm run build
npm run test
npm run lint

# Deploy
git push origin main
```

## Emergency Contacts

- **Technical Lead**: [Your contact]
- **Vercel Support**: support@vercel.com
- **Stripe Support**: support.stripe.com
- **Clerk Support**: support@clerk.dev

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: READY FOR PRODUCTION 🚀