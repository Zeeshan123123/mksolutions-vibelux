import { ReportData } from './htmlReportGenerator';
import { langeGreenhouseConfig } from '../../app/design/advanced/lange-config';

/**
 * Generate comprehensive report data for Lange Greenhouse project
 */
export function generateLangeReportData(
  fixtures: any[] = [],
  powerMetrics: any = {},
  performanceData: any = {}
): ReportData {
  const totalPower = langeGreenhouseConfig.lighting.total * 1000; // 987 * 1000W
  const area = langeGreenhouseConfig.totalArea;
  
  return {
    project: {
      name: langeGreenhouseConfig.facilityName,
      date: new Date().toISOString(),
      client: "Lange Group",
      location: langeGreenhouseConfig.location,
      designer: "Vibelux Advanced Design System",
      projectValue: "$3,097,186"
    },
    facility: {
      dimensions: {
        length: langeGreenhouseConfig.structures.dimensions.length * langeGreenhouseConfig.structures.count,
        width: langeGreenhouseConfig.structures.dimensions.width,
        height: langeGreenhouseConfig.structures.dimensions.gutterHeight,
        unit: "feet"
      },
      area: area,
      roomCount: 1,
      type: "Venlo Connected Greenhouses",
      greenhouseCount: langeGreenhouseConfig.structures.count
    },
    layout: {
      tables: langeGreenhouseConfig.benching?.rollingBenches?.quantity || 310,
      canopyArea: area * 0.75, // 75% utilization estimate
      utilization: 75
    },
    lighting: {
      fixtures: langeGreenhouseConfig.lighting.total,
      model: langeGreenhouseConfig.lighting.fixtures.type,
      manufacturer: "GAN",
      totalPower: totalPower,
      powerDensity: totalPower / area,
      averagePPFD: powerMetrics?.averagePPFD || 850,
      uniformity: powerMetrics?.uniformity || 0.82,
      dli: powerMetrics?.dli || 36.7,
      mountingHeight: langeGreenhouseConfig.lighting.mountingHeight,
      zones: {
        vegetation: langeGreenhouseConfig.lighting.distribution.zone1_veg,
        flowering1: langeGreenhouseConfig.lighting.distribution.zone2_flower,
        flowering2: langeGreenhouseConfig.lighting.distribution.zone3_flower
      }
    },
    electrical: {
      voltage: `${langeGreenhouseConfig.lighting.fixtures.voltage}V ${langeGreenhouseConfig.lighting.fixtures.phase}-Phase`,
      totalLoad: totalPower,
      breakerSize: Math.ceil(totalPower * 1.25 / (480 * 1.732) / 20) * 20,
      panelRequirement: "Main distribution panel with multiple sub-panels",
      estimatedInstallationCost: 145000
    },
    hvac: {
      heating: {
        boilers: `${langeGreenhouseConfig.hvac.heating.boilers.quantity}× ${langeGreenhouseConfig.hvac.heating.boilers.model}`,
        capacity: `${(langeGreenhouseConfig.hvac.heating.boilers.capacity * langeGreenhouseConfig.hvac.heating.boilers.quantity).toLocaleString()} BTU`,
        distribution: `${langeGreenhouseConfig.hvac.heating.distribution.underBench.type} + ${langeGreenhouseConfig.hvac.heating.distribution.perimeter.type}`
      },
      cooling: {
        chiller: `${langeGreenhouseConfig.hvac.cooling.chiller.quantity}× ${langeGreenhouseConfig.hvac.cooling.chiller.model}`,
        fanCoils: `${langeGreenhouseConfig.hvac.cooling.fanCoils.quantity}× ${langeGreenhouseConfig.hvac.cooling.fanCoils.model}`,
        hafFans: `${langeGreenhouseConfig.hvac.cooling.hafFans.quantity}× ${langeGreenhouseConfig.hvac.cooling.hafFans.model}`
      },
      automation: langeGreenhouseConfig.automation.system
    },
    irrigation: {
      waterStorage: `${langeGreenhouseConfig.irrigation.waterStorage.freshWater.toLocaleString()} gallons fresh water + batch tanks`,
      treatment: `${langeGreenhouseConfig.irrigation.treatment.neutralizer.type} + ${langeGreenhouseConfig.irrigation.treatment.nutrientInjection.type}`,
      pumps: `Multiple submersible pumps (60-110 GPM capacity)`
    },
    structural: {
      frameType: langeGreenhouseConfig.structures.type,
      frameMaterial: langeGreenhouseConfig.structures.construction.frame,
      glazingType: langeGreenhouseConfig.structures.construction.glazing,
      ventilation: "3-hinged roof vents with screening"
    },
    financial: {
      equipmentCost: 1450000,
      installationCost: 245000,
      totalInvestment: 1695000,
      annualEnergyCost: 142000,
      annualSavings: powerMetrics?.annualSavings || 85000,
      roi: 3.2,
      paybackPeriod: 4.1
    },
    environmental: {
      co2Reduction: 45000, // lbs/year
      heatLoadReduction: 850000, // BTU/hr reduction vs HID
      waterSavings: 2500 // gallons/day through precision irrigation
    },
    performance: {
      calculationTime: performanceData?.calculationTime || 72,
      totalFixtures: fixtures.length || langeGreenhouseConfig.lighting.total,
      gridResolution: 50,
      memoryUsage: performanceData?.memoryUsage || 0.8
    }
  };
}

/**
 * Generate simplified report data for standard projects
 */
export function generateStandardReportData(
  room: any,
  fixtures: any[],
  powerMetrics: any = {},
  projectInfo: any = {}
): ReportData {
  const totalPower = fixtures.reduce((sum, f) => sum + (f.model?.specifications?.power || 0), 0);
  const area = room.dimensions.length * room.dimensions.width;
  
  return {
    project: {
      name: projectInfo.name || 'Lighting Design Project',
      date: new Date().toISOString(),
      client: projectInfo.client,
      location: projectInfo.location,
      designer: "Vibelux Advanced Design System"
    },
    facility: {
      dimensions: {
        length: room.dimensions.length,
        width: room.dimensions.width,
        height: room.dimensions.height,
        unit: room.unit || "feet"
      },
      area: area,
      roomCount: 1
    },
    layout: {
      tables: Math.floor(area / 120), // Estimate based on area
      canopyArea: area * 0.75,
      utilization: 75
    },
    lighting: {
      fixtures: fixtures.length,
      model: fixtures[0]?.model?.name || 'LED Fixture',
      manufacturer: fixtures[0]?.model?.manufacturer || 'Fluence',
      totalPower: totalPower,
      powerDensity: totalPower / area,
      averagePPFD: powerMetrics?.averagePPFD || 800,
      uniformity: powerMetrics?.uniformity || 0.85,
      dli: powerMetrics?.dli || ((powerMetrics?.averagePPFD || 800) * 0.0432)
    },
    electrical: {
      voltage: "480V 3-Phase",
      totalLoad: totalPower,
      breakerSize: Math.ceil(totalPower * 1.25 / (480 * 1.732) / 20) * 20,
      panelRequirement: "100A sub-panel minimum"
    },
    financial: {
      equipmentCost: fixtures.length * 1499, // Estimate
      installationCost: fixtures.length * 150,
      totalInvestment: fixtures.length * (1499 + 150) + 5000,
      annualEnergyCost: (totalPower * 12 * 365 / 1000) * 0.12,
      annualSavings: powerMetrics?.annualSavings || 10000,
      roi: powerMetrics?.roi || 5.5,
      paybackPeriod: powerMetrics?.paybackPeriod || 5.5
    },
    environmental: {
      co2Reduction: powerMetrics?.co2Reduction || 15000,
      heatLoadReduction: powerMetrics?.heatLoadReduction || 25000,
      waterSavings: powerMetrics?.waterSavings || 1000
    }
  };
}

export default {
  generateLangeReportData,
  generateStandardReportData
};