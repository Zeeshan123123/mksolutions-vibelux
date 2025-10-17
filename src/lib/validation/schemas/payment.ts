import { z } from 'zod';
import {
  cuidSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
  moneySchema,
  trimString,
  safeHtml,
  optionalNullable
} from './common';

// Stripe payment method schemas
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_account', 'ach_debit']),
  card: z.object({
    number: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
    exp_month: z.number().int().min(1).max(12),
    exp_year: z.number().int().min(new Date().getFullYear()),
    cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
    name: nameSchema.optional(),
    address_line1: trimString.max(200).optional(),
    address_line2: trimString.max(200).optional(),
    address_city: trimString.max(100).optional(),
    address_state: trimString.max(100).optional(),
    address_zip: trimString.max(20).optional(),
    address_country: trimString.length(2, 'Country must be 2-letter ISO code').optional()
  }).optional(),
  bank_account: z.object({
    account_number: z.string().regex(/^\d{4,17}$/, 'Invalid account number'),
    routing_number: z.string().regex(/^\d{9}$/, 'Invalid routing number'),
    account_holder_name: nameSchema,
    account_holder_type: z.enum(['individual', 'company'])
  }).optional()
}).refine(data => {
  if (data.type === 'card' && !data.card) {
    return false;
  }
  if ((data.type === 'bank_account' || data.type === 'ach_debit') && !data.bank_account) {
    return false;
  }
  return true;
}, 'Payment method details are required');

// Subscription management schemas
export const subscriptionCreateSchema = z.object({
  planId: z.enum(['free', 'basic', 'pro', 'enterprise']),
  paymentMethodId: z.string().optional(),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']).optional(),
  couponCode: trimString.max(50).optional(),
  metadata: z.record(z.string()).optional()
});

export const subscriptionUpdateSchema = z.object({
  planId: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
  paymentMethodId: z.string().optional(),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']).optional(),
  cancelAtPeriodEnd: z.boolean().optional()
});

export const subscriptionCancelSchema = z.object({
  reason: z.enum([
    'too_expensive',
    'missing_features',
    'switched_service',
    'unused',
    'customer_service',
    'too_complex',
    'other'
  ]),
  feedback: safeHtml.max(1000).optional(),
  cancelImmediately: z.boolean().default(false)
});

// Invoice schemas
export const invoiceCreateSchema = z.object({
  customerId: cuidSchema,
  items: z.array(z.object({
    description: safeHtml.max(200),
    quantity: z.number().positive(),
    unitPrice: moneySchema,
    taxRate: z.number().min(0).max(100).optional()
  })).min(1, 'At least one item is required'),
  dueDate: z.string().datetime(),
  notes: optionalNullable(safeHtml.max(500)),
  metadata: z.record(z.string()).optional()
});

export const invoiceUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  paidAt: z.string().datetime().optional(),
  notes: optionalNullable(safeHtml.max(500))
});

// Payment schemas
export const paymentCreateSchema = z.object({
  amount: moneySchema,
  currency: z.string().length(3, 'Currency must be 3-letter ISO code').default('USD'),
  paymentMethodId: z.string(),
  description: safeHtml.max(200).optional(),
  metadata: z.record(z.string()).optional(),
  savePaymentMethod: z.boolean().optional()
});

export const refundCreateSchema = z.object({
  paymentId: z.string(),
  amount: moneySchema.optional(), // Optional for partial refunds
  reason: z.enum([
    'duplicate',
    'fraudulent',
    'requested_by_customer',
    'product_not_received',
    'product_unacceptable',
    'other'
  ]),
  notes: safeHtml.max(500).optional()
});

// Revenue sharing schemas
export const revenueSharingAgreementSchema = z.object({
  facilityId: cuidSchema,
  partnerId: cuidSchema,
  type: z.enum(['fixed_percentage', 'tiered', 'performance_based']),
  terms: z.object({
    basePercentage: z.number().min(0).max(100),
    tiers: z.array(z.object({
      minRevenue: moneySchema,
      maxRevenue: moneySchema.optional(),
      percentage: z.number().min(0).max(100)
    })).optional(),
    performanceMetrics: z.array(z.object({
      metric: z.string(),
      target: z.number(),
      bonusPercentage: z.number().min(0).max(100)
    })).optional()
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  minimumPayout: moneySchema.optional(),
  payoutFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
  autoRenew: z.boolean().default(false)
});

// Financial report schemas
export const financialReportQuerySchema = z.object({
  reportType: z.enum([
    'revenue_summary',
    'expense_breakdown',
    'profit_loss',
    'cash_flow',
    'accounts_receivable',
    'tax_summary'
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  includeProjections: z.boolean().optional(),
  format: z.enum(['json', 'csv', 'pdf']).optional()
});

// Billing address schema
export const billingAddressSchema = z.object({
  line1: trimString.max(200),
  line2: trimString.max(200).optional(),
  city: trimString.max(100),
  state: trimString.max(100),
  postalCode: trimString.max(20),
  country: trimString.length(2, 'Country must be 2-letter ISO code')
});

// Tax information schema
export const taxInfoSchema = z.object({
  taxId: trimString.max(50).optional(),
  vatNumber: trimString.max(50).optional(),
  taxExempt: z.boolean().default(false),
  taxExemptionCertificate: z.string().url().optional()
});

// Discount/coupon schemas
export const couponCreateSchema = z.object({
  code: trimString.max(50).regex(/^[A-Z0-9_-]+$/i, 'Invalid coupon code format'),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.number().positive(),
  applicablePlans: z.array(z.enum(['basic', 'pro', 'enterprise'])).optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  minimumAmount: moneySchema.optional(),
  firstTimeCustomersOnly: z.boolean().default(false)
});

// Webhook payload validation (for Stripe webhooks)
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.string(),
  api_version: z.string(),
  created: z.number(),
  data: z.object({
    object: z.record(z.any())
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable()
  }).optional(),
  type: z.string()
});

// Payout schemas (for affiliate/revenue sharing)
export const payoutRequestSchema = z.object({
  recipientId: cuidSchema,
  amount: moneySchema,
  method: z.enum(['bank_transfer', 'check', 'paypal', 'stripe']),
  accountDetails: z.record(z.string()).optional(),
  notes: safeHtml.max(500).optional()
});

// Credit system schemas
export const creditPurchaseSchema = z.object({
  amount: z.number().int().positive().max(10000),
  paymentMethodId: z.string()
});

export const creditUsageSchema = z.object({
  amount: z.number().int().positive(),
  purpose: z.enum(['api_calls', 'premium_features', 'data_export', 'support']),
  description: safeHtml.max(200).optional()
});