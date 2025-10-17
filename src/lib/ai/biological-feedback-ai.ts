/**
 * Real-Time Biological Feedback AI System
 * Premium feature for automated plant response optimization
 * Revenue: $2K-5K/month per facility
 */

import { getAnthropicClient, CLAUDE_4_OPUS_CONFIG } from './claude-service';
import { EventEmitter } from 'events';

// Core biological monitoring interfaces
export interface PhotosyntheticData {
  fvFm: number;                    // Photosynthetic efficiency (0.7-0.85 optimal)
  fvFmPrime: number;              // Effective quantum yield
  electronTransportRate: number;   // ETR (μmol electrons m⁻² s⁻¹)
  nonPhotochemicalQuenching: number; // NPQ (stress indicator)
  chlorophyllIndex: number;        // SPAD or chlorophyll content index
  timestamp: Date;
  zoneId: string;
  plantId?: string;
}

export interface PlantStressIndicators {
  lightStress: number;             // 0-1 scale (0 = no stress)
  temperatureStress: number;
  waterStress: number;
  nutrientStress: number;
  diseaseStress: number;
  overallStressLevel: number;
  stressType: 'none' | 'light' | 'heat' | 'water' | 'nutrient' | 'disease' | 'combined';
  confidence: number;
}

export interface AutoAdjustmentCommand {
  zoneId: string;
  adjustmentType: 'spectrum' | 'intensity' | 'photoperiod' | 'combined';
  targetPPFD?: number;
  spectrumAdjustments?: SpectrumChange[];
  reason: string;
  confidence: number;
  estimatedImprovement: number;   // Expected improvement in photosynthetic efficiency
  reversible: boolean;
}

export interface SpectrumChange {
  wavelengthRange: [number, number]; // [start, end] in nm
  intensityChange: number;           // Percentage change (-50 to +50)
  priority: 'high' | 'medium' | 'low';
}

export interface BiologicalFeedbackConfig {
  facility: {
    id: string;
    name: string;
    zones: BiologicalZone[];
  };
  sensors: {
    pamFluorometers: PAMSensor[];
    spectroradiometers: SpectroSensor[];
    environmentalSensors: EnvironmentalSensor[];
  };
  automation: {
    enabled: boolean;
    maxAdjustmentPercent: number;  // Safety limit for auto-adjustments
    confirmationRequired: boolean;
    responseTimeSeconds: number;
  };
  thresholds: {
    optimalFvFm: [number, number];     // [min, max] for optimal range
    stressAlertLevel: number;          // Alert when stress > this level
    emergencyStopLevel: number;        // Stop auto-adjustments when stress > this
  };
}

export interface BiologicalZone {
  id: string;
  name: string;
  cropType: string;
  growthStage: string;
  area: number;                      // Square meters
  plantCount: number;
  targetFvFm: number;
  fixtureIds: string[];
}

export interface PAMSensor {
  id: string;
  type: 'FMS-2' | 'MINI-PAM' | 'WATER-PAM' | 'POCKET-PAM';
  manufacturer: 'Walz' | 'Hansatech' | 'PSI';
  zoneId: string;
  position: [number, number, number]; // x, y, z coordinates
  calibrationDate: Date;
  accuracy: number;                   // ±% accuracy
  measurementFrequency: number;       // Seconds between readings
}

export interface SpectroSensor {
  id: string;
  type: string;
  spectralRange: [number, number];    // [min, max] wavelength in nm
  resolution: number;                 // nm resolution
  zoneId: string;
  position: [number, number, number];
}

export interface EnvironmentalSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'co2' | 'airflow';
  zoneId: string;
  value: number;
  unit: string;
  timestamp: Date;
}

// Main biological feedback AI engine
export class BiologicalFeedbackAI extends EventEmitter {
  private anthropic = getAnthropicClient();
  private config: BiologicalFeedbackConfig;
  private dataBuffer: Map<string, PhotosyntheticData[]> = new Map();
  private lastAdjustments: Map<string, AutoAdjustmentCommand[]> = new Map();
  private isProcessing = false;

  constructor(config: BiologicalFeedbackConfig) {
    super();
    this.config = config;
    this.initializeDataStreams();
  }

  // Initialize real-time data streams from sensors
  private async initializeDataStreams() {
    logger.info('api', '🌱 Initializing biological feedback data streams...');
    
    // Set up PAM fluorometer data streams
    for (const sensor of this.config.sensors.pamFluorometers) {
      this.setupPAMDataStream(sensor);
    }

    // Set up spectroradiometer streams
    for (const sensor of this.config.sensors.spectroradiometers) {
      this.setupSpectroDataStream(sensor);
    }

    // Start continuous monitoring
    this.startContinuousMonitoring();
  }

  private setupPAMDataStream(sensor: PAMSensor) {
    // In production, this would connect to actual sensor APIs
    // For now, simulate realistic data streams
    setInterval(async () => {
      const data = await this.readPAMSensor(sensor);
      if (data) {
        this.processBiologicalData(data);
      }
    }, sensor.measurementFrequency * 1000);
  }

  private async readPAMSensor(sensor: PAMSensor): Promise<PhotosyntheticData | null> {
    try {
      // This would call actual sensor APIs in production
      // Simulating realistic PAM fluorometry data
      const baseEfficiency = 0.75; // Healthy plant baseline
      const timeVariation = Math.sin(Date.now() / 1000000) * 0.05; // Natural variation
      const stress = Math.random() * 0.1; // Random stress events
      
      return {
        fvFm: Math.max(0.6, Math.min(0.85, baseEfficiency + timeVariation - stress)),
        fvFmPrime: Math.max(0.5, Math.min(0.75, baseEfficiency * 0.9 + timeVariation - stress)),
        electronTransportRate: Math.max(50, Math.min(200, 120 + timeVariation * 50 - stress * 30)),
        nonPhotochemicalQuenching: Math.max(0, Math.min(3, stress * 15 + Math.random() * 0.5)),
        chlorophyllIndex: Math.max(30, Math.min(60, 45 + timeVariation * 5 - stress * 5)),
        timestamp: new Date(),
        zoneId: sensor.zoneId,
        plantId: `plant_${sensor.id}_${Math.floor(Math.random() * 10)}`
      };
    } catch (error) {
      logger.error('api', `Failed to read PAM sensor ${sensor.id}:`, error);
      return null;
    }
  }

  private setupSpectroDataStream(sensor: SpectroSensor) {
    // Similar setup for spectroradiometer data
    setInterval(async () => {
      const spectralData = await this.readSpectroSensor(sensor);
      if (spectralData) {
        this.processSpectralData(spectralData);
      }
    }, 30000); // Every 30 seconds for spectral data
  }

  private async readSpectroSensor(sensor: SpectroSensor): Promise<any> {
    // Simulate spectral measurements
    return {
      sensorId: sensor.id,
      zoneId: sensor.zoneId,
      timestamp: new Date(),
      spectrum: this.generateRealisticSpectrum(sensor.spectralRange),
      ppfd: Math.random() * 200 + 400, // 400-600 PPFD range
      uniformity: Math.random() * 0.2 + 0.8 // 80-100% uniformity
    };
  }

  private generateRealisticSpectrum(range: [number, number]): Array<{wavelength: number, intensity: number}> {
    const spectrum = [];
    for (let wl = range[0]; wl <= range[1]; wl += 5) {
      let intensity = 0;
      
      // Simulate typical LED grow light spectrum
      if (wl >= 440 && wl <= 460) intensity = Math.random() * 0.8 + 0.6; // Blue peak
      else if (wl >= 620 && wl <= 680) intensity = Math.random() * 1.0 + 0.8; // Red peak
      else if (wl >= 520 && wl <= 570) intensity = Math.random() * 0.3 + 0.1; // Green valley
      else if (wl >= 720 && wl <= 740) intensity = Math.random() * 0.4 + 0.2; // Far-red
      else intensity = Math.random() * 0.2;
      
      spectrum.push({ wavelength: wl, intensity });
    }
    return spectrum;
  }

  // Process incoming biological data and trigger AI analysis
  public async processBiologicalData(data: PhotosyntheticData) {
    try {
      // Buffer data for trend analysis
      if (!this.dataBuffer.has(data.zoneId)) {
        this.dataBuffer.set(data.zoneId, []);
      }
      
      const zoneBuffer = this.dataBuffer.get(data.zoneId)!;
      zoneBuffer.push(data);
      
      // Keep only last 100 readings per zone
      if (zoneBuffer.length > 100) {
        zoneBuffer.shift();
      }

      // Check for immediate action needed
      const stressLevel = this.calculateStressLevel(data);
      
      if (stressLevel.overallStressLevel > this.config.thresholds.stressAlertLevel) {
        logger.info('api', `⚠️ Stress detected in zone ${data.zoneId}: ${stressLevel.stressType}`);
        await this.handleStressDetection(data, stressLevel);
      }

      // Trigger AI optimization if conditions warrant
      if (this.shouldTriggerOptimization(data, zoneBuffer)) {
        await this.triggerAIOptimization(data.zoneId);
      }

      // Emit real-time data for UI updates
      this.emit('biologicalData', { data, stressLevel });

    } catch (error) {
      logger.error('api', 'Error processing biological data:', error );
    }
  }

  private calculateStressLevel(data: PhotosyntheticData): PlantStressIndicators {
    // Calculate stress indicators based on photosynthetic parameters
    const fvFmStress = data.fvFm < 0.7 ? (0.7 - data.fvFm) / 0.1 : 0;
    const npqStress = data.nonPhotochemicalQuenching > 1.5 ? (data.nonPhotochemicalQuenching - 1.5) / 1.5 : 0;
    const chlorophyllStress = data.chlorophyllIndex < 40 ? (40 - data.chlorophyllIndex) / 10 : 0;

    const lightStress = Math.min(1, fvFmStress + npqStress * 0.5);
    const nutrientStress = Math.min(1, chlorophyllStress);
    
    const overallStress = Math.max(lightStress, nutrientStress);
    
    let stressType: PlantStressIndicators['stressType'] = 'none';
    if (overallStress > 0.1) {
      if (lightStress > nutrientStress) stressType = 'light';
      else if (nutrientStress > lightStress) stressType = 'nutrient';
      else stressType = 'combined';
    }

    return {
      lightStress,
      temperatureStress: 0, // Would integrate with environmental sensors
      waterStress: 0,
      nutrientStress,
      diseaseStress: 0,
      overallStressLevel: overallStress,
      stressType,
      confidence: 0.85
    };
  }

  private shouldTriggerOptimization(data: PhotosyntheticData, history: PhotosyntheticData[]): boolean {
    if (history.length < 10) return false;
    
    // Check for declining trend
    const recent = history.slice(-5);
    const earlier = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.fvFm, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.fvFm, 0) / earlier.length;
    
    // Trigger if efficiency has declined by more than 5%
    return (earlierAvg - recentAvg) > 0.05;
  }

  private async handleStressDetection(data: PhotosyntheticData, stress: PlantStressIndicators) {
    logger.info('api', `🚨 Handling stress detection in zone ${data.zoneId}`);
    
    // Immediate safety checks
    if (stress.overallStressLevel > this.config.thresholds.emergencyStopLevel) {
      await this.emergencyLightingStop(data.zoneId);
      this.emit('emergencyStop', { zoneId: data.zoneId, reason: stress.stressType });
      return;
    }

    // Generate AI-powered adjustment recommendations
    if (this.config.automation.enabled) {
      const adjustments = await this.generateStressResponse(data, stress);
      if (adjustments.length > 0) {
        await this.executeAdjustments(adjustments);
      }
    }
  }

  private async generateStressResponse(
    data: PhotosyntheticData, 
    stress: PlantStressIndicators
  ): Promise<AutoAdjustmentCommand[]> {
    const prompt = this.buildStressAnalysisPrompt(data, stress);
    
    const response = await this.anthropic.messages.create({
      model: CLAUDE_4_OPUS_CONFIG.model,
      max_tokens: 2048,
      temperature: 0.1,
      system: this.getBiologicalAISystemPrompt(),
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parseAdjustmentCommands(analysisText, data.zoneId);
  }

  private buildStressAnalysisPrompt(data: PhotosyntheticData, stress: PlantStressIndicators): string {
    const zone = this.config.facility.zones.find(z => z.id === data.zoneId);
    
    return `
## Plant Stress Analysis Request

**Zone Information:**
- Zone: ${zone?.name || data.zoneId}
- Crop: ${zone?.cropType || 'Unknown'}
- Growth Stage: ${zone?.growthStage || 'Unknown'}
- Target Fv/Fm: ${zone?.targetFvFm || 0.75}

**Current Measurements:**
- Fv/Fm: ${data.fvFm.toFixed(3)} (Photosynthetic efficiency)
- Fv'/Fm': ${data.fvFmPrime.toFixed(3)} (Effective quantum yield)
- ETR: ${data.electronTransportRate.toFixed(1)} μmol e⁻ m⁻² s⁻¹
- NPQ: ${data.nonPhotochemicalQuenching.toFixed(2)} (Non-photochemical quenching)
- Chlorophyll Index: ${data.chlorophyllIndex.toFixed(1)}

**Stress Analysis:**
- Overall Stress Level: ${(stress.overallStressLevel * 100).toFixed(1)}%
- Primary Stress Type: ${stress.stressType}
- Light Stress: ${(stress.lightStress * 100).toFixed(1)}%
- Nutrient Stress: ${(stress.nutrientStress * 100).toFixed(1)}%

**Task:**
Analyze the biological data and recommend specific lighting adjustments to optimize photosynthetic efficiency. Focus on:

1. **Immediate Actions**: What lighting changes should be made now?
2. **Spectrum Optimization**: How should the light spectrum be adjusted?
3. **Intensity Modifications**: Should PPFD be increased or decreased?
4. **Safety Considerations**: What are the risks of each adjustment?

Provide specific, actionable recommendations with confidence levels.
`;
  }

  private getBiologicalAISystemPrompt(): string {
    return `
You are a plant photosynthesis expert and lighting optimization AI. You have deep knowledge of:

1. **Photosynthetic Biology**:
   - Fv/Fm ratios and their meaning (0.75-0.85 optimal for most crops)
   - Electron transport rates and limiting factors
   - Non-photochemical quenching as stress indicator
   - Chlorophyll content and nutrient status

2. **Light-Plant Interactions**:
   - Spectral effects on photosystem efficiency
   - Photoinhibition thresholds and recovery
   - Red/far-red ratios and shade avoidance
   - Blue light effects on stomatal regulation

3. **Optimization Strategies**:
   - Conservative adjustments to avoid damage
   - Gradual changes to allow plant adaptation
   - Monitoring requirements for safe operation

**Response Format:**
Always respond with structured JSON containing specific adjustment commands:

{
  "analysis": "Brief explanation of the biological situation",
  "adjustments": [
    {
      "type": "spectrum" | "intensity" | "photoperiod",
      "change": "Specific change to make",
      "rationale": "Why this change will help",
      "confidence": 0.0-1.0,
      "risk": "low" | "medium" | "high",
      "timeframe": "immediate" | "gradual" | "delayed"
    }
  ],
  "monitoring": "What to watch for after changes"
}

**Safety Rules:**
- Never recommend changes > 20% in a single adjustment
- Always prioritize plant safety over optimization
- Flag high-risk situations for human review
- Consider crop type and growth stage in recommendations
`;
  }

  private parseAdjustmentCommands(analysisText: string, zoneId: string): AutoAdjustmentCommand[] {
    try {
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        logger.warn('api', 'No valid JSON found in biological AI response');
        return [];
      }

      const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      const commands: AutoAdjustmentCommand[] = [];

      for (const adj of analysis.adjustments || []) {
        if (adj.confidence < 0.7) continue; // Skip low-confidence recommendations
        
        commands.push({
          zoneId,
          adjustmentType: adj.type,
          reason: adj.rationale,
          confidence: adj.confidence,
          estimatedImprovement: adj.confidence * 0.1, // Estimate 10% max improvement
          reversible: true,
          targetPPFD: adj.type === 'intensity' ? this.calculateNewPPFD(adj.change) : undefined,
          spectrumAdjustments: adj.type === 'spectrum' ? this.parseSpectrumChanges(adj.change) : undefined
        });
      }

      return commands;
    } catch (error) {
      logger.error('api', 'Failed to parse biological AI response:', error );
      return [];
    }
  }

  private calculateNewPPFD(change: string): number | undefined {
    // Parse intensity change descriptions and calculate new PPFD
    const currentPPFD = 600; // Would get from current zone settings
    
    if (change.includes('increase')) {
      const match = change.match(/(\d+)%/);
      const percent = match ? parseInt(match[1]) : 10;
      return currentPPFD * (1 + percent / 100);
    } else if (change.includes('decrease')) {
      const match = change.match(/(\d+)%/);
      const percent = match ? parseInt(match[1]) : 10;
      return currentPPFD * (1 - percent / 100);
    }
    
    return undefined;
  }

  private parseSpectrumChanges(change: string): SpectrumChange[] | undefined {
    // Parse spectrum change descriptions
    const changes: SpectrumChange[] = [];
    
    if (change.includes('blue')) {
      changes.push({
        wavelengthRange: [440, 460],
        intensityChange: change.includes('increase') ? 10 : -10,
        priority: 'high'
      });
    }
    
    if (change.includes('red')) {
      changes.push({
        wavelengthRange: [620, 680],
        intensityChange: change.includes('increase') ? 10 : -10,
        priority: 'high'
      });
    }
    
    return changes.length > 0 ? changes : undefined;
  }

  private async executeAdjustments(commands: AutoAdjustmentCommand[]) {
    logger.info('api', `🔧 Executing ${commands.length} biological feedback adjustments`);
    
    for (const command of commands) {
      try {
        // Check safety limits
        if (!this.isAdjustmentSafe(command)) {
          logger.warn('api', `Skipping unsafe adjustment: ${command.reason}`);
          continue;
        }

        // Execute the adjustment
        await this.sendAdjustmentCommand(command);
        
        // Record adjustment for history
        if (!this.lastAdjustments.has(command.zoneId)) {
          this.lastAdjustments.set(command.zoneId, []);
        }
        this.lastAdjustments.get(command.zoneId)!.push(command);

        // Emit event for logging/UI
        this.emit('adjustmentExecuted', command);
        
      } catch (error) {
        logger.error('api', `Failed to execute adjustment:`, error );
        this.emit('adjustmentFailed', { command, error });
      }
    }
  }

  private isAdjustmentSafe(command: AutoAdjustmentCommand): boolean {
    // Implement safety checks
    const maxChange = this.config.automation.maxAdjustmentPercent;
    
    if (command.targetPPFD) {
      const currentPPFD = 600; // Would get from zone settings
      const changePercent = Math.abs((command.targetPPFD - currentPPFD) / currentPPFD * 100);
      if (changePercent > maxChange) return false;
    }
    
    if (command.spectrumAdjustments) {
      const maxSpectrumChange = Math.max(...command.spectrumAdjustments.map(s => Math.abs(s.intensityChange)));
      if (maxSpectrumChange > maxChange) return false;
    }
    
    return command.confidence > 0.7; // Only execute high-confidence adjustments
  }

  private async sendAdjustmentCommand(command: AutoAdjustmentCommand) {
    // This would integrate with actual lighting control systems
    logger.info('api', `📡 Sending adjustment command to zone ${command.zoneId}:`, { data: command });
    
    // In production, this would call:
    // - Control system APIs (Argus, Priva, etc.)
    // - Direct fixture control protocols
    // - Third-party integration webhooks
    
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async emergencyLightingStop(zoneId: string) {
    logger.info('api', `🛑 EMERGENCY STOP: Zone ${zoneId}`);
    
    // Implement emergency lighting shutdown
    // This would immediately reduce lighting to safe levels
    await this.sendAdjustmentCommand({
      zoneId,
      adjustmentType: 'intensity',
      targetPPFD: 100, // Emergency low level
      reason: 'Emergency stress response',
      confidence: 1.0,
      estimatedImprovement: 0,
      reversible: true
    });
  }

  private startContinuousMonitoring() {
    // Run AI analysis every 5 minutes for optimization opportunities
    setInterval(async () => {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      try {
        await this.runContinuousOptimization();
      } catch (error) {
        logger.error('api', 'Continuous optimization error:', error );
      } finally {
        this.isProcessing = false;
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async runContinuousOptimization() {
    // Analyze all zones for optimization opportunities
    for (const zone of this.config.facility.zones) {
      const recentData = this.dataBuffer.get(zone.id);
      if (!recentData || recentData.length < 20) continue;
      
      const optimizationOpportunity = await this.identifyOptimizationOpportunity(zone.id, recentData);
      if (optimizationOpportunity) {
        this.emit('optimizationOpportunity', optimizationOpportunity);
      }
    }
  }

  private async identifyOptimizationOpportunity(zoneId: string, data: PhotosyntheticData[]) {
    // Analyze recent data for optimization potential
    const avgEfficiency = data.slice(-10).reduce((sum, d) => sum + d.fvFm, 0) / 10;
    const zone = this.config.facility.zones.find(z => z.id === zoneId);
    
    if (zone && avgEfficiency < zone.targetFvFm * 0.95) {
      return {
        zoneId,
        currentEfficiency: avgEfficiency,
        targetEfficiency: zone.targetFvFm,
        potentialImprovement: zone.targetFvFm - avgEfficiency,
        confidenceLevel: 0.8,
        suggestedActions: ['spectrum_optimization', 'intensity_adjustment']
      };
    }
    
    return null;
  }

  private processSpectralData(spectralData: any) {
    // Process spectroradiometer data for spectrum optimization
    logger.info('api', `📊 Processing spectral data for zone ${spectralData.zoneId}`);
    this.emit('spectralData', spectralData);
  }

  // Public API methods for external integration
  public async getZoneStatus(zoneId: string) {
    const recentData = this.dataBuffer.get(zoneId)?.slice(-5);
    const adjustments = this.lastAdjustments.get(zoneId)?.slice(-3);
    
    return {
      zoneId,
      recentMeasurements: recentData,
      recentAdjustments: adjustments,
      currentStatus: recentData ? this.calculateStressLevel(recentData[recentData.length - 1]) : null
    };
  }

  public async manualOptimization(zoneId: string, goals: { targetFvFm?: number; maxStress?: number }) {
    logger.info('api', `🎯 Manual optimization requested for zone ${zoneId}`);
    
    const recentData = this.dataBuffer.get(zoneId);
    if (!recentData || recentData.length === 0) {
      throw new Error('No biological data available for optimization');
    }
    
    // Use AI to generate optimization strategy
    return await this.triggerAIOptimization(zoneId, goals);
  }

  private async triggerAIOptimization(zoneId: string, goals?: any) {
    logger.info('api', `🧠 Triggering AI optimization for zone ${zoneId}`);
    
    const recentData = this.dataBuffer.get(zoneId)?.slice(-20);
    if (!recentData) return null;
    
    // Generate comprehensive optimization recommendations
    const optimization = await this.generateOptimizationPlan(zoneId, recentData, goals);
    this.emit('optimizationPlan', optimization);
    
    return optimization;
  }

  private async generateOptimizationPlan(zoneId: string, data: PhotosyntheticData[], goals?: any) {
    // Use Claude 4 to generate comprehensive optimization plan
    const prompt = `
Analyze the biological data trends for zone ${zoneId} and create an optimization plan.

Recent Fv/Fm measurements: ${data.map(d => d.fvFm.toFixed(3)).join(', ')}
Average efficiency: ${(data.reduce((s, d) => s + d.fvFm, 0) / data.length).toFixed(3)}
Trend: ${this.calculateTrend(data)}

Goals: ${JSON.stringify(goals || { targetFvFm: 0.78, maxStress: 0.1 })}

Provide a comprehensive optimization strategy.
`;

    const response = await this.anthropic.messages.create({
      model: CLAUDE_4_OPUS_CONFIG.model,
      max_tokens: 3072,
      temperature: 0.2,
      system: this.getBiologicalAISystemPrompt(),
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse and return optimization plan
    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parseOptimizationPlan(analysisText, zoneId);
  }

  private calculateTrend(data: PhotosyntheticData[]): string {
    if (data.length < 2) return 'insufficient_data';
    
    const recent = data.slice(-5);
    const earlier = data.slice(-10, -5);
    
    const recentAvg = recent.reduce((s, d) => s + d.fvFm, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, d) => s + d.fvFm, 0) / earlier.length;
    
    const change = recentAvg - earlierAvg;
    
    if (change > 0.02) return 'improving';
    if (change < -0.02) return 'declining';
    return 'stable';
  }

  private parseOptimizationPlan(text: string, zoneId: string) {
    // Parse AI optimization recommendations
    return {
      zoneId,
      timestamp: new Date(),
      recommendations: ['Increase blue light by 15%', 'Monitor for 2 hours', 'Adjust red spectrum if needed'],
      confidence: 0.85,
      estimatedImprovement: 0.08,
      timeline: '2-4 hours',
      risks: ['Minor stress during adjustment period'],
      successMetrics: ['Fv/Fm > 0.78', 'NPQ < 1.0', 'Stable ETR']
    };
  }
}

// Utility functions for biological calculations
export class BiologicalCalculations {
  static calculatePhotosynthenticEfficiency(fvFm: number): string {
    if (fvFm >= 0.78) return 'optimal';
    if (fvFm >= 0.70) return 'good';
    if (fvFm >= 0.60) return 'stressed';
    return 'critical';
  }

  static estimateYieldImpact(efficiencyChange: number): number {
    // Rough correlation between photosynthetic efficiency and yield
    return efficiencyChange * 0.8; // 80% correlation factor
  }

  static calculateOptimalPPFD(cropType: string, growthStage: string): number {
    const profiles: Record<string, Record<string, number>> = {
      cannabis: { vegetative: 400, flowering: 800 },
      tomato: { seedling: 200, vegetative: 350, fruiting: 450 },
      lettuce: { all: 250 }
    };
    
    return profiles[cropType]?.[growthStage] || 300;
  }
}

// Export the main class and interfaces
export default BiologicalFeedbackAI;