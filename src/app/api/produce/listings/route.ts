import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic'

const createListingSchema = z.object({
  product: z.object({
    name: z.string(),
    category: z.string(),
    variety: z.string(),
    grade: z.string(),
    size: z.string(),
    packaging: z.string(),
    certifications: z.array(z.string()),
  }),
  availability: z.object({
    current: z.object({
      quantity: z.number().positive(),
      unit: z.string(),
      pricePerUnit: z.number().positive(),
      harvestDate: z.string().datetime(),
      bestBy: z.string().datetime(),
    }),
    predicted: z.array(z.object({
      date: z.string().datetime(),
      quantity: z.number().positive(),
      confidence: z.number().min(0).max(1),
      estimatedPrice: z.number().positive(),
      priceRange: z.array(z.number()).length(2),
      quality: z.enum(['premium', 'standard', 'processing']),
    })).optional(),
  }),
  logistics: z.object({
    fob: z.boolean(),
    canDeliver: z.boolean(),
    maxDeliveryDistance: z.number(),
    shippingMethods: z.array(z.string()),
    leadTime: z.number(),
    minimumOrder: z.number(),
  }),
  quality: z.object({
    brix: z.number().optional(),
    firmness: z.number().optional(),
    color: z.string().optional(),
    pesticides: z.boolean(),
    organicStatus: z.enum(['certified', 'transitional', 'conventional']),
    testResults: z.array(z.object({
      type: z.string(),
      result: z.string(),
      date: z.string().datetime(),
      lab: z.string(),
    })).optional(),
  }),
  volumePricing: z.array(z.object({
    minQuantity: z.number(),
    maxQuantity: z.number(),
    pricePerUnit: z.number().positive(),
    discount: z.number().min(0),
  })),
  negotiable: z.boolean(),
});

const searchSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  organicOnly: z.boolean().optional(),
  minQuantity: z.number().optional(),
  maxDistance: z.number().optional(),
  growerType: z.enum(['controlled_environment', 'open_field', 'hybrid']).optional(),
  sortBy: z.enum(['price', 'distance', 'availability', 'rating']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

interface ProduceListing {
  id: string;
  grower: {
    id: string;
    name: string;
    type: 'controlled_environment' | 'open_field' | 'hybrid';
    location: {
      city: string;
      state: string;
      coordinates: [number, number];
    };
    certifications: string[];
    rating: number;
    reviewCount: number;
    established: number;
  };
  product: any;
  availability: any;
  logistics: any;
  quality: any;
  volumePricing: any;
  negotiable: boolean;
  lastUpdated: Date;
}

// In-memory storage for demo (replace with database in production)
const listings = new Map<string, ProduceListing>();

// Initialize with sample data
if (listings.size === 0) {
  const sampleListings: ProduceListing[] = [
    {
      id: '1',
      grower: {
        id: 'grower_1',
        name: 'Sunset Valley Farms',
        type: 'controlled_environment',
        location: { city: 'Salinas', state: 'CA', coordinates: [36.6777, -121.6555] },
        certifications: ['Organic', 'GAP', 'GLOBALG.A.P.'],
        rating: 4.8,
        reviewCount: 127,
        established: 2015
      },
      product: {
        name: 'Butter Lettuce',
        category: 'Leafy Greens',
        variety: 'Boston Bibb',
        grade: 'A',
        size: 'Medium',
        packaging: '24ct case',
        certifications: ['Organic', 'Non-GMO']
      },
      availability: {
        current: {
          quantity: 500,
          unit: 'cases',
          pricePerUnit: 28.50,
          harvestDate: new Date('2024-01-15'),
          bestBy: new Date('2024-01-22')
        },
        predicted: [
          {
            date: new Date('2024-01-22'),
            quantity: 750,
            confidence: 0.92,
            estimatedPrice: 29.00,
            priceRange: [27.50, 31.00],
            quality: 'premium'
          },
          {
            date: new Date('2024-01-29'),
            quantity: 600,
            confidence: 0.87,
            estimatedPrice: 30.50,
            priceRange: [28.00, 33.00],
            quality: 'premium'
          }
        ]
      },
      logistics: {
        fob: true,
        canDeliver: true,
        maxDeliveryDistance: 200,
        shippingMethods: ['Refrigerated truck', 'Express delivery'],
        leadTime: 1,
        minimumOrder: 50
      },
      quality: {
        brix: 0,
        firmness: 85,
        color: 'Bright green',
        pesticides: false,
        organicStatus: 'certified' as const,
        testResults: [
          {
            type: 'Pesticide residue',
            result: 'None detected',
            date: new Date('2024-01-10'),
            lab: 'AgriTech Labs'
          }
        ]
      },
      volumePricing: [
        { minQuantity: 50, maxQuantity: 199, pricePerUnit: 28.50, discount: 0 },
        { minQuantity: 200, maxQuantity: 499, pricePerUnit: 27.00, discount: 5.3 },
        { minQuantity: 500, maxQuantity: 999, pricePerUnit: 25.50, discount: 10.5 },
        { minQuantity: 1000, maxQuantity: 9999, pricePerUnit: 24.00, discount: 15.8 }
      ],
      negotiable: true,
      lastUpdated: new Date()
    },
    {
      id: '2',
      grower: {
        id: 'grower_2',
        name: 'Heritage Open Fields',
        type: 'open_field',
        location: { city: 'Fresno', state: 'CA', coordinates: [36.7378, -119.7871] },
        certifications: ['GAP', 'Fair Trade'],
        rating: 4.6,
        reviewCount: 89,
        established: 1987
      },
      product: {
        name: 'Roma Tomatoes',
        category: 'Vine Crops',
        variety: 'San Marzano',
        grade: 'A',
        size: 'Medium-Large',
        packaging: '25lb box',
        certifications: ['Fair Trade', 'IPM Certified']
      },
      availability: {
        current: {
          quantity: 1200,
          unit: 'boxes',
          pricePerUnit: 45.00,
          harvestDate: new Date('2024-01-14'),
          bestBy: new Date('2024-01-28')
        },
        predicted: [
          {
            date: new Date('2024-01-21'),
            quantity: 1500,
            confidence: 0.89,
            estimatedPrice: 42.00,
            priceRange: [40.00, 48.00],
            quality: 'premium'
          },
          {
            date: new Date('2024-01-28'),
            quantity: 800,
            confidence: 0.75,
            estimatedPrice: 48.00,
            priceRange: [45.00, 52.00],
            quality: 'standard'
          }
        ]
      },
      logistics: {
        fob: false,
        canDeliver: true,
        maxDeliveryDistance: 500,
        shippingMethods: ['Standard truck', 'Rail'],
        leadTime: 2,
        minimumOrder: 100
      },
      quality: {
        brix: 6.2,
        firmness: 78,
        color: 'Deep red',
        pesticides: false,
        organicStatus: 'conventional' as const,
        testResults: [
          {
            type: 'Brix test',
            result: '6.2°',
            date: new Date('2024-01-12'),
            lab: 'Produce Quality Labs'
          }
        ]
      },
      volumePricing: [
        { minQuantity: 100, maxQuantity: 499, pricePerUnit: 45.00, discount: 0 },
        { minQuantity: 500, maxQuantity: 999, pricePerUnit: 42.00, discount: 6.7 },
        { minQuantity: 1000, maxQuantity: 2499, pricePerUnit: 39.00, discount: 13.3 },
        { minQuantity: 2500, maxQuantity: 9999, pricePerUnit: 36.00, discount: 20.0 }
      ],
      negotiable: true,
      lastUpdated: new Date()
    }
  ];

  sampleListings.forEach(listing => listings.set(listing.id, listing));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);
    
    // Parse and validate search parameters
    const data = searchSchema.parse({
      ...filters,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      minQuantity: filters.minQuantity ? parseInt(filters.minQuantity) : undefined,
      maxDistance: filters.maxDistance ? parseInt(filters.maxDistance) : undefined,
      organicOnly: filters.organicOnly === 'true',
      limit: filters.limit ? parseInt(filters.limit) : 20,
      offset: filters.offset ? parseInt(filters.offset) : 0,
    });

    let filteredListings = Array.from(listings.values());

    // Apply filters
    if (data.category) {
      filteredListings = filteredListings.filter(listing => 
        listing.product.category === data.category
      );
    }

    if (data.subcategory) {
      filteredListings = filteredListings.filter(listing => 
        listing.product.name === data.subcategory
      );
    }

    if (data.search) {
      const searchTerm = data.search.toLowerCase();
      filteredListings = filteredListings.filter(listing =>
        listing.product.name.toLowerCase().includes(searchTerm) ||
        listing.grower.name.toLowerCase().includes(searchTerm) ||
        listing.product.variety.toLowerCase().includes(searchTerm)
      );
    }

    if (data.minPrice || data.maxPrice) {
      filteredListings = filteredListings.filter(listing => {
        const price = listing.availability.current.pricePerUnit;
        return (!data.minPrice || price >= data.minPrice) &&
               (!data.maxPrice || price <= data.maxPrice);
      });
    }

    if (data.organicOnly) {
      filteredListings = filteredListings.filter(listing => 
        listing.quality.organicStatus === 'certified'
      );
    }

    if (data.minQuantity) {
      filteredListings = filteredListings.filter(listing => 
        listing.availability.current.quantity >= data.minQuantity!
      );
    }

    if (data.growerType) {
      filteredListings = filteredListings.filter(listing => 
        listing.grower.type === data.growerType
      );
    }

    // Apply sorting
    if (data.sortBy) {
      filteredListings.sort((a, b) => {
        switch (data.sortBy) {
          case 'price':
            return a.availability.current.pricePerUnit - b.availability.current.pricePerUnit;
          case 'rating':
            return b.grower.rating - a.grower.rating;
          case 'availability':
            return b.availability.current.quantity - a.availability.current.quantity;
          case 'distance':
            // Placeholder - would calculate based on user location
            return 0;
          default:
            return 0;
        }
      });
    }

    // Apply pagination
    const total = filteredListings.length;
    const paginatedListings = filteredListings.slice(data.offset!, data.offset! + data.limit!);

    return NextResponse.json({
      listings: paginatedListings,
      pagination: {
        total,
        limit: data.limit,
        offset: data.offset,
        hasMore: data.offset! + data.limit! < total
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createListingSchema.parse(body);
    
    // Get current user (in production, extract from JWT token)
    const growerId = 'current_grower'; // Placeholder
    
    // Create new listing
    const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const listing: ProduceListing = {
      id: listingId,
      grower: {
        id: growerId,
        name: 'Current Grower', // Would fetch from user profile
        type: 'open_field', // Would come from grower profile
        location: { city: 'Unknown', state: 'CA', coordinates: [0, 0] },
        certifications: [],
        rating: 0,
        reviewCount: 0,
        established: new Date().getFullYear()
      },
      product: data.product,
      availability: {
        ...data.availability,
        current: {
          ...data.availability.current,
          harvestDate: new Date(data.availability.current.harvestDate),
          bestBy: new Date(data.availability.current.bestBy),
        },
        predicted: data.availability.predicted?.map(p => ({
          ...p,
          date: new Date(p.date)
        })) || []
      },
      logistics: data.logistics,
      quality: {
        ...data.quality,
        testResults: data.quality.testResults?.map(test => ({
          ...test,
          date: new Date(test.date)
        })) || []
      },
      volumePricing: data.volumePricing,
      negotiable: data.negotiable,
      lastUpdated: new Date()
    };

    listings.set(listingId, listing);

    return NextResponse.json({
      success: true,
      listing,
      message: 'Listing created successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid listing data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}