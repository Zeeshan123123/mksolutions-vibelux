import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

// GET current facility weather binding
export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facility = await prisma.facility.findFirst({
    where: { users: { some: { userId } } },
    select: { id: true }
  });
  if (!facility) return NextResponse.json({ facilityWeather: null });

  const binding = await prisma.facilityWeather.findUnique({ where: { facilityId: facility.id } });
  return NextResponse.json({ facilityWeather: binding });
}

// PUT to set provider/station/coords
export async function PUT(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facility = await prisma.facility.findFirst({
    where: { users: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } },
    select: { id: true }
  });
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 });

  const body = await req.json();
  const data: any = {};
  if (body.provider) data.provider = body.provider;
  if (typeof body.stationId === 'string') data.stationId = body.stationId;
  if (typeof body.latitude === 'number') data.latitude = body.latitude;
  if (typeof body.longitude === 'number') data.longitude = body.longitude;

  const upserted = await prisma.facilityWeather.upsert({
    where: { facilityId: facility.id },
    create: { facilityId: facility.id, ...data },
    update: { ...data },
  });

  return NextResponse.json({ facilityWeather: upserted });
}


