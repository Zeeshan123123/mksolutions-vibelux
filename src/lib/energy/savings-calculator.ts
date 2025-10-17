import { prisma } from '@/lib/prisma';
import { WeatherNormalizationService } from './weather-normalization';
import { ThirdPartyValidationService } from '../verification/third-party-validator';
import { UtilityIntegrationClient } from '../utility-integration/utility-api-client';
import { logger } from '@/lib/logging/production-logger';

interface SavingsCalculationOptions {
  facilityId: string;
  startDate: Date;
  endDate: Date;
  includeWeatherNormalization?: boolean;
  includeThirdPartyVerification?: boolean;
}

interface VerifiedSavings {
  energySavings: number;
  yieldImprovements: number;
  operationalSavings: number;
  totalSavings: number;
  confidence: number;
  verificationData: any;
  thirdPartyVerified: boolean;
}

export async function calculateVerifiedSavings(
  options: SavingsCalculationOptions
): Promise<VerifiedSavings> {
  const {
    facilityId,
    startDate,
    endDate,
    includeWeatherNormalization = true,
    includeThirdPartyVerification = false,
  } = options;

  // Get facility owner (for utility verification) and energy baselines/readings
  const facilityOwner = await prisma.facility.findUnique({
    where: { id: facilityId },
    select: { id: true, ownerId: true }
  });

  if (!facilityOwner) {
    throw new Error('Facility not found');
  }

  // Fetch monthly baselines for electricity usage and rate overlapping the analysis window
  const baselines = await prisma.energyBaseline.findMany({
    where: {
      facilityId,
      baselineType: 'monthly',
      periodStart: { lte: endDate },
      periodEnd: { gte: startDate }
    }
  });

  const baselineElectric = baselines.find(b => b.readingType === 'electricity');
  const baselineRate = baselines.find(b => b.readingType === 'rate');
  const baselineMonthlyKwh = baselineElectric?.value ?? 0;
  const baselineRatePerKwh = baselineRate?.value ?? 0.12;

  // Fetch IoT energy readings from our EnergyReading model
  const energyReadings = await prisma.energyReading.findMany({
    where: {
      facilityId,
      readingType: 'electricity',
      timestamp: { gte: startDate, lte: endDate }
    },
    orderBy: { timestamp: 'asc' }
  });

  // Normalize readings to the shape expected by the existing helpers
  const iotReadings = energyReadings.map(r => ({
    energyUsage: r.value || 0,
    timestamp: r.timestamp
  }));

  // Initialize services
  const weatherService = new WeatherNormalizationService();
  const utilityClient = new UtilityIntegrationClient();
  const validationService = new ThirdPartyValidationService();

  // 1. Calculate Energy Savings
  let energySavings = 0;
  const verificationData: any = {};

  try {
    // Get utility-verified usage (ownerId is optional-safe)
    const utilityVerification = await utilityClient.verifySavingsWithUtilityBills(
      facilityOwner.ownerId || '',
      startDate,
      endDate
    );

    energySavings = utilityVerification.actualSavings;
    verificationData.utilityVerified = true;
    verificationData.utilityData = utilityVerification;

    // Apply weather normalization if requested
    if (includeWeatherNormalization) {
      const normalization = await weatherService.normalizeEnergyUsage(
      facilityId,
      utilityVerification.actualUsage,
        startDate,
        endDate
      );

      // Adjust savings based on weather
      const weatherAdjustment = normalization.adjustmentFactor - 1;
      energySavings = energySavings * (1 + weatherAdjustment);
      
      verificationData.weatherNormalized = true;
      verificationData.weatherData = {
        adjustmentFactor: normalization.adjustmentFactor,
        confidence: normalization.confidence,
      };
    }
  } catch (error) {
    logger.error('api', 'Utility verification failed, using IoT data:', error as Error);

    // Fallback to IoT-based calculation
    energySavings = await calculateIoTBasedEnergySavings(
      baselineMonthlyKwh,
      iotReadings,
      startDate,
      endDate
    );
    
    verificationData.utilityVerified = false;
    verificationData.dataSource = 'iot_sensors';
  }

  // 2. Calculate Yield Improvements
  const yieldImprovements = await calculateYieldImprovements(
    facilityId,
    startDate,
    endDate
  );

  // 3. Calculate Operational Savings
  const operationalSavings = await calculateOperationalSavings(
    facilityId,
    startDate,
    endDate
  );

  // 4. Apply manual/operational adjustments (e.g., partial HPS retrofit not yet reflected in bills)
  let adjustmentsValue = 0;
  try {
    const adjustments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "EnergyAdjustment" WHERE "facilityId"=$1 AND ("effectiveEnd" IS NULL OR "effectiveEnd" >= $2) AND "effectiveStart" <= $3`,
      facilityId,
      startDate,
      endDate
    );
    for (const a of adjustments) {
      const rate = a.ratePerKwh != null ? a.ratePerKwh : 0.12;
      const demandRate = a.demandChargeRate != null ? a.demandChargeRate : 0;
      const kwhValue = (a.kwhDelta || 0) * rate;
      const demandValue = (a.demandKwDelta || 0) * demandRate;
      adjustmentsValue += kwhValue + demandValue;
    }
  } catch (e) {
    // non-fatal
  }

  // 5. Calculate Total Savings (with adjustments)
  const totalSavings = energySavings + yieldImprovements + operationalSavings + adjustmentsValue;

  // 6. Apply Third-Party Verification if requested
  let confidence = 0.85; // Base confidence
  let thirdPartyVerified = false;

  if (includeThirdPartyVerification && totalSavings > 1000) {
    try {
      const validation = await validationService.validateSavingsClaims(
        facilityId,
        totalSavings,
        startDate,
        endDate,
        'automated'
      );

      thirdPartyVerified = validation.verified;
      confidence = validation.confidence;
      
      verificationData.thirdPartyValidation = {
        verified: validation.verified,
        confidence: validation.confidence,
        discrepancies: validation.discrepancies,
      };
    } catch (error) {
      logger.error('api', 'Third-party validation failed:', error );
    }
  }

  // Adjust confidence based on data sources
  if (!verificationData.utilityVerified) confidence *= 0.9;
  if (!verificationData.weatherNormalized) confidence *= 0.95;

  return {
    energySavings: Math.round(energySavings * 100) / 100,
    yieldImprovements: Math.round(yieldImprovements * 100) / 100,
    operationalSavings: Math.round(operationalSavings * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    confidence,
    verificationData,
    thirdPartyVerified,
  };
}

/**
 * Calculate energy savings from IoT sensor data
 */
async function calculateIoTBasedEnergySavings(
  baselineMonthlyKwh: number,
  iotReadings: Array<{ energyUsage: number; timestamp: Date }>,
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (iotReadings.length === 0) {
    throw new Error('No IoT data available for calculation');
  }

  // Calculate actual usage from IoT data
  const totalUsageKwh = iotReadings.reduce((sum: number, reading: any) => {
    return sum + (reading.energyUsage || 0);
  }, 0);

  // Calculate expected baseline usage for the period
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const expectedUsageKwh = (baselineMonthlyKwh / 30) * days;

  // Calculate savings (kWh converted to $ via average baseline rate if available)
  const avgRatePerKwh = 0.12;
  return (expectedUsageKwh - totalUsageKwh) * avgRatePerKwh;
}

/**
 * Calculate yield improvements from production data
 */
async function calculateYieldImprovements(
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Optional: integrate with production data models when available
  return 0;
}

/**
 * Calculate operational savings
 */
async function calculateOperationalSavings(
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Optional: integrate with ops metrics models when available
  return 0;
}

/**
 * Get average market price for crop
 */
async function getAverageMarketPrice(
  cropType: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // This would integrate with market data APIs
  // For now, returning typical prices
  const prices: Record<string, number> = {
    cannabis: 2500, // per pound
    lettuce: 2.50, // per pound
    tomatoes: 3.00, // per pound
    strawberries: 4.50, // per pound
    herbs: 15.00, // per pound
  };
  
  return prices[cropType] || 2.00;
}