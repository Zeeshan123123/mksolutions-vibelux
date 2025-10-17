import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { MODULES, SUBSCRIPTION_TIERS, CREDIT_PACKAGES } from '@/lib/pricing/unified-pricing'
import Stripe from 'stripe'
import { logger } from '@/lib/logging/production-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    
    for (const item of items) {
      let priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData | undefined
      let productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: '',
        description: '',
        metadata: {}
      }

      if (item.type === 'module') {
        const module = MODULES[item.id]
        if (!module) continue
        
        productData = {
          name: module.name,
          description: module.description,
          metadata: {
            type: 'module',
            moduleId: item.id
          }
        }
        
        priceData = {
          currency: 'usd',
          unit_amount: module.price * 100, // Convert to cents
          product_data: productData
        }
        
        lineItems.push({
          price_data: priceData,
          quantity: item.quantity
        })
        
      } else if (item.type === 'subscription') {
        const tier = SUBSCRIPTION_TIERS[item.id]
        if (!tier) continue
        
        productData = {
          name: `${tier.name} Plan`,
          description: tier.description,
          metadata: {
            type: 'subscription',
            tierId: item.id
          }
        }
        
        const recurring = item.interval === 'year' 
          ? { interval: 'year' as const }
          : { interval: 'month' as const }
        
        // Apply annual discount
        const price = item.interval === 'year' 
          ? Math.round(tier.price * 12 * 0.8) // 20% discount
          : tier.price
        
        priceData = {
          currency: 'usd',
          unit_amount: price * 100,
          recurring,
          product_data: productData
        }
        
        lineItems.push({
          price_data: priceData,
          quantity: 1 // Subscriptions always quantity 1
        })
        
      } else if (item.type === 'credits') {
        const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === item.id)
        if (!creditPackage) continue
        
        const totalCredits = creditPackage.credits + (creditPackage.credits * creditPackage.bonus / 100)
        
        productData = {
          name: creditPackage.name,
          description: `${totalCredits} credits for VibeLux platform`,
          metadata: {
            type: 'credits',
            packageId: item.id,
            credits: creditPackage.credits.toString(),
            bonus: creditPackage.bonus.toString()
          }
        }
        
        priceData = {
          currency: 'usd',
          unit_amount: creditPackage.price * 100,
          product_data: productData
        }
        
        lineItems.push({
          price_data: priceData,
          quantity: item.quantity
        })
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items found' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: lineItems.some(item => item.price_data?.recurring) ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/canceled`,
      customer_email: undefined, // Will be filled by Clerk user email
      metadata: {
        userId,
        itemCount: items.length.toString()
      },
      subscription_data: lineItems.some(item => item.price_data?.recurring) ? {
        metadata: {
          userId
        }
      } : undefined
    })

    return NextResponse.json({ sessionId: session.id })
    
  } catch (error) {
    logger.error('api', 'Error creating checkout session:', error )
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}