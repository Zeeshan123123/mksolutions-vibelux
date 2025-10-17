/**
 * AI Design Credit Calculator
 * Calculates credit costs for AI-generated greenhouse and lighting designs
 */

export interface DesignComplexity {
  componentCount: number;
  linesOfCode: number;
  fileCount: number;
  databaseTables: number;
  apiEndpoints: number;
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
  private readonly creditRates = {
    // Base rates per unit
    perComponent: 3,
    per100Lines: 2,
    perFile: 2,
    perTable: 5,
    perEndpoint: 4,
    perIntegration: 8,
    
    // Feature multipliers
    realtimeMultiplier: 1.5,
    hardwareMultiplier: 1.8,
    customCalculationMultiplier: 1.4,
    
    // Visualization complexity multipliers
    visualizationMultipliers: {
      simple: 1.0,    // Basic charts, static displays
      moderate: 1.5,  // Interactive dashboards, real-time updates
      complex: 2.0    // 3D visualizations, complex animations
    }
  };

  /**
   * Analyze prompt to estimate design complexity
   */
  analyzePrompt(prompt: string): DesignComplexity {
    const promptLower = prompt.toLowerCase();
    
    // Keyword detection for greenhouse/lighting specific features
    const keywords = {
      components: [
        'dashboard', 'monitor', 'control panel', 'display', 'interface',
        'chart', 'graph', 'visualization', 'map', 'layout'
      ],
      features: [
        'real-time', 'live', 'websocket', 'streaming',
        'sensor', 'automation', 'scheduling', 'alerts'
      ],
      hardware: [
        'sensor', 'controller', 'actuator', 'pump', 'valve',
        'led', 'light', 'fixture', 'fan', 'hvac'
      ],
      calculations: [
        'ppfd', 'dli', 'vpd', 'ec', 'ph', 'nutrient',
        'yield', 'efficiency', 'optimization', 'prediction'
      ],
      systems: [
        'greenhouse', 'vertical farm', 'hydroponic', 'aquaponic',
        'lighting system', 'climate control', 'irrigation'
      ]
    };

    // Estimate complexity based on keywords
    const componentCount = this.countMatches(promptLower, keywords.components);
    const featureCount = this.countMatches(promptLower, keywords.features);
    const hardwareCount = this.countMatches(promptLower, keywords.hardware);
    const calculationCount = this.countMatches(promptLower, keywords.calculations);
    const systemCount = this.countMatches(promptLower, keywords.systems);

    // Estimate code size
    const estimatedComponents = Math.max(1, componentCount + Math.floor(featureCount / 2));
    const linesPerComponent = 150; // Average lines per component
    const filesPerComponent = 1.5; // Some components need multiple files

    // Determine visualization complexity
    let visualizationComplexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (promptLower.includes('3d') || promptLower.includes('three') || 
        promptLower.includes('real-time visualization')) {
      visualizationComplexity = 'complex';
    } else if (promptLower.includes('dashboard') || promptLower.includes('interactive') ||
               promptLower.includes('live')) {
      visualizationComplexity = 'moderate';
    }

    return {
      componentCount: estimatedComponents,
      linesOfCode: estimatedComponents * linesPerComponent,
      fileCount: Math.ceil(estimatedComponents * filesPerComponent),
      databaseTables: systemCount > 0 ? Math.max(2, systemCount * 2) : 0,
      apiEndpoints: featureCount > 0 ? Math.max(3, featureCount * 2) : 0,
      realtimeFeatures: featureCount > 2 || promptLower.includes('real-time'),
      thirdPartyIntegrations: hardwareCount > 0 ? Math.ceil(hardwareCount / 2) : 0,
      customCalculations: calculationCount > 0,
      visualizationComplexity,
      hardwareIntegration: hardwareCount > 0
    };
  }

  /**
   * Calculate credits based on complexity
   */
  calculateCredits(complexity: DesignComplexity): CreditCalculation {
    const breakdown: CreditCalculation['breakdown'] = [];
    let baseCredits = 0;

    // Component costs
    const componentCredits = complexity.componentCount * this.creditRates.perComponent;
    if (componentCredits > 0) {
      baseCredits += componentCredits;
      breakdown.push({
        category: 'Components',
        credits: componentCredits,
        reason: `${complexity.componentCount} React components`
      });
    }

    // Code volume costs
    const codeCredits = Math.ceil(complexity.linesOfCode / 100) * this.creditRates.per100Lines;
    baseCredits += codeCredits;
    breakdown.push({
      category: 'Code Volume',
      credits: codeCredits,
      reason: `~${complexity.linesOfCode} lines of code`
    });

    // Database costs
    if (complexity.databaseTables > 0) {
      const dbCredits = complexity.databaseTables * this.creditRates.perTable;
      baseCredits += dbCredits;
      breakdown.push({
        category: 'Database',
        credits: dbCredits,
        reason: `${complexity.databaseTables} tables/schemas`
      });
    }

    // API costs
    if (complexity.apiEndpoints > 0) {
      const apiCredits = complexity.apiEndpoints * this.creditRates.perEndpoint;
      baseCredits += apiCredits;
      breakdown.push({
        category: 'API Endpoints',
        credits: apiCredits,
        reason: `${complexity.apiEndpoints} REST/GraphQL endpoints`
      });
    }

    // Integration costs
    if (complexity.thirdPartyIntegrations > 0) {
      const integrationCredits = complexity.thirdPartyIntegrations * this.creditRates.perIntegration;
      baseCredits += integrationCredits;
      breakdown.push({
        category: 'Integrations',
        credits: integrationCredits,
        reason: `${complexity.thirdPartyIntegrations} third-party services`
      });
    }

    // Calculate multipliers
    let complexityMultiplier = this.creditRates.visualizationMultipliers[complexity.visualizationComplexity];

    if (complexity.realtimeFeatures) {
      complexityMultiplier *= this.creditRates.realtimeMultiplier;
      breakdown.push({
        category: 'Real-time Features',
        credits: 0,
        reason: `${Math.round((this.creditRates.realtimeMultiplier - 1) * 100)}% multiplier`
      });
    }

    if (complexity.hardwareIntegration) {
      complexityMultiplier *= this.creditRates.hardwareMultiplier;
      breakdown.push({
        category: 'Hardware Integration',
        credits: 0,
        reason: `${Math.round((this.creditRates.hardwareMultiplier - 1) * 100)}% multiplier`
      });
    }

    if (complexity.customCalculations) {
      complexityMultiplier *= this.creditRates.customCalculationMultiplier;
      breakdown.push({
        category: 'Custom Calculations',
        credits: 0,
        reason: `${Math.round((this.creditRates.customCalculationMultiplier - 1) * 100)}% multiplier`
      });
    }

    // Calculate total
    const totalCredits = Math.ceil(baseCredits * complexityMultiplier);

    // Determine tier
    let tier: CreditCalculation['tier'] = 'basic';
    if (totalCredits > 75) tier = 'enterprise';
    else if (totalCredits > 40) tier = 'advanced';
    else if (totalCredits > 15) tier = 'standard';

    return {
      baseCredits,
      complexityMultiplier,
      totalCredits,
      breakdown,
      tier
    };
  }

  /**
   * Get example prompts with credit costs
   */
  getExamplePrompts(): Array<{
    prompt: string;
    category: string;
    credits: number;
    description: string;
  }> {
    return [
      {
        prompt: "Create a simple greenhouse temperature display",
        category: "Basic Monitoring",
        credits: 12,
        description: "Single metric display with historical chart"
      },
      {
        prompt: "Build a hydroponic nutrient monitoring dashboard with pH, EC, and temperature graphs",
        category: "Standard Dashboard",
        credits: 28,
        description: "Multi-sensor dashboard with real-time updates"
      },
      {
        prompt: "Design a complete greenhouse climate control system with HVAC automation",
        category: "Advanced Control",
        credits: 52,
        description: "Full automation with hardware integration"
      },
      {
        prompt: "Create a DLC-compliant lighting design tool for vertical farms with PPFD calculations",
        category: "Professional Tool",
        credits: 68,
        description: "Complex calculations and 3D visualization"
      },
      {
        prompt: "Build an AI-powered crop yield prediction system with sensor integration",
        category: "Enterprise System",
        credits: 95,
        description: "ML models, IoT integration, predictive analytics"
      }
    ];
  }

  /**
   * Estimate time saved vs manual development
   */
  estimateTimeSaved(complexity: DesignComplexity): {
    hoursSaved: number;
    costSaved: number; // at $150/hour developer rate
  } {
    // Rough estimates based on component complexity
    const hoursPerComponent = 4;
    const hoursPerTable = 2;
    const hoursPerEndpoint = 3;
    const hoursPerIntegration = 8;

    let totalHours = 0;
    totalHours += complexity.componentCount * hoursPerComponent;
    totalHours += complexity.databaseTables * hoursPerTable;
    totalHours += complexity.apiEndpoints * hoursPerEndpoint;
    totalHours += complexity.thirdPartyIntegrations * hoursPerIntegration;

    // Add complexity multipliers
    if (complexity.realtimeFeatures) totalHours *= 1.3;
    if (complexity.hardwareIntegration) totalHours *= 1.5;
    if (complexity.customCalculations) totalHours *= 1.2;

    const hourlyRate = 150;
    const costSaved = totalHours * hourlyRate;

    return {
      hoursSaved: Math.round(totalHours),
      costSaved: Math.round(costSaved)
    };
  }

  private countMatches(text: string, keywords: string[]): number {
    return keywords.filter(keyword => text.includes(keyword)).length;
  }
}

// Greenhouse/Lighting specific prompt templates
export const greenhousePromptTemplates = {
  monitoring: {
    basic: "Create a {metric} monitoring display for my greenhouse",
    standard: "Build a dashboard showing {metrics} with real-time updates and historical charts",
    advanced: "Design a comprehensive monitoring system for {systemType} with alerts and data logging"
  },
  
  control: {
    basic: "Create a simple {device} control interface",
    standard: "Build an automated {system} control panel with scheduling",
    advanced: "Design a full {systemType} automation system with sensor feedback and optimization"
  },
  
  lighting: {
    basic: "Create a lighting schedule interface for {cropType}",
    standard: "Build a DLI calculator and lighting control system for {area}",
    advanced: "Design a complete lighting optimization tool with {fixtures} and energy analysis"
  },
  
  planning: {
    basic: "Create a planting calendar for {cropType}",
    standard: "Build a crop rotation planner with yield predictions",
    advanced: "Design a complete farm management system with {features}"
  }
};

// Credit package suggestions
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