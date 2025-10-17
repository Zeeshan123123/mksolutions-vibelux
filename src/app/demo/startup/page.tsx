'use client';

import React, { useState } from 'react';
import {
  Rocket,
  TrendingUp,
  DollarSign,
  Users,
  Lightbulb,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  Share2,
  Calculator,
  PieChart,
  Calendar,
  Building2,
  Leaf,
  Zap,
  Eye,
  FileText,
  Award,
  Settings,
  ArrowRight,
  Briefcase,
  MapPin,
  Phone
} from 'lucide-react';

interface BusinessPlan {
  concept: string;
  cropType: string;
  facilitySize: number;
  location: string;
  investmentRequired: number;
  projectedRevenue: number;
  breakEvenMonths: number;
  roi: number;
  funding: {
    equity: number;
    debt: number;
    grants: number;
  };
}

interface MarketAnalysis {
  targetMarket: string;
  marketSize: number;
  competition: 'low' | 'medium' | 'high';
  growthRate: number;
  pricePerPound: number;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  budget: number;
  dependencies: string[];
}

export default function StartupDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'financial' | 'market' | 'timeline' | 'resources'>('overview');
  const [selectedCrop, setSelectedCrop] = useState('leafy-greens');

  const businessPlan: BusinessPlan = {
    concept: 'Vertical Farm Startup',
    cropType: 'Mixed Leafy Greens',
    facilitySize: 10000,
    location: 'Austin, Texas',
    investmentRequired: 1200000,
    projectedRevenue: 850000,
    breakEvenMonths: 18,
    roi: 32,
    funding: {
      equity: 500000,
      debt: 400000,
      grants: 300000
    }
  };

  const marketAnalysis: MarketAnalysis = {
    targetMarket: 'Local Restaurants & Grocery',
    marketSize: 24500000,
    competition: 'medium',
    growthRate: 12.5,
    pricePerPound: 4.85,
    demandTrend: 'increasing'
  };

  const milestones: Milestone[] = [
    {
      id: 'milestone-1',
      title: 'Business Plan Complete',
      description: 'Finalize business plan, financial projections, and market analysis',
      targetDate: '2024-03-15',
      status: 'completed',
      budget: 15000,
      dependencies: []
    },
    {
      id: 'milestone-2',
      title: 'Seed Funding Secured',
      description: 'Raise initial $500K in seed funding from angel investors',
      targetDate: '2024-05-01',
      status: 'in_progress',
      budget: 500000,
      dependencies: ['milestone-1']
    },
    {
      id: 'milestone-3',
      title: 'Location Secured',
      description: 'Sign lease for 10,000 sq ft facility in Austin',
      targetDate: '2024-06-15',
      status: 'upcoming',
      budget: 85000,
      dependencies: ['milestone-2']
    },
    {
      id: 'milestone-4',
      title: 'Equipment Procurement',
      description: 'Order LED fixtures, racking, and climate control systems',
      targetDate: '2024-07-30',
      status: 'upcoming',
      budget: 450000,
      dependencies: ['milestone-3']
    },
    {
      id: 'milestone-5',
      title: 'Facility Construction',
      description: 'Complete build-out and equipment installation',
      targetDate: '2024-10-15',
      status: 'upcoming',
      budget: 285000,
      dependencies: ['milestone-4']
    },
    {
      id: 'milestone-6',
      title: 'First Harvest',
      description: 'Achieve first commercial harvest and sales',
      targetDate: '2024-12-01',
      status: 'upcoming',
      budget: 25000,
      dependencies: ['milestone-5']
    }
  ];

  const cropOptions = [
    {
      id: 'leafy-greens',
      name: 'Leafy Greens',
      varieties: ['Lettuce', 'Spinach', 'Arugula', 'Kale'],
      cycleTime: 35,
      yieldPerSqFt: 8.5,
      pricePerPound: 4.85,
      marketDemand: 'high',
      difficulty: 'easy'
    },
    {
      id: 'herbs',
      name: 'Culinary Herbs',
      varieties: ['Basil', 'Cilantro', 'Parsley', 'Mint'],
      cycleTime: 42,
      yieldPerSqFt: 6.2,
      pricePerPound: 12.50,
      marketDemand: 'high',
      difficulty: 'medium'
    },
    {
      id: 'microgreens',
      name: 'Microgreens',
      varieties: ['Pea Shoots', 'Sunflower', 'Radish', 'Broccoli'],
      cycleTime: 14,
      yieldPerSqFt: 12.0,
      pricePerPound: 28.00,
      marketDemand: 'medium',
      difficulty: 'easy'
    },
    {
      id: 'strawberries',
      name: 'Strawberries',
      varieties: ['Albion', 'San Andreas', 'Monterey'],
      cycleTime: 120,
      yieldPerSqFt: 15.0,
      pricePerPound: 8.50,
      marketDemand: 'very high',
      difficulty: 'hard'
    }
  ];

  const fundingOptions = [
    {
      type: 'Angel Investors',
      amount: 250000,
      equity: 15,
      timeline: '3-6 months',
      difficulty: 'medium',
      pros: ['Industry expertise', 'Networking'],
      cons: ['Equity dilution', 'Board involvement']
    },
    {
      type: 'VC Funding',
      amount: 1500000,
      equity: 25,
      timeline: '6-12 months',
      difficulty: 'hard',
      pros: ['Large amounts', 'Growth support'],
      cons: ['High expectations', 'Control loss']
    },
    {
      type: 'SBA Loan',
      amount: 500000,
      equity: 0,
      timeline: '2-4 months',
      difficulty: 'medium',
      pros: ['No equity', 'Lower rates'],
      cons: ['Personal guarantee', 'Collateral required']
    },
    {
      type: 'USDA Grants',
      amount: 150000,
      equity: 0,
      timeline: '6-18 months',
      difficulty: 'hard',
      pros: ['No repayment', 'Government backing'],
      cons: ['Competitive', 'Reporting requirements']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in_progress': return 'text-blue-400 bg-blue-900/20';
      case 'upcoming': return 'text-gray-400 bg-gray-700/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedCropData = cropOptions.find(c => c.id === selectedCrop) || cropOptions[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Rocket className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-xl font-bold">Startup Launchpad</h1>
                  <p className="text-sm text-gray-400">CEA Business Planning & Launch Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Plan
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Investment Required</p>
                  <p className="text-2xl font-bold">{formatCurrency(businessPlan.investmentRequired)}</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-400">Total startup capital</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Projected ROI</p>
                  <p className="text-2xl font-bold">{businessPlan.roi}%</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-green-400">Annual return</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Break Even</p>
                  <p className="text-2xl font-bold">{businessPlan.breakEvenMonths}</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-400">Months to profitability</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Revenue Y1</p>
                  <p className="text-2xl font-bold">{formatCurrency(businessPlan.projectedRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-orange-400">First year projection</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'business', label: 'Business Plan', icon: Briefcase },
              { id: 'financial', label: 'Financials', icon: DollarSign },
              { id: 'market', label: 'Market Analysis', icon: TrendingUp },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'resources', label: 'Resources', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Business Concept */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Business Concept</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Concept Type</label>
                    <p className="font-medium">{businessPlan.concept}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Primary Crop</label>
                    <p className="font-medium">{businessPlan.cropType}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Facility Size</label>
                    <p className="font-medium">{businessPlan.facilitySize.toLocaleString()} sq ft</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Location</label>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {businessPlan.location}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Market</label>
                    <p className="font-medium">{marketAnalysis.targetMarket}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Market Size</label>
                    <p className="font-medium">{formatCurrency(marketAnalysis.marketSize)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-6 h-6 text-blue-400" />
                  <h4 className="font-semibold">Financial Modeling</h4>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Build detailed financial projections and cash flow models
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                  Open Calculator
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  <h4 className="font-semibold">Crop Selection</h4>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Compare different crops and optimize your growing strategy
                </p>
                <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm">
                  Crop Analyzer
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                  <h4 className="font-semibold">Funding Options</h4>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Explore investment opportunities and grant programs
                </p>
                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                  Find Funding
                </button>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Launch Progress</h3>
              <div className="space-y-4">
                {milestones.slice(0, 3).map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-gray-400">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Target: {new Date(milestone.targetDate).toLocaleDateString()}</p>
                      <p className="text-sm font-medium">{formatCurrency(milestone.budget)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Crop Selection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Crop Selection Analysis</h3>
              <div className="mb-6">
                <div className="flex gap-2">
                  {cropOptions.map((crop) => (
                    <button
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        selectedCrop === crop.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {crop.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedCropData.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCropData.varieties.map((variety, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                          {variety}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Cycle Time</span>
                      <p className="font-medium">{selectedCropData.cycleTime} days</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Yield/sq ft</span>
                      <p className="font-medium">{selectedCropData.yieldPerSqFt} lbs</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Price/lb</span>
                      <p className="font-medium">{formatCurrency(selectedCropData.pricePerPound)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Difficulty</span>
                      <p className={`font-medium ${getDifficultyColor(selectedCropData.difficulty)}`}>
                        {selectedCropData.difficulty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Revenue Projections (10,000 sq ft)</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annual Yield:</span>
                        <span className="font-medium">
                          {((10000 * selectedCropData.yieldPerSqFt * 365) / selectedCropData.cycleTime).toLocaleString()} lbs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gross Revenue:</span>
                        <span className="font-medium text-green-400">
                          {formatCurrency(((10000 * selectedCropData.yieldPerSqFt * 365) / selectedCropData.cycleTime) * selectedCropData.pricePerPound)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cycles/Year:</span>
                        <span className="font-medium">{(365 / selectedCropData.cycleTime).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Market Demand</h5>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      selectedCropData.marketDemand === 'very high' ? 'bg-green-900/20 text-green-400' :
                      selectedCropData.marketDemand === 'high' ? 'bg-blue-900/20 text-blue-400' :
                      selectedCropData.marketDemand === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {selectedCropData.marketDemand}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment & Technology */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Equipment & Technology Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-blue-400" />
                    <h4 className="font-medium">LED Lighting</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">SPYDR 2p Fixtures:</span>
                      <span>65 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total PPFD:</span>
                      <span>400 µmol/m²/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Power Consumption:</span>
                      <span>45 kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-green-400">{formatCurrency(273000)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-6 h-6 text-purple-400" />
                    <h4 className="font-medium">Growing Systems</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vertical Racks:</span>
                      <span>48 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growing Levels:</span>
                      <span>6 tiers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NFT Channels:</span>
                      <span>288 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-green-400">{formatCurrency(185000)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="w-6 h-6 text-orange-400" />
                    <h4 className="font-medium">Climate Control</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">HVAC System:</span>
                      <span>25 ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dehumidifiers:</span>
                      <span>4 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CO₂ System:</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-green-400">{formatCurrency(125000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Funding Breakdown */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Funding Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Capital Requirements</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Equipment & Technology:</span>
                      <span className="font-medium">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Facility & Build-out:</span>
                      <span className="font-medium">{formatCurrency(285000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Working Capital:</span>
                      <span className="font-medium">{formatCurrency(180000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contingency (10%):</span>
                      <span className="font-medium">{formatCurrency(85000)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Required:</span>
                        <span className="font-bold text-green-400">{formatCurrency(businessPlan.investmentRequired)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Funding Sources</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Personal Equity:</span>
                      <span className="font-medium">{formatCurrency(businessPlan.funding.equity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bank Loan (SBA):</span>
                      <span className="font-medium">{formatCurrency(businessPlan.funding.debt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grants & Incentives:</span>
                      <span className="font-medium">{formatCurrency(businessPlan.funding.grants)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Secured:</span>
                        <span className="font-bold text-blue-400">{formatCurrency(Object.values(businessPlan.funding).reduce((a, b) => a + b, 0))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Projections */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">5-Year Financial Projections</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((year) => {
                  const revenue = businessPlan.projectedRevenue * Math.pow(1.15, year - 1);
                  const expenses = revenue * 0.65;
                  const profit = revenue - expenses;
                  
                  return (
                    <div key={year} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="font-bold">Y{year}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Year {year}</h4>
                          <p className="text-sm text-gray-400">
                            {year === 1 ? 'Ramp-up year' : 
                             year === 2 ? 'Full production' :
                             year <= 3 ? 'Growth phase' : 'Mature operations'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-right">
                        <div>
                          <p className="text-sm text-gray-400">Revenue</p>
                          <p className="font-medium">{formatCurrency(revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Expenses</p>
                          <p className="font-medium">{formatCurrency(expenses)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Profit</p>
                          <p className="font-medium text-green-400">{formatCurrency(profit)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funding Options */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Available Funding Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fundingOptions.map((option, index) => (
                  <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{option.type}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(option.difficulty)}`}>
                        {option.difficulty}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="font-medium">{formatCurrency(option.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Equity:</span>
                        <span className="font-medium">{option.equity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timeline:</span>
                        <span className="font-medium">{option.timeline}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-green-400">Pros:</span>
                        <ul className="text-gray-400 ml-2">
                          {option.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-red-400">Cons:</span>
                        <ul className="text-gray-400 ml-2">
                          {option.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Launch Timeline</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">
                    Update Progress
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Share2 className="w-4 h-4 inline mr-2" />
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          milestone.status === 'completed' ? 'bg-green-500 border-green-500' :
                          milestone.status === 'in_progress' ? 'bg-blue-500 border-blue-500' :
                          'bg-gray-700 border-gray-600'
                        }`}></div>
                        {index < milestones.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-600 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-400">
                              {new Date(milestone.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-3">{milestone.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">Budget: {formatCurrency(milestone.budget)}</span>
                            {milestone.dependencies.length > 0 && (
                              <span className="text-gray-400">
                                Dependencies: {milestone.dependencies.length}
                              </span>
                            )}
                          </div>
                          
                          {milestone.status === 'in_progress' && (
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs">
                                Mark Complete
                              </button>
                              <button className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">
                                Add Note
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Learning Resources */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Educational Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <h4 className="font-medium">CEA Business Planning Guide</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Comprehensive guide to starting a controlled environment agriculture business
                    </p>
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      Download PDF →
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Calculator className="w-5 h-5 text-green-400" />
                      <h4 className="font-medium">Financial Planning Template</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Excel template with formulas for crop yield and revenue projections
                    </p>
                    <button className="text-sm text-green-400 hover:text-green-300">
                      Download Excel →
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <h4 className="font-medium">Industry Connections</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Connect with other entrepreneurs, suppliers, and industry experts
                    </p>
                    <button className="text-sm text-purple-400 hover:text-purple-300">
                      Join Community →
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-orange-400" />
                      <h4 className="font-medium">Grant Database</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Search federal, state, and private funding opportunities
                    </p>
                    <button className="text-sm text-orange-400 hover:text-orange-300">
                      Search Grants →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Consultation */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Expert Consultation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <h4 className="font-medium mb-2">Business Strategy</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    1-hour consultation on business planning and market strategy
                  </p>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                    Book Session
                  </button>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <h4 className="font-medium mb-2">Crop Optimization</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Technical guidance on crop selection and growing protocols
                  </p>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                    Book Session
                  </button>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <h4 className="font-medium mb-2">Funding Strategy</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Expert advice on fundraising and investor relations
                  </p>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}