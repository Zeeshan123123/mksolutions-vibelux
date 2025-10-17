'use client'

import React, { useRef, useEffect, useState } from 'react';

interface Plant {
  id: string;
  x: number;
  y: number;
  z: number;
  type: string;
  growth: number; // 0-1
  health: number; // 0-1
}

interface Tier {
  id: string;
  level: number;
  plants: Plant[];
  lightIntensity: number;
  temperature: number;
  humidity: number;
}

interface VerticalFarmLayout3DProps {
  tiers?: Tier[];
  farmDimensions?: {
    width: number;
    height: number;
    depth: number;
    tierHeight: number;
  };
  selectedTier?: string;
  selectedPlant?: string;
  onTierClick?: (tier: Tier) => void;
  onPlantClick?: (plant: Plant) => void;
  showEnvironmentData?: boolean;
  showPlantHealth?: boolean;
}

function VerticalFarm3DRenderer({ 
  tiers, 
  farmDimensions, 
  selectedTier, 
  selectedPlant,
  onTierClick, 
  onPlantClick,
  showEnvironmentData,
  showPlantHealth 
}: VerticalFarmLayout3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredItem, setHoveredItem] = useState<{ type: 'tier' | 'plant'; id: string } | null>(null);

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

    if (!tiers || !farmDimensions) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 12;

    // Draw farm structure
    const farmWidth = farmDimensions.width * scale;
    const farmDepth = farmDimensions.depth * scale * 0.6; // Isometric depth
    const tierHeight = farmDimensions.tierHeight * scale * 0.8;

    // Draw each tier
    tiers.forEach((tier, index) => {
      const tierY = centerY + (farmDimensions.height * scale / 2) - (tier.level * tierHeight);
      const isSelected = selectedTier === tier.id;
      const isHovered = hoveredItem?.type === 'tier' && hoveredItem.id === tier.id;

      // Tier platform (isometric)
      ctx.fillStyle = isSelected ? '#7c3aed' : isHovered ? '#a855f7' : '#e5e7eb';
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;

      // Platform top
      ctx.beginPath();
      ctx.moveTo(centerX - farmWidth/2, tierY);
      ctx.lineTo(centerX + farmWidth/2, tierY);
      ctx.lineTo(centerX + farmWidth/2 + farmDepth * 0.5, tierY - farmDepth * 0.3);
      ctx.lineTo(centerX - farmWidth/2 + farmDepth * 0.5, tierY - farmDepth * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Platform edge
      ctx.fillStyle = isSelected ? '#6d28d9' : isHovered ? '#9333ea' : '#d1d5db';
      ctx.beginPath();
      ctx.moveTo(centerX + farmWidth/2, tierY);
      ctx.lineTo(centerX + farmWidth/2 + farmDepth * 0.5, tierY - farmDepth * 0.3);
      ctx.lineTo(centerX + farmWidth/2 + farmDepth * 0.5, tierY - farmDepth * 0.3 + 8);
      ctx.lineTo(centerX + farmWidth/2, tierY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tier label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Tier ${tier.level}`, centerX - farmWidth/2 - 60, tierY - 5);

      // Environment data
      if (showEnvironmentData) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`💡 ${tier.lightIntensity}%`, centerX - farmWidth/2 - 60, tierY + 10);
        ctx.fillText(`🌡️ ${tier.temperature}°C`, centerX - farmWidth/2 - 60, tierY + 22);
        ctx.fillText(`💧 ${tier.humidity}%`, centerX - farmWidth/2 - 60, tierY + 34);
      }

      // Draw plants on this tier
      tier.plants.forEach((plant) => {
        const plantX = centerX - farmWidth/2 + (plant.x / farmDimensions.width) * farmWidth;
        const plantZ = centerY - farmDepth/2 + (plant.z / farmDimensions.depth) * farmDepth;
        const plantY = tierY - 8 - (plant.growth * 15); // Plant height based on growth

        const isPlantSelected = selectedPlant === plant.id;
        const isPlantHovered = hoveredItem?.type === 'plant' && hoveredItem.id === plant.id;

        // Plant stem
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plantX, tierY);
        ctx.lineTo(plantX, plantY);
        ctx.stroke();

        // Plant leaves (circle representing foliage)
        const plantSize = 4 + (plant.growth * 8);
        const healthColor = plant.health > 0.8 ? '#22c55e' : 
                          plant.health > 0.6 ? '#eab308' : 
                          plant.health > 0.4 ? '#f97316' : '#ef4444';

        ctx.fillStyle = isPlantSelected ? '#7c3aed' : 
                       isPlantHovered ? '#a855f7' : 
                       showPlantHealth ? healthColor : '#16a34a';
        
        ctx.beginPath();
        ctx.arc(plantX, plantY, plantSize, 0, 2 * Math.PI);
        ctx.fill();

        // Plant highlight
        if (isPlantSelected || isPlantHovered) {
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(plantX, plantY, plantSize + 2, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Health indicator
        if (showPlantHealth && plant.health < 0.8) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️', plantX, plantY + 2);
        }
      });

      // Growing lights (simplified)
      const lightY = tierY - tierHeight + 10;
      for (let i = 0; i < 3; i++) {
        const lightX = centerX - farmWidth/2 + 20 + (i * (farmWidth - 40) / 2);
        
        // Light fixture
        ctx.fillStyle = '#374151';
        ctx.fillRect(lightX - 8, lightY - 4, 16, 8);
        
        // Light beam
        const lightIntensity = tier.lightIntensity / 100;
        const gradient = ctx.createLinearGradient(lightX, lightY, lightX, tierY);
        gradient.addColorStop(0, `rgba(147, 51, 234, ${lightIntensity * 0.3})`);
        gradient.addColorStop(1, `rgba(147, 51, 234, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(lightX - 15, lightY + 4, 30, tierY - lightY - 4);
      }
    });

    // Support structure
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    
    // Vertical supports
    const supportPositions = [
      { x: centerX - farmWidth/2 - 10, y: centerY - farmDimensions.height * scale / 2 },
      { x: centerX + farmWidth/2 + 10, y: centerY - farmDimensions.height * scale / 2 },
    ];

    supportPositions.forEach(support => {
      ctx.beginPath();
      ctx.moveTo(support.x, support.y);
      ctx.lineTo(support.x, support.y + farmDimensions.height * scale);
      ctx.stroke();
    });

  }, [tiers, farmDimensions, selectedTier, selectedPlant, hoveredItem, showEnvironmentData, showPlantHealth]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !tiers || !farmDimensions) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 12;
    const tierHeight = farmDimensions.tierHeight * scale * 0.8;

    // Check tiers first
    for (const tier of tiers) {
      const tierY = centerY + (farmDimensions.height * scale / 2) - (tier.level * tierHeight);
      const farmWidth = farmDimensions.width * scale;
      
      if (y >= tierY - 20 && y <= tierY + 20 && 
          x >= centerX - farmWidth/2 && x <= centerX + farmWidth/2) {
        onTierClick?.(tier);
        return;
      }

      // Check plants in this tier
      for (const plant of tier.plants) {
        const plantX = centerX - farmWidth/2 + (plant.x / farmDimensions.width) * farmWidth;
        const plantY = tierY - 8 - (plant.growth * 15);
        const plantSize = 4 + (plant.growth * 8);
        
        const distance = Math.sqrt((x - plantX) ** 2 + (y - plantY) ** 2);
        if (distance <= plantSize + 5) {
          onPlantClick?.(plant);
          return;
        }
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !tiers || !farmDimensions) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = 12;
    const tierHeight = farmDimensions.tierHeight * scale * 0.8;

    let newHoveredItem = null;

    // Check tiers
    for (const tier of tiers) {
      const tierY = centerY + (farmDimensions.height * scale / 2) - (tier.level * tierHeight);
      const farmWidth = farmDimensions.width * scale;
      
      if (y >= tierY - 20 && y <= tierY + 20 && 
          x >= centerX - farmWidth/2 && x <= centerX + farmWidth/2) {
        newHoveredItem = { type: 'tier' as const, id: tier.id };
        break;
      }

      // Check plants
      for (const plant of tier.plants) {
        const plantX = centerX - farmWidth/2 + (plant.x / farmDimensions.width) * farmWidth;
        const plantY = tierY - 8 - (plant.growth * 15);
        const plantSize = 4 + (plant.growth * 8);
        
        const distance = Math.sqrt((x - plantX) ** 2 + (y - plantY) ** 2);
        if (distance <= plantSize + 5) {
          newHoveredItem = { type: 'plant' as const, id: plant.id };
          break;
        }
      }
      
      if (newHoveredItem) break;
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

export default function VerticalFarmLayout3D({
  tiers = [
    {
      id: 'tier-1',
      level: 1,
      lightIntensity: 80,
      temperature: 24,
      humidity: 65,
      plants: [
        { id: 'plant-1', x: 1, y: 0, z: 1, type: 'lettuce', growth: 0.8, health: 0.9 },
        { id: 'plant-2', x: 2, y: 0, z: 1, type: 'lettuce', growth: 0.6, health: 0.85 },
        { id: 'plant-3', x: 3, y: 0, z: 1, type: 'lettuce', growth: 0.7, health: 0.6 },
      ]
    },
    {
      id: 'tier-2',
      level: 2,
      lightIntensity: 75,
      temperature: 23,
      humidity: 68,
      plants: [
        { id: 'plant-4', x: 1, y: 0, z: 2, type: 'spinach', growth: 0.4, health: 0.95 },
        { id: 'plant-5', x: 2, y: 0, z: 2, type: 'spinach', growth: 0.5, health: 0.8 },
      ]
    },
    {
      id: 'tier-3',
      level: 3,
      lightIntensity: 70,
      temperature: 22,
      humidity: 70,
      plants: [
        { id: 'plant-6', x: 1, y: 0, z: 3, type: 'herbs', growth: 0.9, health: 0.9 },
      ]
    }
  ],
  farmDimensions = { width: 6, height: 4, depth: 4, tierHeight: 1 },
  selectedTier,
  selectedPlant,
  onTierClick,
  onPlantClick,
  showEnvironmentData = true,
  showPlantHealth = true
}: VerticalFarmLayout3DProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading vertical farm layout...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gray-50 border rounded-lg overflow-hidden">
      <VerticalFarm3DRenderer
        tiers={tiers}
        farmDimensions={farmDimensions}
        selectedTier={selectedTier}
        selectedPlant={selectedPlant}
        onTierClick={onTierClick}
        onPlantClick={onPlantClick}
        showEnvironmentData={showEnvironmentData}
        showPlantHealth={showPlantHealth}
      />

      {/* Controls UI */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">Vertical Farm</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>🏗️ Click tiers to select</div>
          <div>🌱 Click plants for details</div>
          <div>💡 Light intensity shown</div>
          <div>🎨 Health color coding</div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-1">Farm Stats</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Tiers: {tiers.length}</div>
          <div>Plants: {tiers.reduce((sum, tier) => sum + tier.plants.length, 0)}</div>
          <div>Dimensions: {farmDimensions.width}×{farmDimensions.depth}×{farmDimensions.height}m</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">Health Legend</div>
        <div className="flex space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}