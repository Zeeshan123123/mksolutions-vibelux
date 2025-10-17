import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic'

const updateNegotiationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'countered']).optional(),
  counterPrice: z.number().positive().optional(),
  message: z.string().optional(),
  action: z.enum(['update_status', 'add_message', 'counter_offer']),
});

interface NegotiationOffer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  proposedPrice: number;
  counterPrice?: number;
  deliveryDate: Date;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  messages: Array<{
    from: string;
    fromType: 'buyer' | 'seller';
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// In-memory storage for demo (same as main route)
const negotiations = new Map<string, NegotiationOffer>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const negotiation = negotiations.get(params.id);
    
    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negotiation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ negotiation });

  } catch (error) {
    console.error('Error fetching negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch negotiation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateNegotiationSchema.parse(body);
    
    const negotiation = negotiations.get(params.id);
    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negotiation not found' },
        { status: 404 }
      );
    }

    // Check if negotiation has expired
    if (new Date() > negotiation.expiresAt) {
      return NextResponse.json(
        { error: 'Negotiation has expired' },
        { status: 400 }
      );
    }

    // Get current user (in production, extract from JWT token)
    const currentUserId = 'current_user'; // Placeholder
    const isFromBuyer = currentUserId === negotiation.buyerId;
    const isFromSeller = currentUserId === negotiation.sellerId;

    if (!isFromBuyer && !isFromSeller) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this negotiation' },
        { status: 403 }
      );
    }

    // Handle different actions
    switch (data.action) {
      case 'add_message':
        if (data.message) {
          negotiation.messages.push({
            from: currentUserId,
            fromType: isFromBuyer ? 'buyer' : 'seller',
            message: data.message,
            timestamp: new Date()
          });
        }
        break;

      case 'counter_offer':
        if (!data.counterPrice) {
          return NextResponse.json(
            { error: 'Counter price is required for counter offers' },
            { status: 400 }
          );
        }
        
        negotiation.counterPrice = data.counterPrice;
        negotiation.status = 'countered';
        
        if (data.message) {
          negotiation.messages.push({
            from: currentUserId,
            fromType: isFromBuyer ? 'buyer' : 'seller',
            message: data.message,
            timestamp: new Date()
          });
        }
        
        // Extend expiration by 24 hours for counter offers
        negotiation.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        break;

      case 'update_status':
        if (data.status) {
          // Validate status transitions
          const validTransitions = {
            pending: ['accepted', 'rejected', 'countered'],
            countered: ['accepted', 'rejected'],
            accepted: [], // Final state
            rejected: []  // Final state
          };

          if (!(validTransitions as any)[negotiation.status]?.includes(data.status)) {
            return NextResponse.json(
              { error: `Cannot transition from ${negotiation.status} to ${data.status}` },
              { status: 400 }
            );
          }

          negotiation.status = data.status;
          
          if (data.message) {
            negotiation.messages.push({
              from: currentUserId,
              fromType: isFromBuyer ? 'buyer' : 'seller',
              message: data.message,
              timestamp: new Date()
            });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    negotiation.updatedAt = new Date();
    negotiations.set(params.id, negotiation);

    // In production, send notifications to the other party
    console.log(`Negotiation ${params.id} updated by ${isFromBuyer ? 'buyer' : 'seller'}`);

    return NextResponse.json({
      success: true,
      negotiation,
      message: 'Negotiation updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to update negotiation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const negotiation = negotiations.get(params.id);
    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negotiation not found' },
        { status: 404 }
      );
    }

    // Only allow deletion by the creator (buyer) and only if pending
    const currentUserId = 'current_user'; // Placeholder
    if (negotiation.buyerId !== currentUserId) {
      return NextResponse.json(
        { error: 'Only the negotiation creator can delete it' },
        { status: 403 }
      );
    }

    if (negotiation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending negotiations' },
        { status: 400 }
      );
    }

    negotiations.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Negotiation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to delete negotiation' },
      { status: 500 }
    );
  }
}