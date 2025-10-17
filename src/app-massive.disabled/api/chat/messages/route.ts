import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

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
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Message ID for pagination

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 }
      );
    }

    // Verify user has access to channel
    const channel = await prisma.chatChannel.findFirst({
      where: {
        id: channelId,
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            members: {
              some: { userId }
            }
          }
        ]
      }
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or access denied' },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        channelId,
        ...(before && {
          createdAt: {
            lt: new Date(before)
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Format messages for client
    const formattedMessages = messages.reverse().map(message => ({
      id: message.id,
      content: message.content,
      authorId: message.userId,
      authorName: message.user.name || message.user.email,
      timestamp: message.createdAt,
      channelId: message.channelId,
      reactions: message.reactions.reduce((acc, reaction) => {
        const existing = acc.find(r => r.emoji === reaction.emoji);
        if (existing) {
          existing.users.push(reaction.userId);
        } else {
          acc.push({
            emoji: reaction.emoji,
            users: [reaction.userId]
          });
        }
        return acc;
      }, [] as { emoji: string; users: string[] }[]),
      attachments: [],
      replyTo: null
    }));

    // Note: Last seen tracking would be implemented with a separate model if needed

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      hasMore: messages.length === limit
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch messages', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: (error as Error).message },
      { status: 500 }
    );
  }
}

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
    const { channelId, content, replyToId, attachments = [] } = body;

    if (!channelId || !content?.trim()) {
      return NextResponse.json(
        { error: 'channelId and content are required' },
        { status: 400 }
      );
    }

    // Verify user has access to channel
    const channel = await prisma.chatChannel.findFirst({
      where: {
        id: channelId,
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            members: {
              some: { userId }
            }
          }
        ]
      }
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or access denied' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        channelId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      }
    });

    // Note: Channel last activity tracking would be implemented if needed

    // Format message for response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      authorId: message.userId,
      authorName: message.user.name || message.user.email,
      timestamp: message.createdAt,
      channelId: message.channelId,
      reactions: [],
      attachments: [],
      replyTo: null
    };

    logger.info('api', 'Message sent', {
      messageId: message.id,
      channelId,
      authorId: userId
    });

    // TODO: Send real-time updates via WebSocket or Server-Sent Events

    return NextResponse.json({
      success: true,
      message: formattedMessage
    });

  } catch (error) {
    logger.error('api', 'Failed to send message', error as Error);
    return NextResponse.json(
      { error: 'Failed to send message', details: (error as Error).message },
      { status: 500 }
    );
  }
}