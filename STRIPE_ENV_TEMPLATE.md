# Stripe Environment Variables Template

Add these to your `.env.local` file and Vercel Dashboard:

## Required Stripe Keys
```env
# Main Stripe Keys (Required)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE

# Monthly Price IDs (Required)
STRIPE_SOLO_MONTHLY_PRICE_ID=price_xxx
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxx
STRIPE_TEAMS_MONTHLY_PRICE_ID=price_xxx
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx

# Annual Price IDs (Optional - 20% discount)
STRIPE_SOLO_ANNUAL_PRICE_ID=price_xxx
STRIPE_STARTER_ANNUAL_PRICE_ID=price_xxx
STRIPE_TEAMS_ANNUAL_PRICE_ID=price_xxx
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxx

# Legacy Price IDs (For backward compatibility - can be removed later)
STRIPE_GROWER_MONTHLY_PRICE_ID=price_xxx
STRIPE_GROWER_ANNUAL_PRICE_ID=price_xxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_xxx
```

## Setup Instructions

### 1. Create Products in Stripe Dashboard

Run the setup script:
```bash
cd /Users/blakelange/vibelux-app
npm install stripe
STRIPE_SECRET_KEY=sk_live_YOUR_KEY node scripts/setup-stripe-products.js
```

This will create all products and output the price IDs.

### 2. Configure Webhook Endpoint

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint: `https://www.vibelux.ai/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Copy the webhook secret (starts with `whsec_`)

### 3. Test the Integration

Test each tier:
```bash
# Test subscription creation
curl -X POST https://www.vibelux.ai/api/test-subscription \
  -H "Content-Type: application/json" \
  -d '{"tier": "starter"}'
```

## Subscription Tiers Reference

| Tier | Monthly Price | Annual Price | Users | Facilities | AI Credits |
|------|--------------|--------------|-------|------------|------------|
| Free | $0 | $0 | 1 | 1 | 5/month |
| Design Solo | $29 | $279 | 1 | 1 | 50/month |
| Starter | $49 | $470 | 3 | 1 | 100/month |
| Teams | $99 | $950 | 10 | 2 | 300/month |
| Professional | $199 | $1,910 | 10 | 5 | 1000/month |
| Enterprise | $499 | $4,790 | 25+ | Unlimited | 3000/month |

## Module Access by Tier

### Design Solo ($29)
- Calculator Suite (25+)
- Basic Design Tools

### Starter ($49)
- Everything in Design Solo
- Basic Compliance
- QR Code Generation
- Mobile App Access

### Teams ($99)
- Everything in Starter
- Advanced Designer Suite
- Analytics Pro
- Marketplace Access
- Greenhouse Project Management (Basic)

### Professional ($199)
- Everything in Teams
- AI Assistant
- Sensor Hub
- Automation Builder
- Plant Health AI
- IPM System
- Crop Planning Suite
- Harvest Management
- Equipment Maintenance
- Training & Certification

### Enterprise ($499)
- All modules included
- Unlimited everything
- White-label options
- Dedicated support

## Troubleshooting

### Common Issues

1. **Subscription not updating**: Check webhook logs in Stripe Dashboard
2. **Wrong tier assigned**: Verify price ID mapping in `getTierFromPriceId()`
3. **Features locked**: Check `SubscriptionContext` feature access matrix

### Test Cards

For testing in development:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

## Support

- Stripe Dashboard: https://dashboard.stripe.com
- Webhook Logs: https://dashboard.stripe.com/webhooks
- Test Mode: Use `sk_test_` keys for development