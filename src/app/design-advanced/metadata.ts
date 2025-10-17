import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/seo-utils';
import { seoConfig } from '@/lib/seo/seo-config';

export function generateMetadata(): Metadata {
  return generateSEOMetadata({
    title: seoConfig.pages.design.title,
    description: seoConfig.pages.design.description,
    canonical: 'https://vibelux.ai/design',
    openGraph: {
      title: 'Design Your Perfect Growing Facility | VibeLux',
      description: 'Use our AI-powered design tool to create custom greenhouse layouts, optimize HVAC systems, and maximize energy efficiency for your indoor farming operation.',
      images: [{
        url: '/images/design-tool-og.png',
        width: 1200,
        height: 630,
        alt: 'VibeLux Greenhouse Design Tool'
      }]
    }
  });
}