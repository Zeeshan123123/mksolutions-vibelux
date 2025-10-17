/**
 * Lighting Integration Protocols Database
 * Accurate documentation of control protocols for major horticultural lighting manufacturers
 */

export interface LightingProtocol {
  manufacturer: string;
  brand: string;
  models: string[];
  protocols: {
    name: string;
    type: '0-10V' | 'PWM' | 'DALI' | 'DMX' | 'ModbusTCP' | 'ModbusRTU' | 'HLP' | 'API' | 'Proprietary';
    dimming: boolean;
    scheduling: boolean;
    spectralControl: boolean;
    monitoring: boolean;
    notes?: string;
  }[];
  integrationNotes: string[];
  requiresGateway: boolean;
  nativeCloudAPI: boolean;
}

export const lightingProtocols: LightingProtocol[] = [
  {
    manufacturer: 'Fluence by OSRAM',
    brand: 'Fluence',
    models: ['SPYDR', 'VYPR', 'RAZR', 'VYNE'],
    protocols: [
      {
        name: '0-10V Dimming',
        type: '0-10V',
        dimming: true,
        scheduling: false,
        spectralControl: false,
        monitoring: false,
        notes: 'Standard 0-10V dimming control, no data feedback'
      },
      {
        name: 'Fluence Dimming Module',
        type: 'Proprietary',
        dimming: true,
        scheduling: true,
        spectralControl: false,
        monitoring: false,
        notes: 'Proprietary wireless dimming solution'
      }
    ],
    integrationNotes: [
      'Most Fluence fixtures use standard 0-10V dimming',
      'No native Modbus support',
      'Dimming modules provide group control',
      'Integration typically through 0-10V interfaces'
    ],
    requiresGateway: true,
    nativeCloudAPI: false
  },
  {
    manufacturer: 'Signify',
    brand: 'Philips GreenPower',
    models: ['GreenPower LED toplighting', 'GreenPower LED interlighting'],
    protocols: [
      {
        name: 'GrowWise Control System',
        type: 'ModbusTCP',
        dimming: true,
        scheduling: true,
        spectralControl: true,
        monitoring: true,
        notes: 'Full Modbus TCP implementation with extensive data points'
      },
      {
        name: 'HLP (Horticulture Lighting Protocol)',
        type: 'HLP',
        dimming: true,
        scheduling: true,
        spectralControl: true,
        monitoring: true,
        notes: 'Industry standard protocol for professional horticulture'
      }
    ],
    integrationNotes: [
      'Philips supports full Modbus TCP integration',
      'HLP protocol provides standardized control',
      'GrowWise system offers cloud connectivity',
      'Comprehensive monitoring and control capabilities'
    ],
    requiresGateway: false,
    nativeCloudAPI: true
  },
  {
    manufacturer: 'Gavita',
    brand: 'Gavita',
    models: ['1700e LED', '1930e LED', 'RS1 LED'],
    protocols: [
      {
        name: 'Gavita E-Series Controller',
        type: 'Proprietary',
        dimming: true,
        scheduling: true,
        spectralControl: false,
        monitoring: true,
        notes: 'Proprietary RS-485 based protocol'
      },
      {
        name: '0-10V Dimming',
        type: '0-10V',
        dimming: true,
        scheduling: false,
        spectralControl: false,
        monitoring: false,
        notes: 'Available on select models'
      }
    ],
    integrationNotes: [
      'E-Series controller required for advanced features',
      'Basic 0-10V dimming on some models',
      'No native Modbus support',
      'Integration through Gavita controller API'
    ],
    requiresGateway: true,
    nativeCloudAPI: false
  },
  {
    manufacturer: 'Heliospectra',
    brand: 'Heliospectra',
    models: ['MITRA', 'ELIXIA', 'DYNA'],
    protocols: [
      {
        name: 'helioCORE',
        type: 'API',
        dimming: true,
        scheduling: true,
        spectralControl: true,
        monitoring: true,
        notes: 'Cloud-based control system with REST API'
      },
      {
        name: 'ModbusTCP',
        type: 'ModbusTCP',
        dimming: true,
        scheduling: false,
        spectralControl: true,
        monitoring: true,
        notes: 'Direct Modbus TCP support on ELIXIA series'
      }
    ],
    integrationNotes: [
      'helioCORE provides comprehensive cloud control',
      'REST API available for integration',
      'ELIXIA series supports direct Modbus TCP',
      'Full spectral control on all models'
    ],
    requiresGateway: false,
    nativeCloudAPI: true
  },
  {
    manufacturer: 'California Lightworks',
    brand: 'California Lightworks',
    models: ['MegaDrive', 'SolarSystem'],
    protocols: [
      {
        name: 'SolarSystem Controller',
        type: 'Proprietary',
        dimming: true,
        scheduling: true,
        spectralControl: true,
        monitoring: false,
        notes: 'Wireless controller with app integration'
      }
    ],
    integrationNotes: [
      'Proprietary wireless control system',
      'Mobile app for programming',
      'No standard protocol support',
      'Integration requires custom development'
    ],
    requiresGateway: true,
    nativeCloudAPI: false
  },
  {
    manufacturer: 'Plessey',
    brand: 'Hyperion',
    models: ['Hyperion 1750', 'Attis-7', 'Attis-300'],
    protocols: [
      {
        name: 'DALI-2',
        type: 'DALI',
        dimming: true,
        scheduling: true,
        spectralControl: true,
        monitoring: true,
        notes: 'Full DALI-2 implementation'
      },
      {
        name: '0-10V',
        type: '0-10V',
        dimming: true,
        scheduling: false,
        spectralControl: false,
        monitoring: false,
        notes: 'Basic dimming option'
      }
    ],
    integrationNotes: [
      'DALI-2 provides advanced control',
      'Tunable spectrum on Hyperion series',
      'Standard protocols for easy integration',
      'Compatible with building automation systems'
    ],
    requiresGateway: false,
    nativeCloudAPI: false
  }
];

// Common integration methods for lighting without native protocol support
export const genericIntegrationMethods = {
  '0-10V': {
    description: 'Analog voltage control for dimming',
    range: '0-10VDC',
    resolution: '1% typical',
    channels: 1,
    feedback: false,
    requirements: [
      '0-10V output module',
      'Shielded control wiring',
      'Maximum 50 fixtures per circuit'
    ]
  },
  'PWM': {
    description: 'Pulse Width Modulation dimming',
    frequency: '1-10kHz typical',
    dutyCycle: '0-100%',
    channels: 1,
    feedback: false,
    requirements: [
      'PWM output module',
      'Short cable runs (<50ft)',
      'Proper grounding'
    ]
  },
  'RelayControl': {
    description: 'Simple on/off control',
    type: 'NO/NC contacts',
    rating: '10A @ 277VAC typical',
    feedback: false,
    requirements: [
      'Relay output module',
      'Contactor for high loads',
      'Surge protection'
    ]
  }
};

// Protocol conversion gateways
export const protocolGateways = {
  'ModbusTo0-10V': {
    description: 'Convert Modbus commands to 0-10V signals',
    manufacturers: ['Advantech', 'Moxa', 'Phoenix Contact'],
    channels: '4-8 typical',
    cost: '$200-500'
  },
  'BACnetTo0-10V': {
    description: 'Building automation to lighting control',
    manufacturers: ['Johnson Controls', 'Schneider Electric'],
    channels: '8-16 typical',
    cost: '$500-1500'
  },
  'APIToModbus': {
    description: 'Cloud API to local Modbus gateway',
    manufacturers: ['VibeLux', 'Custom solutions'],
    features: ['Bidirectional data', 'Local caching', 'Failover'],
    cost: '$1000-3000'
  }
};