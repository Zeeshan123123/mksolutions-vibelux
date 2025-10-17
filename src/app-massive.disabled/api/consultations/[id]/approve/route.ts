import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ConsultationEmailService } from '@/lib/email/consultation-notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const consultationId = params.id;

    // Verify user is the expert for this consultation
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        expertId: userId
      },
      include: {
        expert: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found or access denied' },
        { status: 404 }
      );
    }

    // Check if consultation is in a state that can be approved
    if (consultation.status !== 'REQUESTED') {
      return NextResponse.json(
        { success: false, error: 'Consultation cannot be approved in current status' },
        { status: 400 }
      );
    }

    // Update consultation status to approved
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'APPROVED'
      }
    });

    // Send approval notification to client
    try {
      await ConsultationEmailService.sendConsultationApproved({
        id: consultation.id,
        scheduledStart: consultation.scheduledStart,
        duration: consultation.duration,
        objectives: consultation.objectives,
        totalAmount: consultation.totalAmount,
        expert: {
          displayName: consultation.expert.displayName,
          email: consultation.expert.user.email
        },
        client: {
          name: consultation.client.name || 'Client',
          email: consultation.client.email || ''
        }
      });
    } catch (emailError) {
      logger.error('api', 'Failed to send consultation approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      consultation: {
        id: updatedConsultation.id,
        status: updatedConsultation.status
      }
    });

  } catch (error) {
    logger.error('api', 'Error approving consultation:', error );
    return NextResponse.json(
      { success: false, error: 'Failed to approve consultation' },
      { status: 500 }
    );
  }
}