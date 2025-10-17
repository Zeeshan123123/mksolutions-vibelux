/**
 * Layout generator for cultivation facilities
 * Converts parsed drawings into optimized cultivation layouts
 */

import {
  RoomSpecification,
  CultivationLayout,
  TablePlacement,
  LightPlacement,
  HVACPlacement,
  IrrigationPlacement,
  ElectricalPlacement,
  WorkflowPath,
  LayoutMetrics,
  Point3D,
  DrawingValidation,
  ValidationError,
  ValidationWarning,
  LayoutSuggestion
} from './types';

interface LayoutConfig {
  tableType: 'rolling' | 'fixed' | 'vertical';
  tableSize: { width: number; depth: number; height: number };
  aisleWidth: number;
  plantDensity: number; // plants per sq ft
  lightType: 'led' | 'hps' | 'cmh';
  targetPPFD: number;
  hvacRedundancy: boolean;
  complianceMode: 'strict' | 'standard' | 'minimal';
}

export class LayoutGenerator {
  private static instance: LayoutGenerator;
  
  private defaultConfig: LayoutConfig = {
    tableType: 'rolling',
    tableSize: { width: 4, depth: 8, height: 3 },
    aisleWidth: 3,
    plantDensity: 4,
    lightType: 'led',
    targetPPFD: 700,
    hvacRedundancy: true,
    complianceMode: 'standard'
  };

  static getInstance(): LayoutGenerator {
    if (!LayoutGenerator.instance) {
      LayoutGenerator.instance = new LayoutGenerator();
    }
    return LayoutGenerator.instance;
  }

  /**
   * Generate optimized cultivation layout from room specification
   */
  async generateLayout(
    room: RoomSpecification,
    config: Partial<LayoutConfig> = {}
  ): Promise<CultivationLayout> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Generate table layout
    const tables = this.generateTableLayout(room, finalConfig);
    
    // Generate lighting layout
    const lights = this.generateLightingLayout(room, tables, finalConfig);
    
    // Generate HVAC layout
    const hvac = this.generateHVACLayout(room, tables, finalConfig);
    
    // Generate irrigation layout
    const irrigation = this.generateIrrigationLayout(room, tables, finalConfig);
    
    // Generate electrical layout
    const electrical = this.generateElectricalLayout(room, lights, hvac, finalConfig);
    
    // Generate workflow paths
    const workflow = this.generateWorkflowPaths(room, tables, finalConfig);
    
    // Calculate metrics
    const metrics = this.calculateLayoutMetrics(
      room,
      tables,
      lights,
      hvac,
      finalConfig
    );
    
    return {
      room,
      tables,
      lights,
      hvac,
      irrigation,
      electrical,
      workflow,
      metrics
    };
  }

  /**
   * Generate table layout
   */
  private generateTableLayout(
    room: RoomSpecification,
    config: LayoutConfig
  ): TablePlacement[] {
    const tables: TablePlacement[] = [];
    const { width: roomWidth, height: roomHeight } = room.dimensions;
    const { tableSize, aisleWidth } = config;
    
    // Calculate effective room dimensions (accounting for walls and clearances)
    const wallClearance = 1; // 1 ft clearance from walls
    const effectiveWidth = roomWidth - (2 * wallClearance);
    const effectiveHeight = roomHeight - (2 * wallClearance);
    
    // Determine optimal table orientation
    const isHorizontal = this.determineOptimalOrientation(
      effectiveWidth,
      effectiveHeight,
      tableSize,
      aisleWidth
    );
    
    const tableWidth = isHorizontal ? tableSize.width : tableSize.depth;
    const tableDepth = isHorizontal ? tableSize.depth : tableSize.width;
    
    // Calculate table grid
    const tablesPerRow = Math.floor((effectiveWidth + aisleWidth) / (tableWidth + aisleWidth));
    const tablesPerColumn = Math.floor((effectiveHeight + aisleWidth) / (tableDepth + aisleWidth));
    
    // Calculate spacing to center tables in room
    const totalTableWidth = tablesPerRow * tableWidth + (tablesPerRow - 1) * aisleWidth;
    const totalTableHeight = tablesPerColumn * tableDepth + (tablesPerColumn - 1) * aisleWidth;
    const xOffset = wallClearance + (effectiveWidth - totalTableWidth) / 2;
    const yOffset = wallClearance + (effectiveHeight - totalTableHeight) / 2;
    
    // Place tables
    let tableId = 1;
    for (let row = 0; row < tablesPerColumn; row++) {
      for (let col = 0; col < tablesPerRow; col++) {
        const x = xOffset + col * (tableWidth + aisleWidth);
        const y = yOffset + row * (tableDepth + aisleWidth);
        
        tables.push({
          id: `table_${tableId}`,
          position: { x, y, z: 0 },
          rotation: isHorizontal ? 0 : 90,
          dimensions: {
            width: tableWidth,
            depth: tableDepth,
            height: tableSize.height
          },
          type: config.tableType,
          capacity: Math.floor(tableWidth * tableDepth * config.plantDensity)
        });
        
        tableId++;
      }
    }
    
    return tables;
  }

  /**
   * Generate lighting layout
   */
  private generateLightingLayout(
    room: RoomSpecification,
    tables: TablePlacement[],
    config: LayoutConfig
  ): LightPlacement[] {
    const lights: LightPlacement[] = [];
    
    // Calculate light requirements based on table area
    const totalCanopyArea = tables.reduce(
      (sum, table) => sum + (table.dimensions.width * table.dimensions.depth),
      0
    );
    
    // Light specifications based on type (updated with Fluence SPYDR 2p specs)
    const lightSpecs = {
      led: { wattage: 645, coverage: 16, efficiency: 2.6 }, // Fluence SPYDR 2p
      hps: { wattage: 1000, coverage: 25, efficiency: 1.95 },
      cmh: { wattage: 315, coverage: 16, efficiency: 1.95 }
    };
    
    const spec = lightSpecs[config.lightType];
    const lightsNeeded = Math.ceil(totalCanopyArea / spec.coverage);
    
    // Calculate grid spacing for even light distribution
    const roomArea = room.dimensions.width * room.dimensions.height;
    const gridSize = Math.sqrt(roomArea / lightsNeeded);
    
    // Place lights in grid pattern
    let lightId = 1;
    for (let y = gridSize / 2; y < room.dimensions.height; y += gridSize) {
      for (let x = gridSize / 2; x < room.dimensions.width; x += gridSize) {
        // Only place lights over tables
        const isOverTable = tables.some(table => 
          x >= table.position.x && 
          x <= table.position.x + table.dimensions.width &&
          y >= table.position.y && 
          y <= table.position.y + table.dimensions.depth
        );
        
        if (isOverTable) {
          lights.push({
            id: `light_${lightId}`,
            position: { x, y, z: 10 }, // 10 ft ceiling height
            fixture: {
              type: config.lightType,
              wattage: spec.wattage,
              coverage: spec.coverage,
              ppfd: config.targetPPFD
            },
            mounting: 'adjustable'
          });
          lightId++;
        }
      }
    }
    
    return lights;
  }

  /**
   * Generate HVAC layout
   */
  private generateHVACLayout(
    room: RoomSpecification,
    tables: TablePlacement[],
    config: LayoutConfig
  ): HVACPlacement[] {
    const hvac: HVACPlacement[] = [];
    
    // Calculate cooling requirements
    const roomVolume = room.dimensions.width * room.dimensions.height * 10; // 10 ft ceiling
    const btuPerSqFt = 50; // Standard for cultivation
    const coolingRequired = room.area * btuPerSqFt;
    
    // AC units (place in corners for optimal airflow)
    const acUnits = config.hvacRedundancy ? 4 : 2;
    const acCapacity = coolingRequired / acUnits;
    
    const corners = [
      { x: 2, y: 2 },
      { x: room.dimensions.width - 2, y: 2 },
      { x: 2, y: room.dimensions.height - 2 },
      { x: room.dimensions.width - 2, y: room.dimensions.height - 2 }
    ];
    
    for (let i = 0; i < acUnits; i++) {
      hvac.push({
        id: `ac_${i + 1}`,
        type: 'ac',
        position: { ...corners[i], z: 8 },
        capacity: acCapacity,
        coverage: room.area / acUnits
      });
    }
    
    // Dehumidifiers (1 per 1000 sq ft)
    const dehumidifiersNeeded = Math.ceil(room.area / 1000);
    const dehumSpacing = room.dimensions.width / (dehumidifiersNeeded + 1);
    
    for (let i = 0; i < dehumidifiersNeeded; i++) {
      hvac.push({
        id: `dehum_${i + 1}`,
        type: 'dehumidifier',
        position: {
          x: dehumSpacing * (i + 1),
          y: room.dimensions.height / 2,
          z: 0
        },
        capacity: 70, // 70 pints/day
        coverage: room.area / dehumidifiersNeeded
      });
    }
    
    // Circulation fans (1 per 4 tables)
    const fansNeeded = Math.ceil(tables.length / 4);
    let fanId = 1;
    
    for (let i = 0; i < tables.length; i += 4) {
      const centerTable = tables[i];
      hvac.push({
        id: `fan_${fanId}`,
        type: 'fan',
        position: {
          x: centerTable.position.x + centerTable.dimensions.width / 2,
          y: centerTable.position.y + centerTable.dimensions.depth / 2,
          z: 7
        },
        capacity: 3000, // CFM
        coverage: 400 // sq ft
      });
      fanId++;
    }
    
    return hvac;
  }

  /**
   * Generate irrigation layout
   */
  private generateIrrigationLayout(
    room: RoomSpecification,
    tables: TablePlacement[],
    config: LayoutConfig
  ): IrrigationPlacement[] {
    const irrigation: IrrigationPlacement[] = [];
    
    // Main water line along wall
    const mainLine: Point3D[] = [
      { x: 1, y: 1, z: 0.5 },
      { x: room.dimensions.width - 1, y: 1, z: 0.5 },
      { x: room.dimensions.width - 1, y: room.dimensions.height - 1, z: 0.5 },
      { x: 1, y: room.dimensions.height - 1, z: 0.5 }
    ];
    
    // Outlets at each table
    const outlets: Point3D[] = tables.map(table => ({
      x: table.position.x + table.dimensions.width / 2,
      y: table.position.y,
      z: table.position.z + table.dimensions.height
    }));
    
    irrigation.push({
      id: 'irrigation_main',
      type: 'drip',
      mainLines: mainLine,
      outlets,
      capacity: tables.length * 50 // 50 gallons per table per day
    });
    
    return irrigation;
  }

  /**
   * Generate electrical layout
   */
  private generateElectricalLayout(
    room: RoomSpecification,
    lights: LightPlacement[],
    hvac: HVACPlacement[],
    config: LayoutConfig
  ): ElectricalPlacement[] {
    const electrical: ElectricalPlacement[] = [];
    
    // Calculate total power requirements
    const lightingLoad = lights.reduce((sum, light) => sum + light.fixture.wattage, 0);
    const hvacLoad = hvac
      .filter(unit => unit.type === 'ac')
      .reduce((sum, unit) => sum + (unit.capacity / 10), 0); // Rough BTU to watts
    
    const totalLoad = lightingLoad + hvacLoad;
    const voltage = 240; // Standard for commercial
    const totalAmperage = totalLoad / voltage;
    
    // Main panel
    electrical.push({
      id: 'panel_main',
      type: 'panel',
      position: { x: 1, y: room.dimensions.height / 2, z: 4 },
      voltage: 240,
      amperage: Math.ceil(totalAmperage * 1.25), // 25% safety margin
      circuits: []
    });
    
    // Sub-panels for different zones
    const zonesNeeded = Math.ceil(lights.length / 8); // 8 lights per zone
    
    for (let i = 0; i < zonesNeeded; i++) {
      electrical.push({
        id: `panel_zone_${i + 1}`,
        type: 'panel',
        position: {
          x: (room.dimensions.width / (zonesNeeded + 1)) * (i + 1),
          y: 1,
          z: 6
        },
        voltage: 240,
        amperage: 100,
        circuits: [`zone_${i + 1}_lights`]
      });
    }
    
    // Outlets for equipment
    const outletSpacing = 10; // Every 10 feet
    
    for (let x = outletSpacing; x < room.dimensions.width; x += outletSpacing) {
      electrical.push({
        id: `outlet_${x}`,
        type: 'outlet',
        position: { x, y: 0.5, z: 1.5 },
        voltage: 120,
        amperage: 20,
        circuits: ['general']
      });
    }
    
    return electrical;
  }

  /**
   * Generate workflow paths
   */
  private generateWorkflowPaths(
    room: RoomSpecification,
    tables: TablePlacement[],
    config: LayoutConfig
  ): WorkflowPath[] {
    const paths: WorkflowPath[] = [];
    
    // Main corridor
    const mainPath: Point3D[] = [
      { x: room.dimensions.width / 2, y: 1, z: 0 },
      { x: room.dimensions.width / 2, y: room.dimensions.height - 1, z: 0 }
    ];
    
    paths.push({
      id: 'path_main',
      type: 'primary',
      points: mainPath,
      width: config.aisleWidth,
      clearance: 0.5
    });
    
    // Cross aisles
    const crossAisles = this.calculateCrossAisles(room, tables, config);
    crossAisles.forEach((aisle, index) => {
      paths.push({
        id: `path_cross_${index + 1}`,
        type: 'secondary',
        points: aisle,
        width: config.aisleWidth,
        clearance: 0.5
      });
    });
    
    // Emergency exits
    const exits: Point3D[] = [
      { x: 0, y: room.dimensions.height / 2, z: 0 },
      { x: room.dimensions.width, y: room.dimensions.height / 2, z: 0 }
    ];
    
    paths.push({
      id: 'path_emergency',
      type: 'emergency',
      points: exits,
      width: 4, // 4 ft minimum for emergency
      clearance: 1
    });
    
    return paths;
  }

  /**
   * Calculate layout metrics
   */
  private calculateLayoutMetrics(
    room: RoomSpecification,
    tables: TablePlacement[],
    lights: LightPlacement[],
    hvac: HVACPlacement[],
    config: LayoutConfig
  ): LayoutMetrics {
    const tableArea = tables.reduce(
      (sum, table) => sum + (table.dimensions.width * table.dimensions.depth),
      0
    );
    
    const plantCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    
    const totalPower = lights.reduce((sum, light) => sum + light.fixture.wattage, 0);
    
    return {
      tableCount: tables.length,
      plantCapacity,
      canopyArea: tableArea,
      aisleArea: room.area - tableArea,
      utilizationRate: (tableArea / room.area) * 100,
      ppfdAverage: config.targetPPFD,
      powerDensity: totalPower / tableArea, // watts per sq ft
      hvacCoverage: (hvac.length * 1000) / room.area, // coverage ratio
      complianceScore: this.calculateComplianceScore(room, tables, config)
    };
  }

  /**
   * Validate layout
   */
  validateLayout(layout: CultivationLayout): DrawingValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: LayoutSuggestion[] = [];
    
    // Check minimum aisle width
    if (layout.workflow.some(path => path.width < 3)) {
      errors.push({
        code: 'AISLE_TOO_NARROW',
        message: 'Aisle width must be at least 3 feet for compliance',
        severity: 'error'
      });
    }
    
    // Check table spacing
    const minSpacing = this.checkMinimumTableSpacing(layout.tables);
    if (minSpacing < 2.5) {
      warnings.push({
        code: 'TABLE_SPACING',
        message: `Table spacing (${minSpacing.toFixed(1)}ft) is below recommended 3ft`,
        severity: 'warning'
      });
    }
    
    // Check utilization
    if (layout.metrics.utilizationRate < 60) {
      suggestions.push({
        type: 'optimization',
        message: 'Room utilization is low. Consider smaller aisles or more tables.',
        impact: 'high',
        implementation: 'Reduce aisle width to 3ft and add more growing tables'
      });
    }
    
    // Check power density
    if (layout.metrics.powerDensity > 50) {
      warnings.push({
        code: 'HIGH_POWER_DENSITY',
        message: 'Power density exceeds 50W/sqft. Consider LED lights for efficiency.',
        severity: 'warning'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Helper methods
   */
  private determineOptimalOrientation(
    roomWidth: number,
    roomHeight: number,
    tableSize: { width: number; depth: number },
    aisleWidth: number
  ): boolean {
    // Calculate tables that fit in each orientation
    const horizontalTables = 
      Math.floor((roomWidth + aisleWidth) / (tableSize.width + aisleWidth)) *
      Math.floor((roomHeight + aisleWidth) / (tableSize.depth + aisleWidth));
    
    const verticalTables = 
      Math.floor((roomWidth + aisleWidth) / (tableSize.depth + aisleWidth)) *
      Math.floor((roomHeight + aisleWidth) / (tableSize.width + aisleWidth));
    
    return horizontalTables >= verticalTables;
  }

  private calculateCrossAisles(
    room: RoomSpecification,
    tables: TablePlacement[],
    config: LayoutConfig
  ): Point3D[][] {
    const aisles: Point3D[][] = [];
    
    // Find gaps between table rows
    const tableRows = new Set(tables.map(t => t.position.y));
    const sortedRows = Array.from(tableRows).sort((a, b) => a - b);
    
    for (let i = 0; i < sortedRows.length - 1; i++) {
      const y = sortedRows[i] + tables[0].dimensions.depth + config.aisleWidth / 2;
      aisles.push([
        { x: 1, y, z: 0 },
        { x: room.dimensions.width - 1, y, z: 0 }
      ]);
    }
    
    return aisles;
  }

  private checkMinimumTableSpacing(tables: TablePlacement[]): number {
    let minSpacing = Infinity;
    
    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const spacing = this.calculateTableSpacing(tables[i], tables[j]);
        minSpacing = Math.min(minSpacing, spacing);
      }
    }
    
    return minSpacing;
  }

  private calculateTableSpacing(t1: TablePlacement, t2: TablePlacement): number {
    const t1Right = t1.position.x + t1.dimensions.width;
    const t1Bottom = t1.position.y + t1.dimensions.depth;
    const t2Right = t2.position.x + t2.dimensions.width;
    const t2Bottom = t2.position.y + t2.dimensions.depth;
    
    // Check if tables are adjacent horizontally
    if (t1.position.y < t2Bottom && t1Bottom > t2.position.y) {
      if (t1Right < t2.position.x) return t2.position.x - t1Right;
      if (t2Right < t1.position.x) return t1.position.x - t2Right;
    }
    
    // Check if tables are adjacent vertically
    if (t1.position.x < t2Right && t1Right > t2.position.x) {
      if (t1Bottom < t2.position.y) return t2.position.y - t1Bottom;
      if (t2Bottom < t1.position.y) return t1.position.y - t2Bottom;
    }
    
    return Infinity;
  }

  private calculateComplianceScore(
    room: RoomSpecification,
    tables: TablePlacement[],
    config: LayoutConfig
  ): number {
    let score = 100;
    
    // Deduct points for compliance issues
    if (config.aisleWidth < 3) score -= 20;
    if (!room.doors || room.doors.length === 0) score -= 10;
    if (tables.length > 100) score -= 5; // Too many tables for tracking
    
    return Math.max(0, score);
  }
}

// Export singleton instance
export const layoutGenerator = LayoutGenerator.getInstance();