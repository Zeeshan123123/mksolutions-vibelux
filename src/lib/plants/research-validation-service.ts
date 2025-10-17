/**
 * Research Validation Service
 * Ensures all plant recommendations are backed by peer-reviewed research
 */

import { RESEARCH_BACKED_CROPS, isRecommendationValid } from './research-backed-crop-data';
import { ADVANCED_CROP_DATABASE } from './advanced-plant-system';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  citations: Array<{
    metric: string;
    source: string;
    year: number;
  }>;
}

export function validatePlantConfiguration(
  cropId: string,
  configuration: {
    ppfd?: number;
    dli?: number;
    photoperiod?: number;
    temperature?: number;
    humidity?: number;
    co2?: number;
    height?: number;
    spacing?: number;
  }
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    suggestions: [],
    citations: []
  };

  const researchData = RESEARCH_BACKED_CROPS[cropId];
  if (!researchData) {
    result.warnings.push('No research data available for validation. Recommendations are based on general best practices.');
    return result;
  }

  // Validate PPFD
  if (configuration.ppfd !== undefined) {
    const validation = isRecommendationValid(cropId, 'ppfd', configuration.ppfd);
    if (!validation.valid) {
      result.warnings.push(validation.reason || 'PPFD outside research range');
      result.isValid = false;
    }
    if (validation.citation) {
      result.citations.push({
        metric: 'PPFD',
        source: validation.citation.authors,
        year: validation.citation.year
      });
    }
    
    // Add suggestion if close to limits
    const ppfdData = researchData.lightingData.ppfd;
    if (configuration.ppfd < ppfdData.optimal * 0.9) {
      result.suggestions.push(`Consider increasing PPFD to ${ppfdData.optimal} μmol/m²/s for optimal growth`);
    }
  }

  // Validate DLI
  if (configuration.dli !== undefined) {
    const validation = isRecommendationValid(cropId, 'dli', configuration.dli);
    if (!validation.valid) {
      result.warnings.push(validation.reason || 'DLI outside research range');
      result.isValid = false;
    }
  }

  // Validate Temperature
  if (configuration.temperature !== undefined) {
    const tempRange = researchData.environmentalData.temperature.day;
    if (configuration.temperature < tempRange[0] || configuration.temperature > tempRange[1]) {
      result.warnings.push(
        `Temperature ${configuration.temperature}°F is outside optimal range (${tempRange[0]}-${tempRange[1]}°F)`
      );
      result.citations.push({
        metric: 'Temperature',
        source: researchData.environmentalData.temperature.citation.authors,
        year: researchData.environmentalData.temperature.citation.year
      });
    }
  }

  // Validate Humidity
  if (configuration.humidity !== undefined) {
    const humidityRange = researchData.environmentalData.humidity.range;
    if (configuration.humidity < humidityRange[0] || configuration.humidity > humidityRange[1]) {
      result.warnings.push(
        `Humidity ${configuration.humidity}% is outside optimal range (${humidityRange[0]}-${humidityRange[1]}%)`
      );
    }
  }

  // Validate CO2
  if (configuration.co2 !== undefined && researchData.environmentalData.co2) {
    if (configuration.co2 < researchData.environmentalData.co2.ambient) {
      result.warnings.push('CO2 levels below ambient (400 ppm) may limit growth');
    } else if (configuration.co2 > researchData.environmentalData.co2.enriched * 1.2) {
      result.warnings.push(
        `CO2 levels above ${researchData.environmentalData.co2.enriched} ppm show diminishing returns`
      );
    }
  }

  // Validate Plant Height
  if (configuration.height !== undefined) {
    const heightData = researchData.growthData.height;
    const heightInInches = configuration.height * 12; // Convert feet to inches
    
    if (heightInInches > heightData.mature * 1.2) {
      result.warnings.push(
        `Height (${configuration.height}ft) exceeds typical mature height (${heightData.mature}${heightData.unit})`
      );
    }
  }

  // Validate Spacing
  if (configuration.spacing !== undefined) {
    const spacingData = researchData.growthData.spacing;
    const spacingInInches = configuration.spacing * 12; // Convert feet to inches
    
    if (spacingInInches < spacingData.optimal * 0.8) {
      result.warnings.push(
        `Spacing too tight. Research recommends ${spacingData.optimal}${spacingData.unit} for optimal yield`
      );
      result.citations.push({
        metric: 'Spacing',
        source: spacingData.citation.authors,
        year: spacingData.citation.year
      });
    }
  }

  return result;
}

// Generate research-backed recommendations
export function generateResearchBackedRecommendations(cropId: string): string[] {
  const recommendations: string[] = [];
  const researchData = RESEARCH_BACKED_CROPS[cropId];
  
  if (!researchData) {
    return ['No specific research data available. Using general horticultural best practices.'];
  }

  // Lighting recommendations
  recommendations.push(
    `Lighting: ${researchData.lightingData.ppfd.optimal} μmol/m²/s PPFD for ${researchData.lightingData.photoperiod.hours}h/day ` +
    `(${researchData.lightingData.dli.optimal} DLI) - ${researchData.lightingData.ppfd.citation.authors}, ${researchData.lightingData.ppfd.citation.year}`
  );

  // Environmental recommendations
  recommendations.push(
    `Temperature: ${researchData.environmentalData.temperature.day[0]}-${researchData.environmentalData.temperature.day[1]}°F day, ` +
    `${researchData.environmentalData.temperature.night[0]}-${researchData.environmentalData.temperature.night[1]}°F night`
  );

  recommendations.push(
    `Humidity: ${researchData.environmentalData.humidity.range[0]}-${researchData.environmentalData.humidity.range[1]}% RH`
  );

  // CO2 if available
  if (researchData.environmentalData.co2) {
    recommendations.push(
      `CO₂: Enrichment to ${researchData.environmentalData.co2.enriched} ppm increases yield by 20-30%`
    );
  }

  // Spacing recommendations
  recommendations.push(
    `Spacing: ${researchData.growthData.spacing.optimal}${researchData.growthData.spacing.unit} ` +
    `(${researchData.growthData.spacing.plantsPerSqMeter} plants/m²)`
  );

  // Spectrum if available
  if (researchData.lightingData.spectrum) {
    recommendations.push(
      `Spectrum: Red:Blue ratio ${researchData.lightingData.spectrum.redBlueRatio}` +
      (researchData.lightingData.spectrum.farRed ? ', Far-red beneficial' : '')
    );
  }

  return recommendations;
}

// Check if a crop has research backing
export function hasResearchBacking(cropId: string): boolean {
  return !!RESEARCH_BACKED_CROPS[cropId];
}

// Get confidence level based on available research
export function getResearchConfidenceLevel(cropId: string): 'high' | 'medium' | 'low' | 'none' {
  const researchData = RESEARCH_BACKED_CROPS[cropId];
  if (!researchData) return 'none';

  // Count available citations
  let citationCount = 0;
  if (researchData.lightingData.ppfd.citation) citationCount++;
  if (researchData.lightingData.dli.citation) citationCount++;
  if (researchData.lightingData.photoperiod.citation) citationCount++;
  if (researchData.lightingData.spectrum?.citation) citationCount++;
  if (researchData.environmentalData.temperature.citation) citationCount++;
  if (researchData.environmentalData.humidity.citation) citationCount++;
  if (researchData.environmentalData.co2?.citation) citationCount++;
  if (researchData.growthData.height.citation) citationCount++;
  if (researchData.growthData.spacing.citation) citationCount++;

  if (citationCount >= 7) return 'high';
  if (citationCount >= 4) return 'medium';
  return 'low';
}