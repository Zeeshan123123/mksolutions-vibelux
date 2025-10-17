import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { sendTeamInviteEmail } from '@/lib/email/team-invite';
import { withErrorHandler, AuthenticationError, ValidationError, ConflictError, AuthorizationError } from '@/lib/error-handler';
import { validateTeamInvite, validateBusinessEmail, sanitizeInput } from '@/lib/validation/team-schemas';

export const POST = withErrorHandler(async (request: Request) => {
  const { userId } = auth();
  
  if (!userId) {
    throw new AuthenticationError();
  }

  const body = await request.json();
  const { email, role, message } = validateTeamInvite(body);

  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedMessage = message ? sanitizeInput(message) : undefined;

  // Additional email validation
  if (!validateBusinessEmail(sanitizedEmail)) {
    throw new ValidationError({ email: 'Invalid email format' });
  }

  // Check if user exists
  const inviter = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!inviter) {
    throw new AuthenticationError('User not found');
  }

  // Get user's facility ID (assuming they have one)
  const userFacility = await prisma.facilityUser.findFirst({
    where: { userId },
    include: { facility: true }
  });

  if (!userFacility) {
    throw new AuthorizationError('User does not belong to a facility');
  }

  // Check if user has permission to invite
  if (!['OWNER', 'ADMIN'].includes(userFacility.role)) {
    throw new AuthorizationError('Insufficient permissions to invite members');
  }

  // Check team size limits based on subscription
  const teamSize = await prisma.facilityUser.count({
    where: { 
      facilityId: userFacility.facilityId
    }
  });

  const tierLimits: Record<string, number> = {
    'free': 1,
    'startup': 3,
    'greenhouse-basic': 5,
    'commercial-basic': 10,
    'professional': 3,
    'commercial-standard': 15,
    'greenhouse-pro': 20,
    'cultivation-expert': 25,
    'enterprise': 10,
    'commercial-enterprise': 50,
    'greenhouse-enterprise': 100,
    'cultivation-ai': 100,
    'research-academic': 15,
    'consultant-pro': 25,
    'manufacturer-partner': 100
  };

  const limit = tierLimits[inviter.subscriptionTier || 'free'] || 1;
  
  if (teamSize >= limit) {
    throw new AuthorizationError(
      `Team member limit reached (${limit}). Please upgrade your plan to add more members.`
    );
  }

  // Check if user is already invited or is a member
  const existingInvite = await prisma.facilityInvite.findFirst({
    where: { 
      email: sanitizedEmail,
      facilityId: userFacility.facilityId,
      status: 'PENDING'
    }
  });

  if (existingInvite) {
    throw new ConflictError('User already has a pending invitation');
  }

  // Check if user is already a member
  const existingMember = await prisma.facilityUser.findFirst({
    where: {
      facilityId: userFacility.facilityId,
      user: { email: sanitizedEmail }
    }
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this facility');
  }

  // Create invitation
  const invitation = await prisma.facilityInvite.create({
    data: {
      email: sanitizedEmail,
      role: role.toUpperCase() as any,
      facilityId: userFacility.facilityId,
      invitedBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      token: crypto.randomUUID()
    }
  });

  // Send invitation email
  try {
    await sendTeamInviteEmail({
      to: sanitizedEmail,
      inviterName: inviter.name || inviter.email,
      role,
      inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invitation.token}`,
      message: sanitizedMessage
    });
  } catch (emailError) {
    logger.error('api', 'Failed to send invitation email:', emailError);
    // Don't fail the request if email fails
  }

  return NextResponse.json({ 
    message: 'Invitation sent successfully',
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt
    }
  });
});