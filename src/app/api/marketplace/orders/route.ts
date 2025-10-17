import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/marketplace-types';
export const dynamic = 'force-dynamic'

// Mock order data with correct uppercase status values
const mockOrders: Order[] = [
  {
    id: 'ord_1',
    buyerId: 'buyer_1',
    sellerId: 'seller_1',
    items: [
      {
        id: 'item_1',
        productName: 'Organic Buttercrunch Lettuce',
        quantity: 50,
        unit: 'heads',
        pricePerUnit: 2.50,
        totalPrice: 125.00,
        listingId: 'listing_1'
      }
    ],
    status: 'PENDING',
    totalAmount: 125.00,
    deliveryDate: new Date('2025-08-05'),
    deliveryMethod: 'delivery',
    deliveryAddress: '123 Restaurant Ave, Food City, FC 12345',
    notes: 'Please deliver in the morning',
    createdAt: new Date('2025-08-01')
  },
  {
    id: 'ord_2',
    buyerId: 'buyer_1',
    sellerId: 'seller_2',
    items: [
      {
        id: 'item_2',
        productName: 'Cherry Tomatoes',
        quantity: 20,
        unit: 'lbs',
        pricePerUnit: 4.00,
        totalPrice: 80.00,
        listingId: 'listing_2'
      }
    ],
    status: 'CONFIRMED',
    totalAmount: 80.00,
    deliveryDate: new Date('2025-08-03'),
    deliveryMethod: 'pickup',
    notes: 'Pickup at greenhouse',
    createdAt: new Date('2025-07-30')
  },
  {
    id: 'ord_3',
    buyerId: 'buyer_2',
    sellerId: 'seller_1',
    items: [
      {
        id: 'item_3',
        productName: 'Fresh Basil',
        quantity: 10,
        unit: 'bunches',
        pricePerUnit: 3.00,
        totalPrice: 30.00,
        listingId: 'listing_3'
      }
    ],
    status: 'IN_TRANSIT',
    totalAmount: 30.00,
    deliveryDate: new Date('2025-08-02'),
    deliveryMethod: 'delivery',
    deliveryAddress: '456 Market St, Grocery Town, GT 67890',
    createdAt: new Date('2025-07-29')
  },
  {
    id: 'ord_4',
    buyerId: 'buyer_1',
    sellerId: 'seller_3',
    items: [
      {
        id: 'item_4',
        productName: 'Hydroponic Spinach',
        quantity: 25,
        unit: 'lbs',
        pricePerUnit: 5.50,
        totalPrice: 137.50,
        listingId: 'listing_4'
      }
    ],
    status: 'DELIVERED',
    totalAmount: 137.50,
    deliveryDate: new Date('2025-07-28'),
    deliveryMethod: 'delivery',
    deliveryAddress: '789 Farm Rd, Produce Place, PP 13579',
    createdAt: new Date('2025-07-25')
  },
  {
    id: 'ord_5',
    buyerId: 'buyer_3',
    sellerId: 'seller_1',
    items: [
      {
        id: 'item_5',
        productName: 'Romaine Hearts',
        quantity: 40,
        unit: 'heads',
        pricePerUnit: 1.75,
        totalPrice: 70.00,
        listingId: 'listing_5'
      }
    ],
    status: 'CANCELLED',
    totalAmount: 70.00,
    deliveryDate: new Date('2025-08-10'),
    deliveryMethod: 'delivery',
    deliveryAddress: '321 Bistro Blvd, Chef City, CC 24680',
    notes: 'Cancelled due to oversupply',
    createdAt: new Date('2025-08-01')
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer';

    // Filter orders based on role
    // In a real app, you'd filter by actual user ID
    const filteredOrders = mockOrders.filter(order => {
      if (role === 'buyer') {
        return ['buyer_1', 'buyer_2', 'buyer_3'].includes(order.buyerId);
      } else {
        return ['seller_1', 'seller_2', 'seller_3'].includes(order.sellerId);
      }
    });

    return NextResponse.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('Error fetching marketplace orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { status } = body;

    // In a real app, you'd update the order in the database
    console.log('Updating order status to:', status);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}