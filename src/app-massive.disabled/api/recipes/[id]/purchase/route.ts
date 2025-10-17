import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import Stripe from 'stripe';
import { logger } from '@/lib/logging/production-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const PurchaseRequestSchema = z.object({
  purchaseType: z.enum(['ONE_TIME_LICENSE', 'ROYALTY_BASED', 'SUBSCRIPTION', 'CUSTOM']),
  usageRights: z.enum(['PERSONAL', 'COMMERCIAL', 'UNLIMITED', 'RESEARCH_ONLY']),
  territory: z.array(z.string()).default(['US']),
  exclusive: z.boolean().default(false),
});

// ====================================================================
// PURCHASE RECIPE
// ====================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { id: recipeId } = params;
    const body = await request.json();
    const purchaseData = PurchaseRequestSchema.parse(body);
    
    // Get recipe details
    const recipe = await prisma.cultivationRecipe.findUnique({
      where: { id: recipeId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            stripeCustomerId: true,
          }
        }
      }
    });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    if (!recipe.isPublic) {
      return NextResponse.json({ error: 'Recipe not available for purchase' }, { status: 400 });
    }
    
    // Check if user already purchased this recipe
    const existingPurchase = await prisma.recipePurchase.findFirst({
      where: {
        recipeId,
        buyerId: dbUser.id,
      }
    });
    
    if (existingPurchase) {
      return NextResponse.json({ error: 'Recipe already purchased' }, { status: 400 });
    }
    
    // Calculate pricing based on recipe pricing configuration
    const pricingConfig = recipe.pricing as any;
    let amount = pricingConfig.basePrice || 1000; // Default $10.00
    
    // Apply territory-based pricing adjustments
    if (purchaseData.territory.length > 1) {
      amount *= 1.5; // Multi-territory markup
    }
    
    // Apply exclusivity premium
    if (purchaseData.exclusive) {
      amount *= 3; // 3x premium for exclusivity
    }
    
    // Apply usage rights adjustments
    switch (purchaseData.usageRights) {
      case 'COMMERCIAL':
        amount *= 2;
        break;
      case 'UNLIMITED':
        amount *= 5;
        break;
      case 'RESEARCH_ONLY':
        amount *= 0.5;
        break;
      // PERSONAL is base price
    }
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'usd',
      customer: dbUser.stripeCustomerId || undefined,
      metadata: {
        recipeId,
        recipeName: recipe.name,
        creatorId: recipe.creatorId,
        purchaseType: purchaseData.purchaseType,
        usageRights: purchaseData.usageRights,
        territory: purchaseData.territory.join(','),
        exclusive: purchaseData.exclusive.toString(),
      },
      description: `VibeLux Recipe: ${recipe.name}`,
    });
    
    // Create pending purchase record
    const purchase = await prisma.recipePurchase.create({
      data: {
        recipeId,
        buyerId: dbUser.id,
        purchaseType: purchaseData.purchaseType,
        amount: amount / 100, // Store as dollars
        currency: 'USD',
        usageRights: purchaseData.usageRights,
        territory: purchaseData.territory,
        exclusive: purchaseData.exclusive,
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            strainName: true,
          }
        }
      }
    });
    
    return NextResponse.json({
      purchase,
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100,
    });
    
  } catch (error) {
    logger.error('api', 'Recipe purchase error:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to initiate purchase' },
      { status: 500 }
    );
  }
}

// ====================================================================
// GET PURCHASE STATUS
// ====================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { id: recipeId } = params;
    
    const purchase = await prisma.recipePurchase.findFirst({
      where: {
        recipeId,
        buyerId: dbUser.id,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            strainName: true,
          }
        }
      }
    });
    
    if (!purchase) {
      return NextResponse.json({ purchased: false });
    }
    
    // Check Stripe payment status if we have a payment intent
    let paymentStatus = 'unknown';
    if (purchase.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          purchase.stripePaymentIntentId
        );
        paymentStatus = paymentIntent.status;
      } catch (stripeError) {
        logger.error('api', 'Stripe payment intent retrieval error:', stripeError);
      }
    }
    
    return NextResponse.json({
      purchased: true,
      purchase,
      paymentStatus,
    });
    
  } catch (error) {
    logger.error('api', 'Purchase status check error:', error );
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    );
  }
}