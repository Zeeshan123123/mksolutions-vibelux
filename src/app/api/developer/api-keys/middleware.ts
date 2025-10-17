import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { rateLimit, rateLimitResponse } from '@/app/api/v1/_middleware/rate-limit';

// Rate limiting for API key management endpoints
export async function rateLimitApiKeyManagement(req: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Allow 10 API key operations per hour per user
  const identifier = `api-key-management:${userId}`;
  const maxRequests = 10;
  const windowSeconds = 3600; // 1 hour
  
  const allowed = await rateLimit(identifier, maxRequests, windowSeconds);

  if (!allowed) {
    return rateLimitResponse(identifier, maxRequests, windowSeconds);
  }

  return null; // Continue with the request
}