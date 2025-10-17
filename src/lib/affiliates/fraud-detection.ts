/**
 * Affiliate Fraud Detection System
 * Monitors and prevents fraudulent affiliate activity
 */

import { logger } from '@/lib/logging/production-logger';
import { db } from '@/lib/db/affiliate-queries';
import { cacheManager } from '@/lib/cache/cache-manager';

export interface FraudSignal {
  type: 'velocity' | 'pattern' | 'geographic' | 'device' | 'conversion' | 'referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  description: string;
  metadata?: any;
}

export interface FraudCheckResult {
  passed: boolean;
  score: number; // Total fraud score (0-100, higher = more suspicious)
  signals: FraudSignal[];
  action: 'allow' | 'review' | 'block' | 'suspend';
  reason?: string;
}

export class AffiliateFraudDetection {
  private readonly FRAUD_THRESHOLDS = {
    review: 30,    // Score > 30 triggers manual review
    block: 60,     // Score > 60 blocks the action
    suspend: 80    // Score > 80 suspends the affiliate
  };

  private readonly RATE_LIMITS = {
    clicks: {
      perMinute: 20,
      perHour: 200,
      perDay: 1000
    },
    conversions: {
      perHour: 5,
      perDay: 20,
      perWeek: 50
    },
    signups: {
      perDay: 10,
      perWeek: 30
    }
  };

  /**
   * Check for click fraud
   */
  async checkClickFraud(data: {
    affiliateId: string;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    clickId: string;
  }): Promise<FraudCheckResult> {
    const signals: FraudSignal[] = [];
    let totalScore = 0;

    // Check velocity (rapid clicking)
    const velocityScore = await this.checkClickVelocity(data.affiliateId, data.ipAddress);
    if (velocityScore > 0) {
      signals.push(velocityScore);
      totalScore += velocityScore.score;
    }

    // Check for suspicious patterns
    const patternScore = await this.checkClickPatterns(data);
    if (patternScore > 0) {
      signals.push(patternScore);
      totalScore += patternScore.score;
    }

    // Check IP reputation
    const ipScore = await this.checkIPReputation(data.ipAddress);
    if (ipScore > 0) {
      signals.push(ipScore);
      totalScore += ipScore.score;
    }

    // Check device fingerprinting
    const deviceScore = this.checkDeviceFingerprint(data.userAgent);
    if (deviceScore > 0) {
      signals.push(deviceScore);
      totalScore += deviceScore.score;
    }

    // Determine action based on total score
    const action = this.determineAction(totalScore);

    return {
      passed: action === 'allow',
      score: totalScore,
      signals,
      action,
      reason: signals.length > 0 ? signals[0].description : undefined
    };
  }

  /**
   * Check for conversion fraud
   */
  async checkConversionFraud(data: {
    affiliateId: string;
    customerId: string;
    orderValue: number;
    clickId: string;
    ipAddress: string;
  }): Promise<FraudCheckResult> {
    const signals: FraudSignal[] = [];
    let totalScore = 0;

    // Check conversion rate anomalies
    const conversionScore = await this.checkConversionRate(data.affiliateId);
    if (conversionScore > 0) {
      signals.push(conversionScore);
      totalScore += conversionScore.score;
    }

    // Check for self-referrals
    const selfReferralScore = await this.checkSelfReferral(data.affiliateId, data.customerId);
    if (selfReferralScore > 0) {
      signals.push(selfReferralScore);
      totalScore += selfReferralScore.score;
    }

    // Check order value anomalies
    const orderScore = this.checkOrderValueAnomaly(data.orderValue, data.affiliateId);
    if (orderScore > 0) {
      signals.push(orderScore);
      totalScore += orderScore.score;
    }

    // Check time between click and conversion
    const timingScore = await this.checkConversionTiming(data.clickId);
    if (timingScore > 0) {
      signals.push(timingScore);
      totalScore += timingScore.score;
    }

    const action = this.determineAction(totalScore);

    return {
      passed: action === 'allow',
      score: totalScore,
      signals,
      action,
      reason: signals.length > 0 ? signals[0].description : undefined
    };
  }

  /**
   * Check click velocity
   */
  private async checkClickVelocity(affiliateId: string, ipAddress: string): Promise<FraudSignal> {
    const keys = {
      minute: `fraud:clicks:${affiliateId}:${ipAddress}:minute`,
      hour: `fraud:clicks:${affiliateId}:${ipAddress}:hour`,
      day: `fraud:clicks:${affiliateId}:${ipAddress}:day`
    };

    // Increment counters
    const [minuteCount, hourCount, dayCount] = await Promise.all([
      this.incrementCounter(keys.minute, 60),
      this.incrementCounter(keys.hour, 3600),
      this.incrementCounter(keys.day, 86400)
    ]);

    // Check against limits
    if (minuteCount > this.RATE_LIMITS.clicks.perMinute) {
      return {
        type: 'velocity',
        severity: 'critical',
        score: 40,
        description: `Excessive clicks: ${minuteCount} in last minute from same IP`,
        metadata: { minuteCount, ipAddress }
      };
    }

    if (hourCount > this.RATE_LIMITS.clicks.perHour) {
      return {
        type: 'velocity',
        severity: 'high',
        score: 30,
        description: `High click rate: ${hourCount} in last hour from same IP`,
        metadata: { hourCount, ipAddress }
      };
    }

    if (dayCount > this.RATE_LIMITS.clicks.perDay) {
      return {
        type: 'velocity',
        severity: 'medium',
        score: 20,
        description: `Daily limit exceeded: ${dayCount} clicks from same IP`,
        metadata: { dayCount, ipAddress }
      };
    }

    return { type: 'velocity', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check for suspicious click patterns
   */
  private async checkClickPatterns(data: {
    affiliateId: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<FraudSignal> {
    // Check for bot patterns in user agent
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /headless/i,
      /phantom/i, /selenium/i, /puppeteer/i
    ];

    if (botPatterns.some(pattern => pattern.test(data.userAgent))) {
      return {
        type: 'pattern',
        severity: 'high',
        score: 35,
        description: 'Bot-like user agent detected',
        metadata: { userAgent: data.userAgent }
      };
    }

    // Check for repeating IP patterns
    const recentClicks = await this.getRecentClicks(data.affiliateId, 100);
    const ipCounts = recentClicks.reduce((acc, click) => {
      acc[click.ipAddress] = (acc[click.ipAddress] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([_, count]) => count > 10)
      .map(([ip]) => ip);

    if (suspiciousIPs.includes(data.ipAddress)) {
      return {
        type: 'pattern',
        severity: 'medium',
        score: 25,
        description: 'IP address shows suspicious activity pattern',
        metadata: { ipAddress: data.ipAddress, clickCount: ipCounts[data.ipAddress] }
      };
    }

    return { type: 'pattern', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check IP reputation
   */
  private async checkIPReputation(ipAddress: string): Promise<FraudSignal> {
    // Check if IP is in blocklist
    const isBlocked = await cacheManager.get(`fraud:ip:blocked:${ipAddress}`);
    if (isBlocked) {
      return {
        type: 'geographic',
        severity: 'critical',
        score: 50,
        description: 'IP address is blocklisted',
        metadata: { ipAddress }
      };
    }

    // Check for VPN/Proxy indicators
    const vpnIndicators = await this.checkVPNIndicators(ipAddress);
    if (vpnIndicators.isVPN) {
      return {
        type: 'geographic',
        severity: 'medium',
        score: 20,
        description: 'VPN or proxy detected',
        metadata: { ipAddress, vpnType: vpnIndicators.type }
      };
    }

    // Check for datacenter IPs
    if (this.isDatacenterIP(ipAddress)) {
      return {
        type: 'geographic',
        severity: 'medium',
        score: 15,
        description: 'Datacenter IP detected',
        metadata: { ipAddress }
      };
    }

    return { type: 'geographic', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check device fingerprint
   */
  private checkDeviceFingerprint(userAgent: string): FraudSignal {
    // Check for missing or generic user agents
    if (!userAgent || userAgent.length < 20) {
      return {
        type: 'device',
        severity: 'medium',
        score: 15,
        description: 'Missing or invalid user agent',
        metadata: { userAgent }
      };
    }

    // Check for outdated browsers
    const outdatedPatterns = [
      /MSIE [6-9]\./i,
      /Firefox\/[1-4]\d\./i,
      /Chrome\/[1-3]\d\./i
    ];

    if (outdatedPatterns.some(pattern => pattern.test(userAgent))) {
      return {
        type: 'device',
        severity: 'low',
        score: 10,
        description: 'Outdated browser detected',
        metadata: { userAgent }
      };
    }

    return { type: 'device', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check conversion rate anomalies
   */
  private async checkConversionRate(affiliateId: string): Promise<FraudSignal> {
    const stats = await db.analytics.getAffiliateMetrics(affiliateId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });

    const conversionRate = stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0;

    // Suspiciously high conversion rate
    if (conversionRate > 20) {
      return {
        type: 'conversion',
        severity: 'high',
        score: 30,
        description: `Abnormally high conversion rate: ${conversionRate.toFixed(2)}%`,
        metadata: { conversionRate, clicks: stats.clicks, conversions: stats.conversions }
      };
    }

    return { type: 'conversion', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check for self-referrals
   */
  private async checkSelfReferral(affiliateId: string, customerId: string): Promise<FraudSignal> {
    const affiliate = await db.affiliates.findById(affiliateId);
    if (!affiliate) return { type: 'referral', severity: 'low', score: 0, description: '' };

    // Check if customer ID matches affiliate user ID
    if (affiliate.userId === customerId) {
      return {
        type: 'referral',
        severity: 'critical',
        score: 100,
        description: 'Self-referral detected',
        metadata: { affiliateId, customerId }
      };
    }

    // Check if email domains match
    const customer = await db.affiliates.findByUserId(customerId);
    if (customer) {
      const affiliateDomain = affiliate.user.email.split('@')[1];
      const customerDomain = customer.user.email.split('@')[1];
      
      if (affiliateDomain === customerDomain && !this.isPublicEmailDomain(affiliateDomain)) {
        return {
          type: 'referral',
          severity: 'high',
          score: 40,
          description: 'Same email domain detected',
          metadata: { affiliateDomain, customerDomain }
        };
      }
    }

    return { type: 'referral', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check order value anomalies
   */
  private checkOrderValueAnomaly(orderValue: number, affiliateId: string): FraudSignal {
    // Check for suspiciously round numbers
    if (orderValue % 100 === 0 && orderValue > 1000) {
      return {
        type: 'conversion',
        severity: 'low',
        score: 10,
        description: 'Suspiciously round order value',
        metadata: { orderValue }
      };
    }

    // Check for extremely high values
    if (orderValue > 10000) {
      return {
        type: 'conversion',
        severity: 'medium',
        score: 20,
        description: 'Unusually high order value',
        metadata: { orderValue }
      };
    }

    return { type: 'conversion', severity: 'low', score: 0, description: '' };
  }

  /**
   * Check conversion timing
   */
  private async checkConversionTiming(clickId: string): Promise<FraudSignal> {
    const click = await db.affiliateClicks.findById(clickId);
    if (!click) return { type: 'conversion', severity: 'low', score: 0, description: '' };

    const timeDiff = Date.now() - new Date(click.createdAt).getTime();
    const minutes = timeDiff / 1000 / 60;

    // Too fast conversion (under 1 minute)
    if (minutes < 1) {
      return {
        type: 'conversion',
        severity: 'high',
        score: 35,
        description: 'Conversion too fast after click',
        metadata: { minutes: minutes.toFixed(2) }
      };
    }

    // Suspiciously fast (under 5 minutes)
    if (minutes < 5) {
      return {
        type: 'conversion',
        severity: 'medium',
        score: 20,
        description: 'Quick conversion after click',
        metadata: { minutes: minutes.toFixed(2) }
      };
    }

    return { type: 'conversion', severity: 'low', score: 0, description: '' };
  }

  /**
   * Helper methods
   */
  private determineAction(score: number): FraudCheckResult['action'] {
    if (score >= this.FRAUD_THRESHOLDS.suspend) return 'suspend';
    if (score >= this.FRAUD_THRESHOLDS.block) return 'block';
    if (score >= this.FRAUD_THRESHOLDS.review) return 'review';
    return 'allow';
  }

  private async incrementCounter(key: string, ttl: number): Promise<number> {
    const count = await cacheManager.get<number>(key) || 0;
    await cacheManager.set(key, count + 1, { ttl });
    return count + 1;
  }

  private async getRecentClicks(affiliateId: string, limit: number): Promise<any[]> {
    // Mock implementation - would query database
    return [];
  }

  private async checkVPNIndicators(ipAddress: string): Promise<{ isVPN: boolean; type?: string }> {
    // Mock implementation - would check against VPN detection service
    return { isVPN: false };
  }

  private isDatacenterIP(ipAddress: string): boolean {
    // Mock implementation - would check against datacenter IP ranges
    return false;
  }

  private isPublicEmailDomain(domain: string): boolean {
    const publicDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
    ];
    return publicDomains.includes(domain.toLowerCase());
  }

  /**
   * Log fraud attempt
   */
  async logFraudAttempt(data: {
    affiliateId: string;
    type: string;
    score: number;
    action: string;
    metadata: any;
  }): Promise<void> {
    logger.warn('api', `Fraud attempt detected for affiliate ${data.affiliateId}`, {
      type: data.type,
      score: data.score,
      action: data.action,
      metadata: data.metadata
    });

    // Store in database for analysis
    // await db.fraudLogs.create(data);

    // Update affiliate fraud score
    if (data.score > 50) {
      // await db.affiliates.incrementFraudScore(data.affiliateId, data.score);
    }
  }
}

// Export singleton instance
export const fraudDetection = new AffiliateFraudDetection();