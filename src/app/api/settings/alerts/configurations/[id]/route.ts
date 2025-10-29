import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Soft delete by setting enabled to false
    await prisma.alertConfiguration.update({
      where: { id },
      data: {
        enabled: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
