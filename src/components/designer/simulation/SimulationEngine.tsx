'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Eye, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun,
  Moon,
  Clock,
  BarChart3,
  Settings,
  Monitor,
  Lightbulb,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';

interface SimulationEngineProps {
  placedFixtures: any[];
  roomDimensions: {
    length: number;
    width: number;
    height: number;
  };
  onSimulationUpdate?: (results: any) => void;
}

interface SimulationState {
  isRunning: boolean;
  currentTime: number; // 0-24 hours
  dayOfYear: number; // 1-365
  photoperiod: number; // hours of light per day
  currentDLI: number;
  currentPPFD: number;
  temperature: number;
  humidity: number;
  co2Level: number;
  plantGrowthStage: 'seedling' | 'vegetative' | 'flowering';
  energyConsumption: number;
  timeSpeed: number; // simulation speed multiplier
}

export function SimulationEngine({
  placedFixtures,
  roomDimensions,
  onSimulationUpdate
}: SimulationEngineProps) {
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentTime: 6, // Start at 6 AM
    dayOfYear: 1,
    photoperiod: 18,
    currentDLI: 0,
    currentPPFD: 0,
    temperature: 25,
    humidity: 60,
    co2Level: 400,
    plantGrowthStage: 'vegetative',
    energyConsumption: 0,
    timeSpeed: 1
  });

  const [simulationSettings, setSimulationSettings] = useState({
    enableDimming: true,
    enableThermalSimulation: true,
    enablePlantResponse: true,
    enableEnergyOptimization: false,
    lightSchedule: 'custom', // 'sunrise', 'custom', 'dli-based'
    targetDLI: 40,
    maxTemperature: 28,
    minHumidity: 50,
    maxHumidity: 70
  });

  const [visualizations, setVisualizations] = useState({
    showLightDistribution: true,
    showTemperatureGradient: false,
    showPlantResponse: false,
    showEnergyFlow: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate if lights should be on based on schedule
  const shouldLightsBeOn = (time: number): boolean => {
    if (simulationSettings.lightSchedule === 'sunrise') {
      // Simulate natural sunrise/sunset
      const sunrise = 6;
      const sunset = sunrise + simulation.photoperiod;
      return time >= sunrise && time < sunset;
    } else {
      // Custom schedule - lights on from 6 AM to 6 AM + photoperiod
      const lightStart = 6;
      const lightEnd = lightStart + simulation.photoperiod;
      if (lightEnd <= 24) {
        return time >= lightStart && time < lightEnd;
      } else {
        return time >= lightStart || time < (lightEnd - 24);
      }
    }
  };

  // Calculate current PPFD based on time and dimming
  const calculateCurrentPPFD = (time: number): number => {
    if (!shouldLightsBeOn(time)) return 0;

    const totalPPF = placedFixtures.reduce((sum, fixture) => {
      if (!fixture.enabled) return sum;
      return sum + fixture.model.ppf * (fixture.dimmingLevel / 100);
    }, 0);

    const roomArea = roomDimensions.length * roomDimensions.width;
    let basePPFD = roomArea > 0 ? totalPPF / roomArea : 0;

    // Apply dimming schedule if enabled
    if (simulationSettings.enableDimming) {
      const lightStart = 6;
      const lightEnd = lightStart + simulation.photoperiod;
      const lightDuration = simulation.photoperiod;
      
      // Create a dimming curve
      const timeIntoPhotoperiod = time - lightStart;
      if (timeIntoPhotoperiod < 0 || timeIntoPhotoperiod > lightDuration) return 0;
      
      // Gradual ramp up/down in first/last hour
      if (timeIntoPhotoperiod < 1) {
        basePPFD *= timeIntoPhotoperiod; // 0-100% over first hour
      } else if (timeIntoPhotoperiod > lightDuration - 1) {
        basePPFD *= (lightDuration - timeIntoPhotoperiod); // 100%-0% over last hour
      }
    }

    return Math.max(0, basePPFD);
  };

  // Calculate current DLI based on photoperiod and PPFD
  const calculateCurrentDLI = (avgPPFD: number, photoperiod: number): number => {
    // DLI = PPFD × photoperiod × 0.0036 (conversion factor)
    return avgPPFD * photoperiod * 0.0036;
  };

  // Calculate temperature based on lighting and time
  const calculateTemperature = (time: number, ppfd: number): number => {
    const baseTemp = 22; // Base room temperature
    const outsideTemp = 20 + 8 * Math.sin((time - 6) * Math.PI / 12); // Daily temperature cycle
    
    // Heat from lights
    const totalWattage = placedFixtures.reduce((sum, fixture) => {
      if (!fixture.enabled || !shouldLightsBeOn(time)) return sum;
      return sum + fixture.model.wattage * (fixture.dimmingLevel / 100);
    }, 0);
    
    const roomVolume = roomDimensions.length * roomDimensions.width * roomDimensions.height;
    const heatGain = totalWattage * 0.003 / (roomVolume / 100); // Heat from lights
    
    return baseTemp + (outsideTemp - baseTemp) * 0.1 + heatGain;
  };

  // Calculate humidity based on temperature and plant transpiration
  const calculateHumidity = (temperature: number, ppfd: number): number => {
    const baseHumidity = 55;
    const plantTranspiration = ppfd > 0 ? (ppfd / 1000) * 10 : 0; // Plants add humidity
    const temperatureEffect = (temperature - 25) * -2; // Higher temp = lower RH
    
    return Math.max(30, Math.min(90, baseHumidity + plantTranspiration + temperatureEffect));
  };

  // Calculate CO2 consumption by plants
  const calculateCO2Level = (ppfd: number): number => {
    const baseCO2 = 400;
    const plantConsumption = ppfd > 0 ? ppfd * 0.1 : 0; // Plants consume CO2 during photosynthesis
    
    return Math.max(350, baseCO2 - plantConsumption);
  };

  // Calculate energy consumption
  const calculateEnergyConsumption = (time: number): number => {
    const totalWattage = placedFixtures.reduce((sum, fixture) => {
      if (!fixture.enabled || !shouldLightsBeOn(time)) return sum;
      return sum + fixture.model.wattage * (fixture.dimmingLevel / 100);
    }, 0);
    
    return totalWattage / 1000; // kW
  };

  // Update simulation state
  const updateSimulation = () => {
    setSimulation(prev => {
      const newTime = (prev.currentTime + 0.1 * prev.timeSpeed) % 24;
      const newDay = prev.currentTime + 0.1 * prev.timeSpeed >= 24 ? prev.dayOfYear + 1 : prev.dayOfYear;
      
      const currentPPFD = calculateCurrentPPFD(newTime);
      const temperature = calculateTemperature(newTime, currentPPFD);
      const humidity = calculateHumidity(temperature, currentPPFD);
      const co2Level = calculateCO2Level(currentPPFD);
      const energyConsumption = calculateEnergyConsumption(newTime);
      
      // Calculate daily DLI (simplified - using current PPFD as average)
      const dailyAvgPPFD = shouldLightsBeOn(newTime) ? currentPPFD : 0;
      const currentDLI = calculateCurrentDLI(dailyAvgPPFD, prev.photoperiod);

      const newState = {
        ...prev,
        currentTime: newTime,
        dayOfYear: newDay > 365 ? 1 : newDay,
        currentPPFD,
        currentDLI,
        temperature,
        humidity,
        co2Level,
        energyConsumption
      };

      onSimulationUpdate?.(newState);
      return newState;
    });
  };

  // Simulation control
  const startSimulation = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(updateSimulation, 100); // Update every 100ms
    }
    setSimulation(prev => ({ ...prev, isRunning: true }));
  };

  const pauseSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSimulation(prev => ({ ...prev, isRunning: false }));
  };

  const stopSimulation = () => {
    pauseSimulation();
    setSimulation(prev => ({
      ...prev,
      currentTime: 6,
      dayOfYear: 1,
      currentDLI: 0,
      currentPPFD: 0,
      energyConsumption: 0
    }));
  };

  const resetSimulation = () => {
    stopSimulation();
    // Reset to initial state
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isLightsOn = shouldLightsBeOn(simulation.currentTime);

  if (placedFixtures.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Fixtures to Simulate</h3>
          <p className="text-gray-500">Place some fixtures in the design mode to run simulations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Real-Time Simulation
            </h2>
            <p className="text-sm text-gray-400">
              Day {simulation.dayOfYear} • {formatTime(simulation.currentTime)} • 
              {isLightsOn ? ' Lights ON' : ' Lights OFF'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={simulation.isRunning ? pauseSimulation : startSimulation}
              variant={simulation.isRunning ? "destructive" : "default"}
              className="bg-green-600 hover:bg-green-700"
            >
              {simulation.isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={stopSimulation} variant="outline">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button onClick={resetSimulation} variant="ghost">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Main Simulation Display */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Time Control */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Simulation Speed</Label>
                  <Slider
                    value={[simulation.timeSpeed]}
                    onValueChange={([value]) => setSimulation(prev => ({ ...prev, timeSpeed: value }))}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-400 mt-1">{simulation.timeSpeed}x speed</div>
                </div>
                <div>
                  <Label className="text-sm">Photoperiod</Label>
                  <Slider
                    value={[simulation.photoperiod]}
                    onValueChange={([value]) => setSimulation(prev => ({ ...prev, photoperiod: value }))}
                    min={8}
                    max={24}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-400 mt-1">{simulation.photoperiod} hours/day</div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Light Schedule</span>
                  <div className={`w-3 h-3 rounded-full ${isLightsOn ? 'bg-green-400' : 'bg-gray-600'}`} />
                </div>
                <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400"
                    style={{
                      width: `${(simulation.photoperiod / 24) * 100}%`,
                      marginLeft: `${(6 / 24) * 100}%` // Starts at 6 AM
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Current PPFD</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {simulation.currentPPFD.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">μmol/m²/s</p>
                  </div>
                  <Lightbulb className={`w-8 h-8 ${isLightsOn ? 'text-yellow-400' : 'text-gray-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Daily DLI</p>
                    <p className="text-2xl font-bold text-green-400">
                      {simulation.currentDLI.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">mol/m²/day</p>
                  </div>
                  <Sun className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Temperature</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {simulation.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      {(simulation.temperature * 9/5 + 32).toFixed(1)}°F
                    </p>
                  </div>
                  <Thermometer className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Energy</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {simulation.energyConsumption.toFixed(1)}kW
                    </p>
                    <p className="text-xs text-gray-500">Current draw</p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Conditions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Environmental Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Humidity</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {simulation.humidity.toFixed(1)}%
                  </div>
                  <Progress 
                    value={simulation.humidity} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Target: {simulationSettings.minHumidity}-{simulationSettings.maxHumidity}%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">CO₂ Level</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-400 mb-1">
                    {simulation.co2Level.toFixed(0)}
                  </div>
                  <Progress 
                    value={(simulation.co2Level / 1500) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-400 mt-1">ppm</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Plant Stage</span>
                  </div>
                  <div className="text-lg font-bold text-green-400 mb-1 capitalize">
                    {simulation.plantGrowthStage}
                  </div>
                  <div className="text-xs text-gray-400">
                    Day {simulation.dayOfYear}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24-Hour Visualization */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">24-Hour Light Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-20 bg-gray-900 rounded-lg overflow-hidden">
                  {/* Time grid */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-gray-700 last:border-r-0"
                        style={{ height: '100%' }}
                      />
                    ))}
                  </div>

                  {/* Light schedule */}
                  <div 
                    className="absolute top-0 h-full bg-gradient-to-r from-orange-400/30 via-yellow-400/30 to-orange-400/30"
                    style={{
                      left: `${(6 / 24) * 100}%`,
                      width: `${(simulation.photoperiod / 24) * 100}%`
                    }}
                  />

                  {/* Current time indicator */}
                  <div 
                    className="absolute top-0 w-0.5 h-full bg-white shadow-lg"
                    style={{ left: `${(simulation.currentTime / 24) * 100}%` }}
                  />

                  {/* Time labels */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
                    <span>00</span>
                    <span>06</span>
                    <span>12</span>
                    <span>18</span>
                    <span>24</span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  Current: {formatTime(simulation.currentTime)} • 
                  Lights {isLightsOn ? 'ON' : 'OFF'} • 
                  {simulation.photoperiod}h photoperiod
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Simulation Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Dimming</Label>
                <Switch
                  checked={simulationSettings.enableDimming}
                  onCheckedChange={(checked) => 
                    setSimulationSettings(prev => ({ ...prev, enableDimming: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Thermal Simulation</Label>
                <Switch
                  checked={simulationSettings.enableThermalSimulation}
                  onCheckedChange={(checked) => 
                    setSimulationSettings(prev => ({ ...prev, enableThermalSimulation: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Plant Response</Label>
                <Switch
                  checked={simulationSettings.enablePlantResponse}
                  onCheckedChange={(checked) => 
                    setSimulationSettings(prev => ({ ...prev, enablePlantResponse: checked }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm">Target DLI</Label>
                <Slider
                  value={[simulationSettings.targetDLI]}
                  onValueChange={([value]) => 
                    setSimulationSettings(prev => ({ ...prev, targetDLI: value }))
                  }
                  min={20}
                  max={60}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {simulationSettings.targetDLI} mol/m²/day
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizations
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Light Distribution</Label>
                <Switch
                  checked={visualizations.showLightDistribution}
                  onCheckedChange={(checked) => 
                    setVisualizations(prev => ({ ...prev, showLightDistribution: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Temperature Gradient</Label>
                <Switch
                  checked={visualizations.showTemperatureGradient}
                  onCheckedChange={(checked) => 
                    setVisualizations(prev => ({ ...prev, showTemperatureGradient: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Plant Response</Label>
                <Switch
                  checked={visualizations.showPlantResponse}
                  onCheckedChange={(checked) => 
                    setVisualizations(prev => ({ ...prev, showPlantResponse: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Energy Flow</Label>
                <Switch
                  checked={visualizations.showEnergyFlow}
                  onCheckedChange={(checked) => 
                    setVisualizations(prev => ({ ...prev, showEnergyFlow: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Quick Stats
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Fixtures:</span>
                <span>{placedFixtures.filter(f => f.enabled).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Power:</span>
                <span>{placedFixtures.reduce((sum, f) => f.enabled ? sum + f.model.wattage : sum, 0)}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Efficiency:</span>
                <span>
                  {placedFixtures.length > 0 
                    ? (placedFixtures.reduce((sum, f) => sum + f.model.efficacy, 0) / placedFixtures.length).toFixed(1)
                    : 0} μmol/J
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coverage Area:</span>
                <span>{(roomDimensions.length * roomDimensions.width).toFixed(1)}m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}