'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { StructuredData } from './StructuredData';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route name mappings for better display
const routeNameMap: Record<string, string> = {
  design: 'Design Studio',
  advanced: 'Advanced Design',
  cultivation: 'Cultivation',
  automation: 'Automation',
  marketplace: 'Marketplace',
  sensors: 'Sensors',
  analytics: 'Analytics',
  facility: 'Facility Management',
  investment: 'Investment',
  templates: 'Templates',
  blog: 'Blog',
  documentation: 'Documentation',
  pricing: 'Pricing',
  about: 'About',
  contact: 'Contact'
};

export function Breadcrumbs({ items, className = '', showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  // Add home to breadcrumbs if showHome is true
  const allItems = showHome 
    ? [{ name: 'Home', url: '/' }, ...breadcrumbItems]
    : breadcrumbItems;
  
  if (allItems.length <= 1) return null;
  
  return (
    <>
      {/* Structured data for SEO */}
      <StructuredData type="breadcrumb" breadcrumbs={allItems} />
      
      {/* Visual breadcrumbs */}
      <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;
          
          return (
            <React.Fragment key={item.url}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {isHome && <Home className="w-4 h-4 inline mr-1" />}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isHome && <Home className="w-4 h-4 inline mr-1" />}
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  segments.forEach((segment, index) => {
    const url = '/' + segments.slice(0, index + 1).join('/');
    const name = routeNameMap[segment] || formatSegmentName(segment);
    breadcrumbs.push({ name, url });
  });
  
  return breadcrumbs;
}

// Format segment name for display
function formatSegmentName(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Breadcrumb component with custom styling
export function StyledBreadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <div className={`bg-secondary/20 backdrop-blur-sm border-b ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <Breadcrumbs items={items} showHome />
      </div>
    </div>
  );
}

// Mini breadcrumbs for card headers
export function MiniBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
      {items.map((item, index) => (
        <React.Fragment key={item.url}>
          {index > 0 && <span>/</span>}
          <Link href={item.url} className="hover:text-foreground transition-colors">
            {item.name}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}