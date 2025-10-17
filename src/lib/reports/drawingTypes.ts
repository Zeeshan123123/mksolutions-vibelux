/**
 * Drawing Types for Vibelux System
 * Separates Design Drawings from Construction Drawing Sets
 */

export type DrawingType = 'design' | 'construction';

export interface DrawingConfig {
  type: DrawingType;
  level: 'basic' | 'detailed' | 'complete';
  disciplines: ('architectural' | 'electrical' | 'mechanical' | 'plumbing' | 'structural')[];
}

// Design Drawings - For planning, presentations, and approvals
export const DESIGN_DRAWING_SETS = {
  conceptual: {
    type: 'design' as const,
    level: 'basic' as const,
    sheets: [
      'Cover Sheet & Project Overview',
      'Site Plan',
      'Overall Floor Plan',
      'Electrical System Overview',
      'HVAC System Concept',
      'Irrigation System Layout'
    ],
    purpose: 'Initial planning and client presentations'
  },
  
  schematic: {
    type: 'design' as const,
    level: 'detailed' as const,
    sheets: [
      'Cover Sheet',
      'Site Plan with Utilities',
      'Floor Plans by Zone',
      'Electrical Single Line Diagram',
      'Panel Schedule Summary',
      'HVAC Equipment Layout',
      'Mechanical System Diagram',
      'Irrigation Zone Plan',
      'Control System Overview'
    ],
    purpose: 'Permit applications and design development'
  },
  
  designDevelopment: {
    type: 'design' as const,
    level: 'complete' as const,
    sheets: [
      'Cover Sheet & Specifications',
      'Site Plan & Utilities',
      'Architectural Plans',
      'Electrical System Design',
      'Panel Schedules',
      'Load Analysis',
      'HVAC Design',
      'Equipment Schedules',
      'Irrigation Design',
      'Control Systems',
      'Energy Analysis'
    ],
    purpose: 'Final design approval and bidding'
  }
};

// Construction Drawing Sets - For actual building
export const CONSTRUCTION_DRAWING_SETS = {
  basic: {
    type: 'construction' as const,
    level: 'basic' as const,
    sheets: [
      'Cover Sheet & General Notes',
      'Site Plan with Dimensions',
      'Foundation Plan',
      'Floor Plan with Details',
      'Electrical Plan with Circuits',
      'Panel Schedules Complete',
      'HVAC Plan with Ductwork',
      'Plumbing/Irrigation Plan',
      'Details & Sections'
    ],
    purpose: 'Basic construction with experienced contractors'
  },
  
  detailed: {
    type: 'construction' as const,
    level: 'detailed' as const,
    sheets: [
      // General
      'G-001: Cover Sheet & Index',
      'G-002: General Notes & Specifications',
      'G-003: Symbols & Abbreviations',
      
      // Architectural
      'A-001: Site Plan',
      'A-101: Floor Plan',
      'A-201: Elevations',
      'A-301: Building Sections',
      'A-401: Details',
      
      // Structural  
      'S-101: Foundation Plan',
      'S-201: Framing Plan',
      'S-301: Connection Details',
      
      // Electrical
      'E-001: Electrical Site Plan',
      'E-101: Lighting Plan',
      'E-201: Power Plan',
      'E-301: Single Line Diagram',
      'E-401: Panel Schedules',
      'E-501: Details & Connections',
      
      // Mechanical
      'M-101: HVAC Plan',
      'M-201: Ductwork Plan',
      'M-301: Equipment Details',
      
      // Plumbing
      'P-101: Irrigation Plan',
      'P-201: Plumbing Isometric'
    ],
    purpose: 'Complete construction documentation'
  },
  
  complete: {
    type: 'construction' as const,
    level: 'complete' as const,
    sheets: [
      // General (3 sheets)
      'G-001: Cover Sheet & Drawing Index',
      'G-002: General Notes & Code Requirements', 
      'G-003: Symbols, Abbreviations & Legend',
      
      // Architectural (8 sheets)
      'A-001: Site Plan & Utilities',
      'A-101: Overall Floor Plan',
      'A-102: Enlarged Floor Plans',
      'A-201: Exterior Elevations',
      'A-301: Building Sections',
      'A-401: Wall Sections & Details',
      'A-501: Door & Window Schedules',
      'A-601: Finish Schedules',
      
      // Structural (6 sheets)
      'S-101: Foundation Plan',
      'S-201: Foundation Details', 
      'S-301: Framing Plan',
      'S-401: Framing Details',
      'S-501: Connection Details',
      'S-601: Anchor Bolt Plans',
      
      // Electrical (12 sheets)
      'E-001: Electrical Site Plan',
      'E-101: Lighting Plan - Zones 1-2',
      'E-102: Lighting Plan - Zones 3-5', 
      'E-201: Power Plan',
      'E-301: Single Line Diagram',
      'E-401: Panel Schedules - Lighting',
      'E-402: Panel Schedules - Power',
      'E-501: Grounding Plan',
      'E-601: Conduit & Wire Schedule',
      'E-701: Lighting Control System',
      'E-801: Equipment Connections',
      'E-901: Electrical Details',
      
      // Mechanical (10 sheets)
      'M-101: HVAC Plan',
      'M-201: Ductwork Plan & Schedules',
      'M-301: Piping Plan - Chilled Water',
      'M-302: Piping Plan - Heating Water', 
      'M-401: Equipment Schedules',
      'M-501: Equipment Details',
      'M-601: Control Diagrams',
      'M-701: Sequences of Operation',
      'M-801: Testing & Balancing',
      'M-901: Mechanical Details',
      
      // Plumbing (4 sheets)
      'P-101: Irrigation Plan',
      'P-201: Plumbing Plan',
      'P-301: Plumbing Isometric',
      'P-401: Plumbing Details',
      
      // Fire Protection (2 sheets)
      'FP-101: Fire Protection Plan',
      'FP-201: Fire Protection Details'
    ],
    purpose: 'Complete construction documents with all installation details'
  }
};

export interface DrawingSheet {
  number: string;
  title: string;
  scale?: string;
  discipline: string;
  content: SheetContent;
}

export interface SheetContent {
  titleBlock: boolean;
  northArrow?: boolean;
  legend?: boolean;
  schedules?: string[];
  details?: string[];
  notes?: string[];
  dimensions?: boolean;
  gridLines?: boolean;
}

// Drawing generation functions
export function getDrawingSet(type: DrawingType, level: string) {
  if (type === 'design') {
    switch (level) {
      case 'basic': return DESIGN_DRAWING_SETS.conceptual;
      case 'detailed': return DESIGN_DRAWING_SETS.schematic;
      case 'complete': return DESIGN_DRAWING_SETS.designDevelopment;
      default: return DESIGN_DRAWING_SETS.conceptual;
    }
  } else {
    switch (level) {
      case 'basic': return CONSTRUCTION_DRAWING_SETS.basic;
      case 'detailed': return CONSTRUCTION_DRAWING_SETS.detailed;
      case 'complete': return CONSTRUCTION_DRAWING_SETS.complete;
      default: return CONSTRUCTION_DRAWING_SETS.basic;
    }
  }
}

export function getSheetCount(type: DrawingType, level: string): number {
  const drawingSet = getDrawingSet(type, level);
  return drawingSet.sheets.length;
}

export function getDrawingPurpose(type: DrawingType, level: string): string {
  const drawingSet = getDrawingSet(type, level);
  return drawingSet.purpose;
}