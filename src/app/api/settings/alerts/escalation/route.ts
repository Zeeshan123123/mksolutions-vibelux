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

    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: {
        settings: true
      }
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    // Extract escalation settings from facility.settings
    const settings = facility.settings as any;
    const config = settings?.alertEscalation || {
      enabled: true,
      levels: {
        CRITICAL: [10, 20],
        HIGH: [15, 30],
        MEDIUM: [30, 60],
        LOW: [60]
      },
      recipients: []
    };

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error fetching escalation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, config } = body;

    if (!facilityId || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current settings
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { settings: true }
    });

    const currentSettings = (facility?.settings as any) || {};

    // Update facility settings with escalation config
    await prisma.facility.update({
      where: { id: facilityId },
      data: {
        settings: {
          ...currentSettings,
          alertEscalation: config
        }
      }
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error saving escalation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
