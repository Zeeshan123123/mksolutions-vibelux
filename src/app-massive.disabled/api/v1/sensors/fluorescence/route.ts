import { NextRequest, NextResponse } from 'next/server';

// Fluorescence sensor API - temporarily disabled
// TODO: Implement proper fluorescence sensor service interfaces

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true, 
    message: 'Fluorescence sensor API is under development',
    status: 'disabled'
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Fluorescence sensor API is under development', 
    status: 'disabled'
  });
}

export async function PATCH(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Fluorescence sensor API is under development',
    status: 'disabled'
  });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Fluorescence sensor API is under development',
    status: 'disabled'
  });
}