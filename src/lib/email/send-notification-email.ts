import { Resend } from 'resend';
import { EquipmentOfferEmail } from './templates/equipment-offer';
import { ServiceBidEmail } from './templates/service-bid';
import { UserInviteEmail } from './templates/user-invite';
import { logger } from '@/lib/logging/production-logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEquipmentOfferEmail({
  recipientEmail,
  recipientName,
  offerTitle,
  equipment,
  sellerName,
  sellerCompany,
  message,
  offerUrl
}: {
  recipientEmail: string;
  recipientName: string;
  offerTitle: string;
  equipment: {
    name: string;
    category: string;
    brand: string;
    condition: string;
    price: number;
    location: string;
  };
  sellerName: string;
  sellerCompany?: string;
  message?: string;
  offerUrl: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VibeLux Marketplace <marketplace@vibelux.ai>',
      to: recipientEmail,
      subject: `New Equipment Offer: ${equipment.name}`,
      react: EquipmentOfferEmail({
        recipientName,
        offerTitle,
        equipment,
        sellerName,
        sellerCompany,
        message,
        offerUrl
      })
    });

    if (error) {
      throw error;
    }

    logger.info('api', 'Equipment offer email sent', {
      recipientEmail,
      equipmentName: equipment.name,
      emailId: data?.id
    });

    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('api', 'Failed to send equipment offer email', error as Error);
    return { success: false, error };
  }
}

export async function sendServiceBidEmail({
  recipientEmail,
  recipientName,
  serviceName,
  bidAmount,
  bidderName,
  bidderCompany,
  proposedTimeline,
  message,
  bidUrl,
  totalBids
}: {
  recipientEmail: string;
  recipientName: string;
  serviceName: string;
  bidAmount: number;
  bidderName: string;
  bidderCompany?: string;
  proposedTimeline?: string;
  message?: string;
  bidUrl: string;
  totalBids: number;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VibeLux Marketplace <marketplace@vibelux.ai>',
      to: recipientEmail,
      subject: `New Bid for ${serviceName}: $${bidAmount.toLocaleString()}`,
      react: ServiceBidEmail({
        recipientName,
        serviceName,
        bidAmount,
        bidderName,
        bidderCompany,
        proposedTimeline,
        message,
        bidUrl,
        totalBids
      })
    });

    if (error) {
      throw error;
    }

    logger.info('api', 'Service bid email sent', {
      recipientEmail,
      serviceName,
      bidAmount,
      emailId: data?.id
    });

    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('api', 'Failed to send service bid email', error as Error);
    return { success: false, error };
  }
}

export async function sendUserInviteEmail({
  recipientEmail,
  inviterName,
  inviterCompany,
  role,
  message,
  inviteUrl,
  expiresIn
}: {
  recipientEmail: string;
  inviterName: string;
  inviterCompany?: string;
  role: string;
  message?: string;
  inviteUrl: string;
  expiresIn?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VibeLux <invites@vibelux.ai>',
      to: recipientEmail,
      subject: `${inviterName} invited you to join VibeLux`,
      react: UserInviteEmail({
        recipientEmail,
        inviterName,
        inviterCompany,
        role,
        message,
        inviteUrl,
        expiresIn
      })
    });

    if (error) {
      throw error;
    }

    logger.info('api', 'User invite email sent', {
      recipientEmail,
      inviterName,
      role,
      emailId: data?.id
    });

    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('api', 'Failed to send user invite email', error as Error);
    return { success: false, error };
  }
}