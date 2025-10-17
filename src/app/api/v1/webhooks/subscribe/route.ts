import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logging/production-logger'
import crypto from 'crypto'
export const dynamic = 'force-dynamic'

interface WebhookSubscription {
  events: string[]
  url: string
  secret?: string
  filters?: {
    zones?: string[]
    severity?: string[]
    metrics?: string[]
  }
}

// Mock webhook storage (in production, use database)
const webhookSubscriptions = new Map<string, {
  id: string
  apiKey: string
  subscription: WebhookSubscription
  createdAt: string
  active: boolean
}>()

export async function POST(req: NextRequest) {
  try {
    // TODO: Add proper API key validation
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body: WebhookSubscription = await req.json()
    
    // Validate webhook subscription
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      )
    }
    
    if (!body.url || !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Valid webhook URL is required' },
        { status: 400 }
      )
    }
    
    // Validate events
    const validEvents = [
      'lighting.status_change',
      'lighting.fixture_offline',
      'environmental.threshold_exceeded',
      'environmental.sensor_error',
      'biology.growth_stage_change',
      'biology.stress_detected',
      'biology.harvest_ready',
      'compliance.audit_reminder',
      'compliance.certificate_expiring',
      'system.maintenance_required',
      'system.alert'
    ]
    
    const invalidEvents = body.events.filter(event => !validEvents.includes(event))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Generate webhook secret if not provided
    const webhookSecret = body.secret || crypto.randomBytes(32).toString('hex')
    
    // Create subscription
    const subscriptionId = `wh_${crypto.randomBytes(16).toString('hex')}`
    const subscription = {
      id: subscriptionId,
      apiKey: apiKey,
      subscription: {
        ...body,
        secret: webhookSecret
      },
      createdAt: new Date().toISOString(),
      active: true
    }
    
    // Store subscription
    webhookSubscriptions.set(subscriptionId, subscription)
    
    // Test webhook with ping event
    const testResult = await testWebhook(body.url, webhookSecret)
    
    logger.info('api', `Webhook subscription created: ${subscriptionId}`)
    
    return NextResponse.json({
      id: subscriptionId,
      events: body.events,
      url: body.url,
      secret: webhookSecret,
      filters: body.filters,
      status: 'active',
      testResult: testResult,
      createdAt: subscription.createdAt,
      version: '1.0',
      message: 'Webhook subscription created successfully'
    })
    
  } catch (error) {
    logger.error('api', 'Webhook subscription error:', error instanceof Error ? error : new Error(String(error)))
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // TODO: Add proper API key validation
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }
    
    // Get subscriptions for this API key
    const subscriptions = Array.from(webhookSubscriptions.values())
      .filter(sub => sub.apiKey === apiKey)
      .map(sub => ({
        id: sub.id,
        events: sub.subscription.events,
        url: sub.subscription.url,
        filters: sub.subscription.filters,
        status: sub.active ? 'active' : 'inactive',
        createdAt: sub.createdAt
      }))
    
    logger.info('api', `Retrieved ${subscriptions.length} webhook subscriptions`)
    
    return NextResponse.json({
      subscriptions,
      total: subscriptions.length,
      version: '1.0'
    })
    
  } catch (error) {
    logger.error('api', 'Get webhook subscriptions error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // TODO: Add proper API key validation
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }
    
    // Get subscription ID from URL
    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('id')
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }
    
    // Check if subscription exists and belongs to this API key
    const subscription = webhookSubscriptions.get(subscriptionId)
    if (!subscription || subscription.apiKey !== apiKey) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    // Delete subscription
    webhookSubscriptions.delete(subscriptionId)
    
    logger.info('api', `Webhook subscription deleted: ${subscriptionId}`)
    
    return NextResponse.json({
      id: subscriptionId,
      status: 'deleted',
      version: '1.0',
      message: 'Webhook subscription deleted successfully'
    })
    
  } catch (error) {
    logger.error('api', 'Delete webhook subscription error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:'
  } catch {
    return false
  }
}

async function testWebhook(url: string, secret: string): Promise<any> {
  try {
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Webhook endpoint test'
      }
    }
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(testPayload))
      .digest('hex')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: JSON.stringify(testPayload)
    })
    
    return {
      success: response.ok,
      statusCode: response.status,
      message: response.ok ? 'Webhook test successful' : 'Webhook test failed'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to reach webhook endpoint'
    }
  }
}