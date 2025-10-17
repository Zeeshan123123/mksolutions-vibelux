/**
 * Detailed 3D Greenhouse Component for VibeLux
 * High-fidelity 3D model with accurate dimensions and materials
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, Line } from '@react-three/drei';
import * as THREE from 'three';

interface DetailedGreenhouse3DProps {
  dimensions: {
    width: number;
    length: number;
    height: number;
    sideHeight?: number;
  };
  material?: {
    type: 'glass' | 'polycarbonate' | 'polyethylene';
    thickness?: number;
    transmittance?: number;
  };
  structure?: {
    type: 'gutter-connected' | 'freestanding' | 'tunnel';
    material: 'steel' | 'aluminum' | 'wood';
  };
  showGrid?: boolean;
  showDimensions?: boolean;
  opacity?: number;
}

export const DetailedGreenhouse3D: React.FC<DetailedGreenhouse3DProps> = ({
  dimensions,
  material = { type: 'polycarbonate', thickness: 8, transmittance: 0.89 },
  structure = { type: 'gutter-connected', material: 'steel' },
  showGrid = true,
  showDimensions = true,
  opacity = 0.8
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { width, length, height, sideHeight = height * 0.6 } = dimensions;

  // Material properties based on type
  const glazingMaterial = useMemo(() => {
    const baseProps = {
      transparent: true,
      opacity: opacity * (material.transmittance || 0.89),
      side: THREE.DoubleSide,
    };

    switch (material.type) {
      case 'glass':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          roughness: 0.1,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0,
          ior: 1.52,
          thickness: material.thickness || 6,
          transmission: 0.95,
        });
      case 'polycarbonate':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          roughness: 0.3,
          metalness: 0,
          clearcoat: 0.5,
          ior: 1.58,
          thickness: material.thickness || 8,
          transmission: 0.89,
        });
      case 'polyethylene':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          roughness: 0.8,
          metalness: 0,
          transmission: 0.85,
        });
      default:
        return new THREE.MeshStandardMaterial(baseProps);
    }
  }, [material, opacity]);

  // Structure material
  const structureMaterial = useMemo(() => {
    switch (structure.material) {
      case 'steel':
        return new THREE.MeshStandardMaterial({
          color: '#404040',
          roughness: 0.7,
          metalness: 0.8,
        });
      case 'aluminum':
        return new THREE.MeshStandardMaterial({
          color: '#c0c0c0',
          roughness: 0.3,
          metalness: 0.9,
        });
      case 'wood':
        return new THREE.MeshStandardMaterial({
          color: '#8b6914',
          roughness: 0.9,
          metalness: 0,
        });
    }
  }, [structure]);

  // Calculate roof pitch
  const roofHeight = height - sideHeight;
  const roofAngle = Math.atan(roofHeight / (width / 2));

  // Frame positions for structure
  const framePositions = useMemo(() => {
    const positions = [];
    const baySpacing = 3; // 3m between frames
    const numBays = Math.floor(length / baySpacing);
    
    for (let i = 0; i <= numBays; i++) {
      positions.push(i * baySpacing - length / 2);
    }
    return positions;
  }, [length]);

  useFrame((state) => {
    if (groupRef.current && state.camera) {
      // Optional: Add subtle animation
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation/Floor */}
      <Box args={[width, 0.1, length]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>

      {/* Structural frames */}
      {framePositions.map((zPos, index) => (
        <group key={index} position={[0, 0, zPos]}>
          {/* Vertical posts */}
          <Box args={[0.1, sideHeight, 0.1]} position={[-width/2, sideHeight/2, 0]} material={structureMaterial} />
          <Box args={[0.1, sideHeight, 0.1]} position={[width/2, sideHeight/2, 0]} material={structureMaterial} />
          
          {/* Roof beams */}
          <Box 
            args={[width/2 + 0.1, 0.1, 0.1]} 
            position={[-width/4, height - roofHeight/2, 0]}
            rotation={[0, 0, -roofAngle]}
            material={structureMaterial}
          />
          <Box 
            args={[width/2 + 0.1, 0.1, 0.1]} 
            position={[width/4, height - roofHeight/2, 0]}
            rotation={[0, 0, roofAngle]}
            material={structureMaterial}
          />
          
          {/* Ridge beam */}
          <Box args={[0.1, 0.1, 0.1]} position={[0, height, 0]} material={structureMaterial} />
        </group>
      ))}

      {/* Longitudinal beams */}
      <Box args={[0.1, 0.1, length]} position={[-width/2, sideHeight, 0]} material={structureMaterial} />
      <Box args={[0.1, 0.1, length]} position={[width/2, sideHeight, 0]} material={structureMaterial} />
      <Box args={[0.1, 0.1, length]} position={[0, height, 0]} material={structureMaterial} />

      {/* Glazing panels */}
      {/* Side walls */}
      <Plane args={[length, sideHeight]} position={[-width/2, sideHeight/2, 0]} rotation={[0, Math.PI/2, 0]} material={glazingMaterial} />
      <Plane args={[length, sideHeight]} position={[width/2, sideHeight/2, 0]} rotation={[0, -Math.PI/2, 0]} material={glazingMaterial} />
      
      {/* End walls */}
      <Plane args={[width, sideHeight]} position={[0, sideHeight/2, -length/2]} material={glazingMaterial} />
      <Plane args={[width, sideHeight]} position={[0, sideHeight/2, length/2]} rotation={[0, Math.PI, 0]} material={glazingMaterial} />
      
      {/* Roof panels */}
      <Plane 
        args={[width/2 * 1.1, length]} 
        position={[-width/4, height - roofHeight/2, 0]} 
        rotation={[-Math.PI/2 + roofAngle, 0, 0]}
        material={glazingMaterial}
      />
      <Plane 
        args={[width/2 * 1.1, length]} 
        position={[width/4, height - roofHeight/2, 0]} 
        rotation={[-Math.PI/2 - roofAngle, 0, 0]}
        material={glazingMaterial}
      />

      {/* Roof vents (optional) */}
      {structure.type === 'gutter-connected' && (
        <>
          <Plane 
            args={[width * 0.3, length * 0.1]} 
            position={[0, height - 0.2, 0]} 
            rotation={[-Math.PI/2, 0, 0]}
            material={glazingMaterial}
          />
        </>
      )}

      {/* Grid floor */}
      {showGrid && (
        <gridHelper args={[Math.max(width, length) * 1.5, 20, '#333333', '#222222']} position={[0, 0.01, 0]} />
      )}

      {/* Dimension labels */}
      {showDimensions && (
        <group>
          <Line
            points={[[-width/2, 0, -length/2 - 1], [width/2, 0, -length/2 - 1]]}
            color="white"
            lineWidth={2}
          />
          <Line
            points={[[-width/2 - 1, 0, -length/2], [-width/2 - 1, 0, length/2]]}
            color="white"
            lineWidth={2}
          />
          <Line
            points={[[-width/2 - 1, 0, 0], [-width/2 - 1, height, 0]]}
            color="white"
            lineWidth={2}
          />
        </group>
      )}
    </group>
  );
};

export default DetailedGreenhouse3D;