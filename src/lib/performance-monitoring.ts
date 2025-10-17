'use client';

import { z } from 'zod';

// Types and Interfaces
export interface PerformanceMetrics {
  id: string;
  customerId: string;
  facilityId: string;
  timestamp: Date;
  period: 'real-time' | 'hourly' | 'daily' | 'monthly';
  energyData: {
    consumption: number; // kWh
    baseline: number; // kWh
    savings: number; // kWh
    savingsPercentage: number;
    demand: number; // kW
    powerFactor: number;
  };
  environmentalData: {
    temperature: number; // °F
    humidity: number; // %
    vpd: number; // kPa
    co2: number; // ppm
    lightLevel: number; // PPFD
  };
  operationalData: {
    systemStatus: 'active' | 'inactive' | 'error' | 'maintenance';
    optimizationMode: 'automatic' | 'manual' | 'override';
    activeSystems: string[];
    alerts: Alert[];
  };
  performanceScore: number; // 0-100
}

export interface PerformanceGuarantee {
  id: string;
  customerId: string;
  facilityId: string;
  type: 'energy-savings' | 'crop-protection' | 'uptime' | 'response-time';
  metric: string;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=' | '=';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  consequences: GuaranteeConsequence[];
  status: 'met' | 'at-risk' | 'violated' | 'pending';
  currentValue: number;
  lastEvaluated: Date;
  nextEvaluation: Date;
}

export interface GuaranteeConsequence {
  type: 'credit' | 'refund' | 'service-extension' | 'penalty-waiver';
  amount?: number;
  description: string;
  autoApply: boolean;
}

export interface Alert {
  id: string;
  type: 'performance' | 'guarantee' | 'system' | 'environmental' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actionRequired: boolean;
  escalationLevel: number;
  notificationsSent: string[];
}

export interface PerformanceReport {
  id: string;
  customerId: string;
  facilityId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    overallScore: number;
    guaranteeStatus: 'all-met' | 'some-at-risk' | 'violations';
    totalSavings: number;
    savingsPercentage: number;
    uptime: number;
    alertCount: number;
  };
  details: {
    energyPerformance: any;
    guaranteeEvaluations: PerformanceGuarantee[];
    alerts: Alert[];
    recommendations: string[];
  };
  generatedAt: Date;
}

// Performance Monitoring Service
export class PerformanceMonitoringService {
  private static readonly PERFORMANCE_THRESHOLDS = {
    excellent: 95,
    good: 85,
    fair: 70,
    poor: 50
  };

  private static readonly GUARANTEE_TYPES = {
    'energy-savings': {
      defaultThreshold: 15, // 15% minimum savings
      evaluationPeriod: 'monthly',
      consequences: [
        {
          type: 'service-extension' as const,
          description: 'Service provided free until guarantee is met',
          autoApply: true
        }
      ]
    },
    'crop-protection': {
      defaultThreshold: 0, // Zero crop damage tolerance
      evaluationPeriod: 'daily',
      consequences: [
        {
          type: 'credit' as const,
          amount: 100000, // $100K crop loss protection
          description: 'Crop loss insurance coverage',
          autoApply: false
        }
      ]
    },
    'uptime': {
      defaultThreshold: 99.5, // 99.5% uptime guarantee
      evaluationPeriod: 'monthly',
      consequences: [
        {
          type: 'credit' as const,
          description: 'Service credit for downtime',
          autoApply: true
        }
      ]
    }
  };

  static calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const weights = {
      energySavings: 0.4,
      systemUptime: 0.3,
      environmentalStability: 0.2,
      responseTime: 0.1
    };

    // Energy savings score (0-100 based on percentage of target)
    const energySavingsScore = Math.min(100, (metrics.energyData.savingsPercentage / 0.15) * 100);

    // System uptime score
    const uptimeScore = metrics.operationalData.systemStatus === 'active' ? 100 : 0;

    // Environmental stability score (based on VPD and temperature stability)
    const envScore = this.calculateEnvironmentalScore(metrics.environmentalData);

    // Response time score (based on alert resolution time)
    const responseScore = this.calculateResponseScore(metrics.operationalData.alerts);

    const overallScore = 
      (energySavingsScore * weights.energySavings) +
      (uptimeScore * weights.systemUptime) +
      (envScore * weights.environmentalStability) +
      (responseScore * weights.responseTime);

    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }

  private static calculateEnvironmentalScore(envData: any): number {
    // Ideal ranges for cannabis cultivation
    const idealRanges = {
      temperature: { min: 70, max: 80 },
      humidity: { min: 45, max: 65 },
      vpd: { min: 0.8, max: 1.2 },
      co2: { min: 900, max: 1200 }
    };

    let score = 0;
    let factors = 0;

    Object.entries(idealRanges).forEach(([key, range]) => {
      if (envData[key] !== undefined) {
        const value = envData[key];
        if (value >= range.min && value <= range.max) {
          score += 100;
        } else {
          // Deduct points based on how far outside the range
          const deviation = Math.min(
            Math.abs(value - range.min),
            Math.abs(value - range.max)
          );
          const maxDeviation = (range.max - range.min) * 0.5;
          score += Math.max(0, 100 - (deviation / maxDeviation) * 100);
        }
        factors++;
      }
    });

    return factors > 0 ? score / factors : 100;
  }

  private static calculateResponseScore(alerts: Alert[]): number {
    if (alerts.length === 0) return 100;

    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

    if (criticalAlerts.length > 0) return 50;
    if (unresolvedAlerts.length > 5) return 70;
    if (unresolvedAlerts.length > 2) return 85;

    return 100;
  }

  static async evaluateGuarantees(
    customerId: string,
    facilityId: string,
    period: Date
  ): Promise<PerformanceGuarantee[]> {
    // In production, this would fetch from database
    const guarantees = await this.getCustomerGuarantees(customerId, facilityId);
    const evaluatedGuarantees: PerformanceGuarantee[] = [];

    for (const guarantee of guarantees) {
      const currentValue = await this.calculateGuaranteeMetric(guarantee, period);
      const status = this.evaluateGuaranteeStatus(guarantee, currentValue);

      const evaluatedGuarantee: PerformanceGuarantee = {
        ...guarantee,
        currentValue,
        status,
        lastEvaluated: new Date(),
        nextEvaluation: this.calculateNextEvaluation(guarantee.period)
      };

      evaluatedGuarantees.push(evaluatedGuarantee);

      // Trigger consequences if guarantee is violated
      if (status === 'violated') {
        await this.triggerGuaranteeConsequences(evaluatedGuarantee);
      }
    }

    return evaluatedGuarantees;
  }

  private static async getCustomerGuarantees(
    customerId: string,
    facilityId: string
  ): Promise<PerformanceGuarantee[]> {
    // Default guarantees for all customers
    return [
      {
        id: `guarantee_savings_${customerId}`,
        customerId,
        facilityId,
        type: 'energy-savings',
        metric: 'savings_percentage',
        threshold: 15,
        operator: '>=',
        period: 'monthly',
        consequences: this.GUARANTEE_TYPES['energy-savings'].consequences,
        status: 'pending',
        currentValue: 0,
        lastEvaluated: new Date(),
        nextEvaluation: new Date()
      },
      {
        id: `guarantee_crop_${customerId}`,
        customerId,
        facilityId,
        type: 'crop-protection',
        metric: 'crop_damage_incidents',
        threshold: 0,
        operator: '<=',
        period: 'daily',
        consequences: this.GUARANTEE_TYPES['crop-protection'].consequences,
        status: 'pending',
        currentValue: 0,
        lastEvaluated: new Date(),
        nextEvaluation: new Date()
      },
      {
        id: `guarantee_uptime_${customerId}`,
        customerId,
        facilityId,
        type: 'uptime',
        metric: 'system_uptime_percentage',
        threshold: 99.5,
        operator: '>=',
        period: 'monthly',
        consequences: this.GUARANTEE_TYPES['uptime'].consequences,
        status: 'pending',
        currentValue: 0,
        lastEvaluated: new Date(),
        nextEvaluation: new Date()
      }
    ];
  }

  private static async calculateGuaranteeMetric(
    guarantee: PerformanceGuarantee,
    period: Date
  ): Promise<number> {
    // In production, this would calculate from actual metrics data
    switch (guarantee.metric) {
      case 'savings_percentage':
        // Mock calculation - would use actual billing data
        return 28.5; // Example: 28.5% savings
      case 'crop_damage_incidents':
        return 0; // No crop damage incidents
      case 'system_uptime_percentage':
        return 99.8; // 99.8% uptime
      default:
        return 0;
    }
  }

  private static evaluateGuaranteeStatus(
    guarantee: PerformanceGuarantee,
    currentValue: number
  ): 'met' | 'at-risk' | 'violated' | 'pending' {
    switch (guarantee.operator) {
      case '>=':
        if (currentValue >= guarantee.threshold) return 'met';
        if (currentValue >= guarantee.threshold * 0.9) return 'at-risk';
        return 'violated';
      case '<=':
        if (currentValue <= guarantee.threshold) return 'met';
        if (currentValue <= guarantee.threshold * 1.1) return 'at-risk';
        return 'violated';
      case '>':
        return currentValue > guarantee.threshold ? 'met' : 'violated';
      case '<':
        return currentValue < guarantee.threshold ? 'met' : 'violated';
      case '=':
        return currentValue === guarantee.threshold ? 'met' : 'violated';
      default:
        return 'pending';
    }
  }

  private static calculateNextEvaluation(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case 'quarterly':
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        return nextQuarter;
      case 'annual':
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private static async triggerGuaranteeConsequences(
    guarantee: PerformanceGuarantee
  ): Promise<void> {
    for (const consequence of guarantee.consequences) {
      if (consequence.autoApply) {
        await this.applyConsequence(guarantee, consequence);
      } else {
        // Queue for manual review
        await this.queueForReview(guarantee, consequence);
      }
    }
  }

  private static async applyConsequence(
    guarantee: PerformanceGuarantee,
    consequence: GuaranteeConsequence
  ): Promise<void> {
    logger.info('api', `Applying consequence for guarantee ${guarantee.id}:`, { data: consequence });
    
    // In production, this would integrate with billing system, notifications, etc.
    switch (consequence.type) {
      case 'service-extension':
        // Extend service period without charge
        break;
      case 'credit':
        // Apply credit to customer account
        break;
      case 'refund':
        // Process refund
        break;
      case 'penalty-waiver':
        // Waive any penalties
        break;
    }
  }

  private static async queueForReview(
    guarantee: PerformanceGuarantee,
    consequence: GuaranteeConsequence
  ): Promise<void> {
    logger.info('api', `Queuing for manual review: guarantee ${guarantee.id}`, { data: consequence });
    // Queue in support ticket system for manual review
  }
}

// Alert Management Service
export class AlertManagementService {
  private static readonly ESCALATION_DELAYS = {
    low: 4 * 60 * 60 * 1000, // 4 hours
    medium: 2 * 60 * 60 * 1000, // 2 hours
    high: 30 * 60 * 1000, // 30 minutes
    critical: 5 * 60 * 1000 // 5 minutes
  };

  static createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    description: string,
    customerId: string,
    facilityId: string
  ): Alert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      description,
      timestamp: new Date(),
      resolved: false,
      actionRequired: severity === 'high' || severity === 'critical',
      escalationLevel: 0,
      notificationsSent: []
    };
  }

  static async processAlert(alert: Alert): Promise<void> {
    // Send initial notifications
    await this.sendNotifications(alert);

    // Set up escalation timer if needed
    if (alert.actionRequired) {
      setTimeout(() => {
        this.escalateAlert(alert);
      }, this.ESCALATION_DELAYS[alert.severity]);
    }

    // Log alert
    logger.info('api', `Alert created: ${alert.title} (${alert.severity})`);
  }

  private static async sendNotifications(alert: Alert): Promise<void> {
    const notifications: string[] = [];

    switch (alert.severity) {
      case 'critical':
        // SMS, email, phone call
        notifications.push('sms', 'email', 'phone');
        break;
      case 'high':
        // SMS and email
        notifications.push('sms', 'email');
        break;
      case 'medium':
        // Email only
        notifications.push('email');
        break;
      case 'low':
        // Dashboard notification only
        notifications.push('dashboard');
        break;
    }

    // In production, this would integrate with notification services
    alert.notificationsSent = notifications;
  }

  private static async escalateAlert(alert: Alert): Promise<void> {
    if (alert.resolved) return;

    alert.escalationLevel++;
    
    // Escalate to higher support tiers
    switch (alert.escalationLevel) {
      case 1:
        // Escalate to senior technician
        break;
      case 2:
        // Escalate to engineering team
        break;
      case 3:
        // Escalate to management
        break;
    }

    // Send escalation notifications
    await this.sendNotifications(alert);
  }

  static resolveAlert(alertId: string, resolution: string): void {
    // In production, this would update the database
    logger.info('api', `Alert ${alertId} resolved: ${resolution}`);
  }
}

// Performance Reporting Service
export class PerformanceReportingService {
  static async generateReport(
    customerId: string,
    facilityId: string,
    reportType: PerformanceReport['reportType'],
    period: { start: Date; end: Date }
  ): Promise<PerformanceReport> {
    // Gather performance data
    const metrics = await this.gatherMetrics(customerId, facilityId, period);
    const guarantees = await PerformanceMonitoringService.evaluateGuarantees(
      customerId,
      facilityId,
      period.end
    );
    const alerts = await this.gatherAlerts(customerId, facilityId, period);

    // Calculate summary
    const summary = this.calculateSummary(metrics, guarantees, alerts);

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, guarantees, alerts);

    const report: PerformanceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      facilityId,
      reportType,
      period,
      summary,
      details: {
        energyPerformance: metrics,
        guaranteeEvaluations: guarantees,
        alerts,
        recommendations
      },
      generatedAt: new Date()
    };

    return report;
  }

  private static async gatherMetrics(
    customerId: string,
    facilityId: string,
    period: { start: Date; end: Date }
  ): Promise<any> {
    // In production, this would query actual metrics data
    return {
      totalSavings: 15750,
      savingsPercentage: 28.5,
      uptimePercentage: 99.8,
      averagePerformanceScore: 94,
      energyReduction: 45500, // kWh
      demandReduction: 25, // kW
      co2Reduction: 22000 // lbs
    };
  }

  private static async gatherAlerts(
    customerId: string,
    facilityId: string,
    period: { start: Date; end: Date }
  ): Promise<Alert[]> {
    // Mock data - in production, would query from database
    return [
      {
        id: 'alert_1',
        type: 'performance',
        severity: 'medium',
        title: 'Temperature spike detected',
        description: 'Room 2 temperature exceeded 85°F for 15 minutes',
        timestamp: new Date('2024-12-10T14:30:00'),
        resolved: true,
        resolvedAt: new Date('2024-12-10T14:45:00'),
        actionRequired: false,
        escalationLevel: 0,
        notificationsSent: ['email']
      }
    ];
  }

  private static calculateSummary(
    metrics: any,
    guarantees: PerformanceGuarantee[],
    alerts: Alert[]
  ): PerformanceReport['summary'] {
    const violatedGuarantees = guarantees.filter(g => g.status === 'violated');
    const atRiskGuarantees = guarantees.filter(g => g.status === 'at-risk');
    
    let guaranteeStatus: 'all-met' | 'some-at-risk' | 'violations';
    if (violatedGuarantees.length > 0) {
      guaranteeStatus = 'violations';
    } else if (atRiskGuarantees.length > 0) {
      guaranteeStatus = 'some-at-risk';
    } else {
      guaranteeStatus = 'all-met';
    }

    return {
      overallScore: metrics.averagePerformanceScore,
      guaranteeStatus,
      totalSavings: metrics.totalSavings,
      savingsPercentage: metrics.savingsPercentage,
      uptime: metrics.uptimePercentage,
      alertCount: alerts.length
    };
  }

  private static generateRecommendations(
    metrics: any,
    guarantees: PerformanceGuarantee[],
    alerts: Alert[]
  ): string[] {
    const recommendations: string[] = [];

    // Performance-based recommendations
    if (metrics.savingsPercentage < 20) {
      recommendations.push('Consider adjusting optimization parameters to increase energy savings');
    }

    if (metrics.uptimePercentage < 99) {
      recommendations.push('Schedule preventive maintenance to improve system reliability');
    }

    // Guarantee-based recommendations
    const atRiskGuarantees = guarantees.filter(g => g.status === 'at-risk');
    atRiskGuarantees.forEach(guarantee => {
      recommendations.push(`Monitor ${guarantee.metric} closely - approaching guarantee threshold`);
    });

    // Alert-based recommendations
    const frequentAlertTypes = this.analyzeAlertPatterns(alerts);
    frequentAlertTypes.forEach(type => {
      recommendations.push(`Address recurring ${type} alerts to prevent escalation`);
    });

    return recommendations;
  }

  private static analyzeAlertPatterns(alerts: Alert[]): string[] {
    const alertCounts: { [key: string]: number } = {};
    
    alerts.forEach(alert => {
      alertCounts[alert.type] = (alertCounts[alert.type] || 0) + 1;
    });

    return Object.entries(alertCounts)
      .filter(([_, count]) => count >= 3) // 3 or more alerts of same type
      .map(([type, _]) => type);
  }
}

// Export all services
export {
  PerformanceMonitoringService,
  AlertManagementService,
  PerformanceReportingService
};