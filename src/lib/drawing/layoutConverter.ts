/**
 * Convert generated layouts to cultivation designer format
 */

import { CultivationLayout } from './types';

export interface DesignerRoom {
  id: string;
  name: string;
  width: number;
  length: number;
  height: number;
  components: DesignerComponent[];
}

export interface DesignerComponent {
  id: string;
  type: 'table' | 'light' | 'hvac' | 'wall' | 'door';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  metadata: Record<string, any>;
}

/**
 * Convert CultivationLayout to DesignerRoom format
 */
export function layoutToDesignerFormat(layout: CultivationLayout): DesignerRoom {
  const components: DesignerComponent[] = [];

  // Convert tables
  layout.tables.forEach(table => {
    components.push({
      id: table.id,
      type: 'table',
      position: {
        x: table.position.x + table.dimensions.width / 2,
        y: table.position.z + table.dimensions.height / 2,
        z: table.position.y + table.dimensions.depth / 2
      },
      rotation: { x: 0, y: table.rotation || 0, z: 0 },
      scale: {
        x: table.dimensions.width,
        y: table.dimensions.height,
        z: table.dimensions.depth
      },
      metadata: {
        tableType: table.type,
        capacity: table.capacity,
        strain: table.strain
      }
    });
  });

  // Convert lights
  layout.lights.forEach(light => {
    components.push({
      id: light.id,
      type: 'light',
      position: {
        x: light.position.x,
        y: light.position.z,
        z: light.position.y
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 0.5, z: 2 }, // Standard light fixture size
      metadata: {
        fixtureType: light.fixture.type,
        wattage: light.fixture.wattage,
        ppfd: light.fixture.ppfd,
        coverage: light.fixture.coverage
      }
    });
  });

  // Convert HVAC
  layout.hvac.forEach(unit => {
    const scale = getHVACScale(unit.type);
    components.push({
      id: unit.id,
      type: 'hvac',
      position: {
        x: unit.position.x,
        y: unit.position.z,
        z: unit.position.y
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale,
      metadata: {
        hvacType: unit.type,
        capacity: unit.capacity,
        coverage: unit.coverage
      }
    });
  });

  // Add walls based on room dimensions
  const wallHeight = 10;
  const wallThickness = 0.5;
  
  // North wall
  components.push({
    id: 'wall_north',
    type: 'wall',
    position: {
      x: layout.room.dimensions.width / 2,
      y: wallHeight / 2,
      z: 0
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: {
      x: layout.room.dimensions.width,
      y: wallHeight,
      z: wallThickness
    },
    metadata: { wallType: 'exterior' }
  });

  // South wall
  components.push({
    id: 'wall_south',
    type: 'wall',
    position: {
      x: layout.room.dimensions.width / 2,
      y: wallHeight / 2,
      z: layout.room.dimensions.height
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: {
      x: layout.room.dimensions.width,
      y: wallHeight,
      z: wallThickness
    },
    metadata: { wallType: 'exterior' }
  });

  // East wall
  components.push({
    id: 'wall_east',
    type: 'wall',
    position: {
      x: layout.room.dimensions.width,
      y: wallHeight / 2,
      z: layout.room.dimensions.height / 2
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: {
      x: wallThickness,
      y: wallHeight,
      z: layout.room.dimensions.height
    },
    metadata: { wallType: 'exterior' }
  });

  // West wall
  components.push({
    id: 'wall_west',
    type: 'wall',
    position: {
      x: 0,
      y: wallHeight / 2,
      z: layout.room.dimensions.height / 2
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: {
      x: wallThickness,
      y: wallHeight,
      z: layout.room.dimensions.height
    },
    metadata: { wallType: 'exterior' }
  });

  // Add doors
  layout.room.doors.forEach(door => {
    components.push({
      id: door.id,
      type: 'door',
      position: {
        x: door.position.x,
        y: door.height / 2,
        z: door.position.y
      },
      rotation: { x: 0, y: getOrientationRotation(door.orientation), z: 0 },
      scale: {
        x: door.width,
        y: door.height,
        z: 0.2
      },
      metadata: {
        doorType: door.type,
        orientation: door.orientation
      }
    });
  });

  return {
    id: layout.room.id,
    name: layout.room.name || 'Imported Room',
    width: layout.room.dimensions.width,
    length: layout.room.dimensions.height,
    height: wallHeight,
    components
  };
}

/**
 * Get HVAC unit scale based on type
 */
function getHVACScale(type: string): { x: number; y: number; z: number } {
  switch (type) {
    case 'ac':
      return { x: 3, y: 3, z: 2 };
    case 'dehumidifier':
      return { x: 1.5, y: 2, z: 1.5 };
    case 'fan':
      return { x: 2, y: 2, z: 0.5 };
    case 'exhaust':
      return { x: 1, y: 1, z: 1 };
    default:
      return { x: 1, y: 1, z: 1 };
  }
}

/**
 * Get rotation for door orientation
 */
function getOrientationRotation(orientation: string): number {
  switch (orientation) {
    case 'north': return 0;
    case 'east': return 90;
    case 'south': return 180;
    case 'west': return 270;
    default: return 0;
  }
}

/**
 * Export layout to JSON for sharing
 */
export function exportLayoutToJSON(layout: CultivationLayout): string {
  const designerRoom = layoutToDesignerFormat(layout);
  return JSON.stringify(designerRoom, null, 2);
}

/**
 * Create shareable URL with layout data
 */
export function createDesignerURL(layout: CultivationLayout): string {
  const designerRoom = layoutToDesignerFormat(layout);
  const encodedData = btoa(JSON.stringify(designerRoom));
  return `/cultivation-designer?import=${encodedData}`;
}