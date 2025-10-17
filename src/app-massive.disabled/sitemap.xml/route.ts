import { NextResponse } from 'next/server';
import { seoConfig } from '@/lib/seo/seo-config';

// Define all your static routes
const staticRoutes = [
  '/',
  '/design',
  '/design/advanced',
  '/cultivation',
  '/automation',
  '/marketplace',
  '/sensors',
  '/analytics',
  '/pricing',
  '/about',
  '/contact',
  '/blog',
  '/documentation',
  '/facility',
  '/investment',
  '/components',
  '/integrations',
  '/templates'
];

// Dynamic route generators
async function getDynamicRoutes() {
  const routes: string[] = [];
  
  // Add template pages
  const templates = [
    'vertical-farm',
    'greenhouse-complex',
    'indoor-grow',
    'research-facility'
  ];
  templates.forEach(template => routes.push(`/templates/${template}`));
  
  return routes;
}

function generateSitemapXML(routes: string[]) {
  const baseUrl = 'https://vibelux.ai';
  const today = new Date().toISOString().split('T')[0];
  
  const urlEntries = routes.map(route => {
    const changefreq = seoConfig.technical.sitemapConfig.changefreq[route] || 'weekly';
    const priority = seoConfig.technical.sitemapConfig.priority[route] || 0.5;
    
    return `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

export async function GET() {
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  const sitemap = generateSitemapXML(allRoutes);
  
  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}