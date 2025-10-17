/**
 * SendGrid Webhook Handler
 * Processes email events from SendGrid
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendGridService } from '@/lib/email/sendgrid-service';
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhookSignature(
  publicKey: string,
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const timestampPayload = timestamp + payload;
  const expectedSignature = crypto
    .createHash('sha256')
    .update(timestampPayload + publicKey)
    .digest('hex');

  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature headers
    const signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature');
    const timestamp = request.headers.get('X-Twilio-Email-Event-Webhook-Timestamp');

    // Get raw body
    const rawBody = await request.text();

    // Verify signature if webhook verification is enabled
    if (process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY) {
      if (!signature || !timestamp) {
        logger.error('webhook', 'Missing SendGrid webhook signature headers');
        return NextResponse.json(
          { error: 'Missing signature headers' },
          { status: 401 }
        );
      }

      const isValid = verifyWebhookSignature(
        process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY,
        rawBody,
        signature,
        timestamp
      );

      if (!isValid) {
        logger.error('webhook', 'Invalid SendGrid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse events
    const events = JSON.parse(rawBody);

    // Process events
    await sendGridService.handleWebhook(events);

    // Log webhook received
    logger.info('webhook', `Processed ${events.length} SendGrid events`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('webhook', 'SendGrid webhook error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// SendGrid requires a GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'SendGrid webhook endpoint active' });
}