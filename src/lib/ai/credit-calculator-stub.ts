// VibeLux AI Design Credit Calculator - FUNCTIONAL VERSION

export interface DesignComplexity {
  componentCount: number;
  linesOfCode?: number;
  fileCount?: number;
  databaseTables?: number;
  apiEndpoints?: number;
  realtimeFeatures: boolean;
  thirdPartyIntegrations: number;
  customCalculations: boolean;
  visualizationComplexity: 'simple' | 'moderate' | 'complex';
  hardwareIntegration: boolean;
}

export interface CreditCalculation {
  baseCredits: number;
  complexityMultiplier: number;
  totalCredits: number;
  breakdown: {
    category: string;
    credits: number;
    reason: string;
  }[];
  tier: 'basic' | 'standard' | 'advanced' | 'enterprise';
}

export class AIDesignCreditCalculator {
  
  analyzePrompt(prompt: string): DesignComplexity {
    const words = prompt.toLowerCase().split(' ');
    
    // Analyze for different complexity indicators
    const componentIndicators = ['fixture', 'sensor', 'hvac', 'light', 'pump', 'valve', 'fan'];
    const realtimeIndicators = ['monitor', 'real-time', 'live', 'continuous', 'automatic'];
    const integrationIndicators = ['api', 'integration', 'connect', 'sync', 'dashboard'];
    const calculationIndicators = ['calculate', 'optimize', 'algorithm', 'formula', 'analysis'];
    const visualizationIndicators = ['3d', 'chart', 'graph', 'visualization', 'render', 'model'];
    const hardwareIndicators = ['iot', 'sensor', 'controller', 'device', 'hardware', 'plc'];
    
    // Count complexity factors
    const componentCount = this.countMatches(words, componentIndicators) * 3 + 5; // Base of 5 components
    const realtimeFeatures = this.hasMatches(words, realtimeIndicators);
    const thirdPartyIntegrations = this.countMatches(words, integrationIndicators);
    const customCalculations = this.hasMatches(words, calculationIndicators);
    const hardwareIntegration = this.hasMatches(words, hardwareIndicators);
    
    // Determine visualization complexity
    let visualizationComplexity: 'simple' | 'moderate' | 'complex' = 'simple';
    const vizCount = this.countMatches(words, visualizationIndicators);
    if (vizCount > 3) visualizationComplexity = 'complex';
    else if (vizCount > 1) visualizationComplexity = 'moderate';
    
    return {
      componentCount,
      realtimeFeatures,
      thirdPartyIntegrations,
      customCalculations,
      visualizationComplexity,
      hardwareIntegration
    };
  }
  
  calculateCredits(complexity: DesignComplexity): CreditCalculation {
    const breakdown: CreditCalculation['breakdown'] = [];
    let totalCredits = 0;
    
    // Base credits
    const baseCredits = 5;
    totalCredits += baseCredits;
    breakdown.push({
      category: 'Base Design',
      credits: baseCredits,
      reason: 'Basic facility layout'
    });
    
    // Component complexity
    const componentCredits = Math.max(0, complexity.componentCount - 5) * 2;
    if (componentCredits > 0) {
      totalCredits += componentCredits;
      breakdown.push({
        category: 'Component Complexity',
        credits: componentCredits,
        reason: `${complexity.componentCount} components detected`
      });
    }
    
    // Real-time features
    if (complexity.realtimeFeatures) {
      const realtimeCredits = 8;
      totalCredits += realtimeCredits;
      breakdown.push({
        category: 'Real-time Monitoring',
        credits: realtimeCredits,
        reason: 'Live monitoring and control systems'
      });
    }
    
    // Third-party integrations
    if (complexity.thirdPartyIntegrations > 0) {
      const integrationCredits = complexity.thirdPartyIntegrations * 5;
      totalCredits += integrationCredits;
      breakdown.push({
        category: 'System Integration',
        credits: integrationCredits,
        reason: `${complexity.thirdPartyIntegrations} integration points`
      });
    }
    
    // Custom calculations
    if (complexity.customCalculations) {
      const calcCredits = 6;
      totalCredits += calcCredits;
      breakdown.push({
        category: 'Custom Calculations',
        credits: calcCredits,
        reason: 'Advanced calculation algorithms'
      });
    }
    
    // Visualization complexity
    const vizCredits = complexity.visualizationComplexity === 'complex' ? 12 :
                      complexity.visualizationComplexity === 'moderate' ? 6 : 0;
    if (vizCredits > 0) {
      totalCredits += vizCredits;
      breakdown.push({
        category: 'Visualization',
        credits: vizCredits,
        reason: `${complexity.visualizationComplexity} visualization required`
      });
    }
    
    // Hardware integration
    if (complexity.hardwareIntegration) {
      const hardwareCredits = 10;
      totalCredits += hardwareCredits;
      breakdown.push({
        category: 'Hardware Integration',
        credits: hardwareCredits,
        reason: 'IoT device connectivity and control'
      });
    }
    
    // Determine tier
    let tier: CreditCalculation['tier'] = 'basic';
    if (totalCredits > 40) tier = 'enterprise';
    else if (totalCredits > 25) tier = 'advanced';
    else if (totalCredits > 15) tier = 'standard';
    
    return {
      baseCredits,
      complexityMultiplier: totalCredits / baseCredits,
      totalCredits,
      breakdown,
      tier
    };
  }
  
  estimateTimeSaved(complexity: DesignComplexity): { hoursSaved: number; costSaved: number } {
    const baseHours = 8; // Minimum time saved
    const componentHours = complexity.componentCount * 0.5;
    const featureHours = (complexity.realtimeFeatures ? 12 : 0) +
                        (complexity.customCalculations ? 8 : 0) +
                        (complexity.hardwareIntegration ? 16 : 0) +
                        (complexity.visualizationComplexity === 'complex' ? 20 :
                         complexity.visualizationComplexity === 'moderate' ? 10 : 0);
    
    const totalHours = Math.round(baseHours + componentHours + featureHours);
    const hourlyRate = 125; // Professional engineering rate
    const costSaved = totalHours * hourlyRate;
    
    return {
      hoursSaved: totalHours,
      costSaved
    };
  }
  
  getExamplePrompts() {
    return [
      {
        category: 'Basic Greenhouse',
        description: 'Simple monitoring setup',
        prompt: 'Create a basic greenhouse monitoring system with temperature and humidity sensors',
        credits: 8
      },
      {
        category: 'Advanced Hydroponic',
        description: 'Complete automation system',
        prompt: 'Design a fully automated hydroponic system with nutrient monitoring, pH control, and growth optimization',
        credits: 25
      },
      {
        category: 'Vertical Farm',
        description: 'Multi-tier LED system',
        prompt: 'Build a 4-tier vertical farming system with LED lighting, climate control, and harvest tracking',
        credits: 35
      },
      {
        category: 'Research Facility',
        description: 'Advanced experimental setup',
        prompt: 'Create a controlled environment research facility with spectral analysis, CO2 enrichment, and data logging',
        credits: 45
      }
    ];
  }
  
  private countMatches(words: string[], indicators: string[]): number {
    return words.filter(word => 
      indicators.some(indicator => word.includes(indicator))
    ).length;
  }
  
  private hasMatches(words: string[], indicators: string[]): boolean {
    return words.some(word => 
      indicators.some(indicator => word.includes(indicator))
    );
  }
}

export const creditPackages = [
  {
    name: "Starter",
    credits: 100,
    price: 29,
    bestFor: "Small greenhouses, basic monitoring"
  },
  {
    name: "Professional", 
    credits: 500,
    price: 99,
    bestFor: "Commercial operations, multiple systems"
  },
  {
    name: "Enterprise",
    credits: 2000,
    price: 299,
    bestFor: "Large facilities, custom solutions"
  }
];

export const greenhousePromptTemplates = [];