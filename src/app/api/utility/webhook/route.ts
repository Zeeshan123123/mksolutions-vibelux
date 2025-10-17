/**
 * API Route: UtilityAPI Webhook Receiver
 * Handles real-time updates from UtilityAPI for utility data changes
 */

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
;
import { sql } from '@/lib/db';
import { logger } from '@/lib/logging/production-logger';
import crypto from 'crypto';

// UtilityAPI webhook event types
type WebhookEvent = {
  type: 'form.created' | 'form.updated' | 'authorization.created' | 'meter.created' | 'bill.created' | 'interval.created';
  created: string;
  data: {
    uid: string;
    customer_email?: string;
    utility?: string;
    status?: string;
    meters?: any[];
    bills?: any[];
    intervals?: any[];
    [key: string]: any;
  };
};

// Verify webhook signature for security
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.UTILITYAPI_WEBHOOK_SECRET || '';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-utilityapi-signature') || '';
    const rawBody = await request.text();

    // Verify webhook authenticity (optional but recommended)
    // You'll need to set up UTILITYAPI_WEBHOOK_SECRET in your env
    if (process.env.UTILITYAPI_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(rawBody, signature)) {
        logger.error('api', 'Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event: WebhookEvent = JSON.parse(rawBody);
    logger.info('api', `📨 Received UtilityAPI webhook: ${event.type}`, { data: event.data.uid });

    // Handle different event types
    switch (event.type) {
      case 'authorization.created':
        await handleAuthorizationCreated(event.data);
        break;

      case 'meter.created':
        await handleMeterCreated(event.data);
        break;

      case 'bill.created':
        await handleBillCreated(event.data);
        break;

      case 'interval.created':
        await handleIntervalCreated(event.data);
        break;

      case 'form.updated':
        await handleFormUpdated(event.data);
        break;

      default:
        logger.info('api', `Unhandled webhook event type: ${event.type}`);
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('api', 'Webhook processing error:', error );
    // Still return 200 to prevent retries for malformed webhooks
    return NextResponse.json({ received: true });
  }
}

async function handleAuthorizationCreated(data: any) {
  logger.info('api', '✅ Authorization created:', { data: data.uid });

  try {
    // Update connection status in database
    await sql`
      UPDATE utility_connections
      SET
        connection_status = 'active',
        utilityapi_uid = ${data.uid},
        utility_name = ${data.utility || 'unknown'},
        updated_at = NOW()
      WHERE authorization_code = ${data.referral_code}
    `;

    // Get customer email for notifications
    const customerResults = await sql`
      SELECT u.email, f.name as facility_name
      FROM utility_connections uc
      JOIN facilities f ON uc.facility_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE uc.utilityapi_uid = ${data.uid}
      LIMIT 1
    `;

    const customer = customerResults as any[];

    if (customer.length > 0) {
      // Send success email
      const { EmailAutomation } = await import('@/lib/email/automation-flows');
      await EmailAutomation.handleConnectionSuccess(
        customer[0].email,
        data.utility || 'your utility',
        customer[0].facility_name
      );
    }

    // Trigger initial data fetch
    await fetchHistoricalData(data.uid);
  } catch (error) {
    logger.error('api', 'Error handling authorization:', error );
  }
}

async function handleMeterCreated(data: any) {
  logger.info('api', '📊 Meter created:', { data: data.uid });

  try {
    // Store meter information
    const connectionResults = await sql`
      SELECT id, facility_id FROM utility_connections
      WHERE utilityapi_uid = ${data.authorization_uid}
      LIMIT 1
    `;

    const connection = connectionResults as any[];

    if (connection.length > 0) {
      await sql`
        INSERT INTO utility_meters (
          connection_id,
          meter_uid,
          meter_number,
          meter_type,
          service_class,
          service_address,
          created_at
        ) VALUES (
          ${connection[0].id},
          ${data.uid},
          ${data.meter_number},
          ${data.service_class || 'electric'},
          ${data.service_class},
          ${JSON.stringify(data.service_address)},
          NOW()
        )
        ON CONFLICT (meter_uid) DO UPDATE SET
          updated_at = NOW()
      `;
    }
  } catch (error) {
    logger.error('api', 'Error handling meter creation:', error );
  }
}

async function handleBillCreated(data: any) {
  logger.info('api', '💰 Bill created:', { data: data.uid });

  try {
    // Find the connection and meter
    const meterResults = await sql`
      SELECT m.id, m.connection_id, c.facility_id
      FROM utility_meters m
      JOIN utility_connections c ON m.connection_id = c.id
      WHERE m.meter_uid = ${data.meter_uid}
      LIMIT 1
    `;

    const meter = meterResults as any[];

    if (meter.length > 0) {
      // Store bill data
      await sql`
        INSERT INTO utility_bills (
          connection_id,
          meter_id,
          bill_uid,
          bill_date,
          start_date,
          end_date,
          usage_amount,
          usage_unit,
          demand_amount,
          demand_unit,
          total_amount,
          currency,
          raw_data,
          created_at
        ) VALUES (
          ${meter[0].connection_id},
          ${meter[0].id},
          ${data.uid},
          ${new Date(data.statement_date)},
          ${new Date(data.service_start)},
          ${new Date(data.service_end)},
          ${data.total_kwh || 0},
          'kWh',
          ${data.peak_demand || null},
          ${data.peak_demand ? 'kW' : null},
          ${data.total_charge || 0},
          'USD',
          ${JSON.stringify(data)},
          NOW()
        )
        ON CONFLICT (bill_uid) DO UPDATE SET
          updated_at = NOW()
      `;

      // Update facility baseline if this is historical data
      await updateFacilityBaseline(meter[0].facility_id);
    }
  } catch (error) {
    logger.error('api', 'Error handling bill creation:', error );
  }
}

async function handleIntervalCreated(data: any) {
  logger.info('api', '📈 Interval data created:', { data: data.uid });

  try {
    // Store interval (hourly/15-min) usage data
    const meterResults = await sql`
      SELECT m.id, m.connection_id
      FROM utility_meters m
      WHERE m.meter_uid = ${data.meter_uid}
      LIMIT 1
    `;

    const meter = meterResults as any[];

    if (meter.length > 0 && data.intervals) {
      // Batch insert interval data
      const intervalData = data.intervals.map((interval: any) => ({
        meter_id: meter[0].id,
        timestamp: new Date(interval.start),
        usage: interval.kwh || 0,
        unit: 'kWh'
      }));

      // Store in time-series format
      for (const interval of intervalData) {
        await sql`
          INSERT INTO utility_intervals (
            meter_id,
            timestamp,
            usage,
            unit
          ) VALUES (
            ${interval.meter_id},
            ${interval.timestamp},
            ${interval.usage},
            ${interval.unit}
          )
          ON CONFLICT (meter_id, timestamp) DO NOTHING
        `;
      }
    }
  } catch (error) {
    logger.error('api', 'Error handling interval creation:', error );
  }
}

async function handleFormUpdated(data: any) {
  logger.info('api', '📝 Form updated:', { data: { uid: data.uid, status: data.status } });

  if (data.status === 'failed') {
    // Update connection status to failed
    await sql`
      UPDATE utility_connections
      SET
        connection_status = 'failed',
        error_message = ${data.error || 'Authorization failed'},
        updated_at = NOW()
      WHERE utilityapi_uid = ${data.uid}
    `;
  }
}

async function fetchHistoricalData(authorizationUid: string) {
  // Trigger UtilityAPI to fetch historical data
  const response = await fetch(`https://utilityapi.com/api/v2/authorizations/${authorizationUid}/meters`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.UTILITYAPI_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    logger.info('api', '📊 Historical data fetch initiated');
  }
}

async function updateFacilityBaseline(facilityId: string) {
  // Calculate baseline from historical bills
  const baselineResults = await sql`
    SELECT
      AVG(usage_amount) as avg_monthly_usage,
      SUM(usage_amount) as total_usage,
      COUNT(*) as bill_count
    FROM utility_bills ub
    JOIN utility_connections uc ON ub.connection_id = uc.id
    WHERE uc.facility_id = ${facilityId}
    AND ub.bill_date >= NOW() - INTERVAL '12 months'
  `;

  const baseline = baselineResults as any[];

  if (baseline[0]?.bill_count >= 12) {
    await sql`
      UPDATE energy_optimization_config
      SET
        baseline_kwh = ${baseline[0].total_usage},
        baseline_updated_at = NOW()
      WHERE facility_id = ${facilityId}
    `;
  }
}