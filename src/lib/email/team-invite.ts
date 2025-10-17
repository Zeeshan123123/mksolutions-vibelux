import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface TeamInviteEmailData {
  to: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
  message?: string;
}

export async function sendTeamInviteEmail(data: TeamInviteEmailData) {
  const { to, inviterName, role, inviteUrl, message } = data;
  
  const subject = `You've been invited to join ${inviterName}'s team on VibeLux`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Team Invitation - VibeLux</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #7C3AED; }
        .role-badge { background: #e7f3ff; color: #0066cc; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .message-box { background: #fff; border-left: 4px solid #8B5CF6; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 VibeLux Team Invitation</h1>
          <p>You've been invited to join a cultivation team!</p>
        </div>
        
        <div class="content">
          <h2>Hello there! 👋</h2>
          
          <p><strong>${inviterName}</strong> has invited you to join their team on VibeLux as a <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span>.</p>
          
          ${message ? `
            <div class="message-box">
              <h3>Personal Message:</h3>
              <p><em>"${message}"</em></p>
            </div>
          ` : ''}
          
          <p>VibeLux is a comprehensive cultivation management platform that helps teams:</p>
          <ul>
            <li>🏭 Monitor and control growing environments</li>
            <li>📊 Track cultivation metrics and analytics</li>
            <li>🌿 Optimize plant health and yields</li>
            <li>👥 Collaborate with team members</li>
            <li>📈 Generate detailed reports and insights</li>
          </ul>
          
          <p>As a <strong>${role}</strong>, you'll have access to:</p>
          ${getRolePermissions(role)}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p><strong>Note:</strong> This invitation will expire in 7 days. If you don't have a VibeLux account yet, you'll be able to create one when you accept the invitation.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p><small>If you're having trouble with the button above, copy and paste this URL into your browser:</small></p>
          <p><small><a href="${inviteUrl}">${inviteUrl}</a></small></p>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${inviterName} through VibeLux</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    VibeLux Team Invitation
    
    Hello!
    
    ${inviterName} has invited you to join their team on VibeLux as a ${role}.
    
    ${message ? `Personal Message: "${message}"` : ''}
    
    VibeLux is a comprehensive cultivation management platform that helps teams monitor and control growing environments, track cultivation metrics, optimize plant health, and collaborate effectively.
    
    Accept your invitation by visiting: ${inviteUrl}
    
    This invitation will expire in 7 days.
    
    If you're having trouble with the link, copy and paste this URL into your browser:
    ${inviteUrl}
    
    This invitation was sent by ${inviterName} through VibeLux.
    If you didn't expect this invitation, you can safely ignore this email.
  `;

  try {
    if (!resend) {
      logger.warn('api', 'Resend API key not configured, skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: 'VibeLux Team <team@vibelux.com>',
      to: [to],
      subject,
      html,
      text,
    });

    return result;
  } catch (error) {
    logger.error('api', 'Failed to send team invite email:', error );
    throw error;
  }
}

function getRolePermissions(role: string): string {
  const permissions = {
    admin: `
      <ul>
        <li>✅ Manage team members and permissions</li>
        <li>✅ Full access to all cultivation projects</li>
        <li>✅ View and export analytics</li>
        <li>✅ System configuration and settings</li>
      </ul>
    `,
    manager: `
      <ul>
        <li>✅ Manage cultivation projects</li>
        <li>✅ View team analytics and reports</li>
        <li>✅ Monitor system performance</li>
        <li>❌ Limited user management</li>
      </ul>
    `,
    operator: `
      <ul>
        <li>✅ Monitor and control cultivation systems</li>
        <li>✅ View reports and dashboards</li>
        <li>✅ Manage daily operations</li>
        <li>❌ Limited project management</li>
      </ul>
    `,
    viewer: `
      <ul>
        <li>✅ View dashboards and reports</li>
        <li>✅ Monitor system status</li>
        <li>❌ Read-only access</li>
        <li>❌ No administrative functions</li>
      </ul>
    `
  };

  return permissions[role as keyof typeof permissions] || permissions.viewer;
}