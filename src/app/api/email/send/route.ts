/**
 * Email Sending API
 * Handles all email sending requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendGridService } from '@/lib/email/sendgrid-service';
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';
import { z } from 'zod';

// Email request schema
const emailSchema = z.object({
  type: z.enum([
    'welcome',
    'verification',
    'password-reset',
    'subscription',
    'alert',
    'report',
    'invoice',
    'newsletter',
    'custom'
  ]),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  data: z.record(z.any()),
  options: z.object({
    sendAt: z.number().optional(),
    categories: z.array(z.string()).optional(),
    attachments: z.array(z.object({
      content: z.string(),
      filename: z.string(),
      type: z.string().optional(),
    })).optional(),
  }).optional(),
});

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

    // Validate request
    const validatedData = emailSchema.parse(body);

    let result;

    switch (validatedData.type) {
      case 'welcome':
        result = await sendGridService.sendWelcomeEmail({
          email: Array.isArray(validatedData.to) ? validatedData.to[0] : validatedData.to,
          name: validatedData.data.name,
          plan: validatedData.data.plan,
        });
        break;

      case 'verification':
        result = await sendGridService.sendVerificationEmail(
          {
            email: Array.isArray(validatedData.to) ? validatedData.to[0] : validatedData.to,
            name: validatedData.data.name,
          },
          validatedData.data.verificationUrl
        );
        break;

      case 'password-reset':
        result = await sendGridService.sendPasswordResetEmail(
          {
            email: Array.isArray(validatedData.to) ? validatedData.to[0] : validatedData.to,
            name: validatedData.data.name,
          },
          validatedData.data.resetUrl
        );
        break;

      case 'subscription':
        result = await sendGridService.sendSubscriptionEmail(
          validatedData.data.subType,
          {
            email: Array.isArray(validatedData.to) ? validatedData.to[0] : validatedData.to,
            ...validatedData.data,
          }
        );
        break;

      case 'alert':
        result = await sendGridService.sendAlert({
          type: validatedData.data.alertType,
          severity: validatedData.data.severity,
          recipients: Array.isArray(validatedData.to) ? validatedData.to : [validatedData.to],
          title: validatedData.data.title,
          message: validatedData.data.message,
          data: validatedData.data.alertData,
          actionUrl: validatedData.data.actionUrl,
        });
        break;

      case 'report':
        result = await sendGridService.sendReport({
          type: validatedData.data.reportType,
          recipients: Array.isArray(validatedData.to) ? validatedData.to : [validatedData.to],
          facilityName: validatedData.data.facilityName,
          metrics: validatedData.data.metrics,
          insights: validatedData.data.insights,
          recommendations: validatedData.data.recommendations,
          attachments: validatedData.options?.attachments,
        });
        break;

      case 'invoice':
        result = await sendGridService.sendInvoice({
          recipient: Array.isArray(validatedData.to) ? validatedData.to[0] : validatedData.to,
          ...validatedData.data,
        });
        break;

      case 'newsletter':
        result = await sendGridService.sendNewsletter({
          recipients: Array.isArray(validatedData.to) ? validatedData.to : [validatedData.to],
          subject: validatedData.data.subject,
          content: validatedData.data.content,
        });
        break;

      case 'custom':
        result = await sendGridService.send({
          to: validatedData.to,
          subject: validatedData.data.subject,
          html: validatedData.data.html,
          text: validatedData.data.text,
          templateId: validatedData.data.templateId,
          dynamicTemplateData: validatedData.data.templateData,
          categories: validatedData.options?.categories,
          sendAt: validatedData.options?.sendAt,
          attachments: validatedData.options?.attachments,
        });
        break;

      default:
        throw new Error(`Unknown email type: ${validatedData.type}`);
    }

    if (result.success) {
      logger.info('email', `Email sent successfully`, {
        type: validatedData.type,
        to: validatedData.to,
        messageId: result.messageId,
      });

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      throw new Error(result.error || 'Failed to send email');
    }

  } catch (error) {
    logger.error('email', 'Email send error', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Batch send endpoint
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate batch emails
    const emails = z.array(emailSchema).parse(body.emails);

    // Process batch
    const results = await sendGridService.sendBatch(
      emails.map(email => ({
        to: email.to,
        subject: email.data.subject,
        templateId: email.data.templateId,
        dynamicTemplateData: email.data,
        html: email.data.html,
        text: email.data.text,
        categories: email.options?.categories,
      }))
    );

    logger.info('email', `Batch email sent`, {
      sent: results.sent,
      failed: results.failed,
    });

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      results: results.results,
    });

  } catch (error) {
    logger.error('email', 'Batch email error', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send batch emails' },
      { status: 500 }
    );
  }
}