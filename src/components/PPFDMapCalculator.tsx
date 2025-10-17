'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function PPFDMapCalculator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [fixture, setFixture] = useState({
    ppf: 1800,
    wattage: 600,
    beamAngle: 120,
    count: 8
  });

  const [room, setRoom] = useState({
    width: 20,
    length: 40,
    mountingHeight: 8,
    canopyHeight: 4
  });

  const [metrics, setMetrics] = useState({
    avgPPFD: 0,
    maxPPFD: 0,
    minPPFD: 0,
    uniformity: 0,
    dli: 0
  });

  const [photoperiod, setPhotoperiod] = useState(12);

  const calculatePPFD = () => {
    const gridResolution = 1;
    const gridWidth = Math.ceil(room.width / gridResolution);
    const gridLength = Math.ceil(room.length / gridResolution);
    const grid: number[][] = Array(gridLength).fill(null).map(() => Array(gridWidth).fill(0));
    
    const cols = Math.ceil(Math.sqrt(fixture.count * room.width / room.length));
    const rows = Math.ceil(fixture.count / cols);
    const spacingX = room.width / cols;
    const spacingY = room.length / rows;
    
    for (let fixtureRow = 0; fixtureRow < rows; fixtureRow++) {
      for (let fixtureCol = 0; fixtureCol < cols; fixtureCol++) {
        const fixtureIndex = fixtureRow * cols + fixtureCol;
        if (fixtureIndex >= fixture.count) break;
        
        const fixtureX = (fixtureCol + 0.5) * spacingX;
        const fixtureY = (fixtureRow + 0.5) * spacingY;
        
        for (let y = 0; y < gridLength; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const pointX = x * gridResolution;
            const pointY = y * gridResolution;
            
            const horizontalDistance = Math.sqrt(
              Math.pow(fixtureX - pointX, 2) + 
              Math.pow(fixtureY - pointY, 2)
            );
            
            const verticalDistance = room.mountingHeight - room.canopyHeight;
            const totalDistance = Math.sqrt(
              Math.pow(horizontalDistance, 2) + 
              Math.pow(verticalDistance, 2)
            );
            
            const angle = Math.atan(horizontalDistance / verticalDistance) * (180 / Math.PI);
            
            if (angle <= fixture.beamAngle / 2) {
              const distanceInMeters = totalDistance * 0.3048;
              const ppfdContribution = (fixture.ppf / fixture.count) / 
                (4 * Math.PI * Math.pow(distanceInMeters, 2)) * 
                (verticalDistance / totalDistance);
              
              grid[y][x] += ppfdContribution;
            }
          }
        }
      }
    }
    
    const flatGrid = grid.flat();
    const avg = flatGrid.reduce((a, b) => a + b, 0) / flatGrid.length;
    const max = Math.max(...flatGrid);
    const min = Math.min(...flatGrid);
    const uniformity = min / avg;
    const dli = (avg * photoperiod * 3600) / 1000000;
    
    setMetrics({
      avgPPFD: Math.round(avg),
      maxPPFD: Math.round(max),
      minPPFD: Math.round(min),
      uniformity: Number(uniformity.toFixed(2)),
      dli: Number(dli.toFixed(1))
    });
    
    drawHeatMap(grid);
  };

  const drawHeatMap = (grid: number[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cellWidth = canvas.width / grid[0].length;
    const cellHeight = canvas.height / grid.length;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const value = grid[y][x];
        const normalized = Math.min(value / 1500, 1);
        const hue = (1 - normalized) * 240;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  };

  useEffect(() => {
    calculatePPFD();
  }, [fixture, room, photoperiod]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PPFD Heat Map Visualizer</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Fixture Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>PPF (μmol/s)</Label>
                  <Input
                    type="number"
                    value={fixture.ppf}
                    onChange={(e) => setFixture({...fixture, ppf: Number(e.target.value)})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Fixture Count</Label>
                  <Input
                    type="number"
                    value={fixture.count}
                    onChange={(e) => setFixture({...fixture, count: Number(e.target.value)})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Beam Angle (°)</Label>
                  <Slider
                    value={[fixture.beamAngle]}
                    onValueChange={(v) => setFixture({...fixture, beamAngle: v[0]})}
                    min={60}
                    max={150}
                    step={10}
                    className="mt-2"
                  />
                  <span className="text-sm text-gray-400">{fixture.beamAngle}°</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Room Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Width (ft)</Label>
                  <Input
                    type="number"
                    value={room.width}
                    onChange={(e) => setRoom({...room, width: Number(e.target.value)})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Length (ft)</Label>
                  <Input
                    type="number"
                    value={room.length}
                    onChange={(e) => setRoom({...room, length: Number(e.target.value)})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Mounting Height (ft)</Label>
                  <Input
                    type="number"
                    value={room.mountingHeight}
                    onChange={(e) => setRoom({...room, mountingHeight: Number(e.target.value)})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Photoperiod (hours)</Label>
                  <Input
                    type="number"
                    value={photoperiod}
                    onChange={(e) => setPhotoperiod(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>PPFD Distribution Map</CardTitle>
                <CardDescription>
                  Photosynthetic Photon Flux Density at canopy level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full border border-gray-700 rounded-lg bg-gray-950"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Average PPFD</div>
                    <div className="text-2xl font-bold text-green-400">
                      {metrics.avgPPFD}
                    </div>
                    <div className="text-xs text-gray-500">μmol/m²/s</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Max PPFD</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {metrics.maxPPFD}
                    </div>
                    <div className="text-xs text-gray-500">μmol/m²/s</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Min PPFD</div>
                    <div className="text-2xl font-bold text-red-400">
                      {metrics.minPPFD}
                    </div>
                    <div className="text-xs text-gray-500">μmol/m²/s</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Uniformity</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {metrics.uniformity}
                    </div>
                    <div className="text-xs text-gray-500">min/avg ratio</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">DLI</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {metrics.dli}
                    </div>
                    <div className="text-xs text-gray-500">mol/m²/day</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Power Density</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {((fixture.wattage * fixture.count) / (room.width * room.length)).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">W/ft²</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}