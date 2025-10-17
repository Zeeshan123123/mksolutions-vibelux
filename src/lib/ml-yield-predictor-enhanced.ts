/**
 * Enhanced Machine Learning Yield Prediction System
 * Incorporates comprehensive plant science models
 */

import { MLYieldPredictorBase } from './ml-yield-predictor-base'

interface EnhancedYieldInput {
  // Basic environmental
  ppfd: number
  dli: number
  temperature: number
  co2: number
  vpd: number
  spectrum: {
    red: number
    blue: number
    green: number
    farRed: number
    uv: number
    white: number
  }
  
  // Water relations
  waterAvailability: number // 0-1 scale
  substrateMoisture: number // percentage
  relativeHumidity: number
  
  // Nutrients
  ec: number // electrical conductivity
  ph: number
  nutrients: {
    nitrogen: number
    phosphorus: number
    potassium: number
    calcium: number
    magnesium: number
    sulfur: number
  }
  
  // Plant factors
  leafAreaIndex: number
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest'
  plantAge: number // days
  
  // Advanced environmental
  photoperiod: number // hours
  rootZoneTemp: number
  oxygenLevel: number // root zone O2
  airFlow: number // m/s
}

export class EnhancedMLYieldPredictor extends MLYieldPredictorBase {
  
  
  /**
   * Transpiration and water use efficiency
   * Based on Penman-Monteith equation
   */
  private calculateTranspirationEffect(
    vpd: number,
    temperature: number,
    windSpeed: number,
    leafAreaIndex: number,
    waterAvailability: number
  ): { transpiration: number; wue: number } {
    // Simplified Penman-Monteith
    const gamma = 0.066 // Psychrometric constant (kPa/°C)
    const lambda = 2.45 // Latent heat of vaporization (MJ/kg)
    
    // Stomatal resistance increases with water stress
    const rs = 100 * (1 + 3 * (1 - waterAvailability)) // s/m
    
    // Aerodynamic resistance
    const ra = 208 / (windSpeed + 0.1) // s/m
    
    // Net radiation (simplified)
    const Rn = 15 // MJ/m²/day (typical greenhouse)
    
    // Slope of saturation vapor pressure curve
    const delta = 4098 * (0.6108 * Math.exp(17.27 * temperature / (temperature + 237.3))) / 
                  Math.pow(temperature + 237.3, 2)
    
    // Transpiration rate (mm/day)
    const ET = (delta * Rn + gamma * vpd * 86.4 / ra) / 
               (lambda * (delta + gamma * (1 + rs / ra)))
    
    // Adjust for LAI
    const transpiration = ET * (1 - Math.exp(-0.5 * leafAreaIndex))
    
    // Water use efficiency (g biomass/kg water)
    const wue = 3.0 * waterAvailability * (1 - vpd / 4)
    
    return { transpiration, wue }
  }
  
  /**
   * Nutrient uptake kinetics
   * Michaelis-Menten with ion interactions
   */
  private calculateNutrientEffect(
    nutrients: any,
    ph: number,
    ec: number,
    waterAvailability: number
  ): number {
    // pH effects on availability
    const phOptimal = 6.0
    const phEffect = Math.exp(-0.5 * Math.pow((ph - phOptimal) / 1.5, 2))
    
    // EC stress
    const ecOptimal = 1.8
    const ecEffect = ec < ecOptimal ? ec / ecOptimal : 
                     Math.max(0.5, 1 - (ec - ecOptimal) / 4)
    
    // Individual nutrient effects (Michaelis-Menten)
    const nutrientEffects = {
      N: nutrients.nitrogen / (nutrients.nitrogen + 50),
      P: nutrients.phosphorus / (nutrients.phosphorus + 10),
      K: nutrients.potassium / (nutrients.potassium + 100),
      Ca: nutrients.calcium / (nutrients.calcium + 80),
      Mg: nutrients.magnesium / (nutrients.magnesium + 30),
      S: nutrients.sulfur / (nutrients.sulfur + 20)
    }
    
    // Check antagonistic interactions
    const kCaRatio = nutrients.potassium / (nutrients.calcium + 1)
    const caMgRatio = nutrients.calcium / (nutrients.magnesium + 1)
    
    const ratioEffect = Math.min(1,
      kCaRatio > 0.5 && kCaRatio < 2 ? 1 : 0.8,
      caMgRatio > 3 && caMgRatio < 7 ? 1 : 0.85
    )
    
    // Liebig's law of minimum (with smooth transition)
    const minNutrient = Math.min(...Object.values(nutrientEffects))
    const avgNutrient = Object.values(nutrientEffects).reduce((a, b) => a + b) / 6
    
    // Combine effects
    return phEffect * ecEffect * ratioEffect * waterAvailability * 
           (0.7 * minNutrient + 0.3 * avgNutrient)
  }
  
  /**
   * Photomorphogenic effects
   * Light quality impacts on morphology and yield
   */
  private calculatePhotomorphogenicEffect(spectrum: any): number {
    // Calculate phytochrome photoequilibrium (Pfr/Ptotal)
    const redAbsorption = spectrum.red * 0.88
    const farRedAbsorption = spectrum.farRed * 0.72
    const pfrRatio = redAbsorption / (redAbsorption + farRedAbsorption + 0.01)
    
    // R:FR ratio effects
    const rfrRatio = spectrum.red / (spectrum.farRed + 0.1)
    const elongationEffect = rfrRatio > 1.2 ? 1 : 0.85 // Excess elongation reduces yield
    
    // Blue light effects
    const bluePercent = spectrum.blue / (spectrum.red + spectrum.blue + spectrum.green + 0.1)
    const compactnessEffect = bluePercent > 0.1 ? 1 : 0.9
    
    // UV effects (hormetic response)
    const uvEffect = spectrum.uv < 2 ? 1 + spectrum.uv * 0.02 : 
                     Math.max(0.8, 1.04 - (spectrum.uv - 2) * 0.1)
    
    return elongationEffect * compactnessEffect * uvEffect
  }
  
  /**
   * Growth stage specific adjustments
   */
  private getStageMultiplier(stage: string): number {
    const stageFactors: Record<string, number> = {
      'seedling': 0.3,
      'vegetative': 0.8,
      'flowering': 1.0,
      'fruiting': 1.2,
      'harvest': 0.9
    }
    return stageFactors[stage] || 1.0
  }
  
  /**
   * Circadian rhythm effects
   */
  private calculateCircadianEffect(photoperiod: number): number {
    // Optimal photoperiods for different responses
    if (photoperiod < 8) return 0.7 // Too short
    if (photoperiod > 20) return 0.85 // Stress from long days
    
    // Peak efficiency at 16-18 hours for most crops
    return 0.7 + 0.3 * Math.sin((photoperiod - 8) * Math.PI / 12)
  }
  
  /**
   * Root zone effects
   */
  private calculateRootZoneEffect(
    rootTemp: number,
    oxygenLevel: number,
    substrateMoisture: number
  ): number {
    // Root temperature effect
    const rootTempOptimal = 20
    const rootTempEffect = Math.exp(-0.5 * Math.pow((rootTemp - rootTempOptimal) / 5, 2))
    
    // Oxygen availability
    const oxygenEffect = oxygenLevel / (oxygenLevel + 15)
    
    // Moisture (field capacity = 100%)
    const moistureEffect = substrateMoisture < 40 ? substrateMoisture / 40 :
                          substrateMoisture > 90 ? (100 - substrateMoisture) / 10 :
                          1.0
    
    return rootTempEffect * oxygenEffect * moistureEffect
  }
  
  /**
   * Calculate statistical confidence based on input quality and parameter ranges
   */
  private calculatePredictionConfidence(input: EnhancedYieldInput, yieldMultiplier: number): number {
    let confidenceScore = 0;
    let totalWeight = 0;
    
    // Check if critical parameters are within optimal ranges
    const parameterChecks = [
      {
        value: input.ppfd,
        optimal: { min: 400, max: 1000 },
        weight: 0.25
      },
      {
        value: input.temperature,
        optimal: { min: 18, max: 28 },
        weight: 0.20
      },
      {
        value: input.vpd,
        optimal: { min: 0.8, max: 1.2 },
        weight: 0.15
      },
      {
        value: input.ph,
        optimal: { min: 5.5, max: 6.5 },
        weight: 0.15
      },
      {
        value: input.ec,
        optimal: { min: 1.2, max: 2.5 },
        weight: 0.10
      },
      {
        value: input.waterAvailability,
        optimal: { min: 0.7, max: 1.0 },
        weight: 0.10
      },
      {
        value: yieldMultiplier,
        optimal: { min: 0.5, max: 1.2 },
        weight: 0.05
      }
    ];
    
    // Calculate confidence based on how close parameters are to optimal
    for (const check of parameterChecks) {
      const { value, optimal, weight } = check;
      let paramConfidence = 0;
      
      if (value >= optimal.min && value <= optimal.max) {
        // Within optimal range
        paramConfidence = 1.0;
      } else {
        // Outside optimal range - calculate penalty
        const deviation = value < optimal.min 
          ? (optimal.min - value) / optimal.min
          : (value - optimal.max) / optimal.max;
        paramConfidence = Math.max(0, 1 - Math.min(deviation, 1));
      }
      
      confidenceScore += paramConfidence * weight;
      totalWeight += weight;
    }
    
    // Normalize confidence score
    const baseConfidence = confidenceScore / totalWeight;
    
    // Adjust for growth stage uncertainty
    const stageUncertainty = {
      'seedling': 0.05,
      'vegetative': 0.02,
      'flowering': 0.03,
      'fruiting': 0.04,
      'harvest': 0.02
    };
    
    const stageAdjustment = stageUncertainty[input.growthStage] || 0.05;
    const finalConfidence = baseConfidence * (1 - stageAdjustment);
    
    // Ensure confidence is between 0.5 and 0.95
    return Math.max(0.5, Math.min(0.95, finalConfidence));
  }

  /**
   * Enhanced prediction incorporating all factors
   */
  predictYieldEnhanced(input: EnhancedYieldInput): any {
    // Advanced photosynthesis calculation
    const photosynthesis = this.calculateFarquharPhotosynthesis(
      input.ppfd,
      input.co2,
      input.temperature,
      input.vpd
    )
    
    // Water relations
    const { transpiration, wue } = this.calculateTranspirationEffect(
      input.vpd,
      input.temperature,
      input.airFlow,
      input.leafAreaIndex,
      input.waterAvailability
    )
    
    // Nutrient effects
    const nutrientEffect = this.calculateNutrientEffect(
      input.nutrients,
      input.ph,
      input.ec,
      input.waterAvailability
    )
    
    // Light quality
    const morphogenicEffect = this.calculatePhotomorphogenicEffect(input.spectrum)
    
    // Development stage
    const stageMultiplier = this.getStageMultiplier(input.growthStage)
    
    // Circadian
    const circadianEffect = this.calculateCircadianEffect(input.photoperiod)
    
    // Root zone
    const rootEffect = this.calculateRootZoneEffect(
      input.rootZoneTemp,
      input.oxygenLevel,
      input.substrateMoisture
    )
    
    // LAI effect on light interception
    const canopyEffect = 1 - Math.exp(-0.65 * input.leafAreaIndex)
    
    // Base yield adjusted for all factors
    const baseYield = 5.0 // kg/m²/cycle for optimal conditions
    
    // Combine all effects
    const yieldMultiplier = 
      photosynthesis * 0.30 +     // Primary driver
      nutrientEffect * 0.20 +      // Nutrition critical
      wue * 0.15 +                 // Water efficiency
      morphogenicEffect * 0.10 +   // Light quality
      rootEffect * 0.10 +          // Root health
      canopyEffect * 0.05 +        // Light capture
      circadianEffect * 0.05 +     // Photoperiod
      stageMultiplier * 0.05       // Growth stage
    
    const predictedYield = baseYield * yieldMultiplier
    
    // Additional outputs
    return {
      predictedYield: Math.round(predictedYield * 100) / 100,
      photosynthesisRate: photosynthesis * 30, // μmol/m²/s
      transpirationRate: transpiration,
      waterUseEfficiency: wue,
      nutrientStatus: nutrientEffect,
      confidence: this.calculatePredictionConfidence(input, yieldMultiplier), // Statistical confidence based on input quality
      
      detailedAnalysis: {
        photosynthesis: { value: photosynthesis, status: photosynthesis > 0.8 ? 'optimal' : 'suboptimal' },
        water: { transpiration, wue, status: wue > 2.5 ? 'efficient' : 'inefficient' },
        nutrients: { overall: nutrientEffect, ph: input.ph, ec: input.ec },
        lightQuality: { effect: morphogenicEffect, rfrRatio: input.spectrum.red / (input.spectrum.farRed + 0.1) },
        rootZone: { effect: rootEffect, temp: input.rootZoneTemp, oxygen: input.oxygenLevel },
        development: { stage: input.growthStage, multiplier: stageMultiplier }
      }
    }
  }
}

export const enhancedYieldPredictor = new EnhancedMLYieldPredictor()