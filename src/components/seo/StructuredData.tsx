import Script from 'next/script';
import { generateStructuredData, generateBreadcrumbSchema } from '@/lib/seo/seo-utils';

interface StructuredDataProps {
  type?: 'organization' | 'softwareApplication' | 'product' | 'article' | 'breadcrumb';
  data?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function StructuredData({ type = 'organization', data, breadcrumbs }: StructuredDataProps) {
  let structuredData;
  
  if (type === 'breadcrumb' && breadcrumbs) {
    structuredData = { __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) };
  } else if (type !== 'breadcrumb') {
    structuredData = generateStructuredData(type, data);
  }
  
  if (!structuredData) return null;
  
  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={structuredData}
      strategy="afterInteractive"
    />
  );
}

// Product schema component for marketplace/equipment pages
export function ProductSchema({ 
  name, 
  description, 
  price, 
  currency = 'USD',
  image,
  brand = 'VibeLux',
  availability = 'InStock',
  rating
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  brand?: string;
  availability?: string;
  rating?: { value: number; count: number };
}) {
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'VibeLux'
      }
    }
  };
  
  if (image) {
    (productData as any).image = image;
  }
  
  if (rating) {
    (productData as any).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.value.toString(),
      reviewCount: rating.count.toString()
    };
  }
  
  return <StructuredData type="product" data={productData} />;
}

// Article schema for blog posts
export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher = 'VibeLux'
}: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  publisher?: string;
}) {
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: publisher,
      logo: {
        '@type': 'ImageObject',
        url: 'https://vibelux.ai/vibelux-logo.png'
      }
    }
  };
  
  if (image) {
    (articleData as any).image = image;
  }
  
  return <StructuredData type="article" data={articleData} />;
}

// FAQ schema component
export function FAQSchema({ 
  faqs 
}: { 
  faqs: Array<{ question: string; answer: string }> 
}) {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
  
  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      strategy="afterInteractive"
    />
  );
}

// Local Business schema for physical locations
export function LocalBusinessSchema({
  name,
  description,
  address,
  telephone,
  openingHours,
  priceRange = '$$'
}: {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  openingHours?: string[];
  priceRange?: string;
}) {
  const businessData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    address: {
      '@type': 'PostalAddress',
      ...address
    },
    telephone,
    priceRange,
    openingHours
  };
  
  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(businessData) }}
      strategy="afterInteractive"
    />
  );
}