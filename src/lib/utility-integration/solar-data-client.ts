/**
 * Solar Data Client
 * Integrates with Google Solar API, NREL APIs, and other solar data sources
 * Provides rooftop solar potential analysis and solar resource data
 */

import { EventEmitter } from 'events';

export interface SolarPotentialData {
  lat: number;
  lng: number;
  address?: string;
  rooftopArea: number; // m²
  suitableRooftopArea: number; // m²
  panelCapacity: number; // kW
  annualSolarProduction: number; // kWh
  monthlyProduction: number[]; // 12 months of kWh
  carbonOffset: number; // kg CO2/year
  financialAnalysis: SolarFinancialAnalysis;
  technicalAnalysis: SolarTechnicalAnalysis;
  source: 'google_solar' | 'nrel' | 'pvlib' | 'calculated';
}

export interface SolarFinancialAnalysis {
  installationCost: number; // USD
  paybackPeriod: number; // years
  roi: number; // %
  twentyYearSavings: number; // USD
  monthlyBill: number; // USD before solar
  monthlySavings: number; // USD with solar
  netMeteringValue: number; // USD/year
  incentives: SolarIncentive[];
}

export interface SolarIncentive {
  type: 'federal_tax_credit' | 'state_rebate' | 'utility_rebate' | 'net_metering';
  amount: number; // USD or %
  description: string;
}

export interface SolarTechnicalAnalysis {
  optimalTilt: number; // degrees
  optimalAzimuth: number; // degrees
  expectedEfficiency: number; // %
  shadingFactor: number; // 0-1
  weatherFactor: number; // 0-1
  systemLosses: number; // %
  peakSunHours: number; // hours/day
  irradiance: SolarIrradiance;
}

export interface SolarIrradiance {
  dni: number; // Direct Normal Irradiance (kWh/m²/day)
  dhi: number; // Diffuse Horizontal Irradiance
  ghi: number; // Global Horizontal Irradiance
  monthly: number[]; // 12 months of GHI values
}

export interface GoogleSolarResponse {
  solarPotential: {
    maxArrayAreaMeters2: number;
    maxArrayPanelsCount: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    roofSegmentStats: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      stats: {
        areaMeters2: number;
        sunshineQuantiles: number[];
        groundAreaMeters2: number;
      };
    }>;
    solarPanels: Array<{
      orientation: 'LANDSCAPE' | 'PORTRAIT';
      yearlyEnergyDcKwh: number;
      segmentIndex: number;
    }>;
    solarPanelConfigs: Array<{
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      roofSegmentSummaries: Array<{
        pitchDegrees: number;
        azimuthDegrees: number;
        panelsCount: number;
        yearlyEnergyDcKwh: number;
      }>;
    }>;
    financialAnalyses: Array<{
      monthlyBill: {
        units: number; // kWh
        currencyCode: string;
        nanos: number;
      };
      defaultBill: boolean;
      averageKwhPerMonth: number;
      panelConfigIndex: number;
      financialDetails: {
        initialAcKwhPerYear: number;
        remainingLifetimeUtilityBill: {
          currencyCode: string;
          units: number;
        };
        federalIncentive: {
          currencyCode: string;
          units: number;
        };
        stateIncentive: {
          currencyCode: string;
          units: number;
        };
        utilityIncentive: {
          currencyCode: string;
          units: number;
        };
        lifetimeSrecTotal: {
          currencyCode: string;
          units: number;
        };
        costOfElectricityWithoutSolar: {
          currencyCode: string;
          units: number;
        };
        netMeteringAllowed: boolean;
        solarPercentage: number;
        percentageExportedToGrid: number;
      };
      leasingSavings: {
        savings: {
          savingsYear1: {
            currencyCode: string;
            units: number;
          };
          savingsYear20: {
            currencyCode: string;
            units: number;
          };
          presentValueOfSavingsYear20: {
            currencyCode: string;
            units: number;
          };
        };
        annualLeasingCost: {
          currencyCode: string;
          units: number;
        };
      };
      cashPurchaseSavings: {
        outOfPocketCost: {
          currencyCode: string;
          units: number;
        };
        upfrontCost: {
          currencyCode: string;
          units: number;
        };
        rebateValue: {
          currencyCode: string;
          units: number;
        };
        paybackYears: number;
        savings: {
          savingsYear1: {
            currencyCode: string;
            units: number;
          };
          savingsYear20: {
            currencyCode: string;
            units: number;
          };
          presentValueOfSavingsYear20: {
            currencyCode: string;
            units: number;
          };
        };
      };
      financedPurchaseSavings: {
        annualLoanPayment: {
          currencyCode: string;
          units: number;
        };
        rebateValue: {
          currencyCode: string;
          units: number;
        };
        loanInterestRate: number;
        savings: {
          savingsYear1: {
            currencyCode: string;
            units: number;
          };
          savingsYear20: {
            currencyCode: string;
            units: number;
          };
          presentValueOfSavingsYear20: {
            currencyCode: string;
            units: number;
          };
        };
      };
    }>;
  };
  buildingInsights: {
    name: string;
    center: {
      latitude: number;
      longitude: number;
    };
    boundingBox: {
      sw: { latitude: number; longitude: number; };
      ne: { latitude: number; longitude: number; };
    };
    imageryDate: {
      year: number;
      month: number;
      day: number;
    };
    postalCode: string;
    administrativeArea: string;
    statisticalArea: string;
    regionCode: string;
    imageryProcessedDate: {
      year: number;
      month: number;
      day: number;
    };
  };
}

export interface NRELSolarResourceData {
  outputs: {
    dni: number[];
    dhi: number[];
    ghi: number[];
    lat: number;
    lon: number;
    elev: number;
    tz: number;
  };
}

export class SolarDataClient extends EventEmitter {
  private googleApiKey: string;
  private nrelApiKey: string;
  private cache = new Map<string, { data: any; expires: number }>();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config: {
    googleApiKey: string;
    nrelApiKey: string;
  }) {
    super();
    this.googleApiKey = config.googleApiKey;
    this.nrelApiKey = config.nrelApiKey;
  }

  /**
   * Get comprehensive solar potential analysis
   */
  async getSolarPotential(lat: number, lng: number): Promise<SolarPotentialData | null> {
    const cacheKey = `solar_potential_${lat}_${lng}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      // Primary: Google Solar API
      let potential = await this.getGoogleSolarPotential(lat, lng);
      
      // Fallback: NREL + calculations
      if (!potential) {
        potential = await this.getNRELSolarPotential(lat, lng);
      }

      if (potential) {
        this.cache.set(cacheKey, {
          data: potential,
          expires: Date.now() + this.cacheTimeout
        });
      }

      return potential;

    } catch (error) {
      logger.error('api', 'Solar potential analysis error:', error );
      return null;
    }
  }

  /**
   * Google Solar API integration
   */
  private async getGoogleSolarPotential(lat: number, lng: number): Promise<SolarPotentialData | null> {
    try {
      const response = await fetch(
        `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${this.googleApiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Solar API error: ${response.status}`);
      }

      const data: GoogleSolarResponse = await response.json();
      
      return this.parseGoogleSolarData(data, lat, lng);

    } catch (error) {
      logger.error('api', 'Google Solar API error:', error );
      return null;
    }
  }

  /**
   * Parse Google Solar API response
   */
  private parseGoogleSolarData(data: GoogleSolarResponse, lat: number, lng: number): SolarPotentialData {
    const solarPotential = data.solarPotential;
    const bestConfig = solarPotential.solarPanelConfigs[0] || {};
    const bestFinancial = solarPotential.financialAnalyses[0] || {};

    // Calculate monthly production (Google provides annual, we estimate monthly)
    const annualProduction = bestConfig.yearlyEnergyDcKwh || 0;
    const monthlyProduction = this.estimateMonthlyProduction(annualProduction, lat);

    return {
      lat,
      lng,
      address: `${data.buildingInsights.postalCode}, ${data.buildingInsights.administrativeArea}`,
      rooftopArea: solarPotential.wholeRoofStats.areaMeters2,
      suitableRooftopArea: solarPotential.maxArrayAreaMeters2,
      panelCapacity: bestConfig.panelsCount * 0.4, // Assume 400W panels
      annualSolarProduction: annualProduction,
      monthlyProduction,
      carbonOffset: (annualProduction * solarPotential.carbonOffsetFactorKgPerMwh) / 1000,
      financialAnalysis: {
        installationCost: bestFinancial.cashPurchaseSavings?.upfrontCost?.units || 0,
        paybackPeriod: bestFinancial.cashPurchaseSavings?.paybackYears || 0,
        roi: this.calculateROI(
          bestFinancial.cashPurchaseSavings?.upfrontCost?.units || 0,
          bestFinancial.cashPurchaseSavings?.savings?.savingsYear20?.units || 0
        ),
        twentyYearSavings: bestFinancial.cashPurchaseSavings?.savings?.presentValueOfSavingsYear20?.units || 0,
        monthlyBill: bestFinancial.monthlyBill?.units || 0,
        monthlySavings: (bestFinancial.cashPurchaseSavings?.savings?.savingsYear1?.units || 0) / 12,
        netMeteringValue: bestFinancial.financialDetails?.percentageExportedToGrid ? 
          (annualProduction * 0.1) : 0, // Estimate net metering value
        incentives: this.parseIncentives(bestFinancial)
      },
      technicalAnalysis: {
        optimalTilt: this.calculateOptimalTilt(lat),
        optimalAzimuth: 180, // South-facing
        expectedEfficiency: 20, // Modern panel efficiency
        shadingFactor: 0.95, // Assume minimal shading
        weatherFactor: 0.85, // Weather-related losses
        systemLosses: 15, // Inverter, wiring losses
        peakSunHours: solarPotential.maxSunshineHoursPerYear / 365,
        irradiance: {
          dni: 5.5, // Will be updated with NREL data
          dhi: 2.1,
          ghi: 5.0,
          monthly: Array(12).fill(5.0) // Placeholder
        }
      },
      source: 'google_solar'
    };
  }

  /**
   * NREL Solar Resource API integration
   */
  private async getNRELSolarPotential(lat: number, lng: number): Promise<SolarPotentialData | null> {
    try {
      // Get solar resource data
      const resourceData = await this.getNRELSolarResource(lat, lng);
      
      // Calculate potential based on typical residential setup
      const avgGHI = resourceData.outputs.ghi.reduce((a, b) => a + b, 0) / resourceData.outputs.ghi.length;
      const peakSunHours = avgGHI;
      
      // Assume 5kW system on 400m² roof (typical large facility)
      const systemSize = 5; // kW
      const rooftopArea = 400; // m²
      const annualProduction = systemSize * peakSunHours * 365 * 0.85; // 85% system efficiency

      return {
        lat,
        lng,
        rooftopArea,
        suitableRooftopArea: rooftopArea * 0.7, // 70% suitable
        panelCapacity: systemSize,
        annualSolarProduction: annualProduction,
        monthlyProduction: this.estimateMonthlyProduction(annualProduction, lat),
        carbonOffset: annualProduction * 0.4, // kg CO2/kWh avg
        financialAnalysis: this.estimateFinancials(systemSize, annualProduction),
        technicalAnalysis: {
          optimalTilt: this.calculateOptimalTilt(lat),
          optimalAzimuth: 180,
          expectedEfficiency: 20,
          shadingFactor: 0.95,
          weatherFactor: 0.85,
          systemLosses: 15,
          peakSunHours,
          irradiance: {
            dni: resourceData.outputs.dni[0] || 5.5,
            dhi: resourceData.outputs.dhi[0] || 2.1,
            ghi: resourceData.outputs.ghi[0] || 5.0,
            monthly: resourceData.outputs.ghi.slice(0, 12)
          }
        },
        source: 'nrel'
      };

    } catch (error) {
      logger.error('api', 'NREL Solar API error:', error );
      return null;
    }
  }

  /**
   * Get NREL solar resource data
   */
  private async getNRELSolarResource(lat: number, lng: number): Promise<NRELSolarResourceData> {
    const response = await fetch(
      `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${this.nrelApiKey}&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get solar forecast (production prediction)
   */
  async getSolarForecast(lat: number, lng: number, systemSize: number): Promise<Array<{
    timestamp: Date;
    production: number; // kWh
    irradiance: number; // W/m²
    cloudCover: number; // %
  }>> {
    try {
      // This would integrate with weather forecasting APIs
      // For now, return estimated daily profile
      const forecast = [];
      const today = new Date();
      
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(today);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Simple solar curve (peaks at noon)
        const solarFactor = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
        const production = systemSize * solarFactor * 0.8; // 80% efficiency
        
        forecast.push({
          timestamp,
          production,
          irradiance: solarFactor * 1000, // W/m²
          cloudCover: 20 // Default 20% cloud cover
        });
      }
      
      return forecast;

    } catch (error) {
      logger.error('api', 'Solar forecast error:', error );
      return [];
    }
  }

  /**
   * Calculate optimal solar system size for energy offset
   */
  async calculateOptimalSystemSize(
    lat: number,
    lng: number,
    annualUsage: number, // kWh
    targetOffset: number = 100 // % of usage to offset
  ): Promise<{
    systemSize: number; // kW
    annualProduction: number; // kWh
    offsetPercentage: number; // %
    excessProduction: number; // kWh
    cost: number; // USD
    paybackPeriod: number; // years
  }> {
    const solarData = await this.getSolarPotential(lat, lng);
    if (!solarData) {
      throw new Error('Unable to get solar data for location');
    }

    const peakSunHours = solarData.technicalAnalysis.peakSunHours;
    const systemEfficiency = 0.85; // 85% system efficiency
    
    // Calculate required system size
    const requiredProduction = annualUsage * (targetOffset / 100);
    const systemSize = requiredProduction / (peakSunHours * 365 * systemEfficiency);
    
    // Actual production with this system size
    const actualProduction = systemSize * peakSunHours * 365 * systemEfficiency;
    const offsetPercentage = Math.min(100, (actualProduction / annualUsage) * 100);
    const excessProduction = Math.max(0, actualProduction - annualUsage);
    
    // Financial calculations
    const costPerWatt = 2.5; // $2.50/W average
    const cost = systemSize * 1000 * costPerWatt;
    const annualSavings = actualProduction * 0.12; // $0.12/kWh
    const paybackPeriod = cost / annualSavings;

    return {
      systemSize,
      annualProduction: actualProduction,
      offsetPercentage,
      excessProduction,
      cost,
      paybackPeriod
    };
  }

  /**
   * Helper: Estimate monthly production distribution
   */
  private estimateMonthlyProduction(annualProduction: number, lat: number): number[] {
    // Solar production varies by season and latitude
    const seasonalFactors = this.getSeasonalFactors(lat);
    const monthlyBase = annualProduction / 12;
    
    return seasonalFactors.map(factor => monthlyBase * factor);
  }

  /**
   * Helper: Get seasonal solar production factors
   */
  private getSeasonalFactors(lat: number): number[] {
    // Northern hemisphere seasonal factors (adjusted for latitude)
    const latFactor = Math.abs(lat) / 90;
    const winterReduction = 0.3 + (latFactor * 0.4); // More reduction at higher latitudes
    
    return [
      0.7, 0.8, 1.0, 1.2, 1.3, 1.4, // Jan-Jun
      1.4, 1.3, 1.1, 0.9, 0.7, 0.6  // Jul-Dec
    ];
  }

  /**
   * Helper: Calculate optimal tilt angle
   */
  private calculateOptimalTilt(lat: number): number {
    // Rule of thumb: latitude ± 15° for seasonal optimization
    return Math.abs(lat);
  }

  /**
   * Helper: Calculate ROI
   */
  private calculateROI(initialCost: number, totalSavings: number): number {
    if (initialCost === 0) return 0;
    return ((totalSavings - initialCost) / initialCost) * 100;
  }

  /**
   * Helper: Parse Google Solar incentives
   */
  private parseIncentives(financialData: any): SolarIncentive[] {
    const incentives: SolarIncentive[] = [];
    
    if (financialData.financialDetails?.federalIncentive?.units) {
      incentives.push({
        type: 'federal_tax_credit',
        amount: financialData.financialDetails.federalIncentive.units,
        description: '30% Federal Solar Tax Credit'
      });
    }
    
    if (financialData.financialDetails?.stateIncentive?.units) {
      incentives.push({
        type: 'state_rebate',
        amount: financialData.financialDetails.stateIncentive.units,
        description: 'State solar incentive'
      });
    }
    
    if (financialData.financialDetails?.netMeteringAllowed) {
      incentives.push({
        type: 'net_metering',
        amount: 0, // Value calculated elsewhere
        description: 'Net metering available'
      });
    }
    
    return incentives;
  }

  /**
   * Helper: Estimate financial analysis for NREL data
   */
  private estimateFinancials(systemSize: number, annualProduction: number): SolarFinancialAnalysis {
    const costPerWatt = 2.5;
    const installationCost = systemSize * 1000 * costPerWatt;
    const annualSavings = annualProduction * 0.12; // $0.12/kWh
    const paybackPeriod = installationCost / annualSavings;
    const twentyYearSavings = (annualSavings * 20) - installationCost;

    return {
      installationCost,
      paybackPeriod,
      roi: ((twentyYearSavings) / installationCost) * 100,
      twentyYearSavings,
      monthlyBill: 150, // Estimate
      monthlySavings: annualSavings / 12,
      netMeteringValue: annualProduction * 0.1,
      incentives: [
        {
          type: 'federal_tax_credit',
          amount: installationCost * 0.3,
          description: '30% Federal Solar Tax Credit'
        }
      ]
    };
  }
}

export default SolarDataClient;