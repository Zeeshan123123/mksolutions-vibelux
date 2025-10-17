/**
 * BLE Fixture Export Module
 * Exports fixture positions for Bluetooth Low Energy mesh positioning systems
 */

import { RoomObject } from '@/types/room';

export interface BLEFixtureExport {
  version: string;
  exportDate: string;
  facility: {
    width: number;
    length: number;
    height: number;
    unit: 'feet' | 'meters';
  };
  fixtures: BLEFixture[];
  zones: BLEZone[];
  meshConfig?: {
    beaconInterval?: number;
    txPower?: number;
    meshProtocol?: string;
  };
}

export interface BLEFixture {
  id: string;
  bleId?: string; // Future: Actual BLE device ID
  position: {
    x: number;
    y: number;
    z: number;
  };
  positionMeters?: { // Converted to meters for BLE
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  model: string;
  manufacturer?: string;
  enabled: boolean;
  zoneId?: string;
  signalCharacteristics?: {
    estimatedRSSI?: number; // At 1 meter
    antennaGain?: number;
    transmitPower?: number;
  };
}

export interface BLEZone {
  id: string;
  name: string;
  boundaries: Array<{ x: number; y: number }>;
  fixtureIds: string[];
  centerPoint: { x: number; y: number };
}

const FEET_TO_METERS = 0.3048;

// Simple wrapper function for backwards compatibility
export function exportFixturesToBLE(fixtures: any[], room: any, zones?: any[]): BLEFixtureExport {
  return exportFixturesForBLE(room, fixtures, zones);
}

export function exportFixturesForBLE(
  room: { width: number; length: number; height: number },
  objects: RoomObject[],
  zones: any[] = []
): BLEFixtureExport {
  const fixtures = objects.filter(obj => obj.type === 'fixture');
  
  const bleFixtures: BLEFixture[] = fixtures.map(fixture => {
    const f = fixture as any; // Type assertion for fixture-specific properties
    
    return {
      id: f.id,
      bleId: undefined, // To be populated when BLE devices are paired
      position: {
        x: f.x,
        y: f.y,
        z: f.z
      },
      positionMeters: {
        x: f.x * FEET_TO_METERS,
        y: f.y * FEET_TO_METERS,
        z: f.z * FEET_TO_METERS
      },
      rotation: f.rotation || 0,
      dimensions: {
        width: f.width || 2,
        length: f.length || 4,
        height: f.height || 0.5
      },
      model: f.model?.name || 'Unknown',
      manufacturer: f.model?.manufacturer,
      enabled: f.enabled !== false,
      zoneId: f.group || undefined,
      signalCharacteristics: {
        estimatedRSSI: -59, // Typical RSSI at 1 meter
        antennaGain: 2.1, // dBi
        transmitPower: 0 // dBm
      }
    };
  });

  const bleZones: BLEZone[] = zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    boundaries: zone.boundaries || [],
    fixtureIds: zone.fixtureIds || [],
    centerPoint: calculateZoneCenter(zone.boundaries || [])
  }));

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    facility: {
      width: room.width,
      length: room.length,
      height: room.height,
      unit: 'feet'
    },
    fixtures: bleFixtures,
    zones: bleZones,
    meshConfig: {
      beaconInterval: 100, // ms
      txPower: 0, // dBm
      meshProtocol: 'bluetooth-mesh-v1.0'
    }
  };
}

export function downloadBLEFixtureExport(
  room: { width: number; length: number; height: number },
  objects: RoomObject[],
  zones: any[] = [],
  filename?: string
): void {
  const exportData = exportFixturesForBLE(room, objects, zones);
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `ble-fixtures-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateBLEMeshTopology(fixtures: BLEFixture[]): any {
  // Calculate optimal mesh connections based on distance
  const topology = {
    nodes: fixtures.map(f => ({
      id: f.id,
      position: f.positionMeters,
      neighbors: [] as string[]
    })),
    edges: [] as Array<{ source: string; target: string; distance: number }>
  };

  // Simple mesh generation: connect fixtures within range
  const MAX_BLE_RANGE_METERS = 30; // Typical BLE range
  
  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      const f1 = fixtures[i];
      const f2 = fixtures[j];
      
      if (f1.positionMeters && f2.positionMeters) {
        const distance = calculateDistance3D(
          f1.positionMeters,
          f2.positionMeters
        );
        
        if (distance <= MAX_BLE_RANGE_METERS) {
          topology.nodes[i].neighbors.push(f2.id);
          topology.nodes[j].neighbors.push(f1.id);
          topology.edges.push({
            source: f1.id,
            target: f2.id,
            distance: parseFloat(distance.toFixed(2))
          });
        }
      }
    }
  }

  return topology;
}

function calculateZoneCenter(boundaries: Array<{ x: number; y: number }>): { x: number; y: number } {
  if (boundaries.length === 0) return { x: 0, y: 0 };
  
  const sum = boundaries.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y
    }),
    { x: 0, y: 0 }
  );
  
  return {
    x: sum.x / boundaries.length,
    y: sum.y / boundaries.length
  };
}

function calculateDistance3D(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}