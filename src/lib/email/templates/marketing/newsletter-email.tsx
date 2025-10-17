/**
 * Newsletter Email Template
 * Monthly VibeLux newsletter with updates and content
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
import { Text, Link, Img } from '@react-email/components';

interface Article {
  title: string;
  summary: string;
  link: string;
  image?: string;
  author?: string;
  readTime?: string;
}

interface NewsletterEmailProps {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  articles: Article[];
  announcements?: string[];
  featuredProduct?: {
    name: string;
    description: string;
    image: string;
    link: string;
    discount?: string;
  };
  upcomingEvents?: Array<{
    title: string;
    date: string;
    type: string;
    link: string;
  }>;
  communityHighlight?: {
    name: string;
    company: string;
    story: string;
    image?: string;
  };
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export function NewsletterEmail({
  heroTitle,
  heroSubtitle,
  heroImage,
  articles,
  announcements,
  featuredProduct,
  upcomingEvents,
  communityHighlight,
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterEmailProps) {
  return (
    <BaseEmailTemplate 
      preview={heroTitle}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
    >
      {/* Hero Section */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        {heroImage && (
          <Img
            src={heroImage}
            alt={heroTitle}
            style={{
              width: '100%',
              maxWidth: '520px',
              height: 'auto',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          />
        )}
        <EmailHeading>{heroTitle}</EmailHeading>
        <EmailText>{heroSubtitle}</EmailText>
      </div>
      
      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <div style={{
          backgroundColor: `${colors.primary}20`,
          border: `1px solid ${colors.primary}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px',
        }}>
          <Text style={{ 
            color: colors.primary,
            fontWeight: '600',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 12px',
          }}>
            📢 Announcements
          </Text>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {announcements.map((announcement, index) => (
              <li key={index} style={{ color: colors.text, marginBottom: '8px' }}>
                {announcement}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Featured Articles */}
      <EmailCard title="📚 Featured Articles">
        {articles.map((article, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: index < articles.length - 1 ? '24px' : '0',
              paddingBottom: index < articles.length - 1 ? '24px' : '0',
              borderBottom: index < articles.length - 1 ? `1px solid ${colors.border}` : 'none',
            }}
          >
            {article.image && (
              <Img
                src={article.image}
                alt={article.title}
                style={{
                  width: '120px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <Link
                href={article.link}
                style={{
                  color: colors.text,
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                {article.title}
              </Link>
              <Text style={{ 
                fontSize: '14px',
                color: colors.textMuted,
                margin: '4px 0',
                lineHeight: '20px',
              }}>
                {article.summary}
              </Text>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {article.author && (
                  <Text style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                    By {article.author}
                  </Text>
                )}
                {article.readTime && (
                  <Text style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                    {article.readTime} read
                  </Text>
                )}
                <Link
                  href={article.link}
                  style={{
                    fontSize: '12px',
                    color: colors.primary,
                    textDecoration: 'none',
                  }}
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </EmailCard>
      
      {/* Featured Product */}
      {featuredProduct && (
        <EmailCard title="✨ Product Spotlight">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <div style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: colors.text,
                margin: '0 0 8px',
              }}>
                {featuredProduct.name}
              </Text>
              <Text style={{
                fontSize: '14px',
                color: colors.textMuted,
                margin: '0 0 12px',
                lineHeight: '20px',
              }}>
                {featuredProduct.description}
              </Text>
              {featuredProduct.discount && (
                <Text style={{
                  fontSize: '16px',
                  color: colors.success,
                  fontWeight: '600',
                  margin: '0 0 12px',
                }}>
                  🎁 {featuredProduct.discount} OFF
                </Text>
              )}
              <Link
                href={featuredProduct.link}
                style={{
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-block',
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </EmailCard>
      )}
      
      {/* Community Highlight */}
      {communityHighlight && (
        <EmailCard title="🌟 Community Spotlight">
          <div style={{ display: 'flex', gap: '16px' }}>
            {communityHighlight.image && (
              <Img
                src={communityHighlight.image}
                alt={communityHighlight.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '40px',
                  objectFit: 'cover',
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <Text style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.text,
                margin: '0 0 4px',
              }}>
                {communityHighlight.name}
              </Text>
              <Text style={{
                fontSize: '14px',
                color: colors.primary,
                margin: '0 0 12px',
              }}>
                {communityHighlight.company}
              </Text>
              <Text style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '20px',
                fontStyle: 'italic',
                margin: 0,
              }}>
                "{communityHighlight.story}"
              </Text>
            </div>
          </div>
        </EmailCard>
      )}
      
      {/* Upcoming Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <EmailCard title="📅 Upcoming Events">
          {upcomingEvents.map((event, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < upcomingEvents.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}
            >
              <div>
                <Link
                  href={event.link}
                  style={{
                    color: colors.text,
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  {event.title}
                </Link>
                <Text style={{
                  fontSize: '12px',
                  color: colors.textMuted,
                  margin: '4px 0 0',
                }}>
                  {event.date} • {event.type}
                </Text>
              </div>
              <Link
                href={event.link}
                style={{
                  color: colors.primary,
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
              >
                Register →
              </Link>
            </div>
          ))}
        </EmailCard>
      )}
      
      <EmailDivider />
      
      {/* Social Follow */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Text style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.text,
          margin: '0 0 16px',
        }}>
          Follow us for daily tips and updates
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link
            href="https://twitter.com/vibelux"
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '12px 20px',
              textDecoration: 'none',
              color: colors.text,
              fontSize: '14px',
            }}
          >
            𝕏 Twitter
          </Link>
          <Link
            href="https://linkedin.com/company/vibelux"
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '12px 20px',
              textDecoration: 'none',
              color: colors.text,
              fontSize: '14px',
            }}
          >
            💼 LinkedIn
          </Link>
          <Link
            href="https://instagram.com/vibelux"
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '12px 20px',
              textDecoration: 'none',
              color: colors.text,
              fontSize: '14px',
            }}
          >
            📸 Instagram
          </Link>
        </div>
      </div>
      
      <EmailDivider />
      
      <EmailText muted>
        Thank you for being part of the VibeLux community! 
        We're committed to helping you achieve cultivation excellence.
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default NewsletterEmail;