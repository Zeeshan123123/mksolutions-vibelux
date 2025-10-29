import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    // Get all sensors for the facility through greenhouse designs and zones
    const sensors = await prisma.zoneSensor.findMany({
      where: {
        zone: {
          greenhouseDesign: {
            facilityId
          }
        }
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            greenhouseDesign: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { zone: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ sensors });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
