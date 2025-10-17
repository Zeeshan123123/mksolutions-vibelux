import { Job } from 'bull';
import { queues, EmailJobData } from '../queue-manager';
import { logger } from '../../logging/production-logger';
import { sendEquipmentOfferEmail, sendServiceBidEmail, sendUserInviteEmail } from '../../email/send-notification-email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email worker processor
queues.emailQueue.process('send-email', async (job: Job<EmailJobData>) => {
  const { to, subject, template, data, from } = job.data;
  
  try {
    logger.info('api', `Processing email job ${job.id}`, {
      to,
      template,
      subject
    });
    
    // Update job progress
    await job.progress(10);
    
    let result;
    
    // Handle different email templates
    switch (template) {
      case 'equipment-offer':
        result = await sendEquipmentOfferEmail({
          recipientEmail: to,
          recipientName: data.recipientName,
          offerTitle: data.offerTitle,
          equipment: data.equipment,
          sellerName: data.sellerName,
          sellerCompany: data.sellerCompany,
          message: data.message,
          offerUrl: data.offerUrl
        });
        break;
        
      case 'service-bid':
        result = await sendServiceBidEmail({
          recipientEmail: to,
          recipientName: data.recipientName,
          serviceName: data.serviceName,
          bidAmount: data.bidAmount,
          bidderName: data.bidderName,
          bidderCompany: data.bidderCompany,
          proposedTimeline: data.proposedTimeline,
          message: data.message,
          bidUrl: data.bidUrl,
          totalBids: data.totalBids
        });
        break;
        
      case 'user-invite':
        result = await sendUserInviteEmail({
          recipientEmail: to,
          inviterName: data.inviterName,
          inviterCompany: data.inviterCompany,
          role: data.role,
          message: data.message,
          inviteUrl: data.inviteUrl,
          expiresIn: data.expiresIn
        });
        break;
        
      case 'generic':
        // Generic email sending
        const { data: sendData, error } = await resend.emails.send({
          from: from || 'VibeLux <noreply@vibelux.ai>',
          to,
          subject,
          html: data.html,
          text: data.text
        });
        
        if (error) {
          throw error;
        }
        
        result = { success: true, emailId: sendData?.id };
        break;
        
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
    
    await job.progress(100);
    
    return {
      success: true,
      emailId: result.emailId,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('api', `Email job ${job.id} failed`, error as Error);
    throw error;
  }
});

// Process notification digest emails
queues.emailQueue.process('send-digest', async (job: Job) => {
  const { userId, notifications, period } = job.data;
  
  try {
    logger.info('api', `Processing digest email for user ${userId}`);
    
    // Group notifications by type
    const grouped = notifications.reduce((acc: any, notif: any) => {
      const type = notif.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(notif);
      return acc;
    }, {});
    
    // Generate digest HTML
    const html = generateDigestHtml(grouped, period);
    
    // Send digest email
    const { data, error } = await resend.emails.send({
      from: 'VibeLux Updates <updates@vibelux.ai>',
      to: job.data.email,
      subject: `Your ${period} VibeLux Activity Summary`,
      html
    });
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      emailId: data?.id,
      notificationCount: notifications.length
    };
    
  } catch (error) {
    logger.error('api', `Digest email job ${job.id} failed`, error as Error);
    throw error;
  }
});

// Helper function to generate digest HTML
function generateDigestHtml(groupedNotifications: any, period: string): string {
  const sections = Object.entries(groupedNotifications).map(([type, notifications]: [string, any]) => {
    const items = notifications.map((n: any) => `
      <li style="margin-bottom: 10px;">
        <strong>${n.title}</strong><br>
        <span style="color: #6b7280;">${n.message}</span><br>
        <small style="color: #9ca3af;">${new Date(n.createdAt).toLocaleDateString()}</small>
      </li>
    `).join('');
    
    return `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; margin-bottom: 15px;">${formatNotificationType(type)}</h3>
        <ul style="list-style: none; padding: 0;">
          ${items}
        </ul>
      </div>
    `;
  }).join('');
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #8b5cf6; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Your ${period} Activity Summary</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        ${sections}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://vibelux.ai/notifications" style="background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View All Notifications
          </a>
        </div>
      </div>
      
      <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">
          <a href="https://vibelux.ai/settings/notifications" style="color: #8b5cf6;">Update notification preferences</a>
        </p>
      </div>
    </div>
  `;
}

function formatNotificationType(type: string): string {
  const typeMap: any = {
    'equipment-offer': 'Equipment Offers',
    'service-bid': 'Service Bids',
    'user-invite': 'Team Invitations',
    'marketplace-update': 'Marketplace Updates',
    'system': 'System Notifications'
  };
  
  return typeMap[type] || type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default queues.emailQueue;