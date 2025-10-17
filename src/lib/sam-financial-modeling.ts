/**
 * Advanced SAM Financial Modeling Engine
 * Comprehensive financial analysis for greenhouse solar installations
 */

import { SAMSystemConfig, SAMFinancialConfig, SAMResults } from './sam-integration';

export interface AdvancedFinancialConfig extends SAMFinancialConfig {
  // Financing options
  financing: {
    cashPurchase?: boolean;
    solarLoan?: {
      loanAmount: number;
      interestRate: number;
      termYears: number;
      downPayment?: number;
    };
    solarLease?: {
      monthlyPayment: number;
      escalationRate: number;
      buyoutOption?: number;
    };
    ppa?: {
      ratePerKWh: number;
      escalationRate: number;
      termYears: number;
    };
  };
  
  // Advanced incentives
  incentives: {
    federal: {
      itc: number; // Investment Tax Credit %
      depreciation: 'MACRS' | 'straight_line' | 'none';
      bonus_depreciation?: number; // %
    };
    state: {
      taxCredit?: number; // %
      rebate?: number; // $/kW
      performanceIncentive?: {
        rate: number; // $/kWh
        years: number;
        cap?: number; // $ maximum
      };
    };
    utility: {
      rebate?: number; // $/kW
      performanceIncentive?: number; // $/kWh
      demandChargeReduction?: number; // $/kW
    };
    local: {
      propertyTaxExemption?: boolean;
      salesTaxExemption?: boolean;
      additionalRebates?: number; // $
    };
  };
  
  // Market conditions
  market: {
    electricityRateEscalation: number; // %/year
    netMeteringRate: number; // $/kWh (can be different from retail rate)
    netMeteringLimit?: number; // kW
    timeOfUseSchedule?: {
      summer: {
        peak: { hours: number[]; rate: number };
        partPeak: { hours: number[]; rate: number };
        offPeak: { hours: number[]; rate: number };
      };
      winter: {
        peak: { hours: number[]; rate: number };
        partPeak: { hours: number[]; rate: number };
        offPeak: { hours: number[]; rate: number };
      };
    };
  };
  
  // Greenhouse-specific financials
  greenhouse: {
    currentEnergyBill: number; // $/month
    demandCharges: number; // $/kW/month
    cropProductionIncrease?: number; // % increase due to controlled lighting
    cropValueIncrease?: number; // $/kg increase in crop value
    annualCropProduction?: number; // kg/year
    carbonCreditValue?: number; // $/tonne CO2
  };
}

export interface DetailedFinancialResults extends SAMResults {
  // Cash flow analysis
  detailedCashFlow: {
    year: number;
    energyProduction: number; // kWh
    energyValue: number; // $
    omCosts: number; // $
    loanPayment?: number; // $
    taxBenefits: number; // $
    incentivePayments: number; // $
    netCashFlow: number; // $
    cumulativeCashFlow: number; // $
  }[];
  
  // Financial ratios
  ratios: {
    returnOnInvestment: number; // %
    returnOnEquity: number; // %
    debtServiceCoverageRatio: number;
    profitabilityIndex: number;
  };
  
  // Risk analysis
  sensitivity: {
    energyPriceChange: { change: number; npvImpact: number }[];
    systemCostChange: { change: number; npvImpact: number }[];
    productionChange: { change: number; npvImpact: number }[];
  };
  
  // Greenhouse-specific benefits
  greenhouseBenefits: {
    energyCostSavings: number; // $/year
    demandChargeSavings: number; // $/year
    productionIncrease: number; // $/year from increased yields
    carbonCredits: number; // $/year
    totalAnnualBenefit: number; // $/year
  };
  
  // Tax analysis
  taxes: {
    federalTaxSavings: number; // $ total over project life
    stateTaxSavings: number; // $ total over project life
    depreciation: { year: number; amount: number }[];
    taxableIncome: { year: number; amount: number }[];
  };
}

export class SAMFinancialEngine {
  /**
   * Calculate MACRS depreciation schedule
   */
  private calculateMACRSDepreciation(
    depreciableBasis: number,
    bonusDepreciation: number = 0
  ): { year: number; amount: number }[] {
    const macrsSchedule = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576]; // 5-year MACRS
    const schedule: { year: number; amount: number }[] = [];
    
    // Apply bonus depreciation in year 1
    const bonusAmount = depreciableBasis * (bonusDepreciation / 100);
    const remainingBasis = depreciableBasis - bonusAmount;
    
    if (bonusAmount > 0) {
      schedule.push({ year: 1, amount: bonusAmount });
    }
    
    // Apply MACRS to remaining basis
    macrsSchedule.forEach((rate, index) => {
      const amount = remainingBasis * rate;
      const existingYear = schedule.find(s => s.year === index + 1);
      if (existingYear) {
        existingYear.amount += amount;
      } else {
        schedule.push({ year: index + 1, amount });
      }
    });
    
    return schedule;
  }
  
  /**
   * Calculate time-of-use energy value
   */
  private calculateTOUValue(
    hourlyProduction: number[],
    touSchedule: AdvancedFinancialConfig['market']['timeOfUseSchedule']
  ): number {
    if (!touSchedule) return 0;
    
    let totalValue = 0;
    
    hourlyProduction.forEach((production, hour) => {
      const month = Math.floor(hour / (24 * 30.44)); // Approximate month
      const hourOfDay = hour % 24;
      
      const season = month >= 4 && month <= 9 ? 'summer' : 'winter';
      const schedule = touSchedule[season];
      
      let rate = schedule.offPeak.rate; // Default to off-peak
      
      if (schedule.peak.hours.includes(hourOfDay)) {
        rate = schedule.peak.rate;
      } else if (schedule.partPeak.hours.includes(hourOfDay)) {
        rate = schedule.partPeak.rate;
      }
      
      totalValue += production * rate;
    });
    
    return totalValue;
  }
  
  /**
   * Run comprehensive financial analysis
   */
  async analyzeFinancials(
    systemConfig: SAMSystemConfig,
    financialConfig: AdvancedFinancialConfig,
    energyProduction: number,
    hourlyProduction?: number[]
  ): Promise<DetailedFinancialResults> {
    const systemCost = financialConfig.totalInstalledCost * systemConfig.systemCapacity;
    
    // Calculate incentives
    const federalITC = systemCost * (financialConfig.incentives.federal.itc / 100);
    const stateCredit = systemCost * ((financialConfig.incentives.state.taxCredit || 0) / 100);
    const stateRebate = (financialConfig.incentives.state.rebate || 0) * systemConfig.systemCapacity;
    const utilityRebate = (financialConfig.incentives.utility.rebate || 0) * systemConfig.systemCapacity;
    
    const totalIncentives = federalITC + stateCredit + stateRebate + utilityRebate + 
                           (financialConfig.incentives.local.additionalRebates || 0);
    
    // Calculate financing
    const downPayment = financialConfig.financing.solarLoan?.downPayment || 0;
    const loanAmount = financialConfig.financing.solarLoan ? 
      systemCost - downPayment : 0;
    
    const monthlyLoanPayment = loanAmount > 0 ? this.calculateLoanPayment(
      loanAmount,
      financialConfig.financing.solarLoan!.interestRate,
      financialConfig.financing.solarLoan!.termYears
    ) : 0;
    
    // Calculate depreciation
    const depreciableBasis = systemCost - federalITC; // Reduce basis by ITC
    const depreciation = financialConfig.incentives.federal.depreciation === 'MACRS' ?
      this.calculateMACRSDepreciation(
        depreciableBasis,
        financialConfig.incentives.federal.bonus_depreciation
      ) : [];
    
    // Generate detailed cash flow
    const detailedCashFlow: DetailedFinancialResults['detailedCashFlow'] = [];
    let cumulativeCashFlow = -(systemCost - totalIncentives);
    
    for (let year = 1; year <= financialConfig.analysisYears; year++) {
      // Energy production with degradation
      const degradationFactor = Math.pow(1 - 0.005, year - 1);
      const yearlyProduction = energyProduction * degradationFactor;
      
      // Energy value calculation
      let energyValue: number;
      if (hourlyProduction && financialConfig.market.timeOfUseSchedule) {
        // Use detailed TOU calculation
        const degradedHourly = hourlyProduction.map(h => h * degradationFactor);
        energyValue = this.calculateTOUValue(degradedHourly, financialConfig.market.timeOfUseSchedule);
      } else {
        // Simple flat rate with net metering
        const escalationFactor = Math.pow(1 + financialConfig.market.electricityRateEscalation / 100, year - 1);
        energyValue = yearlyProduction * financialConfig.market.netMeteringRate * escalationFactor;
      }
      
      // O&M costs
      const inflationFactor = Math.pow(1 + financialConfig.inflationRate / 100, year - 1);
      const omCosts = (financialConfig.omCostFixed + yearlyProduction * financialConfig.omCostVariable) * inflationFactor;
      
      // Loan payment
      const loanPayment = monthlyLoanPayment * 12;
      
      // Tax benefits (depreciation + tax credits)
      const yearlyDepreciation = depreciation.find(d => d.year === year)?.amount || 0;
      const taxBenefits = yearlyDepreciation * financialConfig.taxRate / 100;
      
      // Performance-based incentives
      let incentivePayments = 0;
      if (financialConfig.incentives.state.performanceIncentive) {
        const pbi = financialConfig.incentives.state.performanceIncentive;
        if (year <= pbi.years) {
          incentivePayments = Math.min(
            yearlyProduction * pbi.rate,
            pbi.cap || Infinity
          );
        }
      }
      
      const netCashFlow = energyValue - omCosts - loanPayment + taxBenefits + incentivePayments;
      cumulativeCashFlow += netCashFlow;
      
      detailedCashFlow.push({
        year,
        energyProduction: yearlyProduction,
        energyValue,
        omCosts,
        loanPayment: loanPayment > 0 ? loanPayment : undefined,
        taxBenefits,
        incentivePayments,
        netCashFlow,
        cumulativeCashFlow
      });
    }
    
    // Calculate financial ratios
    const totalCashFlows = detailedCashFlow.map(cf => cf.netCashFlow);
    const initialInvestment = systemCost - totalIncentives;
    
    const npv = this.calculateNPV([-initialInvestment, ...totalCashFlows], financialConfig.discountRate);
    const irr = this.calculateIRR([-initialInvestment, ...totalCashFlows]);
    
    const ratios = {
      returnOnInvestment: (totalCashFlows.reduce((a, b) => a + b, 0) / initialInvestment) * 100,
      returnOnEquity: irr,
      debtServiceCoverageRatio: loanAmount > 0 ? 
        (totalCashFlows[0] + (monthlyLoanPayment * 12)) / (monthlyLoanPayment * 12) : 0,
      profitabilityIndex: npv > 0 ? (npv + initialInvestment) / initialInvestment : 0
    };
    
    // Sensitivity analysis
    const sensitivity = this.performSensitivityAnalysis(
      systemConfig,
      financialConfig,
      energyProduction,
      initialInvestment
    );
    
    // Greenhouse-specific benefits
    const greenhouseBenefits = this.calculateGreenhouseBenefits(
      energyProduction,
      financialConfig.greenhouse,
      systemConfig.systemCapacity
    );
    
    // Tax analysis summary
    const taxes = {
      federalTaxSavings: federalITC + depreciation.reduce((sum, d) => sum + d.amount, 0) * financialConfig.taxRate / 100,
      stateTaxSavings: stateCredit,
      depreciation,
      taxableIncome: detailedCashFlow.map(cf => ({
        year: cf.year,
        amount: cf.energyValue - cf.omCosts - (depreciation.find(d => d.year === cf.year)?.amount || 0)
      }))
    };
    
    // Calculate payback period
    let paybackPeriod = financialConfig.analysisYears;
    for (let i = 0; i < detailedCashFlow.length; i++) {
      if (detailedCashFlow[i].cumulativeCashFlow >= 0) {
        const prevCumulative = i > 0 ? detailedCashFlow[i - 1].cumulativeCashFlow : -initialInvestment;
        paybackPeriod = i + Math.abs(prevCumulative) / detailedCashFlow[i].netCashFlow;
        break;
      }
    }
    
    return {
      // Basic SAM results
      annualEnergyProduction: energyProduction,
      firstYearProduction: energyProduction,
      capacityFactor: (energyProduction / (systemConfig.systemCapacity * 8760)) * 100,
      performanceRatio: 85, // Typical value
      lcoe: initialInvestment / (energyProduction * financialConfig.analysisYears),
      npv,
      irr,
      paybackPeriod,
      yearlyCashFlow: totalCashFlows,
      cumulativeCashFlow: detailedCashFlow.map(cf => cf.cumulativeCashFlow),
      energyCostSavings: detailedCashFlow[0]?.energyValue || 0,
      totalLifetimeEnergyValue: detailedCashFlow.reduce((sum, cf) => sum + cf.energyValue, 0),
      performanceDegradation: 0.5,
      co2Avoided: energyProduction * 0.4,
      energyOffsetRatio: 0,
      excessEnergyGenerated: 0,
      
      // Detailed results
      detailedCashFlow,
      ratios,
      sensitivity,
      greenhouseBenefits,
      taxes
    };
  }
  
  /**
   * Calculate loan payment
   */
  private calculateLoanPayment(principal: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }
  
  /**
   * Calculate Net Present Value
   */
  private calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((npv, cf, period) => {
      return npv + cf / Math.pow(1 + discountRate / 100, period);
    }, 0);
  }
  
  /**
   * Calculate Internal Rate of Return
   */
  private calculateIRR(cashFlows: number[]): number {
    let rate = 0.1;
    
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      let derivative = 0;
      
      for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + rate, t);
        if (t > 0) {
          derivative -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
        }
      }
      
      if (Math.abs(npv) < 0.01) break;
      if (Math.abs(derivative) < 0.01) break;
      
      rate = rate - npv / derivative;
      
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }
    
    return rate * 100;
  }
  
  /**
   * Perform sensitivity analysis
   */
  private performSensitivityAnalysis(
    systemConfig: SAMSystemConfig,
    financialConfig: AdvancedFinancialConfig,
    baseProduction: number,
    baseInvestment: number
  ): DetailedFinancialResults['sensitivity'] {
    const changes = [-20, -10, -5, 0, 5, 10, 20];
    
    const energyPriceChange = changes.map(change => {
      const adjustedRate = financialConfig.market.netMeteringRate * (1 + change / 100);
      const adjustedValue = baseProduction * adjustedRate * financialConfig.analysisYears;
      const npvImpact = (adjustedValue - baseProduction * financialConfig.market.netMeteringRate * financialConfig.analysisYears) / 
                       Math.pow(1 + financialConfig.discountRate / 100, 1);
      return { change, npvImpact };
    });
    
    const systemCostChange = changes.map(change => {
      const adjustedCost = baseInvestment * (1 + change / 100);
      const npvImpact = baseInvestment - adjustedCost;
      return { change, npvImpact };
    });
    
    const productionChange = changes.map(change => {
      const adjustedProduction = baseProduction * (1 + change / 100);
      const adjustedValue = adjustedProduction * financialConfig.market.netMeteringRate * financialConfig.analysisYears;
      const npvImpact = (adjustedValue - baseProduction * financialConfig.market.netMeteringRate * financialConfig.analysisYears) / 
                       Math.pow(1 + financialConfig.discountRate / 100, 1);
      return { change, npvImpact };
    });
    
    return {
      energyPriceChange,
      systemCostChange,
      productionChange
    };
  }
  
  /**
   * Calculate greenhouse-specific benefits
   */
  private calculateGreenhouseBenefits(
    energyProduction: number,
    greenhouse: AdvancedFinancialConfig['greenhouse'],
    systemCapacity: number
  ): DetailedFinancialResults['greenhouseBenefits'] {
    const energyCostSavings = energyProduction * 0.12; // Assume $0.12/kWh avoided cost
    const demandChargeSavings = systemCapacity * greenhouse.demandCharges * 12; // Monthly demand charge savings
    
    const productionIncrease = greenhouse.cropProductionIncrease && greenhouse.annualCropProduction ?
      (greenhouse.annualCropProduction * greenhouse.cropProductionIncrease / 100 * 
       (greenhouse.cropValueIncrease || 0)) : 0;
    
    const carbonCredits = greenhouse.carbonCreditValue ?
      (energyProduction * 0.4 / 1000 * greenhouse.carbonCreditValue) : 0;
    
    return {
      energyCostSavings,
      demandChargeSavings,
      productionIncrease,
      carbonCredits,
      totalAnnualBenefit: energyCostSavings + demandChargeSavings + productionIncrease + carbonCredits
    };
  }
}

// Export singleton
export const samFinancialEngine = new SAMFinancialEngine();