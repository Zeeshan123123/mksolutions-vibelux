// API route to verify admin permissions
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }
    
    // Check user role in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const isAdmin = user?.role === 'ADMIN';
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    logger.error('api', 'Failed to verify permissions:', error );
    return NextResponse.json({ isAdmin: false });
  }
}