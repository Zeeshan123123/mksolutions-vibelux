import { generateSEOMetadata } from '@/lib/seo/seo-utils';
import { StructuredData } from './StructuredData';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  structuredData?: {
    type: 'organization' | 'softwareApplication' | 'product' | 'article';
    data?: any;
  };
  alternates?: {
    languages?: Record<string, string>;
  };
}

export function SEOHead({
  title,
  description,
  canonical,
  image,
  noindex = false,
  breadcrumbs,
  structuredData,
  alternates
}: SEOHeadProps) {
  // Generate metadata
  const metadata = generateSEOMetadata({
    title,
    description,
    canonical,
    openGraph: image ? {
      images: [{ url: image, width: 1200, height: 630, alt: title || 'VibeLux' }]
    } : undefined,
    robots: {
      index: !noindex,
      follow: !noindex
    },
    alternates
  });

  return (
    <>
      {/* Organization schema (default) */}
      <StructuredData type="organization" />
      
      {/* Breadcrumb schema if provided */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
      )}
      
      {/* Additional structured data if provided */}
      {structuredData && (
        <StructuredData type={structuredData.type} data={structuredData.data} />
      )}
    </>
  );
}

// Pagination SEO component
export function PaginationSEO({ 
  currentPage, 
  totalPages, 
  baseUrl 
}: { 
  currentPage: number; 
  totalPages: number; 
  baseUrl: string;
}) {
  const prevUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null;
  const nextUrl = currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : null;
  
  return (
    <>
      {prevUrl && <link rel="prev" href={prevUrl} />}
      {nextUrl && <link rel="next" href={nextUrl} />}
    </>
  );
}

// Language alternates component
export function LanguageAlternates({ 
  alternates 
}: { 
  alternates: Record<string, string> 
}) {
  return (
    <>
      {Object.entries(alternates).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
    </>
  );
}