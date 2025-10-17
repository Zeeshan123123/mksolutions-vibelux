'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Calibrate,
  TrendingUp,
  Download,
  RefreshCw,
  Zap,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  BarChart3,
  AlertCircle,
  Clock,
  Award,
  FileText,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data for demonstration
const mockSensors = [
  {
    id: 'LI-190R-001',
    brand: 'LICOR' as const,
    model: 'LI-190R',
    serialNumber: 'Q12345',
    location: { zone: 'Flowering Room A', description: 'Center canopy position' },
    status: 'operational',
    lastReading: {
      value: 847.2,
      unit: 'μmol·m⁻²·s⁻¹',
      quality: 'good',
      timestamp: new Date()
    },
    calibration: {
      date: new Date('2024-01-15'),
      nextDue: new Date('2025-01-15'),
      status: 'valid'
    },
    validation: {
      isValid: true,
      lastValidated: new Date(),
      issues: []
    }
  },
  {
    id: 'SQ-500-001',
    brand: 'APOGEE' as const,
    model: 'SQ-500',
    serialNumber: 'A98765',
    location: { zone: 'Vegetative Room B', description: 'Reference position' },
    status: 'operational',
    lastReading: {
      value: 734.8,
      unit: 'μmol·m⁻²·s⁻¹',
      quality: 'good',
      timestamp: new Date()
    },
    calibration: {
      date: new Date('2024-02-01'),
      nextDue: new Date('2025-02-01'),
      status: 'valid'
    },
    validation: {
      isValid: true,
      lastValidated: new Date(),
      issues: []
    }
  },
  {
    id: 'LI-6800-001',
    brand: 'LICOR' as const,
    model: 'LI-6800',
    serialNumber: 'P54321',
    location: { zone: 'Research Lab', description: 'Portable measurement system' },
    status: 'maintenance',
    lastReading: {
      value: 15.2,
      unit: 'μmol·m⁻²·s⁻¹',
      quality: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    calibration: {
      date: new Date('2023-11-01'),
      nextDue: new Date('2024-11-01'),
      status: 'expired'
    },
    validation: {
      isValid: false,
      lastValidated: new Date(),
      issues: [
        { type: 'calibration', severity: 'error', message: 'Calibration expired 82 days ago' }
      ]
    }
  },
  {
    id: 'SI-400-001',
    brand: 'APOGEE' as const,
    model: 'SI-400',
    serialNumber: 'T11223',
    location: { zone: 'Environmental Control', description: 'HVAC intake sensor' },
    status: 'operational',
    lastReading: {
      value: 24.7,
      unit: '°C, %RH',
      quality: 'good',
      timestamp: new Date()
    },
    calibration: {
      date: new Date('2024-03-01'),
      nextDue: new Date('2025-03-01'),
      status: 'valid'
    },
    validation: {
      isValid: true,
      lastValidated: new Date(),
      issues: []
    }
  }
];

// Mock historical data
const generateMockData = (hours: number = 24) => {
  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 60 * 60 * 1000),
      ppfd: 800 + Math.sin(i * 0.2) * 200 + Math.random() * 100,
      temperature: 25 + Math.sin(i * 0.15) * 3 + Math.random() * 2,
      humidity: 65 + Math.cos(i * 0.1) * 10 + Math.random() * 5
    });
  }
  return data;
};

const mockHistoricalData = generateMockData();

export default function ProfessionalSensorDashboard() {
  const [selectedRadio, setSelectedSensor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calibration' | 'validation' | 'comparison'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const operationalSensors = mockSensors.filter(s => s.status === 'operational').length;
  const validSensors = mockSensors.filter(s => s.validation.isValid).length;
  const expiredCalibrations = mockSensors.filter(s => s.calibration.status === 'expired').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getSensorIcon = (model: string) => {
    if (model.includes('190R') || model.includes('SQ-500')) return Sun;
    if (model.includes('6800')) return Activity;
    if (model.includes('SI-400')) return Thermometer;
    return Zap;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500 bg-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/20';
      case 'maintenance': return 'text-blue-500 bg-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Professional Sensor Management
            </h1>
            <p className="text-gray-400">LI-COR & Apogee Integration Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Sensors</p>
                  <p className="text-2xl font-bold text-white">{mockSensors.length}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Operational</p>
                  <p className="text-2xl font-bold text-green-400">{operationalSensors}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Valid Calibrations</p>
                  <p className="text-2xl font-bold text-blue-400">{validSensors}</p>
                </div>
                <Award className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Needs Attention</p>
                  <p className="text-2xl font-bold text-red-400">{expiredCalibrations}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          {[
            { id: 'overview', label: 'Sensor Overview' },
            { id: 'calibration', label: 'Calibration Status' },
            { id: 'validation', label: 'Data Validation' },
            { id: 'comparison', label: 'Cross-Reference' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sensor List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Sensor Network
                </CardTitle>
                <CardDescription>
                  Professional-grade sensor monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSensors.map((sensor) => {
                  const SensorIcon = getSensorIcon(sensor.model);
                  return (
                    <div
                      key={sensor.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedSensor === sensor.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedSensor(sensor.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-700">
                            <RadioIcon className="w-4 h-4 text-gray-300" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{sensor.brand} {sensor.model}</p>
                            <p className="text-xs text-gray-400">S/N: {sensor.serialNumber}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(sensor.status)} border-0`}
                        >
                          {sensor.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Current Reading:</span>
                          <span className={`text-sm font-medium ${getQualityColor(sensor.lastReading.quality)}`}>
                            {sensor.lastReading.value} {sensor.lastReading.unit}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Location:</span>
                          <span className="text-sm text-gray-300">{sensor.location.zone}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Cal Status:</span>
                          <Badge 
                            variant="outline"
                            className={sensor.calibration.status === 'valid' 
                              ? 'border-green-500 text-green-500'
                              : 'border-red-500 text-red-500'
                            }
                          >
                            {sensor.calibration.status}
                          </Badge>
                        </div>

                        {!sensor.validation.isValid && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                            <p className="text-xs text-red-400">
                              {sensor.validation.issues[0]?.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Data Visualization */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Environmental Trends (24h)
                </CardTitle>
                <CardDescription>
                  Professional sensor data with NIST-traceable calibration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                        stroke="#9CA3AF"
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="ppfd"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="PPFD (μmol·m⁻²·s⁻¹)"
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Temperature (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Professional Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Calibration Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">NIST-Traceable Standards</p>
                        <p className="text-xs text-gray-400">Reference lamp certification</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Cross-Reference Validation</p>
                        <p className="text-xs text-gray-400">Sensor-to-sensor comparison</p>
                      </div>
                      <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Field Calibration</p>
                        <p className="text-xs text-gray-400">In-situ adjustments</p>
                      </div>
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Calibrate className="w-4 h-4 mr-2" />
                    Schedule Calibration
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Quality Assurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Data Quality:</span>
                      <Badge className="bg-green-500/20 text-green-500">98.7%</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Calibration Drift:</span>
                      <Badge className="bg-blue-500/20 text-blue-500">&lt;0.5%</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Measurement Uncertainty:</span>
                      <Badge className="bg-purple-500/20 text-purple-500">±2.1%</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Traceability:</span>
                      <Badge className="bg-green-500/20 text-green-500">NIST</Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate QA Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Professional Specifications */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Professional Specifications</CardTitle>
                <CardDescription>
                  Industry-leading accuracy and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">LI-COR LI-190R</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-white">±5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Range:</span>
                        <span className="text-white">0-3000 μmol·m⁻²·s⁻¹</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cosine Response:</span>
                        <span className="text-white">±2% (0-75°)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Temperature:</span>
                        <span className="text-white">-40 to +65°C</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Apogee SQ-500</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-white">±5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Range:</span>
                        <span className="text-white">0-4000 μmol·m⁻²·s⁻¹</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Spectral Range:</span>
                        <span className="text-white">389-692 nm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Non-linearity:</span>
                        <span className="text-white">&lt;1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">System Features</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-white">Real-time validation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-white">Automated calibration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-white">Cross-reference checks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-white">NIST traceability</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}