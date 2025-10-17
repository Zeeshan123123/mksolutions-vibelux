/**
 * NREL System Advisor Model (SAM) Integration
 * Advanced financial and performance modeling for greenhouse solar systems
 */

export interface SAMSystemConfig {
  // System characteristics
  systemCapacity: number; // kW DC
  moduleType: number; // 0=Standard, 1=Premium, 2=Thin film
  arrayType: number; // 0=Fixed Open Rack, 1=Fixed Roof Mount, 2=1-Axis, 3=1-Axis Backtrack, 4=2-Axis
  tilt: number; // degrees
  azimuth: number; // degrees
  gcr: number; // ground coverage ratio
  dcACRatio: number; // DC to AC ratio
  inverterEfficiency: number; // %
  systemLosses: number; // %
  
  // Site characteristics
  latitude: number;
  longitude: number;
  timezone: number;
  elevation: number; // meters
  
  // Greenhouse-specific
  shadingFactor: number; // Impact of greenhouse structure on solar irradiance
  roofTransmittance: number; // For integrated roof systems
  loadProfile: 'greenhouse' | 'commercial' | 'residential';
  
  // Weather data source
  weatherFile?: string;
  useNSRDB?: boolean;
}

export interface SAMFinancialConfig {
  // Analysis type
  analysisType: 'residential' | 'commercial' | 'third_party' | 'merchant';
  
  // Cost inputs
  totalInstalledCost: number; // $/kW
  totalInstalledCostPerWatt: number; // $/W
  
  // Financial parameters
  discountRate: number; // %
  inflationRate: number; // %
  taxRate: number; // %
  analysisYears: number;
  
  // Utility rates
  electricityRate: number; // $/kWh
  demandCharge?: number; // $/kW
  timeOfUseRates?: {
    peak: number;
    offPeak: number;
    peakHours: { start: number; end: number };
  };
  
  // Incentives
  federalTaxCredit: number; // %
  stateTaxCredit?: number; // %
  utilityRebate?: number; // $/kW
  performanceBasedIncentive?: number; // $/kWh
  
  // Operation & Maintenance
  omCostFixed: number; // $/year
  omCostVariable: number; // $/kWh
  
  // Financing
  debtPercent?: number; // %
  loanRate?: number; // %
  loanTerm?: number; // years
}

export interface SAMResults {
  // Energy production
  annualEnergyProduction: number; // kWh/year
  firstYearProduction: number; // kWh
  capacityFactor: number; // %
  performanceRatio: number; // %
  
  // Financial metrics
  lcoe: number; // $/kWh (Levelized Cost of Energy)
  npv: number; // $ (Net Present Value)
  irr: number; // % (Internal Rate of Return)
  paybackPeriod: number; // years
  
  // Cash flows
  yearlyCashFlow: number[];
  cumulativeCashFlow: number[];
  
  // Energy costs
  energyCostSavings: number; // $/year
  totalLifetimeEnergyValue: number; // $
  
  // Performance degradation
  performanceDegradation: number; // %/year
  
  // Environmental impact
  co2Avoided: number; // kg/year
  
  // Greenhouse-specific metrics
  energyOffsetRatio: number; // % of greenhouse energy needs met
  excessEnergyGenerated: number; // kWh/year available for grid export
}

export interface SAMWeatherData {
  latitude: number;
  longitude: number;
  timezone: number;
  elevation: number;
  
  // Hourly data arrays (8760 values each)
  dni: number[]; // Direct Normal Irradiance (W/m²)
  dhi: number[]; // Diffuse Horizontal Irradiance (W/m²)
  ghi: number[]; // Global Horizontal Irradiance (W/m²)
  temperature: number[]; // Ambient temperature (°C)
  windSpeed: number[]; // Wind speed (m/s)
  pressure: number[]; // Atmospheric pressure (mbar)
  
  // Monthly averages
  monthlyGHI: number[]; // 12 values
  monthlyTemperature: number[]; // 12 values
}

export class SAMIntegration {
  private apiKey?: string;
  private baseUrl = 'https://developer.nrel.gov/api';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Fetch weather data from NREL NSRDB
   */
  async getWeatherData(
    latitude: number,
    longitude: number,
    year: number = 2023
  ): Promise<SAMWeatherData> {
    if (!this.apiKey) {
      throw new Error('NREL API key required for weather data access');
    }
    
    const url = `${this.baseUrl}/nsrdb/v2/solar/psm3-download.csv`;
    const params = new URLSearchParams({
      api_key: this.apiKey,
      lat: latitude.toString(),
      lon: longitude.toString(),
      year: year.toString(),
      attributes: 'dni,dhi,ghi,air_temperature,wind_speed,surface_pressure',
      names: year.toString(),
      utc: 'false',
      full_name: 'SAM Integration',
      email: 'user@example.com',
      affiliation: 'Vibelux',
      reason: 'Greenhouse solar analysis'
    });
    
    // Note: This would require actual HTTP client implementation
    // For now, return mock data structure
    return this.generateMockWeatherData(latitude, longitude);
  }
  
  /**
   * Generate mock weather data for testing
   */
  private generateMockWeatherData(latitude: number, longitude: number): SAMWeatherData {
    const hourlyData = Array.from({ length: 8760 }, (_, hour) => {
      const dayOfYear = Math.floor(hour / 24);
      const hourOfDay = hour % 24;
      
      // Simplified solar irradiance model
      const solarElevation = this.calculateSolarElevation(latitude, dayOfYear, hourOfDay);
      const ghi = Math.max(0, 1000 * Math.sin(Math.max(0, solarElevation)));
      const dni = ghi > 100 ? ghi * 0.8 : 0;
      const dhi = ghi - dni * Math.cos(Math.max(0, solarElevation));
      
      // Temperature variation
      const annualTemp = 15 + 15 * Math.cos((dayOfYear - 172) * 2 * Math.PI / 365);
      const dailyTemp = annualTemp + 8 * Math.cos((hourOfDay - 14) * 2 * Math.PI / 24);
      
      return {
        ghi,
        dni,
        dhi,
        temperature: dailyTemp,
        windSpeed: 3 + 2 * Math.random(),
        pressure: 1013 - (Math.random() - 0.5) * 20
      };
    });
    
    return {
      latitude,
      longitude,
      timezone: Math.round(longitude / 15),
      elevation: 100,
      ghi: hourlyData.map(d => d.ghi),
      dni: hourlyData.map(d => d.dni),
      dhi: hourlyData.map(d => d.dhi),
      temperature: hourlyData.map(d => d.temperature),
      windSpeed: hourlyData.map(d => d.windSpeed),
      pressure: hourlyData.map(d => d.pressure),
      monthlyGHI: this.calculateMonthlyAverages(hourlyData.map(d => d.ghi)),
      monthlyTemperature: this.calculateMonthlyAverages(hourlyData.map(d => d.temperature))
    };
  }
  
  /**
   * Calculate solar elevation angle
   */
  private calculateSolarElevation(latitude: number, dayOfYear: number, hourOfDay: number): number {
    const declination = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365) * Math.PI / 180;
    const hourAngle = (hourOfDay - 12) * 15 * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    
    return Math.asin(
      Math.sin(latRad) * Math.sin(declination) +
      Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle)
    );
  }
  
  /**
   * Calculate monthly averages from hourly data
   */
  private calculateMonthlyAverages(hourlyData: number[]): number[] {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthlyAverages: number[] = [];
    
    let hour = 0;
    for (let month = 0; month < 12; month++) {
      let sum = 0;
      let count = 0;
      
      for (let day = 0; day < daysInMonth[month]; day++) {
        for (let h = 0; h < 24; h++) {
          sum += hourlyData[hour];
          count++;
          hour++;
        }
      }
      
      monthlyAverages.push(sum / count);
    }
    
    return monthlyAverages;
  }
  
  /**
   * Run SAM performance simulation
   */
  async runPerformanceAnalysis(
    systemConfig: SAMSystemConfig,
    weatherData: SAMWeatherData
  ): Promise<Partial<SAMResults>> {
    // Simulate PySAM PVWatts calculation
    const results = this.simulatePVWatts(systemConfig, weatherData);
    
    return {
      annualEnergyProduction: results.annualProduction,
      firstYearProduction: results.annualProduction,
      capacityFactor: results.capacityFactor,
      performanceRatio: results.performanceRatio,
      performanceDegradation: 0.5 // 0.5% per year default
    };
  }
  
  /**
   * Simplified PVWatts calculation
   */
  private simulatePVWatts(
    config: SAMSystemConfig,
    weather: SAMWeatherData
  ): {
    annualProduction: number;
    capacityFactor: number;
    performanceRatio: number;
  } {
    let totalProduction = 0;
    
    for (let hour = 0; hour < 8760; hour++) {
      // Calculate plane-of-array irradiance
      const ghi = weather.ghi[hour];
      const dni = weather.dni[hour];
      const dhi = weather.dhi[hour];
      
      // Simple transposition model
      const tiltRad = config.tilt * Math.PI / 180;
      const poaIrradiance = ghi * (1 + Math.cos(tiltRad)) / 2 + dni * Math.cos(tiltRad) + dhi;
      
      // Apply shading factor for greenhouse integration
      const adjustedIrradiance = poaIrradiance * (1 - config.shadingFactor);
      
      // Temperature derating
      const cellTemp = weather.temperature[hour] + (adjustedIrradiance / 1000) * 25;
      const tempDerate = 1 - 0.004 * (cellTemp - 25);
      
      // DC power
      const dcPower = config.systemCapacity * (adjustedIrradiance / 1000) * tempDerate;
      
      // System losses and inverter efficiency
      const acPower = dcPower * (1 - config.systemLosses / 100) * (config.inverterEfficiency / 100);
      
      totalProduction += Math.max(0, acPower);
    }
    
    const capacityFactor = (totalProduction / (config.systemCapacity * 8760)) * 100;
    const performanceRatio = capacityFactor / (weather.monthlyGHI.reduce((a, b) => a + b, 0) / 12 / 1000 * 100);
    
    return {
      annualProduction: totalProduction,
      capacityFactor,
      performanceRatio
    };
  }
  
  /**
   * Run SAM financial analysis
   */
  async runFinancialAnalysis(
    systemConfig: SAMSystemConfig,
    financialConfig: SAMFinancialConfig,
    energyProduction: number
  ): Promise<Partial<SAMResults>> {
    const totalCost = financialConfig.totalInstalledCost * systemConfig.systemCapacity;
    const federalCredit = totalCost * (financialConfig.federalTaxCredit / 100);
    const stateCredit = totalCost * ((financialConfig.stateTaxCredit || 0) / 100);
    const utilityRebate = (financialConfig.utilityRebate || 0) * systemConfig.systemCapacity;
    
    const netCost = totalCost - federalCredit - stateCredit - utilityRebate;
    
    // Annual energy value
    const annualEnergyValue = energyProduction * financialConfig.electricityRate;
    const annualOMCost = financialConfig.omCostFixed + (energyProduction * financialConfig.omCostVariable);
    const netAnnualSavings = annualEnergyValue - annualOMCost;
    
    // Calculate cash flows
    const cashFlows: number[] = [-netCost]; // Initial investment
    let cumulativeCashFlow = -netCost;
    const cumulativeFlows: number[] = [cumulativeCashFlow];
    
    for (let year = 1; year <= financialConfig.analysisYears; year++) {
      // Energy production degradation
      const degradationFactor = Math.pow(1 - 0.005, year - 1); // 0.5% per year
      const yearlyProduction = energyProduction * degradationFactor;
      
      // Inflation-adjusted energy value
      const inflationFactor = Math.pow(1 + financialConfig.inflationRate / 100, year);
      const yearlyEnergyValue = yearlyProduction * financialConfig.electricityRate * inflationFactor;
      const yearlyOMCost = (financialConfig.omCostFixed + yearlyProduction * financialConfig.omCostVariable) * inflationFactor;
      
      const netYearlySavings = yearlyEnergyValue - yearlyOMCost;
      cashFlows.push(netYearlySavings);
      cumulativeCashFlow += netYearlySavings;
      cumulativeFlows.push(cumulativeCashFlow);
    }
    
    // Calculate NPV
    const npv = cashFlows.reduce((sum, cf, year) => {
      return sum + cf / Math.pow(1 + financialConfig.discountRate / 100, year);
    }, 0);
    
    // Calculate IRR (simplified)
    const irr = this.calculateIRR(cashFlows);
    
    // Calculate payback period
    let paybackPeriod = financialConfig.analysisYears;
    for (let i = 1; i < cumulativeFlows.length; i++) {
      if (cumulativeFlows[i] >= 0) {
        paybackPeriod = i - 1 + Math.abs(cumulativeFlows[i - 1]) / (cumulativeFlows[i] - cumulativeFlows[i - 1]);
        break;
      }
    }
    
    // LCOE calculation
    const discountedEnergy = Array.from({ length: financialConfig.analysisYears }, (_, year) => {
      const degradationFactor = Math.pow(1 - 0.005, year);
      return energyProduction * degradationFactor / Math.pow(1 + financialConfig.discountRate / 100, year + 1);
    }).reduce((a, b) => a + b, 0);
    
    const discountedCosts = netCost + Array.from({ length: financialConfig.analysisYears }, (_, year) => {
      const inflationFactor = Math.pow(1 + financialConfig.inflationRate / 100, year + 1);
      const annualOM = financialConfig.omCostFixed + energyProduction * financialConfig.omCostVariable * inflationFactor;
      return annualOM / Math.pow(1 + financialConfig.discountRate / 100, year + 1);
    }).reduce((a, b) => a + b, 0);
    
    const lcoe = discountedCosts / discountedEnergy;
    
    return {
      lcoe,
      npv,
      irr,
      paybackPeriod,
      yearlyCashFlow: cashFlows.slice(1), // Exclude initial investment
      cumulativeCashFlow: cumulativeFlows.slice(1),
      energyCostSavings: netAnnualSavings,
      totalLifetimeEnergyValue: annualEnergyValue * financialConfig.analysisYears
    };
  }
  
  /**
   * Calculate Internal Rate of Return using Newton's method
   */
  private calculateIRR(cashFlows: number[]): number {
    let rate = 0.1; // Initial guess
    
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
      
      // Constrain to reasonable bounds
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }
    
    return rate * 100; // Return as percentage
  }
  
  /**
   * Calculate greenhouse-specific metrics
   */
  calculateGreenhouseMetrics(
    energyProduction: number,
    greenhouseEnergyConsumption: number,
    systemConfig: SAMSystemConfig
  ): {
    energyOffsetRatio: number;
    excessEnergyGenerated: number;
    co2Avoided: number;
  } {
    const energyOffsetRatio = Math.min(100, (energyProduction / greenhouseEnergyConsumption) * 100);
    const excessEnergyGenerated = Math.max(0, energyProduction - greenhouseEnergyConsumption);
    
    // CO2 avoided calculation (kg/year)
    // Average grid emissions factor: 0.4 kg CO2/kWh
    const co2Avoided = energyProduction * 0.4;
    
    return {
      energyOffsetRatio,
      excessEnergyGenerated,
      co2Avoided
    };
  }
  
  /**
   * Complete SAM analysis combining performance and financial modeling
   */
  async runCompleteAnalysis(
    systemConfig: SAMSystemConfig,
    financialConfig: SAMFinancialConfig,
    greenhouseEnergyUse?: number
  ): Promise<SAMResults> {
    // Get weather data
    const weatherData = await this.getWeatherData(
      systemConfig.latitude,
      systemConfig.longitude
    );
    
    // Run performance analysis
    const performanceResults = await this.runPerformanceAnalysis(systemConfig, weatherData);
    
    // Run financial analysis
    const financialResults = await this.runFinancialAnalysis(
      systemConfig,
      financialConfig,
      performanceResults.annualEnergyProduction!
    );
    
    // Calculate greenhouse-specific metrics
    const greenhouseMetrics = greenhouseEnergyUse ? 
      this.calculateGreenhouseMetrics(
        performanceResults.annualEnergyProduction!,
        greenhouseEnergyUse,
        systemConfig
      ) : {
        energyOffsetRatio: 0,
        excessEnergyGenerated: 0,
        co2Avoided: performanceResults.annualEnergyProduction! * 0.4
      };
    
    return {
      ...performanceResults,
      ...financialResults,
      ...greenhouseMetrics
    } as SAMResults;
  }
}

// Export singleton instance
export const samIntegration = new SAMIntegration();