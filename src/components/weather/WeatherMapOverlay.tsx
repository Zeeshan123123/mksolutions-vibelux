'use client';

import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudRain, Thermometer, Wind, Droplets, Eye, EyeOff } from 'lucide-react';
import { logger } from '@/lib/client-logger';
import { cn } from '@/lib/utils';

interface WeatherMapOverlayProps {
  map: mapboxgl.Map | null;
  className?: string;
}

// OpenWeatherMap API key - must be provided via environment variable
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  logger.warn('system', 'NEXT_PUBLIC_OPENWEATHER_API_KEY not found - weather overlay will be disabled');
}

type WeatherLayer = 'temp' | 'precipitation' | 'clouds' | 'wind' | 'humidity';

export function WeatherMapOverlay({ map, className }: WeatherMapOverlayProps) {
  const [activeLayer, setActiveLayer] = useState<WeatherLayer | null>(null);
  const [opacity, setOpacity] = useState(0.6);

  const weatherLayers: Record<WeatherLayer, { name: string; icon: React.ReactNode; color: string }> = {
    temp: { name: 'Temperature', icon: <Thermometer className="h-4 w-4" />, color: 'text-orange-600' },
    precipitation: { name: 'Precipitation', icon: <CloudRain className="h-4 w-4" />, color: 'text-blue-600' },
    clouds: { name: 'Cloud Cover', icon: <Cloud className="h-4 w-4" />, color: 'text-gray-600' },
    wind: { name: 'Wind Speed', icon: <Wind className="h-4 w-4" />, color: 'text-teal-600' },
    humidity: { name: 'Humidity', icon: <Droplets className="h-4 w-4" />, color: 'text-indigo-600' },
  };

  useEffect(() => {
    if (!map) return;

    // Add OpenWeatherMap tile sources
    Object.keys(weatherLayers).forEach((layerType) => {
      const sourceId = `weather-${layerType}`;
      
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'raster',
          tiles: [
            `https://tile.openweathermap.org/map/${layerType}_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`
          ],
          tileSize: 256,
          attribution: '© OpenWeatherMap'
        });
      }
    });

    return () => {
      // Cleanup sources when component unmounts
      Object.keys(weatherLayers).forEach((layerType) => {
        const sourceId = `weather-${layerType}`;
        const layerId = `weather-${layerType}-layer`;
        
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });
    };
  }, [map]);

  const toggleLayer = (layerType: WeatherLayer) => {
    if (!map) return;

    const layerId = `weather-${layerType}-layer`;

    // If clicking the same layer, toggle it off
    if (activeLayer === layerType) {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      setActiveLayer(null);
      return;
    }

    // Remove any existing weather layer
    if (activeLayer) {
      const oldLayerId = `weather-${activeLayer}-layer`;
      if (map.getLayer(oldLayerId)) {
        map.removeLayer(oldLayerId);
      }
    }

    // Add the new layer
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: `weather-${layerType}`,
      paint: {
        'raster-opacity': opacity
      }
    });

    setActiveLayer(layerType);
  };

  const adjustOpacity = (newOpacity: number) => {
    setOpacity(newOpacity);
    
    if (map && activeLayer) {
      const layerId = `weather-${activeLayer}-layer`;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'raster-opacity', newOpacity);
      }
    }
  };

  const clearAllLayers = () => {
    if (!map) return;
    
    Object.keys(weatherLayers).forEach((layerType) => {
      const layerId = `weather-${layerType}-layer`;
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
    
    setActiveLayer(null);
  };

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Weather Overlays</h3>
        {activeLayer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllLayers}
            className="text-xs"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Layer Toggle Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(weatherLayers) as [WeatherLayer, typeof weatherLayers[WeatherLayer]][]).map(([type, config]) => (
          <Button
            key={type}
            variant={activeLayer === type ? "default" : "outline"}
            size="sm"
            onClick={() => toggleLayer(type)}
            className={cn(
              "justify-start",
              activeLayer === type && config.color
            )}
          >
            {config.icon}
            <span className="ml-2">{config.name}</span>
          </Button>
        ))}
      </div>

      {/* Opacity Control */}
      {activeLayer && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Layer Opacity</span>
            <span>{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity * 100}
            onChange={(e) => adjustOpacity(parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      )}

      {/* Legend */}
      {activeLayer && (
        <div className="border-t pt-3">
          <p className="text-xs text-gray-600 mb-2">Legend</p>
          {activeLayer === 'temp' && <TemperatureLegend />}
          {activeLayer === 'precipitation' && <PrecipitationLegend />}
          {activeLayer === 'clouds' && <CloudLegend />}
          {activeLayer === 'wind' && <WindLegend />}
          {activeLayer === 'humidity' && <HumidityLegend />}
        </div>
      )}
    </Card>
  );
}

// Legend Components
function TemperatureLegend() {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-purple-600"></div>
        <span>&lt; 32°F (Freezing)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-600"></div>
        <span>32-50°F (Cold)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-600"></div>
        <span>50-70°F (Mild)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-600"></div>
        <span>70-85°F (Warm)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-600"></div>
        <span>&gt; 85°F (Hot)</span>
      </div>
    </div>
  );
}

function PrecipitationLegend() {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-200"></div>
        <span>Light (0-2.5mm/h)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-400"></div>
        <span>Moderate (2.5-10mm/h)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-600"></div>
        <span>Heavy (10-50mm/h)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-800"></div>
        <span>Violent (&gt;50mm/h)</span>
      </div>
    </div>
  );
}

function CloudLegend() {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200"></div>
        <span>Clear (0-20%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-400"></div>
        <span>Partly Cloudy (20-60%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-600"></div>
        <span>Cloudy (60-90%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-800"></div>
        <span>Overcast (&gt;90%)</span>
      </div>
    </div>
  );
}

function WindLegend() {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-200"></div>
        <span>Light (0-10 mph)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-400"></div>
        <span>Moderate (10-25 mph)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-600"></div>
        <span>Strong (25-40 mph)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-800"></div>
        <span>Severe (&gt;40 mph)</span>
      </div>
    </div>
  );
}

function HumidityLegend() {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-orange-200"></div>
        <span>Low (0-30%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-200"></div>
        <span>Comfortable (30-60%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-400"></div>
        <span>High (60-80%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-600"></div>
        <span>Very High (&gt;80%)</span>
      </div>
    </div>
  );
}