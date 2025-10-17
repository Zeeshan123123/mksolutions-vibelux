// Vibelux (.vlx) File Format Specification and Handler
// Custom binary/compressed format for Vibelux projects

interface VLXHeader {
  signature: 'VLX1'; // File format identifier
  version: string;
  created: string;
  modified: string;
  checksum: string;
  compression: 'none' | 'gzip' | 'lz4';
  encryption: 'none' | 'aes256';
}

interface VLXMetadata {
  projectId: string;
  projectName: string;
  clientName?: string;
  location?: string;
  designType: string;
  tags: string[];
  thumbnail?: string; // Base64 encoded image
  author: string;
  company?: string;
  license?: string;
  notes?: string;
}

interface VLXGeometry {
  room: {
    dimensions: { length: number; width: number; height: number };
    unit: 'feet' | 'meters';
    type: 'indoor' | 'greenhouse' | 'warehouse' | 'vertical';
    coordinates?: { lat: number; lng: number }; // GPS coordinates
    orientation?: number; // Building orientation in degrees
  };
  fixtures: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    model: {
      manufacturer: string;
      name: string;
      partNumber?: string;
      specifications: {
        power: number; // Watts
        ppf: number; // Photosynthetic Photon Flux
        efficacy: number; // μmol/J
        spectrum: string;
        dimensions: { length: number; width: number; height: number };
        weight?: number;
        voltage?: string;
        current?: number;
        beamAngle?: number;
        cri?: number;
        lifespan?: number; // Hours
      };
    };
    circuitId?: string;
    dimmingLevel?: number; // 0-100%
    scheduleId?: string;
    enabled: boolean;
    locked?: boolean;
    groupId?: string;
  }>;
  obstacles?: Array<{
    id: string;
    type: 'pillar' | 'hvac' | 'door' | 'window' | 'equipment';
    position: { x: number; y: number; z: number };
    dimensions: { length: number; width: number; height: number };
    rotation: number;
  }>;
}

interface VLXAnalysis {
  ppfdGrid: number[][]; // Calculated PPFD values across room
  uniformityMetrics: {
    minAvgRatio: number;
    avgMaxRatio: number;
    minMaxRatio: number;
    cv: number; // Coefficient of variation
  };
  lightingMetrics: {
    averagePPFD: number;
    minPPFD: number;
    maxPPFD: number;
    totalPPF: number;
    dli: number; // Daily Light Integral
    photoperiod: number; // Hours
  };
  powerMetrics: {
    totalPower: number; // Watts
    powerDensity: number; // W/ft² or W/m²
    efficacy: number; // μmol/J
    annualConsumption: number; // kWh/year
    estimatedCost: number; // $/year
  };
  thermalAnalysis?: {
    heatGeneration: number; // BTU/hr
    coolingLoad: number; // Tons of cooling
    ambientTempRise: number; // °F or °C
  };
}

interface VLXElectrical {
  circuits: Array<{
    id: string;
    name: string;
    voltage: string;
    amperage: number;
    fixtureIds: string[];
    totalLoad: number; // Watts
    breaker: {
      size: number; // Amps
      type: '1P' | '2P' | '3P';
    };
    wireGauge: string;
    conduitSize?: string;
  }>;
  panels: Array<{
    id: string;
    name: string;
    location: { x: number; y: number };
    totalLoad: number;
    availableCapacity: number;
    voltage: string;
    phases: 1 | 3;
    circuitIds: string[];
  }>;
  loadCalculations: {
    totalConnectedLoad: number;
    demandLoad: number;
    diversityFactor: number;
    serviceSize: number; // Amps
    servicevoltage: string;
  };
}

interface VLXScheduling {
  schedules: Array<{
    id: string;
    name: string;
    type: 'photoperiodic' | 'supplemental' | 'custom';
    fixtureIds: string[];
    events: Array<{
      time: string; // HH:MM format
      action: 'on' | 'off' | 'dim';
      value?: number; // Dimming level 0-100%
      days: number[]; // 0=Sunday, 1=Monday, etc.
    }>;
    sensors?: Array<{
      type: 'light' | 'temperature' | 'humidity';
      threshold: number;
      action: 'on' | 'off' | 'dim' | 'adjust';
    }>;
  }>;
}

interface VLXFinancial {
  costs: {
    fixtures: { unitCost: number; totalCost: number };
    installation: { laborHours: number; ratePerHour: number; totalCost: number };
    electrical: { materialCost: number; laborCost: number; permitCost: number };
    controls: { equipmentCost: number; programmingCost: number };
    misc: { shipping: number; tax: number; contingency: number };
  };
  analysis: {
    totalInvestment: number;
    energyBaseline: { annualCost: number; technology: string };
    energySavings: { annualSavings: number; lifetimeSavings: number };
    roi: { years: number; percentage: number };
    paybackPeriod: number; // Years
    npv: number; // Net Present Value
    irr: number; // Internal Rate of Return
  };
  incentives?: Array<{
    name: string;
    type: 'rebate' | 'tax_credit' | 'deduction';
    amount: number;
    eligibility: string;
  }>;
}

interface VLXCompliance {
  codes: Array<{
    jurisdiction: string;
    code: string; // e.g., "IECC 2021", "Title 24", "NEC 2020"
    requirements: Array<{
      section: string;
      requirement: string;
      compliance: 'pass' | 'fail' | 'na';
      notes?: string;
    }>;
  }>;
  certifications?: Array<{
    program: string; // e.g., "DLC Premium", "ENERGY STAR"
    status: 'certified' | 'pending' | 'not_applicable';
    certificateNumber?: string;
    expirationDate?: string;
  }>;
}

interface VLXDocument {
  header: VLXHeader;
  metadata: VLXMetadata;
  geometry: VLXGeometry;
  analysis: VLXAnalysis;
  electrical: VLXElectrical;
  scheduling?: VLXScheduling;
  financial?: VLXFinancial;
  compliance?: VLXCompliance;
  customData?: Record<string, any>; // For future extensions
}

export class VLXFormat {
  private static readonly SIGNATURE = 'VLX1';
  private static readonly CURRENT_VERSION = '1.0.0';

  // Create VLX file from project data
  static async createVLX(projectData: any): Promise<Uint8Array> {
    const vlxDoc: VLXDocument = {
      header: {
        signature: 'VLX1',
        version: this.CURRENT_VERSION,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        checksum: '',
        compression: 'gzip',
        encryption: 'none'
      },
      metadata: {
        projectId: projectData.id || `vlx-${Date.now()}`,
        projectName: projectData.name || 'Untitled Project',
        clientName: projectData.client,
        location: projectData.location,
        designType: projectData.designType || 'indoor',
        tags: projectData.tags || [],
        author: projectData.author || 'Vibelux User',
        company: projectData.company,
        notes: projectData.notes
      },
      geometry: {
        room: projectData.room,
        fixtures: projectData.fixtures,
        obstacles: projectData.obstacles || []
      },
      analysis: this.calculateAnalysis(projectData),
      electrical: this.generateElectricalPlan(projectData),
      financial: projectData.financial,
      compliance: projectData.compliance
    };

    // Calculate checksum
    const jsonStr = JSON.stringify(vlxDoc);
    vlxDoc.header.checksum = await this.calculateChecksum(jsonStr);

    // Compress if specified
    let finalData: Uint8Array;
    if (vlxDoc.header.compression === 'gzip') {
      finalData = await this.compressGzip(jsonStr);
    } else {
      finalData = new TextEncoder().encode(jsonStr);
    }

    return finalData;
  }

  // Parse VLX file
  static async parseVLX(data: Uint8Array): Promise<VLXDocument> {
    // Try to decompress if it's compressed
    let jsonStr: string;
    try {
      jsonStr = await this.decompressGzip(data);
    } catch {
      // If decompression fails, try as raw text
      jsonStr = new TextDecoder().decode(data);
    }

    const vlxDoc: VLXDocument = JSON.parse(jsonStr);

    // Verify signature
    if (vlxDoc.header.signature !== this.SIGNATURE) {
      throw new Error('Invalid VLX file: Wrong signature');
    }

    // Verify checksum
    const tempChecksum = vlxDoc.header.checksum;
    vlxDoc.header.checksum = '';
    const calculatedChecksum = await this.calculateChecksum(JSON.stringify(vlxDoc));
    
    if (tempChecksum !== calculatedChecksum) {
      console.warn('VLX file checksum mismatch - file may be corrupted');
    }

    vlxDoc.header.checksum = tempChecksum;
    return vlxDoc;
  }

  // Export to standard formats
  static exportToJSON(vlxDoc: VLXDocument): string {
    return JSON.stringify(vlxDoc, null, 2);
  }

  static exportToVibeluxProject(vlxDoc: VLXDocument): any {
    return {
      version: "1.0",
      timestamp: Date.now(),
      project: {
        id: vlxDoc.metadata.projectId,
        name: vlxDoc.metadata.projectName,
        client: vlxDoc.metadata.clientName,
        location: vlxDoc.metadata.location,
        designType: vlxDoc.metadata.designType
      },
      room: vlxDoc.geometry.room,
      fixtures: vlxDoc.geometry.fixtures,
      config: {
        spaceType: vlxDoc.geometry.room.type,
        dimensions: vlxDoc.geometry.room.dimensions,
        unit: vlxDoc.geometry.room.unit,
        includeCAD: true
      }
    };
  }

  // Helper methods
  private static calculateAnalysis(projectData: any): VLXAnalysis {
    const fixtures = projectData.fixtures || [];
    const room = projectData.room || { dimensions: { length: 20, width: 12, height: 10 } };
    
    // Calculate basic metrics
    const totalPower = fixtures.reduce((sum: number, f: any) => 
      sum + (f.model?.specifications?.power || 645), 0);
    const area = room.dimensions.length * room.dimensions.width;
    const powerDensity = totalPower / area;

    // Simplified PPFD calculation
    const averagePPFD = fixtures.length > 0 ? 
      fixtures.reduce((sum: number, f: any) => sum + (f.model?.specifications?.ppf || 1700), 0) / 
      (fixtures.length * (area / 100)) : 0; // Rough approximation

    return {
      ppfdGrid: [], // Would be calculated with full physics engine
      uniformityMetrics: {
        minAvgRatio: 0.8,
        avgMaxRatio: 0.9,
        minMaxRatio: 0.7,
        cv: 0.15
      },
      lightingMetrics: {
        averagePPFD: Math.round(averagePPFD * 100) / 100,
        minPPFD: Math.round(averagePPFD * 0.7),
        maxPPFD: Math.round(averagePPFD * 1.2),
        totalPPF: fixtures.reduce((sum: number, f: any) => sum + (f.model?.specifications?.ppf || 1700), 0),
        dli: (averagePPFD * 0.0432), // Assuming 12-hour photoperiod
        photoperiod: 12
      },
      powerMetrics: {
        totalPower,
        powerDensity,
        efficacy: totalPower > 0 ? (fixtures.reduce((sum: number, f: any) => sum + (f.model?.specifications?.ppf || 1700), 0)) / totalPower : 0,
        annualConsumption: (totalPower * 12 * 365) / 1000, // kWh/year
        estimatedCost: (totalPower * 12 * 365 / 1000) * 0.12 // $0.12/kWh
      }
    };
  }

  private static generateElectricalPlan(projectData: any): VLXElectrical {
    const fixtures = projectData.fixtures || [];
    const fixturesPerCircuit = 20;
    const circuitCount = Math.ceil(fixtures.length / fixturesPerCircuit);
    
    const circuits = Array.from({ length: circuitCount }, (_, i) => {
      const circuitFixtures = fixtures.slice(i * fixturesPerCircuit, (i + 1) * fixturesPerCircuit);
      const totalLoad = circuitFixtures.reduce((sum: number, f: any) => sum + (f.model?.specifications?.power || 645), 0);
      
      return {
        id: `circuit-${i + 1}`,
        name: `Lighting Circuit ${i + 1}`,
        voltage: '480V 3-Phase',
        amperage: Math.ceil(totalLoad / (480 * 1.732)),
        fixtureIds: circuitFixtures.map((f: any) => f.id),
        totalLoad,
        breaker: {
          size: Math.ceil(totalLoad * 1.25 / (480 * 1.732) / 5) * 5,
          type: '3P' as const
        },
        wireGauge: '12 AWG',
        conduitSize: '3/4"'
      };
    });

    const totalLoad = fixtures.reduce((sum: number, f: any) => sum + (f.model?.specifications?.power || 645), 0);

    return {
      circuits,
      panels: [{
        id: 'main-panel',
        name: 'Main Lighting Panel',
        location: { x: 0, y: 0 },
        totalLoad,
        availableCapacity: Math.max(totalLoad * 1.25, 100000), // 100kW minimum
        voltage: '480V 3-Phase',
        phases: 3,
        circuitIds: circuits.map(c => c.id)
      }],
      loadCalculations: {
        totalConnectedLoad: totalLoad,
        demandLoad: totalLoad * 1.0, // 100% demand factor for lighting
        diversityFactor: 1.0,
        serviceSize: Math.ceil(totalLoad * 1.25 / (480 * 1.732) / 50) * 50,
        servicevoltage: '480V 3-Phase'
      }
    };
  }

  private static async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async compressGzip(data: string): Promise<Uint8Array> {
    // Note: This is a simplified implementation
    // In a real application, you'd use a proper gzip library
    return new TextEncoder().encode(data);
  }

  private static async decompressGzip(data: Uint8Array): Promise<string> {
    // Note: This is a simplified implementation
    // In a real application, you'd use a proper gzip library
    return new TextDecoder().decode(data);
  }
}

// File extension registration
export const VLX_FILE_EXTENSION = '.vlx';
export const VLX_MIME_TYPE = 'application/vnd.vibelux-project';

// File dialog filters
export const VLX_FILE_FILTER = {
  name: 'Vibelux Project Files',
  extensions: ['vlx']
};

export default VLXFormat;