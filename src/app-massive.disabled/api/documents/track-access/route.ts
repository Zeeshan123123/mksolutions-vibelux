import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DocumentTracker } from '@/lib/documentTracking';
import { CustomerDataIsolation } from '@/lib/customerDataIsolation';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      documentId,
      documentTitle,
      accessType,
      userAgent,
      referrer,
      timestamp
    } = body;

    // Get user info from Clerk
    const user = await req.json(); // You'll need to get user from Clerk API
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'unknown';

    // Determine access level based on document path/type
    const accessLevel = determineAccessLevel(documentId);

    // Get client IP
    const ipAddress = req.headers.get('x-forwarded-for') || 
      req.headers.get('x-real-ip') || 
      'unknown';

    // Validate that user is only tracking their own access
    const accessValidation = CustomerDataIsolation.validateDataAccess({
      requestingUserId: userId,
      requestingUserRole: 'user', // Get from user metadata if available
      targetUserId: userId, // User is tracking their own access
      dataType: 'document_access',
      scope: 'own'
    });

    if (!accessValidation.allowed) {
      return NextResponse.json({ 
        error: 'Access denied: Cannot track document access' 
      }, { status: 403 });
    }

    // Track the access
    await DocumentTracker.trackAccess({
      userId,
      userEmail,
      documentPath: documentId,
      documentTitle,
      accessLevel,
      accessType,
      ipAddress,
      userAgent,
      referrer
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Document tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Determine document access level based on document ID/path
 */
function determineAccessLevel(documentId: string): 'public' | 'authenticated' | 'premium' | 'enterprise' | 'internal' {
  // Define your document classification rules
  const classificationRules = {
    internal: [
      'implementation-plan',
      'roadmap',
      'competitive-analysis',
      'system-architecture'
    ],
    enterprise: [
      'admin-guide',
      'api-documentation',
      'integration-guide',
      'security-',
      'deployment-'
    ],
    premium: [
      'advanced-',
      'ml-',
      'ai-',
      'analytics-'
    ],
    authenticated: [
      'user-guide',
      'quick-start',
      'calculators-',
      'basic-'
    ]
  };

  // Check each level (most restrictive first)
  for (const [level, patterns] of Object.entries(classificationRules)) {
    if (patterns.some(pattern => documentId.toLowerCase().includes(pattern))) {
      return level as any;
    }
  }

  return 'public';
}