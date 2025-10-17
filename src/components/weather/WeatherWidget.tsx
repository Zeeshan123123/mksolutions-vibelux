'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/client-logger';
import { noaaClient, WeatherData, AgriculturalMetrics } from '@/lib/weather/noaa-client';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  showAgriculturalMetrics?: boolean;
  cropType?: string;
  className?: string;
}

export function WeatherWidget({ 
  lat, 
  lon, 
  showAgriculturalMetrics = true,
  cropType = 'cannabis',
  className 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [metrics, setMetrics] = useState<AgriculturalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: lat || 0, lon: lon || 0 });

  // Get user's location if not provided
  useEffect(() => {
    if (!lat || !lon) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          setError('Unable to get location. Please enable location services.');
          setLoading(false);
        }
      );
    }
  }, [lat, lon]);

  // Fetch weather data
  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeather();
    }
  }, [location]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await noaaClient.getWeather(location);
      setWeather(weatherData);
      
      if (showAgriculturalMetrics) {
        const metricsData = noaaClient.calculateAgriculturalMetrics(weatherData);
        setMetrics(metricsData);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load weather data');
      logger.error('system', 'Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (conditions: string) => {
    const lowerConditions = conditions.toLowerCase();
    if (lowerConditions.includes('rain')) return <CloudRain className="h-8 w-8" />;
    if (lowerConditions.includes('snow')) return <CloudSnow className="h-8 w-8" />;
    if (lowerConditions.includes('cloud')) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  const getVPDStatus = (vpd: number) => {
    if (vpd < 0.8) return { color: 'text-blue-600', status: 'Low' };
    if (vpd > 1.2) return { color: 'text-red-600', status: 'High' };
    return { color: 'text-green-600', status: 'Optimal' };
  };

  if (loading) {
    return (
      <Card className={cn("p-6 flex items-center justify-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error || 'Unable to load weather data'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Current Weather */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {weather.location.city}, {weather.location.state}
            </h3>
            <p className="text-sm text-gray-500">Current Conditions</p>
          </div>
          {getWeatherIcon(weather.current.conditions)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-2xl font-bold">{weather.current.temperature}°F</p>
              <p className="text-sm text-gray-500">Temperature</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-2xl font-bold">{weather.current.humidity}%</p>
              <p className="text-sm text-gray-500">Humidity</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-lg font-semibold">{weather.current.windSpeed}</p>
              <p className="text-sm text-gray-500">{weather.current.windDirection}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600">{weather.current.conditions}</p>

        {/* Agricultural Metrics */}
        {showAgriculturalMetrics && metrics && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Growing Conditions</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">VPD</p>
                <p className={cn("text-lg font-semibold", getVPDStatus(metrics.vpd).color)}>
                  {metrics.vpd.toFixed(2)} kPa
                </p>
                <p className="text-xs text-gray-500">{getVPDStatus(metrics.vpd).status}</p>
              </div>

              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">Dew Point</p>
                <p className="text-lg font-semibold">{metrics.dewPoint.toFixed(1)}°F</p>
                <p className="text-xs text-gray-500">
                  {metrics.frostRisk ? '⚠️ Frost Risk' : 'No Frost Risk'}
                </p>
              </div>
            </div>

            {/* Growing Recommendations */}
            {cropType && (
              <GrowingRecommendations metrics={metrics} cropType={cropType} />
            )}
          </div>
        )}

        {/* Forecast Preview */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-3">Forecast</h4>
          <div className="space-y-2">
            {weather.forecast.periods.slice(0, 3).map((period, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="font-medium">{period.name}</span>
                <span>{period.temperature}°F</span>
                <span className="text-gray-500">{period.conditions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function GrowingRecommendations({ 
  metrics, 
  cropType 
}: { 
  metrics: AgriculturalMetrics; 
  cropType: string;
}) {
  const analysis = noaaClient.getGrowingConditionsAnalysis(metrics, cropType);
  
  if (analysis.optimal) {
    return (
      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-800 font-medium">
          ✅ Optimal growing conditions
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {analysis.recommendations.map((rec, idx) => (
        <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">{rec}</p>
        </div>
      ))}
    </div>
  );
}