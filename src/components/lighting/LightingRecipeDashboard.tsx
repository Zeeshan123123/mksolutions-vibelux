'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Edit3,
  Trash2,
  Eye,
  Play,
  Save,
  Settings,
  Palette,
  Sun,
  Moon,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  BookOpen,
  Beaker,
  Leaf,
  Sprout,
  TreePine,
  Cherry,
  Hash,
  RefreshCw
} from 'lucide-react';

interface LightRecipe {
  id: string;
  name: string;
  description: string;
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'all-stages';
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'active' | 'deprecated';
  isPublic: boolean;
  tags: string[];
  
  // Light specifications
  spectrum: {
    blue: number;      // 400-500nm (%)
    green: number;     // 500-600nm (%)
    red: number;       // 600-700nm (%)
    farRed: number;    // 700-800nm (%)
    uv: number;        // 280-400nm (%)
    white: number;     // Full spectrum (%)
  };
  
  // Intensity & timing
  targetPPFD: number;           // μmol/m²/s
  photoperiod: number;          // hours
  dailyLightIntegral: number;   // mol/m²/day (calculated)
  
  // Advanced settings
  dimming: {
    enabled: boolean;
    sunrise: number;    // minutes
    sunset: number;     // minutes
    maxIntensity: number; // %
  };
  
  // Performance data
  metrics: {
    avgYieldIncrease?: number;     // %
    avgEnergyEfficiency?: number;  // %
    avgGrowthRate?: number;        // %
    timesToMarket?: number;        // days saved
    deployments: number;
    successRate?: number;          // %
  };
  
  // Deployment settings
  deployment: {
    zones: string[];
    schedules: ScheduleProfile[];
    conditions: GrowthConditions;
  };
}

interface ScheduleProfile {
  id: string;
  name: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  intensity: number;
  rampDuration: number;
  days: string[]; // ['mon', 'tue', etc.]
}

interface GrowthConditions {
  temperature: { min: number; max: number; optimal: number };
  humidity: { min: number; max: number; optimal: number };
  co2: { min: number; max: number; optimal: number };
  notes: string;
}

interface Zone {
  id: string;
  name: string;
  area: number;
  currentCrop?: string;
  growthStage?: string;
  status: 'active' | 'idle' | 'maintenance';
}

const MOCK_RECIPES: LightRecipe[] = [
  {
    id: '1',
    name: 'Leafy Greens Vegetative',
    description: 'Optimized spectrum for lettuce, spinach, and leafy greens during vegetative growth',
    cropType: 'Leafy Greens',
    growthStage: 'vegetative',
    version: '2.1.0',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'System Template',
    status: 'active',
    isPublic: true,
    tags: ['lettuce', 'spinach', 'kale', 'efficiency'],
    spectrum: {
      blue: 20,
      green: 10,
      red: 55,
      farRed: 10,
      uv: 2,
      white: 3
    },
    targetPPFD: 180,
    photoperiod: 16,
    dailyLightIntegral: 10.4,
    dimming: {
      enabled: true,
      sunrise: 30,
      sunset: 30,
      maxIntensity: 100
    },
    metrics: {
      avgYieldIncrease: 15,
      avgEnergyEfficiency: 22,
      avgGrowthRate: 18,
      timesToMarket: 3,
      deployments: 47,
      successRate: 94
    },
    deployment: {
      zones: ['zone-1', 'zone-3'],
      schedules: [],
      conditions: {
        temperature: { min: 18, max: 24, optimal: 21 },
        humidity: { min: 65, max: 75, optimal: 70 },
        co2: { min: 400, max: 800, optimal: 600 },
        notes: 'Monitor leaf temperature to prevent stress'
      }
    }
  },
  {
    id: '2',
    name: 'Cannabis Flowering Pro',
    description: 'High-performance flowering recipe for cannabis with enhanced terpene production',
    cropType: 'Cannabis',
    growthStage: 'flowering',
    version: '3.0.1',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-04-15'),
    createdBy: 'Mike Rodriguez',
    status: 'active',
    isPublic: false,
    tags: ['cannabis', 'flowering', 'terpenes', 'premium'],
    spectrum: {
      blue: 12,
      green: 8,
      red: 65,
      farRed: 12,
      uv: 3,
      white: 0
    },
    targetPPFD: 800,
    photoperiod: 12,
    dailyLightIntegral: 34.6,
    dimming: {
      enabled: true,
      sunrise: 15,
      sunset: 15,
      maxIntensity: 100
    },
    metrics: {
      avgYieldIncrease: 28,
      avgEnergyEfficiency: 35,
      avgGrowthRate: 25,
      deployments: 23,
      successRate: 91
    },
    deployment: {
      zones: ['zone-7', 'zone-8'],
      schedules: [],
      conditions: {
        temperature: { min: 20, max: 26, optimal: 23 },
        humidity: { min: 45, max: 55, optimal: 50 },
        co2: { min: 800, max: 1200, optimal: 1000 },
        notes: 'Reduce humidity during late flowering to prevent mold'
      }
    }
  },
  {
    id: '3',
    name: 'Tomato Seedling Starter',
    description: 'Gentle spectrum for tomato seedling establishment and early growth',
    cropType: 'Tomato',
    growthStage: 'seedling',
    version: '1.4.2',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'Lisa Zhang',
    status: 'draft',
    isPublic: true,
    tags: ['tomato', 'seedling', 'gentle', 'establishment'],
    spectrum: {
      blue: 25,
      green: 15,
      red: 45,
      farRed: 8,
      uv: 1,
      white: 6
    },
    targetPPFD: 120,
    photoperiod: 14,
    dailyLightIntegral: 6.0,
    dimming: {
      enabled: true,
      sunrise: 45,
      sunset: 45,
      maxIntensity: 80
    },
    metrics: {
      deployments: 8,
      successRate: 97
    },
    deployment: {
      zones: [],
      schedules: [],
      conditions: {
        temperature: { min: 20, max: 25, optimal: 22 },
        humidity: { min: 70, max: 80, optimal: 75 },
        co2: { min: 400, max: 600, optimal: 500 },
        notes: 'Keep soil temperature consistent for optimal germination'
      }
    }
  }
];

const MOCK_ZONES: Zone[] = [
  { id: 'zone-1', name: 'Greenhouse A - North', area: 200, currentCrop: 'Lettuce', growthStage: 'vegetative', status: 'active' },
  { id: 'zone-2', name: 'Greenhouse A - South', area: 200, status: 'idle' },
  { id: 'zone-3', name: 'Greenhouse B - East', area: 150, currentCrop: 'Spinach', growthStage: 'vegetative', status: 'active' },
  { id: 'zone-4', name: 'Greenhouse B - West', area: 150, status: 'maintenance' },
  { id: 'zone-5', name: 'Indoor Room 1', area: 100, currentCrop: 'Cannabis', growthStage: 'vegetative', status: 'active' },
  { id: 'zone-6', name: 'Indoor Room 2', area: 100, currentCrop: 'Cannabis', growthStage: 'flowering', status: 'active' },
  { id: 'zone-7', name: 'Indoor Room 3', area: 100, currentCrop: 'Cannabis', growthStage: 'flowering', status: 'active' },
  { id: 'zone-8', name: 'Indoor Room 4', area: 100, status: 'idle' }
];

export function LightingRecipeDashboard() {
  const [recipes, setRecipes] = useState<LightRecipe[]>(MOCK_RECIPES);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [selectedRecipe, setSelectedRecipe] = useState<LightRecipe | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'library' | 'deploy' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCrop = filterCrop === 'all' || recipe.cropType.toLowerCase().includes(filterCrop.toLowerCase());
    const matchesStage = filterStage === 'all' || recipe.growthStage === filterStage;
    const matchesStatus = filterStatus === 'all' || recipe.status === filterStatus;
    
    return matchesSearch && matchesCrop && matchesStage && matchesStatus;
  });

  // Calculate metrics
  const metrics = {
    totalRecipes: recipes.length,
    activeRecipes: recipes.filter(r => r.status === 'active').length,
    totalDeployments: recipes.reduce((sum, r) => sum + r.metrics.deployments, 0),
    avgSuccessRate: recipes.filter(r => r.metrics.successRate).length > 0
      ? (recipes.reduce((sum, r) => sum + (r.metrics.successRate || 0), 0) / 
         recipes.filter(r => r.metrics.successRate).length).toFixed(1)
      : '0',
    zonesWithRecipes: zones.filter(z => z.status === 'active').length,
    avgYieldIncrease: recipes.filter(r => r.metrics.avgYieldIncrease).length > 0
      ? (recipes.reduce((sum, r) => sum + (r.metrics.avgYieldIncrease || 0), 0) / 
         recipes.filter(r => r.metrics.avgYieldIncrease).length).toFixed(1)
      : '0'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'draft': return 'text-yellow-400';
      case 'deprecated': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20';
      case 'draft': return 'bg-yellow-500/20';
      case 'deprecated': return 'bg-gray-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getGrowthStageIcon = (stage: string) => {
    switch (stage) {
      case 'seedling': return <Sprout className="w-4 h-4" />;
      case 'vegetative': return <Leaf className="w-4 h-4" />;
      case 'flowering': return <Cherry className="w-4 h-4" />;
      default: return <TreePine className="w-4 h-4" />;
    }
  };

  const getCropTypeIcon = (cropType: string) => {
    if (cropType.toLowerCase().includes('cannabis')) return '🌿';
    if (cropType.toLowerCase().includes('tomato')) return '🍅';
    if (cropType.toLowerCase().includes('lettuce')) return '🥬';
    if (cropType.toLowerCase().includes('leafy')) return '🥬';
    return '🌱';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Lighting Recipe Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Create, manage, and deploy lighting recipes for optimal crop growth
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <nav className="flex space-x-1" aria-label="Tabs">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'library', label: 'Recipe Library', icon: BookOpen },
            { id: 'create', label: 'Recipe Builder', icon: Beaker },
            { id: 'deploy', label: 'Deployment', icon: Play },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group relative px-4 py-3 text-sm font-medium rounded-t-lg transition-all
                  ${activeTab === tab.id 
                    ? 'text-white bg-gray-950 border-t border-l border-r border-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span className="text-gray-400 text-sm">Total Recipes</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.totalRecipes}</p>
                <p className="text-emerald-400 text-sm">{metrics.activeRecipes} active</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Deployments</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.totalDeployments}</p>
                <p className="text-blue-400 text-sm">Across {metrics.zonesWithRecipes} zones</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.avgSuccessRate}%</p>
                <p className="text-green-400 text-sm">Average</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Yield Increase</span>
                </div>
                <p className="text-2xl font-bold text-white">+{metrics.avgYieldIncrease}%</p>
                <p className="text-purple-400 text-sm">Average</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-gray-400 text-sm">Energy Saved</span>
                </div>
                <p className="text-2xl font-bold text-white">22%</p>
                <p className="text-amber-400 text-sm">Average</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span className="text-gray-400 text-sm">Time Saved</span>
                </div>
                <p className="text-2xl font-bold text-white">5.2</p>
                <p className="text-indigo-400 text-sm">Days to market</p>
              </div>
            </div>

            {/* Top Performing Recipes */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performing Recipes</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recipes.filter(r => r.status === 'active' && r.metrics.successRate && r.metrics.successRate > 90)
                  .sort((a, b) => (b.metrics.successRate || 0) - (a.metrics.successRate || 0))
                  .slice(0, 3)
                  .map(recipe => (
                  <div key={recipe.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCropTypeIcon(recipe.cropType)}</span>
                        <div>
                          <h4 className="font-medium text-white">{recipe.name}</h4>
                          <p className="text-sm text-gray-400">{recipe.cropType}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(recipe.status)} ${getStatusColor(recipe.status)}`}>
                        {recipe.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Success Rate</p>
                        <p className="text-green-400 font-medium">{recipe.metrics.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Deployments</p>
                        <p className="text-white font-medium">{recipe.metrics.deployments}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Yield Increase</p>
                        <p className="text-purple-400 font-medium">+{recipe.metrics.avgYieldIncrease}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">PPFD Target</p>
                        <p className="text-blue-400 font-medium">{recipe.targetPPFD}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Deployments */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Active Deployments</h3>
              <div className="space-y-3">
                {zones.filter(z => z.status === 'active' && z.currentCrop).map(zone => {
                  const activeRecipe = recipes.find(r => r.deployment.zones.includes(zone.id));
                  return (
                    <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <Sun className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{zone.name}</p>
                          <p className="text-sm text-gray-400">
                            {zone.currentCrop} • {zone.area}m² • {zone.growthStage}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activeRecipe ? (
                          <>
                            <p className="text-sm font-medium text-white">{activeRecipe.name}</p>
                            <p className="text-xs text-gray-400">{activeRecipe.targetPPFD} PPFD</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">No recipe assigned</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recipe Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Crops</option>
                <option value="cannabis">Cannabis</option>
                <option value="lettuce">Lettuce</option>
                <option value="tomato">Tomato</option>
                <option value="leafy">Leafy Greens</option>
              </select>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Stages</option>
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>

            {/* Recipe Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-colors">
                  {/* Recipe Header */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCropTypeIcon(recipe.cropType)}</span>
                        <div>
                          <h3 className="font-semibold text-white">{recipe.name}</h3>
                          <p className="text-sm text-gray-400">{recipe.cropType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(recipe.status)} ${getStatusColor(recipe.status)}`}>
                          {recipe.status}
                        </span>
                        {!recipe.isPublic && <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getGrowthStageIcon(recipe.growthStage)}
                      <span className="text-sm text-gray-300 capitalize">{recipe.growthStage}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">v{recipe.version}</span>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2">{recipe.description}</p>
                  </div>

                  {/* Spectrum Visualization */}
                  <div className="p-4 border-b border-gray-800">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Spectrum Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-blue-400 w-12">Blue</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${recipe.spectrum.blue}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{recipe.spectrum.blue}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-green-400 w-12">Green</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${recipe.spectrum.green}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{recipe.spectrum.green}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-400 w-12">Red</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${recipe.spectrum.red}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{recipe.spectrum.red}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-pink-400 w-12">Far Red</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${recipe.spectrum.farRed}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{recipe.spectrum.farRed}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Metrics */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">PPFD Target</p>
                        <p className="text-white font-medium">{recipe.targetPPFD} μmol/m²/s</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Photoperiod</p>
                        <p className="text-white font-medium">{recipe.photoperiod}h</p>
                      </div>
                      <div>
                        <p className="text-gray-400">DLI</p>
                        <p className="text-white font-medium">{recipe.dailyLightIntegral} mol/m²/day</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Deployments</p>
                        <p className="text-white font-medium">{recipe.metrics.deployments}</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {recipe.metrics.successRate && (
                    <div className="p-4 border-b border-gray-800">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Performance</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Success Rate</p>
                          <p className="text-green-400 font-medium">{recipe.metrics.successRate}%</p>
                        </div>
                        {recipe.metrics.avgYieldIncrease && (
                          <div>
                            <p className="text-gray-400">Yield Increase</p>
                            <p className="text-purple-400 font-medium">+{recipe.metrics.avgYieldIncrease}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedRecipe(recipe)}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {recipe.status === 'active' && (
                        <button 
                          onClick={() => {
                            setSelectedRecipe(recipe);
                            setShowDeployModal(true);
                          }}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs would show coming soon messages for now */}
        {(activeTab === 'create' || activeTab === 'deploy' || activeTab === 'analytics') && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-xl mb-4">
              <Lightbulb className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Advanced {activeTab} features are being developed for comprehensive lighting recipe management.
            </p>
          </div>
        )}
      </div>

      {/* Recipe Details Modal */}
      {selectedRecipe && !showDeployModal && (
        <RecipeDetailsModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Deployment Modal */}
      {showDeployModal && selectedRecipe && (
        <DeploymentModal
          recipe={selectedRecipe}
          zones={zones}
          onClose={() => {
            setShowDeployModal(false);
            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}

// Recipe Details Modal Component
function RecipeDetailsModal({ 
  recipe, 
  onClose 
}: { 
  recipe: LightRecipe;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">{recipe.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Recipe Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Crop Type:</span>
                  <span className="text-white">{recipe.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Growth Stage:</span>
                  <span className="text-white capitalize">{recipe.growthStage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white">v{recipe.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created By:</span>
                  <span className="text-white">{recipe.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">{recipe.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                {recipe.metrics.successRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="text-green-400">{recipe.metrics.successRate}%</span>
                  </div>
                )}
                {recipe.metrics.avgYieldIncrease && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Yield Increase:</span>
                    <span className="text-purple-400">+{recipe.metrics.avgYieldIncrease}%</span>
                  </div>
                )}
                {recipe.metrics.avgEnergyEfficiency && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energy Efficiency:</span>
                    <span className="text-blue-400">+{recipe.metrics.avgEnergyEfficiency}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Deployments:</span>
                  <span className="text-white">{recipe.metrics.deployments}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spectrum Details */}
          <div>
            <h4 className="font-medium text-white mb-3">Spectrum Configuration</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(recipe.spectrum).map(([channel, value]) => (
                  <div key={channel}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300 capitalize">{channel.replace('_', ' ')}</span>
                      <span className="text-sm text-white">{value}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          channel === 'blue' ? 'bg-blue-500' :
                          channel === 'green' ? 'bg-green-500' :
                          channel === 'red' ? 'bg-red-500' :
                          channel === 'farRed' ? 'bg-pink-500' :
                          channel === 'uv' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Light Parameters */}
          <div>
            <h4 className="font-medium text-white mb-3">Light Parameters</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Target PPFD</p>
                  <p className="text-white font-medium">{recipe.targetPPFD} μmol/m²/s</p>
                </div>
                <div>
                  <p className="text-gray-400">Photoperiod</p>
                  <p className="text-white font-medium">{recipe.photoperiod} hours</p>
                </div>
                <div>
                  <p className="text-gray-400">Daily Light Integral</p>
                  <p className="text-white font-medium">{recipe.dailyLightIntegral} mol/m²/day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dimming Configuration */}
          <div>
            <h4 className="font-medium text-white mb-3">Dimming Configuration</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Dimming Enabled</p>
                  <p className="text-white font-medium">{recipe.dimming.enabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Sunrise Ramp</p>
                  <p className="text-white font-medium">{recipe.dimming.sunrise} min</p>
                </div>
                <div>
                  <p className="text-gray-400">Sunset Ramp</p>
                  <p className="text-white font-medium">{recipe.dimming.sunset} min</p>
                </div>
                <div>
                  <p className="text-gray-400">Max Intensity</p>
                  <p className="text-white font-medium">{recipe.dimming.maxIntensity}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Conditions */}
          <div>
            <h4 className="font-medium text-white mb-3">Recommended Conditions</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Temperature</p>
                  <p className="text-white font-medium">
                    {recipe.deployment.conditions.temperature.optimal}°C 
                    <span className="text-gray-400 ml-1">
                      ({recipe.deployment.conditions.temperature.min}-{recipe.deployment.conditions.temperature.max}°C)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Humidity</p>
                  <p className="text-white font-medium">
                    {recipe.deployment.conditions.humidity.optimal}% 
                    <span className="text-gray-400 ml-1">
                      ({recipe.deployment.conditions.humidity.min}-{recipe.deployment.conditions.humidity.max}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">CO₂</p>
                  <p className="text-white font-medium">
                    {recipe.deployment.conditions.co2.optimal} ppm
                    <span className="text-gray-400 ml-1">
                      ({recipe.deployment.conditions.co2.min}-{recipe.deployment.conditions.co2.max} ppm)
                    </span>
                  </p>
                </div>
              </div>
              {recipe.deployment.conditions.notes && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Notes:</p>
                  <p className="text-white text-sm">{recipe.deployment.conditions.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="font-medium text-white mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Deploy Recipe
          </button>
        </div>
      </div>
    </div>
  );
}

// Deployment Modal Component
function DeploymentModal({ 
  recipe, 
  zones,
  onClose 
}: { 
  recipe: LightRecipe;
  zones: Zone[];
  onClose: () => void;
}) {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [deploymentType, setDeploymentType] = useState<'immediate' | 'scheduled'>('immediate');

  const availableZones = zones.filter(z => z.status !== 'maintenance');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">Deploy Recipe: {recipe.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Zone Selection */}
          <div>
            <h4 className="font-medium text-white mb-3">Select Zones</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableZones.map(zone => (
                <label key={zone.id} className="flex items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedZones.includes(zone.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedZones([...selectedZones, zone.id]);
                      } else {
                        setSelectedZones(selectedZones.filter(id => id !== zone.id));
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{zone.name}</p>
                    <p className="text-sm text-gray-400">
                      {zone.area}m² • {zone.currentCrop || 'No crop'} • {zone.status}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    zone.status === 'active' ? 'bg-green-400' :
                    zone.status === 'idle' ? 'bg-gray-400' :
                    'bg-yellow-400'
                  }`} />
                </label>
              ))}
            </div>
          </div>

          {/* Deployment Type */}
          <div>
            <h4 className="font-medium text-white mb-3">Deployment Type</h4>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                <input
                  type="radio"
                  name="deploymentType"
                  value="immediate"
                  checked={deploymentType === 'immediate'}
                  onChange={() => setDeploymentType('immediate')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-white">Immediate</p>
                  <p className="text-sm text-gray-400">Deploy recipe now</p>
                </div>
              </label>
              <label className="flex items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                <input
                  type="radio"
                  name="deploymentType"
                  value="scheduled"
                  checked={deploymentType === 'scheduled'}
                  onChange={() => setDeploymentType('scheduled')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-white">Scheduled</p>
                  <p className="text-sm text-gray-400">Schedule for later</p>
                </div>
              </label>
            </div>
          </div>

          {/* Recipe Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Recipe Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Target PPFD</p>
                <p className="text-white font-medium">{recipe.targetPPFD} μmol/m²/s</p>
              </div>
              <div>
                <p className="text-gray-400">Photoperiod</p>
                <p className="text-white font-medium">{recipe.photoperiod} hours</p>
              </div>
              <div>
                <p className="text-gray-400">Growth Stage</p>
                <p className="text-white font-medium capitalize">{recipe.growthStage}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={selectedZones.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Deploy to {selectedZones.length} Zone{selectedZones.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}