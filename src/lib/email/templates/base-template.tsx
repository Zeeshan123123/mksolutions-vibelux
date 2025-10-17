/**
 * Base Email Template
 * VibeLux branded email layout
 */

import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
  Hr,
} from '@react-email/components';

export interface BaseEmailProps {
  preview?: string;
  children: React.ReactNode;
  footer?: boolean;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}

// VibeLux Brand Colors
const colors = {
  background: '#0a0a0a',
  cardBackground: '#111111',
  border: '#262626',
  primary: '#8B5CF6',
  primaryHover: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  text: '#E5E5E5',
  textMuted: '#A3A3A3',
  link: '#8B5CF6',
};

const baseStyles = {
  main: {
    backgroundColor: colors.background,
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
  },
  card: {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '40px',
    marginBottom: '20px',
  },
  logo: {
    margin: '0 auto 30px',
    width: '150px',
    height: 'auto',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text,
    margin: '0 0 20px',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: colors.text,
    margin: '0 0 16px',
  },
  textMuted: {
    fontSize: '14px',
    lineHeight: '20px',
    color: colors.textMuted,
  },
  link: {
    color: colors.link,
    textDecoration: 'none',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: '8px',
    color: '#FFFFFF',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '100%',
    padding: '14px 28px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '100%',
    padding: '12px 26px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  hr: {
    borderColor: colors.border,
    borderWidth: '1px',
    borderStyle: 'solid',
    margin: '30px 0',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: `1px solid ${colors.border}`,
  },
  footerText: {
    fontSize: '12px',
    lineHeight: '16px',
    color: colors.textMuted,
    textAlign: 'center' as const,
    margin: '0 0 8px',
  },
  socialLinks: {
    textAlign: 'center' as const,
    marginTop: '20px',
  },
  socialIcon: {
    display: 'inline-block',
    margin: '0 8px',
  },
};

export function BaseEmailTemplate({
  preview = '',
  children,
  footer = true,
  unsubscribeUrl,
  preferencesUrl,
}: BaseEmailProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={baseStyles.main}>
        <Container style={baseStyles.container}>
          {/* Logo */}
          <Section>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo-email.png`}
              alt="VibeLux"
              style={baseStyles.logo}
            />
          </Section>
          
          {/* Main Content */}
          <Section style={baseStyles.card}>
            {children}
          </Section>
          
          {/* Footer */}
          {footer && (
            <Section style={baseStyles.footer}>
              <Text style={baseStyles.footerText}>
                © {currentYear} VibeLux AI. All rights reserved.
              </Text>
              
              <Text style={baseStyles.footerText}>
                1234 Innovation Drive, San Francisco, CA 94105
              </Text>
              
              {/* Social Links */}
              <div style={baseStyles.socialLinks}>
                <Link
                  href="https://twitter.com/vibelux"
                  style={baseStyles.socialIcon}
                >
                  <Img
                    src={`${process.env.NEXT_PUBLIC_APP_URL}/icons/twitter.png`}
                    width="24"
                    height="24"
                    alt="Twitter"
                  />
                </Link>
                <Link
                  href="https://linkedin.com/company/vibelux"
                  style={baseStyles.socialIcon}
                >
                  <Img
                    src={`${process.env.NEXT_PUBLIC_APP_URL}/icons/linkedin.png`}
                    width="24"
                    height="24"
                    alt="LinkedIn"
                  />
                </Link>
                <Link
                  href="https://instagram.com/vibelux"
                  style={baseStyles.socialIcon}
                >
                  <Img
                    src={`${process.env.NEXT_PUBLIC_APP_URL}/icons/instagram.png`}
                    width="24"
                    height="24"
                    alt="Instagram"
                  />
                </Link>
              </div>
              
              {/* Unsubscribe Links */}
              {(unsubscribeUrl || preferencesUrl) && (
                <Text style={baseStyles.footerText}>
                  {preferencesUrl && (
                    <>
                      <Link href={preferencesUrl} style={baseStyles.link}>
                        Update preferences
                      </Link>
                      {unsubscribeUrl && ' • '}
                    </>
                  )}
                  {unsubscribeUrl && (
                    <Link href={unsubscribeUrl} style={baseStyles.link}>
                      Unsubscribe
                    </Link>
                  )}
                </Text>
              )}
              
              <Text style={baseStyles.footerText}>
                Questions? Contact us at{' '}
                <Link href="mailto:support@vibelux.ai" style={baseStyles.link}>
                  support@vibelux.ai
                </Link>
              </Text>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  );
}

// Export reusable components with VibeLux styling
export function EmailHeading({ children }: { children: React.ReactNode }) {
  return <h1 style={baseStyles.heading}>{children}</h1>;
}

export function EmailText({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={muted ? baseStyles.textMuted : baseStyles.text}>{children}</Text>;
}

export function EmailButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return (
    <div style={{ textAlign: 'center', margin: '30px 0' }}>
      <Link href={href} style={secondary ? baseStyles.buttonSecondary : baseStyles.button}>
        {children}
      </Link>
    </div>
  );
}

export function EmailDivider() {
  return <Hr style={baseStyles.hr} />;
}

export function EmailAlert({ type, children }: { type: 'success' | 'warning' | 'error' | 'info'; children: React.ReactNode }) {
  const alertColors = {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.primary,
  };
  
  return (
    <div
      style={{
        backgroundColor: `${alertColors[type]}20`,
        border: `1px solid ${alertColors[type]}`,
        borderRadius: '8px',
        padding: '16px',
        margin: '20px 0',
      }}
    >
      <Text style={{ ...baseStyles.text, color: alertColors[type], margin: 0 }}>
        {children}
      </Text>
    </div>
  );
}

export function EmailCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0',
      }}
    >
      {title && (
        <h3 style={{ ...baseStyles.text, fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function EmailMetric({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }) {
  const trendColors = {
    up: colors.success,
    down: colors.error,
    neutral: colors.textMuted,
  };
  
  return (
    <div style={{ margin: '16px 0' }}>
      <Text style={{ ...baseStyles.textMuted, fontSize: '12px', margin: '0 0 4px' }}>
        {label}
      </Text>
      <Text style={{ ...baseStyles.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
        {value}
        {trend && (
          <span style={{ color: trendColors[trend], fontSize: '14px', marginLeft: '8px' }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </Text>
    </div>
  );
}

export { colors, baseStyles };