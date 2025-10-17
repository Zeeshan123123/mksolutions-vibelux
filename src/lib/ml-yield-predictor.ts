import { MLYieldPredictorBase } from './ml-yield-predictor-base';
import { EnhancedMLYieldPredictor } from './ml-yield-predictor-enhanced';

// Main yield predictor class
export class MLYieldPredictor extends MLYieldPredictorBase {
  async predict(inputs: any): Promise<any> {
    // Map simple inputs to enhanced format if needed
    const enhancedInputs = this.mapToEnhancedInputs(inputs);
    
    if (this.isEnhancedInput(inputs)) {
      // Use full enhanced prediction
      const result = this.predictYieldEnhanced(inputs);
      return {
        yieldEstimate: result.predictedYield,
        confidence: result.confidence,
        factors: this.extractFactors(result.detailedAnalysis)
      };
    }
    
    // Use simplified prediction for basic inputs
    return this.simplifiedPredict(inputs);
  }
  
  private mapToEnhancedInputs(inputs: any): any {
    return {
      ppfd: inputs.ppfd || inputs.lightIntensity || 600,
      dli: inputs.dli || (inputs.ppfd * 16 * 0.0036) || 34.56,
      temperature: inputs.temperature || 22,
      co2: inputs.co2 || 400,
      vpd: inputs.vpd || 1.0,
      spectrum: inputs.spectrum || {
        red: 40,
        blue: 20,
        green: 10,
        farRed: 5,
        uv: 0,
        white: 25
      },
      waterAvailability: inputs.waterAvailability || 0.9,
      substrateMoisture: inputs.substrateMoisture || 65,
      relativeHumidity: inputs.humidity || 65,
      ec: inputs.ec || 1.8,
      ph: inputs.ph || 6.0,
      nutrients: inputs.nutrients || {
        nitrogen: 150,
        phosphorus: 50,
        potassium: 200,
        calcium: 100,
        magnesium: 50,
        sulfur: 30
      },
      leafAreaIndex: inputs.leafAreaIndex || 3.0,
      growthStage: inputs.growthStage || 'vegetative',
      plantAge: inputs.plantAge || 30,
      photoperiod: inputs.photoperiod || 16,
      rootZoneTemp: inputs.rootZoneTemp || inputs.temperature || 22,
      oxygenLevel: inputs.oxygenLevel || 21,
      airFlow: inputs.airFlow || 0.5
    };
  }
  
  private isEnhancedInput(inputs: any): boolean {
    return inputs.leafAreaIndex !== undefined || 
           inputs.nutrients !== undefined ||
           inputs.spectrum !== undefined;
  }
  
  private simplifiedPredict(inputs: any): any {
    // Use core photosynthesis calculations for simple predictions
    const photosynthesis = this.calculateFarquharPhotosynthesis(
      inputs.ppfd || 600,
      inputs.co2 || 400,
      inputs.temperature || 22,
      inputs.vpd || 1.0
    );
    
    // Simplified yield calculation
    const baseYield = 5.0; // kg/m²/cycle
    const yieldEstimate = baseYield * photosynthesis * 0.8; // 80% efficiency factor
    
    // Calculate confidence based on input completeness
    const requiredInputs = ['ppfd', 'temperature', 'co2', 'vpd'];
    const providedInputs = requiredInputs.filter(key => inputs[key] !== undefined).length;
    const confidence = 0.6 + (providedInputs / requiredInputs.length) * 0.3;
    
    return {
      yieldEstimate: Math.round(yieldEstimate * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      factors: [
        { name: 'Light Intensity', impact: photosynthesis * 0.3 },
        { name: 'Temperature', impact: this.getTemperatureImpact(inputs.temperature || 22) },
        { name: 'CO2 Level', impact: this.getCO2Impact(inputs.co2 || 400) }
      ]
    };
  }
  
  private getTemperatureImpact(temp: number): number {
    const optimal = 25;
    const deviation = Math.abs(temp - optimal);
    return Math.max(0, 1 - deviation / 20);
  }
  
  private getCO2Impact(co2: number): number {
    return Math.min(1, co2 / 1000); // Linear up to 1000ppm
  }
  
  private extractFactors(analysis: any): any[] {
    const factors = [];
    
    if (analysis.photosynthesis) {
      factors.push({
        name: 'Photosynthesis',
        impact: analysis.photosynthesis.value,
        status: analysis.photosynthesis.status
      });
    }
    
    if (analysis.water) {
      factors.push({
        name: 'Water Use Efficiency',
        impact: analysis.water.wue / 3.0, // Normalize to 0-1
        status: analysis.water.status
      });
    }
    
    if (analysis.nutrients) {
      factors.push({
        name: 'Nutrient Status',
        impact: analysis.nutrients.overall,
        status: analysis.nutrients.overall > 0.8 ? 'optimal' : 'suboptimal'
      });
    }
    
    if (analysis.lightQuality) {
      factors.push({
        name: 'Light Quality',
        impact: analysis.lightQuality.effect,
        status: analysis.lightQuality.effect > 0.9 ? 'optimal' : 'suboptimal'
      });
    }
    
    return factors;
  }
  
  async train(data: any[]): Promise<void> {
    // Training would require real ML library integration
    logger.info('api', `Training with ${data.length} samples`);
  }
  
  async evaluate(testData: any[]): Promise<any> {
    // Simple evaluation metrics
    let totalError = 0;
    let totalSquaredError = 0;
    
    for (const sample of testData) {
      const prediction = await this.predict(sample.inputs);
      const error = Math.abs(prediction.yieldEstimate - sample.actual);
      totalError += error;
      totalSquaredError += error * error;
    }
    
    const mae = totalError / testData.length;
    const mse = totalSquaredError / testData.length;
    const rmse = Math.sqrt(mse);
    
    // Simplified R² calculation
    const actualMean = testData.reduce((sum, s) => sum + s.actual, 0) / testData.length;
    const totalVariance = testData.reduce((sum, s) => sum + Math.pow(s.actual - actualMean, 2), 0);
    const r2 = 1 - (totalSquaredError / totalVariance);
    
    return {
      accuracy: Math.max(0, 1 - mae / actualMean),
      mse: Math.round(mse * 1000) / 1000,
      mae: Math.round(mae * 1000) / 1000,
      rmse: Math.round(rmse * 1000) / 1000,
      r2: Math.round(r2 * 1000) / 1000
    };
  }
}

// Export the predictYield function that components are expecting
export async function predictYield(inputs: any): Promise<any> {
  const predictor = new MLYieldPredictor();
  return predictor.predict(inputs);
}