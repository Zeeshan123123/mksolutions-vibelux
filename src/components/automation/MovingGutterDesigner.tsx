'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  BarChart3, 
  Calendar, 
  AlertTriangle,
  Move,
  Sprout,
  Activity,
  Timer,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  MovingGutterSystem, 
  GutterSystemConfig, 
  defaultLettuceConfig,
  GutterPosition 
} from '@/lib/automation/moving-gutter-system';

interface MovingGutterDesignerProps {
  facilityId?: string;
  onConfigChange?: (config: GutterSystemConfig) => void;
}

export default function MovingGutterDesigner({ facilityId, onConfigChange }: MovingGutterDesignerProps) {
  const [config, setConfig] = useState<GutterSystemConfig>(defaultLettuceConfig);
  const [system, setSystem] = useState<MovingGutterSystem | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [plantingSchedule, setPlantingSchedule] = useState<any[]>([]);
  const [selectedGutter, setSelectedGutter] = useState<string | null>(null);

  // Initialize system when config changes
  useEffect(() => {
    const newSystem = new MovingGutterSystem(config);
    setSystem(newSystem);
    
    // Load initial status
    updateSystemStatus(newSystem);
    
    // Generate planting schedule
    const schedule = newSystem.getPlantingSchedule(8);
    setPlantingSchedule(schedule);
    
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  // Update system status
  const updateSystemStatus = useCallback((systemInstance?: MovingGutterSystem) => {
    const currentSystem = systemInstance || system;
    if (currentSystem) {
      const status = currentSystem.getSystemStatus();
      setSystemStatus(status);
    }
  }, [system]);

  // Auto-update status every 5 seconds when running
  useEffect(() => {
    if (!isRunning || !system) return;
    
    const interval = setInterval(() => {
      system.updatePlantGrowth();
      updateSystemStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isRunning, system, updateSystemStatus]);

  const handleStartSystem = async () => {
    if (!system) return;
    
    setIsRunning(true);
    
    // Start automation loop
    const runAutomation = async () => {
      if (config.automationEnabled && isRunning) {
        await system.runAutoSpacing();
        updateSystemStatus();
        
        // Schedule next run
        setTimeout(runAutomation, 30000); // Every 30 seconds
      }
    };
    
    runAutomation();
  };

  const handleStopSystem = () => {
    setIsRunning(false);
    system?.emergencyStop();
    updateSystemStatus();
  };

  const handleConfigUpdate = (updates: Partial<GutterSystemConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handlePlantGutter = (gutterId: string) => {
    if (!system) return;
    
    const plantPositions = Array.from({ length: Math.floor(config.systemLength * config.plantingDensity) }, 
      (_, i) => (i + 0.5) / config.plantingDensity
    );
    
    const success = system.plantCrop(gutterId, plantPositions);
    if (success) {
      updateSystemStatus();
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'seedling': 'bg-green-100 text-green-800',
      'vegetative': 'bg-blue-100 text-blue-800',
      'flowering': 'bg-yellow-100 text-yellow-800',
      'harvest': 'bg-orange-100 text-orange-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatSpacing = (spacing: number) => {
    return `${(spacing * 100).toFixed(1)}cm`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Moving Gutter System Designer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Automated NFT gutter spacing for optimal plant growth
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {systemStatus && (
            <div className="flex items-center space-x-2">
              <Activity className={`h-5 w-5 ${isRunning ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                {isRunning ? 'System Running' : 'System Stopped'}
              </span>
            </div>
          )}
          
          {!isRunning ? (
            <Button onClick={handleStartSystem} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Automation
            </Button>
          ) : (
            <Button onClick={handleStopSystem} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop System
            </Button>
          )}
        </div>
      </div>

      {/* System Overview */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Move className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Gutters
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemStatus.gutterCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Sprout className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Plants
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemStatus.totalPlants}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Spacing Efficiency
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(systemStatus.spacingEfficiency * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Light Efficiency
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(systemStatus.lightEfficiency * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visualization">3D View</TabsTrigger>
          <TabsTrigger value="gutters">Gutter Status</TabsTrigger>
          <TabsTrigger value="schedule">Planting Schedule</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        {/* 3D Visualization */}
        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>System Visualization</CardTitle>
              <CardDescription>
                Interactive 3D view of your moving gutter system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simplified 2D representation */}
                <div className="relative w-full h-full p-8">
                  <div className="text-xs text-gray-500 mb-4">
                    System: {config.systemLength}m × {config.systemWidth}m
                  </div>
                  
                  {/* Render gutters */}
                  <div className="relative h-full" style={{ width: '100%' }}>
                    {systemStatus?.gutterPositions.map((gutter: any, index: number) => {
                      const leftPercent = (gutter.position / config.systemWidth) * 100;
                      const isSelected = selectedGutter === gutter.id;
                      
                      return (
                        <div
                          key={gutter.id}
                          className={`absolute h-16 w-2 rounded cursor-pointer transition-all duration-300 ${
                            gutter.isMoving 
                              ? 'bg-blue-500 animate-pulse' 
                              : isSelected
                              ? 'bg-purple-600'
                              : 'bg-green-600'
                          }`}
                          style={{ 
                            left: `${leftPercent}%`,
                            top: `${20 + (index % 3) * 80}px`,
                            transform: 'translateX(-50%)'
                          }}
                          onClick={() => setSelectedGutter(isSelected ? null : gutter.id)}
                          title={`${gutter.id} - ${gutter.stage} (${gutter.plantCount} plants)`}
                        >
                          {/* Plant count indicator */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                            {gutter.plantCount}
                          </div>
                          
                          {/* Movement indicator */}
                          {gutter.isMoving && (
                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                              <Move className="h-3 w-3 text-blue-600 animate-bounce" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg">
                    <div className="text-xs font-medium mb-2">Legend</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                        Normal
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        Moving
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                        Selected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selected Gutter Info */}
              {selectedGutter && systemStatus && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {(() => {
                    const gutter = systemStatus.gutterPositions.find((g: any) => g.id === selectedGutter);
                    return gutter ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Position</p>
                          <p className="text-lg font-bold">{gutter.position.toFixed(2)}m</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spacing</p>
                          <p className="text-lg font-bold">{formatSpacing(gutter.spacing)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plant Age</p>
                          <p className="text-lg font-bold">{gutter.plantAge} days</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stage</p>
                          <Badge className={getStageColor(gutter.stage)}>
                            {gutter.stage}
                          </Badge>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gutter Status */}
        <TabsContent value="gutters">
          <Card>
            <CardHeader>
              <CardTitle>Gutter Status</CardTitle>
              <CardDescription>
                Individual gutter positions and plant information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus?.gutterPositions && (
                <div className="space-y-3">
                  {systemStatus.gutterPositions.map((gutter: any) => (
                    <div key={gutter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          gutter.isMoving ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                        }`}></div>
                        
                        <div>
                          <p className="font-medium">{gutter.id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Position: {gutter.position.toFixed(2)}m • Spacing: {formatSpacing(gutter.spacing)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getStageColor(gutter.stage)}>
                          {gutter.stage}
                        </Badge>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">{gutter.plantCount} plants</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {gutter.plantAge} days old
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlantGutter(gutter.id)}
                          disabled={gutter.plantCount > 0}
                        >
                          <Sprout className="h-4 w-4 mr-1" />
                          Plant
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planting Schedule */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Planting Schedule</CardTitle>
              <CardDescription>
                Optimized planting and harvest timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plantingSchedule.slice(0, 12).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          Week {item.week + 1} - {item.action === 'plant' ? 'Plant' : 'Harvest'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.date.toLocaleDateString()} • {item.gutterId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={item.action === 'plant' ? 'default' : 'secondary'}>
                        {item.action}
                      </Badge>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.expectedYield.toFixed(1)} kg expected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>System Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    System Length: {config.systemLength}m
                  </label>
                  <Slider
                    value={[config.systemLength]}
                    onValueChange={(value) => handleConfigUpdate({ systemLength: value[0] })}
                    min={6}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    System Width: {config.systemWidth}m
                  </label>
                  <Slider
                    value={[config.systemWidth]}
                    onValueChange={(value) => handleConfigUpdate({ systemWidth: value[0] })}
                    min={4}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Gutters: {config.gutterCount}
                  </label>
                  <Slider
                    value={[config.gutterCount]}
                    onValueChange={(value) => handleConfigUpdate({ gutterCount: value[0] })}
                    min={6}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Automation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enable Automation</label>
                  <Switch
                    checked={config.automationEnabled}
                    onCheckedChange={(checked) => handleConfigUpdate({ automationEnabled: checked })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Movement Speed: {config.movementSpeed} m/min
                  </label>
                  <Slider
                    value={[config.movementSpeed]}
                    onValueChange={(value) => handleConfigUpdate({ movementSpeed: value[0] })}
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Spacing: {formatSpacing(config.maxSpacing)}
                  </label>
                  <Slider
                    value={[config.maxSpacing]}
                    onValueChange={(value) => handleConfigUpdate({ maxSpacing: value[0] })}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Min Spacing: {formatSpacing(config.minSpacing)}
                  </label>
                  <Slider
                    value={[config.minSpacing]}
                    onValueChange={(value) => handleConfigUpdate({ minSpacing: value[0] })}
                    min={0.1}
                    max={0.8}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}