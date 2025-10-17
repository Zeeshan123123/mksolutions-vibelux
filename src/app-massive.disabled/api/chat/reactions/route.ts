import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId, emoji } = body;

    if (!messageId || !emoji) {
      return NextResponse.json(
        { error: 'messageId and emoji are required' },
        { status: 400 }
      );
    }

    // Verify message exists and user has access
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId
      },
      include: {
        channel: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user has access to channel
    const hasAccess = !message.channel.isPrivate || message.channel.members.length > 0;
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId,
        emoji
      }
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id
        }
      });

      logger.info('api', 'Reaction removed', {
        messageId,
        userId,
        emoji
      });

      return NextResponse.json({
        success: true,
        action: 'removed'
      });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji
        }
      });

      logger.info('api', 'Reaction added', {
        messageId,
        userId,
        emoji
      });

      return NextResponse.json({
        success: true,
        action: 'added'
      });
    }

  } catch (error) {
    logger.error('api', 'Failed to toggle reaction', error as Error);
    return NextResponse.json(
      { error: 'Failed to toggle reaction', details: (error as Error).message },
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

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    // Get all reactions for the message
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      const existing = acc.find(r => r.emoji === reaction.emoji);
      if (existing) {
        existing.users.push({
          id: reaction.userId,
          name: reaction.user.name || 'Unknown'
        });
        existing.count++;
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: [{
            id: reaction.userId,
            name: reaction.user.name || 'Unknown'
          }],
          hasUserReacted: reaction.userId === userId
        });
      }
      return acc;
    }, [] as Array<{
      emoji: string;
      count: number;
      users: Array<{ id: string; name: string }>;
      hasUserReacted: boolean;
    }>);

    // Update hasUserReacted for each emoji
    groupedReactions.forEach(reaction => {
      reaction.hasUserReacted = reaction.users.some(user => user.id === userId);
    });

    return NextResponse.json({
      success: true,
      reactions: groupedReactions
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch reactions', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions', details: (error as Error).message },
      { status: 500 }
    );
  }
}