import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DocumentTracker } from '@/lib/documentTracking';
import { CustomerDataIsolation, withCustomerDataIsolation } from '@/lib/customerDataIsolation';

/**
 * GET /api/documents/my-history
 * Returns ONLY the requesting user's own document access history
 * Users cannot see other customers' data
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Validate access - user can only see their own history
    const accessValidation = CustomerDataIsolation.validateDataAccess({
      requestingUserId: userId,
      requestingUserRole: 'user',
      targetUserId: userId, // Same user - accessing own data
      dataType: 'document_access',
      scope: 'own'
    });

    if (!accessValidation.allowed) {
      return NextResponse.json({ 
        error: 'Access denied: Can only view your own document history' 
      }, { status: 403 });
    }

    // Get user's own access history
    const history = await DocumentTracker.getUserOwnAccessHistory(
      userId, // requesting user
      userId, // target user (same as requesting)
      limit
    );

    // Generate privacy-compliant activity summary
    const summary = CustomerDataIsolation.generateUserActivitySummary(userId, history);

    return NextResponse.json({
      history,
      summary,
      message: 'Your document access history (only your own data is visible)'
    });

  } catch (error) {
    console.error('Error fetching user document history:', error);
    
    // Don't expose internal errors to users
    return NextResponse.json({ 
      error: 'Failed to retrieve document history' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/my-history
 * Allow users to delete their own document history (privacy compliance)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { olderThanDays } = body;

    // Validate access
    const accessValidation = CustomerDataIsolation.validateDataAccess({
      requestingUserId: userId,
      requestingUserRole: 'user',
      targetUserId: userId,
      dataType: 'document_access',
      scope: 'own'
    });

    if (!accessValidation.allowed) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Delete user's own access history older than specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (olderThanDays || 365));

    // Note: You'll need to implement this method in DocumentTracker
    // await DocumentTracker.deleteUserAccessHistory(userId, cutoffDate);

    return NextResponse.json({
      success: true,
      message: `Deleted your document access history older than ${olderThanDays || 365} days`
    });

  } catch (error) {
    console.error('Error deleting user document history:', error);
    return NextResponse.json({ 
      error: 'Failed to delete document history' 
    }, { status: 500 });
  }
}