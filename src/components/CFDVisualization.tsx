'use client'

import React, { useRef, useEffect, useState } from 'react';

interface HVACInlet {
  id: string;
  x: number;
  y: number;
  z: number;
  diameter: number;
  velocity: number;
  temperature: number;
  direction: { x: number; y: number; z: number };
}

interface HVACOutlet {
  id: string;
  x: number;
  y: number;
  z: number;
  diameter: number;
  extractionRate: number;
}

interface AirflowData {
  x: number;
  y: number;
  z: number;
  velocity: { x: number; y: number; z: number };
  pressure: number;
  temperature: number;
}

interface CFDVisualizationProps {
  roomDimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  fixtures?: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    heatGeneration: number;
  }>;
  hvacInlets?: HVACInlet[];
  hvacOutlets?: HVACOutlet[];
  airflowData?: AirflowData[];
  showVelocityVectors?: boolean;
  showTemperatureMap?: boolean;
  showPressureContours?: boolean;
  selectedInlet?: string;
  selectedOutlet?: string;
  onInletClick?: (inlet: HVACInlet) => void;
  onOutletClick?: (outlet: HVACOutlet) => void;
}

function CFDRenderer({
  roomDimensions,
  fixtures,
  hvacInlets,
  hvacOutlets,
  airflowData,
  showVelocityVectors,
  showTemperatureMap,
  showPressureContours,
  selectedInlet,
  selectedOutlet,
  onInletClick,
  onOutletClick
}: CFDVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredItem, setHoveredItem] = useState<{ type: 'inlet' | 'outlet'; id: string } | null>(null);

  // Generate airflow data if not provided
  const generateAirflowField = () => {
    if (!roomDimensions || !hvacInlets) return [];
    
    const gridResolution = 20;
    const airflow: AirflowData[] = [];
    
    for (let x = 0; x < roomDimensions.width; x += roomDimensions.width / gridResolution) {
      for (let y = 0; y < roomDimensions.height; y += roomDimensions.height / gridResolution) {
        for (let z = 0; z < roomDimensions.depth; z += roomDimensions.depth / gridResolution) {
          const velocity = { x: 0, y: 0, z: 0 };
          let temperature = 22; // Base temperature
          const pressure = 101325; // Base pressure in Pa
          
          // Calculate influence from each inlet
          hvacInlets.forEach(inlet => {
            const distance = Math.sqrt(
              (x - inlet.x) ** 2 + 
              (y - inlet.y) ** 2 + 
              (z - inlet.z) ** 2
            );
            
            if (distance > 0) {
              const influence = Math.exp(-distance / 3); // Exponential decay
              const inletVelocity = inlet.velocity * influence;
              
              velocity.x += inlet.direction.x * inletVelocity;
              velocity.y += inlet.direction.y * inletVelocity;
              velocity.z += inlet.direction.z * inletVelocity;
              
              temperature += (inlet.temperature - 22) * influence;
            }
          });
          
          // Add some randomness for turbulence
          velocity.x += (Math.random() - 0.5) * 0.1;
          velocity.y += (Math.random() - 0.5) * 0.1;
          velocity.z += (Math.random() - 0.5) * 0.1;
          
          airflow.push({ x, y, z, velocity, pressure, temperature });
        }
      }
    }
    
    return airflow;
  };

  const computedAirflow = airflowData || generateAirflowField();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (!roomDimensions) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 15;

    // Draw room outline
    const roomWidth = roomDimensions.width * scale;
    const roomHeight = roomDimensions.height * scale;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - roomWidth/2, centerY - roomHeight/2, roomWidth, roomHeight);

    // Draw temperature field if enabled
    if (showTemperatureMap) {
      const gridSize = 10;
      for (let i = 0; i < computedAirflow.length; i += 8) { // Sample every 8th point for performance
        const point = computedAirflow[i];
        const x = centerX - roomWidth/2 + (point.x / roomDimensions.width) * roomWidth;
        const y = centerY - roomHeight/2 + (point.z / roomDimensions.depth) * roomHeight; // Use Z for 2D depth
        
        // Temperature color mapping
        const tempNorm = (point.temperature - 18) / (28 - 18); // Normalize 18-28°C range
        const hue = (1 - tempNorm) * 240; // Blue (240°) to Red (0°)
        
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.3)`;
        ctx.fillRect(x - gridSize/2, y - gridSize/2, gridSize, gridSize);
      }
    }

    // Draw pressure contours if enabled
    if (showPressureContours) {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      
      // Draw simplified pressure lines
      for (let i = 0; i < 5; i++) {
        const radius = (i + 1) * roomWidth / 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw velocity vectors if enabled
    if (showVelocityVectors) {
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < computedAirflow.length; i += 12) { // Sample for performance
        const point = computedAirflow[i];
        const x = centerX - roomWidth/2 + (point.x / roomDimensions.width) * roomWidth;
        const y = centerY - roomHeight/2 + (point.z / roomDimensions.depth) * roomHeight;
        
        const velMagnitude = Math.sqrt(
          point.velocity.x ** 2 + point.velocity.y ** 2 + point.velocity.z ** 2
        );
        
        if (velMagnitude > 0.05) {
          const vectorLength = Math.min(velMagnitude * 10, 20);
          const angle = Math.atan2(point.velocity.z, point.velocity.x);
          
          const endX = x + Math.cos(angle) * vectorLength;
          const endY = y + Math.sin(angle) * vectorLength;
          
          // Vector line
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          
          // Arrow head
          const arrowSize = 3;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI/6),
            endY - arrowSize * Math.sin(angle - Math.PI/6)
          );
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI/6),
            endY - arrowSize * Math.sin(angle + Math.PI/6)
          );
          ctx.closePath();
          ctx.fillStyle = '#7c3aed';
          ctx.fill();
        }
      }
    }

    // Draw fixtures
    fixtures?.forEach(fixture => {
      const x = centerX - roomWidth/2 + (fixture.x / roomDimensions.width) * roomWidth;
      const y = centerY - roomHeight/2 + (fixture.z / roomDimensions.depth) * roomHeight;
      const size = Math.max(fixture.width, fixture.depth) * scale;
      
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(x - size/2, y - size/2, size, size);
      
      // Heat generation visualization
      if (fixture.heatGeneration > 0) {
        const heatRadius = fixture.heatGeneration * 3;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, heatRadius);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, heatRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw HVAC inlets
    hvacInlets?.forEach(inlet => {
      const x = centerX - roomWidth/2 + (inlet.x / roomDimensions.width) * roomWidth;
      const y = centerY - roomHeight/2 + (inlet.z / roomDimensions.depth) * roomHeight;
      const radius = inlet.diameter * scale / 2;
      
      const isSelected = selectedInlet === inlet.id;
      const isHovered = hoveredItem?.type === 'inlet' && hoveredItem.id === inlet.id;
      
      // Inlet circle
      ctx.fillStyle = isSelected ? '#059669' : isHovered ? '#10b981' : '#22c55e';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Velocity indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IN', x, y + 3);
      
      // Air flow visualization
      for (let i = 0; i < 3; i++) {
        const flowRadius = radius + 5 + (i * 8);
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, flowRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw HVAC outlets
    hvacOutlets?.forEach(outlet => {
      const x = centerX - roomWidth/2 + (outlet.x / roomDimensions.width) * roomWidth;
      const y = centerY - roomHeight/2 + (outlet.z / roomDimensions.depth) * roomHeight;
      const radius = outlet.diameter * scale / 2;
      
      const isSelected = selectedOutlet === outlet.id;
      const isHovered = hoveredItem?.type === 'outlet' && hoveredItem.id === outlet.id;
      
      // Outlet circle
      ctx.fillStyle = isSelected ? '#dc2626' : isHovered ? '#ef4444' : '#f87171';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Extraction indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OUT', x, y + 3);
      
      // Suction visualization
      for (let i = 0; i < 2; i++) {
        const suctionRadius = radius - (i * 3);
        if (suctionRadius > 0) {
          ctx.strokeStyle = `rgba(248, 113, 113, ${0.5 - i * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, suctionRadius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    });

  }, [
    roomDimensions, fixtures, hvacInlets, hvacOutlets, computedAirflow,
    showVelocityVectors, showTemperatureMap, showPressureContours,
    selectedInlet, selectedOutlet, hoveredItem
  ]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !roomDimensions) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 15;
    const roomWidth = roomDimensions.width * scale;
    const roomHeight = roomDimensions.height * scale;

    // Check inlets
    hvacInlets?.forEach(inlet => {
      const inletX = centerX - roomWidth/2 + (inlet.x / roomDimensions.width) * roomWidth;
      const inletY = centerY - roomHeight/2 + (inlet.z / roomDimensions.depth) * roomHeight;
      const radius = inlet.diameter * scale / 2;
      
      const distance = Math.sqrt((x - inletX) ** 2 + (y - inletY) ** 2);
      if (distance <= radius + 5) {
        onInletClick?.(inlet);
        return;
      }
    });

    // Check outlets
    hvacOutlets?.forEach(outlet => {
      const outletX = centerX - roomWidth/2 + (outlet.x / roomDimensions.width) * roomWidth;
      const outletY = centerY - roomHeight/2 + (outlet.z / roomDimensions.depth) * roomHeight;
      const radius = outlet.diameter * scale / 2;
      
      const distance = Math.sqrt((x - outletX) ** 2 + (y - outletY) ** 2);
      if (distance <= radius + 5) {
        onOutletClick?.(outlet);
        return;
      }
    });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !roomDimensions) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 15;
    const roomWidth = roomDimensions.width * scale;
    const roomHeight = roomDimensions.height * scale;

    let newHoveredItem = null;

    // Check inlets
    hvacInlets?.forEach(inlet => {
      const inletX = centerX - roomWidth/2 + (inlet.x / roomDimensions.width) * roomWidth;
      const inletY = centerY - roomHeight/2 + (inlet.z / roomDimensions.depth) * roomHeight;
      const radius = inlet.diameter * scale / 2;
      
      const distance = Math.sqrt((x - inletX) ** 2 + (y - inletY) ** 2);
      if (distance <= radius + 5) {
        newHoveredItem = { type: 'inlet' as const, id: inlet.id };
      }
    });

    // Check outlets if no inlet hovered
    if (!newHoveredItem) {
      hvacOutlets?.forEach(outlet => {
        const outletX = centerX - roomWidth/2 + (outlet.x / roomDimensions.width) * roomWidth;
        const outletY = centerY - roomHeight/2 + (outlet.z / roomDimensions.depth) * roomHeight;
        const radius = outlet.diameter * scale / 2;
        
        const distance = Math.sqrt((x - outletX) ** 2 + (y - outletY) ** 2);
        if (distance <= radius + 5) {
          newHoveredItem = { type: 'outlet' as const, id: outlet.id };
        }
      });
    }

    setHoveredItem(newHoveredItem);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer"
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}

export default function CFDVisualization({
  roomDimensions = { width: 8, height: 3, depth: 6 },
  fixtures = [
    { id: 'led-1', x: 2, y: 2.5, z: 2, width: 1, height: 0.1, depth: 1, heatGeneration: 2 },
    { id: 'led-2', x: 6, y: 2.5, z: 2, width: 1, height: 0.1, depth: 1, heatGeneration: 2 },
    { id: 'led-3', x: 4, y: 2.5, z: 4, width: 1, height: 0.1, depth: 1, heatGeneration: 2 },
  ],
  hvacInlets = [
    {
      id: 'inlet-1',
      x: 1,
      y: 2.8,
      z: 1,
      diameter: 0.3,
      velocity: 2.5,
      temperature: 20,
      direction: { x: 0.7, y: -0.3, z: 0.6 }
    },
    {
      id: 'inlet-2',
      x: 7,
      y: 2.8,
      z: 5,
      diameter: 0.3,
      velocity: 2.2,
      temperature: 19,
      direction: { x: -0.6, y: -0.4, z: -0.7 }
    }
  ],
  hvacOutlets = [
    { id: 'outlet-1', x: 4, y: 0.2, z: 3, diameter: 0.4, extractionRate: 150 }
  ],
  airflowData,
  showVelocityVectors = true,
  showTemperatureMap = false,
  showPressureContours = false,
  selectedInlet,
  selectedOutlet,
  onInletClick,
  onOutletClick
}: CFDVisualizationProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading CFD visualization...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gray-50 border rounded-lg overflow-hidden">
      <CFDRenderer
        roomDimensions={roomDimensions}
        fixtures={fixtures}
        hvacInlets={hvacInlets}
        hvacOutlets={hvacOutlets}
        airflowData={airflowData}
        showVelocityVectors={showVelocityVectors}
        showTemperatureMap={showTemperatureMap}
        showPressureContours={showPressureContours}
        selectedInlet={selectedInlet}
        selectedOutlet={selectedOutlet}
        onInletClick={onInletClick}
        onOutletClick={onOutletClick}
      />

      {/* Controls UI */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">CFD Analysis</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>🌬️ Airflow patterns</div>
          <div>🌡️ Temperature gradients</div>
          <div>💨 Velocity vectors</div>
          <div>📍 Click HVAC components</div>
        </div>
      </div>

      {/* Visualization Options */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">Display Options</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500"></div>
            <span>Velocity Vectors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-red-400"></div>
            <span>Temperature Map</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border border-gray-400 bg-transparent"></div>
            <span>Pressure Contours</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">Components</div>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Air Inlet</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Air Outlet</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-400"></div>
            <span>Heat Source</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-1">CFD Stats</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Inlets: {hvacInlets.length}</div>
          <div>Outlets: {hvacOutlets.length}</div>
          <div>Heat Sources: {fixtures.filter(f => f.heatGeneration > 0).length}</div>
          <div>Room: {roomDimensions.width}×{roomDimensions.depth}×{roomDimensions.height}m</div>
        </div>
      </div>
    </div>
  );
}