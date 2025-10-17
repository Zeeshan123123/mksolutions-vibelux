# VibeLux Production Deployment Checklist

## 🚨 CRITICAL - Must Complete Before Going Live

### 1. Authentication (Clerk)
- [ ] Switch from test to production keys
- [ ] Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` with production key
- [ ] Update `CLERK_SECRET_KEY` with production key
- [ ] Test sign-in/sign-up flow

### 2. Database Setup
- [ ] Provision production PostgreSQL database
- [ ] Update `DATABASE_URL` in Vercel environment variables
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Set up database backups

### 3. Payment Processing (Stripe)
- [ ] Create Stripe production account
- [ ] Update `STRIPE_SECRET_KEY` with live key
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live key
- [ ] Create production price IDs for subscription tiers
- [ ] Set up webhook endpoint and `STRIPE_WEBHOOK_SECRET`
- [ ] Test payment flow with real cards

### 4. Security
- [ ] Generate secure `MASTER_KEY`: `openssl rand -base64 32`
- [ ] Review all API endpoints for authentication
- [ ] Enable CORS restrictions
- [ ] Set up rate limiting

## 📊 HIGHLY RECOMMENDED - Monitoring

### 5. Error Tracking (Sentry)
- [ ] Create Sentry project
- [ ] Install: `npm install @sentry/nextjs`
- [ ] Run setup: `npx @sentry/wizard@latest -i nextjs`
- [ ] Add `SENTRY_DSN` to environment variables
- [ ] Test error reporting

### 6. Analytics
- [ ] Set up Google Analytics 4
- [ ] Add `NEXT_PUBLIC_GA_ID` to environment variables
- [ ] Set up conversion tracking for:
  - Sign-ups
  - Subscription purchases
  - Energy savings calculations

### 7. Email Service (SendGrid)
- [ ] Create SendGrid account
- [ ] Verify domain for sending
- [ ] Get API key and update `SENDGRID_API_KEY`
- [ ] Test email templates:
  - Welcome emails
  - Billing notifications
  - Energy savings reports

## 🔐 Infrastructure & Performance

### 8. DNS & SSL
- [ ] Verify SSL certificate is active
- [ ] Set up www redirect
- [ ] Configure security headers

### 9. Monitoring & Logging
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure Vercel Analytics
- [ ] Set up log aggregation

### 10. Backup & Recovery
- [ ] Database backup strategy
- [ ] Document recovery procedures
- [ ] Test restore process

## 📋 Legal & Compliance

### 11. Legal Documents
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Energy Services Agreement (already created)

### 12. Compliance
- [ ] GDPR compliance for EU users
- [ ] CCPA compliance for California users
- [ ] Accessibility (WCAG 2.1 AA)

## 🚀 Launch Preparation

### 13. Testing
- [ ] Full end-to-end testing in production environment
- [ ] Load testing for expected traffic
- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility

### 14. Customer Support
- [ ] Set up support email
- [ ] Create FAQ/Help documentation
- [ ] Prepare onboarding materials

### 15. Marketing & Launch
- [ ] Prepare launch announcement
- [ ] Set up social media accounts
- [ ] Create demo account for prospects
- [ ] Prepare case studies

## 📝 Post-Launch

### 16. Monitoring
- [ ] Monitor error rates in Sentry
- [ ] Track user engagement in GA
- [ ] Monitor server performance
- [ ] Review customer feedback

### 17. Optimization
- [ ] A/B test conversion pages
- [ ] Optimize based on user behavior
- [ ] Improve based on support tickets

---

## Environment Variables Summary

Required for production:
- `DATABASE_URL` - Production PostgreSQL
- `CLERK_SECRET_KEY` - Production authentication
- `STRIPE_SECRET_KEY` - Production payments
- `SENDGRID_API_KEY` - Email service
- `SENTRY_DSN` - Error tracking
- `MASTER_KEY` - Security key

Already configured:
- AWS Bedrock (Claude AI)
- Twilio (SMS/Voice)
- Autodesk Platform Services