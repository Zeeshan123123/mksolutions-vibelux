import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AffiliateWelcomeEmailProps {
  affiliateName: string;
  affiliateCode: string;
  affiliateLink: string;
  dashboardUrl: string;
  commissionRate: number;
}

export function AffiliateWelcomeEmail({
  affiliateName,
  affiliateCode,
  affiliateLink,
  dashboardUrl,
  commissionRate,
}: AffiliateWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the VibeLux Affiliate Program!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://vibelux.ai/vibelux-logo.png"
            width="150"
            height="50"
            alt="VibeLux"
            style={logo}
          />

          <Heading style={h1}>Welcome to the VibeLux Affiliate Program! 🎉</Heading>

          <Text style={text}>Hi {affiliateName},</Text>

          <Text style={text}>
            Congratulations! Your application to join the VibeLux Affiliate Program has been
            approved. We're excited to have you as a partner in bringing advanced LED grow
            lighting solutions to growers worldwide.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Your Affiliate Details:</Text>
            <Text style={infoItem}>
              <strong>Affiliate Code:</strong> {affiliateCode}
            </Text>
            <Text style={infoItem}>
              <strong>Commission Rate:</strong> {commissionRate}%
            </Text>
            <Text style={infoItem}>
              <strong>Cookie Duration:</strong> 30 days
            </Text>
          </Section>

          <Text style={text}>
            <strong>Your Unique Affiliate Link:</strong>
          </Text>
          <Section style={linkBox}>
            <Link href={affiliateLink} style={link}>
              {affiliateLink}
            </Link>
          </Section>

          <Button style={button} href={dashboardUrl}>
            Access Your Dashboard
          </Button>

          <Hr style={hr} />

          <Heading style={h2}>Quick Start Guide</Heading>

          <Text style={text}>
            <strong>1. Set Up Your Payment Method</strong>
            <br />
            Log into your dashboard and complete your Stripe Connect setup to receive monthly
            payouts.
          </Text>

          <Text style={text}>
            <strong>2. Access Marketing Materials</strong>
            <br />
            Find banners, email templates, and social media content in your dashboard's
            Resources section.
          </Text>

          <Text style={text}>
            <strong>3. Generate Custom Links</strong>
            <br />
            Create tracking links for specific products or campaigns to optimize your
            conversions.
          </Text>

          <Text style={text}>
            <strong>4. Track Your Performance</strong>
            <br />
            Monitor clicks, conversions, and earnings in real-time through your dashboard.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Commission Structure</Heading>

          <Text style={text}>
            You'll earn {commissionRate}% commission on all sales generated through your
            affiliate links. As you grow your referrals, you'll unlock higher commission
            tiers:
          </Text>

          <ul style={list}>
            <li>Bronze (1-10 referrals): 20-25%</li>
            <li>Silver (11-50 referrals): 25-30%</li>
            <li>Gold (51+ referrals): 30-35%</li>
          </ul>

          <Text style={text}>
            Plus, enjoy additional bonuses for high-quality referrals and consistent
            performance!
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions, our affiliate support team is here to help at{' '}
            <Link href="mailto:affiliates@vibelux.app" style={link}>
              affiliates@vibelux.app
            </Link>
          </Text>

          <Text style={text}>
            Best regards,
            <br />
            The VibeLux Team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            VibeLux - Professional LED Grow Lights
            <br />
            <Link href="https://vibelux.app" style={link}>
              vibelux.app
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '32px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 16px',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px 0',
  padding: '0 48px',
};

const infoBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '4px',
  margin: '20px 48px',
  padding: '24px',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const infoItem = {
  fontSize: '16px',
  margin: '0 0 8px 0',
};

const linkBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '4px',
  margin: '10px 48px 20px',
  padding: '16px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '5px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px auto',
  padding: '12px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
};

const list = {
  paddingLeft: '68px',
  margin: '0 0 20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '40px 48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  padding: '0 48px',
  textAlign: 'center' as const,
};

export default AffiliateWelcomeEmail;