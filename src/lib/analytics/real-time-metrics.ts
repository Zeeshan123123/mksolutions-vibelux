/**
 * Real-time Analytics Metrics Service
 * Connects facility data, harvest records, and energy consumption to analytics dashboard
 */

import { prisma } from '@/lib/prisma';
import AccountingIntegration from '@/lib/integrations/accounting-integration.stub';
const AccountingIntegrationService = AccountingIntegration;
import { logger } from '@/lib/logging/production-logger';

export interface FacilityMetrics {
  totalRevenue: number;
  energyEfficiency: number; // g/kWh
  averageYield: number; // kg/m²
  spaceUtilization: number; // percentage
  period: {
    start: Date;
    end: Date;
  };
}

export interface MetricDetails {
  revenue: {
    total: number;
    byProduct: Array<{ product: string; amount: number }>;
    trend: number; // percentage change
  };
  energy: {
    efficiency: number;
    totalConsumption: number; // kWh
    totalYield: number; // grams
    costPerKwh: number;
    trend: number;
  };
  yield: {
    average: number;
    byZone: Array<{ zone: string; yield: number }>;
    totalHarvests: number;
    trend: number;
  };
  space: {
    utilization: number;
    totalArea: number; // sq ft
    cultivationArea: number; // sq ft
    byZone: Array<{ zone: string; area: number; utilization: number }>;
  };
}

export class RealTimeMetricsService {
  /**
   * Calculate real-time metrics for a facility
   */
  async calculateFacilityMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FacilityMetrics> {
    try {
      // Get facility details with comprehensive data
      const facility = await prisma.facility.findUnique({
        where: { id: facilityId },
        include: {
          zones: {
            include: {
              sensorReadings: {
                where: {
                  timestamp: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              },
              harvestBatches: {
                where: {
                  harvestDate: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          },
          expenses: {
            where: {
              date: {
                gte: startDate,
                lte: endDate
              }
            }
          },
          harvestBatches: {
            where: {
              harvestDate: {
                gte: startDate,
                lte: endDate
              }
            },
            include: {
              sales: true
            }
          }
        }
      });

      if (!facility) {
        throw new Error('Facility not found');
      }

      // Calculate metrics with proper error handling
      const [revenue, energyEfficiency, averageYield, spaceUtilization] = await Promise.allSettled([
        this.calculateRevenue(facilityId, startDate, endDate),
        this.calculateEnergyEfficiency(facilityId, startDate, endDate),
        this.calculateAverageYield(facilityId, startDate, endDate),
        Promise.resolve(this.calculateSpaceUtilization(facility))
      ]);

      return {
        totalRevenue: revenue.status === 'fulfilled' ? revenue.value : 0,
        energyEfficiency: energyEfficiency.status === 'fulfilled' ? energyEfficiency.value : 0,
        averageYield: averageYield.status === 'fulfilled' ? averageYield.value : 0,
        spaceUtilization: spaceUtilization.status === 'fulfilled' ? spaceUtilization.value : 0,
        period: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      logger.error('api', 'Error calculating facility metrics:', error );
      // Return fallback metrics to prevent complete failure
      return {
        totalRevenue: 0,
        energyEfficiency: 0,
        averageYield: 0,
        spaceUtilization: 0,
        period: {
          start: startDate,
          end: endDate
        }
      };
    }
  }

  /**
   * Calculate total revenue from all sources
   */
  private async calculateRevenue(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get harvest sales revenue
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        sales: true
      }
    });

    const harvestRevenue = harvests.reduce((sum, harvest) => {
      const harvestRevenue = harvest.sales?.reduce((saleSum, sale) => {
        return saleSum + (sale.quantity * sale.pricePerUnit);
      }, 0) || 0;
      return sum + harvestRevenue;
    }, 0);

    // Get accounting system revenue if integrated
    let accountingRevenue = 0;
    
    const integrationConfig = await prisma.integrationConfig.findFirst({
      where: {
        facilityId,
        type: 'ACCOUNTING',
        enabled: true
      }
    });

    if (integrationConfig && integrationConfig.metadata) {
      try {
        const accountingService = new AccountingIntegrationService({
          provider: integrationConfig.config.provider,
          accessToken: integrationConfig.metadata.accessToken,
          refreshToken: integrationConfig.metadata.refreshToken,
          companyId: integrationConfig.metadata.companyId,
          environment: integrationConfig.config.environment || 'production'
        });

        const revenues = await accountingService.fetchRevenueData(startDate, endDate);
        accountingRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
      } catch (error) {
        logger.error('api', 'Failed to fetch accounting revenue:', error );
      }
    }

    // Get direct sales records
    const directSales = await prisma.sale.findMany({
      where: {
        facilityId,
        saleDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const directRevenue = directSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    // Return the maximum to avoid double counting
    // In production, you'd want more sophisticated deduplication
    return Math.max(harvestRevenue + directRevenue, accountingRevenue);
  }

  /**
   * Calculate energy efficiency (grams yield per kWh)
   */
  private async calculateEnergyEfficiency(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get total energy consumption
    const energyReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'POWER',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Calculate total kWh consumed from sensor readings
    let totalKwh = 0;
    
    if (energyReadings.length > 1) {
      for (let i = 1; i < energyReadings.length; i++) {
        const current = energyReadings[i];
        const previous = energyReadings[i - 1];
        const timeDiffHours = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60);
        
        // Assume power readings are in kW, integrate over time to get kWh
        const avgPower = (current.value + previous.value) / 2;
        totalKwh += avgPower * timeDiffHours;
      }
    }

    // Get total yield from harvests in grams
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    const totalYieldKg = harvests.reduce((sum, harvest) => sum + (harvest.actualYield || 0), 0);
    const totalYieldGrams = totalYieldKg * 1000;

    // Calculate grams per kWh
    return totalKwh > 0 ? totalYieldGrams / totalKwh : 0;
  }

  /**
   * Calculate average yield per square meter
   */
  private async calculateAverageYield(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        zones: true,
        harvestBatches: {
          where: {
            harvestDate: {
              gte: startDate,
              lte: endDate
            },
            status: 'COMPLETED'
          }
        }
      }
    });

    if (!facility) return 0;

    const totalYieldKg = facility.harvestBatches.reduce((sum, harvest) => sum + (harvest.actualYield || 0), 0);
    const cultivationAreaSqM = (facility.cultivationSquareFeet || 0) * 0.092903; // Convert sq ft to sq m

    return cultivationAreaSqM > 0 ? totalYieldKg / cultivationAreaSqM : 0;
  }

  /**
   * Calculate space utilization percentage
   */
  private calculateSpaceUtilization(facility: any): number {
    const totalArea = facility.totalSquareFeet || 0;
    const cultivationArea = facility.cultivationSquareFeet || 0;
    
    if (totalArea === 0) return 0;
    
    // Calculate utilization based on active zones
    const activeZones = facility.zones?.filter((zone: any) => zone.status === 'ACTIVE') || [];
    const activeArea = activeZones.reduce((sum: number, zone: any) => sum + (zone.squareFeet || 0), 0);
    
    return Math.min(100, (activeArea / totalArea) * 100);
  }

  /**
   * Get detailed metrics breakdown for comprehensive analysis
   */
  async getDetailedMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MetricDetails> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        zones: true,
        harvestBatches: {
          where: {
            harvestDate: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            sales: true
          }
        },
        expenses: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    // Revenue analysis
    const revenueByProduct = facility.harvestBatches.reduce((acc, harvest) => {
      const productName = harvest.strain || 'Unknown';
      const revenue = harvest.sales?.reduce((sum, sale) => sum + sale.totalPrice, 0) || 0;
      acc[productName] = (acc[productName] || 0) + revenue;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = Object.values(revenueByProduct).reduce((sum, val) => sum + val, 0);

    // Energy analysis  
    const energyReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'POWER',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalEnergyConsumption = energyReadings.reduce((sum, reading) => sum + reading.value, 0);
    const totalYieldGrams = facility.harvestBatches.reduce((sum, harvest) => sum + (harvest.actualYield || 0) * 1000, 0);
    
    // Yield analysis by zone
    const yieldByZone = facility.zones.map(zone => ({
      zone: zone.name || zone.id,
      yield: facility.harvestBatches
        .filter(harvest => harvest.zoneId === zone.id)
        .reduce((sum, harvest) => sum + (harvest.actualYield || 0), 0)
    }));

    return {
      revenue: {
        total: totalRevenue,
        byProduct: Object.entries(revenueByProduct).map(([product, amount]) => ({ product, amount })),
        trend: 0 // Calculate trend vs previous period
      },
      energy: {
        efficiency: totalEnergyConsumption > 0 ? totalYieldGrams / totalEnergyConsumption : 0,
        totalConsumption: totalEnergyConsumption,
        totalYield: totalYieldGrams,
        costPerKwh: 0.12, // Could be configured per facility
        trend: 0
      },
      yield: {
        average: yieldByZone.reduce((sum, zone) => sum + zone.yield, 0) / yieldByZone.length || 0,
        byZone: yieldByZone,
        totalHarvests: facility.harvestBatches.length,
        trend: 0
      },
      space: {
        utilization: this.calculateSpaceUtilization(facility),
        totalArea: facility.totalSquareFeet || 0,
        cultivationArea: facility.cultivationSquareFeet || 0,
        byZone: facility.zones.map(zone => ({
          zone: zone.name || zone.id,
          area: zone.squareFeet || 0,
          utilization: zone.status === 'ACTIVE' ? 100 : 0
        }))
      }
    };
  }
}

// Export singleton instance
export const metricsService = new RealTimeMetricsService();

// Export the service class and instance with different names for compatibility
export const realTimeMetrics = metricsService;
export default RealTimeMetricsService;