import { logger } from '@/lib/logging/production-logger';
// Amazon Affiliate Integration for VibeLux
// Affiliate ID: whaisurbfar-20

export const AMAZON_AFFILIATE_ID = 'whaisurbfar-20';
export const AMAZON_BASE_URL = 'https://www.amazon.com';

interface AmazonProduct {
  asin: string;
  title: string;
  price?: number;
  image?: string;
  category?: string;
  features?: string[];
}

// Generate Amazon affiliate link
export function generateAffiliateLink(asin: string): string {
  return `${AMAZON_BASE_URL}/dp/${asin}?tag=${AMAZON_AFFILIATE_ID}`;
}

// Generate search link with affiliate tag
export function generateSearchLink(query: string): string {
  const encodedQuery = encodeURIComponent(query);
  return `${AMAZON_BASE_URL}/s?k=${encodedQuery}&tag=${AMAZON_AFFILIATE_ID}`;
}

// Popular grow equipment ASINs (to be expanded)
export const FEATURED_PRODUCTS = {
  lights: [
    {
      asin: 'B07VL8FZS1',
      title: 'Spider Farmer SF-2000 LED Grow Light',
      category: 'LED Grow Lights',
      price: 299.99,
      features: ['Samsung LM301B LEDs', '200W', '2.7 μmol/J']
    },
    {
      asin: 'B08JCQ3K5Q',
      title: 'MARS HYDRO TS 3000W LED Grow Light',
      category: 'LED Grow Lights',
      price: 449.99,
      features: ['450W', 'Full Spectrum', 'Daisy Chain']
    },
    {
      asin: 'B07QFPBQDR',
      title: 'VIVOSUN VS1000 LED Grow Light',
      category: 'LED Grow Lights',
      price: 139.99,
      features: ['Samsung LEDs', 'Dimmable', '100W']
    }
  ],
  
  controllers: [
    {
      asin: 'B07JB75J7K',
      title: 'Inkbird WiFi Temperature Controller',
      category: 'Environmental Controllers',
      price: 69.99,
      features: ['WiFi Control', 'Dual Outlets', 'App Control']
    },
    {
      asin: 'B08LKJPR5D',
      title: 'AC Infinity Controller 69',
      category: 'Environmental Controllers',
      price: 149.99,
      features: ['Smart Controls', 'VPD', 'Data Logging']
    }
  ],
  
  nutrients: [
    {
      asin: 'B017H73708',
      title: 'General Hydroponics Flora Series',
      category: 'Nutrients',
      price: 47.95,
      features: ['3-Part System', 'pH Balanced', 'Complete Nutrition']
    },
    {
      asin: 'B00NQANQAC',
      title: 'Fox Farm Liquid Nutrient Trio',
      category: 'Nutrients',
      price: 49.95,
      features: ['Organic Based', 'Soil Formula', '3 Bottles']
    }
  ],
  
  meters: [
    {
      asin: 'B07JQ8JY8Q',
      title: 'Apogee MQ-500 PAR Meter',
      category: 'Meters & Sensors',
      price: 595.00,
      features: ['Full Spectrum', 'USB Output', 'Lab Grade']
    },
    {
      asin: 'B07SYVMYKX',
      title: 'Dr.meter LX1330B Light Meter',
      category: 'Meters & Sensors',
      price: 29.99,
      features: ['0-200,000 Lux', 'Digital', 'Data Hold']
    }
  ],
  
  tents: [
    {
      asin: 'B06ZXWN3BG',
      title: 'VIVOSUN 4x4 Grow Tent',
      category: 'Grow Tents',
      price: 139.99,
      features: ['48"x48"x80"', '600D Canvas', 'Observation Window']
    },
    {
      asin: 'B07CRRWJ1B',
      title: 'Spider Farmer 4x4 Grow Tent',
      category: 'Grow Tents',
      price: 169.99,
      features: ['1680D Canvas', 'Heavy Duty Zippers', 'Metal Frame']
    }
  ]
};

// Equipment categories for search
export const EQUIPMENT_CATEGORIES = {
  lighting: {
    name: 'Grow Lights',
    searchTerms: ['LED grow light', 'HPS grow light', 'CMH grow light', 'quantum board'],
    icon: '💡'
  },
  environmental: {
    name: 'Environmental Control',
    searchTerms: ['humidity controller', 'temperature controller', 'CO2 controller', 'VPD controller'],
    icon: '🌡️'
  },
  ventilation: {
    name: 'Ventilation',
    searchTerms: ['inline fan', 'carbon filter', 'exhaust fan', 'circulation fan'],
    icon: '💨'
  },
  monitoring: {
    name: 'Monitoring',
    searchTerms: ['PAR meter', 'pH meter', 'EC meter', 'thermal camera'],
    icon: '📊'
  },
  irrigation: {
    name: 'Irrigation',
    searchTerms: ['drip irrigation', 'water pump', 'timer', 'hydroponic system'],
    icon: '💧'
  },
  growing: {
    name: 'Growing Supplies',
    searchTerms: ['grow tent', 'grow medium', 'pots', 'trays', 'nutrients'],
    icon: '🌱'
  }
};

// Track affiliate clicks for analytics
export async function trackAffiliateClick(
  productAsin: string,
  userId?: string,
  context?: string
) {
  try {
    await fetch('/api/analytics/affiliate-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productAsin,
        userId,
        context,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    logger.error('api', 'Failed to track affiliate click:', error );
  }
}

// Get recommended products based on user's setup
export function getRecommendedProducts(userProfile: {
  facilitySize?: number;
  growType?: 'indoor' | 'greenhouse';
  experience?: 'beginner' | 'intermediate' | 'advanced';
  crops?: string[];
}): AmazonProduct[] {
  const recommendations: AmazonProduct[] = [];
  
  // Light recommendations based on facility size
  if (userProfile.facilitySize) {
    const sqft = userProfile.facilitySize;
    if (sqft <= 16) {
      recommendations.push(FEATURED_PRODUCTS.lights[2]); // VS1000 for small spaces
    } else if (sqft <= 25) {
      recommendations.push(FEATURED_PRODUCTS.lights[0]); // SF-2000 for medium
    } else {
      recommendations.push(FEATURED_PRODUCTS.lights[1]); // TS 3000W for large
    }
  }
  
  // Controller recommendations
  if (userProfile.experience === 'advanced') {
    recommendations.push(FEATURED_PRODUCTS.controllers[1]); // AC Infinity
  } else {
    recommendations.push(FEATURED_PRODUCTS.controllers[0]); // Inkbird
  }
  
  // Always recommend meters for professionals
  if (userProfile.experience !== 'beginner') {
    recommendations.push(FEATURED_PRODUCTS.meters[0]); // Apogee PAR meter
  }
  
  return recommendations;
}

// Generate equipment comparison with affiliate links
export function generateEquipmentComparison(
  calculatedRequirement: any,
  category: string
): Array<{
  product: AmazonProduct;
  matchScore: number;
  affiliateLink: string;
  recommendation: string;
}> {
  let relevantProducts: AmazonProduct[] = [];
  
  switch (category) {
    case 'lighting':
      relevantProducts = FEATURED_PRODUCTS.lights;
      break;
    case 'environmental':
      relevantProducts = FEATURED_PRODUCTS.controllers;
      break;
    case 'nutrients':
      relevantProducts = FEATURED_PRODUCTS.nutrients;
      break;
    default:
      relevantProducts = [];
  }
  
  return relevantProducts.map(product => {
    // Calculate match score based on requirements
    let matchScore = 0;
    let recommendation = '';
    
    if (category === 'lighting' && calculatedRequirement.wattage) {
      const productWattage = parseInt(product.features?.find(f => f.includes('W'))?.replace(/\D/g, '') || '0');
      const requiredWattage = calculatedRequirement.wattage;
      
      if (Math.abs(productWattage - requiredWattage) < 50) {
        matchScore = 90;
        recommendation = 'Excellent match for your space';
      } else if (productWattage > requiredWattage) {
        matchScore = 70;
        recommendation = 'More powerful than needed (can dim down)';
      } else {
        matchScore = 50;
        recommendation = 'May need multiple units';
      }
    }
    
    return {
      product,
      matchScore,
      affiliateLink: generateAffiliateLink(product.asin),
      recommendation
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}