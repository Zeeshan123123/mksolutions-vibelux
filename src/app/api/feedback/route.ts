import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, title, description, priority } = await request.json();

    // Validate required fields
    if (!type || !title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the feedback submission
    logger.info('api', 'User feedback submitted', {
      userId,
      type,
      title: title.trim(),
      priority,
      descriptionLength: description.trim().length
    });

    // In a real implementation, you would:
    // 1. Store in database (Prisma)
    // 2. Send to project management tool (Linear, Notion, etc.)
    // 3. Send notification to team
    // 4. Auto-create GitHub issue for bugs

    // For now, we'll simulate success
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // You could integrate with external services here:
    // - Create Linear issue
    // - Send Slack notification  
    // - Create GitHub issue for bugs
    // - Add to product roadmap in Notion

    // Example: Send to webhook for external processing
    try {
      if (process.env.FEEDBACK_WEBHOOK_URL) {
        await fetch(process.env.FEEDBACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: feedbackId,
            userId,
            type,
            title: title.trim(),
            description: description.trim(),
            priority,
            timestamp: new Date().toISOString(),
            source: 'vibelux-app'
          })
        });
      }
    } catch (webhookError) {
      logger.error('api', 'Failed to send feedback to webhook', webhookError as Error);
    }

    return NextResponse.json({
      success: true,
      id: feedbackId,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    logger.error('api', 'Failed to submit feedback', error as Error, {
      userId: auth().userId,
      path: '/api/feedback'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return user's feedback history
    // In a real implementation, fetch from database
    
    return NextResponse.json({
      feedback: [],
      message: 'Feedback history (not implemented yet)'
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch feedback', error as Error, {
      userId: auth().userId,
      path: '/api/feedback'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}