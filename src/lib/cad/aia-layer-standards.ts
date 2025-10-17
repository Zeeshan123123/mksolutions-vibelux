/**
 * AIA (American Institute of Architects) Layer Standards
 * Professional layer naming conventions and properties for architectural drawings
 */

export interface LayerProperties {
  name: string;
  color: string; // Hex color
  colorIndex?: number; // AutoCAD color index
  lineWeight: number; // in mm
  lineType: 'continuous' | 'dashed' | 'dotted' | 'dashdot' | 'center' | 'hidden';
  description: string;
  visible: boolean;
  locked: boolean;
  printable: boolean;
  transparency?: number; // 0-100
  plotStyle?: string;
}

export interface LayerGroup {
  name: string;
  prefix: string;
  description: string;
  layers: LayerProperties[];
}

// Standard AIA layer colors (AutoCAD color indices)
export const AIA_COLORS = {
  RED: { hex: '#FF0000', index: 1 },
  YELLOW: { hex: '#FFFF00', index: 2 },
  GREEN: { hex: '#00FF00', index: 3 },
  CYAN: { hex: '#00FFFF', index: 4 },
  BLUE: { hex: '#0000FF', index: 5 },
  MAGENTA: { hex: '#FF00FF', index: 6 },
  WHITE: { hex: '#FFFFFF', index: 7 },
  GRAY: { hex: '#808080', index: 8 },
  LIGHT_GRAY: { hex: '#C0C0C0', index: 9 }
};

// AIA Layer naming convention: Discipline-Major-Minor-Status
export const AIA_LAYER_GROUPS: LayerGroup[] = [
  {
    name: 'Architectural',
    prefix: 'A-',
    description: 'Architectural elements',
    layers: [
      {
        name: 'A-WALL',
        color: AIA_COLORS.WHITE.hex,
        colorIndex: AIA_COLORS.WHITE.index,
        lineWeight: 0.35,
        lineType: 'continuous',
        description: 'Walls',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-WALL-PATT',
        color: AIA_COLORS.GRAY.hex,
        colorIndex: AIA_COLORS.GRAY.index,
        lineWeight: 0.18,
        lineType: 'continuous',
        description: 'Wall patterns and hatching',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-DOOR',
        color: AIA_COLORS.GREEN.hex,
        colorIndex: AIA_COLORS.GREEN.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Doors',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-GLAZ',
        color: AIA_COLORS.CYAN.hex,
        colorIndex: AIA_COLORS.CYAN.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Windows and glazing',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-FLOR',
        color: AIA_COLORS.WHITE.hex,
        colorIndex: AIA_COLORS.WHITE.index,
        lineWeight: 0.35,
        lineType: 'continuous',
        description: 'Floor information',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-CLNG',
        color: AIA_COLORS.MAGENTA.hex,
        colorIndex: AIA_COLORS.MAGENTA.index,
        lineWeight: 0.25,
        lineType: 'dashed',
        description: 'Ceiling information',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-FURN',
        color: AIA_COLORS.GRAY.hex,
        colorIndex: AIA_COLORS.GRAY.index,
        lineWeight: 0.18,
        lineType: 'continuous',
        description: 'Furniture',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'A-EQPM',
        color: AIA_COLORS.GRAY.hex,
        colorIndex: AIA_COLORS.GRAY.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Equipment',
        visible: true,
        locked: false,
        printable: true
      }
    ]
  },
  {
    name: 'Electrical',
    prefix: 'E-',
    description: 'Electrical systems',
    layers: [
      {
        name: 'E-LITE',
        color: AIA_COLORS.YELLOW.hex,
        colorIndex: AIA_COLORS.YELLOW.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Lighting fixtures',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'E-LITE-CIRC',
        color: AIA_COLORS.YELLOW.hex,
        colorIndex: AIA_COLORS.YELLOW.index,
        lineWeight: 0.18,
        lineType: 'dashed',
        description: 'Lighting circuits',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'E-LITE-EMER',
        color: AIA_COLORS.RED.hex,
        colorIndex: AIA_COLORS.RED.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Emergency lighting',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'E-POWR',
        color: AIA_COLORS.RED.hex,
        colorIndex: AIA_COLORS.RED.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Power outlets and devices',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'E-POWR-CIRC',
        color: AIA_COLORS.RED.hex,
        colorIndex: AIA_COLORS.RED.index,
        lineWeight: 0.18,
        lineType: 'dashed',
        description: 'Power circuits',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'E-CTRL',
        color: AIA_COLORS.MAGENTA.hex,
        colorIndex: AIA_COLORS.MAGENTA.index,
        lineWeight: 0.18,
        lineType: 'dashdot',
        description: 'Control wiring',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'E-GRND',
        color: AIA_COLORS.GREEN.hex,
        colorIndex: AIA_COLORS.GREEN.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Grounding system',
        visible: true,
        locked: false,
        printable: true
      }
    ]
  },
  {
    name: 'Mechanical',
    prefix: 'M-',
    description: 'HVAC and mechanical systems',
    layers: [
      {
        name: 'M-HVAC',
        color: AIA_COLORS.BLUE.hex,
        colorIndex: AIA_COLORS.BLUE.index,
        lineWeight: 0.35,
        lineType: 'continuous',
        description: 'HVAC equipment',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'M-HVAC-DUCT',
        color: AIA_COLORS.BLUE.hex,
        colorIndex: AIA_COLORS.BLUE.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Ductwork',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'M-HVAC-PIPE',
        color: AIA_COLORS.CYAN.hex,
        colorIndex: AIA_COLORS.CYAN.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'HVAC piping',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'M-EXHS',
        color: AIA_COLORS.GRAY.hex,
        colorIndex: AIA_COLORS.GRAY.index,
        lineWeight: 0.25,
        lineType: 'dashed',
        description: 'Exhaust systems',
        visible: true,
        locked: false,
        printable: true
      }
    ]
  },
  {
    name: 'Plumbing',
    prefix: 'P-',
    description: 'Plumbing and piping systems',
    layers: [
      {
        name: 'P-FIXT',
        color: AIA_COLORS.MAGENTA.hex,
        colorIndex: AIA_COLORS.MAGENTA.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Plumbing fixtures',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'P-PIPE',
        color: AIA_COLORS.MAGENTA.hex,
        colorIndex: AIA_COLORS.MAGENTA.index,
        lineWeight: 0.25,
        lineType: 'continuous',
        description: 'Piping',
        visible: true,
        locked: false,
        printable: true
      }
    ]
  },
  {
    name: 'General',
    prefix: 'G-',
    description: 'General annotation and information',
    layers: [
      {
        name: 'G-ANNO-DIMS',
        color: AIA_COLORS.CYAN.hex,
        colorIndex: AIA_COLORS.CYAN.index,
        lineWeight: 0.18,
        lineType: 'continuous',
        description: 'Dimensions',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'G-ANNO-TEXT',
        color: AIA_COLORS.WHITE.hex,
        colorIndex: AIA_COLORS.WHITE.index,
        lineWeight: 0.18,
        lineType: 'continuous',
        description: 'General text',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'G-ANNO-SYMB',
        color: AIA_COLORS.WHITE.hex,
        colorIndex: AIA_COLORS.WHITE.index,
        lineWeight: 0.18,
        lineType: 'continuous',
        description: 'Symbols and tags',
        visible: true,
        locked: false,
        printable: true
      },
      {
        name: 'G-ANNO-TTLB',
        color: AIA_COLORS.WHITE.hex,
        colorIndex: AIA_COLORS.WHITE.index,
        lineWeight: 0.35,
        lineType: 'continuous',
        description: 'Title block and border',
        visible: true,
        locked: true,
        printable: true
      }
    ]
  }
];

// Quick access to common layers
export const COMMON_LAYERS = {
  WALLS: 'A-WALL',
  DOORS: 'A-DOOR',
  WINDOWS: 'A-GLAZ',
  LIGHTING: 'E-LITE',
  LIGHTING_CIRCUITS: 'E-LITE-CIRC',
  POWER: 'E-POWR',
  POWER_CIRCUITS: 'E-POWR-CIRC',
  HVAC: 'M-HVAC',
  DIMENSIONS: 'G-ANNO-DIMS',
  TEXT: 'G-ANNO-TEXT'
};

// Layer management utilities
export class AIALayerManager {
  private layers: Map<string, LayerProperties> = new Map();
  private activeLayer: string = COMMON_LAYERS.LIGHTING;

  constructor() {
    // Initialize with all AIA standard layers
    AIA_LAYER_GROUPS.forEach(group => {
      group.layers.forEach(layer => {
        this.layers.set(layer.name, { ...layer });
      });
    });
  }

  /**
   * Get all layers
   */
  getAllLayers(): LayerProperties[] {
    return Array.from(this.layers.values());
  }

  /**
   * Get layers by discipline
   */
  getLayersByDiscipline(prefix: string): LayerProperties[] {
    return Array.from(this.layers.values()).filter(layer => 
      layer.name.startsWith(prefix)
    );
  }

  /**
   * Get layer by name
   */
  getLayer(name: string): LayerProperties | undefined {
    return this.layers.get(name);
  }

  /**
   * Set active layer
   */
  setActiveLayer(name: string): boolean {
    if (this.layers.has(name)) {
      this.activeLayer = name;
      return true;
    }
    return false;
  }

  /**
   * Get active layer
   */
  getActiveLayer(): LayerProperties {
    return this.layers.get(this.activeLayer)!;
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  /**
   * Toggle layer lock
   */
  toggleLayerLock(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.locked = !layer.locked;
    }
  }

  /**
   * Create custom layer
   */
  createCustomLayer(layer: LayerProperties): void {
    this.layers.set(layer.name, layer);
  }

  /**
   * Export layers for DWG/DXF
   */
  exportLayersForCAD(): any[] {
    return Array.from(this.layers.values()).map(layer => ({
      name: layer.name,
      color: layer.colorIndex || 7,
      lineType: layer.lineType.toUpperCase(),
      lineWeight: Math.round(layer.lineWeight * 100), // Convert to hundredths of mm
      plotStyle: layer.plotStyle || 'ByLayer',
      transparency: layer.transparency || 0,
      on: layer.visible,
      frozen: false,
      locked: layer.locked,
      plot: layer.printable
    }));
  }
}

export default AIALayerManager;