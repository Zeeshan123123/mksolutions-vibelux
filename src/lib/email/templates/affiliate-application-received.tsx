import * as React from 'react';
import {
  Body,
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

interface AffiliateApplicationReceivedEmailProps {
  applicantName: string;
  applicationDate: string;
}

export function AffiliateApplicationReceivedEmail({
  applicantName,
  applicationDate,
}: AffiliateApplicationReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for applying to the VibeLux Affiliate Program</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://vibelux.ai/vibelux-logo.png"
            width="150"
            height="50"
            alt="VibeLux"
            style={logo}
          />

          <Heading style={h1}>Application Received! 📋</Heading>

          <Text style={text}>Hi {applicantName},</Text>

          <Text style={text}>
            Thank you for your interest in joining the VibeLux Affiliate Program! We've
            received your application and our team is reviewing it.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>What happens next?</Text>
            <Text style={infoText}>
              <strong>1. Application Review</strong>
              <br />
              Our team will review your application within 2-3 business days.
            </Text>
            <Text style={infoText}>
              <strong>2. Approval Notification</strong>
              <br />
              You'll receive an email once your application is approved with your affiliate
              details and next steps.
            </Text>
            <Text style={infoText}>
              <strong>3. Get Started</strong>
              <br />
              Upon approval, you'll have immediate access to your dashboard, marketing
              materials, and can start earning commissions!
            </Text>
          </Section>

          <Text style={text}>
            <strong>Application Details:</strong>
            <br />
            Application Date: {applicationDate}
            <br />
            Status: Under Review
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Why Partner with VibeLux?</Heading>

          <Text style={text}>
            While we review your application, here's what you can look forward to as a
            VibeLux affiliate:
          </Text>

          <ul style={list}>
            <li>
              <strong>Competitive Commissions:</strong> Earn 20-35% on every sale
            </li>
            <li>
              <strong>Monthly Payouts:</strong> Reliable payments via Stripe Connect
            </li>
            <li>
              <strong>Marketing Support:</strong> Professional materials and resources
            </li>
            <li>
              <strong>Real-time Tracking:</strong> Advanced analytics dashboard
            </li>
            <li>
              <strong>Dedicated Support:</strong> Affiliate success team to help you grow
            </li>
          </ul>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions about your application or the affiliate program,
            please don't hesitate to reach out to us at{' '}
            <Link href="mailto:affiliates@vibelux.app" style={link}>
              affiliates@vibelux.app
            </Link>
          </Text>

          <Text style={text}>
            We're excited about the possibility of working together!
          </Text>

          <Text style={text}>
            Best regards,
            <br />
            The VibeLux Affiliate Team
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
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const infoText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  paddingLeft: '68px',
  margin: '0 0 20px',
};

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
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

export default AffiliateApplicationReceivedEmail;