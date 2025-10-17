/**
 * Fixture Search Engine with AI-Powered Recommendations
 * Searches and recommends grow light fixtures based on facility requirements
 */

import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';

interface SearchQuery {
  query?: string;
  minWattage?: number;
  maxWattage?: number;
  minPPF?: number;
  maxPPF?: number;
  brand?: string;
  efficiency?: number; // μmol/J
  priceRange?: {
    min: number;
    max: number;
  };
  features?: string[];
  sortBy?: 'relevance' | 'price' | 'efficiency' | 'ppf' | 'wattage';
  limit?: number;
  offset?: number;
}

interface Fixture {
  id: string;
  brand: string;
  model: string;
  wattage: number;
  ppf: number;
  efficiency: number;
  spectrum: string;
  price: number;
  features: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  coverage: {
    flowering: number; // sq ft
    vegetative: number; // sq ft
  };
  certifications: string[];
  warranty: number; // years
  score?: number; // Search relevance score
}

interface RecommendationParams {
  facilityType: 'greenhouse' | 'indoor' | 'vertical_farm';
  growArea: number; // sq ft
  cropType: string;
  budget?: number;
  targetPPFD: number;
  photoperiod: number;
  environmentControl: 'basic' | 'advanced' | 'precision';
  energyCost: number; // $/kWh
  priorities: ('efficiency' | 'yield' | 'cost' | 'reliability')[];
}

interface Recommendation {
  fixture: Fixture;
  quantity: number;
  reasoning: string;
  metrics: {
    totalWattage: number;
    totalPPF: number;
    avgPPFD: number;
    coverageRatio: number;
    totalCost: number;
    yearlyEnergyCost: number;
    paybackPeriod: number;
  };
}

// Mock fixture database for demonstration
const mockFixtures = [
  {
    id: '1', brand: 'HLG', model: 'HLG-550 V2', wattage: 480, ppf: 1212, efficiency: 2.525,
    spectrum: 'Full spectrum 3000K + 660nm', price: 699, 
    features: ['full-spectrum', 'high-efficiency', 'supplemental', 'dimming', '0-10V'],
    dimensions: { length: 22, width: 20, height: 3 },
    coverage: { flowering: 36, vegetative: 49 },
    certifications: ['UL', 'DLC'], warranty: 3,
    manufacturer: { name: 'Horticulture Lighting Group' },
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }]
  },
  {
    id: '2', brand: 'Fluence', model: 'SPYDR 2p', wattage: 685, ppf: 1700, efficiency: 2.48,
    spectrum: 'Full spectrum white + red', price: 1299,
    features: ['full-spectrum', 'commercial-grade', 'high-ppf', 'dimming', '0-10V'],
    dimensions: { length: 46, width: 46, height: 4 },
    coverage: { flowering: 64, vegetative: 100 },
    certifications: ['UL', 'DLC', 'IP65'], warranty: 5,
    manufacturer: { name: 'Fluence Bioengineering' },
    reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 5 }]
  },
  {
    id: '3', brand: 'Mars Hydro', model: 'FC-E3000', wattage: 300, ppf: 780, efficiency: 2.6,
    spectrum: 'Samsung LM301B + Osram 660nm', price: 199,
    features: ['full-spectrum', 'budget-friendly', 'dimming'],
    dimensions: { length: 17, width: 17, height: 2 },
    coverage: { flowering: 16, vegetative: 25 },
    certifications: ['UL'], warranty: 2,
    manufacturer: { name: 'Mars Hydro' },
    reviews: [{ rating: 4 }, { rating: 4 }, { rating: 3 }]
  },
  {
    id: '4', brand: 'Spider Farmer', model: 'SF-4000', wattage: 450, ppf: 1212, efficiency: 2.69,
    spectrum: 'Samsung LM301H + 660nm', price: 399,
    features: ['full-spectrum', 'high-efficiency', 'dimming'],
    dimensions: { length: 24, width: 24, height: 3 },
    coverage: { flowering: 36, vegetative: 49 },
    certifications: ['UL'], warranty: 3,
    manufacturer: { name: 'Spider Farmer' },
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }]
  },
  {
    id: '5', brand: 'Gavita', model: 'Pro 1700e LED', wattage: 645, ppf: 1700, efficiency: 2.64,
    spectrum: 'Full spectrum 2700K', price: 899,
    features: ['full-spectrum', 'commercial-grade', 'passive-cooling'],
    dimensions: { length: 43, width: 20, height: 4 },
    coverage: { flowering: 49, vegetative: 64 },
    certifications: ['UL', 'DLC'], warranty: 5,
    manufacturer: { name: 'Gavita' },
    reviews: [{ rating: 5 }, { rating: 5 }]
  }
];

export class FixtureSearchEngine {
  private readonly cachePrefix = 'fixture:search:';
  private readonly cacheTTL = 3600; // 1 hour

  /**
   * Search fixtures based on query parameters
   */
  async search(query: SearchQuery): Promise<{
    results: Fixture[];
    total: number;
    facets?: Record<string, Record<string, number>>;
  }> {
    try {
      const cacheKey = `${this.cachePrefix}${JSON.stringify(query)}`;
      
      // Check cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }


      // Execute search with mock data
      let fixtures = [...mockFixtures];

      // Apply filters
      if (query.query) {
        const searchTerm = query.query.toLowerCase();
        fixtures = fixtures.filter(f =>
          f.brand.toLowerCase().includes(searchTerm) ||
          f.model.toLowerCase().includes(searchTerm) ||
          f.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
      }

      if (query.minWattage) {
        fixtures = fixtures.filter(f => f.wattage >= query.minWattage!);
      }
      if (query.maxWattage) {
        fixtures = fixtures.filter(f => f.wattage <= query.maxWattage!);
      }
      if (query.minPPF) {
        fixtures = fixtures.filter(f => f.ppf >= query.minPPF!);
      }
      if (query.maxPPF) {
        fixtures = fixtures.filter(f => f.ppf <= query.maxPPF!);
      }
      if (query.brand) {
        fixtures = fixtures.filter(f => f.brand === query.brand);
      }
      if (query.efficiency) {
        fixtures = fixtures.filter(f => f.efficiency >= query.efficiency!);
      }
      if (query.priceRange) {
        fixtures = fixtures.filter(f =>
          f.price >= query.priceRange!.min && f.price <= query.priceRange!.max
        );
      }
      if (query.features && query.features.length > 0) {
        fixtures = fixtures.filter(f =>
          query.features!.some(feature => f.features.includes(feature))
        );
      }

      // Apply sorting
      fixtures.sort((a, b) => {
        switch (query.sortBy) {
          case 'price':
            return a.price - b.price;
          case 'efficiency':
            return b.efficiency - a.efficiency;
          case 'ppf':
            return b.ppf - a.ppf;
          case 'wattage':
            return a.wattage - b.wattage;
          default:
            return 0;
        }
      });

      // Apply pagination
      const total = fixtures.length;
      const offset = query.offset || 0;
      const limit = query.limit || 20;
      fixtures = fixtures.slice(offset, offset + limit);

      // Calculate scores and format results
      const results = fixtures.map(fixture => {
        const avgRating = fixture.reviews.length > 0
          ? fixture.reviews.reduce((sum, r) => sum + r.rating, 0) / fixture.reviews.length
          : 0;

        return {
          id: fixture.id,
          brand: fixture.brand,
          model: fixture.model,
          wattage: fixture.wattage,
          ppf: fixture.ppf,
          efficiency: fixture.efficiency,
          spectrum: fixture.spectrum,
          price: fixture.price,
          features: fixture.features,
          dimensions: fixture.dimensions,
          coverage: fixture.coverage,
          certifications: fixture.certifications,
          warranty: fixture.warranty,
          score: this.calculateRelevanceScore(fixture, query, avgRating)
        };
      });

      // Sort by relevance if no specific sort
      if (!query.sortBy || query.sortBy === 'relevance') {
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      // Generate facets for filtering
      const facets = this.generateFacets();

      const response = {
        results,
        total,
        facets
      };

      // Cache results
      await redis.setex(cacheKey, this.cacheTTL, JSON.stringify(response));

      logger.info('api', 'Fixture search completed', {
        query: query.query,
        resultCount: results.length,
        total
      });

      return response;
    } catch (error) {
      logger.error('api', 'Fixture search failed:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered fixture recommendations
   */
  async getRecommendations(params: RecommendationParams): Promise<{
    recommendations: Recommendation[];
    reasoning: string;
    alternativeOptions?: Recommendation[];
  }> {
    try {
      logger.info('api', 'Generating fixture recommendations', params);

      // Calculate requirements
      const targetDLI = (params.targetPPFD * params.photoperiod * 3600) / 1000000;
      const requiredPPF = params.growArea * params.targetPPFD * 4.5; // Approximation
      
      // Search for suitable fixtures
      const fixtures = await this.search({
        minPPF: params.priorities.includes('efficiency') ? 800 : 500,
        sortBy: 'efficiency',
        limit: 50
      });

      // Score and rank fixtures
      const scoredFixtures = fixtures.results.map(fixture => {
        const score = this.scoreFixtureForFacility(fixture, params);
        return { fixture, score };
      });

      // Sort by score
      scoredFixtures.sort((a, b) => b.score - a.score);

      // Generate recommendations
      const recommendations: Recommendation[] = [];
      
      for (const { fixture } of scoredFixtures.slice(0, 5)) {
        const quantity = Math.ceil(requiredPPF / fixture.ppf);
        const totalWattage = quantity * fixture.wattage;
        const totalPPF = quantity * fixture.ppf;
        const avgPPFD = totalPPF / (params.growArea * 4.5);
        const coverageRatio = (quantity * fixture.coverage.flowering) / params.growArea;
        const totalCost = quantity * fixture.price;
        const yearlyEnergyCost = totalWattage * params.photoperiod * 365 * params.energyCost / 1000;
        
        // Calculate simple payback vs HPS
        const hpsWattage = requiredPPF / 1.7; // HPS efficiency ~1.7 μmol/J
        const hpsYearlyCost = hpsWattage * params.photoperiod * 365 * params.energyCost / 1000;
        const yearlySavings = hpsYearlyCost - yearlyEnergyCost;
        const paybackPeriod = yearlySavings > 0 ? totalCost / yearlySavings : 999;

        recommendations.push({
          fixture,
          quantity,
          reasoning: this.generateRecommendationReasoning(fixture, params, {
            quantity,
            avgPPFD,
            coverageRatio,
            paybackPeriod
          }),
          metrics: {
            totalWattage,
            totalPPF,
            avgPPFD,
            coverageRatio,
            totalCost,
            yearlyEnergyCost,
            paybackPeriod
          }
        });
      }

      // Generate overall reasoning
      const reasoning = this.generateOverallReasoning(params, recommendations);

      // Find alternative budget options if needed
      let alternativeOptions;
      if (params.budget && recommendations[0]?.metrics.totalCost > params.budget) {
        alternativeOptions = await this.findBudgetAlternatives(params, fixtures.results);
      }

      return {
        recommendations: recommendations.slice(0, 3),
        reasoning,
        alternativeOptions
      };
    } catch (error) {
      logger.error('api', 'Failed to generate recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(
    fixture: any,
    query: SearchQuery,
    avgRating: number
  ): number {
    let score = 0;

    // Text match score
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      if (fixture.brand.toLowerCase().includes(searchTerm)) score += 30;
      if (fixture.model.toLowerCase().includes(searchTerm)) score += 20;
      if (fixture.features.some((f: string) => f.toLowerCase().includes(searchTerm))) score += 10;
    }

    // Efficiency score (important for commercial growers)
    score += (fixture.ppf / fixture.wattage) * 10;

    // Rating score
    score += avgRating * 5;

    // Certification bonus
    if (fixture.certifications.includes('DLC')) score += 15;
    if (fixture.certifications.includes('UL')) score += 10;

    // Feature match score
    if (query.features) {
      const matchedFeatures = query.features.filter(f => 
        fixture.features.includes(f)
      );
      score += matchedFeatures.length * 5;
    }

    return score;
  }

  /**
   * Score fixture for specific facility requirements
   */
  private scoreFixtureForFacility(
    fixture: Fixture,
    params: RecommendationParams
  ): number {
    let score = 0;

    // Efficiency priority
    if (params.priorities.includes('efficiency')) {
      score += fixture.efficiency * 30;
    }

    // Cost priority
    if (params.priorities.includes('cost')) {
      const pricePerPPF = fixture.price / fixture.ppf;
      score += (1 / pricePerPPF) * 20;
    }

    // Yield priority (higher PPF)
    if (params.priorities.includes('yield')) {
      score += (fixture.ppf / 1000) * 25;
    }

    // Reliability priority (warranty & certifications)
    if (params.priorities.includes('reliability')) {
      score += fixture.warranty * 5;
      score += fixture.certifications.length * 10;
    }

    // Facility type matching
    switch (params.facilityType) {
      case 'greenhouse':
        if (fixture.features.includes('supplemental')) score += 20;
        if (fixture.features.includes('high-efficiency')) score += 15;
        break;
      case 'vertical_farm':
        if (fixture.features.includes('low-profile')) score += 20;
        if (fixture.features.includes('liquid-cooled')) score += 15;
        break;
      case 'indoor':
        if (fixture.features.includes('full-spectrum')) score += 15;
        if (fixture.features.includes('dimming')) score += 10;
        break;
    }

    // Environmental control compatibility
    if (params.environmentControl === 'precision' && fixture.features.includes('0-10V')) {
      score += 15;
    }

    return score;
  }

  /**
   * Generate recommendation reasoning
   */
  private generateRecommendationReasoning(
    fixture: Fixture,
    params: RecommendationParams,
    metrics: any
  ): string {
    const reasons = [];

    // Efficiency reasoning
    if (fixture.efficiency > 2.8) {
      reasons.push(`Exceptional efficiency of ${fixture.efficiency.toFixed(1)} μmol/J reduces operating costs`);
    }

    // Coverage reasoning
    if (metrics.coverageRatio > 0.9 && metrics.coverageRatio < 1.1) {
      reasons.push(`Optimal coverage match for your ${params.growArea} sq ft grow area`);
    }

    // PPFD reasoning
    if (Math.abs(metrics.avgPPFD - params.targetPPFD) < 50) {
      reasons.push(`Delivers target PPFD of ${params.targetPPFD} μmol/m²/s accurately`);
    }

    // Payback reasoning
    if (metrics.paybackPeriod < 2) {
      reasons.push(`Quick payback period of ${metrics.paybackPeriod.toFixed(1)} years through energy savings`);
    }

    // Feature reasoning
    if (params.facilityType === 'greenhouse' && fixture.features.includes('supplemental')) {
      reasons.push('Optimized for supplemental greenhouse lighting');
    }

    return reasons.join('. ') + '.';
  }

  /**
   * Generate overall reasoning for recommendations
   */
  private generateOverallReasoning(
    params: RecommendationParams,
    recommendations: Recommendation[]
  ): string {
    const topRec = recommendations[0];
    
    let reasoning = `Based on your ${params.facilityType} facility with ${params.growArea} sq ft of ${params.cropType} cultivation, `;
    reasoning += `targeting ${params.targetPPFD} μmol/m²/s PPFD for ${params.photoperiod} hours daily, `;
    reasoning += `I recommend ${topRec.quantity} ${topRec.fixture.brand} ${topRec.fixture.model} fixtures. `;
    
    reasoning += `This configuration will provide ${topRec.metrics.avgPPFD.toFixed(0)} μmol/m²/s average PPFD, `;
    reasoning += `consuming ${(topRec.metrics.totalWattage/1000).toFixed(1)} kW total power. `;
    
    reasoning += `With your energy cost of $${params.energyCost}/kWh, `;
    reasoning += `annual operating cost will be $${topRec.metrics.yearlyEnergyCost.toFixed(0)}, `;
    reasoning += `with an estimated payback period of ${topRec.metrics.paybackPeriod.toFixed(1)} years compared to HPS lighting.`;

    return reasoning;
  }

  /**
   * Find budget-friendly alternatives
   */
  private async findBudgetAlternatives(
    params: RecommendationParams,
    fixtures: Fixture[]
  ): Promise<Recommendation[]> {
    // Filter fixtures by budget constraints
    const budgetPerFixture = (params.budget || 0) / Math.ceil(params.growArea / 16); // Assume 16 sq ft per fixture
    
    const budgetFixtures = fixtures
      .filter(f => f.price <= budgetPerFixture)
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);

    return budgetFixtures.map(fixture => {
      const quantity = Math.ceil((params.growArea * params.targetPPFD * 4.5) / fixture.ppf);
      return {
        fixture,
        quantity,
        reasoning: 'Budget-optimized option',
        metrics: {
          totalWattage: quantity * fixture.wattage,
          totalPPF: quantity * fixture.ppf,
          avgPPFD: (quantity * fixture.ppf) / (params.growArea * 4.5),
          coverageRatio: (quantity * fixture.coverage.flowering) / params.growArea,
          totalCost: quantity * fixture.price,
          yearlyEnergyCost: quantity * fixture.wattage * params.photoperiod * 365 * params.energyCost / 1000,
          paybackPeriod: 999
        }
      };
    });
  }

  /**
   * Get sort order for database query
   */
  private getSortOrder(sortBy?: string): any {
    switch (sortBy) {
      case 'price':
        return { price: 'asc' };
      case 'efficiency':
        return { efficiency: 'desc' };
      case 'ppf':
        return { ppf: 'desc' };
      case 'wattage':
        return { wattage: 'asc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  /**
   * Generate facets for search filtering
   */
  private generateFacets(): Record<string, Record<string, number>> {
    try {
      // Count brands
      const brands: Record<string, number> = {};
      mockFixtures.forEach(f => {
        brands[f.brand] = (brands[f.brand] || 0) + 1;
      });

      // Count features
      const featureCounts: Record<string, number> = {};
      mockFixtures.forEach(f => {
        f.features.forEach(feature => {
          featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
      });

      // Count certifications
      const certCounts: Record<string, number> = {};
      mockFixtures.forEach(f => {
        f.certifications.forEach(cert => {
          certCounts[cert] = (certCounts[cert] || 0) + 1;
        });
      });

      return {
        brands,
        features: featureCounts,
        certifications: certCounts
      };
    } catch (error) {
      logger.error('api', 'Failed to generate facets:', error);
      return {};
    }
  }

  /**
   * Get popular fixtures
   */
  async getPopularFixtures(limit: number = 10): Promise<Fixture[]> {
    try {
      // Sort by review count (mock data)
      const sortedFixtures = [...mockFixtures]
        .sort((a, b) => b.reviews.length - a.reviews.length)
        .slice(0, limit);

      return sortedFixtures.map(fixture => ({
        id: fixture.id,
        brand: fixture.brand,
        model: fixture.model,
        wattage: fixture.wattage,
        ppf: fixture.ppf,
        efficiency: fixture.efficiency,
        spectrum: fixture.spectrum,
        price: fixture.price,
        features: fixture.features,
        dimensions: fixture.dimensions,
        coverage: fixture.coverage,
        certifications: fixture.certifications,
        warranty: fixture.warranty
      }));
    } catch (error) {
      logger.error('api', 'Failed to get popular fixtures:', error);
      return [];
    }
  }

  /**
   * Compare multiple fixtures
   */
  async compareFixtures(fixtureIds: string[]): Promise<{
    fixtures: Fixture[];
    comparison: Record<string, any>;
  }> {
    try {
      const fixtures = mockFixtures.filter(f => fixtureIds.includes(f.id));

      const formattedFixtures = fixtures.map(f => ({
        id: f.id,
        brand: f.brand,
        model: f.model,
        wattage: f.wattage,
        ppf: f.ppf,
        efficiency: f.efficiency,
        spectrum: f.spectrum,
        price: f.price,
        features: f.features,
        dimensions: f.dimensions,
        coverage: f.coverage,
        certifications: f.certifications,
        warranty: f.warranty
      }));

      // Generate comparison metrics
      const comparison = {
        efficiency: {
          best: formattedFixtures.reduce((best, f) => 
            f.efficiency > best.efficiency ? f : best
          ),
          values: formattedFixtures.map(f => ({ id: f.id, value: f.efficiency }))
        },
        ppfPerDollar: {
          best: formattedFixtures.reduce((best, f) => 
            (f.ppf / f.price) > (best.ppf / best.price) ? f : best
          ),
          values: formattedFixtures.map(f => ({ id: f.id, value: f.ppf / f.price }))
        },
        coverage: {
          best: formattedFixtures.reduce((best, f) => 
            f.coverage.flowering > best.coverage.flowering ? f : best
          ),
          values: formattedFixtures.map(f => ({ id: f.id, value: f.coverage.flowering }))
        }
      };

      return {
        fixtures: formattedFixtures,
        comparison
      };
    } catch (error) {
      logger.error('api', 'Failed to compare fixtures:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const fixtureSearchEngine = new FixtureSearchEngine();

export default fixtureSearchEngine;