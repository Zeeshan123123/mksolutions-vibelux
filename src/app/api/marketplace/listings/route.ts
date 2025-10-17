import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

// Mock data for demonstration
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Premium Organic Lettuce',
    category: 'Leafy Greens',
    variety: 'Butterhead',
    quantity: 500,
    unit: 'lbs',
    pricePerUnit: 3.50,
    currency: 'USD',
    location: {
      city: 'Portland',
      state: 'OR',
      distance: 15
    },
    harvestDate: new Date('2024-01-15'),
    availableUntil: new Date('2024-01-25'),
    certifications: ['USDA Organic', 'GAP Certified', 'Non-GMO'],
    images: ['/api/placeholder/400/300'],
    description: 'Fresh, crisp organic butterhead lettuce grown in our state-of-the-art hydroponic facility.',
    seller: {
      id: 'seller1',
      name: 'Green Valley Farms',
      rating: 4.8,
      totalSales: 342,
      verified: true
    },
    status: 'available' as const,
    views: 156,
    inquiries: 12
  },
  {
    id: '2',
    title: 'Heirloom Tomatoes',
    category: 'Tomatoes',
    variety: 'Cherokee Purple',
    quantity: 200,
    unit: 'lbs',
    pricePerUnit: 4.25,
    currency: 'USD',
    location: {
      city: 'Sacramento',
      state: 'CA',
      distance: 45
    },
    harvestDate: new Date('2024-01-14'),
    availableUntil: new Date('2024-01-21'),
    certifications: ['Pesticide Free', 'Local'],
    images: ['/api/placeholder/400/300'],
    description: 'Beautiful heirloom Cherokee Purple tomatoes with exceptional flavor.',
    seller: {
      id: 'seller2',
      name: 'Sunrise Gardens',
      rating: 4.6,
      totalSales: 189,
      verified: true
    },
    status: 'available' as const,
    views: 89,
    inquiries: 7
  },
  {
    id: '3',
    title: 'Fresh Basil',
    category: 'Herbs',
    variety: 'Genovese',
    quantity: 50,
    unit: 'lbs',
    pricePerUnit: 12.00,
    currency: 'USD',
    location: {
      city: 'Denver',
      state: 'CO',
      distance: 120
    },
    harvestDate: new Date('2024-01-16'),
    availableUntil: new Date('2024-01-20'),
    certifications: ['USDA Organic', 'Hydroponic'],
    images: ['/api/placeholder/400/300'],
    description: 'Aromatic Genovese basil perfect for restaurants and retail.',
    seller: {
      id: 'seller3',
      name: 'Mountain Herbs Co',
      rating: 4.9,
      totalSales: 567,
      verified: true
    },
    status: 'available' as const,
    views: 234,
    inquiries: 18
  },
  {
    id: '4',
    title: 'Microgreens Mix',
    category: 'Microgreens',
    variety: 'Chef\'s Blend',
    quantity: 25,
    unit: 'lbs',
    pricePerUnit: 28.00,
    currency: 'USD',
    location: {
      city: 'Seattle',
      state: 'WA',
      distance: 5
    },
    harvestDate: new Date('2024-01-17'),
    availableUntil: new Date('2024-01-19'),
    certifications: ['USDA Organic', 'Non-GMO', 'Local'],
    images: ['/api/placeholder/400/300'],
    description: 'Premium microgreens blend including pea shoots, sunflower, and radish.',
    seller: {
      id: 'seller4',
      name: 'Urban Micro Farm',
      rating: 5.0,
      totalSales: 892,
      verified: true
    },
    status: 'available' as const,
    views: 445,
    inquiries: 32
  },
  {
    id: '5',
    title: 'Sweet Bell Peppers',
    category: 'Peppers',
    variety: 'Rainbow Mix',
    quantity: 300,
    unit: 'lbs',
    pricePerUnit: 3.75,
    currency: 'USD',
    location: {
      city: 'Phoenix',
      state: 'AZ',
      distance: 200
    },
    harvestDate: new Date('2024-01-15'),
    availableUntil: new Date('2024-01-22'),
    certifications: ['GAP Certified', 'Pesticide Free'],
    images: ['/api/placeholder/400/300'],
    description: 'Colorful mix of red, yellow, and orange bell peppers.',
    seller: {
      id: 'seller5',
      name: 'Desert Bloom Farms',
      rating: 4.7,
      totalSales: 423,
      verified: true
    },
    status: 'reserved' as const,
    views: 178,
    inquiries: 15
  },
  {
    id: '6',
    title: 'Strawberries',
    category: 'Berries',
    variety: 'Albion',
    quantity: 100,
    unit: 'lbs',
    pricePerUnit: 6.50,
    currency: 'USD',
    location: {
      city: 'San Diego',
      state: 'CA',
      distance: 150
    },
    harvestDate: new Date('2024-01-16'),
    availableUntil: new Date('2024-01-18'),
    certifications: ['USDA Organic', 'Non-GMO'],
    images: ['/api/placeholder/400/300'],
    description: 'Sweet, juicy strawberries grown in controlled environment.',
    seller: {
      id: 'seller6',
      name: 'Berry Best Farms',
      rating: 4.8,
      totalSales: 651,
      verified: true
    },
    status: 'available' as const,
    views: 567,
    inquiries: 43
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    // const listings = await prisma.produceListing.findMany({
    //   where: { status: 'available' },
    //   include: { seller: true },
    //   orderBy: { createdAt: 'desc' }
    // });

    // For now, return mock data
    return NextResponse.json({ listings: MOCK_LISTINGS });

  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.category || !data.quantity || !data.pricePerUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, create in database
    // const listing = await prisma.produceListing.create({
    //   data: {
    //     ...data,
    //     sellerId: userId,
    //     status: 'available'
    //   }
    // });

    // For now, return success
    return NextResponse.json({ 
      success: true,
      listing: { id: Date.now().toString(), ...data }
    });

  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}