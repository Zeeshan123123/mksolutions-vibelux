/**
 * Shared CAD System Types
 * Extracted to break circular dependencies
 */

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FrameMaterial {
  id: string;
  name: string;
  type: 'aluminum' | 'steel' | 'wood' | 'composite';
  density: number; // kg/m³
  strength: number; // MPa
  cost: number; // $/kg
  thermalConductivity: number; // W/m·K
  color: string;
}

export interface Component {
  id: string;
  type: string;
  geometry: any;
  material: FrameMaterial;
  position: Point3D;
  rotation: Point3D;
  scale: Point3D;
  connections: string[];
}

export interface GreenhouseModel {
  id: string;
  name: string;
  components: Component[];
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  materials: FrameMaterial[];
  metadata: {
    created: Date;
    modified: Date;
    version: string;
  };
}