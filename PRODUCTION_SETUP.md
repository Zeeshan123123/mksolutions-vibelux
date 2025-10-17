# VibeLux Production Setup Checklist

## ✅ COMPLETED
- [x] Database configured (Neon PostgreSQL)
- [x] Redis configured (Upstash)
- [x] Clerk authentication configured
- [x] Coming soon mode disabled
- [x] Basic infrastructure ready

## 🔄 IMMEDIATE TASKS (Required for Payment Processing)

### 1. Stripe Configuration
**You need to update these environment variables in both your `.env.local` and Vercel dashboard:**

```bash
# Replace with your actual Stripe keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

### 2. Create Stripe Products
Go to https://dashboard.stripe.com/products and create these products:

1. **Grower Plan**
   - Monthly: $299/month → Copy price ID to `STRIPE_GROWER_MONTHLY_PRICE_ID`
   - Annual: $2,988/year → Copy price ID to `STRIPE_GROWER_ANNUAL_PRICE_ID`

2. **Professional Plan**  
   - Monthly: $599/month → Copy price ID to `STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID`
   - Annual: $5,988/year → Copy price ID to `STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID`

3. **Business Plan**
   - Monthly: $1,199/month → Copy price ID to `STRIPE_BUSINESS_MONTHLY_PRICE_ID`
   - Annual: $11,988/year → Copy price ID to `STRIPE_BUSINESS_ANNUAL_PRICE_ID`

### 3. Stripe Webhook Setup
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://vibelux.ai/api/webhooks/stripe`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🎯 POST-LAUNCH OPTIMIZATIONS

### Security Improvements
- [ ] Rotate all exposed API keys
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Set up monitoring alerts

### Performance Optimizations  
- [ ] Add database indexes
- [ ] Configure connection pooling
- [ ] Set up CDN for assets
- [ ] Enable caching strategies

### Business Features
- [ ] Set up usage tracking
- [ ] Implement subscription limits
- [ ] Add billing portal
- [ ] Create admin analytics

## 🚀 LAUNCH STEPS

1. **Update Stripe configuration** (above)
2. **Deploy to Vercel**: 
   ```bash
   git add .
   git commit -m "Enable production mode and configure Stripe placeholders"
   git push
   ```
3. **Update Vercel environment variables** with actual Stripe keys
4. **Test payment flow** with test cards
5. **Switch to live Stripe keys** 
6. **Announce launch!**

## 📞 SUPPORT
If you need help with any of these steps, the configuration is ready - you just need to:
1. Get your Stripe account set up
2. Create the products/prices 
3. Update the environment variables
4. Deploy!

The application is fully functional and ready for production use once Stripe is configured.