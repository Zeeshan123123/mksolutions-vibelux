'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { StructuredData, ProductSchema } from '@/components/seo/StructuredData';
import { SEOAnalyzer } from '@/components/seo/SEOAnalyzer';

// Example page showing all SEO implementations
export default function DesignPageWithSEO() {
  const breadcrumbs = [
    { name: 'Design', url: '/design' },
    { name: 'Advanced Design', url: '/design/advanced' }
  ];

  return (
    <>
      {/* Breadcrumbs with structured data */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          Advanced Greenhouse Design Studio
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Design your perfect controlled environment agriculture facility with our 
          AI-powered tools. From small indoor farms to large commercial greenhouses, 
          create optimized layouts that maximize yield and minimize costs.
        </p>
        
        {/* Product schema for design tools */}
        <ProductSchema
          name="VibeLux Advanced Design Studio"
          description="Professional greenhouse and indoor farm design software with AI optimization"
          price={0}
          availability="InStock"
          rating={{ value: 4.8, count: 127 }}
        />
        
        {/* SEO Analyzer for content editors */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">SEO Content Analysis</h2>
          <SEOAnalyzer
            title="Advanced Greenhouse Design Studio | VibeLux"
            description="Design your perfect controlled environment agriculture facility with our AI-powered tools. Create optimized layouts that maximize yield."
            content={`
              Design your perfect controlled environment agriculture facility with our 
              AI-powered tools. From small indoor farms to large commercial greenhouses, 
              create optimized layouts that maximize yield and minimize costs.
              
              ## Features
              - AI-powered optimization
              - Real-time 3D visualization
              - Energy efficiency analysis
              - Cost estimation tools
              - Equipment database
              
              ## Benefits
              Our greenhouse design software helps you create facilities that are 
              30% more energy efficient than traditional designs.
            `}
            url="/design/advanced"
          />
        </div>
      </div>
    </>
  );
}