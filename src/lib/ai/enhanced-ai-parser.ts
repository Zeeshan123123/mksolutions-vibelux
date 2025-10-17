/**
 * Enhanced AI Parser for Complex Design Requests
 * Handles multi-step, context-aware design commands with spatial intelligence
 */

import { DesignerAction } from '@/app/api/ai-designer/route';

// Enhanced types for complex requests
export interface SpatialRelation {
  type: 'along' | 'across' | 'perpendicular' | 'parallel' | 'centered' | 'between';
  reference: string; // "width", "length", "airflow", "wall", etc.
}

export interface Measurement {
  value: number;
  unit: 'inch' | 'feet' | 'meter' | 'cm';
  context?: 'spacing' | 'height' | 'width' | 'length' | 'clearance';
}

export interface ComplexDesignRequest {
  room?: {
    width: number;
    length: number;
    height: number;
    type?: 'indoor' | 'greenhouse';
  };
  racks?: Array<{
    count: number;
    width: number;
    length: number;
    height: number;
    spacing: number;
    tiers?: number;
    orientation?: SpatialRelation;
  }>;
  fixtures?: {
    targetPPFD?: number;
    mountHeight?: number;
    orientation?: SpatialRelation;
    coverage?: 'full' | 'partial';
    type?: string;
  };
  airflow?: {
    targetVelocity: number; // m/s
    pattern?: 'horizontal' | 'vertical' | 'laminar';
    coverage?: 'uniform' | 'targeted';
  };
  plants?: {
    type: string;
    stage?: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
    height?: number;
    spacing?: number;
    rows?: number;
  };
  constraints?: {
    budget?: number;
    powerLimit?: number;
    minAisleWidth?: number;
    maintenanceAccess?: boolean;
  };
}

// Crop knowledge database
export const CROP_SPECIFICATIONS = {
  lettuce: {
    heights: { seedling: 2, vegetative: 4, harvest: 5 }, // inches
    spacing: { min: 6, optimal: 8, max: 10 }, // inches
    ppfd: { min: 150, optimal: 200, max: 250 },
    dli: { min: 12, optimal: 14, max: 17 },
    airflow: { min: 0.2, optimal: 0.3, max: 0.5 }, // m/s
    temperature: { day: [65, 75], night: [60, 68] }, // F
    photoperiod: 16, // hours
    layout: {
      rowsPerMeter: 6,
      plantsPerSquareFoot: 2.25
    }
  },
  tomatoes: {
    heights: { seedling: 6, vegetative: 36, harvest: 72 }, // inches
    spacing: { min: 12, optimal: 18, max: 24 }, // inches
    ppfd: { min: 400, optimal: 600, max: 800 },
    dli: { min: 20, optimal: 25, max: 30 },
    airflow: { min: 0.3, optimal: 0.5, max: 0.8 }, // m/s
    temperature: { day: [70, 80], night: [62, 68] }, // F
    photoperiod: 18, // hours
    layout: {
      rowsPerMeter: 2,
      plantsPerSquareFoot: 0.44
    }
  },
  cannabis: {
    heights: { seedling: 6, vegetative: 24, flowering: 48 }, // inches
    spacing: { min: 36, optimal: 48, max: 60 }, // inches per plant
    ppfd: { min: 600, optimal: 800, max: 1000 },
    dli: { min: 35, optimal: 45, max: 55 },
    airflow: { min: 0.3, optimal: 0.5, max: 0.8 }, // m/s
    temperature: { day: [72, 78], night: [65, 70] }, // F
    photoperiod: { vegetative: 18, flowering: 12 }, // hours
    layout: {
      rowsPerMeter: 1,
      plantsPerSquareFoot: 0.25
    }
  },
  herbs: {
    heights: { seedling: 2, vegetative: 8, harvest: 12 }, // inches
    spacing: { min: 4, optimal: 6, max: 8 }, // inches
    ppfd: { min: 200, optimal: 300, max: 400 },
    dli: { min: 14, optimal: 18, max: 22 },
    airflow: { min: 0.2, optimal: 0.3, max: 0.4 }, // m/s
    temperature: { day: [65, 75], night: [60, 68] }, // F
    photoperiod: 16, // hours
    layout: {
      rowsPerMeter: 8,
      plantsPerSquareFoot: 4
    }
  }
};

// Unit conversion utilities
export function convertToFeet(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'inch':
    case 'inches':
    case '"':
      return value / 12;
    case 'meter':
    case 'meters':
    case 'm':
      return value * 3.28084;
    case 'cm':
    case 'centimeter':
      return value * 0.0328084;
    case 'feet':
    case 'foot':
    case 'ft':
    case "'":
    default:
      return value;
  }
}

// Parse measurements with units
export function parseMeasurement(text: string): Measurement | null {
  // Match patterns like "5 inches", "2.5'", "0.3 m/s", "10 feet"
  const patterns = [
    /(\d+\.?\d*)\s*(inch|inches|"|in)/i,
    /(\d+\.?\d*)\s*(feet|foot|ft|')/i,
    /(\d+\.?\d*)\s*(meter|meters|m)(?!\/)/i,
    /(\d+\.?\d*)\s*(cm|centimeter)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      let normalizedUnit: Measurement['unit'] = 'feet';
      if (unit.includes('inch') || unit === '"' || unit === 'in') {
        normalizedUnit = 'inch';
      } else if (unit.includes('meter') || unit === 'm') {
        normalizedUnit = 'meter';
      } else if (unit === 'cm' || unit.includes('centimeter')) {
        normalizedUnit = 'cm';
      }

      return { value, unit: normalizedUnit };
    }
  }

  return null;
}

// Parse spatial relationships
export function parseSpatialRelation(text: string): SpatialRelation | null {
  const patterns = [
    { regex: /along\s+(?:the\s+)?(\w+)/i, type: 'along' as const },
    { regex: /across\s+(?:the\s+)?(\w+)/i, type: 'across' as const },
    { regex: /perpendicular\s+to\s+(?:the\s+)?(\w+)/i, type: 'perpendicular' as const },
    { regex: /parallel\s+to\s+(?:the\s+)?(\w+)/i, type: 'parallel' as const },
    { regex: /widthwise/i, type: 'along' as const, reference: 'width' },
    { regex: /lengthwise/i, type: 'along' as const, reference: 'length' },
    { regex: /in\s+(?:the\s+)?direction\s+of\s+(\w+)/i, type: 'along' as const },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        reference: pattern.reference || match[1].toLowerCase()
      };
    }
  }

  return null;
}

// Extract airflow requirements
export function parseAirflowRequirements(text: string): ComplexDesignRequest['airflow'] | null {
  const velocityMatch = text.match(/(\d+\.?\d*)\s*m\/s/i);
  if (!velocityMatch) return null;

  const velocity = parseFloat(velocityMatch[1]);
  const pattern = text.includes('horizontal') ? 'horizontal' : 
                 text.includes('vertical') ? 'vertical' : 'horizontal';

  return {
    targetVelocity: velocity,
    pattern,
    coverage: 'uniform'
  };
}

// Main parser for complex requests
export function parseComplexRequest(prompt: string): ComplexDesignRequest {
  const request: ComplexDesignRequest = {};
  const lowerPrompt = prompt.toLowerCase();

  // Parse room dimensions
  const roomMatch = prompt.match(/(\d+)\s*['"]?\s*x\s*(\d+)\s*['"]?\s*(?:room|space|area)/i);
  if (roomMatch) {
    request.room = {
      width: parseInt(roomMatch[1]),
      length: parseInt(roomMatch[2]),
      height: 10 // Default ceiling height
    };
  }

  // Parse rack specifications
  const rackMatch = prompt.match(/(\d+)\s*racks?.*?(\d+\.?\d*)\s*['"]?\s*x\s*(\d+\.?\d*)/i);
  if (rackMatch) {
    const count = parseInt(rackMatch[1]);
    const width = parseFloat(rackMatch[2]);
    const length = parseFloat(rackMatch[3]);
    
    // Find spacing
    const spacingMatch = prompt.match(/(\d+\.?\d*)\s*['"]?\s*apart/i);
    const spacing = spacingMatch ? parseFloat(spacingMatch[1]) : 3; // Default 3 feet

    request.racks = [{
      count,
      width,
      length,
      height: 6, // Default rack height
      spacing,
      orientation: parseSpatialRelation(prompt) || undefined
    }];

    // Auto-create a room if none specified and racks are requested
    if (!request.room) {
      const totalRackWidth = count * (width + spacing) + spacing; // Include end spacing
      const roomWidth = Math.max(totalRackWidth, 20); // Minimum 20ft wide
      const roomLength = Math.max(length + 6, 20); // Rack length + 6ft clearance, minimum 20ft
      
      request.room = {
        width: roomWidth,
        length: roomLength,
        height: 12, // Default 12ft ceiling
        type: 'indoor'
      };
    }
  }

  // Parse plant/crop type
  const cropTypes = Object.keys(CROP_SPECIFICATIONS);
  for (const crop of cropTypes) {
    if (lowerPrompt.includes(crop)) {
      const spec = CROP_SPECIFICATIONS[crop as keyof typeof CROP_SPECIFICATIONS];
      request.plants = {
        type: crop,
        stage: 'vegetative',
        height: spec.heights.vegetative,
        spacing: spec.spacing.optimal
      };
      
      // Set optimal PPFD if not specified
      if (!request.fixtures) {
        request.fixtures = {
          targetPPFD: spec.ppfd.optimal
        };
      }
    }
  }
  
  // Parse growth stage if specified
  if (lowerPrompt.includes('seedling')) {
    if (request.plants) request.plants.stage = 'seedling';
  } else if (lowerPrompt.includes('flowering') || lowerPrompt.includes('flower')) {
    if (request.plants) request.plants.stage = 'flowering';
  } else if (lowerPrompt.includes('harvest')) {
    if (request.plants) request.plants.stage = 'harvest';
  }

  // Parse fixture requirements
  if (lowerPrompt.includes('light') || lowerPrompt.includes('fixture')) {
    const fixtureOrientation = parseSpatialRelation(prompt);
    if (fixtureOrientation) {
      request.fixtures = {
        ...request.fixtures,
        orientation: fixtureOrientation,
        coverage: 'full'
      };
    }
  }

  // Parse airflow requirements
  const airflow = parseAirflowRequirements(prompt);
  if (airflow) {
    request.airflow = airflow;
  }

  return request;
}

// Generate optimized action sequence
export function generateActionSequence(request: ComplexDesignRequest): DesignerAction[] {
  const actions: DesignerAction[] = [];

  // 1. Create room
  if (request.room) {
    actions.push({
      type: 'CREATE_ROOM',
      params: {
        width: request.room.width,
        length: request.room.length,
        height: request.room.height,
        roomType: request.room.type || 'indoor'
      }
    });
  }

  // 2. Add racks
  if (request.racks) {
    for (const rack of request.racks) {
      actions.push({
        type: 'ADD_BENCHING',
        params: {
          type: 'rack',
          rows: rack.count,
          width: rack.width,
          length: rack.length,
          height: rack.height
        }
      });
    }
  }

  // 3. Calculate and place fixtures
  if (request.fixtures && request.racks) {
    const rack = request.racks[0];
    const targetPPFD = request.fixtures.targetPPFD || 200;
    
    // Calculate fixture requirements
    const areaPerRack = rack.width * rack.length;
    const totalPPF = targetPPFD * areaPerRack * 0.092903; // Convert ft² to m² to get μmol/s
    const fixturesPerRack = Math.ceil(totalPPF / 1800); // Assume 1800 PPF per fixture
    
    // Place fixtures on each rack
    for (let i = 0; i < rack.count; i++) {
      const rackCenterX = request.room!.width / 2;
      const rackY = (i + 1) * (rack.spacing + rack.width) - rack.width / 2;
      
      actions.push({
        type: 'ADD_FIXTURES_ARRAY',
        params: {
          rows: 1,
          columns: fixturesPerRack,
          centerX: rackCenterX,
          centerY: rackY,
          targetPPFD
        }
      });
    }
  }

  // 4. Add airflow equipment
  if (request.airflow && request.room) {
    const fanCFM = request.room.width * request.room.length * request.room.height * 4; // 4 air changes/hour
    const numFans = Math.ceil(fanCFM / 2000); // Assume 2000 CFM per fan
    
    // Place fans at strategic locations
    for (let i = 0; i < numFans; i++) {
      actions.push({
        type: 'ADD_EQUIPMENT',
        params: {
          type: 'fan',
          x: request.room.width * (i + 1) / (numFans + 1),
          y: 2, // Near wall
          specs: {
            cfm: 2000,
            targetVelocity: request.airflow.targetVelocity
          }
        }
      });
    }
  }

  // 5. Add plants
  if (request.plants && request.racks) {
    const rack = request.racks[0];
    const plantsPerRack = Math.floor((rack.width * 12) / request.plants.spacing) * 
                         Math.floor((rack.length * 12) / request.plants.spacing);
    
    for (let i = 0; i < rack.count; i++) {
      const cropId = mapCropTypeToId(request.plants.type);
      actions.push({
        type: 'ADD_PLANTS_ARRAY',
        params: {
          variety: request.plants.type,
          cropId: cropId,
          growthStage: request.plants.stage,
          rows: Math.floor((rack.width * 12) / request.plants.spacing),
          columns: Math.floor((rack.length * 12) / request.plants.spacing),
          spacing: request.plants.spacing / 12, // Convert to feet
          centerX: request.room!.width / 2,
          centerY: (i + 1) * (rack.spacing + rack.width) - rack.width / 2
        }
      });
    }
  }

  return actions;
}

// Helper to map crop types to advanced crop IDs
function mapCropTypeToId(cropType: string): string {
  const mapping: Record<string, string> = {
    'lettuce': 'butterhead-lettuce',
    'tomatoes': 'high-wire-tomato',
    'tomato': 'high-wire-tomato',
    'cannabis': 'cannabis-sativa',
    'hemp': 'cannabis-sativa',
    'herbs': 'genovese-basil',
    'basil': 'genovese-basil',
    'strawberries': 'strawberry',
    'strawberry': 'strawberry'
  };
  return mapping[cropType.toLowerCase()] || cropType;
}

// Validate design feasibility
export function validateDesign(request: ComplexDesignRequest): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check room size for racks
  if (request.room && request.racks) {
    const rack = request.racks[0];
    const totalRackSpace = rack.count * (rack.width + rack.spacing);
    
    if (totalRackSpace > request.room.width * 0.8) {
      issues.push('Racks may be too tight. Consider reducing rack count or size.');
      suggestions.push(`Recommended: ${Math.floor(request.room.width * 0.8 / (rack.width + rack.spacing))} racks`);
    }
  }

  // Check airflow feasibility
  if (request.airflow && request.airflow.targetVelocity > 0.5) {
    suggestions.push('High airflow (>0.5 m/s) may stress plants. Consider 0.3-0.4 m/s for most crops.');
  }

  // Check plant spacing
  if (request.plants) {
    const spec = CROP_SPECIFICATIONS[request.plants.type as keyof typeof CROP_SPECIFICATIONS];
    if (spec && request.plants.spacing < spec.spacing.min) {
      issues.push(`${request.plants.type} spacing too tight. Minimum: ${spec.spacing.min}"`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}