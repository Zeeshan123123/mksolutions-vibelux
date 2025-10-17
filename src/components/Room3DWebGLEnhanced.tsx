'use client'

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  PerspectiveCamera, 
  Environment,
  Text,
  Box,
  Sphere,
  Cone,
  Line,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { logger } from '@/lib/client-logger';

interface Room3DWebGLEnhancedProps {
  roomDimensions?: {
    width: number;
    length: number;
    height: number;
  };
  fixtures?: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    rotation: number;
    model: {
      brand: string;
      model: string;
      wattage: number;
      ppf: number;
      beamAngle: number;
    };
    enabled: boolean;
    assignedTiers?: string[];
  }>;
  tiers?: Array<{
    id: string;
    name: string;
    height: number;
    color: string;
  }>;
  sensorPositions?: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    type: string;
    value?: number;
    unit?: string;
  }>;
  showGrid?: boolean;
  showLightBeams?: boolean;
  showSensorData?: boolean;
  showAlerts?: boolean;
}

// Room component
function Room({ dimensions }: { dimensions: Room3DWebGLEnhancedProps['roomDimensions'] }) {
  const { width = 12, length = 20, height = 4 } = dimensions || {};
  
  return (
    <>
      {/* Floor */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[width, 0.02, length]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, height / 2, -length / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Front wall (transparent) */}
      <mesh position={[0, height / 2, length / 2]}>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#3a3a3a" transparent opacity={0.1} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, height, length]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, height, length]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, height, 0]} receiveShadow>
        <boxGeometry args={[width, 0.02, length]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </>
  );
}

// Growing tier component
function GrowingTier({ tier, roomDimensions }: { 
  tier: Room3DWebGLEnhancedProps['tiers'][0];
  roomDimensions: Room3DWebGLEnhancedProps['roomDimensions'];
}) {
  const { width = 12, length = 20 } = roomDimensions || {};
  
  return (
    <group position={[0, tier.height, 0]}>
      {/* Tier platform */}
      <mesh receiveShadow>
        <boxGeometry args={[width * 0.8, 0.05, length * 0.8]} />
        <meshStandardMaterial color={tier.color} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Tier label */}
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {tier.name}
      </Text>
    </group>
  );
}

// Light fixture component
function LightFixture({ fixture, showBeam }: { 
  fixture: Room3DWebGLEnhancedProps['fixtures'][0];
  showBeam: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  
  useFrame((state) => {
    if (meshRef.current && fixture.enabled) {
      // Subtle animation for active fixtures
      meshRef.current.position.y = fixture.z + Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });
  
  return (
    <group position={[fixture.x, fixture.z, fixture.y]}>
      {/* Fixture housing */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.1, 1.2]} />
        <meshStandardMaterial 
          color={fixture.enabled ? "#4a90e2" : "#666"} 
          emissive={fixture.enabled ? "#4a90e2" : "#000"}
          emissiveIntensity={fixture.enabled ? 0.5 : 0}
        />
      </mesh>
      
      {/* Light source */}
      {fixture.enabled && (
        <>
          <spotLight
            ref={lightRef}
            position={[0, -0.1, 0]}
            angle={THREE.MathUtils.degToRad(fixture.model.beamAngle)}
            penumbra={0.3}
            intensity={fixture.model.ppf / 1000}
            distance={10}
            castShadow
            shadow-mapSize={[512, 512]}
            color="#ffeaa7"
          />
          
          {/* Light beam visualization */}
          {showBeam && (
            <Cone args={[
              Math.tan(THREE.MathUtils.degToRad(fixture.model.beamAngle / 2)) * 3,
              3,
              32
            ]} position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
              <meshBasicMaterial 
                color="#ffeaa7" 
                transparent 
                opacity={0.1} 
                side={THREE.DoubleSide}
              />
            </Cone>
          )}
        </>
      )}
      
      {/* Fixture info */}
      <Html position={[0, 0.2, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          <div>{fixture.model.brand} {fixture.model.model}</div>
          <div>{fixture.model.wattage}W | {fixture.model.ppf} PPF</div>
        </div>
      </Html>
    </group>
  );
}

// Sensor component
function Sensor({ sensor, showData }: { 
  sensor: Room3DWebGLEnhancedProps['sensorPositions'][0];
  showData: boolean;
}) {
  const getColorByType = (type: string) => {
    switch (type) {
      case 'temperature': return '#e74c3c';
      case 'humidity': return '#3498db';
      case 'co2': return '#2ecc71';
      case 'ppfd': return '#f39c12';
      default: return '#95a5a6';
    }
  };
  
  return (
    <group position={[sensor.x, sensor.z, sensor.y]}>
      {/* Sensor body */}
      <Sphere args={[0.1]} castShadow>
        <meshStandardMaterial 
          color={getColorByType(sensor.type)} 
          emissive={getColorByType(sensor.type)}
          emissiveIntensity={0.3}
        />
      </Sphere>
      
      {/* Sensor data display */}
      {showData && sensor.value !== undefined && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/90 text-white px-2 py-1 rounded text-xs">
            <div className="font-bold">{sensor.type}</div>
            <div>{sensor.value}{sensor.unit}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 2, 0);
  }, [camera]);
  
  return null;
}

// Main 3D scene component
function Scene(props: Room3DWebGLEnhancedProps) {
  const {
    roomDimensions,
    fixtures = [],
    tiers = [],
    sensorPositions = [],
    showGrid = true,
    showLightBeams = true,
    showSensorData = true,
  } = props;
  
  return (
    <>
      <CameraController />
      <OrbitControls 
        enablePan
        enableZoom
        enableRotate
        maxDistance={30}
        minDistance={5}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
      
      {/* Environment */}
      <Environment preset="warehouse" />
      
      {/* Grid */}
      {showGrid && (
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#444" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#666"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
        />
      )}
      
      {/* Room */}
      <Room dimensions={roomDimensions} />
      
      {/* Growing tiers */}
      {tiers.map((tier) => (
        <GrowingTier 
          key={tier.id} 
          tier={tier} 
          roomDimensions={roomDimensions}
        />
      ))}
      
      {/* Light fixtures */}
      {fixtures.map((fixture) => (
        <LightFixture 
          key={fixture.id} 
          fixture={fixture} 
          showBeam={showLightBeams}
        />
      ))}
      
      {/* Sensors */}
      {sensorPositions.map((sensor) => (
        <Radio 
          key={sensor.id} 
          sensor={sensor} 
          showData={showSensorData}
        />
      ))}
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
      </EffectComposer>
    </>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <div className="text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p>Loading 3D visualization...</p>
      </div>
    </div>
  );
}

// Main component
export default function Room3DWebGLEnhanced(props: Room3DWebGLEnhancedProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    logger.info('system', '3D visualization component mounted');
  }, []);
  
  if (!mounted) {
    return <LoadingFallback />;
  }
  
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ 
          position: [10, 8, 10], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
      
      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Controls</div>
        <div>🖱️ Left click + drag: Rotate</div>
        <div>🖱️ Right click + drag: Pan</div>
        <div>🖱️ Scroll: Zoom</div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Active Fixture</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Inactive Fixture</span>
        </div>
        {props.showSensorData && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Temperature</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Humidity</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>CO2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>PPFD</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}