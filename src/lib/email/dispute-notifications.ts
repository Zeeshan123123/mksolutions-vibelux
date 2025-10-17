/**
 * Dispute Notification Email Templates
 * For VibeLux dispute resolution system
 */

export interface DisputeNotificationData {
  disputeId: string;
  type: 'new' | 'update' | 'resolved' | 'escalated';
  recipientName: string;
  recipientEmail: string;
  disputeDetails: {
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
  };
  actionRequired?: boolean;
  actionUrl?: string;
}

export const disputeEmailTemplates = {
  new: {
    subject: 'New Dispute Filed - Action Required',
    template: `
      <h2>New Dispute Notification</h2>
      <p>Dear {{recipientName}},</p>
      <p>A new dispute has been filed that requires your attention.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Dispute Details</h3>
        <p><strong>ID:</strong> {{disputeId}}</p>
        <p><strong>Title:</strong> {{disputeDetails.title}}</p>
        <p><strong>Description:</strong> {{disputeDetails.description}}</p>
        <p><strong>Priority:</strong> {{disputeDetails.priority}}</p>
        <p><strong>Filed:</strong> {{disputeDetails.createdAt}}</p>
      </div>
      
      {{#if actionRequired}}
      <p><a href="{{actionUrl}}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dispute</a></p>
      {{/if}}
      
      <p>Please review and respond within 48 hours.</p>
      <p>Best regards,<br>VibeLux Dispute Resolution Team</p>
    `
  },
  
  update: {
    subject: 'Dispute Update - {{disputeId}}',
    template: `
      <h2>Dispute Status Update</h2>
      <p>Dear {{recipientName}},</p>
      <p>There has been an update to dispute {{disputeId}}.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Current Status</h3>
        <p><strong>Status:</strong> {{disputeDetails.status}}</p>
        <p><strong>Last Updated:</strong> {{disputeDetails.updatedAt}}</p>
      </div>
      
      <p><a href="{{actionUrl}}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Updates</a></p>
      
      <p>Best regards,<br>VibeLux Dispute Resolution Team</p>
    `
  },
  
  resolved: {
    subject: 'Dispute Resolved - {{disputeId}}',
    template: `
      <h2>Dispute Resolution Confirmation</h2>
      <p>Dear {{recipientName}},</p>
      <p>We're pleased to inform you that dispute {{disputeId}} has been resolved.</p>
      
      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Resolution Summary</h3>
        <p><strong>Title:</strong> {{disputeDetails.title}}</p>
        <p><strong>Status:</strong> Resolved</p>
        <p><strong>Resolution Date:</strong> {{disputeDetails.updatedAt}}</p>
      </div>
      
      <p>If you have any questions about the resolution, please don't hesitate to contact us.</p>
      
      <p>Thank you for your patience throughout this process.</p>
      
      <p>Best regards,<br>VibeLux Dispute Resolution Team</p>
    `
  },
  
  escalated: {
    subject: 'Dispute Escalated - Immediate Attention Required',
    template: `
      <h2>Dispute Escalation Notice</h2>
      <p>Dear {{recipientName}},</p>
      <p><strong>IMPORTANT:</strong> Dispute {{disputeId}} has been escalated and requires immediate attention.</p>
      
      <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
        <h3>Escalation Details</h3>
        <p><strong>Title:</strong> {{disputeDetails.title}}</p>
        <p><strong>Priority:</strong> HIGH</p>
        <p><strong>Escalated:</strong> {{disputeDetails.updatedAt}}</p>
      </div>
      
      <p>This dispute has been escalated to senior management due to:</p>
      <ul>
        <li>Extended resolution time</li>
        <li>High priority status</li>
        <li>Customer impact assessment</li>
      </ul>
      
      <p><a href="{{actionUrl}}" style="background: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Immediately</a></p>
      
      <p>Please respond within 24 hours.</p>
      
      <p>Best regards,<br>VibeLux Dispute Resolution Team</p>
    `
  }
};

export async function sendDisputeNotification(data: DisputeNotificationData): Promise<void> {
  const template = disputeEmailTemplates[data.type];
  
  if (!template) {
    throw new Error(`Unknown dispute notification type: ${data.type}`);
  }

  // This would integrate with your email service (SendGrid, etc.)
  // For now, we'll just log it
  console.log('Sending dispute notification:', {
    to: data.recipientEmail,
    subject: template.subject.replace('{{disputeId}}', data.disputeId),
    data
  });
}

export function formatDisputeEmail(
  templateType: keyof typeof disputeEmailTemplates,
  data: DisputeNotificationData
): { subject: string; html: string } {
  const template = disputeEmailTemplates[templateType];
  
  // Simple template replacement (in production, use a proper template engine)
  let html = template.template;
  let subject = template.subject;
  
  // Replace variables
  const replacements: Record<string, any> = {
    recipientName: data.recipientName,
    disputeId: data.disputeId,
    'disputeDetails.title': data.disputeDetails.title,
    'disputeDetails.description': data.disputeDetails.description,
    'disputeDetails.status': data.disputeDetails.status,
    'disputeDetails.priority': data.disputeDetails.priority,
    'disputeDetails.createdAt': data.disputeDetails.createdAt.toLocaleString(),
    'disputeDetails.updatedAt': data.disputeDetails.updatedAt.toLocaleString(),
    actionRequired: data.actionRequired,
    actionUrl: data.actionUrl
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, String(value));
    subject = subject.replace(regex, String(value));
  });
  
  // Handle conditionals (simple implementation)
  html = html.replace(/{{#if actionRequired}}([\s\S]*?){{\/if}}/g, (match, content) => {
    return data.actionRequired ? content : '';
  });
  
  return { subject, html };
}