/**
 * Aquaculture Piping System Design Module
 * Handles pipe routing, sizing, and hydraulic calculations
 */

import { logger } from '@/lib/logging/production-logger';

export interface PipeSegment {
  id: string;
  from: Point3D;
  to: Point3D;
  diameter: number; // mm
  material: PipeMaterial;
  type: PipeType;
  flowRate: number; // L/s
  velocity: number; // m/s
  headLoss: number; // m
  fittings: Fitting[];
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Fitting {
  type: 'elbow' | 'tee' | 'valve' | 'reducer' | 'union';
  position: Point3D;
  kValue: number; // resistance coefficient
}

export type PipeMaterial = 'PVC' | 'HDPE' | 'SS316' | 'PP' | 'CPVC';
export type PipeType = 'supply' | 'drain' | 'aeration' | 'recirculation' | 'waste' | 'emergency';

export interface PipeRoute {
  id: string;
  name: string;
  segments: PipeSegment[];
  totalLength: number;
  totalHeadLoss: number;
  pumpRequired: boolean;
  pumpHead?: number;
  material: PipeMaterial;
}

export interface HydraulicSystem {
  routes: PipeRoute[];
  pumps: Pump[];
  valves: Valve[];
  manifolds: Manifold[];
  totalFlowRate: number;
  systemPressure: number;
}

export interface Pump {
  id: string;
  location: Point3D;
  flowRate: number; // L/s
  head: number; // m
  power: number; // kW
  efficiency: number; // %
  type: 'centrifugal' | 'axial' | 'airlift' | 'peristaltic';
}

export interface Valve {
  id: string;
  location: Point3D;
  type: 'ball' | 'butterfly' | 'gate' | 'check' | 'control';
  diameter: number;
  position: number; // 0-100% open
  Cv: number; // flow coefficient
}

export interface Manifold {
  id: string;
  location: Point3D;
  inletDiameter: number;
  outlets: { diameter: number; flowRate: number }[];
  type: 'distribution' | 'collection';
}

// Pipe sizing standards (metric)
const STANDARD_PIPE_SIZES = {
  PVC: [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 250, 315, 400, 500],
  HDPE: [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 250, 315, 400, 500, 630],
  SS316: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400]
};

// Material properties
const MATERIAL_PROPERTIES = {
  PVC: { roughness: 0.0015, maxVelocity: 3.0, maxPressure: 10 }, // bar
  HDPE: { roughness: 0.007, maxVelocity: 3.0, maxPressure: 16 },
  SS316: { roughness: 0.045, maxVelocity: 4.0, maxPressure: 40 },
  PP: { roughness: 0.007, maxVelocity: 3.0, maxPressure: 10 },
  CPVC: { roughness: 0.0015, maxVelocity: 3.0, maxPressure: 15 }
};

// Fitting resistance coefficients (K values)
const FITTING_K_VALUES = {
  elbow: { '90deg': 0.9, '45deg': 0.4, 'long_radius': 0.6 },
  tee: { 'through': 0.6, 'branch': 1.8 },
  valve: { 'ball_open': 0.05, 'butterfly_open': 0.3, 'gate_open': 0.2 },
  reducer: { 'gradual': 0.3, 'sudden': 0.5 },
  union: 0.04
};

/**
 * Calculate pipe diameter based on flow rate and velocity constraints
 */
export function calculatePipeDiameter(
  flowRate: number, // L/s
  material: PipeMaterial,
  type: PipeType
): number {
  // Target velocities based on pipe type
  const targetVelocities = {
    supply: 1.5,      // m/s - moderate to prevent noise
    drain: 1.0,       // m/s - gravity flow
    aeration: 15.0,   // m/s - air lines can be faster
    recirculation: 2.0,
    waste: 1.5,
    emergency: 3.0    // can be faster for emergency overflow
  };

  const targetVelocity = Math.min(
    targetVelocities[type],
    MATERIAL_PROPERTIES[material].maxVelocity
  );

  // Calculate required diameter: Q = A * v = (π * d² / 4) * v
  const flowRateM3s = flowRate / 1000; // convert to m³/s
  const requiredDiameter = Math.sqrt((4 * flowRateM3s) / (Math.PI * targetVelocity)) * 1000; // mm

  // Round up to nearest standard size
  const standardSizes = STANDARD_PIPE_SIZES[material] || STANDARD_PIPE_SIZES.PVC;
  const selectedSize = standardSizes.find(size => size >= requiredDiameter) || standardSizes[standardSizes.length - 1];

  logger.info('api', `Pipe sizing: ${flowRate} L/s requires ${requiredDiameter.toFixed(0)}mm, selected ${selectedSize}mm ${material}`);

  return selectedSize;
}

/**
 * Calculate head loss using Darcy-Weisbach equation
 */
export function calculateHeadLoss(
  segment: PipeSegment,
  temperature: number = 20 // °C
): number {
  const length = calculateDistance(segment.from, segment.to);
  const diameter = segment.diameter / 1000; // convert to m
  const velocity = segment.velocity;
  const roughness = MATERIAL_PROPERTIES[segment.material].roughness / 1000; // convert to m

  // Calculate Reynolds number
  const kinematicViscosity = getWaterViscosity(temperature);
  const reynolds = (velocity * diameter) / kinematicViscosity;

  // Calculate friction factor using Swamee-Jain equation
  const frictionFactor = 0.25 / Math.pow(
    Math.log10(roughness / (3.7 * diameter) + 5.74 / Math.pow(reynolds, 0.9)),
    2
  );

  // Darcy-Weisbach equation: hf = f * (L/D) * (v²/2g)
  const frictionLoss = frictionFactor * (length / diameter) * (Math.pow(velocity, 2) / (2 * 9.81));

  // Add fitting losses
  const fittingLoss = segment.fittings.reduce((sum, fitting) => {
    return sum + fitting.kValue * (Math.pow(velocity, 2) / (2 * 9.81));
  }, 0);

  return frictionLoss + fittingLoss;
}

/**
 * Route pipes between points with collision avoidance
 */
export function routePipe(
  start: Point3D,
  end: Point3D,
  obstacles: { position: Point3D; radius: number }[],
  preferredHeight: number = 2.5 // m above ground
): Point3D[] {
  const route: Point3D[] = [start];

  // Simple routing algorithm - can be enhanced with A* pathfinding
  // For now, route at preferred height with vertical connections

  // Go up to routing height
  if (start.y < preferredHeight) {
    route.push({ x: start.x, y: preferredHeight, z: start.z });
  }

  // Check if direct path is clear
  const directPath = isPathClear(
    { x: start.x, y: preferredHeight, z: start.z },
    { x: end.x, y: preferredHeight, z: end.z },
    obstacles
  );

  if (directPath) {
    // Direct routing
    route.push({ x: end.x, y: preferredHeight, z: end.z });
  } else {
    // Route around obstacles (simplified - just go around in X-Z plane)
    const midPoint = {
      x: start.x,
      y: preferredHeight,
      z: end.z
    };
    route.push(midPoint);
    route.push({ x: end.x, y: preferredHeight, z: end.z });
  }

  // Go down to end point
  if (end.y < preferredHeight) {
    route.push(end);
  }

  return route;
}

/**
 * Design complete hydraulic system for aquaculture facility
 */
export function designHydraulicSystem(
  tanks: { id: string; position: Point3D; volume: number; flowRequirement: number }[],
  filters: { id: string; position: Point3D; type: string; capacity: number }[],
  constraints: {
    maxVelocity?: number;
    preferredMaterial?: PipeMaterial;
    redundancy?: boolean;
  } = {}
): HydraulicSystem {
  const routes: PipeRoute[] = [];
  const pumps: Pump[] = [];
  const valves: Valve[] = [];
  const manifolds: Manifold[] = [];

  const material = constraints.preferredMaterial || 'PVC';

  // Create main supply manifold
  const supplyManifold: Manifold = {
    id: 'main-supply',
    location: { x: 0, y: 3, z: -5 },
    inletDiameter: 200,
    outlets: tanks.map(tank => ({
      diameter: calculatePipeDiameter(tank.flowRequirement, material, 'supply'),
      flowRate: tank.flowRequirement
    })),
    type: 'distribution'
  };
  manifolds.push(supplyManifold);

  // Create main collection manifold
  const drainManifold: Manifold = {
    id: 'main-drain',
    location: { x: 0, y: 0.5, z: -5 },
    inletDiameter: 250,
    outlets: tanks.map(tank => ({
      diameter: calculatePipeDiameter(tank.flowRequirement, material, 'drain'),
      flowRate: tank.flowRequirement
    })),
    type: 'collection'
  };
  manifolds.push(drainManifold);

  // Route pipes from tanks to manifolds
  tanks.forEach((tank, index) => {
    // Supply route
    const supplyRoute = createPipeRoute(
      `supply-${tank.id}`,
      supplyManifold.location,
      tank.position,
      tank.flowRequirement,
      material,
      'supply'
    );
    routes.push(supplyRoute);

    // Drain route
    const drainRoute = createPipeRoute(
      `drain-${tank.id}`,
      tank.position,
      drainManifold.location,
      tank.flowRequirement,
      material,
      'drain'
    );
    routes.push(drainRoute);

    // Add control valve for each tank
    valves.push({
      id: `valve-${tank.id}`,
      location: tank.position,
      type: 'butterfly',
      diameter: supplyRoute.segments[0].diameter,
      position: 100, // fully open
      Cv: calculateValveCv(tank.flowRequirement, 0.5) // 0.5 bar pressure drop
    });
  });

  // Calculate total system flow
  const totalFlowRate = tanks.reduce((sum, tank) => sum + tank.flowRequirement, 0);

  // Size main pump
  const totalHeadLoss = Math.max(...routes.map(r => r.totalHeadLoss));
  const pumpHead = totalHeadLoss + 5; // add 5m safety margin

  pumps.push({
    id: 'main-pump',
    location: { x: -5, y: 0, z: -10 },
    flowRate: totalFlowRate,
    head: pumpHead,
    power: calculatePumpPower(totalFlowRate, pumpHead, 0.75),
    efficiency: 75,
    type: 'centrifugal'
  });

  // Add redundant pump if required
  if (constraints.redundancy) {
    pumps.push({
      id: 'backup-pump',
      location: { x: -3, y: 0, z: -10 },
      flowRate: totalFlowRate,
      head: pumpHead,
      power: calculatePumpPower(totalFlowRate, pumpHead, 0.75),
      efficiency: 75,
      type: 'centrifugal'
    });
  }

  return {
    routes,
    pumps,
    valves,
    manifolds,
    totalFlowRate,
    systemPressure: pumpHead * 0.0981 // convert m to bar
  };
}

// Helper functions

function calculateDistance(from: Point3D, to: Point3D): number {
  return Math.sqrt(
    Math.pow(to.x - from.x, 2) +
    Math.pow(to.y - from.y, 2) +
    Math.pow(to.z - from.z, 2)
  );
}

function getWaterViscosity(temperature: number): number {
  // Kinematic viscosity of water (m²/s)
  // Simplified formula for 0-40°C
  return 1.787e-6 / (1 + 0.0337 * temperature + 0.000221 * Math.pow(temperature, 2));
}

function isPathClear(
  start: Point3D,
  end: Point3D,
  obstacles: { position: Point3D; radius: number }[]
): boolean {
  // Check if line segment intersects any obstacles
  for (const obstacle of obstacles) {
    const distance = pointToLineDistance(start, end, obstacle.position);
    if (distance < obstacle.radius + 0.5) { // 0.5m clearance
      return false;
    }
  }
  return true;
}

function pointToLineDistance(lineStart: Point3D, lineEnd: Point3D, point: Point3D): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = point.z - lineStart.z;
  const D = lineEnd.x - lineStart.x;
  const E = lineEnd.y - lineStart.y;
  const F = lineEnd.z - lineStart.z;

  const dot = A * D + B * E + C * F;
  const lenSq = D * D + E * E + F * F;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy, zz;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
    zz = lineStart.z;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
    zz = lineEnd.z;
  } else {
    xx = lineStart.x + param * D;
    yy = lineStart.y + param * E;
    zz = lineStart.z + param * F;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  const dz = point.z - zz;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function createPipeRoute(
  id: string,
  start: Point3D,
  end: Point3D,
  flowRate: number,
  material: PipeMaterial,
  type: PipeType
): PipeRoute {
  const diameter = calculatePipeDiameter(flowRate, material, type);
  const area = Math.PI * Math.pow(diameter / 2000, 2); // m²
  const velocity = (flowRate / 1000) / area; // m/s

  const segment: PipeSegment = {
    id: `${id}-segment`,
    from: start,
    to: end,
    diameter,
    material,
    type,
    flowRate,
    velocity,
    headLoss: 0,
    fittings: [
      { type: 'elbow', position: start, kValue: FITTING_K_VALUES.elbow['90deg'] },
      { type: 'elbow', position: end, kValue: FITTING_K_VALUES.elbow['90deg'] }
    ]
  };

  segment.headLoss = calculateHeadLoss(segment);

  return {
    id,
    name: `${type} route`,
    segments: [segment],
    totalLength: calculateDistance(start, end),
    totalHeadLoss: segment.headLoss,
    pumpRequired: type === 'supply' || segment.headLoss > 2,
    material
  };
}

function calculateValveCv(flowRate: number, pressureDrop: number): number {
  // Cv = Q * sqrt(SG / ΔP)
  // Q in GPM, ΔP in PSI
  const flowGPM = flowRate * 15.85; // L/s to GPM
  const pressurePSI = pressureDrop * 14.504; // bar to PSI
  return flowGPM * Math.sqrt(1 / pressurePSI);
}

function calculatePumpPower(flowRate: number, head: number, efficiency: number): number {
  // P = (ρ * g * Q * H) / (η * 1000)
  // P in kW, Q in L/s, H in m, η as decimal
  const density = 1000; // kg/m³
  const gravity = 9.81; // m/s²
  const flowM3s = flowRate / 1000; // convert to m³/s
  
  return (density * gravity * flowM3s * head) / (efficiency * 1000);
}

/**
 * Export piping design to CAD format
 */
export function exportToCAD(system: HydraulicSystem): string {
  // Generate DXF or other CAD format
  // This is a simplified example - real implementation would use a CAD library
  
  let dxf = `0\nSECTION\n2\nENTITIES\n`;
  
  system.routes.forEach(route => {
    route.segments.forEach(segment => {
      // Add LINE entity for each pipe segment
      dxf += `0\nLINE\n8\nPIPES\n`; // Layer
      dxf += `10\n${segment.from.x}\n20\n${segment.from.y}\n30\n${segment.from.z}\n`; // Start point
      dxf += `11\n${segment.to.x}\n21\n${segment.to.y}\n31\n${segment.to.z}\n`; // End point
    });
  });
  
  dxf += `0\nENDSEC\n0\nEOF\n`;
  
  return dxf;
}