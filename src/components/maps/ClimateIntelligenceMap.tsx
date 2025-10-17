'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Zap, Cloud, DollarSign, TrendingUp, 
  AlertTriangle, Info, Calculator, BarChart3,
  Sun, Wind, Droplets, Thermometer,
  Download, ChevronDown
} from 'lucide-react';
import {
  DEFAULT_MAP_CONFIG,
  MAP_STYLES,
  geocodeAddress
} from '@/lib/mapbox-config';
import {
  ENERGY_REGIONS,
  GROWING_ZONES,
  WEATHER_IMPACTS,
  calculateOperatingCosts,
  type EnergyRegion
} from '@/lib/climate-zones-data';
import { EnhancedWeatherAPI } from '@/lib/weather-api';

interface ClimateIntelligenceMapProps {
  onLocationSelect?: (location: { coordinates: [number, number]; data: any }) => void;
  height?: string;
}

export function ClimateIntelligenceMap({ 
  onLocationSelect,
  height = '600px'
}: ClimateIntelligenceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<EnergyRegion | null>(null);
  const [overlayType, setOverlayType] = useState<'energy' | 'climate' | 'weather'>('energy');
  const [facilitySize, setFacilitySize] = useState(10000); // sq ft
  const [lightingLoad, setLightingLoad] = useState(50); // W/sq ft
  const [showCalculator, setShowCalculator] = useState(false);
  const [weatherData, setWeatherData] = useState<Map<string, any>>(new Map());
  const [forecastData, setForecastData] = useState<Map<string, any>>(new Map());
  const [showForecast, setShowForecast] = useState(false);
  const weatherAPI = useRef(new EnhancedWeatherAPI());
  const weatherMarkers = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...DEFAULT_MAP_CONFIG,
      style: MAP_STYLES.vibelux_dark,
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4
    });

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Wait for map to load
    map.current.on('load', () => {
      // Add energy cost heat map
      addEnergyHeatMap();
      
      // Add climate zones
      addClimateZones();
      
      // Add weather stations
      addWeatherData();
    });

    // Handle click events
    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setSelectedLocation(coordinates);
      
      // Find nearest energy region
      const nearest = findNearestEnergyRegion(coordinates);
      setSelectedRegion(nearest);
      
      // Fetch forecast when location is selected
      fetchForecastForRegion(nearest);
      
      if (onLocationSelect) {
        onLocationSelect({ coordinates, data: nearest });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Toggle weather markers visibility based on overlay type
  useEffect(() => {
    weatherMarkers.current.forEach(marker => {
      const element = marker.getElement();
      if (element) {
        element.style.display = overlayType === 'weather' ? 'block' : 'none';
      }
    });
  }, [overlayType]);

  // Add energy cost heat map
  const addEnergyHeatMap = () => {
    if (!map.current) return;

    // Add markers for each energy region
    ENERGY_REGIONS.forEach(region => {
      // Create custom marker showing energy cost
      const el = document.createElement('div');
      el.className = 'energy-marker';
      el.style.cssText = `
        background: ${getEnergyColor(region.energyCosts.commercial)};
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      // Safely validate and display energy cost data
      const energyCost = typeof region.energyCosts.commercial === 'number' 
        ? region.energyCosts.commercial.toFixed(2)
        : '0.00';
      
      el.innerHTML = `
        <div style="font-size: 16px">$${energyCost}</div>
        <div style="font-size: 10px">kWh</div>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat(region.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="energy-popup" style="color: black;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${region.state}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div>
                <strong>Commercial:</strong> $${region.energyCosts.commercial}/kWh<br>
                <strong>Industrial:</strong> $${region.energyCosts.industrial}/kWh<br>
                <strong>Peak Hours:</strong> ${region.energyCosts.peakHours}
              </div>
              <div>
                <strong>Solar Rebate:</strong> $${region.renewableIncentives.solarRebate}/W<br>
                <strong>Net Metering:</strong> ${region.renewableIncentives.netMetering ? 'Yes' : 'No'}<br>
                <strong>Carbon:</strong> ${region.carbonIntensity} kg/kWh
              </div>
            </div>
          </div>
        `))
        .addTo(map.current!);

      // Click handler
      el.addEventListener('click', () => {
        setSelectedRegion(region);
        fetchForecastForRegion(region);
        setShowCalculator(true);
      });
    });
  };

  // Add climate zones overlay
  const addClimateZones = () => {
    if (!map.current) return;

    // This would normally load from a GeoJSON file with actual zone boundaries
    // For demo, we'll add colored overlays
    Object.entries(GROWING_ZONES).forEach(([key, zone]) => {
      // Add source and layer for each zone
      // In production, this would be actual geographic boundaries
    });
  };

  // Add weather data points
  const addWeatherData = async () => {
    if (!map.current) return;

    // Fetch weather data for major regions
    const weatherPromises = ENERGY_REGIONS.map(async (region) => {
      const weather = await weatherAPI.current.getCurrentWeather(undefined, region.coordinates[1], region.coordinates[0]);
      if (!('error' in weather)) {
        setWeatherData(prev => new Map(prev).set(region.id, weather));
        
        // Create weather overlay marker
        const el = document.createElement('div');
        el.className = 'weather-marker';
        el.style.cssText = `
          background: rgba(59, 130, 246, 0.9);
          color: white;
          padding: 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          pointer-events: none;
          display: none;
        `;
        // Safely validate and display weather data
        const temperature = typeof weather.temperature === 'number' 
          ? Math.round(weather.temperature)
          : 0;
        const weatherMain = typeof weather.weatherMain === 'string' 
          ? weather.weatherMain.replace(/[<>&"']/g, '') // Strip HTML characters
          : 'Unknown';
          
        el.innerHTML = `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>${temperature}°C</span>
            <span style="font-size: 10px; opacity: 0.8;">${weatherMain}</span>
          </div>
          <div style="font-size: 10px; opacity: 0.8;">
            VPD: ${weather.vpd.toFixed(1)} kPa
          </div>
        `;

        // Position weather marker slightly offset from energy marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([region.coordinates[0] + 0.5, region.coordinates[1] + 0.5])
          .addTo(map.current!);
        
        weatherMarkers.current.push(marker);
      }
    });

    await Promise.all(weatherPromises);
  };

  // Fetch forecast for a specific region
  const fetchForecastForRegion = async (region: EnergyRegion) => {
    const forecast = await weatherAPI.current.getForecast(undefined, region.coordinates[1], region.coordinates[0], 5);
    if (!('error' in forecast)) {
      setForecastData(prev => new Map(prev).set(region.id, forecast));
    }
  };

  // Helper functions
  const getEnergyColor = (cost: number): string => {
    if (cost <= 0.08) return '#10b981'; // Green
    if (cost <= 0.12) return '#3b82f6'; // Blue
    if (cost <= 0.16) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const findNearestEnergyRegion = (coords: [number, number]): EnergyRegion => {
    let nearest = ENERGY_REGIONS[0];
    let minDistance = Infinity;

    ENERGY_REGIONS.forEach(region => {
      const distance = Math.sqrt(
        Math.pow(coords[0] - region.coordinates[0], 2) +
        Math.pow(coords[1] - region.coordinates[1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = region;
      }
    });

    return nearest;
  };

  // Calculate costs for selected location
  const calculateCosts = () => {
    if (!selectedRegion) return null;

    const hvacTons = facilitySize / 400; // Rule of thumb
    return calculateOperatingCosts(
      selectedRegion,
      facilitySize,
      facilitySize * lightingLoad,
      hvacTons
    );
  };

  const costs = calculateCosts();

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        {/* Overlay Type Selector */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-400 mb-2">Data Layer</p>
          <div className="space-y-2">
            <button
              onClick={() => setOverlayType('energy')}
              className={`w-full px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                overlayType === 'energy' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              Energy Costs
            </button>
            <button
              onClick={() => setOverlayType('climate')}
              className={`w-full px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                overlayType === 'climate' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Climate Zones
            </button>
            <button
              onClick={() => setOverlayType('weather')}
              className={`w-full px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                overlayType === 'weather' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Weather Data
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {selectedRegion && (
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="text-sm font-medium text-white mb-2">{selectedRegion.state}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Energy:</span>
                <span className="text-white">${selectedRegion.energyCosts.commercial}/kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Carbon:</span>
                <span className="text-white">{selectedRegion.carbonIntensity} kg/kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Solar:</span>
                <span className="text-white">{selectedRegion.renewableIncentives.netMetering ? '✓' : '✗'}</span>
              </div>
              {weatherData.get(selectedRegion.id) && (
                <>
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weather:</span>
                      <span className="text-white">{weatherData.get(selectedRegion.id).weatherMain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temp:</span>
                      <span className="text-white">{Math.round(weatherData.get(selectedRegion.id).temperature)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VPD:</span>
                      <span className="text-white">{weatherData.get(selectedRegion.id).vpd.toFixed(1)} kPa</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="mt-2 w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
            >
              Calculate Costs
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs text-gray-400 mb-2">Energy Cost ($/kWh)</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-300">≤ $0.08 (Optimal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-300">$0.08 - $0.12 (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-300">$0.12 - $0.16 (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-300">&gt; $0.16 (High)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg"
        style={{ height }}
      />

      {/* Cost Calculator Modal */}
      {showCalculator && selectedRegion && costs && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Operating Cost Analysis - {selectedRegion.state}
              </h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Input Parameters */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Facility Size (sq ft)
                </label>
                <input
                  type="number"
                  value={facilitySize}
                  onChange={(e) => setFacilitySize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Lighting Load (W/sq ft)
                </label>
                <input
                  type="number"
                  value={lightingLoad}
                  onChange={(e) => setLightingLoad(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Monthly Costs */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h4 className="text-lg font-semibold text-white mb-3">Monthly Operating Costs</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Lighting</p>
                  <p className="text-2xl font-bold text-white">
                    ${costs.monthly.lighting.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">HVAC</p>
                  <p className="text-2xl font-bold text-white">
                    ${costs.monthly.hvac.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Other</p>
                  <p className="text-2xl font-bold text-white">
                    ${costs.monthly.other.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Monthly</p>
                  <p className="text-3xl font-bold text-purple-400">
                    ${costs.monthly.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Annual Analysis */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Annual Costs</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Without Solar</span>
                    <span className="text-white">${costs.annual.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With Solar</span>
                    <span className="text-green-400">${costs.annual.withSolar.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carbon (tons)</span>
                    <span className="text-white">{(costs.annual.carbonFootprint / 1000).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">ROI Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Solar Payback</span>
                    <span className="text-white">{costs.payback.solarROI} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LED Upgrade</span>
                    <span className="text-white">{costs.payback.ledROI} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax Credit</span>
                    <span className="text-green-400">{selectedRegion.renewableIncentives.taxCredit}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Advantages */}
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
              <h4 className="font-semibold text-white mb-2">Regional Advantages</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                {selectedRegion.energyCosts.offPeakDiscount > 30 && (
                  <li>• High off-peak discount ({selectedRegion.energyCosts.offPeakDiscount}%) - optimize lighting schedule</li>
                )}
                {selectedRegion.renewableIncentives.netMetering && (
                  <li>• Net metering available - excess solar credits your bill</li>
                )}
                {selectedRegion.carbonIntensity < 0.3 && (
                  <li>• Low carbon grid - sustainable operations</li>
                )}
                {selectedRegion.energyCosts.commercial < 0.10 && (
                  <li>• Low energy costs - competitive advantage</li>
                )}
              </ul>
            </div>

            {/* Weather Impact Analysis */}
            {weatherData.get(selectedRegion.id) && (
              <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">Current Weather Impact</h4>
                  <button
                    onClick={() => setShowForecast(!showForecast)}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {showForecast ? 'Hide' : 'Show'} Forecast
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conditions:</span>
                    <span className="text-white">{weatherData.get(selectedRegion.id).weatherMain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Light Transmission:</span>
                    <span className="text-white">{(weatherData.get(selectedRegion.id).lightTransmission * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Photosynthesis Factor:</span>
                    <span className="text-white">{(weatherData.get(selectedRegion.id).photosynthesisFactor * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-orange-700">
                    <p className="text-xs text-orange-400">
                      {weatherData.get(selectedRegion.id).temperature > 30 
                        ? 'High temperature - increase cooling by 20-30%'
                        : weatherData.get(selectedRegion.id).temperature < 15
                        ? 'Low temperature - increase heating costs'
                        : 'Optimal temperature range for growing'}
                    </p>
                  </div>
                </div>

                {/* 5-Day Forecast */}
                {showForecast && forecastData.get(selectedRegion.id) && (
                  <div className="mt-4 pt-4 border-t border-orange-700">
                    <h5 className="text-sm font-medium text-white mb-3">5-Day Forecast</h5>
                    <div className="space-y-2">
                      {forecastData.get(selectedRegion.id).forecast
                        .filter((_: any, index: number) => index % 8 === 0) // One per day
                        .slice(0, 5)
                        .map((day: any, index: number) => {
                          const date = new Date(day.datetime * 1000);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          const tempC = Math.round(day.temperature);
                          const tempF = Math.round(day.temperature * 9/5 + 32);
                          
                          return (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 w-12">{dayName}</span>
                              <span className="text-white flex-1">{day.weatherMain}</span>
                              <span className="text-white">{tempC}°C / {tempF}°F</span>
                              <span className={`ml-2 ${
                                day.dliReductionFactor < 0.5 ? 'text-red-400' : 
                                day.dliReductionFactor < 0.8 ? 'text-yellow-400' : 
                                'text-green-400'
                              }`}>
                                {(day.lightTransmission * 100).toFixed(0)}% light
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-700/50">
                      <p className="text-xs text-orange-400">
                        {forecastData.get(selectedRegion.id).forecast
                          .some((day: any) => day.temperature > 30) 
                          ? '⚠️ Heat stress expected - plan cooling capacity'
                          : forecastData.get(selectedRegion.id).forecast
                            .some((day: any) => day.temperature < 15)
                          ? '⚠️ Cold stress expected - prepare heating systems'
                          : '✓ Stable conditions expected'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                Generate Full Report
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}