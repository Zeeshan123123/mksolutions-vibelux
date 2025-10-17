// API route for user impersonation - DISABLED FOR SECURITY
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'User impersonation is disabled for security reasons' },
    { status: 403 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'User impersonation logs are disabled for security reasons' },
    { status: 403 }
  );
}