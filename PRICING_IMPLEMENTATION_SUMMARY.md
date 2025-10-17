# VibeLux Pricing Structure Implementation Summary

## Overview
This document summarizes the new unified pricing structure implemented for VibeLux, featuring the Energy Savings Program, subscription tiers, a la carte modules, and a credit system for AI usage.

## Key Components Implemented

### 1. Energy Savings Program (FREE - Revenue Sharing)
**File**: `/src/lib/pricing/unified-pricing.ts`

- **Cost**: $0 (100% Free)
- **Revenue Model**: VibeLux takes 25% of energy savings, growers keep 75%
- **Features Included**:
  - Automated load shedding
  - Demand response participation
  - Time-of-use optimization
  - Weather-adaptive lighting
  - Real-time energy monitoring
  - Basic PPFD/DLI calculators
  - Energy savings dashboard
- **Typical Savings**: 20-50% on energy bills
- **Requirements**: 
  - Connected smart lighting
  - Minimum 10kW load
  - 12-month commitment

### 2. Subscription Tiers
**File**: `/src/lib/pricing/unified-pricing.ts`

#### Free Tier ($0/month)
- 5 AI Designer credits/month
- 100 API calls
- Basic calculators
- 1 project, 1 user
- 7-day data retention

#### Starter Tier ($39/month)
- 50 AI Designer credits/month
- 1,000 API calls
- All 25+ calculators
- Basic 2D designer
- 3 users, 10 projects
- 30-day data retention

#### Professional Tier ($99/month)
- 200 AI Designer credits/month
- 5,000 API calls
- 3D design studio
- AI crop assistant
- 10 users, 50 projects
- 90-day data retention

#### Enterprise Tier ($299/month)
- 1,000 AI Designer credits/month
- 50,000 API calls
- Unlimited facilities
- White label options
- Unlimited users/projects
- Unlimited data retention

### 3. A La Carte Modules
**File**: `/src/lib/pricing/unified-pricing.ts`

#### Essential Modules ($9-29/month)
- Calculator Suite: $19/month
- Basic Design Tools: $29/month
- Compliance Tracker: $19/month

#### Professional Modules ($39-79/month)
- 3D Design Studio: $79/month
- AI Crop Assistant: $49/month
- Analytics Pro: $39/month
- Sensor Integration: $69/month

#### Enterprise Modules ($99+/month)
- Multi-Site Management: $199/month
- Marketplace Access: $99/month

#### Bundle Discounts
- Grower Essentials: $49/month (save $18)
- Pro Grower: $149/month (save $37)
- Cannabis Compliance: $99/month (save $28)

### 4. Credit System for AI Usage
**Files**: 
- `/src/lib/credits/credit-manager.ts`
- `/src/store/credit-store.ts`
- `/src/lib/ai-usage-tracker-v2.ts`

#### Credit Costs
- Simple AI design: 10 credits
- Complex design: 25 credits
- Full optimization: 50 credits
- Basic report: 5 credits
- API calls: 1 credit each

#### Credit Packages
- Starter Pack: 100 credits for $9
- Growth Pack: 550 credits for $39 (10% bonus)
- Pro Pack: 1,200 credits for $69 (20% bonus)
- Bulk Pack: 6,500 credits for $299 (30% bonus)

### 5. Implementation Components

#### Frontend Components
- `/src/components/pricing/UnifiedPricingPage.tsx` - Main pricing page
- `/src/components/pricing/EnergySavingsCalculator.tsx` - ROI calculator
- `/src/components/credits/CreditUsageMonitor.tsx` - Credit tracking UI
- `/src/components/credits/CreditPurchaseModal.tsx` - Credit purchase flow

#### Backend API Routes
- `/src/app/api/credits/balance/route.ts` - Get credit balance
- `/src/app/api/credits/purchase/route.ts` - Purchase credits via Stripe

#### State Management
- `/src/store/credit-store.ts` - Credit state management
- `/src/contexts/SubscriptionContext.tsx` - Updated subscription context

#### Database Models Required
```prisma
model User {
  subscriptionTier String @default("free")
  energySavingsEnrolled Boolean @default(false)
  activeModules String[]
  creditBalance CreditBalance?
}

model CreditBalance {
  userId String @unique
  available Int @default(0)
  used Int @default(0)
  purchased Int @default(0)
  bonus Int @default(0)
  monthlyAllocation Int @default(5)
  lastMonthlyReset DateTime @default(now())
}

model CreditTransaction {
  id String @id
  userId String
  type String // purchase, usage, refund, bonus, monthly_reset
  amount Int
  balance Int
  description String
  metadata Json?
  createdAt DateTime @default(now())
}
```

## Key Features

### 1. Abuse Prevention
- Credit-based system prevents unlimited AI usage
- Rate limiting per user
- Usage pattern monitoring
- Automatic abuse detection

### 2. Flexible Pricing
- Start free with Energy Savings Program
- Upgrade to subscription for more features
- Add modules a la carte as needed
- Purchase credits as needed

### 3. User Experience
- Clear credit usage indicators
- Low credit warnings
- Easy credit purchase flow
- Usage history tracking

## Configuration Required

### Environment Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Pricing Features
ENABLE_ENERGY_SAVINGS=true
ENABLE_ALA_CARTE=true
ENABLE_CREDIT_SYSTEM=true

# Default Credits
DEFAULT_MONTHLY_CREDITS_FREE=5
DEFAULT_MONTHLY_CREDITS_STARTER=50
DEFAULT_MONTHLY_CREDITS_PRO=200
DEFAULT_MONTHLY_CREDITS_ENTERPRISE=1000
```

## Migration Steps

1. **Database Migration**
   - Add credit-related tables
   - Update user model with new fields
   - Migrate existing subscriptions

2. **Update Stripe Products**
   - Create credit package products
   - Create module subscription products
   - Update existing subscription products

3. **Deploy Features**
   - Deploy backend changes first
   - Update frontend with new pricing UI
   - Enable features gradually

## Monitoring & Analytics

Track these metrics:
- Energy savings program enrollment rate
- Credit usage patterns
- Module adoption rates
- Bundle vs a la carte preferences
- Credit purchase frequency
- AI usage by request type

## Benefits

1. **For Growers**
   - Start free and make money
   - Pay only for what they use
   - Clear, predictable costs
   - No surprise AI charges

2. **For VibeLux**
   - Aligned incentives with customers
   - Predictable revenue streams
   - Reduced AI abuse
   - Higher customer lifetime value

## Next Steps

1. Set up Stripe products and webhooks
2. Create database migrations
3. Add monitoring and analytics
4. Create onboarding flow for Energy Savings Program
5. Implement credit expiration policies (if needed)
6. Add team/organization credit sharing features