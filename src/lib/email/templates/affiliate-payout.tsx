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

interface AffiliatePayoutEmailProps {
  affiliateName: string;
  payoutAmount: number;
  netAmount: number;
  platformFee: number;
  period: string;
  transactionId: string;
  dashboardUrl: string;
  commissions: Array<{
    customerName: string;
    amount: number;
    date: string;
  }>;
}

export function AffiliatePayoutEmail({
  affiliateName,
  payoutAmount,
  netAmount,
  platformFee,
  period,
  transactionId,
  dashboardUrl,
  commissions,
}: AffiliatePayoutEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your VibeLux affiliate payout of ${netAmount.toFixed(2)} has been processed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://vibelux.ai/vibelux-logo.png"
            width="150"
            height="50"
            alt="VibeLux"
            style={logo}
          />

          <Heading style={h1}>Affiliate Payout Processed! 💰</Heading>

          <Text style={text}>Hi {affiliateName},</Text>

          <Text style={text}>
            Great news! Your affiliate commission payout for {period} has been processed.
          </Text>

          <Section style={payoutBox}>
            <Text style={payoutAmount}>${netAmount.toFixed(2)}</Text>
            <Text style={payoutLabel}>Net Payout Amount</Text>
          </Section>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>Payout Details</Text>
            <table style={table}>
              <tbody>
                <tr>
                  <td style={tableLabel}>Period:</td>
                  <td style={tableValue}>{period}</td>
                </tr>
                <tr>
                  <td style={tableLabel}>Gross Commission:</td>
                  <td style={tableValue}>${payoutAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={tableLabel}>Platform Fee (2.5%):</td>
                  <td style={tableValue}>-${platformFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={tableLabelBold}>Net Payout:</td>
                  <td style={tableValueBold}>${netAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={tableLabel}>Transaction ID:</td>
                  <td style={tableValue}>{transactionId}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={text}>
            The funds have been transferred to your connected bank account and should appear
            within 2-5 business days, depending on your bank's processing time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Commission Breakdown</Heading>

          <Text style={text}>
            Here's a summary of the commissions included in this payout:
          </Text>

          <Section style={commissionsBox}>
            <table style={commissionsTable}>
              <thead>
                <tr>
                  <th style={commissionsHeader}>Customer</th>
                  <th style={commissionsHeader}>Date</th>
                  <th style={commissionsHeaderRight}>Commission</th>
                </tr>
              </thead>
              <tbody>
                {commissions.slice(0, 5).map((commission, index) => (
                  <tr key={index}>
                    <td style={commissionsCell}>{commission.customerName}</td>
                    <td style={commissionsCell}>{commission.date}</td>
                    <td style={commissionsCellRight}>${commission.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {commissions.length > 5 && (
              <Text style={moreCommissions}>
                ...and {commissions.length - 5} more commissions
              </Text>
            )}
          </Section>

          <Button style={button} href={dashboardUrl}>
            View Full Details in Dashboard
          </Button>

          <Hr style={hr} />

          <Heading style={h2}>Tax Information</Heading>

          <Text style={text}>
            This payout will be reported on your 1099 form at the end of the tax year.
            Please ensure your tax information is up to date in your affiliate dashboard.
          </Text>

          <Text style={text}>
            If you need a detailed invoice or have any questions about this payout,
            please contact us at{' '}
            <Link href="mailto:affiliates@vibelux.app" style={link}>
              affiliates@vibelux.app
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={congratsText}>
            🎉 Keep up the great work! Your referrals are helping growers achieve
            better yields with our LED technology.
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
            <br />
            <br />
            <Link href="{{{unsubscribe}}}" style={footerLink}>
              Manage email preferences
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

const payoutBox = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  margin: '20px 48px',
  padding: '32px',
  textAlign: 'center' as const,
};

const payoutAmount = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const payoutLabel = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
};

const detailsBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '4px',
  margin: '20px 48px',
  padding: '24px',
};

const detailsTitle = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const table = {
  width: '100%',
};

const tableLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '4px 0',
};

const tableValue = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '500',
  padding: '4px 0',
  textAlign: 'right' as const,
};

const tableLabelBold = {
  ...tableLabel,
  fontWeight: '600',
  paddingTop: '12px',
};

const tableValueBold = {
  ...tableValue,
  fontWeight: '700',
  fontSize: '16px',
  paddingTop: '12px',
};

const commissionsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  margin: '20px 48px',
  padding: '16px',
};

const commissionsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const commissionsHeader = {
  borderBottom: '1px solid #e5e7eb',
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  padding: '8px 0',
  textAlign: 'left' as const,
  textTransform: 'uppercase' as const,
};

const commissionsHeaderRight = {
  ...commissionsHeader,
  textAlign: 'right' as const,
};

const commissionsCell = {
  borderBottom: '1px solid #f3f4f6',
  color: '#333',
  fontSize: '14px',
  padding: '12px 0',
};

const commissionsCellRight = {
  ...commissionsCell,
  textAlign: 'right' as const,
};

const moreCommissions = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '12px 0 0',
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

const congratsText = {
  backgroundColor: '#fef3c7',
  borderRadius: '4px',
  color: '#92400e',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 48px 20px',
  padding: '16px',
  textAlign: 'center' as const,
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

const footerLink = {
  color: '#8898aa',
  fontSize: '12px',
  textDecoration: 'underline',
};

export default AffiliatePayoutEmail;