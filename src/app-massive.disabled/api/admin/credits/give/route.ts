import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { CreditManager } from '@/lib/credits/credit-manager';

export async function POST(request: NextRequest) {
  try {
    const { userId: adminId } = auth();
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, amount, reason, type } = await request.json();

    if (!userId || !amount || !reason || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add credits to user's account
    const transaction = await CreditManager.addCredits(userId, amount, {
      type: type as 'bonus' | 'refund',
      reason,
      adminId,
      metadata: {
        grantedBy: admin.email,
        grantedAt: new Date().toISOString()
      }
    });

    // Mock transaction logging since creditTransaction model doesn't exist
    logger.info('api', 'Credit transaction created', {
      userId,
      type: type as 'bonus' | 'refund',
      amount,
      description: reason,
      adminId,
      adminEmail: admin.email,
      userEmail: user.email
    });

    // Send notification email to user (optional)
    try {
      await sendCreditNotificationEmail(user.email, amount, reason);
    } catch (emailError) {
      logger.error('api', 'Failed to send notification email:', emailError);
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: `Successfully gave ${amount} credits to ${user.email}`
    });

  } catch (error) {
    logger.error('api', 'Error giving credits:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendCreditNotificationEmail(email: string, amount: number, reason: string) {
  // Integration with your email service (SendGrid, etc.)
  // This is a placeholder - implement actual email sending
  
  const emailData = {
    to: email,
    subject: '🎁 You\'ve received free credits!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Great news! You've received credits</h2>
        <p>You've been awarded <strong>${amount} credits</strong> to use on VibeLux!</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You can use these credits for:</p>
        <ul>
          <li>AI-powered facility designs</li>
          <li>Advanced optimization analysis</li>
          <li>Greenhouse planning and modeling</li>
          <li>Energy efficiency calculations</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
          Use Your Credits Now
        </a>
        <p style="color: #666; font-size: 14px;">
          Questions? Reply to this email or contact support at support@vibelux.ai
        </p>
      </div>
    `
  };

  // Implement actual email sending here
  logger.info('api', 'Would send email:', { data: emailData });
}