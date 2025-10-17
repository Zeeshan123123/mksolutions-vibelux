'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { ClimateIntelligenceMap } from '@/components/maps/ClimateIntelligenceMap';
import { PsychrometricCalculator } from '@/components/PsychrometricCalculator';
import { EnvironmentalControlCalculator } from '@/components/EnvironmentalControlCalculator';
import { TranspirationCalculator } from '@/components/TranspirationCalculator';
import { EnhancedHeatLoadCalculator } from '@/components/EnhancedHeatLoadCalculator';
import { EnvironmentalMonitoringCalculatorWrapper } from '@/components/EnvironmentalMonitoringCalculatorWrapper';
import { HVACSystemSelectorWrapper } from '@/components/HVACSystemSelectorWrapper';
import { HeatLoadCalculatorWrapper } from '@/components/HeatLoadCalculatorWrapper';
import { LEDThermalManagementWrapper } from '@/components/LEDThermalManagementWrapper';
import { ClimateIntegratedDesign } from '@/components/ClimateIntegratedDesign';
import { GreenhouseClimateIntegration } from '@/components/GreenhouseClimateIntegration';
import { CFDAnalysisPanelWrapper } from '@/components/CFDAnalysisPanelWrapper';
import { GHGEmissionsCalculator } from '@/components/GHGEmissionsCalculator';
import { SustainabilityDashboard } from '@/components/admin/DebugDashboard';
import { WeatherAdaptiveLighting } from '@/components/WeatherAdaptiveLighting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, DollarSign, Cloud, TrendingUp, 
  AlertTriangle, Info, Download, BarChart3,
  Sun, Wind, Droplets, Thermometer,
  Building, Calculator, Shield, Leaf, Clock,
  CheckCircle, ArrowRight, Battery, Grid, Activity,
  Award, Users, Globe, Sparkles, Brain, Calendar,
  MapPin, LineChart, Target, Gauge, RefreshCw,
  History, Play, Pause, SkipForward, Bot, Cpu,
  Database, Settings, Eye, CloudRain, CloudSnow,
  Lightbulb, Factory, Check, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';

// Interfaces for the consolidated features
interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitation: number;
  uvIndex: number;
  visibility: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
}

interface WeatherForecast extends WeatherData {
  confidence: number;
  alerts: string[];
}

interface EnvironmentalAdjustment {
  id: string;
  parameter: 'temperature' | 'humidity' | 'lighting' | 'co2' | 'irrigation' | 'ventilation';
  currentValue: number;
  targetValue: number;
  adjustmentValue: number;
  reason: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedSavings: number;
  timeframe: string;
  automated: boolean;
  status: 'pending' | 'applied' | 'rejected' | 'monitoring';
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  lastTrained: string;
  features: string[];
  active: boolean;
}

interface WeatherImpactData {
  date: string;
  tavg: number;
  hdd: number;
  cdd: number;
  humidity: number;
  solarRadiation: number;
  consumption: number;
  normalizedConsumption: number;
  weatherImpact: number;
  savings: number;
}

type Tool = 'psychrometric' | 'environmental-control' | 'transpiration' | 'heat-load' | 'monitoring' | 'hvac-selector' | 'basic-heat-load' | 'led-thermal' | 'climate-design' | 'greenhouse-climate' | 'cfd-analysis' | 'ghg-emissions' | 'sustainability' | null;

export default function ClimateIntelligencePage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'forecast' | 'tools' | 'optimization' | 'analytics' | 'adaptive'>('analysis');
  const [activeTool, setActiveTool] = useState<Tool>(null);
  
  // Weather AI states
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [adjustments, setAdjustments] = useState<EnvironmentalAdjustment[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Analytics states
  const [timeRange, setTimeRange] = useState('12m');
  const [weatherImpactData, setWeatherImpactData] = useState<WeatherImpactData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'solar'>('temperature');
  
  // Energy optimization states
  const [selectedSavings, setSelectedSavings] = useState(250000);
  
  // Weather adaptive states
  const [location, setLocation] = useState<{
    city?: string;
    lat?: number;
    lon?: number;
    zipCode?: string;
  }>({});
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadSampleWeatherData();
    loadWeatherImpactData();
    // Try to get user's location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('Unable to get your location. Please enter a city or zip code.');
        }
      );
    }
  }, []);

  useEffect(() => {
    loadWeatherImpactData();
  }, [timeRange]);

  // Helper functions from weather-ai page
  const loadSampleWeatherData = () => {
    const currentWeatherData: WeatherData = {
      timestamp: new Date().toISOString(),
      temperature: 22.5,
      humidity: 65,
      pressure: 1013.2,
      windSpeed: 12,
      windDirection: 270,
      cloudCover: 40,
      precipitation: 0,
      uvIndex: 6,
      visibility: 10,
      condition: 'cloudy'
    };
    setCurrentWeather(currentWeatherData);

    const forecastData: WeatherForecast[] = Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      temperature: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
      pressure: 1010 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      windSpeed: 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
      windDirection: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 360,
      cloudCover: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
      precipitation: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      uvIndex: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 11),
      visibility: 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      condition: ['sunny', 'cloudy', 'rainy', 'sunny', 'cloudy', 'rainy', 'sunny'][i] as any,
      confidence: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      alerts: i === 2 ? ['Heavy rain expected', 'High wind warning'] : []
    }));
    setForecast(forecastData);

    const adjustmentData: EnvironmentalAdjustment[] = [
      {
        id: 'adj_001',
        parameter: 'lighting',
        currentValue: 600,
        targetValue: 450,
        adjustmentValue: -150,
        reason: 'Cloudy conditions reducing natural light supplementation needs',
        confidence: 92,
        priority: 'medium',
        estimatedSavings: 35.50,
        timeframe: '12:00 PM - 4:00 PM',
        automated: true,
        status: 'applied'
      },
      {
        id: 'adj_002',
        parameter: 'humidity',
        currentValue: 55,
        targetValue: 60,
        adjustmentValue: 5,
        reason: 'Incoming storm system will increase ambient humidity',
        confidence: 88,
        priority: 'high',
        estimatedSavings: 12.25,
        timeframe: 'Tomorrow 6:00 AM - 2:00 PM',
        automated: false,
        status: 'pending'
      },
      {
        id: 'adj_003',
        parameter: 'ventilation',
        currentValue: 40,
        targetValue: 65,
        adjustmentValue: 25,
        reason: 'High pressure system bringing hot, dry conditions',
        confidence: 95,
        priority: 'critical',
        estimatedSavings: 45.75,
        timeframe: 'Day 3-4',
        automated: true,
        status: 'monitoring'
      }
    ];
    setAdjustments(adjustmentData);

    const modelData: AIModel[] = [
      {
        id: 'model_001',
        name: 'WeatherNet-Pro',
        description: 'Deep learning model for 7-day weather prediction with facility-specific adjustments',
        accuracy: 94.2,
        lastTrained: '2024-02-01',
        features: ['Temperature forecasting', 'Humidity prediction', 'Pressure analysis', 'Wind patterns'],
        active: true
      },
      {
        id: 'model_002',
        name: 'ClimateAdapt-AI',
        description: 'Specialized model for facility climate control optimization',
        accuracy: 91.8,
        lastTrained: '2024-01-28',
        features: ['HVAC optimization', 'Energy efficiency', 'Crop stress prediction'],
        active: true
      }
    ];
    setAIModels(modelData);
  };

  // Helper functions from weather-impact page
  const loadWeatherImpactData = async () => {
    setIsLoading(true);
    try {
      const data = generateWeatherImpactData(timeRange);
      setWeatherImpactData(data);
    } catch (error) {
      logger.error('system', 'Error loading weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeatherImpactData = (range: string): WeatherImpactData[] => {
    const months = range === '12m' ? 12 : range === '24m' ? 24 : 36;
    const data: WeatherImpactData[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.getMonth();
      const isWinter = month >= 10 || month <= 2;
      const isSummer = month >= 5 && month <= 8;

      const baseTemp = isWinter ? 45 : isSummer ? 75 : 60;
      const tavg = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5);
      const hdd = Math.max(0, 65 - tavg);
      const cdd = Math.max(0, tavg - 65);
      
      const baseConsumption = 100000;
      const weatherImpact = (hdd * 150) + (cdd * 200) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 - 2500);
      const actualConsumption = baseConsumption + weatherImpact + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000 - 5000);
      const normalizedConsumption = actualConsumption - weatherImpact;
      const savings = baseConsumption - normalizedConsumption;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        tavg: Math.round(tavg),
        hdd: Math.round(hdd),
        cdd: Math.round(cdd),
        humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        solarRadiation: isSummer ? 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        consumption: Math.round(actualConsumption),
        normalizedConsumption: Math.round(normalizedConsumption),
        weatherImpact: Math.round(weatherImpact),
        savings: Math.round(savings)
      });
    }
    return data;
  };

  // Energy optimization calculations
  const monthlySavings = Math.round(selectedSavings * 0.15 / 12);
  const demandResponse = Math.round(selectedSavings * 0.08 / 12);
  const totalMonthlySavings = monthlySavings + demandResponse;
  const vibeLuxShare = Math.round(totalMonthlySavings * 0.25);
  const netSavings = totalMonthlySavings - vibeLuxShare;

  // Helper functions
  const applyAdjustment = (adjustmentId: string) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === adjustmentId 
        ? { ...adj, status: 'applied' as const }
        : adj
    ));
  };

  const rejectAdjustment = (adjustmentId: string) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === adjustmentId 
        ? { ...adj, status: 'rejected' as const }
        : adj
    ));
  };

  const getWeatherIcon = (condition: string) => {
    const icons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      snowy: CloudSnow,
      stormy: CloudRain
    };
    const Icon = icons[condition as keyof typeof icons] || Cloud;
    return <Icon className="w-6 h-6" />;
  };

  const updateWeatherData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadSampleWeatherData();
    } catch (error) {
      logger.error('system', 'Failed to update weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const exportData = {
      currentWeather,
      forecast,
      adjustments,
      weatherImpactData,
      settings: { location, timeRange },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate-intelligence-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Climate tools configuration
  const tools = [
    {
      id: 'psychrometric' as Tool,
      name: 'Psychrometric Calculator',
      description: 'Air properties and VPD analysis',
      icon: Droplets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    {
      id: 'environmental-control' as Tool,
      name: 'Environmental Control',
      description: 'HVAC sizing and energy calculations',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20'
    },
    {
      id: 'heat-load' as Tool,
      name: 'Advanced Heat Load',
      description: 'Enhanced thermal analysis with transpiration',
      icon: Sun,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20'
    },
    {
      id: 'basic-heat-load' as Tool,
      name: 'Basic Heat Load',
      description: 'ASHRAE-based heat load calculator',
      icon: Calculator,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/20'
    },
    {
      id: 'hvac-selector' as Tool,
      name: 'HVAC System Selector',
      description: 'Compare and select HVAC systems',
      icon: Wind,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/20'
    },
    {
      id: 'transpiration' as Tool,
      name: 'Transpiration Model',
      description: 'Water use and plant stress analysis',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20'
    }
  ];

  // Key insights data
  const insights = [
    {
      icon: Zap,
      title: 'Lowest Energy Costs',
      value: 'Washington State',
      detail: '$0.06/kWh industrial',
      color: 'text-green-400'
    },
    {
      icon: Sun,
      title: 'Best Solar ROI',
      value: 'Arizona',
      detail: '3.2 year payback',
      color: 'text-yellow-400'
    },
    {
      icon: Cloud,
      title: '5-Day Weather Forecast',
      value: 'Live Updates',
      detail: 'VPD & DLI tracking',
      color: 'text-blue-400'
    },
    {
      icon: AlertTriangle,
      title: 'Highest Risk',
      value: 'Gulf Coast',
      detail: 'Hurricanes + humidity',
      color: 'text-red-400'
    }
  ];

  // Regional comparisons
  const regionalComparisons = [
    {
      region: 'Pacific Northwest',
      pros: ['Lowest energy costs', 'Cool climate', 'Hydro power'],
      cons: ['High humidity', 'Limited sun hours'],
      bestFor: 'Large-scale indoor operations'
    },
    {
      region: 'Southwest',
      pros: ['Excellent solar', 'Low humidity', 'Stable weather'],
      cons: ['High cooling costs', 'Water scarcity'],
      bestFor: 'Solar-powered greenhouses'
    },
    {
      region: 'Midwest',
      pros: ['Moderate energy', 'Central location', 'Agricultural infrastructure'],
      cons: ['Extreme seasons', 'Tornado risk'],
      bestFor: 'Year-round indoor cultivation'
    },
    {
      region: 'Southeast',
      pros: ['Long growing season', 'Competitive energy'],
      cons: ['High humidity', 'Hurricane risk', 'Pest pressure'],
      bestFor: 'Climate-controlled greenhouses'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Brain className="w-10 h-10 text-purple-400" />
                Climate Intelligence Platform
              </h1>
              <p className="text-xl text-gray-400">
                Comprehensive climate analysis, weather forecasting, energy optimization, and environmental control tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Automation</span>
                <Switch
                  checked={automationEnabled}
                  onCheckedChange={setAutomationEnabled}
                />
              </div>
              <Button variant="outline" onClick={updateWeatherData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Update
              </Button>
              <Button onClick={exportData} className="bg-purple-600 hover:bg-purple-700">
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-gray-800">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Regional Analysis
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Weather AI
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Climate Tools
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energy Optimization
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Weather Impact
            </TabsTrigger>
            <TabsTrigger value="adaptive" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Adaptive Lighting
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          
          {/* Regional Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-8 h-8 ${insight.color}`} />
                  <span className="text-xs text-gray-500">2024 Data</span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{insight.title}</h3>
                <p className="text-xl font-bold text-white">{insight.value}</p>
                <p className="text-sm text-gray-500 mt-1">{insight.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Map */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2">
              Interactive Climate & Energy Map
            </h2>
            <p className="text-gray-400">
              Click any location to analyze operating costs, climate factors, and view 5-day weather forecasts
            </p>
          </div>
          
          <ClimateIntelligenceMap
            height="700px"
            onLocationSelect={setSelectedLocation}
          />
          
          <div className="p-4 bg-gray-800/50 text-center">
            <p className="text-sm text-gray-400">
              💡 Tip: Use the calculator to estimate facility costs based on your specific requirements
            </p>
          </div>
        </div>

        {/* Regional Comparisons */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">Regional Analysis</h3>
            <div className="space-y-4">
              {regionalComparisons.map((region, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">{region.region}</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-400 font-medium mb-1">Advantages</p>
                      <ul className="space-y-1">
                        {region.pros.map((pro, idx) => (
                          <li key={idx} className="text-gray-300">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-400 font-medium mb-1">Challenges</p>
                      <ul className="space-y-1">
                        {region.cons.map((con, idx) => (
                          <li key={idx} className="text-gray-300">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-purple-400 mt-3">
                    Best for: {region.bestFor}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Optimization Tips */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6">
              Energy Cost Optimization Strategies
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg border border-green-800/50">
                <div className="flex items-start gap-3">
                  <Sun className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Solar Integration</h4>
                    <p className="text-sm text-gray-300">
                      States with net metering can achieve 60-80% energy offset. 
                      Federal tax credit covers 30% of installation costs through 2032.
                    </p>
                    <p className="text-xs text-green-400 mt-2">
                      Best ROI: AZ, CA, NV, NM
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-800/50">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Time-of-Use Optimization</h4>
                    <p className="text-sm text-gray-300">
                      Shift lighting schedules to off-peak hours for 30-50% savings. 
                      Automated controls can manage this seamlessly.
                    </p>
                    <p className="text-xs text-blue-400 mt-2">
                      Highest savings: CA, NY, IL
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg border border-purple-800/50">
                <div className="flex items-start gap-3">
                  <Building className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Facility Design</h4>
                    <p className="text-sm text-gray-300">
                      Sealed rooms with proper insulation reduce HVAC loads by 40%. 
                      Heat recovery systems capture waste heat from lights.
                    </p>
                    <p className="text-xs text-purple-400 mt-2">
                      Critical in: TX, AZ, FL (cooling) & MN, WI, MI (heating)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Risk Analysis */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Climate Risk Factors by Region</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-white">High Risk Areas</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-300">
                  <span className="text-red-400">• Gulf Coast:</span> Hurricanes, flooding
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• Tornado Alley:</span> Severe storms
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• West Coast:</span> Earthquakes, wildfires
                </li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-yellow-400" />
                <h4 className="font-semibold text-white">Climate Challenges</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-300">
                  <span className="text-yellow-400">• Southwest:</span> Extreme heat, drought
                </li>
                <li className="text-gray-300">
                  <span className="text-yellow-400">• Southeast:</span> High humidity
                </li>
                <li className="text-gray-300">
                  <span className="text-yellow-400">• Northeast:</span> Heavy snow loads
                </li>
              </ul>
            </div>

            <div className="bg-green-900/20 rounded-lg p-4 border border-green-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-white">Mitigation Strategies</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-300">
                  <span className="text-green-400">• Backup Power:</span> Generators, batteries
                </li>
                <li className="text-gray-300">
                  <span className="text-green-400">• Insurance:</span> Comprehensive coverage
                </li>
                <li className="text-gray-300">
                  <span className="text-green-400">• Design:</span> Climate-specific engineering
                </li>
              </ul>
            </div>
          </div>
        </div>
          </TabsContent>

          {/* Weather AI Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            {/* Current Weather & Quick Stats */}
            <div className="grid gap-4 md:grid-cols-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentWeather && getWeatherIcon(currentWeather.condition)}
                    Current Conditions
                  </CardTitle>
                  <CardDescription>San Francisco, CA</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentWeather && (
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-white">
                        {currentWeather.temperature.toFixed(1)}°C
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-300">{currentWeather.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-300">{currentWeather.windSpeed} km/h</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Active Adjustments</p>
                      <p className="text-2xl font-bold text-white">{adjustments.filter(a => a.status === 'applied').length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Pending Actions</p>
                      <p className="text-2xl font-bold text-white">{adjustments.filter(a => a.status === 'pending').length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Est. Daily Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${adjustments.filter(a => a.status === 'applied').reduce((sum, a) => sum + a.estimatedSavings, 0).toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Forecast Accuracy</p>
                      <p className="text-2xl font-bold text-white">
                        {aiModels.filter(m => m.active).reduce((sum, m) => sum + m.accuracy, 0) / aiModels.filter(m => m.active).length || 0}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Forecast */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      7-Day Weather Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forecast.map((day, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedDay === index ? 'bg-purple-900/20 border-purple-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedDay(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getWeatherIcon(day.condition)}
                              <div>
                                <div className="font-medium text-white">
                                  {index === 0 ? 'Today' : 
                                   index === 1 ? 'Tomorrow' : 
                                   new Date(day.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-sm text-gray-400 capitalize">
                                  {day.condition}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold text-white">{day.temperature.toFixed(1)}°C</div>
                                <div className="text-sm text-gray-400">{day.humidity.toFixed(0)}% RH</div>
                              </div>
                              
                              <div className="text-right">
                                <Badge className={`${day.confidence >= 90 ? 'bg-green-500' : day.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                  {day.confidence.toFixed(0)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {day.alerts.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {day.alerts.map((alert, alertIndex) => (
                                <div key={alertIndex} className="flex items-center gap-2 text-sm text-orange-400">
                                  <AlertTriangle className="w-4 h-4" />
                                  {alert}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Adjustments Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adjustments.slice(0, 3).map((adjustment) => (
                        <div key={adjustment.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium capitalize text-white">
                              {adjustment.parameter} Adjustment
                            </div>
                            <Badge className={`${
                              adjustment.priority === 'critical' ? 'bg-red-500' : 
                              adjustment.priority === 'high' ? 'bg-orange-500' : 
                              adjustment.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            } text-white`}>
                              {adjustment.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-3">{adjustment.reason}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                            <div>Confidence: {adjustment.confidence}%</div>
                            <div>Savings: ${adjustment.estimatedSavings}</div>
                          </div>
                          
                          {adjustment.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => applyAdjustment(adjustment.id)}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <Play className="w-3 h-3" />
                                Apply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectAdjustment(adjustment.id)}
                                className="flex items-center gap-1"
                              >
                                <Pause className="w-3 h-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Models */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      AI Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiModels.map((model) => (
                        <div key={model.id} className="border border-gray-700 rounded-lg p-3 bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm text-white">{model.name}</div>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${model.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-xs text-gray-400">{model.active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-400 mb-2">
                            {model.description}
                          </p>
                          
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Accuracy:</span>
                              <span className="font-medium text-white">{model.accuracy}%</span>
                            </div>
                          </div>
                          
                          <Progress value={model.accuracy} className="mt-2 h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Climate Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            {!activeTool ? (
              <>
                <div className="text-center mb-8">
                  <Calculator className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">Climate Analysis Tools</h2>
                  <p className="text-gray-300 text-lg">
                    Professional environmental optimization and climate data analysis
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`p-6 rounded-xl border ${tool.borderColor} ${tool.bgColor} bg-gray-900 hover:bg-gray-800 hover:shadow-lg transition-all group`}
                      >
                        <Icon className={`w-12 h-12 ${tool.color} mb-4 mx-auto group-hover:scale-110 transition-transform`} />
                        <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                        <p className="text-sm text-gray-300">{tool.description}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>
                <button
                  onClick={() => setActiveTool(null)}
                  className="mb-4 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 transform rotate-180" />
                  Back to Climate Tools
                </button>
                
                {activeTool === 'psychrometric' && <PsychrometricCalculator />}
                {activeTool === 'environmental-control' && <EnvironmentalControlCalculator />}
                {activeTool === 'heat-load' && <EnhancedHeatLoadCalculator />}
                {activeTool === 'basic-heat-load' && <HeatLoadCalculatorWrapper />}
                {activeTool === 'hvac-selector' && <HVACSystemSelectorWrapper />}
                {activeTool === 'transpiration' && <TranspirationCalculator />}
              </div>
            )}
          </TabsContent>

          {/* Energy Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-900/20 via-gray-900 to-purple-900/20 rounded-xl p-8 border border-gray-800">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Energy Optimization as a Service</span>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Optimize Energy, Share the Savings
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
                    {" "}Keep 75% of What You Save
                  </span>
                </h2>
                
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Join our FREE Energy Savings Program. We optimize your facility's energy use and you keep 75% of the savings. 
                  No upfront costs, no monthly fees - we only make money when you save money.
                </p>
              </div>
            </div>

            {/* Interactive Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Calculate Your Potential Savings</CardTitle>
                <CardDescription className="text-center">See how much you could save with VibeLux energy optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Your Annual Energy Spend
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="50000"
                      max="1000000"
                      step="10000"
                      value={selectedSavings}
                      onChange={(e) => setSelectedSavings(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>$50K</span>
                      <span className="text-2xl font-bold text-white">${selectedSavings.toLocaleString()}</span>
                      <span>$1M</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Monthly Savings Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Energy Cost Reduction (est.)</span>
                        <span className="text-white font-medium">${monthlySavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Demand Response Revenue</span>
                        <span className="text-white font-medium">+${demandResponse.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-700">
                        <span className="text-gray-300 font-medium">Total Monthly Savings</span>
                        <span className="text-green-400 font-bold text-xl">${totalMonthlySavings.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Simple Revenue Share Model</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Savings</span>
                        <span className="text-white font-medium">${totalMonthlySavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">VibeLux Share (25%)</span>
                        <span className="text-white font-medium">-${vibeLuxShare.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-700">
                        <span className="text-gray-300 font-medium">Your Net Savings</span>
                        <span className="text-green-400 font-bold text-xl">${netSavings.toLocaleString()}/mo</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-200 font-medium">No Risk Guarantee</p>
                      <p className="text-blue-300">
                        You only pay from actual savings. If your energy costs don't decrease, you pay nothing. 
                        We succeed only when you save money.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Peak Hour Intelligence",
                  description: "Automatically reduce energy use during expensive peak hours without impacting your harvest"
                },
                {
                  icon: Leaf,
                  title: "Crop-Safe Optimization",
                  description: "Protects critical photoperiods and maintains optimal VPD during all energy events"
                },
                {
                  icon: Grid,
                  title: "Utility Revenue Programs",
                  description: "Earn money from your utility for participating in demand response programs"
                },
                {
                  icon: Battery,
                  title: "Smart Storage Integration",
                  description: "Optimize battery systems for maximum ROI with intelligent charge/discharge cycles"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                          <p className="text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Weather Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Cloud className="w-8 h-8 text-blue-400" />
                    <span className="text-sm text-orange-400">
                      +{(weatherImpactData.reduce((sum, d) => sum + Math.abs(d.weatherImpact), 0) / weatherImpactData.reduce((sum, d) => sum + d.consumption, 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Weather Impact</p>
                  <p className="text-2xl font-bold text-white">
                    {(weatherImpactData.reduce((sum, d) => sum + Math.abs(d.weatherImpact), 0) / 1000).toFixed(0)}K kWh
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Thermometer className="w-8 h-8 text-orange-400" />
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm">Total Heating Days</p>
                  <p className="text-2xl font-bold text-white">
                    {weatherImpactData.reduce((sum, d) => sum + d.hdd, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Sun className="w-8 h-8 text-yellow-400" />
                    <span className="text-sm text-gray-400">CDD</span>
                  </div>
                  <p className="text-gray-400 text-sm">Total Cooling Days</p>
                  <p className="text-2xl font-bold text-white">
                    {weatherImpactData.reduce((sum, d) => sum + d.cdd, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    >
                      <option value="12m">12M</option>
                      <option value="24m">24M</option>
                      <option value="36m">36M</option>
                    </select>
                  </div>
                  <p className="text-gray-400 text-sm">Analysis Period</p>
                  <p className="text-2xl font-bold text-white">
                    {weatherImpactData.length} Months
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weather Normalization Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption: Actual vs Weather-Normalized</CardTitle>
                <CardDescription>
                  Understanding how weather affects your energy usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={weatherImpactData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis yAxisId="left" stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="weatherImpact" fill="#F97316" name="Weather Impact" />
                      <Line yAxisId="left" type="monotone" dataKey="consumption" stroke="#3B82F6" name="Actual Consumption" strokeWidth={2} />
                      <Line yAxisId="left" type="monotone" dataKey="normalizedConsumption" stroke="#10B981" name="Normalized Consumption" strokeWidth={2} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weather Metrics Analysis */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Temperature & Degree Days Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={weatherImpactData.slice(-12)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis yAxisId="left" stroke="#9CA3AF" />
                        <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="right" dataKey="hdd" fill="#60A5FA" name="HDD" />
                        <Bar yAxisId="right" dataKey="cdd" fill="#F87171" name="CDD" />
                        <Line yAxisId="left" type="monotone" dataKey="tavg" stroke="#FBBF24" name="Avg Temp (°F)" strokeWidth={2} />
                        <ReferenceLine yAxisId="left" y={65} stroke="#9CA3AF" strokeDasharray="3 3" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weather Normalization Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="text-white font-medium mb-2">Key Concepts:</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>• <strong>HDD:</strong> Heating degree days</li>
                        <li>• <strong>CDD:</strong> Cooling degree days</li>
                        <li>• <strong>Base Temp:</strong> 65°F standard</li>
                        <li>• <strong>Impact:</strong> Weather effect on usage</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Benefits:</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Fair month-to-month comparisons</li>
                        <li>• Accurate ROI calculations</li>
                        <li>• IPMVP compliance</li>
                        <li>• Removes weather disputes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Adaptive Lighting Tab */}
          <TabsContent value="adaptive" className="space-y-6">
            {/* Location Setup */}
            {(!location.city && !location.lat) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Set Your Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {locationError && (
                    <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <p className="text-yellow-400 text-sm">{locationError}</p>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    if (location.city || location.zipCode) {
                      setLocation({ ...location });
                      setLocationError(null);
                    }
                  }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City Name
                        </label>
                        <Input
                          value={location.city || ''}
                          onChange={(e) => setLocation({ ...location, city: e.target.value })}
                          placeholder="e.g., Denver"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP Code
                        </label>
                        <Input
                          value={location.zipCode || ''}
                          onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                          placeholder="e.g., 80202"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Set Location
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Weather Adaptive Component */}
            {(location.city || location.lat || location.zipCode) && (
              <>
                {/* Location Display */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <MapPin className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-400">Current Location</h3>
                          <p className="text-white font-semibold">
                            {location.city || `Lat: ${location.lat?.toFixed(4)}, Lon: ${location.lon?.toFixed(4)}`}
                            {location.zipCode && ` (${location.zipCode})`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation({})}
                      >
                        Change Location
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <WeatherAdaptiveLighting
                  currentFixtures={[
                    {
                      id: '1',
                      wattage: 600,
                      technology: 'LED',
                      voltage: '120-277V'
                    },
                    {
                      id: '2',
                      wattage: 400,
                      technology: 'LED',
                      voltage: '120-277V'
                    }
                  ]}
                  location={location}
                  className="w-full"
                  onSpectrumRecommendation={(recommendation) => {
                    // Handle spectrum recommendation
                  }}
                />
              </>
            )}

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Monitors real-time weather conditions in your area</li>
                    <li>• Calculates VPD (Vapor Pressure Deficit) for optimal growth</li>
                    <li>• Adjusts spectrum recommendations based on temperature stress</li>
                    <li>• Provides energy-saving control system recommendations</li>
                    <li>• Identifies available rebates and incentives in your area</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Optimize plant growth with weather-adapted lighting</li>
                    <li>• Reduce energy costs with intelligent controls</li>
                    <li>• Prevent stress conditions before they occur</li>
                    <li>• Maximize available rebates and incentives</li>
                    <li>• Improve crop quality and yield consistency</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-800/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Optimize Your Climate Strategy?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Get a comprehensive analysis report for your specific requirements, including 
            detailed cost projections, risk assessments, and optimization recommendations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/calculators"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Use Our Calculators
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
