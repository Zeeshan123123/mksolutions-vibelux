/**
 * Welcome Email Template
 * Sent when a new user signs up
 */

import * as React from 'react';
import {
  BaseEmailTemplate,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailCard,
  EmailDivider,
} from '../base-template';
import { Link, Text } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  planName: string;
  dashboardUrl: string;
  supportUrl: string;
  year?: number;
}

export function WelcomeEmail({
  userName,
  userEmail,
  planName,
  dashboardUrl,
  supportUrl,
  year = new Date().getFullYear(),
}: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate preview={`Welcome to VibeLux, ${userName}!`}>
      <EmailHeading>Welcome to VibeLux! 🌱</EmailHeading>
      
      <EmailText>Hi {userName},</EmailText>
      
      <EmailText>
        Thank you for joining VibeLux! We're thrilled to have you as part of our growing community
        of cultivation professionals. Your journey to optimized growing operations starts now.
      </EmailText>
      
      <EmailButton href={dashboardUrl}>
        Go to Your Dashboard
      </EmailButton>
      
      <EmailDivider />
      
      <EmailCard title="Your Account Details">
        <EmailText>
          <strong>Email:</strong> {userEmail}
        </EmailText>
        <EmailText>
          <strong>Plan:</strong> {planName}
        </EmailText>
      </EmailCard>
      
      <EmailCard title="🚀 Get Started in 3 Steps">
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ color: '#8B5CF6', fontWeight: '600', marginBottom: '4px' }}>
            1. Complete Your Profile
          </Text>
          <Text style={{ color: '#A3A3A3', fontSize: '14px' }}>
            Add your facility details and growing preferences
          </Text>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ color: '#8B5CF6', fontWeight: '600', marginBottom: '4px' }}>
            2. Design Your First Room
          </Text>
          <Text style={{ color: '#A3A3A3', fontSize: '14px' }}>
            Use our AI-powered lighting designer to optimize your setup
          </Text>
        </div>
        
        <div>
          <Text style={{ color: '#8B5CF6', fontWeight: '600', marginBottom: '4px' }}>
            3. Connect Your Sensors
          </Text>
          <Text style={{ color: '#A3A3A3', fontSize: '14px' }}>
            Start monitoring environmental conditions in real-time
          </Text>
        </div>
      </EmailCard>
      
      <EmailCard title="📚 Resources to Help You Succeed">
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ color: '#E5E5E5', marginBottom: '8px' }}>
            <Link href={`${dashboardUrl}/tutorials`} style={{ color: '#8B5CF6' }}>
              Video Tutorials
            </Link>
            {' - '} Learn the platform in under 10 minutes
          </li>
          <li style={{ color: '#E5E5E5', marginBottom: '8px' }}>
            <Link href={`${dashboardUrl}/docs`} style={{ color: '#8B5CF6' }}>
              Documentation
            </Link>
            {' - '} Detailed guides and best practices
          </li>
          <li style={{ color: '#E5E5E5', marginBottom: '8px' }}>
            <Link href={`${dashboardUrl}/community`} style={{ color: '#8B5CF6' }}>
              Community Forum
            </Link>
            {' - '} Connect with other growers
          </li>
          <li style={{ color: '#E5E5E5' }}>
            <Link href={supportUrl} style={{ color: '#8B5CF6' }}>
              Support Center
            </Link>
            {' - '} We're here to help 24/7
          </li>
        </ul>
      </EmailCard>
      
      {planName === 'Free' && (
        <EmailCard title="🎁 Special Offer">
          <EmailText>
            Upgrade to our Starter plan within the next 7 days and get{' '}
            <strong style={{ color: '#10B981' }}>20% off</strong> your first 3 months!
          </EmailText>
          <EmailButton href={`${dashboardUrl}/pricing`} secondary>
            View Pricing Plans
          </EmailButton>
        </EmailCard>
      )}
      
      <EmailDivider />
      
      <EmailText muted>
        Have questions? Just reply to this email or visit our{' '}
        <Link href={supportUrl} style={{ color: '#8B5CF6' }}>
          Support Center
        </Link>
        . We're always here to help!
      </EmailText>
      
      <EmailText muted>
        Happy Growing! 🌿
        <br />
        The VibeLux Team
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default WelcomeEmail;