import { NextResponse } from 'next/server';
import { seoConfig } from '@/lib/seo/seo-config';

export async function GET() {
  return new NextResponse(seoConfig.technical.robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}