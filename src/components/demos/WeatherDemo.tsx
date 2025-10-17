'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, TrendingUp, Calendar } from 'lucide-react';
import { WeatherService } from '@/services/weather.service';

interface WeatherDemoProps {
  isRunning: boolean;
  onMetricsUpdate: (metrics: any) => void;
}

export function WeatherDemo({ isRunning, onMetricsUpdate }: WeatherDemoProps) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRunning) {
      fetchWeatherData();
    } else {
      setWeatherData(null);
      setHistoricalData(null);
    }
  }, [isRunning]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Simulate fetching from NOAA (free) vs paid service
      const location = { lat: 40.0150, lng: -105.2705 }; // Boulder, CO
      
      // Get current weather
      const current = await WeatherService.getCurrentWeather(location);
      setWeatherData(current);
      
      // Get historical data
      const historical = await WeatherService.getHistoricalWeather(location, 30);
      setHistoricalData(historical);
      
      // Update metrics
      onMetricsUpdate({
        before: 200, // $200/mo for paid weather API
        after: 0,    // $0 for NOAA
        improvement: '100%'
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Cloud className="w-12 h-12 text-blue-400 animate-pulse mx-auto mb-4" />
            <p className="text-gray-400">Fetching NOAA weather data...</p>
          </div>
        </div>
      )}

      {weatherData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Conditions */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              Current Conditions - Boulder, CO
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Temperature</p>
                <p className="text-2xl font-bold text-white">
                  {weatherData.temperature}°F
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Humidity</p>
                <p className="text-2xl font-bold text-white">
                  {weatherData.humidity}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Wind Speed</p>
                <p className="text-2xl font-bold text-white">
                  {weatherData.windSpeed} mph
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">VPD</p>
                <p className="text-2xl font-bold text-white">
                  {weatherData.vpd?.toFixed(2)} kPa
                </p>
              </div>
            </div>
          </div>

          {/* Historical Data */}
          {historicalData && (
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                30-Day Historical Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-gray-400">Temperature Range</p>
                  </div>
                  <p className="text-white">
                    {historicalData.temperature.min}°F - {historicalData.temperature.max}°F
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: {historicalData.temperature.avg}°F
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-gray-400">Humidity Range</p>
                  </div>
                  <p className="text-white">
                    {historicalData.humidity.min}% - {historicalData.humidity.max}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: {historicalData.humidity.avg}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="w-4 h-4 text-cyan-400" />
                    <p className="text-sm text-gray-400">Precipitation</p>
                  </div>
                  <p className="text-white">
                    {historicalData.precipitation.total}" total
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {historicalData.precipitation.days} rainy days
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Comparison */}
          <div className="bg-gradient-to-r from-red-900/20 to-green-900/20 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">API Cost Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-r border-gray-700 pr-6">
                <h5 className="text-red-400 font-medium mb-3">Paid Weather APIs</h5>
                <ul className="space-y-2 text-gray-300">
                  <li>• OpenWeatherMap Pro: $200/mo</li>
                  <li>• WeatherAPI Premium: $250/mo</li>
                  <li>• Limited historical data</li>
                  <li>• Rate limits apply</li>
                </ul>
              </div>
              <div className="pl-6">
                <h5 className="text-green-400 font-medium mb-3">NOAA Free API</h5>
                <ul className="space-y-2 text-gray-300">
                  <li>• Completely free: $0/mo</li>
                  <li>• 30+ years historical data</li>
                  <li>• No rate limits</li>
                  <li>• Government reliability</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}