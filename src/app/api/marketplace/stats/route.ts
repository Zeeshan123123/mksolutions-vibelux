import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // In production, calculate from database
    // const stats = await prisma.produceListing.aggregate({...});

    // Mock stats for demonstration
    const stats = {
      totalListings: 247,
      totalVolume: 1250000, // Total dollar volume
      averagePrice: 5.75, // Average price per unit
      topCategories: [
        { name: 'Leafy Greens', count: 89 },
        { name: 'Herbs', count: 56 },
        { name: 'Tomatoes', count: 43 },
        { name: 'Microgreens', count: 31 },
        { name: 'Berries', count: 28 }
      ]
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}