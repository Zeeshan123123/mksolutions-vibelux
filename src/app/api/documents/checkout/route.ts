import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { DocumentVersionControl } from '@/lib/documentVersionControl';
import { CustomerDataIsolation } from '@/lib/customerDataIsolation';
export const dynamic = 'force-dynamic'

/**
 * POST /api/documents/checkout
 * Check out a document for editing
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress || '';

    const body = await req.json();
    const { documentId, lockType, purpose, durationHours } = body;

    // Validate that user can checkout this document
    const accessValidation = CustomerDataIsolation.validateDataAccess({
      requestingUserId: userId,
      requestingUserRole: user.publicMetadata?.role as string || 'user',
      dataType: 'document_access',
      scope: 'own'
    });

    if (!accessValidation.allowed) {
      return NextResponse.json({ 
        error: 'Access denied: Cannot checkout document' 
      }, { status: 403 });
    }

    // Attempt checkout
    const result = await DocumentVersionControl.checkoutDocument({
      documentId,
      userId,
      userEmail,
      lockType: lockType || 'shared',
      purpose: purpose || 'edit',
      durationHours: durationHours || 2
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        checkout: result.checkout,
        message: `Document checked out with ${result.checkout?.lockType} lock`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 409 }); // Conflict - document already checked out
    }

  } catch (error) {
    console.error('Document checkout error:', error);
    return NextResponse.json({ 
      error: 'Failed to checkout document' 
    }, { status: 500 });
  }
}

/**
 * GET /api/documents/checkout?documentId=...
 * Get active checkouts for a document
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const documentId = url.searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ 
        error: 'Document ID required' 
      }, { status: 400 });
    }

    // Get active checkouts
    const checkouts = await DocumentVersionControl.getActiveCheckouts(documentId);

    // Filter to only show relevant information (not other users' detailed info)
    const filteredCheckouts = checkouts.map(checkout => ({
      id: checkout.id,
      documentId: checkout.documentId,
      userId: checkout.userId === userId ? checkout.userId : 'other_user',
      userEmail: checkout.userId === userId ? checkout.userEmail : 'Another user',
      checkedOutAt: checkout.checkedOutAt,
      expiresAt: checkout.expiresAt,
      lockType: checkout.lockType,
      purpose: checkout.purpose,
      isActive: checkout.isActive,
      isMyCheckout: checkout.userId === userId
    }));

    return NextResponse.json({
      checkouts: filteredCheckouts,
      myCheckout: checkouts.find(c => c.userId === userId) || null
    });

  } catch (error) {
    console.error('Error fetching checkouts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch checkouts' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/checkout
 * Release a document checkout
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { checkoutId } = body;

    if (!checkoutId) {
      return NextResponse.json({ 
        error: 'Checkout ID required' 
      }, { status: 400 });
    }

    // Verify user owns this checkout
    const checkout = await DocumentVersionControl.getActiveCheckouts(''); // This would need the actual checkout lookup
    // In production, you'd verify the checkout belongs to the requesting user

    await DocumentVersionControl.releaseCheckout(checkoutId);

    return NextResponse.json({
      success: true,
      message: 'Checkout released successfully'
    });

  } catch (error) {
    console.error('Error releasing checkout:', error);
    return NextResponse.json({ 
      error: 'Failed to release checkout' 
    }, { status: 500 });
  }
}