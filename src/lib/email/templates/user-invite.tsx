import React from 'react';

interface UserInviteEmailProps {
  recipientEmail: string;
  inviterName: string;
  inviterCompany?: string;
  role: string;
  message?: string;
  inviteUrl: string;
  expiresIn?: string;
}

export const UserInviteEmail: React.FC<UserInviteEmailProps> = ({
  recipientEmail,
  inviterName,
  inviterCompany,
  role,
  message,
  inviteUrl,
  expiresIn = '7 days'
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#8b5cf6', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Welcome to VibeLux</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
          You're invited to join VibeLux!
        </h2>
        
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>
          {inviterName}{inviterCompany ? ` from ${inviterCompany}` : ''} has invited you to join 
          their team on VibeLux, the complete controlled environment agriculture platform.
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          margin: '20px 0'
        }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '15px' }}>Your Invitation Details</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Invited by:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontWeight: 'bold' }}>
                {inviterName}{inviterCompany ? ` (${inviterCompany})` : ''}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Your role:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontWeight: 'bold' }}>{role}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Email:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{recipientEmail}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Expires in:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{expiresIn}</td>
            </tr>
          </table>
        </div>
        
        {message && (
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '15px', 
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <p style={{ color: '#4b5563', margin: 0, fontStyle: 'italic' }}>
              "{message}"
            </p>
            <p style={{ color: '#6b7280', marginTop: '10px', marginBottom: 0 }}>
              - {inviterName}
            </p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={inviteUrl}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '14px 40px',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'inline-block',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Accept Invitation
          </a>
        </div>
        
        <div style={{ margin: '30px 0' }}>
          <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>
            What you'll get with VibeLux:
          </h4>
          <ul style={{ color: '#4b5563', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>AI-powered grow room design and optimization</li>
            <li>Energy management and cost reduction tools</li>
            <li>Real-time monitoring and automation</li>
            <li>Marketplace for equipment and services</li>
            <li>Compliance tracking and reporting</li>
            <li>Collaboration tools for teams</li>
          </ul>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          This invitation will expire in {expiresIn}. If you have any questions, 
          please contact {inviterName} directly.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '20px', 
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          © {new Date().getFullYear()} VibeLux. All rights reserved.
        </p>
        <p style={{ margin: 0 }}>
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
};