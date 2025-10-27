/**
 * Alert Detection Service
 * Monitors sensor readings and triggers alerts based on configured thresholds
 */

import { EventEmitter } from 'events';
import { prisma } from '../prisma';
import { redis } from '../redis';
import { logger } from '../logging/production-logger';
import { getWebSocketServer } from '../websocket/scalable-websocket-server';
import { queues } from '../queue/queue-manager';

// Types
export interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AlertConfiguration {
  id: string;
  facilityId: string;
  sensorId: string;
  name: string;
  enabled: boolean;
  alertType: string;
  condition: string;
  threshold: number;
  thresholdMax?: number;
  severity: string;
  duration?: number;
  cooldownMinutes: number;
  actions: Record<string, boolean>;
  notificationMessage?: string;
  metadata?: Record<string, any>;
  lastTriggeredAt?: Date;
  triggerCount: number;
}

export interface AlertState {
  configId: string;
  sensorId: string;
  startTime: Date;
  lastValue: number;
  violationCount: number;
}

export interface AlertViolation {
  config: AlertConfiguration;
  reading: SensorReading;
  thresholdValue: number;
  actualValue: number;
  condition: string;
}

export class AlertDetector extends EventEmitter {
  private alertStates: Map<string, AlertState> = new Map();
  private cooldownTracker: Map<string, Date> = new Map();
  private configCache: Map<string, AlertConfiguration[]> = new Map();
  private cacheExpiry: Map<string, Date> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.setMaxListeners(50); // Allow many listeners for real-time updates
  }

  /**
   * Main entry point for alert detection
   * Called from sensor-data-worker when processing sensor readings
   */
  async detectAlerts(reading: SensorReading, sensorMetadata?: any): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Get alert configurations for this sensor
      const configs = await this.getAlertConfigurations(reading.sensorId);
      
      if (configs.length === 0) {
        return; // No alert configurations for this sensor
      }

      // Evaluate each configuration
      const violations: AlertViolation[] = [];
      
      for (const config of configs) {
        if (!config.enabled) continue;
        
        const violation = await this.evaluateThreshold(config, reading);
        if (violation) {
          violations.push(violation);
        }
      }

      // Process violations
      for (const violation of violations) {
        await this.processViolation(violation, reading);
      }

      const duration = Date.now() - startTime;
      logger.debug('alert-detector', `Alert detection completed for sensor ${reading.sensorId}`, {
        sensorId: reading.sensorId,
        configsEvaluated: configs.length,
        violationsFound: violations.length,
        durationMs: duration
      });

      // Emit metrics
      this.emit('metrics', {
        alerts_triggered_total: violations.length,
        alert_evaluation_duration_ms: duration,
        sensorId: reading.sensorId
      });

    } catch (error) {
      logger.error('alert-detector', 'Alert detection failed', error as Error, {
        sensorId: reading.sensorId,
        value: reading.value
      });
      
      // Don't throw - we don't want to break the sensor data pipeline
      this.emit('error', error);
    }
  }

  /**
   * Evaluate if a sensor reading violates a threshold configuration
   */
  async evaluateThreshold(config: AlertConfiguration, reading: SensorReading): Promise<AlertViolation | null> {
    const { condition, threshold, thresholdMax } = config;
    const value = reading.value;

    let isViolation = false;
    let thresholdValue = threshold;

    switch (condition) {
      case 'GT':
        isViolation = value > threshold;
        break;
      case 'GTE':
        isViolation = value >= threshold;
        break;
      case 'LT':
        isViolation = value < threshold;
        break;
      case 'LTE':
        isViolation = value <= threshold;
        break;
      case 'BETWEEN':
        if (thresholdMax === undefined) {
          logger.warn('alert-detector', 'BETWEEN condition requires thresholdMax', { configId: config.id });
          return null;
        }
        isViolation = value < threshold || value > thresholdMax;
        thresholdValue = thresholdMax; // Use max for display
        break;
      case 'RATE':
        // Rate of change detection
        const rateViolation = await this.checkRateOfChange(config, reading);
        if (rateViolation) {
          return rateViolation;
        }
        return null;
      default:
        logger.warn('alert-detector', 'Unknown alert condition', { condition, configId: config.id });
        return null;
    }

    if (!isViolation) {
      // Clear any existing state for this config
      this.clearAlertState(config.id);
      return null;
    }

    // Check if this is a duration-based alert
    if (config.duration && config.duration > 0) {
      const shouldTrigger = await this.checkDurationPersistence(config, reading);
      if (!shouldTrigger) {
        return null; // Not yet persistent enough
      }
    }

    return {
      config,
      reading,
      thresholdValue,
      actualValue: value,
      condition
    };
  }

  /**
   * Check rate of change for RATE condition
   */
  private async checkRateOfChange(config: AlertConfiguration, reading: SensorReading): Promise<AlertViolation | null> {
    const stateKey = `${config.id}:rate`;
    const previousState = this.alertStates.get(stateKey);
    
    if (!previousState) {
      // First reading, store state
      this.alertStates.set(stateKey, {
        configId: config.id,
        sensorId: reading.sensorId,
        startTime: reading.timestamp,
        lastValue: reading.value,
        violationCount: 0
      });
      return null;
    }

    const timeDiff = reading.timestamp.getTime() - previousState.startTime.getTime();
    const valueDiff = Math.abs(reading.value - previousState.lastValue);
    
    if (timeDiff === 0) return null; // Avoid division by zero
    
    const rate = valueDiff / (timeDiff / 1000); // per second
    
    if (rate > config.threshold) {
      return {
        config,
        reading,
        thresholdValue: config.threshold,
        actualValue: rate,
        condition: 'RATE'
      };
    }

    // Update state
    this.alertStates.set(stateKey, {
      ...previousState,
      lastValue: reading.value,
      startTime: reading.timestamp
    });

    return null;
  }

  /**
   * Check if a violation has persisted for the required duration
   */
  private async checkDurationPersistence(config: AlertConfiguration, reading: SensorReading): Promise<boolean> {
    if (!config.duration || config.duration <= 0) {
      return true; // No duration requirement
    }

    const stateKey = config.id;
    const existingState = this.alertStates.get(stateKey);
    
    if (!existingState) {
      // Start tracking this violation
      this.alertStates.set(stateKey, {
        configId: config.id,
        sensorId: reading.sensorId,
        startTime: reading.timestamp,
        lastValue: reading.value,
        violationCount: 1
      });
      return false; // Not yet persistent
    }

    const durationMs = config.duration * 60 * 1000; // Convert minutes to milliseconds
    const elapsed = reading.timestamp.getTime() - existingState.startTime.getTime();
    
    if (elapsed >= durationMs) {
      // Duration requirement met
      this.clearAlertState(stateKey);
      return true;
    }

    // Update violation count
    existingState.violationCount++;
    existingState.lastValue = reading.value;
    
    return false; // Still building up duration
  }

  /**
   * Process a confirmed alert violation
   */
  private async processViolation(violation: AlertViolation, reading: SensorReading): Promise<void> {
    const { config } = violation;
    
    // Check cooldown period
    if (!this.shouldTriggerAlert(config.id)) {
      logger.debug('alert-detector', 'Alert in cooldown period', { configId: config.id });
      return;
    }

    // Create the alert
    await this.createAlert(violation, reading);
  }

  /**
   * Create an alert in the database and trigger notifications
   */
  private async createAlert(violation: AlertViolation, reading: SensorReading): Promise<void> {
    const { config, thresholdValue, actualValue, condition } = violation;
    
    try {
      // Generate alert message
      const message = this.generateAlertMessage(config, actualValue, thresholdValue, condition);
      
      // Create alert log entry
      const alertLog = await prisma.alertLog.create({
        data: {
          alertConfigId: config.id,
          sensorId: reading.sensorId,
          facilityId: config.facilityId,
          alertType: config.alertType as any,
          severity: config.severity as any,
          message,
          triggeredValue: actualValue,
          thresholdValue,
          unit: reading.unit,
          sensorName: reading.metadata?.sensorName,
          location: reading.metadata?.location,
          metadata: {
            condition,
            readingMetadata: reading.metadata,
            configMetadata: config.metadata
          }
        }
      });

      // Update configuration trigger count and last triggered time
      await prisma.alertConfiguration.update({
        where: { id: config.id },
        data: {
          lastTriggeredAt: new Date(),
          triggerCount: { increment: 1 }
        }
      });

      // Set cooldown
      this.setCooldown(config.id, config.cooldownMinutes);

      // Emit alert created event
      this.emit('alert:created', {
        alertId: alertLog.id,
        configId: config.id,
        sensorId: reading.sensorId,
        facilityId: config.facilityId,
        severity: config.severity,
        message,
        value: actualValue,
        threshold: thresholdValue,
        timestamp: new Date()
      });

      // Queue notifications based on actions
      await this.queueNotifications(alertLog, config);

      // Broadcast to WebSocket
      await this.broadcastAlert(alertLog, config);

      // Update Redis counters
      await this.updateAlertCounters(config.facilityId, config.severity);

      logger.info('alert-detector', 'Alert created successfully', {
        alertId: alertLog.id,
        configId: config.id,
        sensorId: reading.sensorId,
        severity: config.severity,
        value: actualValue,
        threshold: thresholdValue
      });

    } catch (error) {
      logger.error('alert-detector', 'Failed to create alert', error as Error, {
        configId: config.id,
        sensorId: reading.sensorId
      });
      throw error;
    }
  }

  /**
   * Generate alert message from template
   */
  private generateAlertMessage(
    config: AlertConfiguration, 
    actualValue: number, 
    thresholdValue: number, 
    condition: string
  ): string {
    if (config.notificationMessage) {
      return config.notificationMessage
        .replace('{{sensorName}}', config.name)
        .replace('{{value}}', actualValue.toString())
        .replace('{{threshold}}', thresholdValue.toString())
        .replace('{{unit}}', '') // Will be filled from reading
        .replace('{{condition}}', condition);
    }

    // Default message template
    const conditionText = this.getConditionText(condition);
    return `${config.name}: ${conditionText} threshold (${actualValue} vs ${thresholdValue})`;
  }

  /**
   * Get human-readable condition text
   */
  private getConditionText(condition: string): string {
    const conditionMap: Record<string, string> = {
      'GT': 'exceeded',
      'GTE': 'reached or exceeded',
      'LT': 'fell below',
      'LTE': 'reached or fell below',
      'BETWEEN': 'outside range',
      'RATE': 'rate of change exceeded'
    };
    return conditionMap[condition] || condition;
  }

  /**
   * Queue notification jobs based on alert actions
   */
  private async queueNotifications(alertLog: any, config: AlertConfiguration): Promise<void> {
    const actions = config.actions;
    
    for (const [actionType, enabled] of Object.entries(actions)) {
      if (!enabled) continue;
      
      try {
        await queues.notificationQueue.add('send-alert', {
          alertId: alertLog.id,
          alertType: 'sensor_alert',
          severity: config.severity,
          title: `Sensor Alert: ${config.name}`,
          message: alertLog.message,
          data: {
            alertLogId: alertLog.id,
            configId: config.id,
            sensorId: alertLog.sensorId,
            facilityId: alertLog.facilityId,
            value: alertLog.triggeredValue,
            threshold: alertLog.thresholdValue,
            unit: alertLog.unit
          }
        });
      } catch (error) {
        logger.error('alert-detector', 'Failed to queue notification', error as Error, {
          actionType,
          alertId: alertLog.id
        });
      }
    }
  }

  /**
   * Broadcast alert to WebSocket clients
   */
  private async broadcastAlert(alertLog: any, config: AlertConfiguration): Promise<void> {
    try {
      const wsServer = getWebSocketServer();
      
      // Broadcast to facility room
      wsServer.io.to(`facility:${config.facilityId}`).emit('alert:created', {
        id: alertLog.id,
        type: 'sensor_alert',
        severity: config.severity,
        title: config.name,
        message: alertLog.message,
        sensorId: alertLog.sensorId,
        value: alertLog.triggeredValue,
        threshold: alertLog.thresholdValue,
        timestamp: alertLog.createdAt
      });
    } catch (error) {
      logger.error('alert-detector', 'Failed to broadcast alert', error as Error, {
        alertId: alertLog.id
      });
    }
  }

  /**
   * Update alert counters in Redis
   */
  private async updateAlertCounters(facilityId: string, severity: string): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      const today = new Date().toISOString().split('T')[0];
      
      // Increment daily counters
      pipeline.incr(`alerts:${facilityId}:${today}:total`);
      pipeline.incr(`alerts:${facilityId}:${today}:${severity.toLowerCase()}`);
      
      // Set expiry for daily counters (7 days)
      pipeline.expire(`alerts:${facilityId}:${today}:total`, 7 * 24 * 60 * 60);
      pipeline.expire(`alerts:${facilityId}:${today}:${severity.toLowerCase()}`, 7 * 24 * 60 * 60);
      
      await pipeline.exec();
    } catch (error) {
      logger.error('alert-detector', 'Failed to update alert counters', error as Error, {
        facilityId,
        severity
      });
    }
  }

  /**
   * Get alert configurations for a sensor (with caching)
   */
  private async getAlertConfigurations(sensorId: string): Promise<AlertConfiguration[]> {
    const cacheKey = `sensor:${sensorId}`;
    const cached = this.configCache.get(cacheKey);
    const expiry = this.cacheExpiry.get(cacheKey);
    
    // Check cache validity
    if (cached && expiry && new Date() < expiry) {
      return cached;
    }

    try {
      // Fetch from database
      const configs = await prisma.alertConfiguration.findMany({
        where: {
          sensorId,
          enabled: true
        },
        orderBy: {
          severity: 'desc' // Process critical alerts first
        }
      });

      // Cache the results
      this.configCache.set(cacheKey, configs as AlertConfiguration[]);
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + this.CACHE_TTL));

      return configs as AlertConfiguration[];
    } catch (error) {
      logger.error('alert-detector', 'Failed to fetch alert configurations', error as Error, {
        sensorId
      });
      return [];
    }
  }

  /**
   * Check if alert should trigger (not in cooldown)
   */
  private shouldTriggerAlert(configId: string): boolean {
    const cooldownEnd = this.cooldownTracker.get(configId);
    if (!cooldownEnd) return true;
    
    return new Date() >= cooldownEnd;
  }

  /**
   * Set cooldown period for a configuration
   */
  private setCooldown(configId: string, cooldownMinutes: number): void {
    const cooldownEnd = new Date(Date.now() + cooldownMinutes * 60 * 1000);
    this.cooldownTracker.set(configId, cooldownEnd);
  }

  /**
   * Clear alert state for a configuration
   */
  private clearAlertState(configId: string): void {
    this.alertStates.delete(configId);
  }

  /**
   * Invalidate configuration cache for a sensor
   */
  public invalidateConfigCache(sensorId: string): void {
    const cacheKey = `sensor:${sensorId}`;
    this.configCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }

  /**
   * Invalidate all configuration caches
   */
  public invalidateAllConfigCaches(): void {
    this.configCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get current alert states (for debugging)
   */
  public getAlertStates(): Map<string, AlertState> {
    return new Map(this.alertStates);
  }

  /**
   * Get current cooldown tracker (for debugging)
   */
  public getCooldownTracker(): Map<string, Date> {
    return new Map(this.cooldownTracker);
  }

  /**
   * Cleanup expired states and cooldowns
   */
  public cleanup(): void {
    const now = new Date();
    
    // Clean up expired alert states (older than 1 hour)
    for (const [key, state] of this.alertStates.entries()) {
      if (now.getTime() - state.startTime.getTime() > 60 * 60 * 1000) {
        this.alertStates.delete(key);
      }
    }
    
    // Clean up expired cooldowns
    for (const [key, cooldownEnd] of this.cooldownTracker.entries()) {
      if (now >= cooldownEnd) {
        this.cooldownTracker.delete(key);
      }
    }
    
    // Clean up expired cache entries
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.configCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }
}

// Export singleton instance
export const alertDetector = new AlertDetector();

// Cleanup every 10 minutes
setInterval(() => {
  alertDetector.cleanup();
}, 10 * 60 * 1000);


