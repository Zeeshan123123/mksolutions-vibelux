/**
 * Password Reset Email Template
 * Sent when user requests password reset
 */

import * as React from 'react';
import {
  BaseEmailTemplate,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailAlert,
  EmailDivider,
  EmailCard,
} from '../base-template';
import { Link } from '@react-email/components';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn: string;
  ipAddress?: string;
  supportUrl: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
  expiresIn,
  ipAddress,
  supportUrl,
}: PasswordResetEmailProps) {
  return (
    <BaseEmailTemplate preview="Reset your VibeLux password">
      <EmailHeading>Password Reset Request</EmailHeading>
      
      <EmailText>Hi {userName},</EmailText>
      
      <EmailText>
        We received a request to reset your password for your VibeLux account.
        Click the button below to create a new password:
      </EmailText>
      
      <EmailButton href={resetUrl}>
        Reset Password
      </EmailButton>
      
      <EmailAlert type="warning">
        This link will expire in {expiresIn}. If you didn't request this password reset,
        you can safely ignore this email.
      </EmailAlert>
      
      <EmailDivider />
      
      <EmailCard title="Security Information">
        <EmailText muted>
          <strong>Request Time:</strong> {new Date().toLocaleString()}
        </EmailText>
        {ipAddress && (
          <EmailText muted>
            <strong>IP Address:</strong> {ipAddress}
          </EmailText>
        )}
        <EmailText muted>
          <strong>Browser:</strong> Chrome on Windows (example)
        </EmailText>
      </EmailCard>
      
      <EmailText muted>
        If you didn't request this password reset, please{' '}
        <Link href={supportUrl} style={{ color: '#8B5CF6' }}>
          contact support
        </Link>{' '}
        immediately.
      </EmailText>
      
      <EmailDivider />
      
      <EmailText muted>
        For security reasons, this link can only be used once. If you need to reset
        your password again, please request a new reset link.
      </EmailText>
      
      <EmailText muted>
        Stay secure,
        <br />
        The VibeLux Security Team
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default PasswordResetEmail;