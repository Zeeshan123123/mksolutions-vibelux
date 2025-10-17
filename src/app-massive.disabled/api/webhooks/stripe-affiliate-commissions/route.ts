import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { trackAffiliateConversion } from '@/middleware/affiliate-tracking';
import { getSmartCommissionRate } from '@/lib/affiliates/smart-commission-structure';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// Initialize Stripe lazily to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  return stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Stripe affiliate commissions webhook is temporarily disabled
  // TODO: Update Prisma schema to include proper AffiliateCommission fields
  logger.info('api', 'Stripe affiliate webhook called - currently disabled');
  
  return NextResponse.json({
    success: true,
    message: 'Stripe affiliate commissions webhook is under development',
    status: 'disabled'
  });
}