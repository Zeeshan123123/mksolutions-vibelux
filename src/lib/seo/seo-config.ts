// Vibelux SEO Configuration - Yoast-style implementation
export const seoConfig = {
  // Site-wide defaults
  defaults: {
    title: 'VibeLux - The Complete CEA Platform',
    titleTemplate: '%s | VibeLux',
    description: 'The world\'s first truly end-to-end controlled environment agriculture platform. AI-powered design with intelligent energy optimization to reduce operational costs.',
    canonical: 'https://vibelux.ai',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://vibelux.ai',
      siteName: 'VibeLux',
      images: [
        {
          url: '/vibelux-og-image.png',
          width: 1200,
          height: 630,
          alt: 'VibeLux Platform'
        }
      ]
    },
    twitter: {
      handle: '@vibelux',
      site: '@vibelux',
      cardType: 'summary_large_image'
    }
  },
  
  // Page-specific SEO configurations
  pages: {
    home: {
      title: 'VibeLux - AI-Powered Controlled Environment Agriculture Platform',
      description: 'Design, build, and operate profitable indoor farms with VibeLux. From greenhouse design to harvest optimization, manage your entire CEA operation in one platform.',
      keywords: ['controlled environment agriculture', 'CEA platform', 'greenhouse design software', 'indoor farming', 'vertical farming', 'hydroponics', 'agricultural technology']
    },
    design: {
      title: 'Greenhouse & Indoor Farm Design Tool',
      description: 'Design your perfect growing facility with our AI-powered design tool. Create custom greenhouse layouts, HVAC systems, and optimize for energy efficiency.',
      keywords: ['greenhouse design', 'indoor farm design', 'CEA facility planning', 'HVAC design', 'grow room designer']
    },
    cultivation: {
      title: 'Cultivation Management & Crop Planning',
      description: 'Optimize your growing operations with intelligent crop planning, recipe management, and yield predictions powered by AI.',
      keywords: ['crop planning', 'cultivation management', 'grow recipes', 'yield optimization', 'cannabis cultivation']
    },
    automation: {
      title: 'Greenhouse Automation & Environmental Controls',
      description: 'Complete automation solutions for your growing facility. Control lighting, climate, irrigation, and more from anywhere.',
      keywords: ['greenhouse automation', 'environmental controls', 'smart farming', 'IoT agriculture', 'remote monitoring']
    },
    marketplace: {
      title: 'Agricultural Marketplace - Buy & Sell Produce',
      description: 'Connect with buyers and sellers in the controlled environment agriculture industry. Trade produce, equipment, and services.',
      keywords: ['agricultural marketplace', 'buy fresh produce', 'wholesale vegetables', 'CEA marketplace', 'farm to table']
    }
  },
  
  // Structured data schemas
  schemas: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'VibeLux',
      url: 'https://vibelux.ai',
      logo: 'https://vibelux.ai/vibelux-logo.png',
      sameAs: [
        'https://twitter.com/vibelux',
        'https://linkedin.com/company/vibelux',
        'https://github.com/vibelux'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-XXX-XXX-XXXX',
        contactType: 'customer service',
        availableLanguage: ['English']
      }
    },
    
    softwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'VibeLux Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127'
      }
    }
  },
  
  // Technical SEO settings
  technical: {
    robotsTxt: `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /static/
Sitemap: https://vibelux.ai/sitemap.xml
    `,
    
    sitemapConfig: {
      changefreq: {
        '/': 'daily',
        '/design': 'weekly',
        '/cultivation': 'weekly',
        '/marketplace': 'daily',
        '/blog': 'daily'
      },
      priority: {
        '/': 1.0,
        '/design': 0.9,
        '/cultivation': 0.8,
        '/marketplace': 0.8,
        '/pricing': 0.7,
        '/about': 0.6
      }
    }
  }
};

// SEO content analysis rules (similar to Yoast)
export const seoRules = {
  title: {
    minLength: 30,
    maxLength: 60,
    requiredWords: ['vibelux', 'greenhouse', 'farming', 'CEA', 'cultivation']
  },
  description: {
    minLength: 120,
    maxLength: 160,
    requiredElements: ['call-to-action', 'unique-value']
  },
  content: {
    minWordCount: 300,
    maxWordCount: 2000,
    readabilityScore: 60, // Flesch Reading Ease
    keywordDensity: {
      min: 0.5,
      max: 2.5
    }
  },
  images: {
    requireAltText: true,
    maxFileSize: 200000, // 200KB
    recommendedDimensions: {
      openGraph: { width: 1200, height: 630 },
      twitter: { width: 1200, height: 600 }
    }
  }
};