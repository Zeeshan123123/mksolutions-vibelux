// /src/app/api/webhooks/stripe/route.ts
// Merged version: keeps trial license logic + adds metered billing

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logging/production-logger'

export const dynamic = 'force-dynamic'

// Initialize Stripe lazily
let stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})
  }
  if (!stripe) throw new Error('Stripe is not configured')
  return stripe
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    if (!webhookSecret) {
      logger.error('api Missing STRIPE_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const signature = headers().get('stripe-signature') as string
    const body = await req.text()

    const stripe = getStripe()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      logger.error('api Stripe signature verification failed', err as Error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    logger.info(`webhook Processing event: ${event.type}`, { eventId: event.id })

    switch (event.type) {
      // ========================================
      // EXISTING: Trial License Handling
      // ========================================
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        // If this relates to a trial license purchase, mark as completed
        if (pi.metadata?.listingId && pi.id) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "TrialLicensePurchase"
               SET status='completed', "purchasedAt"=NOW()
               WHERE "stripePaymentIntentId"=$1`,
              pi.id
            )
            // Ensure entitlement exists for the buyer
            const rows: any[] = await prisma.$queryRawUnsafe(
              `SELECT p."buyerId", l."trialId", p."listingId"
               FROM "TrialLicensePurchase" p
               JOIN "TrialLicenseListing" l ON l.id = p."listingId"
               WHERE p."stripePaymentIntentId"=$1
               LIMIT 1`,
              pi.id
            )
            const rec = rows?.[0]
            if (rec?.buyerid && rec?.trialid && rec?.listingid) {
              const entitlementId = `tle_${Date.now()}`
              await prisma.$executeRawUnsafe(
                `CREATE TABLE IF NOT EXISTS "TrialLicenseEntitlement" (
                  id TEXT PRIMARY KEY,
                  "trialId" TEXT NOT NULL REFERENCES "Trial"(id) ON DELETE CASCADE,
                  "buyerId" TEXT NOT NULL,
                  "listingId" TEXT NOT NULL REFERENCES "TrialLicenseListing"(id) ON DELETE CASCADE,
                  status TEXT NOT NULL DEFAULT 'active',
                  "grantedAt" TIMESTAMP DEFAULT NOW(),
                  UNIQUE ("trialId","buyerId")
                )`
              )
              await prisma.$executeRawUnsafe(
                `INSERT INTO "TrialLicenseEntitlement" (id, "trialId", "buyerId", "listingId", status, "grantedAt")
                 VALUES ($1,$2,$3,$4,'active',NOW())
                 ON CONFLICT ("trialId","buyerId") DO NOTHING`,
                entitlementId, rec.trialid, rec.buyerid, rec.listingid
              )
            }
            // Optional: mark exclusive listings as sold
            if (pi.metadata.exclusive === 'true') {
              await prisma.$executeRawUnsafe(
                `UPDATE "TrialLicenseListing" SET status='sold', "updatedAt"=NOW() WHERE id=$1`,
                pi.metadata.listingId
              )
            }
          } catch (e) {
            logger.error('api Failed to finalize trial license purchase', e as Error)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        if (pi.metadata?.listingId && pi.id) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "TrialLicensePurchase"
               SET status='failed'
               WHERE "stripePaymentIntentId"=$1`,
              pi.id
            )
          } catch (e) {
            logger.error('api Failed to mark purchase failed', e as Error)
          }
        }
        break
      }

      // ========================================
      // EXISTING: Billing Payments
      // ========================================
      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge
        try {
          const amount = (charge.amount_captured ?? charge.amount ?? 0) / 100
          const currency = charge.currency?.toUpperCase() || 'USD'
          const facilityId = charge.metadata?.facilityId
          const invoiceId = charge.metadata?.internalInvoiceId
          if (facilityId && amount != null) {
            await prisma.billingPayment.create({
              data: {
                facilityId,
                amount,
                currency,
                method: 'stripe',
                reference: charge.id,
                invoiceId: invoiceId || null,
                stripeIntent: charge.payment_intent ? String(charge.payment_intent) : null,
                receivedAt: new Date((charge.created ?? Math.floor(Date.now() / 1000)) * 1000)
              }
            })
          }
        } catch (e) {
          logger.error('api Failed to persist Stripe charge as Payment', e as Error)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        logger.info('api', `Checkout completed: ${session.id}`)
        break
      }

      // ========================================
      // ✨ NEW: Metered Billing Handlers
      // ========================================
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice)
        break

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        logger.info('api', `Invoice paid: ${invoice.id}`)
        await handleInvoicePaid(invoice)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        logger.info('api', `Subscription event: ${event.type} ${sub.id}`)
        await handleSubscriptionUpdated(sub)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        logger.info('api', `Subscription deleted: ${sub.id}`)
        await handleSubscriptionDeleted(sub)
        break
      }

      default: {
        logger.info('api', `Unhandled Stripe event: ${event.type}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('api Stripe webhook error', error as Error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

// ========================================
// ✨ NEW: Metered Billing Handler Functions
// ========================================

async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  logger.info('webhook', `Invoice created: ${invoice.id}`)

  try {
    const customerId = invoice.customer as string
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      logger.error('webhook', `User not found for customer ${customerId}`)
      return
    }

    logger.info('webhook Invoice created for user ${user.email}', {
      invoiceId: invoice.id,
      amount: invoice.amount_due / 100,
    })
  } catch (error) {
    logger.error('webhook Error handling invoice.created:', error)
  }
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  logger.info('webhook', `Invoice finalized: ${invoice.id}`)

  try {
    const customerId = invoice.customer as string
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) return

    // Log metered usage for this billing period
    const lines = invoice.lines.data
    for (const line of lines) {
  const linePrice = (line as any).price;
  if (linePrice?.id === process.env.STRIPE_METERED_AI_CREDITS_PRICE_ID) {
        logger.info(`webhook AI Credits billed: ${line.quantity} credits`, {
          userId: user.id,
          amount: line.amount / 100,
          period: `${new Date(line.period.start * 1000).toISOString()} - ${new Date(line.period.end * 1000).toISOString()}`,
        })
      }
    }
  } catch (error) {
    logger.error('webhook Error handling invoice.finalized:', error)
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  logger.info('webhook', `Invoice paid: ${invoice.id}`)

  try {
    const customerId = invoice.customer as string
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) return

    logger.info(`webhook Payment received from ${user.email}`, {
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
    })
  } catch (error) {
    logger.error('webhook Error handling invoice.paid:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info('webhook', `Subscription updated: ${subscription.id}`)

  try {
    const customerId = subscription.customer as string
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) return

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
        stripeSubscriptionStatus: subscription.status,
        subscriptionPeriodEnd: new Date(((subscription as any).current_period_end || Date.now() / 1000) * 1000),
      },
    })

    logger.info(`webhook Subscription status updated for ${user.email}`, {
      status: subscription.status,
    })
  } catch (error) {
    logger.error('webhook Error handling subscription.updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('webhook', `Subscription deleted: ${subscription.id}`)

  try {
    const customerId = subscription.customer as string
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) return

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        stripeSubscriptionStatus: 'canceled',
        subscriptionTier: 'FREE',
      },
    })

    logger.info('webhook', `Subscription canceled for ${user.email}`)
  } catch (error) {
    logger.error('webhook Error handling subscription.deleted:', error)
  }
}