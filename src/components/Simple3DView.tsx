'use client'

import React, { useRef, useEffect, useState } from 'react';

interface Simple3DViewProps {
  fixtures?: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    color?: string;
    intensity?: number;
    type?: string;
  }>;
  roomDimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  showGrid?: boolean;
  showAxes?: boolean;
  cameraPosition?: [number, number, number];
  onFixtureClick?: (fixture: any) => void;
}

function Simple3DRenderer({ fixtures, roomDimensions, onFixtureClick }: Simple3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let i = 0; i <= rect.width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, rect.height);
      ctx.stroke();
    }
    for (let i = 0; i <= rect.height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(rect.width, i);
      ctx.stroke();
    }

    // Draw room outline (isometric perspective)
    if (roomDimensions) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = 8;
      
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Front face
      const frontW = roomDimensions.width * scale;
      const frontH = roomDimensions.height * scale;
      ctx.rect(centerX - frontW/2, centerY - frontH/2, frontW, frontH);
      
      // Add depth lines for 3D effect
      const depthX = roomDimensions.depth * scale * 0.3;
      const depthY = -roomDimensions.depth * scale * 0.3;
      
      ctx.moveTo(centerX - frontW/2, centerY - frontH/2);
      ctx.lineTo(centerX - frontW/2 + depthX, centerY - frontH/2 + depthY);
      
      ctx.moveTo(centerX + frontW/2, centerY - frontH/2);
      ctx.lineTo(centerX + frontW/2 + depthX, centerY - frontH/2 + depthY);
      
      ctx.moveTo(centerX + frontW/2, centerY + frontH/2);
      ctx.lineTo(centerX + frontW/2 + depthX, centerY + frontH/2 + depthY);
      
      ctx.moveTo(centerX - frontW/2, centerY + frontH/2);
      ctx.lineTo(centerX - frontW/2 + depthX, centerY + frontH/2 + depthY);
      
      // Back face
      ctx.rect(centerX - frontW/2 + depthX, centerY - frontH/2 + depthY, frontW, frontH);
      
      ctx.stroke();
      
      // Floor
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(centerX - frontW/2, centerY + frontH/2, frontW, 20);
    }

    // Draw fixtures
    fixtures?.forEach((fixture) => {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = 8;
      
      const x = centerX + (fixture.x * scale);
      const y = centerY - (fixture.z * scale); // Z becomes Y in 2D
      const size = Math.max(fixture.width, fixture.depth) * scale;
      
      // Fixture shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(x - size/2 + 2, y - size/2 + 2, size, size);
      
      // Fixture body
      const isSelected = selectedFixture === fixture.id;
      ctx.fillStyle = isSelected ? '#a855f7' : (fixture.color || '#7c3aed');
      ctx.fillRect(x - size/2, y - size/2, size, size);
      
      // Light cone
      if (fixture.type !== 'sensor') {
        const intensity = fixture.intensity || 0.5;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, `${fixture.color || '#7c3aed'}40`);
        gradient.addColorStop(1, `${fixture.color || '#7c3aed'}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 2 * intensity, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Fixture label
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(fixture.id, x, y + size/2 + 12);
    });

  }, [fixtures, roomDimensions, selectedFixture]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !fixtures) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 8;

    // Check if click is on a fixture
    for (const fixture of fixtures) {
      const fixtureX = centerX + (fixture.x * scale);
      const fixtureY = centerY - (fixture.z * scale);
      const size = Math.max(fixture.width, fixture.depth) * scale;
      
      if (x >= fixtureX - size/2 && x <= fixtureX + size/2 &&
          y >= fixtureY - size/2 && y <= fixtureY + size/2) {
        setSelectedFixture(fixture.id);
        onFixtureClick?.(fixture);
        return;
      }
    }
    
    setSelectedFixture(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer"
      onClick={handleCanvasClick}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}

export default function Simple3DView({
  fixtures = [],
  roomDimensions = { width: 10, height: 3, depth: 8 },
  showGrid = true,
  showAxes = false,
  cameraPosition = [8, 6, 8],
  onFixtureClick
}: Simple3DViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading 3D view...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gray-50 border rounded-lg overflow-hidden">
      <Simple3DRenderer
        fixtures={fixtures}
        roomDimensions={roomDimensions}
        onFixtureClick={onFixtureClick}
      />

      {/* 3D View Controls UI */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">3D View</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>📍 Click fixtures to select</div>
          <div>🏗️ Isometric projection</div>
          <div>💡 Light coverage shown</div>
        </div>
      </div>

      {/* Stats */}
      {fixtures.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-sm font-medium text-gray-700 mb-1">Scene Info</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Fixtures: {fixtures.length}</div>
            <div>Room: {roomDimensions.width}×{roomDimensions.depth}×{roomDimensions.height}m</div>
          </div>
        </div>
      )}
    </div>
  );
}