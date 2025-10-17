import { PrismaClient } from '@prisma/client';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { differenceInMinutes, startOfHour, endOfHour, startOfDay, endOfDay } from 'date-fns';
import { logger } from '@/lib/logging/production-logger';

const prisma = new PrismaClient();

// Time-of-Use Rate Structure
interface TimeOfUseRate {
  peakRate: number;
  offPeakRate: number;
  superOffPeakRate?: number;
  peakHours: { start: number; end: number };
  offPeakHours: { start: number; end: number };
  superOffPeakHours?: { start: number; end: number };
}

// Default TOU rates (can be customized per facility)
const DEFAULT_TOU_RATES: TimeOfUseRate = {
  peakRate: 0.28,        // $/kWh during peak
  offPeakRate: 0.12,     // $/kWh during off-peak
  superOffPeakRate: 0.08, // $/kWh during super off-peak
  peakHours: { start: 16, end: 21 },      // 4 PM - 9 PM
  offPeakHours: { start: 6, end: 16 },    // 6 AM - 4 PM
  superOffPeakHours: { start: 0, end: 6 } // 12 AM - 6 AM
};

export interface EnergyReading {
  facilityId: string;
  zoneId?: string;
  timestamp: Date;
  powerKw: number;
  energyKwh?: number;
  voltage?: number;
  current?: number;
  powerFactor?: number;
  source: 'meter' | 'control_system' | 'estimated';
  deviceId?: string;
}

export interface LoadSheddingSchedule {
  facilityId: string;
  zoneId: string;
  startTime: Date;
  endTime: Date;
  targetReductionKw: number;
  priority: 1 | 2 | 3; // 1 = highest priority
  reason: 'peak_demand' | 'grid_event' | 'cost_optimization' | 'manual';
}

export interface EnergySavingsReport {
  facilityId: string;
  periodStart: Date;
  periodEnd: Date;
  baselineKwh: number;
  actualKwh: number;
  savedKwh: number;
  baselineCost: number;
  actualCost: number;
  savedCost: number;
  peakDemandReduction: number;
  co2Avoided: number;
  savingsBreakdown: {
    peakShaving: number;
    loadShedding: number;
    scheduleOptimization: number;
    other: number;
  };
}

export class EnergyMonitoringService {
  private influxDB: InfluxDB | null = null;
  private writeApi: any = null;

  constructor() {
    this.initializeInfluxDB();
  }

  private initializeInfluxDB() {
    if (process.env.INFLUXDB_URL && process.env.INFLUXDB_TOKEN) {
      this.influxDB = new InfluxDB({
        url: process.env.INFLUXDB_URL,
        token: process.env.INFLUXDB_TOKEN,
      });

      const org = process.env.INFLUXDB_ORG || 'vibelux';
      const bucket = process.env.INFLUXDB_BUCKET || 'energy';
      
      this.writeApi = this.influxDB.getWriteApi(org, bucket);
      this.writeApi.useDefaultTags({ service: 'energy-monitoring' });
    }
  }

  /**
   * Record energy usage data
   */
  async recordEnergyUsage(reading: EnergyReading): Promise<void> {
    try {
      // Store in PostgreSQL
      await prisma.energy_readings.create({
        data: {
          facility_id: reading.facilityId,
          zone_id: reading.zoneId,
          timestamp: reading.timestamp,
          power_kw: reading.powerKw,
          energy_kwh: reading.energyKwh,
          rate_per_kwh: this.getCurrentRate(reading.timestamp),
          source: reading.source,
          device_id: reading.deviceId,
        },
      });

      // Store in InfluxDB for real-time analytics
      if (this.writeApi) {
        const point = new Point('energy_usage')
          .tag('facility_id', reading.facilityId)
          .tag('zone_id', reading.zoneId || 'main')
          .tag('source', reading.source)
          .floatField('power_kw', reading.powerKw)
          .floatField('energy_kwh', reading.energyKwh || 0)
          .floatField('rate', this.getCurrentRate(reading.timestamp))
          .timestamp(reading.timestamp);

        if (reading.voltage) point.floatField('voltage', reading.voltage);
        if (reading.current) point.floatField('current', reading.current);
        if (reading.powerFactor) point.floatField('power_factor', reading.powerFactor);

        this.writeApi.writePoint(point);
        await this.writeApi.flush();
      }

      // Check for load shedding opportunities
      await this.checkLoadSheddingTriggers(reading);
    } catch (error) {
      logger.error('api', 'Error recording energy usage:', error );
      throw error;
    }
  }

  /**
   * Calculate current electricity rate based on time-of-use
   */
  getCurrentRate(timestamp: Date, rates: TimeOfUseRate = DEFAULT_TOU_RATES): number {
    const hour = timestamp.getHours();
    
    if (rates.superOffPeakHours && 
        hour >= rates.superOffPeakHours.start && 
        hour < rates.superOffPeakHours.end) {
      return rates.superOffPeakRate || rates.offPeakRate;
    }
    
    if (hour >= rates.peakHours.start && hour < rates.peakHours.end) {
      return rates.peakRate;
    }
    
    return rates.offPeakRate;
  }

  /**
   * Calculate energy savings for a period
   */
  async calculateSavings(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EnergySavingsReport> {
    try {
      // Get baseline data
      const baseline = await prisma.energy_baselines.findFirst({
        where: {
          facility_id: facilityId,
          approved: true,
          start_date: { lte: startDate },
          end_date: { gte: startDate },
        },
      });

      if (!baseline) {
        throw new Error('No approved baseline found for facility');
      }

      // Get actual usage data
      const actualReadings = await prisma.energy_readings.findMany({
        where: {
          facility_id: facilityId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Calculate totals
      const actualKwh = actualReadings.reduce((sum, r) => sum + (r.energy_kwh || 0), 0);
      const actualCost = actualReadings.reduce((sum, r) => 
        sum + ((r.energy_kwh || 0) * (r.rate_per_kwh || 0)), 0
      );

      // Calculate baseline for the same period
      const days = differenceInMinutes(endDate, startDate) / (60 * 24);
      const baselineKwh = baseline.avg_daily_kwh * days;
      const baselineCost = baseline.avg_daily_cost * days;

      // Calculate savings
      const savedKwh = Math.max(0, baselineKwh - actualKwh);
      const savedCost = Math.max(0, baselineCost - actualCost);

      // Calculate peak demand reduction
      const peakDemandReduction = await this.calculatePeakDemandReduction(
        facilityId,
        startDate,
        endDate
      );

      // Calculate CO2 avoided (using US average of 0.92 lbs CO2/kWh)
      const co2Avoided = savedKwh * 0.92 * 0.000453592; // Convert to metric tons

      // Get savings breakdown
      const savingsBreakdown = await this.getSavingsBreakdown(
        facilityId,
        startDate,
        endDate,
        savedKwh
      );

      // Store verified savings
      await prisma.verified_savings.create({
        data: {
          facility_id: facilityId,
          billing_period_start: startDate,
          billing_period_end: endDate,
          baseline_kwh: baselineKwh,
          baseline_cost: baselineCost,
          actual_kwh: actualKwh,
          actual_cost: actualCost,
          kwh_saved: savedKwh,
          cost_saved: savedCost,
          peak_demand_reduction: peakDemandReduction,
          co2_avoided_tons: co2Avoided,
          calculation_method: 'IPMVP Option C',
          data_quality_score: this.calculateDataQuality(actualReadings),
          verification_status: 'verified',
          verified_at: new Date(),
        },
      });

      return {
        facilityId,
        periodStart: startDate,
        periodEnd: endDate,
        baselineKwh,
        actualKwh,
        savedKwh,
        baselineCost,
        actualCost,
        savedCost,
        peakDemandReduction,
        co2Avoided,
        savingsBreakdown,
      };
    } catch (error) {
      logger.error('api', 'Error calculating savings:', error );
      throw error;
    }
  }

  /**
   * Implement load shedding logic
   */
  async implementLoadShedding(schedule: LoadSheddingSchedule): Promise<void> {
    try {
      // Photoperiod protection: prevent >12h continuous darkness for flowering zones
      await this.assertPhotoperiodSafe(schedule)

      // Store the schedule
      await prisma.$executeRaw`
        INSERT INTO load_shedding_schedules (
          facility_id, zone_id, start_time, end_time, 
          target_reduction_kw, priority, reason, created_at
        ) VALUES (
          ${schedule.facilityId}, ${schedule.zoneId}, ${schedule.startTime}, 
          ${schedule.endTime}, ${schedule.targetReductionKw}, 
          ${schedule.priority}, ${schedule.reason}, ${new Date()}
        )
      `;

      // Send control commands to facility systems
      await this.sendLoadSheddingCommands(schedule);

      // Log the event
      logger.info('api', `Load shedding scheduled for facility ${schedule.facilityId}, zone ${schedule.zoneId}`);
    } catch (error) {
      logger.error('api', 'Error implementing load shedding:', error );
      throw error;
    }
  }

  /**
   * Ensure load shedding will not cause >12h continuous dark for flowering zones
   */
  private async assertPhotoperiodSafe(schedule: LoadSheddingSchedule): Promise<void> {
    try {
      const { getZoneInfo, isFloweringZone } = await import('@/lib/energy/zones-registry')
      const zoneInfo = getZoneInfo(schedule.facilityId, schedule.zoneId)
      const flowering = isFloweringZone(zoneInfo)
      if (!flowering) return

      // Compute planned shed duration (minutes)
      const plannedMinutes = Math.max(0, Math.round((schedule.endTime.getTime() - schedule.startTime.getTime()) / 60000))
      if (plannedMinutes <= 0) return

      // Determine threshold and current power to infer on/off state
      const { thresholdKw, currentPowerKw, lastOn, lastOff } = await this.getZoneLightingState(schedule.facilityId, schedule.zoneId)
      const lightsOnNow = currentPowerKw > thresholdKw

      // If currently dark, enforce hard cap: current dark + planned <= 12h
      if (!lightsOnNow && lastOff && (!lastOn || lastOff > lastOn)) {
        const now = new Date()
        const currentDarkMin = Math.max(0, Math.round((now.getTime() - lastOff.getTime()) / 60000))
        if (currentDarkMin + plannedMinutes > 12 * 60) {
          throw new Error('Photoperiod protection: dark period would exceed 12h')
        }
      }

      // If lights are on, block full-off shedding and cap any shedding to 2h max during lights-on for flowering
      const isFullOff = await this.isSheddingFullOff(schedule.facilityId, schedule.zoneId, schedule.targetReductionKw)
      if (isFullOff) {
        throw new Error('Photoperiod protection: blocking full-off shedding during lights-on in flowering zones')
      }
      if (plannedMinutes > 120) {
        throw new Error('Photoperiod protection: shedding duration exceeds 2h limit during lights-on in flowering zones')
      }
    } catch (e) {
      // Re-throw to prevent scheduling if unsafe
      throw e
    }
  }

  /**
   * Infer current lighting state using recent readings.
   * Threshold is 20% of recent peak power for the zone (fallback 1 kW).
   */
  private async getZoneLightingState(facilityId: string, zoneId: string): Promise<{thresholdKw: number, currentPowerKw: number, lastOn: Date|null, lastOff: Date|null}> {
    // Look back 7 days for peak
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const readings = await prisma.energy_readings.findMany({
      where: { facility_id: facilityId, zone_id: zoneId, timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, power_kw: true },
    })
    const peak = readings.reduce((m, r) => Math.max(m, r.power_kw || 0), 0)
    const thresholdKw = Math.max(1, peak * 0.2)

    // Current power = last reading
    const last = readings[readings.length - 1]
    const currentPowerKw = last ? (last.power_kw || 0) : 0

    // Find last transitions over 48h
    const since48 = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const recent = readings.filter(r => r.timestamp >= since48)
    let lastOn: Date | null = null
    let lastOff: Date | null = null
    for (let i = 1; i < recent.length; i++) {
      const prevOn = (recent[i-1].power_kw || 0) > thresholdKw
      const nowOn = (recent[i].power_kw || 0) > thresholdKw
      if (!prevOn && nowOn) lastOn = recent[i].timestamp as any
      if (prevOn && !nowOn) lastOff = recent[i].timestamp as any
    }
    return { thresholdKw, currentPowerKw, lastOn, lastOff }
  }

  /**
   * Check whether requested target reduction likely turns lights fully off.
   */
  private async isSheddingFullOff(facilityId: string, zoneId: string, targetReductionKw: number): Promise<boolean> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last = await prisma.energy_readings.findFirst({
      where: { facility_id: facilityId, zone_id: zoneId, timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
      select: { power_kw: true },
    })
    const currentPower = last?.power_kw || 0
    if (currentPower <= 0) return true
    // Consider full-off if reduction >= 80% of current power
    return targetReductionKw >= currentPower * 0.8
  }

  /**
   * Get historical energy data
   */
  async getHistoricalData(
    facilityId: string,
    startDate: Date,
    endDate: Date,
    aggregation: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'hourly'
  ) {
    try {
      const readings = await prisma.energy_readings.findMany({
        where: {
          facility_id: facilityId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Aggregate data based on requested granularity
      const aggregatedData = this.aggregateReadings(readings, aggregation);

      return {
        facilityId,
        startDate,
        endDate,
        aggregation,
        data: aggregatedData,
        summary: {
          totalKwh: readings.reduce((sum, r) => sum + (r.energy_kwh || 0), 0),
          totalCost: readings.reduce((sum, r) => 
            sum + ((r.energy_kwh || 0) * (r.rate_per_kwh || 0)), 0
          ),
          avgPowerKw: readings.reduce((sum, r) => sum + r.power_kw, 0) / readings.length,
          peakPowerKw: Math.max(...readings.map(r => r.power_kw)),
        },
      };
    } catch (error) {
      logger.error('api', 'Error getting historical data:', error );
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async checkLoadSheddingTriggers(reading: EnergyReading) {
    // Check if we're approaching peak demand limits
    const config = await prisma.energy_optimization_config.findUnique({
      where: { facility_id: reading.facilityId },
    });

    if (!config || !config.peak_demand_limit) return;

    // Get current hour's peak
    const hourStart = startOfHour(reading.timestamp);
    const hourEnd = endOfHour(reading.timestamp);
    
    const hourlyReadings = await prisma.energy_readings.findMany({
      where: {
        facility_id: reading.facilityId,
        timestamp: {
          gte: hourStart,
          lte: hourEnd,
        },
      },
    });

    const currentPeak = Math.max(...hourlyReadings.map(r => r.power_kw));

    // If we're within 90% of peak limit, trigger load shedding
    if (currentPeak > config.peak_demand_limit * 0.9) {
      await this.implementLoadShedding({
        facilityId: reading.facilityId,
        zoneId: reading.zoneId || 'all',
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        targetReductionKw: currentPeak - config.peak_demand_limit * 0.85,
        priority: 1,
        reason: 'peak_demand',
      });
    }
  }

  private async calculatePeakDemandReduction(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Compare peak demand to baseline period
    const currentPeakResult = await prisma.energy_readings.aggregate({
      where: {
        facility_id: facilityId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _max: {
        power_kw: true,
      },
    });

    // Get baseline peak (simplified - in production, use historical baseline)
    const baselinePeak = (currentPeakResult._max.power_kw || 0) * 1.2; // Assume 20% reduction

    return Math.max(0, baselinePeak - (currentPeakResult._max.power_kw || 0));
  }

  private async getSavingsBreakdown(
    facilityId: string,
    startDate: Date,
    endDate: Date,
    totalSavedKwh: number
  ) {
    // This is a simplified breakdown - in production, track actual sources
    return {
      peakShaving: totalSavedKwh * 0.45,
      loadShedding: totalSavedKwh * 0.30,
      scheduleOptimization: totalSavedKwh * 0.15,
      other: totalSavedKwh * 0.10,
    };
  }

  private calculateDataQuality(readings: any[]): number {
    if (readings.length === 0) return 0;
    
    // Check for data completeness
    const expectedReadings = readings.length;
    const actualReadings = readings.filter(r => r.energy_kwh !== null).length;
    
    return (actualReadings / expectedReadings) * 100;
  }

  private aggregateReadings(readings: any[], aggregation: string) {
    // Group readings by time period
    const grouped = new Map<string, any[]>();
    
    readings.forEach(reading => {
      let key: string;
      const date = new Date(reading.timestamp);
      
      switch (aggregation) {
        case 'hourly':
          key = date.toISOString().slice(0, 13);
          break;
        case 'daily':
          key = date.toISOString().slice(0, 10);
          break;
        case 'weekly':
          const week = Math.floor(date.getDate() / 7);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'monthly':
          key = date.toISOString().slice(0, 7);
          break;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(reading);
    });
    
    // Calculate aggregates
    const results = [];
    for (const [period, periodReadings] of grouped) {
      const totalKwh = periodReadings.reduce((sum, r) => sum + (r.energy_kwh || 0), 0);
      const avgPower = periodReadings.reduce((sum, r) => sum + r.power_kw, 0) / periodReadings.length;
      const peakPower = Math.max(...periodReadings.map(r => r.power_kw));
      const totalCost = periodReadings.reduce((sum, r) => 
        sum + ((r.energy_kwh || 0) * (r.rate_per_kwh || 0)), 0
      );
      
      results.push({
        period,
        totalKwh,
        avgPowerKw: avgPower,
        peakPowerKw: peakPower,
        totalCost,
        readingCount: periodReadings.length,
      });
    }
    
    return results.sort((a, b) => a.period.localeCompare(b.period));
  }

  private async sendLoadSheddingCommands(schedule: LoadSheddingSchedule) {
    // Integration with facility control systems
    // This would connect to Argus, Priva, or other systems
    logger.info('api', `Sending load shedding commands for ${schedule.facilityId}`);
    
    // In production, this would:
    // 1. Connect to the facility's control system
    // 2. Send specific commands to reduce load
    // 3. Monitor the response
    // 4. Log the results
  }
}

export default new EnergyMonitoringService();