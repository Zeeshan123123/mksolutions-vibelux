/**
 * Feedback Submission API
 * Handles in-app feedback collection with analytics and routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';

interface FeedbackSubmission {
  type: 'rating' | 'feature_request' | 'bug_report' | 'general';
  rating?: number;
  message: string;
  category?: string;
  page: string;
  userAgent: string;
  timestamp: Date;
  context?: Record<string, any>;
}

interface ProcessedFeedback extends FeedbackSubmission {
  id: string;
  userId?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  actionRequired?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const feedback: FeedbackSubmission = await request.json();

    // Validate feedback data
    const validationResult = validateFeedback(feedback);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: validationResult.errors },
        { status: 400 }
      );
    }

    // Process and enrich feedback
    const processedFeedback = await processFeedback(feedback, userId || undefined);

    // Store feedback (would integrate with database)
    await storeFeedback(processedFeedback);

    // Route feedback based on type and priority
    await routeFeedback(processedFeedback);

    // Track analytics
    await trackFeedbackAnalytics(processedFeedback);

    return NextResponse.json({
      success: true,
      feedbackId: processedFeedback.id,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    logger.error('api', 'Feedback submission error:', error );
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate feedback submission
 */
function validateFeedback(feedback: FeedbackSubmission): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!feedback.type || !['rating', 'feature_request', 'bug_report', 'general'].includes(feedback.type)) {
    errors.push('Invalid feedback type');
  }

  if (!feedback.page || typeof feedback.page !== 'string') {
    errors.push('Page information is required');
  }

  if (!feedback.userAgent || typeof feedback.userAgent !== 'string') {
    errors.push('User agent information is required');
  }

  // Type-specific validation
  if (feedback.type === 'rating') {
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
  } else {
    if (!feedback.message || feedback.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
  }

  // Message length limit
  if (feedback.message && feedback.message.length > 5000) {
    errors.push('Message is too long (maximum 5000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Process and enrich feedback with analytics
 */
async function processFeedback(feedback: FeedbackSubmission, userId?: string): Promise<ProcessedFeedback> {
  const processedFeedback: ProcessedFeedback = {
    ...feedback,
    id: generateFeedbackId(),
    userId,
    sentiment: analyzeSentiment(feedback),
    priority: determinePriority(feedback),
    tags: extractTags(feedback),
    actionRequired: requiresAction(feedback)
  };

  return processedFeedback;
}

/**
 * Generate unique feedback ID
 */
function generateFeedbackId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `fb_${timestamp}_${random}`;
}

/**
 * Analyze sentiment of feedback message
 */
function analyzeSentiment(feedback: FeedbackSubmission): 'positive' | 'negative' | 'neutral' {
  // Simple sentiment analysis based on rating and keywords
  if (feedback.type === 'rating' && feedback.rating) {
    if (feedback.rating >= 4) return 'positive';
    if (feedback.rating <= 2) return 'negative';
    return 'neutral';
  }

  if (!feedback.message) return 'neutral';

  const message = feedback.message.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'love', 'great', 'awesome', 'excellent', 'amazing', 'fantastic', 'perfect', 
    'helpful', 'useful', 'brilliant', 'outstanding', 'wonderful', 'impressed',
    'thank you', 'thanks', 'appreciate', 'like', 'enjoy'
  ];

  // Negative keywords
  const negativeWords = [
    'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'useless', 
    'broken', 'bug', 'error', 'problem', 'issue', 'difficult', 'confusing',
    'slow', 'frustrating', 'annoying', 'disappointed', 'fail', 'crash'
  ];

  const positiveCount = positiveWords.filter(word => message.includes(word)).length;
  const negativeCount = negativeWords.filter(word => message.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Determine feedback priority
 */
function determinePriority(feedback: FeedbackSubmission): 'low' | 'medium' | 'high' | 'urgent' {
  // Bug reports get higher priority
  if (feedback.type === 'bug_report') {
    const message = feedback.message?.toLowerCase() || '';
    
    // Urgent keywords
    if (message.includes('crash') || message.includes('data loss') || 
        message.includes('security') || message.includes('can\'t login')) {
      return 'urgent';
    }
    
    // High priority keywords
    if (message.includes('broken') || message.includes('error') || 
        message.includes('not working') || message.includes('fail')) {
      return 'high';
    }
    
    return 'medium';
  }

  // Rating-based priority
  if (feedback.type === 'rating' && feedback.rating) {
    if (feedback.rating <= 2) return 'high';
    if (feedback.rating >= 4) return 'low';
    return 'medium';
  }

  // Feature requests are generally medium priority
  if (feedback.type === 'feature_request') return 'medium';

  return 'low';
}

/**
 * Extract relevant tags from feedback
 */
function extractTags(feedback: FeedbackSubmission): string[] {
  const tags: string[] = [feedback.type];

  if (feedback.category) {
    tags.push(feedback.category);
  }

  // Add page-based tags
  if (feedback.page.includes('/admin')) tags.push('admin');
  if (feedback.page.includes('/ml')) tags.push('machine-learning');
  if (feedback.page.includes('/design')) tags.push('lighting-design');
  if (feedback.page.includes('/calculator')) tags.push('calculator');
  if (feedback.page.includes('/analytics')) tags.push('analytics');

  // Add context-based tags
  if (feedback.context?.viewport) {
    const { width } = feedback.context.viewport;
    if (width < 768) tags.push('mobile');
    else if (width < 1024) tags.push('tablet');
    else tags.push('desktop');
  }

  // Add sentiment tag
  if (feedback.type === 'rating' && feedback.rating) {
    if (feedback.rating >= 4) tags.push('positive-experience');
    else if (feedback.rating <= 2) tags.push('negative-experience');
  }

  return Array.from(new Set(tags)); // Remove duplicates
}

/**
 * Determine if feedback requires immediate action
 */
function requiresAction(feedback: FeedbackSubmission): boolean {
  // High priority bugs require action
  if (feedback.type === 'bug_report') {
    const priority = determinePriority(feedback);
    return priority === 'urgent' || priority === 'high';
  }

  // Very low ratings require action
  if (feedback.type === 'rating' && feedback.rating && feedback.rating <= 2) {
    return true;
  }

  // Security-related feedback requires action
  const message = feedback.message?.toLowerCase() || '';
  if (message.includes('security') || message.includes('hack') || 
      message.includes('vulnerability') || message.includes('breach')) {
    return true;
  }

  return false;
}

/**
 * Store feedback (mock implementation - would integrate with database)
 */
async function storeFeedback(feedback: ProcessedFeedback): Promise<void> {
  // In production, this would:
  // 1. Save to database (Prisma)
  // 2. Integrate with customer support tools
  // 3. Create tickets for high-priority items
  
  logger.info('api', '📝 Storing feedback:', { data: {
    id: feedback.id, type: feedback.type, priority: feedback.priority, sentiment: feedback.sentiment, actionRequired: feedback.actionRequired, page: feedback.page
  } });

  // Mock database storage
  // await prisma.feedback.create({ data: feedback });
}

/**
 * Route feedback to appropriate teams/systems
 */
async function routeFeedback(feedback: ProcessedFeedback): Promise<void> {
  const routingActions: string[] = [];

  // Route based on type and priority
  if (feedback.type === 'bug_report' && feedback.priority === 'urgent') {
    routingActions.push('notify-engineering-team');
    routingActions.push('create-support-ticket');
  }

  if (feedback.type === 'feature_request' && feedback.priority === 'high') {
    routingActions.push('notify-product-team');
  }

  if (feedback.actionRequired) {
    routingActions.push('notify-customer-success');
  }

  // Route based on category
  if (feedback.category === 'ml' || feedback.tags?.includes('machine-learning')) {
    routingActions.push('notify-ml-team');
  }

  if (feedback.category === 'performance') {
    routingActions.push('notify-infrastructure-team');
  }

  // Route very negative feedback
  if (feedback.sentiment === 'negative' && feedback.priority === 'high') {
    routingActions.push('notify-leadership');
  }

  logger.info('api', '📨 Routing feedback:', { data: {
    feedbackId: feedback.id, actions: routingActions
  } });

  // In production, this would trigger actual notifications:
  // - Slack webhooks
  // - Email notifications
  // - Ticket creation in Jira/Linear
  // - Customer success alerts
}

/**
 * Track feedback analytics
 */
async function trackFeedbackAnalytics(feedback: ProcessedFeedback): Promise<void> {
  const analyticsData = {
    event: 'feedback_submitted',
    properties: {
      feedback_type: feedback.type,
      sentiment: feedback.sentiment,
      priority: feedback.priority,
      page: feedback.page,
      user_id: feedback.userId,
      rating: feedback.rating,
      category: feedback.category,
      tags: feedback.tags,
      action_required: feedback.actionRequired,
      timestamp: feedback.timestamp,
      has_message: !!feedback.message,
      message_length: feedback.message?.length || 0
    }
  };

  logger.info('api', '📊 Tracking feedback analytics:', { data: analyticsData });

  // In production, this would send to analytics platforms:
  // - Google Analytics
  // - Mixpanel
  // - Custom analytics database
  // - Business intelligence tools
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return feedback configuration and stats
    return NextResponse.json({
      feedbackTypes: [
        { id: 'rating', label: 'Rating', description: 'Rate your experience' },
        { id: 'feature_request', label: 'Feature Request', description: 'Suggest new features' },
        { id: 'bug_report', label: 'Bug Report', description: 'Report issues' },
        { id: 'general', label: 'General', description: 'General feedback' }
      ],
      categories: {
        feature_request: [
          'lighting', 'analytics', 'automation', 'mobile', 'integrations', 'ml', 'other'
        ],
        bug_report: [
          'ui', 'performance', 'data', 'calculations', 'login', 'mobile', 'other'
        ]
      },
      limits: {
        messageMaxLength: 5000,
        ratingRange: { min: 1, max: 5 }
      }
    });

  } catch (error) {
    logger.error('api', 'Feedback config error:', error );
    return NextResponse.json(
      { error: 'Failed to get feedback configuration' },
      { status: 500 }
    );
  }
}