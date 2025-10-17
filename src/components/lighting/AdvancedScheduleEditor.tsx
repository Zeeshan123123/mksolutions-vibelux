'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Clock, 
  Sun, 
  Sunset,
  Plus,
  Trash2,
  Copy,
  Save,
  Play,
  Zap,
  TrendingUp,
  Moon,
  Sunrise,
  Settings
} from 'lucide-react';
import {
  SpectralSetpoint,
  DimmingConfig,
  AdvancedSchedule,
  generateCropSchedule,
  calculateCurrentSpectrum,
  intensityToVoltage
} from '@/lib/protocols/hlp/advanced-scheduling';
import { HLPChannelType } from '@/lib/protocols/hlp/types';

export function AdvancedScheduleEditor() {
  const [schedule, setSchedule] = useState<AdvancedSchedule>(generateCropSchedule('lettuce'));
  const [selectedSetpoint, setSelectedSetpoint] = useState<number>(0);
  const [previewTime, setPreviewTime] = useState<string>('12:00');
  const [showVoltageOutput, setShowVoltageOutput] = useState(false);

  // Add new setpoint
  const addSetpoint = () => {
    const newSetpoint: SpectralSetpoint = {
      time: '12:00',
      spectrum: {
        [HLPChannelType.BLUE]: 20,
        [HLPChannelType.RED]: 70,
        [HLPChannelType.FAR_RED]: 10
      },
      intensity: 100,
      transitionMinutes: 30,
      name: `Setpoint ${schedule.dailySetpoints.length + 1}`
    };
    
    setSchedule(prev => ({
      ...prev,
      dailySetpoints: [...prev.dailySetpoints, newSetpoint].sort((a, b) => 
        a.time.localeCompare(b.time)
      )
    }));
  };

  // Remove setpoint
  const removeSetpoint = (index: number) => {
    if (schedule.dailySetpoints.length <= 2) {
      toast.error('Minimum 2 setpoints required');
      return;
    }
    
    setSchedule(prev => ({
      ...prev,
      dailySetpoints: prev.dailySetpoints.filter((_, i) => i !== index)
    }));
    
    if (selectedSetpoint >= index && selectedSetpoint > 0) {
      setSelectedSetpoint(selectedSetpoint - 1);
    }
  };

  // Update setpoint
  const updateSetpoint = (index: number, updates: Partial<SpectralSetpoint>) => {
    setSchedule(prev => ({
      ...prev,
      dailySetpoints: prev.dailySetpoints.map((sp, i) => 
        i === index ? { ...sp, ...updates } : sp
      ).sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  // Update spectrum for selected setpoint
  const updateSpectrum = (channel: HLPChannelType, value: number) => {
    const setpoint = schedule.dailySetpoints[selectedSetpoint];
    updateSetpoint(selectedSetpoint, {
      spectrum: { ...setpoint.spectrum, [channel]: value }
    });
  };

  // Update dimming config
  const updateDimmingConfig = (updates: Partial<DimmingConfig>) => {
    setSchedule(prev => ({
      ...prev,
      dimmingConfig: { ...prev.dimmingConfig!, ...updates }
    }));
  };

  // Calculate preview
  const previewDate = new Date();
  const [hours, minutes] = previewTime.split(':').map(Number);
  previewDate.setHours(hours, minutes, 0, 0);
  const preview = calculateCurrentSpectrum(schedule, previewDate);

  // Calculate voltage output
  const voltageOutput = schedule.dimmingConfig 
    ? intensityToVoltage(preview.intensity, schedule.dimmingConfig)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Schedule Editor</h2>
          <p className="text-muted-foreground">
            Create complex lighting schedules with multiple daily setpoints and spectral transitions
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={schedule.id} onValueChange={(crop) => {
            setSchedule(generateCropSchedule(crop));
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lettuce-standard">Lettuce</SelectItem>
              <SelectItem value="cannabis-veg">Cannabis Veg</SelectItem>
              <SelectItem value="cannabis-flower">Cannabis Flower</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Schedule
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Schedule Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Setpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual Timeline */}
            <div className="relative h-32 bg-gradient-to-r from-gray-900 via-yellow-100 to-gray-900 rounded-lg p-4">
              <div className="absolute inset-x-0 top-2 flex justify-between px-4 text-xs">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
              
              {/* Setpoint markers */}
              {schedule.dailySetpoints.map((sp, index) => {
                const [h, m] = sp.time.split(':').map(Number);
                const position = ((h * 60 + m) / (24 * 60)) * 100;
                return (
                  <div
                    key={index}
                    className={`absolute top-1/2 -translate-y-1/2 cursor-pointer ${
                      selectedSetpoint === index ? 'z-10' : ''
                    }`}
                    style={{ left: `${position}%` }}
                    onClick={() => setSelectedSetpoint(index)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedSetpoint === index 
                        ? 'bg-primary border-primary scale-150' 
                        : 'bg-white border-gray-400'
                    }`} />
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                      {sp.name || sp.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Setpoint List */}
            <div className="space-y-2">
              {schedule.dailySetpoints.map((sp, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSetpoint === index 
                      ? 'bg-primary/10 border border-primary' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => setSelectedSetpoint(index)}
                >
                  <Clock className="h-4 w-4" />
                  <Input
                    type="time"
                    value={sp.time}
                    onChange={(e) => updateSetpoint(index, { time: e.target.value })}
                    className="w-24"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Input
                    value={sp.name || ''}
                    onChange={(e) => updateSetpoint(index, { name: e.target.value })}
                    placeholder="Setpoint name"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Badge variant="secondary">{sp.intensity}%</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSetpoint(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                onClick={addSetpoint} 
                variant="outline" 
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Setpoint
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Setpoint Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {schedule.dailySetpoints[selectedSetpoint]?.name || 'Setpoint'} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Intensity */}
            <div className="space-y-2">
              <Label>Master Intensity</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[schedule.dailySetpoints[selectedSetpoint]?.intensity || 0]}
                  onValueChange={([value]) => 
                    updateSetpoint(selectedSetpoint, { intensity: value })
                  }
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-right font-mono">
                  {schedule.dailySetpoints[selectedSetpoint]?.intensity || 0}%
                </span>
              </div>
            </div>

            {/* Transition Time */}
            <div className="space-y-2">
              <Label>Transition Time (minutes)</Label>
              <Input
                type="number"
                value={schedule.dailySetpoints[selectedSetpoint]?.transitionMinutes || 30}
                onChange={(e) => 
                  updateSetpoint(selectedSetpoint, { 
                    transitionMinutes: parseInt(e.target.value) || 0 
                  })
                }
                min={0}
                max={120}
              />
            </div>

            {/* Spectrum Controls */}
            <div className="space-y-3">
              <Label>Spectrum Mix</Label>
              {Object.entries({
                [HLPChannelType.BLUE]: { color: 'bg-blue-500', label: 'Blue (400-500nm)' },
                [HLPChannelType.GREEN]: { color: 'bg-green-500', label: 'Green (500-600nm)' },
                [HLPChannelType.RED]: { color: 'bg-red-500', label: 'Red (600-700nm)' },
                [HLPChannelType.FAR_RED]: { color: 'bg-pink-500', label: 'Far Red (700-800nm)' },
                [HLPChannelType.UV]: { color: 'bg-purple-500', label: 'UV (280-400nm)' }
              }).map(([channel, config]) => {
                const value = schedule.dailySetpoints[selectedSetpoint]?.spectrum[channel as HLPChannelType] || 0;
                return (
                  <div key={channel} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{config.label}</span>
                      <span className="font-mono">{value}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${config.color}`} />
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => updateSpectrum(channel as HLPChannelType, v)}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dimming Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Dimming Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Dimming Type</Label>
              <Select
                value={schedule.dimmingConfig?.type}
                onValueChange={(type) => 
                  updateDimmingConfig({ type: type as DimmingConfig['type'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10V">0-10V</SelectItem>
                  <SelectItem value="PWM">PWM</SelectItem>
                  <SelectItem value="DALI">DALI</SelectItem>
                  <SelectItem value="Phase">Phase Cut</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Voltage (V)</Label>
              <Input
                type="number"
                value={schedule.dimmingConfig?.voltageMin || 1}
                onChange={(e) => 
                  updateDimmingConfig({ voltageMin: parseFloat(e.target.value) })
                }
                min={0}
                max={10}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Voltage (V)</Label>
              <Input
                type="number"
                value={schedule.dimmingConfig?.voltageMax || 10}
                onChange={(e) => 
                  updateDimmingConfig({ voltageMax: parseFloat(e.target.value) })
                }
                min={0}
                max={10}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Dimming Curve</Label>
              <Select
                value={schedule.dimmingConfig?.dimmingCurve}
                onValueChange={(curve) => 
                  updateDimmingConfig({ dimmingCurve: curve as DimmingConfig['dimmingCurve'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="logarithmic">Logarithmic</SelectItem>
                  <SelectItem value="square">Square Law</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Switch
              checked={schedule.dimmingConfig?.inverseLogic || false}
              onCheckedChange={(checked) => 
                updateDimmingConfig({ inverseLogic: checked })
              }
            />
            <Label>Inverse Logic (10V = Off, 0V = Full)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Preview Time</Label>
              <Input
                type="time"
                value={previewTime}
                onChange={(e) => setPreviewTime(e.target.value)}
                className="w-32"
              />
              <div className="flex-1 text-sm">
                <span className="text-muted-foreground">Active: </span>
                <Badge variant="outline">{preview.activeSetpoint}</Badge>
                {preview.nextTransition && (
                  <span className="ml-2 text-muted-foreground">
                    Next transition: {preview.nextTransition.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <Switch
                checked={showVoltageOutput}
                onCheckedChange={setShowVoltageOutput}
              />
              <Label>Show Voltage</Label>
            </div>

            {/* Current Output */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Spectrum Output</Label>
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  {Object.entries(preview.spectrum).map(([channel, value]) => (
                    <div key={channel} className="flex justify-between text-sm">
                      <span>{channel}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="font-mono w-10 text-right">
                          {Math.round(value)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Master Intensity</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-center mb-2">
                    {preview.intensity}%
                  </div>
                  {showVoltageOutput && schedule.dimmingConfig && (
                    <div className="text-center text-sm text-muted-foreground">
                      Output: {voltageOutput}V
                      {schedule.dimmingConfig.inverseLogic && ' (inverted)'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}