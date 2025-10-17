import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus } from '@/lib/marketplace-types';
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { status }: { status: OrderStatus } = body;

    // Validate status
    const validStatuses: OrderStatus[] = [
      'PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    ];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // In a real app, you'd update the order in the database
    console.log(`Updating order ${orderId} status to: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      orderId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}