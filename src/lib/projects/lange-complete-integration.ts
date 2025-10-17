/**
 * Complete Lange Project Integration
 * Integrates all Vibelux system modules for the Lange Commercial Greenhouse
 */

import { ElectricalSystemDesigner } from '../construction/electrical-system-designer';
import { CircuitPlanner } from '../circuit-planner';
import { layoutGenerator } from '../drawing/layoutGenerator';
import { generateEnhancedConstructionDocuments } from '../reports/enhancedConstructionGenerator';
import type { ElectricalLoad } from '../construction/electrical-system-designer';

export interface LangeProjectData {
  // Project Info
  name: string;
  location: string;
  client: string;
  date: Date;
  
  // Physical Specifications
  structures: {
    count: number;
    dimensions: {
      individualWidth: number;
      individualLength: number;
      totalArea: number;
      gutterHeight: number;
      ridgeHeight: number;
    };
  };
  
  // Systems
  electrical: {
    service: { voltage: string; amperage: number; };
    lighting: { fixtures: number; totalLoad: number; };
    panels: any[];
  };
  
  hvac: {
    cooling: { capacity: number; units: number; };
    heating: { capacity: number; boilers: number; };
  };
  
  irrigation: {
    storage: number;
    zones: number;
    flow: number;
  };
  
  // Generated Systems
  electricalSystem?: any;
  hvacLayout?: any;
  irrigationLayout?: any;
}

export class LangeProjectIntegration {
  private electricalDesigner: ElectricalSystemDesigner;
  private circuitPlanner: typeof CircuitPlanner;
  
  constructor() {
    this.electricalDesigner = new ElectricalSystemDesigner();
    this.circuitPlanner = CircuitPlanner;
  }
  
  /**
   * Generate complete Lange project with all integrated systems
   */
  async generateCompleteProject(): Promise<LangeProjectData> {
    const projectData: LangeProjectData = {
      name: 'Lange Commercial Greenhouse',
      location: 'Brochton, Illinois 61617',
      client: 'Lange Group',
      date: new Date(),
      
      structures: {
        count: 5,
        dimensions: {
          individualWidth: 157.5,
          individualLength: 170.6,
          totalArea: 26847.5,
          gutterHeight: 18,
          ridgeHeight: 24
        }
      },
      
      electrical: {
        service: { voltage: '480Y/277V', amperage: 2400 },
        lighting: { fixtures: 987, totalLoad: 987000 },
        panels: []
      },
      
      hvac: {
        cooling: { capacity: 346, units: 67 },
        heating: { capacity: 6580, boilers: 2 }
      },
      
      irrigation: {
        storage: 22000,
        zones: 15,
        flow: 5034
      }
    };
    
    // Generate electrical system
    projectData.electricalSystem = await this.generateElectricalSystem();
    
    // Generate HVAC layout
    projectData.hvacLayout = await this.generateHVACLayout();
    
    // Generate irrigation layout
    projectData.irrigationLayout = await this.generateIrrigationLayout();
    
    return projectData;
  }
  
  /**
   * Generate complete electrical system using Vibelux modules
   */
  private async generateElectricalSystem() {
    // Create main service panel
    const mainPanel = this.electricalDesigner.addMainPanel('MDP-1', 2400, 84);
    
    // Create distribution panels
    const distributionPanels = [];
    for (let i = 0; i < 3; i++) {
      const dp = this.electricalDesigner.addSubPanel(
        `DP-${i + 1}`,
        800,
        42,
        mainPanel.id,
        800
      );
      distributionPanels.push(dp);
    }
    
    // Create lighting panels for each zone
    const lightingPanels = [];
    for (let i = 0; i < 5; i++) {
      const lp = this.electricalDesigner.addSubPanel(
        `LP-${i + 1}`,
        400,
        42,
        distributionPanels[Math.floor(i / 2)].id,
        400
      );
      lightingPanels.push(lp);
    }
    
    // Generate lighting circuits
    const fixtureDistribution = [147, 210, 210, 210, 210]; // Zone 1 is vegetative with fewer fixtures
    
    for (let zone = 0; zone < 5; zone++) {
      const fixtures = Array.from({ length: fixtureDistribution[zone] }, (_, i) => ({
        id: `zone${zone + 1}-fixture-${i + 1}`,
        wattage: 1000,
        voltage: 277,
        quantity: 1
      }));
      
      await this.electricalDesigner.generateLightingCircuits(lightingPanels[zone].id, fixtures);
    }
    
    // Add HVAC loads
    const hvacPanel = this.electricalDesigner.addSubPanel(
      'HP-1',
      600,
      42,
      distributionPanels[2].id,
      600
    );
    
    // Chiller load
    const chillerLoad: ElectricalLoad = {
      id: 'chiller-1',
      name: 'Main Chiller - 346 Tons',
      voltage: 480,
      amperage: 415, // Calculated from 346 tons
      phase: 'three',
      continuousDuty: true,
      powerFactor: 0.85,
      location: { zone: 'Mechanical Room', x: 0, y: 0 }
    };
    
    this.electricalDesigner.addCircuit(hvacPanel.id, 'Chiller', [chillerLoad], 480);
    
    // Boiler loads
    for (let i = 0; i < 2; i++) {
      const boilerLoad: ElectricalLoad = {
        id: `boiler-${i + 1}`,
        name: `Boiler ${i + 1} - 2.5 MBTU`,
        voltage: 480,
        amperage: 40, // 40HP each
        phase: 'three',
        continuousDuty: true,
        powerFactor: 0.85,
        location: { zone: 'Mechanical Room', x: i * 5, y: 0 }
      };
      
      this.electricalDesigner.addCircuit(hvacPanel.id, `Boiler ${i + 1}`, [boilerLoad], 480);
    }
    
    // Fan coil units (grouped by zones)
    const fanCoilsPerZone = Math.ceil(67 / 5);
    for (let zone = 0; zone < 5; zone++) {
      const fanCoilLoads = Array.from({ length: fanCoilsPerZone }, (_, i) => ({
        id: `fcu-zone${zone + 1}-${i + 1}`,
        name: `Fan Coil Unit Zone ${zone + 1}-${i + 1}`,
        voltage: 208,
        amperage: 12, // Typical fan coil current
        phase: 'three',
        continuousDuty: true,
        powerFactor: 0.8,
        location: { zone: `Zone ${zone + 1}`, x: i * 10, y: 0 }
      }));
      
      this.electricalDesigner.addCircuit(
        hvacPanel.id, 
        `Fan Coils Zone ${zone + 1}`, 
        fanCoilLoads, 
        208
      );
    }
    
    // Calculate voltage drops and generate final system
    this.electricalDesigner.calculateVoltageDrops();
    this.electricalDesigner.generateLoadSchedule();
    const electricalSystem = this.electricalDesigner.exportDesign();
    
    return electricalSystem;
  }
  
  /**
   * Generate HVAC layout using Vibelux layout generator
   */
  private async generateHVACLayout() {
    const roomSpec = {
      id: 'lange-greenhouse',
      name: 'Lange Commercial Greenhouse',
      type: 'greenhouse' as const,
      dimensions: {
        width: 157.5,
        height: 853,
        depth: 18
      },
      area: 26847.5,
      doors: [
        { position: { x: 0, y: 426.5 }, width: 12, height: 8 },
        { position: { x: 157.5, y: 426.5 }, width: 12, height: 8 }
      ],
      windows: [],
      walls: []
    };
    
    const hvacLayout = await layoutGenerator.generateLayout(roomSpec, {
      tableType: 'rolling',
      lightType: 'hps',
      targetPPFD: 700,
      hvacRedundancy: true,
      complianceMode: 'strict'
    });
    
    return hvacLayout;
  }
  
  /**
   * Generate irrigation layout
   */
  private async generateIrrigationLayout() {
    return {
      zones: [
        { id: 'zone-1', name: 'Vegetative', area: 5369.5, drippers: 1474 },
        { id: 'zone-2', name: 'Flowering 1', area: 5369.5, drippers: 1579 },
        { id: 'zone-3', name: 'Flowering 2', area: 5369.5, drippers: 1579 },
        { id: 'zone-4', name: 'Flowering 3', area: 5369.5, drippers: 1579 },
        { id: 'zone-5', name: 'Flowering 4', area: 5369.5, drippers: 1579 }
      ],
      storage: {
        freshWater: 7000,
        batchTanks: [
          { capacity: 7000, quantity: 2 },
          { capacity: 4000, quantity: 2 }
        ]
      },
      distribution: {
        mainLines: 5,
        laterals: 310,
        totalFlow: 5034
      }
    };
  }
  
  /**
   * Generate complete construction documents
   */
  async generateConstructionDocuments(): Promise<Blob> {
    const projectData = await this.generateCompleteProject();
    
    const config = {
      project: {
        name: projectData.name,
        number: 'VL-2024-001',
        location: projectData.location,
        client: projectData.client,
        date: projectData.date
      },
      dimensions: {
        width: projectData.structures.dimensions.individualWidth,
        length: projectData.structures.dimensions.individualLength * projectData.structures.count,
        gutterHeight: projectData.structures.dimensions.gutterHeight,
        ridgeHeight: projectData.structures.dimensions.ridgeHeight
      },
      zones: projectData.structures.count,
      fixtures: Array.from({ length: projectData.electrical.lighting.fixtures }, (_, i) => ({
        id: `fixture-${i + 1}`,
        type: 'HPS',
        wattage: 1000,
        voltage: 277,
        position: {
          x: (i % 39) * 4.3, // 39 fixtures per row
          y: Math.floor(i / 39) * 5.2,
          z: 14.5
        }
      })),
      hvac: {
        coolingCapacity: projectData.hvac.cooling.capacity,
        heatingCapacity: Math.floor(projectData.hvac.heating.capacity / 1000), // Convert to MBH
        fanCoilUnits: projectData.hvac.cooling.units
      },
      electrical: {
        serviceSize: projectData.electrical.service.amperage,
        voltage: projectData.electrical.service.voltage
      }
    };
    
    return await generateEnhancedConstructionDocuments(config);
  }
  
  /**
   * Get project statistics
   */
  getProjectStatistics(projectData: LangeProjectData) {
    return {
      facility: {
        totalArea: projectData.structures.dimensions.totalArea,
        structures: projectData.structures.count,
        zonesPerStructure: 1
      },
      electrical: {
        serviceSize: `${projectData.electrical.service.amperage}A`,
        voltage: projectData.electrical.service.voltage,
        totalFixtures: projectData.electrical.lighting.fixtures,
        totalLightingLoad: `${projectData.electrical.lighting.totalLoad / 1000}kW`,
        panels: projectData.electricalSystem?.panels?.length || 0,
        circuits: projectData.electricalSystem?.panels?.reduce((sum: number, panel: any) => 
          sum + panel.circuits.length, 0) || 0
      },
      hvac: {
        coolingCapacity: `${projectData.hvac.cooling.capacity} tons`,
        heatingCapacity: `${(projectData.hvac.heating.capacity / 1000).toFixed(1)} MBTU/hr`,
        fanCoilUnits: projectData.hvac.cooling.units,
        airFlow: '180,000 CFM'
      },
      irrigation: {
        storageCapacity: `${projectData.irrigation.storage.toLocaleString()} gallons`,
        zones: projectData.irrigation.zones,
        dailyFlow: `${projectData.irrigation.flow.toLocaleString()} GPD`,
        drippers: '7,890 total'
      }
    };
  }
}

// Export singleton instance
export const langeIntegration = new LangeProjectIntegration();