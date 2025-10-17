/**
 * Shared Plant Research Types
 * Extracted to break circular dependencies
 */

export interface ResearchCitation {
  authors: string[];
  title: string;
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  studyType: 'peer-reviewed' | 'conference' | 'thesis' | 'report' | 'industry';
  confidence: 'high' | 'medium' | 'low';
}

export interface ResearchBackedCropData {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  growthType: 'annual' | 'perennial' | 'biennial';
  cultivars: string[];
  optimumConditions: {
    temperature: {
      min: number;
      max: number;
      optimal: number;
      citations: ResearchCitation[];
    };
    humidity: {
      min: number;
      max: number;
      optimal: number;
      citations: ResearchCitation[];
    };
    light: {
      ppfd: {
        min: number;
        max: number;
        optimal: number;
      };
      dli: {
        min: number;
        max: number;
        optimal: number;
      };
      photoperiod: {
        vegetative: number;
        flowering?: number;
      };
      citations: ResearchCitation[];
    };
    nutrition: {
      ph: {
        min: number;
        max: number;
        optimal: number;
      };
      ec: {
        min: number;
        max: number;
        optimal: number;
      };
      citations: ResearchCitation[];
    };
  };
  research: {
    yieldTrials: ResearchCitation[];
    nutritionStudies: ResearchCitation[];
    environmentalOptimization: ResearchCitation[];
    postHarvestHandling: ResearchCitation[];
  };
}