'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BarChart3, 
  Settings, 
  Download, 
  Save, 
  FolderOpen, 
  Grid, 
  Eye, 
  EyeOff,
  Plus,
  Move,
  RotateCw,
  Trash2,
  Calculator,
  Thermometer,
  Droplets,
  Target,
  Layers,
  FileText,
  Square,
  Circle,
  Triangle,
  Pentagon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Room {
  width: number;
  length: number;
  height: number;
  shape: 'rectangle' | 'square' | 'circle' | 'polygon';
}

interface Fixture {
  id: string;
  x: number;
  y: number;
  z: number;
  model: string;
  wattage: number;
  ppf: number;
  enabled: boolean;
}

export default function AdvancedDesignPage() {
  const [activeTab, setActiveTab] = useState('design');
  const [room, setRoom] = useState<Room>({
    width: 20,
    length: 16,
    height: 12,
    shape: 'rectangle'
  });
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedTool, setSelectedTool] = useState('place');
  const [showGrid, setShowGrid] = useState(true);
  const [showPPFDMap, setShowPPFDMap] = useState(true);

  const addFixture = () => {
    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      x: Math.random() * room.width,
      y: Math.random() * room.length,
      z: 8,
      model: 'VibeLux Pro LED',
      wattage: 650,
      ppf: 1750,
      enabled: true
    };
    setFixtures([...fixtures, newFixture]);
  };

  const totalPower = fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0);
  const totalPPF = fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf : 0), 0);
  const averagePPFD = fixtures.length > 0 ? Math.round(totalPPF / (room.width * room.length) * 2.5) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                Advanced Design Studio
              </h1>
              <p className="text-gray-400 mt-1">Professional 3D lighting design and optimization</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FolderOpen className="w-4 h-4 mr-2" />
                Import CAD
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
              <Button variant="default" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-gray-900/50 border-r border-gray-800 p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Square className="w-5 h-5" />
                    Room Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { shape: 'rectangle', icon: Square },
                      { shape: 'square', icon: Square },
                      { shape: 'circle', icon: Circle },
                      { shape: 'polygon', icon: Pentagon }
                    ].map(({ shape, icon: Icon }) => (
                      <Button
                        key={shape}
                        variant={room.shape === shape ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRoom({ ...room, shape: shape as any })}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-400">Width (ft)</label>
                      <input
                        type="number"
                        value={room.width}
                        onChange={(e) => setRoom({ ...room, width: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Length (ft)</label>
                      <input
                        type="number"
                        value={room.length}
                        onChange={(e) => setRoom({ ...room, length: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Design Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { tool: 'place', icon: Plus, label: 'Place' },
                      { tool: 'move', icon: Move, label: 'Move' },
                      { tool: 'rotate', icon: RotateCw, label: 'Rotate' }
                    ].map(({ tool, icon: Icon, label }) => (
                      <Button
                        key={tool}
                        variant={selectedTool === tool ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTool(tool)}
                        className="flex flex-col items-center gap-1 p-3"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grid Snap</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGrid(!showGrid)}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">PPFD Map</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPPFDMap(!showPPFDMap)}
                      >
                        {showPPFDMap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixtures" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fixture Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={addFixture} className="w-full mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Fixture
                  </Button>
                  
                  <div className="space-y-2">
                    {fixtures.map((fixture) => (
                      <div key={fixture.id} className="p-3 bg-gray-800 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{fixture.model}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFixtures(fixtures.filter(f => f.id !== fixture.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {fixture.wattage}W • {fixture.ppf} PPF
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-blue-400">{fixtures.length}</div>
                      <div className="text-xs text-gray-400">Fixtures</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-yellow-400">{totalPower}W</div>
                      <div className="text-xs text-gray-400">Total Power</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-green-400">{averagePPFD}</div>
                      <div className="text-xs text-gray-400">Avg PPFD</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-purple-400">{(totalPower / (room.width * room.length)).toFixed(1)}</div>
                      <div className="text-xs text-gray-400">W/ft²</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Project Name</label>
                    <input
                      type="text"
                      defaultValue="New Facility Design"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Target PPFD</label>
                    <input
                      type="number"
                      defaultValue="800"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-gray-900">
          <div className="absolute inset-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">3D Design Canvas</h3>
              <p className="text-gray-400 mb-4">Room: {room.width}' × {room.length}' × {room.height}'</p>
              <div className="text-sm text-gray-500">
                {fixtures.length} fixtures placed • {showGrid ? 'Grid ON' : 'Grid OFF'} • {showPPFDMap ? 'PPFD Map ON' : 'PPFD Map OFF'}
              </div>
            </div>
          </div>
          
          {/* Test Mode Banner */}
          <div className="absolute top-4 right-4 bg-green-900/20 border border-green-500/30 px-4 py-2 rounded-lg">
            <p className="text-green-400 text-sm font-semibold">🚀 Test Mode Active</p>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-gray-900/50 border-l border-gray-800 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate PDF Report
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export DWG/CAD
              </Button>
              <Button className="w-full" variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Photometric Report
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-purple-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Professional Features</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>✅ 3D Visualization</li>
              <li>✅ PPFD Calculations</li>
              <li>✅ Energy Analysis</li>
              <li>✅ CAD Import/Export</li>
              <li>✅ Professional Reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}