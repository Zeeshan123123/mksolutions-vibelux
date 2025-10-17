/**
 * Subscription Confirmation Email Template
 * Sent when user subscribes or changes their plan
 */

import * as React from 'react';
import {
  BaseEmailTemplate,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailCard,
  EmailDivider,
  colors,
} from '../base-template';
import { Text, Link } from '@react-email/components';

interface SubscriptionConfirmationProps {
  userName: string;
  planName: string;
  previousPlan?: string;
  price: number;
  interval: 'month' | 'year';
  nextBillingDate: string;
  features: string[];
  isUpgrade?: boolean;
  isDowngrade?: boolean;
  isTrial?: boolean;
  trialEndsDate?: string;
  dashboardUrl: string;
  billingUrl: string;
}

export function SubscriptionConfirmationEmail({
  userName,
  planName,
  previousPlan,
  price,
  interval,
  nextBillingDate,
  features,
  isUpgrade,
  isDowngrade,
  isTrial,
  trialEndsDate,
  dashboardUrl,
  billingUrl,
}: SubscriptionConfirmationProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getActionMessage = () => {
    if (isUpgrade) return 'upgraded your subscription';
    if (isDowngrade) return 'adjusted your subscription';
    if (isTrial) return 'started your free trial';
    return 'subscribed';
  };

  const getEmoji = () => {
    if (isUpgrade) return '🚀';
    if (isDowngrade) return '💡';
    if (isTrial) return '🎉';
    return '✨';
  };

  return (
    <BaseEmailTemplate preview={`Subscription Confirmed - ${planName} Plan`}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <span style={{ fontSize: '48px' }}>{getEmoji()}</span>
      </div>
      
      <EmailHeading>Subscription Confirmed!</EmailHeading>
      
      <EmailText>Hi {userName},</EmailText>
      
      <EmailText>
        Great news! You've successfully {getActionMessage()} to the{' '}
        <strong style={{ color: colors.primary }}>{planName}</strong> plan.
        {previousPlan && previousPlan !== planName && (
          <> (previously on {previousPlan})</>
        )}
      </EmailText>
      
      {isTrial && trialEndsDate && (
        <div style={{
          backgroundColor: `${colors.success}20`,
          border: `1px solid ${colors.success}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <Text style={{ color: colors.success, fontWeight: '600', margin: '0 0 4px' }}>
            🎁 Free Trial Active
          </Text>
          <Text style={{ color: colors.text, margin: 0 }}>
            Enjoy full access until {trialEndsDate}. No charges until your trial ends.
          </Text>
        </div>
      )}
      
      {/* Subscription Details */}
      <EmailCard title="Subscription Details">
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 4px' }}>
            Plan
          </Text>
          <Text style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
            {planName}
          </Text>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          <div>
            <Text style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 4px' }}>
              Billing Amount
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, margin: 0 }}>
              {formatPrice(price)}
              <span style={{ fontSize: '14px', color: colors.textMuted, fontWeight: '400' }}>
                /{interval}
              </span>
            </Text>
          </div>
          
          <div>
            <Text style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 4px' }}>
              Next Billing Date
            </Text>
            <Text style={{ fontSize: '16px', color: colors.text, margin: 0 }}>
              {isTrial ? trialEndsDate : nextBillingDate}
            </Text>
          </div>
        </div>
      </EmailCard>
      
      {/* Features Included */}
      <EmailCard title="✅ What's Included">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {features.slice(0, 8).map((feature, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
              <span style={{ color: colors.success, fontSize: '16px', lineHeight: '20px' }}>✓</span>
              <Text style={{ fontSize: '14px', color: colors.text, margin: 0, lineHeight: '20px' }}>
                {feature}
              </Text>
            </div>
          ))}
        </div>
        {features.length > 8 && (
          <Text style={{ 
            fontSize: '14px',
            color: colors.primary,
            margin: '16px 0 0',
            textAlign: 'center',
          }}>
            + {features.length - 8} more features
          </Text>
        )}
      </EmailCard>
      
      {/* What's New (for upgrades) */}
      {isUpgrade && (
        <EmailCard title="🆕 New Features Unlocked">
          <EmailText>
            Your upgrade gives you access to powerful new capabilities:
          </EmailText>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li style={{ color: colors.text, marginBottom: '8px' }}>
              <strong>Advanced AI Tools</strong> - Next-gen cultivation intelligence
            </li>
            <li style={{ color: colors.text, marginBottom: '8px' }}>
              <strong>Priority Support</strong> - Get help when you need it most
            </li>
            <li style={{ color: colors.text, marginBottom: '8px' }}>
              <strong>Unlimited Projects</strong> - Scale without limits
            </li>
            <li style={{ color: colors.text }}>
              <strong>Advanced Analytics</strong> - Deep insights into your operations
            </li>
          </ul>
        </EmailCard>
      )}
      
      {/* Next Steps */}
      <EmailCard title="🎯 Next Steps">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: `${colors.primary}20`,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px',
            }}>
              1
            </div>
            <Text style={{ fontSize: '14px', color: colors.text, margin: 0 }}>
              Explore your new features in the dashboard
            </Text>
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: `${colors.primary}20`,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px',
            }}>
              2
            </div>
            <Text style={{ fontSize: '14px', color: colors.text, margin: 0 }}>
              Configure your preferences and settings
            </Text>
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: `${colors.primary}20`,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px',
            }}>
              3
            </div>
            <Text style={{ fontSize: '14px', color: colors.text, margin: 0 }}>
              Join our community for tips and best practices
            </Text>
          </div>
        </div>
      </EmailCard>
      
      <EmailButton href={dashboardUrl}>
        Go to Dashboard
      </EmailButton>
      
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Link href={billingUrl} style={{ color: colors.primary, fontSize: '14px' }}>
          Manage Billing & Invoices
        </Link>
      </div>
      
      <EmailDivider />
      
      {/* Support */}
      <EmailCard>
        <div style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 8px' }}>
            Need Help Getting Started?
          </Text>
          <Text style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 16px' }}>
            Our team is here to ensure your success
          </Text>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              href={`${dashboardUrl}/tutorials`}
              style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                color: colors.text,
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              📺 Video Tutorials
            </Link>
            <Link
              href={`${dashboardUrl}/docs`}
              style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                color: colors.text,
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              📚 Documentation
            </Link>
            <Link
              href="mailto:support@vibelux.ai"
              style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                color: colors.text,
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              💬 Contact Support
            </Link>
          </div>
        </div>
      </EmailCard>
      
      <EmailText muted>
        Thank you for choosing VibeLux! We're excited to be part of your cultivation journey.
        <br /><br />
        Best regards,
        <br />
        The VibeLux Team
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default SubscriptionConfirmationEmail;