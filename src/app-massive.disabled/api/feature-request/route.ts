import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';

const featureRequestSchema = z.object({
  title: z.string().min(1, 'Feature title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be under 2000 characters'),
  category: z.enum([
    'analytics',
    'ai-automation', 
    'mobile',
    'integrations',
    'design-tools',
    'calculations',
    'data-export',
    'user-interface',
    'sensors',
    'energy',
    'other'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  useCase: z.string().min(10, 'Use case description is required').max(1000, 'Use case must be under 1000 characters'),
  userType: z.enum(['grower', 'consultant', 'researcher', 'engineer', 'manager', 'investor', 'other']).optional(),
  expectedBenefit: z.string().max(1000, 'Expected benefit must be under 1000 characters').optional(),
  currentWorkaround: z.string().max(1000, 'Current workaround must be under 1000 characters').optional(),
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  company: z.string().max(100, 'Company name must be under 100 characters').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = featureRequestSchema.parse(body);

    // Generate a unique feature request ID
    const requestId = `FR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Create comprehensive feature request record
    const featureRequest = {
      id: requestId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted',
      clientIp: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      
      // User information
      submitter: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company || null,
        userType: validatedData.userType || null,
      },

      // Feature details
      feature: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        useCase: validatedData.useCase,
        expectedBenefit: validatedData.expectedBenefit || null,
        currentWorkaround: validatedData.currentWorkaround || null,
      },

      // Tracking fields
      votes: 0,
      comments: [],
      tags: [],
      assignedTo: null,
      estimatedEffort: null,
      targetRelease: null,
    };

    // Calculate priority score for ranking
    const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 };
    const categoryWeights = {
      'analytics': 1.2,
      'ai-automation': 1.3,
      'mobile': 1.1,
      'integrations': 1.0,
      'design-tools': 1.1,
      'calculations': 1.0,
      'data-export': 0.9,
      'user-interface': 1.0,
      'sensors': 1.1,
      'energy': 1.2,
      'other': 0.8
    };

    const priorityScore = priorityScores[validatedData.priority] * 
                         (categoryWeights[validatedData.category] || 1.0);

    // Log the feature request for analysis
    logger.info('api', 'Feature Request Submitted:', { data: {
      id: requestId, timestamp: featureRequest.createdAt, category: validatedData.category, priority: validatedData.priority, priorityScore, userType: validatedData.userType, company: validatedData.company, titleLength: validatedData.title.length, descriptionLength: validatedData.description.length, hasWorkaround: !!validatedData.currentWorkaround, hasBenefit: !!validatedData.expectedBenefit, } });

    // In production, you would:
    // 1. Store in database
    // await db.featureRequests.create({ data: featureRequest });

    // 2. Send notification to product team
    // await notificationService.sendToSlack({
    //   channel: '#product-requests',
    //   message: `🚀 New feature request: "${validatedData.title}"`,
    //   details: {
    //     category: validatedData.category,
    //     priority: validatedData.priority,
    //     submitter: validatedData.name,
    //     company: validatedData.company,
    //     requestId
    //   }
    // });

    // 3. Add to product management tool (Linear, Jira, etc.)
    // await productManagementTool.createIssue({
    //   title: `[Feature Request] ${validatedData.title}`,
    //   description: `
    //     **Submitted by:** ${validatedData.name} (${validatedData.company || 'No company'})
    //     **Category:** ${validatedData.category}
    //     **Priority:** ${validatedData.priority}
    //     **User Type:** ${validatedData.userType || 'Not specified'}
    //     
    //     **Description:**
    //     ${validatedData.description}
    //     
    //     **Use Case:**
    //     ${validatedData.useCase}
    //     
    //     **Expected Benefits:**
    //     ${validatedData.expectedBenefit || 'Not specified'}
    //     
    //     **Current Workaround:**
    //     ${validatedData.currentWorkaround || 'Not specified'}
    //     
    //     **Request ID:** ${requestId}
    //   `,
    //   labels: ['feature-request', validatedData.category, validatedData.priority],
    //   priority: validatedData.priority,
    // });

    // 4. Send confirmation email to submitter
    // await emailService.send({
    //   to: validatedData.email,
    //   subject: `Feature Request Received: ${validatedData.title}`,
    //   template: 'feature-request-confirmation',
    //   data: {
    //     name: validatedData.name,
    //     title: validatedData.title,
    //     requestId,
    //     trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/feature-request/${requestId}`
    //   }
    // });

    // 5. Check for duplicate or similar requests
    // const similarRequests = await findSimilarRequests(validatedData.title, validatedData.description);
    // if (similarRequests.length > 0) {
    //   await notifyAboutSimilarRequests(requestId, similarRequests);
    // }

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Feature request submitted successfully',
      data: {
        title: validatedData.title,
        category: validatedData.category,
        priority: validatedData.priority,
        estimatedReviewTime: '5 business days',
        trackingInfo: {
          status: 'submitted',
          nextSteps: [
            'Product team review',
            'Feasibility assessment', 
            'User impact evaluation',
            'Development prioritization'
          ]
        }
      }
    });

  } catch (error) {
    logger.error('api', 'Error processing feature request:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process feature request',
      message: 'Please try again or contact support if the problem persists'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve feature request status (for future tracking page)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('id');

  if (!requestId) {
    return NextResponse.json({
      error: 'Request ID is required'
    }, { status: 400 });
  }

  try {
    // In production, retrieve from database
    // const featureRequest = await db.featureRequests.findUnique({
    //   where: { id: requestId },
    //   include: { comments: true, votes: true }
    // });

    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Feature request tracking not yet implemented',
      requestId,
      note: 'This endpoint will provide status updates and tracking information for feature requests'
    });

  } catch (error) {
    logger.error('api', 'Error retrieving feature request:', error );
    
    return NextResponse.json({
      error: 'Failed to retrieve feature request'
    }, { status: 500 });
  }
}