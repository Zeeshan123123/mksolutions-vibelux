/**
 * Automatic Usage Tracking Middleware
 * Tracks API usage for billing purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { trackUsage } from '@/lib/usage/usage-tracker';

// Define which API routes should be tracked and their event types
const TRACKED_ROUTES: Record<string, keyof import('@/lib/usage/usage-tracker').UsageMetrics | 'apiCalls'> = {
  // AI endpoints
  '/api/ai-assistant': 'aiQueries',
  '/api/ai/conversational-design': 'aiQueries',
  '/api/ai/design-assistant': 'aiQueries',
  
  // Export endpoints
  '/api/design/export': 'exports',
  '/api/projects/export': 'exports',
  '/api/reports/export': 'exports',
  
  // Design endpoints
  '/api/designs': 'designsCreated',
  '/api/rooms': 'roomsCreated',
  '/api/fixtures': 'fixturesAdded',
  
  // ML endpoints
  '/api/ml/predict': 'mlPredictions',
  '/api/predictions': 'mlPredictions',
  '/api/yield-prediction': 'mlPredictions',
  
  // Dashboard endpoints
  '/api/facilities/dashboard': 'facilityDashboards',
  '/api/analytics/dashboard': 'facilityDashboards',
};

/**
 * Track API usage for billing
 */
export async function trackApiUsage(
  request: NextRequest,
  eventType?: string
): Promise<void> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      // Don't track unauthenticated requests
      return;
    }

    const path = request.nextUrl.pathname;
    const method = request.method;

    // Only track POST, PUT, PATCH (creation/modification operations)
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return;
    }

    // Determine event type
    let trackedEventType: string | null = null;

    if (eventType) {
      trackedEventType = eventType;
    } else {
      // Check if this route matches any tracked patterns
      for (const [route, type] of Object.entries(TRACKED_ROUTES)) {
        if (path.startsWith(route)) {
          trackedEventType = type;
          break;
        }
      }
    }

    if (!trackedEventType) {
      // Track as generic API call
      trackedEventType = 'apiCalls';
    }

    // Track the usage (async, don't await to not slow down requests)
    trackUsage({
      userId,
      eventType: trackedEventType,
      eventData: {
        path,
        method,
        timestamp: new Date().toISOString()
      }
    }).catch(error => {
      console.error('Failed to track usage:', error);
      // Don't throw - tracking failures shouldn't break the app
    });

  } catch (error) {
    // Silently fail - usage tracking should never break app functionality
    console.error('Usage tracking error:', error);
  }
}

/**
 * Wrapper for API routes to automatically track usage
 */
export function withUsageTracking<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  eventType?: string
): T {
  return (async (...args: any[]) => {
    const [request] = args;
    
    // Track usage before handling request
    await trackApiUsage(request as NextRequest, eventType);
    
    // Call the original handler
    return handler(...args);
  }) as T;
}

/**
 * Helper to track specific feature usage
 */
export async function trackFeatureUsage(
  userId: string,
  featureName: keyof import('@/lib/usage/usage-tracker').UsageMetrics,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await trackUsage({
      userId,
      eventType: featureName,
      eventData: {
        feature: featureName,
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Failed to track ${featureName} usage:`, error);
  }
}

export default trackApiUsage;

















