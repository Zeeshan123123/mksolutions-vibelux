'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';
import { 
  Zap,
  Calendar,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Activity,
  AlertCircle,
  Palette,
  Play,
  Pause,
  Map
} from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  area: number;
  cropType?: string;
  growthStage?: string;
}

interface LightRecipe {
  id: string;
  name: string;
  cropType: string;
  spectrumBlue: number;
  spectrumGreen: number;
  spectrumRed: number;
  spectrumFarRed: number;
  spectrumUV: number;
  targetPPFD: number;
  photoperiodHours: number;
}

interface ZoneStatus {
  online: number;
  offline: number;
  totalPower: number;
  averageIntensity: number;
}

interface Schedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  rampDuration: number;
  intensity: number;
}

export function HLPZoneControl() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [recipes, setRecipes] = useState<LightRecipe[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Control states
  const [intensity, setIntensity] = useState(100);
  const [schedule, setSchedule] = useState<Schedule>({
    enabled: false,
    startTime: '08:00',
    endTime: '20:00',
    rampDuration: 30,
    intensity: 100
  });

  useEffect(() => {
    loadZones();
    loadRecipes();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      loadZoneStatus();
    }
  }, [selectedZone]);

  const loadZones = async () => {
    try {
      const response = await fetch('/api/v1/zones');
      const data = await response.json();
      setZones(data.zones || []);
    } catch (error) {
      logger.error('system', 'Error loading zones:', error );
    }
  };

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/v1/light-recipes');
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      logger.error('system', 'Error loading recipes:', error );
    }
  };

  const loadZoneStatus = async () => {
    if (!selectedZone) return;
    
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'getStatus',
          zoneId: selectedZone
        })
      });

      const result = await response.json();
      if (result.success && result.result) {
        setZoneStatus(result.result);
      }
    } catch (error) {
      logger.error('system', 'Error loading zone status:', error );
    }
  };

  const applyRecipeToZone = async () => {
    if (!selectedZone || !selectedRecipe) {
      toast.error('Please select both a zone and a recipe');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'applyRecipe',
          zoneId: selectedZone,
          data: { recipeId: selectedRecipe }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Recipe applied successfully');
        loadZoneStatus();
      } else {
        toast.error('Failed to apply recipe');
      }
    } catch (error) {
      toast.error('Error applying recipe');
    } finally {
      setLoading(false);
    }
  };

  const setZoneIntensity = async () => {
    if (!selectedZone) {
      toast.error('Please select a zone');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'setIntensity',
          zoneId: selectedZone,
          data: { 
            intensity,
            rampTime: 5 // 5 second ramp
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Zone intensity updated');
        loadZoneStatus();
      } else {
        toast.error('Failed to update intensity');
      }
    } catch (error) {
      toast.error('Error updating intensity');
    } finally {
      setLoading(false);
    }
  };

  const applySchedule = async () => {
    if (!selectedZone) {
      toast.error('Please select a zone');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'setSchedule',
          zoneId: selectedZone,
          data: { 
            schedule: {
              enabled: schedule.enabled,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              rampDuration: schedule.rampDuration,
              channels: [
                { channelId: 0, intensity: schedule.intensity }
              ]
            }
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Schedule applied successfully');
      } else {
        toast.error('Failed to apply schedule');
      }
    } catch (error) {
      toast.error('Error applying schedule');
    } finally {
      setLoading(false);
    }
  };

  const selectedZoneData = zones.find(z => z.id === selectedZone);
  const selectedRecipeData = recipes.find(r => r.id === selectedRecipe);

  return (
    <div className="space-y-6">
      {/* Zone Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Control via HLP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a zone to control" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      <div className="flex items-center">
                        <Map className="h-4 w-4 mr-2" />
                        {zone.name}
                        {zone.cropType && (
                          <Badge variant="secondary" className="ml-2">
                            {zone.cropType}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Recipe</Label>
              <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a light recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        {recipe.name}
                        <Badge variant="outline" className="ml-2">
                          {recipe.targetPPFD} PPFD
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={applyRecipeToZone}
            disabled={!selectedZone || !selectedRecipe || loading}
            className="w-full"
          >
            <Palette className="mr-2 h-4 w-4" />
            Apply Recipe to Zone
          </Button>
        </CardContent>
      </Card>

      {/* Zone Status */}
      {selectedZone && zoneStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Zone Status - {selectedZoneData?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Devices Online</span>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-2xl font-bold">{zoneStatus.online}</span>
                  {zoneStatus.offline > 0 && (
                    <span className="ml-2 text-sm text-red-500">
                      ({zoneStatus.offline} offline)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Total Power</span>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-2xl font-bold">{zoneStatus.totalPower}W</span>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Average Intensity</span>
                <div className="flex items-center">
                  <Sun className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="text-2xl font-bold">{zoneStatus.averageIntensity}%</span>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Zone Area</span>
                <div className="flex items-center">
                  <Map className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-2xl font-bold">{selectedZoneData?.area || 0} m²</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone Controls */}
      {selectedZone && (
        <Card>
          <CardHeader>
            <CardTitle>Zone Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="intensity">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="intensity">Intensity</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="recipe">Recipe Details</TabsTrigger>
              </TabsList>

              <TabsContent value="intensity" className="space-y-4">
                <div className="space-y-2">
                  <Label>Zone Intensity Control</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[intensity]}
                      onValueChange={([value]) => setIntensity(value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono">{intensity}%</span>
                  </div>
                </div>
                <Button
                  onClick={setZoneIntensity}
                  disabled={loading}
                  className="w-full"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Apply Intensity
                </Button>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Schedule</Label>
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => 
                        setSchedule(prev => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <div className="flex items-center">
                        <Sunrise className="h-4 w-4 mr-2 text-orange-500" />
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => 
                            setSchedule(prev => ({ ...prev, startTime: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <div className="flex items-center">
                        <Sunset className="h-4 w-4 mr-2 text-blue-500" />
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => 
                            setSchedule(prev => ({ ...prev, endTime: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ramp Duration (minutes)</Label>
                    <Slider
                      value={[schedule.rampDuration]}
                      onValueChange={([value]) => 
                        setSchedule(prev => ({ ...prev, rampDuration: value }))
                      }
                      max={120}
                      step={5}
                    />
                    <span className="text-sm text-muted-foreground">
                      Gradual transition over {schedule.rampDuration} minutes
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Schedule Intensity</Label>
                    <Slider
                      value={[schedule.intensity]}
                      onValueChange={([value]) => 
                        setSchedule(prev => ({ ...prev, intensity: value }))
                      }
                      max={100}
                      step={5}
                    />
                  </div>
                </div>

                <Button
                  onClick={applySchedule}
                  disabled={loading}
                  className="w-full"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Apply Schedule
                </Button>
              </TabsContent>

              <TabsContent value="recipe" className="space-y-4">
                {selectedRecipeData ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        {selectedRecipeData.name}
                      </h4>
                      <Badge variant="outline" className="mb-2">
                        {selectedRecipeData.cropType}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label>Spectrum Distribution</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Blue (400-500nm)</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${selectedRecipeData.spectrumBlue}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono w-10">
                              {selectedRecipeData.spectrumBlue}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Green (500-600nm)</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${selectedRecipeData.spectrumGreen}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono w-10">
                              {selectedRecipeData.spectrumGreen}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Red (600-700nm)</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${selectedRecipeData.spectrumRed}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono w-10">
                              {selectedRecipeData.spectrumRed}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Far Red (700-800nm)</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-pink-500 h-2 rounded-full"
                                style={{ width: `${selectedRecipeData.spectrumFarRed}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono w-10">
                              {selectedRecipeData.spectrumFarRed}%
                            </span>
                          </div>
                        </div>

                        {selectedRecipeData.spectrumUV > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">UV (280-400nm)</span>
                            <div className="flex items-center">
                              <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${selectedRecipeData.spectrumUV}%` }}
                                />
                              </div>
                              <span className="text-sm font-mono w-10">
                                {selectedRecipeData.spectrumUV}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target PPFD:</span>
                        <span className="font-mono">{selectedRecipeData.targetPPFD} μmol/m²/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Photoperiod:</span>
                        <span className="font-mono">{selectedRecipeData.photoperiodHours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Light Integral:</span>
                        <span className="font-mono">
                          {(selectedRecipeData.targetPPFD * selectedRecipeData.photoperiodHours * 3.6 / 1000).toFixed(1)} mol/m²/day
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Select a recipe to view details
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}