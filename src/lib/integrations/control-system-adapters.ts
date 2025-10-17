/**
 * Professional Control System Adapters
 * Integrates VibeLux AI optimization with existing control platforms
 * Revenue: $100K-500K/year per large facility
 */

import { getAnthropicClient, CLAUDE_4_OPUS_CONFIG } from '../ai/claude-service';
import { EventEmitter } from 'events';

// Base interfaces for all control systems
export interface ControlSystemConfig {
  id: string;
  name: string;
  type: 'argus' | 'priva' | 'trolmaster' | 'gavita' | 'link4' | 'generic';
  endpoint: string;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    token?: string;
  };
  zones: ControlZone[];
  capabilities: SystemCapabilities;
}

export interface ControlZone {
  id: string;
  name: string;
  area: number;
  cropType: string;
  growthStage: string;
  fixtures: ControlFixture[];
  sensors: ControlSensor[];
}

export interface ControlFixture {
  id: string;
  name: string;
  type: string;
  maxPower: number;
  channels: LightChannel[];
  position: [number, number, number];
  controllable: boolean;
}

export interface LightChannel {
  id: string;
  type: 'intensity' | 'spectrum' | 'red' | 'blue' | 'white' | 'far_red' | 'uv';
  wavelength?: number;
  minValue: number;
  maxValue: number;
  currentValue: number;
  unit: '%' | 'A' | 'V';
}

export interface ControlSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'co2' | 'par' | 'ppfd' | 'dli';
  value: number;
  unit: string;
  timestamp: Date;
}

export interface SystemCapabilities {
  canReadPower: boolean;
  canControlDimming: boolean;
  canControlSpectrum: boolean;
  canSchedule: boolean;
  canOverride: boolean;
  maxZones: number;
  updateFrequency: number; // seconds
}

export interface OptimizationCommand {
  zoneId: string;
  fixtureId: string;
  changes: ChannelChange[];
  reason: string;
  confidence: number;
  estimatedSavings: number; // kWh per day
  reversible: boolean;
  executionDelay?: number; // seconds
}

export interface ChannelChange {
  channelId: string;
  newValue: number;
  gradualTransition: boolean;
  transitionTime?: number; // minutes
}

export interface SystemStatus {
  connected: boolean;
  lastUpdate: Date;
  totalZones: number;
  activeOptimizations: number;
  dailySavings: number;
  monthlyProjection: number;
  health: 'excellent' | 'good' | 'warning' | 'error';
  issues: string[];
}

// Base class for all control system adapters
export abstract class ControlSystemAdapter extends EventEmitter {
  protected config: ControlSystemConfig;
  protected anthropic = getAnthropicClient();
  protected isConnected = false;
  protected lastOptimization = new Map<string, Date>();
  protected savingsTracking = new Map<string, number[]>();

  constructor(config: ControlSystemConfig) {
    super();
    this.config = config;
  }

  // Abstract methods that each adapter must implement
  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract readZoneData(zoneId: string): Promise<any>;
  abstract executeCommand(command: OptimizationCommand): Promise<boolean>;
  abstract getSystemStatus(): Promise<SystemStatus>;

  // Common optimization logic using Claude 4 Opus
  async optimizeZone(zoneId: string, goals?: { targetEfficiency?: number; maxPowerReduction?: number }) {
    if (!this.isConnected) {
      throw new Error('Control system not connected');
    }

    logger.info('api', `🧠 Optimizing zone ${zoneId} with Claude 4 Opus AI`);

    try {
      // Get current zone data
      const zoneData = await this.readZoneData(zoneId);
      const zone = this.config.zones.find(z => z.id === zoneId);
      
      if (!zone) {
        throw new Error(`Zone ${zoneId} not found in configuration`);
      }

      // Build optimization prompt for Claude
      const prompt = this.buildOptimizationPrompt(zone, zoneData, goals);

      const response = await this.anthropic.messages.create({
        model: CLAUDE_4_OPUS_CONFIG.model,
        max_tokens: 4096,
        temperature: 0.2, // Lower temperature for consistent optimization
        system: this.getControlSystemPrompt(),
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
      const commands = this.parseOptimizationCommands(analysisText, zoneId);

      // Execute high-confidence commands
      const executedCommands = [];
      for (const command of commands) {
        if (command.confidence > 0.8 && this.isCommandSafe(command)) {
          const success = await this.executeCommand(command);
          if (success) {
            executedCommands.push(command);
            this.trackSavings(zoneId, command.estimatedSavings);
          }
        }
      }

      this.lastOptimization.set(zoneId, new Date());
      this.emit('optimizationCompleted', { zoneId, commands: executedCommands });

      return {
        success: true,
        commandsExecuted: executedCommands.length,
        totalCommands: commands.length,
        estimatedDailySavings: executedCommands.reduce((sum, cmd) => sum + cmd.estimatedSavings, 0),
        nextOptimization: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
      };

    } catch (error) {
      logger.error('api', `Optimization failed for zone ${zoneId}:`, error);
      this.emit('optimizationFailed', { zoneId, error });
      throw error;
    }
  }

  private buildOptimizationPrompt(zone: ControlZone, currentData: any, goals?: any): string {
    return `
## Professional Grow Room Optimization Request

**Facility Information:**
- Zone: ${zone.name} (${zone.area} sq ft)
- Crop: ${zone.cropType}
- Growth Stage: ${zone.growthStage}
- Control System: ${this.config.type.toUpperCase()}

**Current Lighting Status:**
- Total Fixtures: ${zone.fixtures.length}
- Total Power Draw: ${currentData.totalPower || 'Unknown'}W
- Average PPFD: ${currentData.averagePPFD || 'Unknown'} μmol/m²/s
- Uniformity: ${currentData.uniformity || 'Unknown'}%

**Current Channel Settings:**
${zone.fixtures.map(fixture => 
  `• ${fixture.name}: ${fixture.channels.map(ch => 
    `${ch.type}=${ch.currentValue}${ch.unit}`
  ).join(', ')}`
).join('\n')}

**Environmental Data:**
${zone.sensors.map(sensor => 
  `• ${sensor.type}: ${sensor.value} ${sensor.unit}`
).join('\n')}

**Optimization Goals:**
- Target Efficiency: ${goals?.targetEfficiency || 'Maximize photosynthetic efficiency'}
- Max Power Reduction: ${goals?.maxPowerReduction || '15'}%
- Maintain Quality: Yes
- ROI Timeline: 3-6 months

**Constraints:**
- No changes > 20% in single adjustment
- Maintain minimum PPFD for crop stage
- Preserve existing schedules unless specified
- All changes must be reversible

**Task:**
Analyze the current setup and recommend specific lighting optimizations that will:
1. **Reduce Energy Consumption** while maintaining or improving plant performance
2. **Improve Light Uniformity** across the growing area
3. **Optimize Spectrum** for current growth stage
4. **Identify Equipment Issues** that may be wasting energy

Provide specific channel adjustments with confidence levels and expected savings.
`;
  }

  private getControlSystemPrompt(): string {
    return `
You are a professional horticultural lighting optimization AI with expertise in commercial grow room control systems. You work with facilities generating $1M+ annual revenue where energy optimization directly impacts profitability.

**Your Knowledge Base:**
1. **Control System Integration:**
   - Argus Titan, Priva, TrolMaster, Gavita protocols
   - Safety interlocks and override procedures
   - Gradual transition requirements
   - System-specific limitations

2. **Commercial Optimization:**
   - Energy cost reduction strategies
   - Peak demand management
   - Time-of-use scheduling
   - Equipment lifecycle optimization

3. **Crop-Specific Requirements:**
   - Cannabis: Vegetative (400-600 PPFD) vs Flowering (600-900 PPFD)
   - Leafy Greens: 200-300 PPFD optimal
   - Tomatoes: 400-800 PPFD depending on stage
   - Herbs: 250-400 PPFD for premium quality

4. **Safety & Compliance:**
   - Never exceed manufacturer specifications
   - Maintain minimum safety lighting levels
   - Preserve emergency override capabilities
   - Document all changes for audit trails

**Response Format:**
Always respond with structured JSON containing specific optimization commands:

{
  "analysis": "Brief assessment of current efficiency and opportunities",
  "optimizations": [
    {
      "fixtureId": "fixture identifier",
      "channelChanges": [
        {
          "channelId": "channel identifier", 
          "currentValue": 85,
          "newValue": 75,
          "reason": "Reduce intensity during peak hours for demand charge savings",
          "transitionTime": 30
        }
      ],
      "confidence": 0.95,
      "estimatedSavings": 12.5,
      "riskLevel": "low",
      "reversible": true
    }
  ],
  "schedule": "When to implement changes for maximum benefit",
  "monitoring": "What to watch for after implementation",
  "roiProjection": "Expected payback period and annual savings"
}

**Optimization Principles:**
- Conservative adjustments that prioritize plant health
- Focus on high-impact, low-risk changes first
- Consider facility-wide energy patterns
- Account for seasonal variations and market prices
- Always provide rollback procedures
`;
  }

  private parseOptimizationCommands(analysisText: string, zoneId: string): OptimizationCommand[] {
    try {
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        logger.warn('api', 'No valid JSON found in optimization response');
        return [];
      }

      const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      const commands: OptimizationCommand[] = [];

      for (const opt of analysis.optimizations || []) {
        if (opt.confidence < 0.7) continue; // Skip low-confidence recommendations
        
        commands.push({
          zoneId,
          fixtureId: opt.fixtureId,
          changes: opt.channelChanges.map((ch: any) => ({
            channelId: ch.channelId,
            newValue: ch.newValue,
            gradualTransition: true,
            transitionTime: ch.transitionTime || 15
          })),
          reason: opt.channelChanges[0]?.reason || 'AI optimization',
          confidence: opt.confidence,
          estimatedSavings: opt.estimatedSavings || 0,
          reversible: opt.reversible !== false,
          executionDelay: 0
        });
      }

      return commands;
    } catch (error) {
      logger.error('api', 'Failed to parse optimization response:', error );
      return [];
    }
  }

  private isCommandSafe(command: OptimizationCommand): boolean {
    // Implement safety checks
    for (const change of command.changes) {
      // Check if change is within acceptable range
      if (Math.abs(change.newValue - 100) > 20) { // Assuming current is ~100%
        logger.warn('api', `Unsafe command: Change too large for ${change.channelId}`);
        return false;
      }
    }

    return command.confidence > 0.7 && command.reversible;
  }

  private trackSavings(zoneId: string, savingsKwh: number) {
    if (!this.savingsTracking.has(zoneId)) {
      this.savingsTracking.set(zoneId, []);
    }
    
    const savings = this.savingsTracking.get(zoneId)!;
    savings.push(savingsKwh);
    
    // Keep only last 30 days of data
    if (savings.length > 30) {
      savings.shift();
    }
  }

  public getSavingsReport(zoneId?: string) {
    if (zoneId) {
      const savings = this.savingsTracking.get(zoneId) || [];
      const dailyAvg = savings.reduce((sum, s) => sum + s, 0) / savings.length || 0;
      return {
        zoneId,
        dailyAvgSavings: dailyAvg,
        monthlyProjection: dailyAvg * 30,
        annualProjection: dailyAvg * 365,
        dataPoints: savings.length
      };
    }

    // Aggregate all zones
    let totalDailySavings = 0;
    let totalDataPoints = 0;
    
    for (const [zId, savings] of this.savingsTracking) {
      const dailyAvg = savings.reduce((sum, s) => sum + s, 0) / savings.length || 0;
      totalDailySavings += dailyAvg;
      totalDataPoints += savings.length;
    }

    return {
      facilityTotal: true,
      dailyAvgSavings: totalDailySavings,
      monthlyProjection: totalDailySavings * 30,
      annualProjection: totalDailySavings * 365,
      dollarsPerYear: totalDailySavings * 365 * 0.12, // Assume $0.12/kWh
      totalZones: this.savingsTracking.size,
      dataPoints: totalDataPoints
    };
  }

  // Utility method for all adapters
  protected async makeHttpRequest(method: string, endpoint: string, data?: any, headers?: any) {
    const url = `${this.config.endpoint}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('api', `HTTP request failed: ${method} ${url}`, error);
      throw error;
    }
  }
}

// Export base class and interfaces
export default ControlSystemAdapter;