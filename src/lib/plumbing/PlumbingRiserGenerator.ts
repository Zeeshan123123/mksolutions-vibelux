export interface PlumbingRiserNode {
  id: string;
  type: 'supply' | 'return' | 'fixture' | 'pump' | 'filter' | 'tank';
  label: string;
  elevationFt: number;
  flowGpm?: number;
}

export interface PlumbingRiserConnection {
  from: string;
  to: string;
  pipeSizeIn: number; // inches
}

export interface PlumbingScheduleItem {
  tag: string;
  description: string;
  size: string;
  qty: number;
  notes?: string;
}

export interface PlumbingRiserResult {
  nodes: PlumbingRiserNode[];
  connections: PlumbingRiserConnection[];
  schedule: PlumbingScheduleItem[];
}

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

export function generatePlumbingRiser(params: {
  room: RoomDimensions;
  irrigationZones?: number;
  designFlowGpm?: number;
}): PlumbingRiserResult {
  const zones = Math.max(1, params.irrigationZones || 4);
  const designFlow = Math.max(5, params.designFlowGpm || 20);

  const nodes: PlumbingRiserNode[] = [
    { id: 'src', type: 'tank', label: 'Nutrient Tank', elevationFt: 0, flowGpm: designFlow },
    { id: 'pump', type: 'pump', label: 'Irrigation Pump', elevationFt: 0.5, flowGpm: designFlow },
    { id: 'filter', type: 'filter', label: 'Inline Filter', elevationFt: 1, flowGpm: designFlow },
  ];

  const connections: PlumbingRiserConnection[] = [
    { from: 'src', to: 'pump', pipeSizeIn: 1.5 },
    { from: 'pump', to: 'filter', pipeSizeIn: 1.25 },
  ];

  for (let z = 1; z <= zones; z++) {
    const zoneId = `zone_${z}`;
    nodes.push({ id: zoneId, type: 'fixture', label: `Irrigation Zone ${z}`, elevationFt: 2, flowGpm: designFlow / zones });
    connections.push({ from: 'filter', to: zoneId, pipeSizeIn: 1 });
  }

  const schedule: PlumbingScheduleItem[] = [
    { tag: 'P-001', description: 'Irrigation Pump, VFD, 230V', size: `${designFlow} GPM`, qty: 1 },
    { tag: 'F-001', description: 'Inline Filter, 100 mesh', size: '1.25"', qty: 1 },
    { tag: 'TK-001', description: 'Nutrient Tank, HDPE', size: '100 gal', qty: 1 },
    { tag: 'PIP', description: 'Supply Piping, PVC SCH40', size: '1.25" main, 1" branch', qty: 1, notes: `${zones} zones` },
  ];

  return { nodes, connections, schedule };
}