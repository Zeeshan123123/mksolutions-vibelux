import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic'

const createNegotiationSchema = z.object({
  listingId: z.string(),
  quantity: z.number().positive(),
  proposedPrice: z.number().positive(),
  deliveryDate: z.string().datetime(),
  terms: z.string().optional(),
  message: z.string().optional(),
});

const updateNegotiationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'countered']),
  counterPrice: z.number().positive().optional(),
  message: z.string().optional(),
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

// In-memory storage for demo (replace with database in production)
const negotiations = new Map<string, NegotiationOffer>();
const listings = new Map<string, any>();

// Initialize with sample listings
if (listings.size === 0) {
  listings.set('1', {
    id: '1',
    sellerId: 'grower_1',
    product: { name: 'Butter Lettuce' },
    availability: { current: { pricePerUnit: 28.50 } }
  });
  listings.set('2', {
    id: '2', 
    sellerId: 'grower_2',
    product: { name: 'Roma Tomatoes' },
    availability: { current: { pricePerUnit: 45.00 } }
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType') as 'buyer' | 'seller';
    
    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'userId and userType are required' },
        { status: 400 }
      );
    }

    // Filter negotiations based on user role
    const userNegotiations = Array.from(negotiations.values()).filter(neg => 
      userType === 'buyer' ? neg.buyerId === userId : neg.sellerId === userId
    );

    // Sort by most recent first
    userNegotiations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return NextResponse.json({
      negotiations: userNegotiations,
      count: userNegotiations.length
    });

  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch negotiations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createNegotiationSchema.parse(body);
    
    // Get current user (in production, extract from JWT token)
    const buyerId = 'current_user'; // Placeholder
    
    // Get listing to find seller
    const listing = listings.get(data.listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Create new negotiation
    const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const negotiation: NegotiationOffer = {
      id: negotiationId,
      listingId: data.listingId,
      buyerId,
      sellerId: listing.sellerId,
      quantity: data.quantity,
      proposedPrice: data.proposedPrice,
      deliveryDate: new Date(data.deliveryDate),
      terms: data.terms || 'Standard terms and conditions apply',
      status: 'pending',
      messages: data.message ? [{
        from: buyerId,
        fromType: 'buyer',
        message: data.message,
        timestamp: new Date()
      }] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };

    negotiations.set(negotiationId, negotiation);

    // In production, send notification to seller
    console.log(`New negotiation created: ${negotiationId} for listing ${data.listingId}`);

    return NextResponse.json({
      success: true,
      negotiation,
      message: 'Negotiation created successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to create negotiation' },
      { status: 500 }
    );
  }
}