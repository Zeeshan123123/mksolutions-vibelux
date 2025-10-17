// This route has been moved to /api/developer/api-keys
// Keeping this file for backward compatibility with a redirect

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint has been moved',
      message: 'Please use /api/developer/api-keys instead',
      newEndpoint: '/api/developer/api-keys'
    },
    { status: 301 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint has been moved',
      message: 'Please use /api/developer/api-keys instead',
      newEndpoint: '/api/developer/api-keys'
    },
    { status: 301 }
  );
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint has been moved',
      message: 'Please use /api/developer/api-keys instead',
      newEndpoint: '/api/developer/api-keys'
    },
    { status: 301 }
  );
}