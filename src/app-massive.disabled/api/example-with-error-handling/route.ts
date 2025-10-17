import { NextRequest, NextResponse } from 'next/server';

/**
 * Example endpoint with error handling - Simplified for build compatibility
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Example endpoint with error handling',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Example POST endpoint',
      data: body,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}