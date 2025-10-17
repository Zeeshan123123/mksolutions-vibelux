/**
 * Moving Rack Lighting System Design
 * Professional lighting calculations for 5-rack x 8-level growing system
 * Target: 300 PPFD using DLC-qualified fixtures
 */

export interface RackSystemSpecs {
  // System dimensions
  rackCount: number;
  levelsPerRack: number;
  rackWidth: number;        // meters
  rackDepth: number;        // meters  
  levelHeight: number;      // meters between levels
  totalSystemLength: number; // meters
  
  // Growing parameters
  targetPPFD: number;       // μmol/m²/s
  cropType: 'leafy-greens' | 'herbs' | 'microgreens' | 'strawberries';
  uniformityRequirement: number; // % (typically 85-90%)
  
  // Movement parameters
  rackMovementRange: number; // meters
  movementSpeed: number;     // m/min
  isStationary: boolean;
}

export interface LEDFixture {
  // DLC fixture specifications
  model: string;
  manufacturer: string;
  dlcQualified: boolean;
  
  // Performance specs
  powerConsumption: number;  // watts
  ppf: number;              // μmol/s total photon flux
  efficacy: number;         // μmol/J
  lifespan: number;         // hours (L90)
  
  // Physical dimensions
  length: number;           // meters
  width: number;            // meters
  height: number;           // meters
  weight: number;           // kg
  
  // Optical characteristics
  beamAngle: number;        // degrees
  ppfdAtDistance: Array<{
    distance: number;       // meters
    centerPPFD: number;     // μmol/m²/s
    averagePPFD: number;    // μmol/m²/s over coverage area
  }>;
  
  // Installation specs
  mountingType: 'suspended' | 'surface-mount' | 'track-mount';
  coolingType: 'passive' | 'active';
  dimmingCapability: boolean;
  ipRating: string;
  operatingTemp: [number, number]; // [min, max] °C
}

export interface LightingLayout {
  rackId: string;
  levelId: string;
  fixtures: Array<{
    fixtureId: string;
    model: string;
    position: {
      x: number;    // meters from rack origin
      y: number;    // meters from rack origin
      z: number;    // height above growing surface
    };
    orientation: number; // degrees rotation
    dimmingLevel: number; // 0-100%
    coverageArea: {
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    };
  }>;
  totalPowerDraw: number;
  averagePPFD: number;
  uniformityRatio: number;
  dailyEnergyConsumption: number; // kWh
}

export class MovingRackLightingDesigner {
  private rackSpecs: RackSystemSpecs;
  private availableFixtures: Map<string, LEDFixture> = new Map();
  
  constructor(rackSpecs: RackSystemSpecs) {
    this.rackSpecs = rackSpecs;
    this.initializeDLCFixtures();
  }
  
  /**
   * Initialize DLC-qualified fixtures suitable for multi-tier systems
   */
  private initializeDLCFixtures() {
    // Fluence SPYDR 2i - Ideal for multi-tier, ultra-low profile
    this.availableFixtures.set('fluence_spydr_2i', {
      model: 'SPYDR 2i',
      manufacturer: 'Fluence',
      dlcQualified: true,
      powerConsumption: 345,
      ppf: 860,
      efficacy: 2.7,
      lifespan: 50000,
      length: 1.12, // 44 inches
      width: 1.12,  // 44 inches  
      height: 0.033, // 1.3 inches - ultra thin
      weight: 18.1,
      beamAngle: 120,
      ppfdAtDistance: [
        { distance: 0.15, centerPPFD: 1040, averagePPFD: 780 }, // 6 inches
        { distance: 0.30, centerPPFD: 520, averagePPFD: 400 },  // 12 inches
        { distance: 0.46, centerPPFD: 300, averagePPFD: 240 },  // 18 inches
        { distance: 0.61, centerPPFD: 200, averagePPFD: 160 }   // 24 inches
      ],
      mountingType: 'suspended',
      coolingType: 'passive',
      dimmingCapability: true,
      ipRating: 'IP65',
      operatingTemp: [0, 40]
    });
    
    // Verjure Arize Life2 - Excellent for vertical farming
    this.availableFixtures.set('verjure_arize_life2', {
      model: 'Arize Life2',
      manufacturer: 'Verjure',
      dlcQualified: true,
      powerConsumption: 280,
      ppf: 720,
      efficacy: 3.2,
      lifespan: 50000,
      length: 1.22, // 48 inches
      width: 0.15,  // 6 inches - linear design
      height: 0.08, // 3.15 inches
      weight: 12.5,
      beamAngle: 110,
      ppfdAtDistance: [
        { distance: 0.15, centerPPFD: 850, averagePPFD: 650 },
        { distance: 0.30, centerPPFD: 425, averagePPFD: 325 },
        { distance: 0.46, centerPPFD: 275, averagePPFD: 220 },
        { distance: 0.61, centerPPFD: 180, averagePPFD: 145 }
      ],
      mountingType: 'surface-mount',
      coolingType: 'passive',
      dimmingCapability: true,
      ipRating: 'IP66',
      operatingTemp: [-10, 45]
    });
    
    // Gavita Pro 1700e LED - Commercial grade
    this.availableFixtures.set('gavita_pro_1700e', {
      model: 'Pro 1700e LED',
      manufacturer: 'Gavita',
      dlcQualified: true,
      powerConsumption: 645,
      ppf: 1700,
      efficacy: 2.6,
      lifespan: 54000,
      length: 1.12,
      width: 1.12,
      height: 0.089, // 3.5 inches
      weight: 28.6,
      beamAngle: 115,
      ppfdAtDistance: [
        { distance: 0.30, centerPPFD: 800, averagePPFD: 600 },
        { distance: 0.46, centerPPFD: 500, averagePPFD: 380 },
        { distance: 0.61, centerPPFD: 350, averagePPFD: 280 },
        { distance: 0.76, centerPPFD: 250, averagePPFD: 200 }
      ],
      mountingType: 'suspended',
      coolingType: 'passive',
      dimmingCapability: true,
      ipRating: 'IP65',
      operatingTemp: [0, 40]
    });
  }
  
  /**
   * Calculate optimal fixture placement for target PPFD
   */
  calculateFixtureLayout(selectedFixture: string): LightingLayout[] {
    const fixture = this.availableFixtures.get(selectedFixture);
    if (!fixture) {
      throw new Error(`Fixture ${selectedFixture} not found`);
    }
    
    const layouts: LightingLayout[] = [];
    
    // Calculate for each rack and level
    for (let rackIndex = 0; rackIndex < this.rackSpecs.rackCount; rackIndex++) {
      for (let levelIndex = 0; levelIndex < this.rackSpecs.levelsPerRack; levelIndex++) {
        const layout = this.calculateLevelLayout(
          rackIndex, 
          levelIndex, 
          fixture
        );
        layouts.push(layout);
      }
    }
    
    return layouts;
  }
  
  /**
   * Calculate lighting layout for a single growing level
   */
  private calculateLevelLayout(
    rackIndex: number, 
    levelIndex: number, 
    fixture: LEDFixture
  ): LightingLayout {
    const rackId = `rack-${rackIndex + 1}`;
    const levelId = `level-${levelIndex + 1}`;
    
    // Calculate optimal mounting height for target PPFD
    const mountingHeight = this.calculateOptimalHeight(fixture, this.rackSpecs.targetPPFD);
    
    // Calculate fixture spacing and quantity needed
    const { fixturesPerRow, fixturesPerColumn, spacing } = this.calculateFixtureGrid(
      fixture, 
      mountingHeight
    );
    
    const fixturePositions = [];
    let totalPowerDraw = 0;
    
    // Generate fixture positions
    for (let row = 0; row < fixturesPerRow; row++) {
      for (let col = 0; col < fixturesPerColumn; col++) {
        const fixtureId = `${rackId}-${levelId}-fixture-${row}-${col}`;
        
        const position = {
          x: (col + 0.5) * spacing.x,
          y: (row + 0.5) * spacing.y,
          z: mountingHeight
        };
        
        // Calculate dimming level for uniform PPFD
        const dimmingLevel = this.calculateDimmingLevel(
          fixture,
          position,
          this.rackSpecs.targetPPFD
        );
        
        fixturePositions.push({
          fixtureId,
          model: fixture.model,
          position,
          orientation: 0,
          dimmingLevel,
          coverageArea: {
            centerX: position.x,
            centerY: position.y,
            width: spacing.x,
            height: spacing.y
          }
        });
        
        totalPowerDraw += fixture.powerConsumption * (dimmingLevel / 100);
      }
    }
    
    // Calculate performance metrics
    const averagePPFD = this.calculateAveragePPFD(fixturePositions, fixture);
    const uniformityRatio = this.calculateUniformity(fixturePositions, fixture);
    const dailyEnergyConsumption = (totalPowerDraw * 16) / 1000; // 16-hour photoperiod
    
    return {
      rackId,
      levelId,
      fixtures: fixturePositions,
      totalPowerDraw,
      averagePPFD,
      uniformityRatio,
      dailyEnergyConsumption
    };
  }
  
  /**
   * Calculate optimal mounting height for target PPFD
   */
  private calculateOptimalHeight(fixture: LEDFixture, targetPPFD: number): number {
    // Find height where average PPFD matches target
    for (const measurement of fixture.ppfdAtDistance) {
      if (measurement.averagePPFD <= targetPPFD * 1.1 && 
          measurement.averagePPFD >= targetPPFD * 0.9) {
        return measurement.distance;
      }
    }
    
    // Interpolate if exact match not found
    const sorted = fixture.ppfdAtDistance.sort((a, b) => a.averagePPFD - b.averagePPFD);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const lower = sorted[i];
      const upper = sorted[i + 1];
      
      if (targetPPFD >= lower.averagePPFD && targetPPFD <= upper.averagePPFD) {
        const ratio = (targetPPFD - lower.averagePPFD) / (upper.averagePPFD - lower.averagePPFD);
        return lower.distance + (upper.distance - lower.distance) * ratio;
      }
    }
    
    // Default to middle distance if calculation fails
    return 0.46; // 18 inches
  }
  
  /**
   * Calculate fixture grid layout
   */
  private calculateFixtureGrid(fixture: LEDFixture, mountingHeight: number): {
    fixturesPerRow: number;
    fixturesPerColumn: number;
    spacing: { x: number; y: number };
  } {
    // Calculate coverage area at mounting height
    const coverageRadius = mountingHeight * Math.tan((fixture.beamAngle / 2) * Math.PI / 180);
    const coverageArea = coverageRadius * 2;
    
    // Account for overlap for uniformity (typically 20-30% overlap)
    const overlapFactor = 0.75; // 25% overlap
    const effectiveCoverage = coverageArea * overlapFactor;
    
    const fixturesPerRow = Math.ceil(this.rackSpecs.rackDepth / effectiveCoverage);
    const fixturesPerColumn = Math.ceil(this.rackSpecs.rackWidth / effectiveCoverage);
    
    return {
      fixturesPerRow,
      fixturesPerColumn,
      spacing: {
        x: this.rackSpecs.rackWidth / fixturesPerColumn,
        y: this.rackSpecs.rackDepth / fixturesPerRow
      }
    };
  }
  
  /**
   * Calculate dimming level for uniform PPFD
   */
  private calculateDimmingLevel(
    fixture: LEDFixture, 
    position: { x: number; y: number; z: number }, 
    targetPPFD: number
  ): number {
    // Find PPFD at this distance
    const distance = position.z;
    let currentPPFD = 0;
    
    for (const measurement of fixture.ppfdAtDistance) {
      if (Math.abs(measurement.distance - distance) < 0.05) {
        currentPPFD = measurement.averagePPFD;
        break;
      }
    }
    
    if (currentPPFD === 0) {
      // Interpolate PPFD value
      const sorted = fixture.ppfdAtDistance.sort((a, b) => a.distance - b.distance);
      for (let i = 0; i < sorted.length - 1; i++) {
        const lower = sorted[i];
        const upper = sorted[i + 1];
        
        if (distance >= lower.distance && distance <= upper.distance) {
          const ratio = (distance - lower.distance) / (upper.distance - lower.distance);
          currentPPFD = lower.averagePPFD + (upper.averagePPFD - lower.averagePPFD) * ratio;
          break;
        }
      }
    }
    
    const dimmingLevel = Math.min(100, Math.max(20, (targetPPFD / currentPPFD) * 100));
    return Math.round(dimmingLevel);
  }
  
  /**
   * Calculate average PPFD across growing area
   */
  private calculateAveragePPFD(fixtures: any[], fixture: LEDFixture): number {
    // Simplified calculation - in reality would use photometric modeling
    const totalPPF = fixtures.reduce((sum, f) => {
      return sum + (fixture.ppf * (f.dimmingLevel / 100));
    }, 0);
    
    const totalArea = this.rackSpecs.rackWidth * this.rackSpecs.rackDepth;
    return totalPPF / totalArea;
  }
  
  /**
   * Calculate PPFD uniformity ratio (min/avg)
   */
  private calculateUniformity(fixtures: any[], fixture: LEDFixture): number {
    // Simplified uniformity calculation
    // In practice, would calculate PPFD at multiple points across canopy
    const dimmingLevels = fixtures.map(f => f.dimmingLevel);
    const minDimming = Math.min(...dimmingLevels);
    const avgDimming = dimmingLevels.reduce((sum, d) => sum + d, 0) / dimmingLevels.length;
    
    return minDimming / avgDimming;
  }
  
  /**
   * Get complete system analysis
   */
  getSystemAnalysis(selectedFixture: string): {
    systemSpecs: RackSystemSpecs;
    fixture: LEDFixture;
    layouts: LightingLayout[];
    totalMetrics: {
      totalFixtures: number;
      totalPowerDraw: number;
      dailyEnergyConsumption: number;
      annualEnergyCost: number;
      averagePPFD: number;
      systemUniformity: number;
      dlcRebateEligible: boolean;
      estimatedInstallationCost: number;
    };
  } {
    const fixture = this.availableFixtures.get(selectedFixture);
    if (!fixture) {
      throw new Error(`Fixture ${selectedFixture} not found`);
    }
    
    const layouts = this.calculateFixtureLayout(selectedFixture);
    
    // Calculate system totals
    const totalFixtures = layouts.reduce((sum, layout) => sum + layout.fixtures.length, 0);
    const totalPowerDraw = layouts.reduce((sum, layout) => sum + layout.totalPowerDraw, 0);
    const dailyEnergyConsumption = layouts.reduce((sum, layout) => sum + layout.dailyEnergyConsumption, 0);
    const averagePPFD = layouts.reduce((sum, layout) => sum + layout.averagePPFD, 0) / layouts.length;
    const systemUniformity = layouts.reduce((sum, layout) => sum + layout.uniformityRatio, 0) / layouts.length;
    
    // Cost calculations (rough estimates)
    const energyRate = 0.12; // $0.12/kWh
    const annualEnergyCost = dailyEnergyConsumption * 365 * energyRate;
    const estimatedInstallationCost = totalFixtures * 800; // $800 per fixture installed
    
    return {
      systemSpecs: this.rackSpecs,
      fixture,
      layouts,
      totalMetrics: {
        totalFixtures,
        totalPowerDraw,
        dailyEnergyConsumption,
        annualEnergyCost,
        averagePPFD,
        systemUniformity,
        dlcRebateEligible: fixture.dlcQualified,
        estimatedInstallationCost
      }
    };
  }
  
  /**
   * Get fixture recommendations based on system requirements
   */
  getFixtureRecommendations(): Array<{
    fixtureKey: string;
    fixture: LEDFixture;
    suitabilityScore: number;
    pros: string[];
    cons: string[];
    estimatedCost: number;
  }> {
    const recommendations = [];
    
    for (const [key, fixture] of this.availableFixtures) {
      const analysis = this.analyzeFixtureSuitability(fixture);
      recommendations.push({
        fixtureKey: key,
        fixture,
        suitabilityScore: analysis.score,
        pros: analysis.pros,
        cons: analysis.cons,
        estimatedCost: this.estimateFixtureCost(fixture)
      });
    }
    
    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
  
  private analyzeFixtureSuitability(fixture: LEDFixture): {
    score: number;
    pros: string[];
    cons: string[];
  } {
    const pros = [];
    const cons = [];
    let score = 0;
    
    // Efficacy scoring (30% weight)
    if (fixture.efficacy >= 3.0) {
      pros.push(`Excellent efficacy: ${fixture.efficacy} μmol/J`);
      score += 30;
    } else if (fixture.efficacy >= 2.5) {
      pros.push(`Good efficacy: ${fixture.efficacy} μmol/J`);
      score += 25;
    } else {
      cons.push(`Lower efficacy: ${fixture.efficacy} μmol/J`);
      score += 15;
    }
    
    // Size suitability for multi-tier (25% weight)
    if (fixture.height <= 0.05) {
      pros.push(`Ultra-low profile: ${(fixture.height * 100).toFixed(1)} cm height`);
      score += 25;
    } else if (fixture.height <= 0.08) {
      pros.push(`Low profile design suitable for multi-tier`);
      score += 20;
    } else {
      cons.push(`Higher profile may limit shelf spacing`);
      score += 10;
    }
    
    // DLC qualification (20% weight)
    if (fixture.dlcQualified) {
      pros.push('DLC qualified - eligible for utility rebates');
      score += 20;
    } else {
      cons.push('Not DLC qualified - no rebate eligibility');
    }
    
    // Dimming capability (15% weight)
    if (fixture.dimmingCapability) {
      pros.push('Full dimming control for precise PPFD');
      score += 15;
    } else {
      cons.push('No dimming capability');
    }
    
    // Cooling and reliability (10% weight)
    if (fixture.coolingType === 'passive') {
      pros.push('Passive cooling - no moving parts');
      score += 10;
    } else {
      cons.push('Active cooling - potential maintenance issues');
      score += 5;
    }
    
    return { score, pros, cons };
  }
  
  private estimateFixtureCost(fixture: LEDFixture): number {
    // Rough cost estimation based on power and efficacy
    const baseCostPerWatt = 2.5; // $2.50 per watt
    const efficacyMultiplier = fixture.efficacy / 2.5; // Price premium for efficiency
    const dlcPremium = fixture.dlcQualified ? 1.1 : 1.0;
    
    return Math.round(
      fixture.powerConsumption * baseCostPerWatt * efficacyMultiplier * dlcPremium
    );
  }
}

// Standard rack system configurations
export const standardRackConfigs: Record<string, RackSystemSpecs> = {
  'leafy_greens_5x8': {
    rackCount: 5,
    levelsPerRack: 8,
    rackWidth: 2.4,        // 8 feet
    rackDepth: 1.2,        // 4 feet
    levelHeight: 0.4,      // 16 inches between levels
    totalSystemLength: 12, // 40 feet total
    targetPPFD: 300,
    cropType: 'leafy-greens',
    uniformityRequirement: 85,
    rackMovementRange: 2.0,
    movementSpeed: 0.5,
    isStationary: false
  },
  
  'microgreens_5x8': {
    rackCount: 5,
    levelsPerRack: 8,
    rackWidth: 2.4,
    rackDepth: 1.2,
    levelHeight: 0.25,     // 10 inches - tighter spacing for microgreens
    totalSystemLength: 12,
    targetPPFD: 250,       // Lower light requirement
    cropType: 'microgreens',
    uniformityRequirement: 90,
    rackMovementRange: 2.0,
    movementSpeed: 0.5,
    isStationary: false
  },
  
  'herbs_5x8': {
    rackCount: 5,
    levelsPerRack: 8,
    rackWidth: 2.4,
    rackDepth: 1.2,
    levelHeight: 0.5,      // 20 inches for taller herbs
    totalSystemLength: 12,
    targetPPFD: 350,       // Higher light requirement
    cropType: 'herbs',
    uniformityRequirement: 85,
    rackMovementRange: 2.0,
    movementSpeed: 0.5,
    isStationary: false
  }
};