import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

const BASE_TEMP_F = 65;

function fToC(f: number) { return (f - 32) * 5/9; }
function cToF(c: number) { return (c * 9/5) + 32; }

async function fetchOpenMeteoDaily(lat: number, lon: number, days: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&past_days=${days}&forecast_days=0&timezone=UTC`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Open-Meteo fetch failed');
  const data = await res.json();
  const dates: string[] = data.daily.time;
  const tmaxC: number[] = data.daily.temperature_2m_max;
  const tminC: number[] = data.daily.temperature_2m_min;
  return dates.map((d, i) => {
    const maxF = cToF(tmaxC[i]);
    const minF = cToF(tminC[i]);
    const avgF = (maxF + minF) / 2;
    const hdd = Math.max(0, BASE_TEMP_F - avgF);
    const cdd = Math.max(0, avgF - BASE_TEMP_F);
    return { date: d, tavg: avgF, hdd, cdd };
  });
}

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get('days') || '30', 10) || 30, 366);

  // Resolve user facility
  const facility = await prisma.facility.findFirst({
    where: { users: { some: { userId } } },
    select: { id: true, latitude: true, longitude: true }
  });
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 });

  // Read binding and coords
  const binding = await prisma.facilityWeather.findUnique({ where: { facilityId: facility.id } });
  const lat = binding?.latitude ?? facility.latitude;
  const lon = binding?.longitude ?? facility.longitude;
  if (lat == null || lon == null) return NextResponse.json({ error: 'Facility missing lat/lon' }, { status: 400 });

  const provider = binding?.provider || 'NOAA';

  try {
    let series: Array<{ date: string; tavg: number; hdd: number; cdd: number }> = [];

    if (provider === 'OPEN_METEO' || provider === 'METEOSTAT') {
      // Use Open-Meteo as a general-purpose fallback
      series = await fetchOpenMeteoDaily(lat, lon, days);
    } else {
      // Try internal NOAA historical endpoint (uses token + fallback sim)
      const end = new Date();
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
      const url = `${req.nextUrl.origin}/api/weather/historical?lat=${lat}&lon=${lon}&startDate=${start.toISOString().slice(0,10)}&endDate=${end.toISOString().slice(0,10)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('NOAA historical fetch failed');
      const data = await res.json();
      series = (data.data || []).map((d: any) => ({
        date: d.date,
        tavg: d.tavg ?? ((d.tmax + d.tmin) / 2),
        hdd: d.hdd,
        cdd: d.cdd,
      }));
    }

    const totals = series.reduce((acc, d) => ({ hdd: acc.hdd + (d.hdd || 0), cdd: acc.cdd + (d.cdd || 0) }), { hdd: 0, cdd: 0 });

    // Update last sync
    await prisma.facilityWeather.upsert({
      where: { facilityId: facility.id },
      create: { facilityId: facility.id, provider: provider as any, lastSync: new Date() },
      update: { lastSync: new Date() },
    });

    return NextResponse.json({
      success: true,
      provider,
      facilityId: facility.id,
      location: { latitude: lat, longitude: lon },
      days,
      totals,
      series,
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Refresh failed', details: e?.message || 'unknown' }, { status: 500 });
  }
}


