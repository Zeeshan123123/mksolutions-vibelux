/**
 * Boom System PPFD Calculator
 * 
 * Calculates total PPFD delivery for boom-mounted lighting systems
 * that move across crops throughout the day, inspired by Cherry Creek
 * style boom irrigation/lighting systems.
 */

export interface BoomConfiguration {
  // Physical dimensions
  fieldLength: number; // meters
  fieldWidth: number; // meters
  boomWidth: number; // meters (width of boom coverage)
  boomHeight: number; // meters above canopy
  
  // Movement parameters
  movementSpeed: number; // meters per hour
  dailyPasses: number; // number of times boom crosses field per day
  operatingHours: number; // hours per day boom is active
  
  // Lighting specifications
  fixturesPerBoom: number;
  fixtureSpacing: number; // meters between fixtures
  fixturePPFD: number; // μmol/m²/s per fixture at given height
  beamAngle: number; // degrees
  lightingEnabled: boolean;
  
  // Coverage pattern
  overlapPercentage: number; // percentage overlap between passes
  startTime: number; // hour of day (0-23)
  endTime: number; // hour of day (0-23)
}

export interface PPFDCoverageResult {
  totalDLI: number; // mol/m²/day
  averagePPFD: number; // μmol/m²/s during operation
  peakPPFD: number; // μmol/m²/s when boom is directly overhead
  coverageEfficiency: number; // percentage (0-100)
  exposureTime: number; // seconds per pass
  dailyExposureTime: number; // total seconds per day
  
  // Total mols calculations
  totalMolsDelivered: number; // total mols delivered to entire field per day
  molsPerSquareMeter: number; // average mols per m² per day
  totalPhotons: number; // total photons delivered (using Avogadro's number)
  
  // Timeframe-specific calculations
  timeframeAnalysis: {
    hourly: Array<{hour: number, mols: number, ppfd: number}>;
    weekly: number; // total mols per week
    monthly: number; // total mols per month
    seasonal: number; // total mols per season (90 days)
    annual: number; // total mols per year
  };
  
  // Spatial analysis
  coverageMap: number[][]; // 2D array of DLI values
  uniformityIndex: number; // CV (coefficient of variation)
  hotspots: Array<{x: number, y: number, dli: number}>;
  coldspots: Array<{x: number, y: number, dli: number}>;
  
  // Energy metrics
  energyConsumption: number; // kWh per day
  energyEfficiency: number; // μmol/J
  costPerDLI: number; // $ per mol/m²/day
}

export interface BoomSchedule {
  pass: number;
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  direction: 'forward' | 'backward';
  position: Array<{time: number, location: number}>; // time in minutes, location in meters
}

export class BoomPPFDCalculator {
  protected config: BoomConfiguration;
  private schedule: BoomSchedule[] = [];
  
  constructor(config: BoomConfiguration) {
    this.config = config;
    this.generateSchedule();
  }
  
  /**
   * Generate boom movement schedule for the day
   */
  private generateSchedule(): void {
    const { fieldLength, movementSpeed, dailyPasses, startTime, endTime } = this.config;
    
    // Time per pass in hours
    const timePerPass = fieldLength / movementSpeed;
    
    // Available operating window
    const operatingWindow = endTime - startTime;
    
    // Time between passes
    const timeBetweenPasses = operatingWindow / dailyPasses;
    
    this.schedule = [];
    
    for (let pass = 0; pass < dailyPasses; pass++) {
      const passStartTime = startTime + (pass * timeBetweenPasses);
      const passEndTime = passStartTime + timePerPass;
      
      // Alternate direction for efficiency
      const direction = pass % 2 === 0 ? 'forward' : 'backward';
      
      // Generate position data
      const position: Array<{time: number, location: number}> = [];
      const timeSteps = 60; // 1-minute intervals
      
      for (let t = 0; t <= timePerPass * 60; t += timeSteps / 60) {
        const currentTime = passStartTime * 60 + t; // minutes from midnight
        let location: number;
        
        if (direction === 'forward') {
          location = (t / (timePerPass * 60)) * fieldLength;
        } else {
          location = fieldLength - (t / (timePerPass * 60)) * fieldLength;
        }
        
        position.push({
          time: currentTime,
          location: Math.min(fieldLength, Math.max(0, location))
        });
      }
      
      this.schedule.push({
        pass: pass + 1,
        startTime: passStartTime * 60,
        endTime: passEndTime * 60,
        direction,
        position
      });
    }
  }
  
  /**
   * Calculate PPFD coverage for the entire field
   */
  calculateCoverage(): PPFDCoverageResult {
    const { fieldLength, fieldWidth, boomWidth, boomHeight, fixturesPerBoom, fixturePPFD, beamAngle } = this.config;
    
    // Create coverage grid (1m x 1m resolution)
    const gridResolution = 1; // meters
    const gridWidth = Math.ceil(fieldWidth / gridResolution);
    const gridLength = Math.ceil(fieldLength / gridResolution);
    
    // Initialize coverage map
    const coverageMap: number[][] = Array(gridLength).fill(0).map(() => Array(gridWidth).fill(0));
    
    // Calculate light coverage for each boom position
    let totalExposureTime = 0;
    let peakPPFD = 0;
    
    for (const pass of this.schedule) {
      for (let i = 0; i < pass.position.length - 1; i++) {
        const currentPos = pass.position[i];
        const nextPos = pass.position[i + 1];
        const timeStep = nextPos.time - currentPos.time; // minutes
        
        // Calculate light distribution at this position
        const lightDistribution = this.calculateLightDistribution(
          currentPos.location,
          boomHeight,
          fixturesPerBoom,
          fixturePPFD,
          beamAngle
        );
        
        // Add to coverage map
        for (let x = 0; x < gridLength; x++) {
          for (let y = 0; y < gridWidth; y++) {
            const fieldX = x * gridResolution;
            const fieldY = y * gridResolution;
            
            // Check if this point is within boom coverage
            const distanceFromBoom = Math.abs(fieldX - currentPos.location);
            const lateralDistance = Math.abs(fieldY - fieldWidth / 2);
            
            if (distanceFromBoom <= boomWidth / 2 && lateralDistance <= boomWidth / 2) {
              const ppfd = this.calculatePPFDAtPoint(
                fieldX,
                fieldY,
                currentPos.location,
                fieldWidth / 2,
                boomHeight,
                lightDistribution
              );
              
              // Convert PPFD to DLI contribution (timeStep in minutes)
              const dliContribution = (ppfd * timeStep * 60) / 1000000; // mol/m²
              coverageMap[x][y] += dliContribution;
              
              peakPPFD = Math.max(peakPPFD, ppfd);
            }
          }
        }
        
        totalExposureTime += timeStep;
      }
    }
    
    // Calculate metrics
    const totalDLI = this.calculateAverageDLI(coverageMap);
    const averagePPFD = this.calculateAveragePPFD();
    const coverageEfficiency = this.calculateCoverageEfficiency(coverageMap);
    const uniformityIndex = this.calculateUniformityIndex(coverageMap);
    const { hotspots, coldspots } = this.findHotAndColdSpots(coverageMap);
    
    // Calculate total mols of light delivered
    const fieldArea = fieldLength * fieldWidth; // m²
    const totalMolsDelivered = totalDLI * fieldArea; // total mols per day for entire field
    const molsPerSquareMeter = totalDLI; // same as totalDLI (mol/m²/day)
    const totalPhotons = totalMolsDelivered * 6.022e23; // Avogadro's number
    
    // Calculate timeframe-specific totals
    const timeframeAnalysis = this.calculateTimeframeAnalysis(totalMolsDelivered);
    
    // Energy calculations
    const fixtureWattage = fixturePPFD * fixturesPerBoom / 2.5; // Assume 2.5 μmol/J efficacy
    const energyConsumption = (fixtureWattage * this.config.operatingHours) / 1000; // kWh
    const energyEfficiency = (totalDLI * fieldLength * fieldWidth) / energyConsumption;
    const costPerDLI = (energyConsumption * 0.12) / (totalDLI * fieldLength * fieldWidth); // $0.12/kWh
    
    return {
      totalDLI,
      averagePPFD,
      peakPPFD,
      coverageEfficiency,
      exposureTime: totalExposureTime / this.config.dailyPasses,
      dailyExposureTime: totalExposureTime * 60, // seconds
      totalMolsDelivered,
      molsPerSquareMeter,
      totalPhotons,
      timeframeAnalysis,
      coverageMap,
      uniformityIndex,
      hotspots,
      coldspots,
      energyConsumption,
      energyEfficiency,
      costPerDLI
    };
  }
  
  /**
   * Calculate light distribution pattern from boom
   */
  private calculateLightDistribution(
    boomPosition: number,
    height: number,
    fixtureCount: number,
    fixturePPFD: number,
    beamAngle: number
  ): Array<{x: number, y: number, ppfd: number}> {
    const distribution: Array<{x: number, y: number, ppfd: number}> = [];
    const fixtureSpacing = this.config.boomWidth / fixtureCount;
    
    // Calculate contribution from each fixture
    for (let i = 0; i < fixtureCount; i++) {
      const fixtureY = (i - fixtureCount / 2) * fixtureSpacing;
      
      // Light distribution follows inverse square law with beam angle
      const beamRadius = Math.tan((beamAngle * Math.PI) / 360) * height;
      
      for (let x = -beamRadius; x <= beamRadius; x += 0.5) {
        for (let y = -beamRadius; y <= beamRadius; y += 0.5) {
          const distance = Math.sqrt(x*x + y*y + height*height);
          const groundDistance = Math.sqrt(x*x + y*y);
          
          if (groundDistance <= beamRadius) {
            // Cosine law for angled surfaces
            const cosineAngle = height / distance;
            const ppfd = (fixturePPFD * cosineAngle) / Math.pow(distance / height, 2);
            
            distribution.push({
              x: boomPosition + x,
              y: fixtureY + y,
              ppfd: Math.max(0, ppfd)
            });
          }
        }
      }
    }
    
    return distribution;
  }
  
  /**
   * Calculate PPFD at a specific point
   */
  private calculatePPFDAtPoint(
    pointX: number,
    pointY: number,
    boomX: number,
    boomY: number,
    height: number,
    lightDistribution: Array<{x: number, y: number, ppfd: number}>
  ): number {
    let totalPPFD = 0;
    
    for (const light of lightDistribution) {
      const distance = Math.sqrt(
        Math.pow(pointX - light.x, 2) + 
        Math.pow(pointY - light.y, 2)
      );
      
      if (distance <= 2) { // Within 2m influence radius
        const influence = Math.exp(-distance / 2); // Exponential decay
        totalPPFD += light.ppfd * influence;
      }
    }
    
    return totalPPFD;
  }
  
  /**
   * Calculate average DLI across the field
   */
  private calculateAverageDLI(coverageMap: number[][]): number {
    let totalDLI = 0;
    let cellCount = 0;
    
    for (const row of coverageMap) {
      for (const cell of row) {
        totalDLI += cell;
        cellCount++;
      }
    }
    
    return cellCount > 0 ? totalDLI / cellCount : 0;
  }
  
  /**
   * Calculate average PPFD during operation
   */
  private calculateAveragePPFD(): number {
    const { fixturePPFD, fixturesPerBoom } = this.config;
    const boomPPFD = fixturePPFD * fixturesPerBoom;
    
    // Account for movement - point receives direct light for fraction of time
    const operatingTime = this.config.operatingHours * 60; // minutes
    const totalExposureTime = operatingTime / this.config.dailyPasses; // exposure per pass
    
    return boomPPFD * (totalExposureTime / (24 * 60)); // weighted by daily fraction
  }

  /**
   * Calculate timeframe-specific mols analysis
   */
  private calculateTimeframeAnalysis(totalMolsPerDay: number): {
    hourly: Array<{hour: number, mols: number, ppfd: number}>;
    weekly: number;
    monthly: number;
    seasonal: number;
    annual: number;
  } {
    const hourly: Array<{hour: number, mols: number, ppfd: number}> = [];
    
    // Calculate hourly breakdown based on boom schedule
    for (let hour = 0; hour < 24; hour++) {
      let hourlyMols = 0;
      let hourlyPPFD = 0;
      
      // Check if boom is active during this hour
      for (const pass of this.schedule) {
        const passStartHour = Math.floor(pass.startTime / 60);
        const passEndHour = Math.floor(pass.endTime / 60);
        
        if (hour >= passStartHour && hour <= passEndHour) {
          // Calculate fraction of hour that boom is active
          const hourStart = hour * 60;
          const hourEnd = (hour + 1) * 60;
          const activeStart = Math.max(hourStart, pass.startTime);
          const activeEnd = Math.min(hourEnd, pass.endTime);
          const activeFraction = (activeEnd - activeStart) / 60; // fraction of hour
          
          if (activeFraction > 0) {
            const hourlyFraction = activeFraction / 24; // fraction of day
            hourlyMols = totalMolsPerDay * hourlyFraction;
            hourlyPPFD = this.config.fixturePPFD * this.config.fixturesPerBoom * activeFraction;
          }
        }
      }
      
      hourly.push({ hour, mols: hourlyMols, ppfd: hourlyPPFD });
    }
    
    // Calculate longer timeframes
    const weekly = totalMolsPerDay * 7;
    const monthly = totalMolsPerDay * 30;
    const seasonal = totalMolsPerDay * 90;
    const annual = totalMolsPerDay * 365;
    
    return {
      hourly,
      weekly,
      monthly,
      seasonal,
      annual
    };
  }
  
  /**
   * Calculate coverage efficiency
   */
  private calculateCoverageEfficiency(coverageMap: number[][]): number {
    const targetDLI = 20; // mol/m²/day (typical requirement)
    let adequatelyCovered = 0;
    let totalCells = 0;
    
    for (const row of coverageMap) {
      for (const cell of row) {
        if (cell >= targetDLI * 0.8) { // 80% of target
          adequatelyCovered++;
        }
        totalCells++;
      }
    }
    
    return (adequatelyCovered / totalCells) * 100;
  }
  
  /**
   * Calculate uniformity index (coefficient of variation)
   */
  private calculateUniformityIndex(coverageMap: number[][]): number {
    const values: number[] = [];
    
    for (const row of coverageMap) {
      for (const cell of row) {
        if (cell > 0) values.push(cell);
      }
    }
    
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? (stdDev / mean) * 100 : 0;
  }
  
  /**
   * Find hot and cold spots in coverage
   */
  private findHotAndColdSpots(coverageMap: number[][]): {
    hotspots: Array<{x: number, y: number, dli: number}>;
    coldspots: Array<{x: number, y: number, dli: number}>;
  } {
    const hotspots: Array<{x: number, y: number, dli: number}> = [];
    const coldspots: Array<{x: number, y: number, dli: number}> = [];
    
    let maxDLI = 0;
    let minDLI = Infinity;
    
    // Find min and max
    for (let x = 0; x < coverageMap.length; x++) {
      for (let y = 0; y < coverageMap[x].length; y++) {
        const dli = coverageMap[x][y];
        if (dli > 0) {
          maxDLI = Math.max(maxDLI, dli);
          minDLI = Math.min(minDLI, dli);
        }
      }
    }
    
    const threshold = (maxDLI - minDLI) * 0.1; // 10% threshold
    
    // Find hotspots and coldspots
    for (let x = 0; x < coverageMap.length; x++) {
      for (let y = 0; y < coverageMap[x].length; y++) {
        const dli = coverageMap[x][y];
        
        if (dli > maxDLI - threshold && hotspots.length < 10) {
          hotspots.push({ x, y, dli });
        }
        
        if (dli < minDLI + threshold && dli > 0 && coldspots.length < 10) {
          coldspots.push({ x, y, dli });
        }
      }
    }
    
    return { hotspots, coldspots };
  }
  
  /**
   * Get boom schedule for display
   */
  getSchedule(): BoomSchedule[] {
    return this.schedule;
  }

  /**
   * Calculate total mols delivered over custom timeframe
   */
  calculateMolsOverTimeframe(
    startDate: Date,
    endDate: Date,
    includeWeekends: boolean = true
  ): {
    totalMols: number;
    totalPhotons: number;
    averageDailyMols: number;
    timeframeDays: number;
    breakdown: {
      weekdays: number;
      weekends: number;
      dailyAverage: number;
    };
  } {
    const result = this.calculateCoverage();
    const dailyMols = result.totalMolsDelivered;
    
    // Calculate timeframe in days
    const timeDiff = endDate.getTime() - startDate.getTime();
    const timeframeDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Count weekdays and weekends
    let weekdays = 0;
    let weekends = 0;
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends++;
      } else {
        weekdays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate total mols based on operating schedule
    let totalMols = 0;
    if (includeWeekends) {
      totalMols = dailyMols * timeframeDays;
    } else {
      totalMols = dailyMols * weekdays;
    }
    
    const totalPhotons = totalMols * 6.022e23;
    const averageDailyMols = totalMols / timeframeDays;
    
    return {
      totalMols,
      totalPhotons,
      averageDailyMols,
      timeframeDays,
      breakdown: {
        weekdays: dailyMols * weekdays,
        weekends: dailyMols * weekends,
        dailyAverage: dailyMols
      }
    };
  }

  /**
   * Calculate cumulative mols delivery over time
   */
  calculateCumulativeMols(days: number): Array<{
    day: number;
    dailyMols: number;
    cumulativeMols: number;
    cumulativePhotons: number;
  }> {
    const result = this.calculateCoverage();
    const dailyMols = result.totalMolsDelivered;
    
    const cumulativeData: Array<{
      day: number;
      dailyMols: number;
      cumulativeMols: number;
      cumulativePhotons: number;
    }> = [];
    
    let cumulative = 0;
    
    for (let day = 1; day <= days; day++) {
      cumulative += dailyMols;
      cumulativeData.push({
        day,
        dailyMols,
        cumulativeMols: cumulative,
        cumulativePhotons: cumulative * 6.022e23
      });
    }
    
    return cumulativeData;
  }
  
  /**
   * Optimize boom configuration for target DLI
   */
  optimizeForTargetDLI(targetDLI: number): BoomConfiguration {
    const optimized = { ...this.config };
    
    // Iteratively adjust parameters
    let currentResult = this.calculateCoverage();
    let iterations = 0;
    const maxIterations = 50;
    
    while (Math.abs(currentResult.totalDLI - targetDLI) > 0.5 && iterations < maxIterations) {
      if (currentResult.totalDLI < targetDLI) {
        // Increase light intensity or passes
        if (optimized.fixturePPFD < 2000) {
          optimized.fixturePPFD *= 1.1;
        } else {
          optimized.dailyPasses = Math.min(optimized.dailyPasses + 1, 10);
        }
      } else {
        // Decrease light intensity or passes
        if (optimized.dailyPasses > 1) {
          optimized.dailyPasses = Math.max(optimized.dailyPasses - 1, 1);
        } else {
          optimized.fixturePPFD *= 0.9;
        }
      }
      
      // Recalculate with new parameters
      const tempCalculator = new BoomPPFDCalculator(optimized);
      currentResult = tempCalculator.calculateCoverage();
      iterations++;
    }
    
    return optimized;
  }
}

/**
 * Cherry Creek Style Boom System Calculator
 * Specialized for irrigation boom with integrated lighting
 */
export class CherryCreekBoomCalculator extends BoomPPFDCalculator {
  constructor(config: BoomConfiguration) {
    super(config);
  }
  
  /**
   * Calculate water + light coverage efficiency
   */
  calculateIntegratedEfficiency(): {
    lightingEfficiency: number;
    irrigationEfficiency: number;
    combinedEfficiency: number;
    energySavings: number;
  } {
    const result = this.calculateCoverage();
    
    // Lighting efficiency
    const lightingEfficiency = result.coverageEfficiency;
    
    // Irrigation efficiency (estimated)
    const irrigationEfficiency = 95; // Boom irrigation is highly efficient
    
    // Combined efficiency considers both systems
    const combinedEfficiency = (lightingEfficiency + irrigationEfficiency) / 2;
    
    // Energy savings from integrated system
    const energySavings = 0.15; // 15% savings from shared infrastructure
    
    return {
      lightingEfficiency,
      irrigationEfficiency,
      combinedEfficiency,
      energySavings
    };
  }
  
  /**
   * Generate irrigation schedule aligned with lighting
   */
  generateIrrigationSchedule(): Array<{
    time: number;
    duration: number;
    waterAmount: number;
    lightingActive: boolean;
  }> {
    const schedule = this.getSchedule();
    const irrigationSchedule: Array<{
      time: number;
      duration: number;
      waterAmount: number;
      lightingActive: boolean;
    }> = [];
    
    for (const pass of schedule) {
      // Irrigation occurs during boom passes
      irrigationSchedule.push({
        time: pass.startTime,
        duration: pass.endTime - pass.startTime,
        waterAmount: 5, // L/m² per pass
        lightingActive: this.config.lightingEnabled
      });
    }
    
    return irrigationSchedule;
  }
}

/**
 * Utility functions for boom system analysis
 */
export const BoomSystemUtils = {
  /**
   * Calculate ROI for boom lighting system
   */
  calculateROI(
    config: BoomConfiguration,
    result: PPFDCoverageResult,
    cropValue: number, // $/kg
    yieldIncrease: number // percentage
  ): {
    initialCost: number;
    annualSavings: number;
    paybackPeriod: number;
    roi: number;
  } {
    const fieldArea = config.fieldLength * config.fieldWidth;
    const fixtureCount = config.fixturesPerBoom;
    const costPerFixture = 500; // USD
    const installationCost = fieldArea * 50; // USD per m²
    
    const initialCost = (fixtureCount * costPerFixture) + installationCost;
    
    // Calculate annual benefits
    const baseYield = fieldArea * 50; // kg/m²/year
    const increasedYield = baseYield * (yieldIncrease / 100);
    const yieldValue = increasedYield * cropValue;
    
    const energyCost = result.energyConsumption * 365 * 0.12; // $0.12/kWh
    const annualSavings = yieldValue - energyCost;
    
    const paybackPeriod = initialCost / annualSavings;
    const roi = (annualSavings / initialCost) * 100;
    
    return {
      initialCost,
      annualSavings,
      paybackPeriod,
      roi
    };
  },
  
  /**
   * Compare boom vs fixed lighting systems
   */
  compareToFixedLighting(
    boomConfig: BoomConfiguration,
    boomResult: PPFDCoverageResult
  ): {
    boomAdvantages: string[];
    fixedAdvantages: string[];
    recommendedSystem: 'boom' | 'fixed';
    reasoning: string;
  } {
    const boomAdvantages = [
      'Lower initial fixture cost',
      'Integrated irrigation capability',
      'Uniform coverage with movement',
      'Easier maintenance access',
      'Flexible positioning'
    ];
    
    const fixedAdvantages = [
      'Higher light intensity possible',
      'No moving parts',
      'Continuous lighting',
      'Lower operational complexity',
      'Better for short-cycle crops'
    ];
    
    // Decision logic
    const fieldArea = boomConfig.fieldLength * boomConfig.fieldWidth;
    const recommendedSystem = fieldArea > 1000 ? 'boom' : 'fixed';
    
    const reasoning = fieldArea > 1000 ? 
      'Large field benefits from boom system mobility and integrated irrigation' :
      'Smaller field better suited for fixed lighting with higher intensity';
    
    return {
      boomAdvantages,
      fixedAdvantages,
      recommendedSystem,
      reasoning
    };
  }
};