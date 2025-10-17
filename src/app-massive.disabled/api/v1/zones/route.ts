import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';

const mockZones = [
  {
    id: 'zone1',
    name: 'Flower Room A',
    type: 'flower',
    area: 1200,
    plants: 150,
    temperature: 22.5,
    humidity: 55,
    co2: 1200,
    status: 'optimal'
  },
  {
    id: 'zone2', 
    name: 'Veg Room B',
    type: 'vegetative',
    area: 800,
    plants: 300,
    temperature: 24.1,
    humidity: 65,
    co2: 800,
    status: 'optimal'
  },
  {
    id: 'zone3',
    name: 'Propagation',
    type: 'propagation', 
    area: 400,
    plants: 500,
    temperature: 23.8,
    humidity: 75,
    co2: 600,
    status: 'warning'
  }
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      zones: mockZones,
      total: mockZones.length
    });
  } catch (error) {
    logger.error('api', 'Error getting zones:', error );
    return NextResponse.json(
      { error: 'Failed to get zones' },
      { status: 500 }
    );
  }
}