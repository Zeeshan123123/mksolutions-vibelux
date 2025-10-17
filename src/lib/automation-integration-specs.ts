// Integration specifications for greenhouse automation equipment brands
// Defines connection protocols, API endpoints, and data mapping for each manufacturer

export interface IntegrationProtocol {
  name: string;
  version?: string;
  port?: number;
  authentication?: 'none' | 'basic' | 'oauth' | 'token' | 'certificate';
  dataFormat: 'json' | 'xml' | 'modbus' | 'bacnet' | 'binary';
  realTime: boolean;
  bidirectional: boolean; // read/write capability
}

export interface DataPoint {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'flow' | 'pressure' | 'status' | 'setpoint';
  unit?: string;
  range?: { min: number; max: number };
  readOnly: boolean;
  updateInterval?: number; // seconds
}

export interface EquipmentIntegrationSpec {
  manufacturer: string;
  equipmentId: string;
  model: string;
  category: string;
  protocols: IntegrationProtocol[];
  dataPoints: DataPoint[];
  capabilities: {
    monitoring: boolean;
    control: boolean;
    scheduling: boolean;
    alarming: boolean;
    trending: boolean;
  };
  integrationNotes: string[];
  requiresGateway: boolean;
  gatewayOptions?: string[];
  implementationComplexity: 'low' | 'medium' | 'high';
  estimatedSetupTime: string;
}

// Priva Integration Specifications
export const privaIntegrationSpecs: Record<string, EquipmentIntegrationSpec> = {
  'priva-connext': {
    manufacturer: 'Priva',
    equipmentId: 'priva-connext',
    model: 'Connext Greenhouse Computer',
    category: 'Environmental Controller',
    protocols: [
      {
        name: 'Building Connectivity API',
        version: '2.0',
        port: 443,
        authentication: 'oauth',
        dataFormat: 'json',
        realTime: true,
        bidirectional: true
      },
      {
        name: 'Modbus TCP',
        version: '1.0',
        port: 502,
        authentication: 'none',
        dataFormat: 'modbus',
        realTime: true,
        bidirectional: true
      }
    ],
    dataPoints: [
      { id: 'temp_inside', name: 'Inside Temperature', type: 'temperature', unit: '°C', range: { min: -10, max: 50 }, readOnly: false, updateInterval: 30 },
      { id: 'humidity_inside', name: 'Inside Humidity', type: 'humidity', unit: '%RH', range: { min: 0, max: 100 }, readOnly: false, updateInterval: 30 },
      { id: 'co2_level', name: 'CO2 Level', type: 'co2', unit: 'ppm', range: { min: 0, max: 2000 }, readOnly: false, updateInterval: 60 },
      { id: 'vent_position', name: 'Vent Position', type: 'status', unit: '%', range: { min: 0, max: 100 }, readOnly: false, updateInterval: 10 },
      { id: 'heat_setpoint', name: 'Heating Setpoint', type: 'setpoint', unit: '°C', range: { min: 10, max: 35 }, readOnly: false }
    ],
    capabilities: {
      monitoring: true,
      control: true,
      scheduling: true,
      alarming: true,
      trending: true
    },
    integrationNotes: [
      'Requires OAuth 2.0 application registration',
      'Support for JSON Web Tokens',
      'Real-time data streaming available',
      'Historical data API with flexible queries',
      'Setpoint modifications require proper permissions'
    ],
    requiresGateway: false,
    implementationComplexity: 'medium',
    estimatedSetupTime: '2-3 days'
  },

  'priva-digital-services': {
    manufacturer: 'Priva',
    equipmentId: 'priva-digital-services',
    model: 'Digital Services Platform',
    category: 'Cloud Platform',
    protocols: [
      {
        name: 'REST API',
        version: '1.0',
        port: 443,
        authentication: 'oauth',
        dataFormat: 'json',
        realTime: true,
        bidirectional: true
      }
    ],
    dataPoints: [
      { id: 'facility_status', name: 'Facility Status', type: 'status', readOnly: true },
      { id: 'energy_usage', name: 'Energy Usage', type: 'status', unit: 'kWh', readOnly: true, updateInterval: 300 },
      { id: 'water_usage', name: 'Water Usage', type: 'flow', unit: 'L/min', readOnly: true, updateInterval: 300 },
      { id: 'climate_summary', name: 'Climate Summary', type: 'status', readOnly: true, updateInterval: 60 }
    ],
    capabilities: {
      monitoring: true,
      control: false,
      scheduling: false,
      alarming: true,
      trending: true
    },
    integrationNotes: [
      'Cloud-based analytics platform',
      'Aggregated data from multiple facilities',
      'Advanced reporting and benchmarking',
      'Mobile app integration support'
    ],
    requiresGateway: false,
    implementationComplexity: 'low',
    estimatedSetupTime: '1 day'
  }
};

// TrolMaster Integration Specifications  
export const trolmasterIntegrationSpecs: Record<string, EquipmentIntegrationSpec> = {
  'trolmaster-hydro-x': {
    manufacturer: 'TrolMaster',
    equipmentId: 'trolmaster-hydro-x',
    model: 'Hydro-X Pro Environmental Controller',
    category: 'Environmental Controller',
    protocols: [
      {
        name: 'TrolMaster API',
        version: '1.0',
        authentication: 'token',
        dataFormat: 'json',
        realTime: false,
        bidirectional: true
      },
      {
        name: 'Modbus RTU',
        version: '1.0',
        authentication: 'none',
        dataFormat: 'modbus',
        realTime: true,
        bidirectional: true
      }
    ],
    dataPoints: [
      { id: 'temperature', name: 'Temperature', type: 'temperature', unit: '°F', range: { min: 32, max: 120 }, readOnly: false, updateInterval: 60 },
      { id: 'humidity', name: 'Humidity', type: 'humidity', unit: '%RH', range: { min: 0, max: 100 }, readOnly: false, updateInterval: 60 },
      { id: 'vpd', name: 'VPD', type: 'status', unit: 'kPa', range: { min: 0, max: 5 }, readOnly: true, updateInterval: 60 },
      { id: 'light_status', name: 'Light Status', type: 'status', readOnly: false },
      { id: 'device_status', name: 'Device Status', type: 'status', readOnly: true, updateInterval: 30 }
    ],
    capabilities: {
      monitoring: true,
      control: true,
      scheduling: true,
      alarming: true,
      trending: false
    },
    integrationNotes: [
      'API access requires application approval',
      'Request form must be completed for API keys',
      'Limited documentation publicly available',
      'Strong cannabis cultivation focus',
      'Modbus integration more readily available'
    ],
    requiresGateway: true,
    gatewayOptions: ['Modbus TCP/RTU Gateway', 'Custom API Bridge'],
    implementationComplexity: 'high',
    estimatedSetupTime: '1-2 weeks'
  }
};

// Wadsworth Integration Specifications
export const wadsworthIntegrationSpecs: Record<string, EquipmentIntegrationSpec> = {
  'wadsworth-seed': {
    manufacturer: 'Wadsworth',
    equipmentId: 'wadsworth-seed',
    model: 'SEED Environmental Controller',
    category: 'Environmental Controller',
    protocols: [
      {
        name: 'Modbus TCP',
        version: '1.0',
        port: 502,
        authentication: 'none',
        dataFormat: 'modbus',
        realTime: true,
        bidirectional: true
      },
      {
        name: 'BACnet IP',
        version: '1.0',
        port: 47808,
        authentication: 'none',
        dataFormat: 'bacnet',
        realTime: true,
        bidirectional: true
      }
    ],
    dataPoints: [
      { id: 'air_temp', name: 'Air Temperature', type: 'temperature', unit: '°F', range: { min: 32, max: 120 }, readOnly: false, updateInterval: 30 },
      { id: 'soil_temp', name: 'Soil Temperature', type: 'temperature', unit: '°F', range: { min: 32, max: 100 }, readOnly: true, updateInterval: 60 },
      { id: 'humidity', name: 'Relative Humidity', type: 'humidity', unit: '%RH', range: { min: 0, max: 100 }, readOnly: false, updateInterval: 30 },
      { id: 'vent_temp_sp', name: 'Vent Temperature Setpoint', type: 'setpoint', unit: '°F', range: { min: 50, max: 90 }, readOnly: false },
      { id: 'heat_temp_sp', name: 'Heat Temperature Setpoint', type: 'setpoint', unit: '°F', range: { min: 50, max: 85 }, readOnly: false }
    ],
    capabilities: {
      monitoring: true,
      control: true,
      scheduling: true,
      alarming: true,
      trending: false
    },
    integrationNotes: [
      'No public API documentation available',
      'Integration via building automation protocols',
      'Requires BACnet or Modbus gateway',
      'Traditional greenhouse control focus',
      'Established protocols with good reliability'
    ],
    requiresGateway: true,
    gatewayOptions: ['BACnet to REST Gateway', 'Modbus TCP Gateway', 'FieldServer Protocol Gateway'],
    implementationComplexity: 'medium',
    estimatedSetupTime: '3-5 days'
  }
};

// Dosatron Integration Specifications
export const dosatronIntegrationSpecs: Record<string, EquipmentIntegrationSpec> = {
  'dosatron-nutrient-injector': {
    manufacturer: 'Dosatron',
    equipmentId: 'dosatron-nutrient-injector',
    model: 'D25RE2 Nutrient Injector',
    category: 'Irrigation System',
    protocols: [
      {
        name: 'Analog Monitoring',
        authentication: 'none',
        dataFormat: 'binary',
        realTime: true,
        bidirectional: false
      }
    ],
    dataPoints: [
      { id: 'flow_rate', name: 'Flow Rate', type: 'flow', unit: 'GPM', range: { min: 0, max: 50 }, readOnly: true, updateInterval: 60 },
      { id: 'injection_rate', name: 'Injection Rate', type: 'status', unit: '%', range: { min: 0, max: 100 }, readOnly: true, updateInterval: 60 },
      { id: 'operational_status', name: 'Operational Status', type: 'status', readOnly: true, updateInterval: 30 }
    ],
    capabilities: {
      monitoring: true,
      control: false,
      scheduling: false,
      alarming: false,
      trending: false
    },
    integrationNotes: [
      'Mechanical water-powered system',
      'No digital communication interface',
      'Requires external flow and pressure sensors',
      'Integration via monitoring sensors only',
      'Very reliable but limited digital capability'
    ],
    requiresGateway: true,
    gatewayOptions: ['Analog Input Module', 'Flow Sensor Interface', 'Custom Monitoring System'],
    implementationComplexity: 'low',
    estimatedSetupTime: '1-2 days'
  }
};

// Dramm Integration Specifications
export const drammIntegrationSpecs: Record<string, EquipmentIntegrationSpec> = {
  'dramm-proline-controller': {
    manufacturer: 'Dramm',
    equipmentId: 'dramm-proline-controller',
    model: 'ProLine Irrigation Controller',
    category: 'Irrigation Controller',
    protocols: [
      {
        name: 'SmartLink Cellular',
        authentication: 'token',
        dataFormat: 'json',
        realTime: false,
        bidirectional: true
      },
      {
        name: 'RS485 Serial',
        version: '1.0',
        authentication: 'none',
        dataFormat: 'binary',
        realTime: true,
        bidirectional: true
      }
    ],
    dataPoints: [
      { id: 'program_status', name: 'Program Status', type: 'status', readOnly: false },
      { id: 'valve_status', name: 'Valve Status', type: 'status', readOnly: false },
      { id: 'runtime_remaining', name: 'Runtime Remaining', type: 'status', unit: 'minutes', readOnly: true, updateInterval: 60 },
      { id: 'flow_sensor', name: 'Flow Sensor', type: 'flow', unit: 'GPM', readOnly: true, updateInterval: 30 },
      { id: 'system_pressure', name: 'System Pressure', type: 'pressure', unit: 'PSI', readOnly: true, updateInterval: 60 }
    ],
    capabilities: {
      monitoring: true,
      control: true,
      scheduling: true,
      alarming: true,
      trending: false
    },
    integrationNotes: [
      'SmartLink cellular option for remote access',
      'Mobile app available for monitoring',
      'Serial communication for local integration',
      'Modular expansion capability',
      'Good for irrigation scheduling and control'
    ],
    requiresGateway: true,
    gatewayOptions: ['Cellular to REST Gateway', 'Serial to Ethernet Converter', 'Custom Mobile App Integration'],
    implementationComplexity: 'medium',
    estimatedSetupTime: '2-4 days'
  }
};

// Consolidated integration specifications
export const allIntegrationSpecs = {
  priva: privaIntegrationSpecs,
  trolmaster: trolmasterIntegrationSpecs,
  wadsworth: wadsworthIntegrationSpecs,
  dosatron: dosatronIntegrationSpecs,
  dramm: drammIntegrationSpecs
};

// Integration planning utilities
export interface IntegrationPlan {
  facilityId: string;
  selectedEquipment: Array<{
    spec: EquipmentIntegrationSpec;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  requiredGateways: string[];
  totalComplexity: 'low' | 'medium' | 'high';
  estimatedTotalTime: string;
  estimatedCost: number;
  implementationPhases: Array<{
    phase: number;
    description: string;
    equipment: string[];
    duration: string;
  }>;
}

export function createIntegrationPlan(
  equipmentList: string[],
  priorityMap: Record<string, 'high' | 'medium' | 'low'> = {},
  budget: number = 50000
): IntegrationPlan {
  const selectedEquipment = [];
  const requiredGateways = new Set<string>();
  let totalCost = 0;

  // Process each piece of equipment
  for (const equipmentId of equipmentList) {
    let spec: EquipmentIntegrationSpec | undefined;
    
    // Find the spec across all manufacturers
    for (const manufacturer of Object.values(allIntegrationSpecs)) {
      if (manufacturer[equipmentId]) {
        spec = manufacturer[equipmentId];
        break;
      }
    }

    if (spec) {
      selectedEquipment.push({
        spec,
        priority: priorityMap[equipmentId] || 'medium',
        timeline: spec.estimatedSetupTime
      });

      // Add gateway requirements
      if (spec.requiresGateway && spec.gatewayOptions) {
        spec.gatewayOptions.forEach(gateway => requiredGateways.add(gateway));
      }

      // Estimate costs
      const baseCost = spec.implementationComplexity === 'low' ? 2000 : 
                      spec.implementationComplexity === 'medium' ? 5000 : 10000;
      totalCost += baseCost;
    }
  }

  // Determine overall complexity
  const complexities = selectedEquipment.map(e => e.spec.implementationComplexity);
  const hasHigh = complexities.includes('high');
  const hasMedium = complexities.includes('medium');
  const totalComplexity = hasHigh ? 'high' : hasMedium ? 'medium' : 'low';

  // Create implementation phases
  const highPriority = selectedEquipment.filter(e => e.priority === 'high');
  const mediumPriority = selectedEquipment.filter(e => e.priority === 'medium');
  const lowPriority = selectedEquipment.filter(e => e.priority === 'low');

  const phases = [];
  if (highPriority.length > 0) {
    phases.push({
      phase: 1,
      description: 'Critical systems integration',
      equipment: highPriority.map(e => e.spec.model),
      duration: '1-2 weeks'
    });
  }
  if (mediumPriority.length > 0) {
    phases.push({
      phase: phases.length + 1,
      description: 'Secondary systems integration',
      equipment: mediumPriority.map(e => e.spec.model),
      duration: '2-3 weeks'
    });
  }
  if (lowPriority.length > 0) {
    phases.push({
      phase: phases.length + 1,
      description: 'Optional systems integration',
      equipment: lowPriority.map(e => e.spec.model),
      duration: '1-2 weeks'
    });
  }

  return {
    facilityId: 'default',
    selectedEquipment,
    requiredGateways: Array.from(requiredGateways),
    totalComplexity,
    estimatedTotalTime: `${phases.length * 2}-${phases.length * 3} weeks`,
    estimatedCost: totalCost,
    implementationPhases: phases
  };
}

export function getIntegrationSpec(manufacturer: string, equipmentId: string): EquipmentIntegrationSpec | undefined {
  const manufacturerSpecs = allIntegrationSpecs[manufacturer.toLowerCase() as keyof typeof allIntegrationSpecs];
  return manufacturerSpecs?.[equipmentId];
}

export function getAllSupportedEquipment(): Array<{ manufacturer: string; equipment: EquipmentIntegrationSpec[] }> {
  return Object.entries(allIntegrationSpecs).map(([manufacturer, specs]) => ({
    manufacturer,
    equipment: Object.values(specs)
  }));
}