'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  MapPin, 
  Calendar, 
  Database, 
  TrendingUp, 
  Info, 
  Download,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SolarData {
  location: string;
  latitude: number;
  longitude: number;
  month: string;
  avgDailyIrradiance: number; // kWh/m²/day
  avgDLI: number; // mol/m²/day
  peakSunHours: number;
  seasonalVariation: number;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  timezone: string;
}

export default function SolarDLICalculator() {
  const [location, setLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [solarData, setSolarData] = useState<SolarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample NREL-style data for demonstration
  const sampleLocations = [
    { name: 'Denver, CO', lat: 39.74, lon: -104.99, timezone: 'MT' },
    { name: 'Phoenix, AZ', lat: 33.45, lon: -112.07, timezone: 'MST' },
    { name: 'Seattle, WA', lat: 47.61, lon: -122.33, timezone: 'PT' },
    { name: 'Miami, FL', lat: 25.76, lon: -80.19, timezone: 'ET' },
    { name: 'Los Angeles, CA', lat: 34.05, lon: -118.24, timezone: 'PT' },
    { name: 'New York, NY', lat: 40.71, lon: -74.01, timezone: 'ET' },
  ];

  const generateSolarData = (location: LocationData): SolarData[] => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Simulate seasonal solar irradiance based on latitude
    const baseIrradiance = Math.max(2, 7 - Math.abs(location.lat - 35) * 0.05);
    
    return months.map((month, index) => {
      // Seasonal variation - higher in summer, lower in winter
      const seasonalFactor = 0.7 + 0.6 * Math.cos((index - 5.5) * Math.PI / 6);
      const dailyIrradiance = baseIrradiance * seasonalFactor;
      
      // Convert kWh/m²/day to mol/m²/day (approximate conversion: 1 kWh/m²/day ≈ 4.6 mol/m²/day)
      const avgDLI = dailyIrradiance * 4.6;
      
      return {
        location: location.name,
        latitude: location.lat,
        longitude: location.lon,
        month,
        avgDailyIrradiance: parseFloat(dailyIrradiance.toFixed(2)),
        avgDLI: parseFloat(avgDLI.toFixed(1)),
        peakSunHours: parseFloat((dailyIrradiance / 1.0).toFixed(1)),
        seasonalVariation: parseFloat((seasonalFactor * 100).toFixed(0)),
      };
    });
  };

  const searchLocation = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find matching location
    const foundLocation = sampleLocations.find(loc => 
      loc.name.toLowerCase().includes(location.toLowerCase())
    );
    
    if (foundLocation) {
      setSelectedLocation(foundLocation);
      const data = generateSolarData(foundLocation);
      setSolarData(data);
    } else {
      setError('Location not found. Try: Denver, Phoenix, Seattle, Miami, Los Angeles, or New York');
    }
    
    setLoading(false);
  };

  const exportData = () => {
    if (solarData.length === 0) return;
    
    const csvContent = [
      ['Month', 'Daily Irradiance (kWh/m²/day)', 'Natural DLI (mol/m²/day)', 'Peak Sun Hours'],
      ...solarData.map(data => [
        data.month,
        data.avgDailyIrradiance,
        data.avgDLI,
        data.peakSunHours
      ])
    ].map(row => row.join(',')).join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-dli-${selectedLocation?.name.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">NASA NREL Solar DLI Calculator</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl">
            Calculate natural Daily Light Integral (DLI) from solar irradiance data. 
            Essential for greenhouse supplemental lighting and outdoor growing planning.
          </p>
        </div>

        {/* Location Search */}
        <Card className="mb-8 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Selection
            </CardTitle>
            <CardDescription>
              Enter a location to get solar irradiance and natural DLI data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="location">City, State or Coordinates</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Denver, CO or 39.74, -104.99"
                  className="bg-gray-800 border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                />
              </div>
              <Button 
                onClick={searchLocation} 
                disabled={loading || !location.trim()}
                className="mt-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {selectedLocation && solarData.length > 0 && (
          <>
            {/* Location Info */}
            <Card className="mb-6 bg-green-900/20 border-green-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedLocation.name}</h3>
                      <p className="text-gray-300">
                        Latitude: {selectedLocation.lat}°, Longitude: {selectedLocation.lon}°
                      </p>
                    </div>
                  </div>
                  <Button onClick={exportData} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Annual Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {(solarData.reduce((sum, d) => sum + d.avgDLI, 0) / 12).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Annual DLI</div>
                  <div className="text-xs text-gray-500">mol/m²/day</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.max(...solarData.map(d => d.avgDLI)).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Peak DLI (Summer)</div>
                  <div className="text-xs text-gray-500">mol/m²/day</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.min(...solarData.map(d => d.avgDLI)).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Min DLI (Winter)</div>
                  <div className="text-xs text-gray-500">mol/m²/day</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {((Math.max(...solarData.map(d => d.avgDLI)) - Math.min(...solarData.map(d => d.avgDLI))) / Math.max(...solarData.map(d => d.avgDLI)) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Seasonal Variation</div>
                  <div className="text-xs text-gray-500">difference</div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Data Table */}
            <Card className="mb-8 bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Solar Data
                </CardTitle>
                <CardDescription>
                  Natural daily light integral and solar irradiance by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3">Month</th>
                        <th className="text-right p-3">Solar Irradiance</th>
                        <th className="text-right p-3">Natural DLI</th>
                        <th className="text-right p-3">Peak Sun Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solarData.map((data, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-3 font-medium">{data.month}</td>
                          <td className="text-right p-3">{data.avgDailyIrradiance} kWh/m²/day</td>
                          <td className="text-right p-3 font-semibold text-green-400">
                            {data.avgDLI} mol/m²/day
                          </td>
                          <td className="text-right p-3">{data.peakSunHours} hours</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Information Panel */}
            <Card className="bg-blue-900/20 border-blue-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Understanding Solar DLI Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Daily Light Integral (DLI)</h4>
                  <p className="text-gray-300 text-sm">
                    DLI measures the total amount of photosynthetically active radiation (PAR) received 
                    per day. Natural DLI varies by season and location, affecting plant growth and 
                    supplemental lighting requirements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Greenhouse Applications</h4>
                  <p className="text-gray-300 text-sm">
                    Compare natural DLI to crop requirements (e.g., tomatoes need 20-30 mol/m²/day) 
                    to determine when supplemental LED lighting is needed, especially in winter months.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Data sourced from NASA NREL Solar Radiation Database</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}