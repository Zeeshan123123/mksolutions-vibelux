/**
 * 3D Geometry Engine
 * Professional-grade 3D modeling engine for greenhouse CAD system
 */

import * as THREE from 'three';
import { BufferGeometry, Vector3, Matrix4, Mesh, Group } from 'three';
import { GreenhouseModel, Component, Point3D, FrameMaterial } from './types';

export interface GeometryPrimitive {
  type: 'box' | 'cylinder' | 'sphere' | 'plane' | 'extrude' | 'revolve' | 'sweep';
  parameters: any;
  transform?: Matrix4;
}

export interface SolidOperation {
  type: 'union' | 'subtract' | 'intersect';
  operands: GeometryPrimitive[];
}

export interface ProfileGeometry {
  shape: THREE.Shape;
  holes?: THREE.Path[];
  depth?: number;
  curve?: THREE.Curve<Vector3>;
}

export interface StructuralProfile {
  name: string;
  type: 'I_beam' | 'tube' | 'angle' | 'channel' | 'plate' | 'round_bar';
  dimensions: {
    width: number;
    height: number;
    thickness: number;
    radius?: number;
  };
  properties: {
    area: number;
    momentOfInertiaX: number;
    momentOfInertiaY: number;
    sectionModulusX: number;
    sectionModulusY: number;
    weightPerFoot: number;
  };
}

class GeometryEngine {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private geometryCache: Map<string, BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();
  private profiles: Map<string, StructuralProfile> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeProfiles();
    this.initializeMaterials();
  }

  /**
   * Initialize standard structural profiles
   */
  private initializeProfiles(): void {
    // Standard tube sizes
    const tubeSizes = [
      { size: '2x2x0.125', w: 2, h: 2, t: 0.125 },
      { size: '2x4x0.125', w: 2, h: 4, t: 0.125 },
      { size: '4x4x0.125', w: 4, h: 4, t: 0.125 },
      { size: '6x6x0.125', w: 6, h: 6, t: 0.125 },
      { size: '2x2x0.1875', w: 2, h: 2, t: 0.1875 },
      { size: '4x4x0.1875', w: 4, h: 4, t: 0.1875 }
    ];

    tubeSizes.forEach(tube => {
      const profile: StructuralProfile = {
        name: `Steel Tube ${tube.size}`,
        type: 'tube',
        dimensions: {
          width: tube.w,
          height: tube.h,
          thickness: tube.t
        },
        properties: this.calculateTubeProperties(tube.w, tube.h, tube.t)
      };
      this.profiles.set(tube.size, profile);
    });

    // Standard I-beam sizes
    const beamSizes = [
      { size: 'W8x10', d: 7.89, bf: 3.94, tf: 0.205, tw: 0.170 },
      { size: 'W10x12', d: 9.87, bf: 3.96, tf: 0.210, tw: 0.190 },
      { size: 'W12x14', d: 11.91, bf: 3.97, tf: 0.225, tw: 0.200 }
    ];

    beamSizes.forEach(beam => {
      const profile: StructuralProfile = {
        name: `Steel I-Beam ${beam.size}`,
        type: 'I_beam',
        dimensions: {
          width: beam.bf,
          height: beam.d,
          thickness: beam.tf
        },
        properties: this.calculateIBeamProperties(beam.d, beam.bf, beam.tf, beam.tw)
      };
      this.profiles.set(beam.size, profile);
    });
  }

  /**
   * Initialize standard materials
   */
  private initializeMaterials(): void {
    // Steel material
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2,
      name: 'steel'
    });
    this.materialCache.set('steel', steelMaterial);

    // Aluminum material
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1,
      name: 'aluminum'
    });
    this.materialCache.set('aluminum', aluminumMaterial);

    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 0.0,
      metalness: 0.0,
      transmission: 0.9,
      name: 'glass'
    });
    this.materialCache.set('glass', glassMaterial);

    // Polycarbonate material
    const polycarbonateMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0f0f0,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.8,
      name: 'polycarbonate'
    });
    this.materialCache.set('polycarbonate', polycarbonateMaterial);

    // Concrete material
    const concreteMaterial = new THREE.MeshLambertMaterial({
      color: 0x666666,
      name: 'concrete'
    });
    this.materialCache.set('concrete', concreteMaterial);
  }

  /**
   * Create structural frame post
   */
  createFramePost(params: {
    position: Point3D;
    height: number;
    profile: string;
    material: FrameMaterial;
  }): THREE.Object3D {
    const { position, height, profile, material } = params;
    const structuralProfile = this.profiles.get(profile) || this.profiles.get('4x4x0.125')!;
    
    // Create tube geometry
    const geometry = this.createTubeGeometry(
      structuralProfile.dimensions.width,
      structuralProfile.dimensions.height,
      structuralProfile.dimensions.thickness,
      height
    );

    // Get material
    const meshMaterial = this.getMaterial(material);
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.position.set(position.x, position.y, position.z);
    mesh.name = 'frame_post';
    
    return mesh;
  }

  /**
   * Create structural purlin
   */
  createPurlin(params: {
    start: Point3D;
    end: Point3D;
    profile: string;
    material: FrameMaterial;
  }): THREE.Object3D {
    const { start, end, profile, material } = params;
    const structuralProfile = this.profiles.get(profile) || this.profiles.get('2x4x0.125')!;
    
    // Calculate length and orientation
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2) + 
      Math.pow(end.z - start.z, 2)
    );
    
    // Create tube geometry
    const geometry = this.createTubeGeometry(
      structuralProfile.dimensions.width,
      structuralProfile.dimensions.height,
      structuralProfile.dimensions.thickness,
      length
    );

    // Get material
    const meshMaterial = this.getMaterial(material);
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    
    // Position and orient
    const midpoint = new Vector3(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      (start.z + end.z) / 2
    );
    
    mesh.position.copy(midpoint);
    
    // Orient along the line
    const direction = new Vector3(
      end.x - start.x,
      end.y - start.y,
      end.z - start.z
    ).normalize();
    
    mesh.lookAt(new Vector3().addVectors(mesh.position, direction));
    mesh.rotateX(Math.PI / 2); // Align with local coordinate system
    
    mesh.name = 'purlin';
    
    return mesh;
  }

  /**
   * Create glazing panel
   */
  createGlazingPanel(params: {
    corners: Point3D[];
    thickness: number;
    material: 'glass' | 'polycarbonate' | 'acrylic';
  }): THREE.Object3D {
    const { corners, thickness, material } = params;
    
    // Create shape from corners
    const shape = new THREE.Shape();
    shape.moveTo(corners[0].x, corners[0].y);
    
    for (let i = 1; i < corners.length; i++) {
      shape.lineTo(corners[i].x, corners[i].y);
    }
    
    // Create extruded geometry
    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Get material
    const meshMaterial = this.getMaterial(material);
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.position.z = corners[0].z;
    mesh.name = 'glazing_panel';
    
    return mesh;
  }

  /**
   * Create foundation slab
   */
  createFoundationSlab(params: {
    outline: Point3D[];
    thickness: number;
    depth: number;
  }): THREE.Object3D {
    const { outline, thickness, depth } = params;
    
    // Create shape from outline
    const shape = new THREE.Shape();
    shape.moveTo(outline[0].x, outline[0].y);
    
    for (let i = 1; i < outline.length; i++) {
      shape.lineTo(outline[i].x, outline[i].y);
    }
    
    // Create extruded geometry
    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Get concrete material
    const material = this.getMaterial('concrete');
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -depth;
    mesh.name = 'foundation_slab';
    
    return mesh;
  }

  /**
   * Create door frame
   */
  createDoorFrame(params: {
    width: number;
    height: number;
    thickness: number;
    position: Point3D;
    material: FrameMaterial;
  }): THREE.Object3D {
    const { width, height, thickness, position, material } = params;
    
    const group = new THREE.Group();
    
    // Create door frame profile
    const frameProfile = this.profiles.get('2x2x0.125')!;
    const profileSize = frameProfile.dimensions.width;
    
    // Left jamb
    const leftJamb = this.createFramePost({
      position: { x: position.x, y: position.y, z: position.z },
      height: height,
      profile: '2x2x0.125',
      material
    });
    group.add(leftJamb);
    
    // Right jamb
    const rightJamb = this.createFramePost({
      position: { x: position.x + width, y: position.y, z: position.z },
      height: height,
      profile: '2x2x0.125',
      material
    });
    group.add(rightJamb);
    
    // Header
    const header = this.createPurlin({
      start: { x: position.x, y: position.y, z: position.z + height },
      end: { x: position.x + width, y: position.y, z: position.z + height },
      profile: '2x4x0.125',
      material
    });
    group.add(header);
    
    // Door panel (simple rectangle)
    const doorGeometry = new THREE.PlaneGeometry(width - profileSize, height - profileSize);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const doorPanel = new THREE.Mesh(doorGeometry, doorMaterial);
    doorPanel.position.set(
      position.x + width / 2,
      position.y + thickness / 2,
      position.z + height / 2
    );
    group.add(doorPanel);
    
    group.name = 'door_frame';
    return group;
  }

  /**
   * Create ventilation vent
   */
  createVentilationVent(params: {
    width: number;
    height: number;
    position: Point3D;
    type: 'roof' | 'side' | 'exhaust';
  }): THREE.Object3D {
    const { width, height, position, type } = params;
    
    const group = new THREE.Group();
    
    // Create vent frame
    const frameGeometry = new THREE.BoxGeometry(width, 0.1, height);
    const frameMaterial = this.getMaterial('aluminum');
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(position.x, position.y, position.z);
    group.add(frame);
    
    // Create louvers for side vents
    if (type === 'side') {
      const louverCount = Math.floor(height / 0.5);
      const louverSpacing = height / louverCount;
      
      for (let i = 0; i < louverCount; i++) {
        const louverGeometry = new THREE.BoxGeometry(width * 0.8, 0.05, 0.3);
        const louver = new THREE.Mesh(louverGeometry, frameMaterial);
        louver.position.set(
          position.x,
          position.y + 0.1,
          position.z - height / 2 + i * louverSpacing
        );
        louver.rotateX(Math.PI / 6); // Angle louvers
        group.add(louver);
      }
    }
    
    group.name = `${type}_vent`;
    return group;
  }

  /**
   * Create complex geometry using boolean operations
   */
  createComplexGeometry(operations: SolidOperation[]): BufferGeometry {
    // This would integrate with a CSG library like three-csg-ts
    // For now, return a simple box as placeholder
    return new THREE.BoxGeometry(1, 1, 1);
  }

  /**
   * Create swept geometry along a path
   */
  createSweptGeometry(profile: ProfileGeometry, path: THREE.Curve<Vector3>): BufferGeometry {
    const { shape } = profile;
    
    // Create tube geometry along path
    const tubeGeometry = new THREE.TubeGeometry(path, 20, 0.1, 8, false);
    
    // For more complex profiles, we'd use ExtrudeGeometry with custom path
    const extrudeSettings = {
      steps: 20,
      bevelEnabled: false,
      extrudePath: path
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  /**
   * Create revolved geometry
   */
  createRevolvedGeometry(profile: THREE.Shape, axis: Vector3, angle: number): BufferGeometry {
    const latheGeometry = new THREE.LatheGeometry(
      profile.getPoints(20),
      32,
      0,
      angle
    );
    
    return latheGeometry;
  }

  /**
   * Calculate mesh properties
   */
  calculateMeshProperties(mesh: THREE.Mesh): {
    volume: number;
    surfaceArea: number;
    centerOfMass: Vector3;
    boundingBox: THREE.Box3;
  } {
    const geometry = mesh.geometry;
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    
    // Calculate volume (approximation)
    const size = new Vector3();
    boundingBox.getSize(size);
    const volume = size.x * size.y * size.z;
    
    // Calculate surface area (approximation)
    const surfaceArea = 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
    
    // Calculate center of mass
    const centerOfMass = new Vector3();
    boundingBox.getCenter(centerOfMass);
    
    return {
      volume,
      surfaceArea,
      centerOfMass,
      boundingBox
    };
  }

  /**
   * Optimize geometry for performance
   */
  optimizeGeometry(geometry: BufferGeometry): BufferGeometry {
    // Merge vertices
    geometry.mergeVertices();
    
    // Compute vertex normals
    geometry.computeVertexNormals();
    
    // Compute bounding box and sphere
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
  }

  // Helper methods

  private createTubeGeometry(
    width: number,
    height: number,
    thickness: number,
    length: number
  ): BufferGeometry {
    const cacheKey = `tube_${width}_${height}_${thickness}_${length}`;
    
    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!;
    }
    
    // Create hollow rectangular tube
    const outerShape = new THREE.Shape();
    outerShape.moveTo(-width / 2, -height / 2);
    outerShape.lineTo(width / 2, -height / 2);
    outerShape.lineTo(width / 2, height / 2);
    outerShape.lineTo(-width / 2, height / 2);
    outerShape.lineTo(-width / 2, -height / 2);
    
    // Create inner hole
    const innerShape = new THREE.Path();
    const innerWidth = width - 2 * thickness;
    const innerHeight = height - 2 * thickness;
    
    innerShape.moveTo(-innerWidth / 2, -innerHeight / 2);
    innerShape.lineTo(innerWidth / 2, -innerHeight / 2);
    innerShape.lineTo(innerWidth / 2, innerHeight / 2);
    innerShape.lineTo(-innerWidth / 2, innerHeight / 2);
    innerShape.lineTo(-innerWidth / 2, -innerHeight / 2);
    
    outerShape.holes.push(innerShape);
    
    const extrudeSettings = {
      depth: length,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
    geometry.rotateX(Math.PI / 2);
    
    this.geometryCache.set(cacheKey, geometry);
    return geometry;
  }

  private getMaterial(materialName: string): THREE.Material {
    return this.materialCache.get(materialName) || this.materialCache.get('steel')!;
  }

  private calculateTubeProperties(width: number, height: number, thickness: number): any {
    const outerArea = width * height;
    const innerArea = (width - 2 * thickness) * (height - 2 * thickness);
    const area = outerArea - innerArea;
    
    // Simplified moment of inertia calculations
    const Ix = (width * Math.pow(height, 3) - (width - 2 * thickness) * Math.pow(height - 2 * thickness, 3)) / 12;
    const Iy = (height * Math.pow(width, 3) - (height - 2 * thickness) * Math.pow(width - 2 * thickness, 3)) / 12;
    
    return {
      area,
      momentOfInertiaX: Ix,
      momentOfInertiaY: Iy,
      sectionModulusX: Ix / (height / 2),
      sectionModulusY: Iy / (width / 2),
      weightPerFoot: area * 0.284 // Steel density factor
    };
  }

  private calculateIBeamProperties(depth: number, flangeWidth: number, flangeThickness: number, webThickness: number): any {
    const area = 2 * flangeWidth * flangeThickness + (depth - 2 * flangeThickness) * webThickness;
    
    // Simplified I-beam moment of inertia
    const Ix = (flangeWidth * Math.pow(depth, 3) - (flangeWidth - webThickness) * Math.pow(depth - 2 * flangeThickness, 3)) / 12;
    const Iy = (2 * flangeThickness * Math.pow(flangeWidth, 3) + (depth - 2 * flangeThickness) * Math.pow(webThickness, 3)) / 12;
    
    return {
      area,
      momentOfInertiaX: Ix,
      momentOfInertiaY: Iy,
      sectionModulusX: Ix / (depth / 2),
      sectionModulusY: Iy / (flangeWidth / 2),
      weightPerFoot: area * 0.284
    };
  }

  /**
   * Export geometry to various formats
   */
  exportGeometry(mesh: THREE.Mesh, format: 'obj' | 'stl' | 'gltf'): string | ArrayBuffer {
    switch (format) {
      case 'obj':
        return this.exportToOBJ(mesh);
      case 'stl':
        return this.exportToSTL(mesh);
      case 'gltf':
        return this.exportToGLTF(mesh);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToOBJ(mesh: THREE.Mesh): string {
    // Basic OBJ export implementation
    const geometry = mesh.geometry;
    const vertices = geometry.attributes.position.array;
    const indices = geometry.index?.array;
    
    let objContent = '# Exported from VibeLux CAD\n';
    
    // Export vertices
    for (let i = 0; i < vertices.length; i += 3) {
      objContent += `v ${vertices[i]} ${vertices[i + 1]} ${vertices[i + 2]}\n`;
    }
    
    // Export faces
    if (indices) {
      for (let i = 0; i < indices.length; i += 3) {
        objContent += `f ${indices[i] + 1} ${indices[i + 1] + 1} ${indices[i + 2] + 1}\n`;
      }
    }
    
    return objContent;
  }

  private exportToSTL(mesh: THREE.Mesh): ArrayBuffer {
    // Basic STL export implementation
    const geometry = mesh.geometry;
    const vertices = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
    const indices = geometry.index?.array;
    
    if (!indices) {
      throw new Error('Geometry must have indices for STL export');
    }
    
    const triangleCount = indices.length / 3;
    const buffer = new ArrayBuffer(80 + 4 + triangleCount * 50);
    const view = new DataView(buffer);
    
    // STL header (80 bytes)
    let offset = 80;
    
    // Triangle count
    view.setUint32(offset, triangleCount, true);
    offset += 4;
    
    // Triangles
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;
      
      // Normal vector
      view.setFloat32(offset, normals[i1], true);
      view.setFloat32(offset + 4, normals[i1 + 1], true);
      view.setFloat32(offset + 8, normals[i1 + 2], true);
      offset += 12;
      
      // Vertex 1
      view.setFloat32(offset, vertices[i1], true);
      view.setFloat32(offset + 4, vertices[i1 + 1], true);
      view.setFloat32(offset + 8, vertices[i1 + 2], true);
      offset += 12;
      
      // Vertex 2
      view.setFloat32(offset, vertices[i2], true);
      view.setFloat32(offset + 4, vertices[i2 + 1], true);
      view.setFloat32(offset + 8, vertices[i2 + 2], true);
      offset += 12;
      
      // Vertex 3
      view.setFloat32(offset, vertices[i3], true);
      view.setFloat32(offset + 4, vertices[i3 + 1], true);
      view.setFloat32(offset + 8, vertices[i3 + 2], true);
      offset += 12;
      
      // Attribute byte count
      view.setUint16(offset, 0, true);
      offset += 2;
    }
    
    return buffer;
  }

  private exportToGLTF(mesh: THREE.Mesh): string {
    // Basic GLTF export implementation
    const geometry = mesh.geometry;
    const material = mesh.material as THREE.MeshStandardMaterial;
    
    const gltf = {
      asset: {
        version: '2.0',
        generator: 'VibeLux CAD System'
      },
      scene: 0,
      scenes: [
        {
          nodes: [0]
        }
      ],
      nodes: [
        {
          mesh: 0
        }
      ],
      meshes: [
        {
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1
              },
              indices: 2,
              material: 0
            }
          ]
        }
      ],
      materials: [
        {
          name: material.name,
          pbrMetallicRoughness: {
            baseColorFactor: [
              material.color.r,
              material.color.g,
              material.color.b,
              1.0
            ],
            metallicFactor: material.metalness,
            roughnessFactor: material.roughness
          }
        }
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: geometry.attributes.position.count,
          type: 'VEC3'
        },
        {
          bufferView: 1,
          componentType: 5126,
          count: geometry.attributes.normal.count,
          type: 'VEC3'
        },
        {
          bufferView: 2,
          componentType: 5123,
          count: geometry.index?.count || 0,
          type: 'SCALAR'
        }
      ],
      bufferViews: [
        {
          buffer: 0,
          byteOffset: 0,
          byteLength: geometry.attributes.position.array.byteLength
        },
        {
          buffer: 0,
          byteOffset: geometry.attributes.position.array.byteLength,
          byteLength: geometry.attributes.normal.array.byteLength
        },
        {
          buffer: 0,
          byteOffset: geometry.attributes.position.array.byteLength + geometry.attributes.normal.array.byteLength,
          byteLength: geometry.index?.array.byteLength || 0
        }
      ],
      buffers: [
        {
          byteLength: geometry.attributes.position.array.byteLength + 
                     geometry.attributes.normal.array.byteLength + 
                     (geometry.index?.array.byteLength || 0)
        }
      ]
    };
    
    return JSON.stringify(gltf, null, 2);
  }
}

export { GeometryEngine };
export default GeometryEngine;