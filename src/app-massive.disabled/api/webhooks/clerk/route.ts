import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { logger } from '@/lib/logging/production-logger';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET to your environment variables');
}

// Admin email addresses that should get admin access
const ADMIN_EMAILS = [
  'blakelange@gmail.com',
  'blake@vibelux.ai'
];

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    created_at: number;
    updated_at: number;
  };
};

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret!);

    let evt: ClerkWebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      logger.error('api', 'Error verifying webhook:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Handle the webhook
    const { type, data } = evt;
    const primaryEmail = data.email_addresses[0]?.email_address;

    logger.info('api', `Received Clerk webhook: ${type} for user: ${primaryEmail}`);

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        logger.info('api', `Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api', 'Webhook error:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(data: ClerkWebhookEvent['data']) {
  const primaryEmail = data.email_addresses[0]?.email_address;
  
  if (!primaryEmail) {
    logger.error('api', 'No email found for user');
    return;
  }

  // Determine if this email should have admin access
  const role: UserRole = ADMIN_EMAILS.includes(primaryEmail) ? 'ADMIN' : 'USER';
  
  const name = data.first_name && data.last_name 
    ? `${data.first_name} ${data.last_name}`
    : data.first_name || null;

  try {
    // Create Stripe customer first
    let stripeCustomerId: string | null = null;
    try {
      const stripeCustomer = await stripe.customers.create({
        email: primaryEmail,
        name: name || undefined,
        metadata: {
          clerkId: data.id,
          role: role
        }
      });
      stripeCustomerId = stripeCustomer.id;
      logger.info('api', `Stripe customer created: ${stripeCustomerId} for ${primaryEmail}`);
    } catch (stripeError) {
      logger.error('api', 'Error creating Stripe customer:', stripeError);
      // Continue without Stripe customer - can be added later
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: data.id,
        email: primaryEmail,
        name,
        role,
        stripeCustomerId,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'none',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    });

    logger.info('api', `User created in database:`, { data: {
      id: user.id, email: user.email, role: user.role, clerkId: user.clerkId, stripeCustomerId
    } });

    // Log admin user creation
    if (role === 'ADMIN') {
      logger.info('api', `🚨 ADMIN USER CREATED: ${primaryEmail} has been granted ADMIN access`);
    }

  } catch (error) {
    logger.error('api', 'Error creating user in database:', error );
    
    // If user already exists, try to update their role if they should be admin
    if (error.code === 'P2002') { // Unique constraint violation
      if (role === 'ADMIN') {
        try {
          await prisma.user.update({
            where: { email: primaryEmail },
            data: { role: 'ADMIN' }
          });
          logger.info('api', `Updated existing user ${primaryEmail} to ADMIN`);
        } catch (updateError) {
          logger.error('api', 'Error updating user role:', updateError);
        }
      }
    }
  }
}

async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
  const primaryEmail = data.email_addresses[0]?.email_address;
  
  if (!primaryEmail) {
    logger.error('api', 'No email found for user update');
    return;
  }

  const name = data.first_name && data.last_name 
    ? `${data.first_name} ${data.last_name}`
    : data.first_name || null;

  // Determine if this email should have admin access
  const shouldBeAdmin = ADMIN_EMAILS.includes(primaryEmail);

  try {
    const updateData: any = {
      name,
      updatedAt: new Date(data.updated_at)
    };

    // Grant admin access if email is in admin list
    if (shouldBeAdmin) {
      updateData.role = 'ADMIN';
    }

    const user = await prisma.user.update({
      where: { clerkId: data.id },
      data: updateData
    });

    logger.info('api', `User updated in database:`, { data: {
      id: user.id, email: user.email, role: user.role
    } });

    if (shouldBeAdmin && user.role === 'ADMIN') {
      logger.info('api', `🚨 ADMIN ACCESS CONFIRMED: ${primaryEmail} has ADMIN access`);
    }

  } catch (error) {
    logger.error('api', 'Error updating user in database:', error );
  }
}

async function handleUserDeleted(data: ClerkWebhookEvent['data']) {
  try {
    await prisma.user.delete({
      where: { clerkId: data.id }
    });

    logger.info('api', `User deleted from database: ${data.id}`);
  } catch (error) {
    logger.error('api', 'Error deleting user from database:', error );
  }
}