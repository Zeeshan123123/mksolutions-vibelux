// SEO Utility Functions - Yoast-style helpers
import { Metadata } from 'next';
import { seoConfig } from './seo-config';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    title?: string;
    description?: string;
    images?: string[];
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

// Generate metadata for a page
export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title = seoConfig.defaults.title,
    description = seoConfig.defaults.description,
    canonical = seoConfig.defaults.canonical,
    openGraph = {},
    twitter = {},
    robots = { index: true, follow: true },
    alternates
  } = props;

  return {
    title,
    description,
    robots,
    alternates: alternates || { canonical },
    openGraph: {
      title: openGraph.title || title,
      description: openGraph.description || description,
      url: canonical,
      siteName: seoConfig.defaults.openGraph.siteName,
      type: seoConfig.defaults.openGraph.type,
      locale: seoConfig.defaults.openGraph.locale,
      images: openGraph.images || seoConfig.defaults.openGraph.images
    },
    twitter: {
      card: 'summary_large_image',
      title: twitter.title || title,
      description: twitter.description || description,
      site: seoConfig.defaults.twitter.site,
      creator: seoConfig.defaults.twitter.handle,
      images: twitter.images || [seoConfig.defaults.openGraph.images[0].url]
    }
  };
}

// Generate JSON-LD structured data
export function generateStructuredData(type: 'organization' | 'softwareApplication' | 'product' | 'article', customData?: any) {
  const baseSchema = seoConfig.schemas[type] || {};
  
  return {
    __html: JSON.stringify({
      ...baseSchema,
      ...customData
    })
  };
}

// SEO content analysis
export function analyzeContent(content: string, targetKeywords: string[]): SEOAnalysis {
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const paragraphs = content.split(/\n\n+/).length;
  
  // Calculate readability (simplified Flesch Reading Ease)
  const avgWordsPerSentence = wordCount / sentences;
  const avgSyllablesPerWord = estimateSyllables(content) / wordCount;
  const readabilityScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  // Keyword analysis
  const keywordAnalysis = targetKeywords.map(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex) || [];
    const density = (matches.length / wordCount) * 100;
    
    return {
      keyword,
      count: matches.length,
      density: density.toFixed(2) + '%',
      status: density >= 0.5 && density <= 2.5 ? 'good' : 'needs-improvement'
    };
  });
  
  return {
    wordCount,
    sentences,
    paragraphs,
    readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
    readabilityStatus: readabilityScore >= 60 ? 'good' : 'needs-improvement',
    keywordAnalysis,
    recommendations: generateRecommendations(wordCount, readabilityScore, keywordAnalysis)
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Helper functions
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;
  
  words.forEach(word => {
    // Simple syllable estimation
    const syllables = word.replace(/[^aeiou]/g, '').length || 1;
    totalSyllables += syllables;
  });
  
  return totalSyllables;
}

function generateRecommendations(wordCount: number, readability: number, keywordAnalysis: any[]): string[] {
  const recommendations = [];
  
  if (wordCount < 300) {
    recommendations.push('Add more content. Aim for at least 300 words.');
  }
  
  if (readability < 60) {
    recommendations.push('Simplify your sentences to improve readability.');
  }
  
  keywordAnalysis.forEach(analysis => {
    if (analysis.status === 'needs-improvement') {
      if (parseFloat(analysis.density) < 0.5) {
        recommendations.push(`Increase usage of keyword "${analysis.keyword}"`);
      } else {
        recommendations.push(`Reduce usage of keyword "${analysis.keyword}" to avoid over-optimization`);
      }
    }
  });
  
  return recommendations;
}

// Types
interface SEOAnalysis {
  wordCount: number;
  sentences: number;
  paragraphs: number;
  readabilityScore: number;
  readabilityStatus: 'good' | 'needs-improvement';
  keywordAnalysis: Array<{
    keyword: string;
    count: number;
    density: string;
    status: 'good' | 'needs-improvement';
  }>;
  recommendations: string[];
}