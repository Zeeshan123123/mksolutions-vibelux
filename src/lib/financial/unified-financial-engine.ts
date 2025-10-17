/**
 * Unified Financial Analysis Engine
 * Professional-grade financial modeling capabilities for all VibeLux calculators
 * Inspired by institutional-quality analysis tools
 */

// Core financial interfaces
export interface FinancialScenario {
  id: string;
  name: string;
  description: string;
  assumptions: FinancialAssumptions;
  results?: ScenarioResults;
  confidence?: number; // 0-100%
  recommended?: boolean;
}

export interface FinancialAssumptions {
  // Investment parameters
  initialInvestment: number;
  additionalInvestments?: YearlyValue[];
  
  // Revenue parameters
  revenue: RevenueStream[];
  revenueGrowthRate?: number; // Annual %
  
  // Cost parameters
  operatingCosts: CostCategory[];
  costInflationRate?: number; // Annual %
  
  // Financial parameters
  discountRate: number; // %
  taxRate: number; // %
  analysisYears: number;
  
  // Risk parameters
  riskFactors?: RiskFactor[];
}

export interface RevenueStream {
  name: string;
  annualAmount: number;
  growthRate?: number; // Override general growth rate
  startYear?: number; // Default 1
  endYear?: number; // Default analysisYears
  probability?: number; // 0-100% for risk adjustment
}

export interface CostCategory {
  name: string;
  annualAmount: number;
  inflationRate?: number; // Override general inflation
  isFixed?: boolean; // Fixed vs variable cost
  startYear?: number;
  endYear?: number;
}

export interface YearlyValue {
  year: number;
  value: number;
}

export interface RiskFactor {
  name: string;
  category: 'market' | 'operational' | 'financial' | 'regulatory';
  impact: 'low' | 'medium' | 'high';
  probability: number; // 0-100%
  financialImpact?: number; // $ impact if occurs
  mitigation?: string;
}

export interface ScenarioResults {
  // Core metrics
  npv: number;
  irr: number;
  paybackPeriod: number;
  roi: number;
  
  // Cash flows
  yearlyCashFlows: YearlyCashFlow[];
  cumulativeCashFlow: number[];
  
  // Risk metrics
  riskAdjustedNPV?: number;
  confidenceInterval?: { low: number; high: number };
  breakEvenAnalysis?: BreakEvenPoint[];
  
  // Sensitivity results
  sensitivityAnalysis?: SensitivityResult[];
}

export interface YearlyCashFlow {
  year: number;
  revenue: number;
  costs: number;
  ebitda: number;
  tax: number;
  netCashFlow: number;
  discountedCashFlow: number;
}

export interface BreakEvenPoint {
  variable: string;
  breakEvenValue: number;
  currentValue: number;
  margin: number; // % margin from break-even
}

export interface SensitivityResult {
  variable: string;
  baseValue: number;
  variations: {
    change: number; // % change
    value: number;
    npvImpact: number;
    irrImpact: number;
  }[];
}

// Monte Carlo simulation interfaces
export interface MonteCarloConfig {
  iterations: number; // 1000-10000 typical
  confidenceLevel: number; // 90%, 95%, etc.
  variables: MonteCarloVariable[];
}

export interface MonteCarloVariable {
  name: string;
  distribution: 'normal' | 'uniform' | 'triangular' | 'custom';
  parameters: {
    mean?: number;
    stdDev?: number;
    min?: number;
    max?: number;
    mostLikely?: number;
    values?: { value: number; probability: number }[]; // For custom
  };
}

export interface MonteCarloResults {
  iterations: number;
  metrics: {
    npv: StatisticalSummary;
    irr: StatisticalSummary;
    paybackPeriod: StatisticalSummary;
    roi: StatisticalSummary;
  };
  probabilityOfSuccess: number; // % of positive NPV
  riskProfile: RiskProfile;
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
}

export interface RiskProfile {
  level: 'low' | 'medium' | 'high';
  volatility: number; // Coefficient of variation
  downsideRisk: number; // Probability of loss
  upsidePotential: number; // Probability of exceeding target
}

/**
 * Main Financial Analysis Engine
 */
export class UnifiedFinancialEngine {
  /**
   * Calculate NPV (Net Present Value)
   */
  calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((npv, cf, year) => {
      return npv + cf / Math.pow(1 + discountRate / 100, year);
    }, 0);
  }

  /**
   * Calculate IRR (Internal Rate of Return) using Newton's method
   */
  calculateIRR(cashFlows: number[]): number {
    let rate = 0.1; // Initial guess
    const maxIterations = 100;
    const tolerance = 0.00001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;

      for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + rate, t);
        if (t > 0) {
          derivative -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
        }
      }

      if (Math.abs(npv) < tolerance) break;
      if (Math.abs(derivative) < tolerance) break;

      rate = rate - npv / derivative;

      // Bound the rate to reasonable values
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }

    return rate * 100; // Return as percentage
  }

  /**
   * Calculate payback period
   */
  calculatePaybackPeriod(cashFlows: number[]): number {
    let cumulative = 0;
    
    for (let year = 0; year < cashFlows.length; year++) {
      cumulative += cashFlows[year];
      
      if (cumulative >= 0) {
        if (year === 0) return 0;
        
        // Linear interpolation for fractional year
        const previousCumulative = cumulative - cashFlows[year];
        const fraction = Math.abs(previousCumulative) / cashFlows[year];
        
        return year - 1 + fraction;
      }
    }
    
    return cashFlows.length; // Doesn't pay back within analysis period
  }

  /**
   * Run complete scenario analysis
   */
  analyzeScenario(scenario: FinancialScenario): ScenarioResults {
    const { assumptions } = scenario;
    const cashFlows: number[] = [];
    const yearlyCashFlows: YearlyCashFlow[] = [];
    
    // Initial investment (negative cash flow)
    cashFlows.push(-assumptions.initialInvestment);
    
    // Calculate yearly cash flows
    for (let year = 1; year <= assumptions.analysisYears; year++) {
      // Calculate revenue
      let yearRevenue = 0;
      assumptions.revenue.forEach(stream => {
        if (year >= (stream.startYear || 1) && year <= (stream.endYear || assumptions.analysisYears)) {
          const growthRate = stream.growthRate ?? assumptions.revenueGrowthRate ?? 0;
          const growthFactor = Math.pow(1 + growthRate / 100, year - (stream.startYear || 1));
          yearRevenue += stream.annualAmount * growthFactor * (stream.probability || 100) / 100;
        }
      });
      
      // Calculate costs
      let yearCosts = 0;
      assumptions.operatingCosts.forEach(cost => {
        if (year >= (cost.startYear || 1) && year <= (cost.endYear || assumptions.analysisYears)) {
          const inflationRate = cost.inflationRate ?? assumptions.costInflationRate ?? 0;
          const inflationFactor = Math.pow(1 + inflationRate / 100, year - (cost.startYear || 1));
          yearCosts += cost.annualAmount * inflationFactor;
        }
      });
      
      // Additional investments
      const additionalInvestment = assumptions.additionalInvestments?.find(inv => inv.year === year)?.value || 0;
      
      // Calculate cash flow
      const ebitda = yearRevenue - yearCosts;
      const tax = ebitda > 0 ? ebitda * assumptions.taxRate / 100 : 0;
      const netCashFlow = ebitda - tax - additionalInvestment;
      const discountedCashFlow = netCashFlow / Math.pow(1 + assumptions.discountRate / 100, year);
      
      cashFlows.push(netCashFlow);
      yearlyCashFlows.push({
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        ebitda,
        tax,
        netCashFlow,
        discountedCashFlow
      });
    }
    
    // Calculate cumulative cash flow
    const cumulativeCashFlow = cashFlows.reduce((acc, cf) => {
      const cumulative = acc.length > 0 ? acc[acc.length - 1] + cf : cf;
      return [...acc, cumulative];
    }, [] as number[]);
    
    // Calculate metrics
    const npv = this.calculateNPV(cashFlows, assumptions.discountRate);
    const irr = this.calculateIRR(cashFlows);
    const paybackPeriod = this.calculatePaybackPeriod(cashFlows);
    const roi = ((cumulativeCashFlow[cumulativeCashFlow.length - 1] - assumptions.initialInvestment) / 
                 assumptions.initialInvestment) * 100;
    
    return {
      npv,
      irr,
      paybackPeriod,
      roi,
      yearlyCashFlows,
      cumulativeCashFlow
    };
  }

  /**
   * Perform sensitivity analysis
   */
  performSensitivityAnalysis(
    baseScenario: FinancialScenario,
    variables: { name: keyof FinancialAssumptions; variations: number[] }[]
  ): SensitivityResult[] {
    const baseResults = this.analyzeScenario(baseScenario);
    const results: SensitivityResult[] = [];
    
    variables.forEach(variable => {
      const baseValue = baseScenario.assumptions[variable.name] as number;
      const variations = variable.variations.map(change => {
        // Create modified scenario
        const modifiedScenario = JSON.parse(JSON.stringify(baseScenario));
        const newValue = baseValue * (1 + change / 100);
        modifiedScenario.assumptions[variable.name] = newValue;
        
        // Calculate results
        const modifiedResults = this.analyzeScenario(modifiedScenario);
        
        return {
          change,
          value: newValue,
          npvImpact: modifiedResults.npv - baseResults.npv,
          irrImpact: modifiedResults.irr - baseResults.irr
        };
      });
      
      results.push({
        variable: variable.name,
        baseValue,
        variations
      });
    });
    
    return results;
  }

  /**
   * Compare multiple scenarios
   */
  compareScenarios(scenarios: FinancialScenario[]): {
    scenarios: (FinancialScenario & { rank: number })[];
    bestScenario: FinancialScenario;
    comparisonMatrix: any;
  } {
    // Analyze all scenarios
    scenarios.forEach(scenario => {
      scenario.results = this.analyzeScenario(scenario);
    });
    
    // Rank by NPV (could be configurable)
    const rankedScenarios = scenarios
      .sort((a, b) => (b.results?.npv || 0) - (a.results?.npv || 0))
      .map((scenario, index) => ({
        ...scenario,
        rank: index + 1
      }));
    
    return {
      scenarios: rankedScenarios,
      bestScenario: rankedScenarios[0],
      comparisonMatrix: this.generateComparisonMatrix(rankedScenarios)
    };
  }

  /**
   * Generate comparison matrix for scenarios
   */
  private generateComparisonMatrix(scenarios: FinancialScenario[]): any {
    return {
      metrics: ['NPV', 'IRR', 'Payback', 'ROI'],
      data: scenarios.map(s => ({
        name: s.name,
        npv: s.results?.npv || 0,
        irr: s.results?.irr || 0,
        payback: s.results?.paybackPeriod || 0,
        roi: s.results?.roi || 0
      }))
    };
  }

  /**
   * Calculate break-even points
   */
  calculateBreakEven(
    scenario: FinancialScenario,
    variables: string[]
  ): BreakEvenPoint[] {
    const baseResults = this.analyzeScenario(scenario);
    const breakEvenPoints: BreakEvenPoint[] = [];
    
    variables.forEach(variable => {
      // Binary search for break-even point
      let low = -90; // -90% change
      let high = 1000; // +1000% change
      let breakEven = 0;
      
      while (high - low > 0.1) {
        const mid = (low + high) / 2;
        const modifiedScenario = JSON.parse(JSON.stringify(scenario));
        
        // Apply percentage change to variable
        // This is simplified - would need proper path resolution for nested properties
        const baseValue = this.getVariableValue(scenario.assumptions, variable);
        this.setVariableValue(modifiedScenario.assumptions, variable, baseValue * (1 + mid / 100));
        
        const results = this.analyzeScenario(modifiedScenario);
        
        if (results.npv > 0) {
          low = mid;
        } else {
          high = mid;
          breakEven = mid;
        }
      }
      
      const currentValue = this.getVariableValue(scenario.assumptions, variable);
      const breakEvenValue = currentValue * (1 + breakEven / 100);
      
      breakEvenPoints.push({
        variable,
        currentValue,
        breakEvenValue,
        margin: ((currentValue - breakEvenValue) / breakEvenValue) * 100
      });
    });
    
    return breakEvenPoints;
  }

  /**
   * Simple Monte Carlo simulation
   * Note: In production, use a proper statistics library
   */
  runMonteCarloSimulation(
    baseScenario: FinancialScenario,
    config: MonteCarloConfig
  ): MonteCarloResults {
    const results = {
      npv: [] as number[],
      irr: [] as number[],
      paybackPeriod: [] as number[],
      roi: [] as number[]
    };
    
    // Run iterations
    for (let i = 0; i < config.iterations; i++) {
      const modifiedScenario = this.applyMonteCarloVariations(baseScenario, config.variables);
      const iterationResults = this.analyzeScenario(modifiedScenario);
      
      results.npv.push(iterationResults.npv);
      results.irr.push(iterationResults.irr);
      results.paybackPeriod.push(iterationResults.paybackPeriod);
      results.roi.push(iterationResults.roi);
    }
    
    // Calculate statistics
    const npvStats = this.calculateStatistics(results.npv);
    const irrStats = this.calculateStatistics(results.irr);
    const paybackStats = this.calculateStatistics(results.paybackPeriod);
    const roiStats = this.calculateStatistics(results.roi);
    
    // Calculate probability of success (positive NPV)
    const probabilityOfSuccess = (results.npv.filter(n => n > 0).length / config.iterations) * 100;
    
    // Determine risk profile
    const volatility = npvStats.stdDev / Math.abs(npvStats.mean);
    const downsideRisk = (results.npv.filter(n => n < 0).length / config.iterations) * 100;
    const upsidePotential = (results.npv.filter(n => n > npvStats.mean * 1.5).length / config.iterations) * 100;
    
    const riskLevel = volatility < 0.2 ? 'low' : volatility < 0.5 ? 'medium' : 'high';
    
    return {
      iterations: config.iterations,
      metrics: {
        npv: npvStats,
        irr: irrStats,
        paybackPeriod: paybackStats,
        roi: roiStats
      },
      probabilityOfSuccess,
      riskProfile: {
        level: riskLevel,
        volatility,
        downsideRisk,
        upsidePotential
      }
    };
  }

  /**
   * Apply Monte Carlo variations to scenario
   */
  private applyMonteCarloVariations(
    scenario: FinancialScenario,
    variables: MonteCarloVariable[]
  ): FinancialScenario {
    const modified = JSON.parse(JSON.stringify(scenario));
    
    variables.forEach(variable => {
      const value = this.generateRandomValue(variable);
      this.setVariableValue(modified.assumptions, variable.name, value);
    });
    
    return modified;
  }

  /**
   * Generate random value based on distribution
   */
  private generateRandomValue(variable: MonteCarloVariable): number {
    const { distribution, parameters } = variable;
    
    switch (distribution) {
      case 'normal':
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return parameters.mean! + z0 * parameters.stdDev!;
        
      case 'uniform':
        return parameters.min! + Math.random() * (parameters.max! - parameters.min!);
        
      case 'triangular':
        // Simplified triangular distribution
        const { min, max, mostLikely } = parameters;
        const u = Math.random();
        const fc = (mostLikely! - min!) / (max! - min!);
        
        if (u < fc) {
          return min! + Math.sqrt(u * (max! - min!) * (mostLikely! - min!));
        } else {
          return max! - Math.sqrt((1 - u) * (max! - min!) * (max! - mostLikely!));
        }
        
      case 'custom':
        // Weighted random selection
        const r = Math.random();
        let cumulative = 0;
        
        for (const point of parameters.values!) {
          cumulative += point.probability;
          if (r <= cumulative) {
            return point.value;
          }
        }
        return parameters.values![parameters.values!.length - 1].value;
        
      default:
        throw new Error(`Unknown distribution: ${distribution}`);
    }
  }

  /**
   * Calculate statistical summary
   */
  private calculateStatistics(values: number[]): StatisticalSummary {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
      : sorted[Math.floor(n / 2)];
    
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean,
      median,
      stdDev,
      min: sorted[0],
      max: sorted[n - 1],
      percentiles: {
        p5: sorted[Math.floor(n * 0.05)],
        p25: sorted[Math.floor(n * 0.25)],
        p50: median,
        p75: sorted[Math.floor(n * 0.75)],
        p95: sorted[Math.floor(n * 0.95)]
      }
    };
  }

  /**
   * Helper methods for variable access
   */
  private getVariableValue(obj: any, path: string): number {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      value = value[key];
    }
    
    return value;
  }

  private setVariableValue(obj: any, path: string, value: number): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// Export singleton instance
export const financialEngine = new UnifiedFinancialEngine();