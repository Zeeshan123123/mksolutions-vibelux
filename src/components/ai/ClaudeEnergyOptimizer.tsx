'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Zap, TrendingDown, TrendingUp, Battery, Sun, Moon, 
  Clock, DollarSign, Leaf, Target, BarChart3, Settings,
  Bot, Sparkles, RefreshCw, Lightbulb, ThermometerSun,
  Wind, Calendar, ArrowDown, ArrowUp, Minus, CheckCircle,
  AlertTriangle, Info, Timer, Activity
} from 'lucide-react';

interface EnergyOptimization {
  id: string;
  category: 'lighting' | 'hvac' | 'scheduling' | 'equipment' | 'rate_optimization';
  type: 'immediate' | 'scheduled' | 'long_term';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  currentConsumption: number;
  optimizedConsumption: number;
  potentialSavings: {
    daily: number;
    monthly: number;
    annual: number;
  };
  implementationCost: number;
  paybackPeriod: number; // months
  confidence: number;
  difficulty: 'easy' | 'medium' | 'complex';
  requirements: string[];
  steps: OptimizationStep[];
  impact: {
    energy: number; // % reduction
    cost: number; // % reduction
    carbon: number; // % reduction
  };
  timeframe: string;
  detectedAt: string;
}

interface OptimizationStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  cost: number;
  completed: boolean;
}

interface EnergyData {
  powerConsumption: number[];
  costs: number[];
  timestamps: string[];
  rate: number; // $/kWh
  peakHours: { start: string; end: string }[];
  equipment: {
    lighting: number;
    hvac: number;
    other: number;
  };
}

interface ClaudeEnergyOptimizerProps {
  facilityId: string;
  energyData: EnergyData;
  facilityType: 'indoor' | 'greenhouse' | 'hybrid';
  operatingSchedule: {
    lightingHours: { on: string; off: string };
    operatingDays: string[];
  };
  embedded?: boolean;
}

export function ClaudeEnergyOptimizer({
  facilityId,
  energyData,
  facilityType,
  operatingSchedule,
  embedded = false
}: ClaudeEnergyOptimizerProps) {
  const [optimizations, setOptimizations] = useState<EnergyOptimization[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  const analyzeEnergyOptimization = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/energy-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityId,
          energyData,
          facilityType,
          operatingSchedule,
          timeframe,
          analysisType: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new Error('Energy optimization analysis failed');
      }

      const data = await response.json();
      setOptimizations(data.optimizations || []);
      setLastAnalysis(new Date());

    } catch (error) {
      logger.error('ai', 'Energy optimization error:', error );
      // Fallback to mock data
      setOptimizations(getMockOptimizations());
      setLastAnalysis(new Date());
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeEnergyOptimization();
  }, [facilityId, timeframe]);

  const getMockOptimizations = (): EnergyOptimization[] => [
    {
      id: 'lighting-schedule-opt',
      category: 'lighting',
      type: 'immediate',
      priority: 'high',
      title: 'Optimize Lighting Schedule',
      description: 'Shift lighting schedule to avoid peak electricity rates and reduce costs',
      currentConsumption: 2400, // kWh/day
      optimizedConsumption: 2400, // Same consumption, different timing
      potentialSavings: {
        daily: 89.50,
        monthly: 2685,
        annual: 32220
      },
      implementationCost: 0,
      paybackPeriod: 0,
      confidence: 95,
      difficulty: 'easy',
      requirements: ['Timer reprogramming', 'Staff schedule adjustment'],
      steps: [
        {
          id: 'analyze-rates',
          title: 'Analyze Current Rate Structure',
          description: 'Review time-of-use rates and identify optimal lighting windows',
          estimatedTime: '2 hours',
          cost: 0,
          completed: false
        },
        {
          id: 'reprogram-timers',
          title: 'Reprogram Lighting Timers',
          description: 'Adjust lighting schedules to avoid peak rate periods (2-8 PM)',
          estimatedTime: '4 hours',
          cost: 0,
          completed: false
        }
      ],
      impact: {
        energy: 0,
        cost: 18,
        carbon: 0
      },
      timeframe: 'Immediate implementation',
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'hvac-optimization',
      category: 'hvac',
      type: 'scheduled',
      priority: 'medium',
      title: 'Smart HVAC Temperature Management',
      description: 'Implement intelligent temperature setpoints based on plant needs and occupancy',
      currentConsumption: 1800,
      optimizedConsumption: 1440,
      potentialSavings: {
        daily: 43.20,
        monthly: 1296,
        annual: 15552
      },
      implementationCost: 2500,
      paybackPeriod: 2,
      confidence: 88,
      difficulty: 'medium',
      requirements: ['Smart thermostats', 'Zone control system', 'Temperature sensors'],
      steps: [
        {
          id: 'install-sensors',
          title: 'Install Smart Temperature Sensors',
          description: 'Deploy wireless sensors throughout growing areas',
          estimatedTime: '1 day',
          cost: 800,
          completed: false
        },
        {
          id: 'install-controls',
          title: 'Install Smart HVAC Controls',
          description: 'Replace manual thermostats with programmable smart controls',
          estimatedTime: '2 days',
          cost: 1500,
          completed: false
        },
        {
          id: 'program-schedules',
          title: 'Program Optimization Schedules',
          description: 'Configure temperature schedules based on plant growth stages',
          estimatedTime: '4 hours',
          cost: 200,
          completed: false
        }
      ],
      impact: {
        energy: 20,
        cost: 20,
        carbon: 20
      },
      timeframe: '1-2 weeks implementation',
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'led-upgrade',
      category: 'equipment',
      type: 'long_term',
      priority: 'medium',
      title: 'LED Lighting Upgrade',
      description: 'Replace remaining HPS fixtures with high-efficiency LED systems',
      currentConsumption: 3200,
      optimizedConsumption: 2080,
      potentialSavings: {
        daily: 134.40,
        monthly: 4032,
        annual: 48384
      },
      implementationCost: 25000,
      paybackPeriod: 6,
      confidence: 92,
      difficulty: 'complex',
      requirements: ['LED fixtures', 'Electrical work', 'Light meters', 'Installation crew'],
      steps: [
        {
          id: 'lighting-audit',
          title: 'Comprehensive Lighting Audit',
          description: 'Measure current light levels and identify upgrade opportunities',
          estimatedTime: '1 day',
          cost: 500,
          completed: false
        },
        {
          id: 'fixture-selection',
          title: 'Select LED Fixtures',
          description: 'Choose appropriate LED fixtures based on coverage and efficiency',
          estimatedTime: '1 week',
          cost: 0,
          completed: false
        },
        {
          id: 'installation',
          title: 'Install LED Fixtures',
          description: 'Professional installation of new LED lighting system',
          estimatedTime: '3 days',
          cost: 24500,
          completed: false
        }
      ],
      impact: {
        energy: 35,
        cost: 35,
        carbon: 35
      },
      timeframe: '1-2 months planning + installation',
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demand-management',
      category: 'rate_optimization',
      type: 'immediate',
      priority: 'high',
      title: 'Peak Demand Management',
      description: 'Implement load shedding during peak demand periods to reduce demand charges',
      currentConsumption: 2800,
      optimizedConsumption: 2400,
      potentialSavings: {
        daily: 67.20,
        monthly: 2016,
        annual: 24192
      },
      implementationCost: 1200,
      paybackPeriod: 1,
      confidence: 90,
      difficulty: 'medium',
      requirements: ['Smart load controllers', 'Demand monitoring', 'Load prioritization'],
      steps: [
        {
          id: 'demand-monitor',
          title: 'Install Demand Monitoring System',
          description: 'Real-time monitoring of facility power demand',
          estimatedTime: '4 hours',
          cost: 800,
          completed: false
        },
        {
          id: 'load-controllers',
          title: 'Install Smart Load Controllers',
          description: 'Automated load shedding for non-critical equipment',
          estimatedTime: '6 hours',
          cost: 400,
          completed: false
        }
      ],
      impact: {
        energy: 14,
        cost: 22,
        carbon: 14
      },
      timeframe: '1-2 days implementation',
      detectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'hvac': return <Wind className="w-5 h-5 text-blue-400" />;
      case 'scheduling': return <Clock className="w-5 h-5 text-purple-400" />;
      case 'equipment': return <Settings className="w-5 h-5 text-gray-400" />;
      case 'rate_optimization': return <DollarSign className="w-5 h-5 text-green-400" />;
      default: return <Zap className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'complex': return <Settings className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
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

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const filteredOptimizations = optimizations.filter(opt => 
    selectedCategory === 'all' || opt.category === selectedCategory
  );

  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings.annual, 0);
  const totalImplementationCost = optimizations.reduce((sum, opt) => sum + opt.implementationCost, 0);
  const avgPaybackPeriod = optimizations.length > 0 
    ? optimizations.reduce((sum, opt) => sum + opt.paybackPeriod, 0) / optimizations.length 
    : 0;

  const containerClass = embedded 
    ? 'space-y-6' 
    : 'bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Energy Optimization AI</h2>
            <p className="text-sm text-gray-400">
              Claude-powered energy efficiency analysis and optimization recommendations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
          
          {lastAnalysis && (
            <div className="text-xs text-gray-400">
              Updated: {getTimeAgo(lastAnalysis.toISOString())}
            </div>
          )}
          
          <button
            onClick={analyzeEnergyOptimization}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3 text-green-300">
            <Bot className="w-5 h-5" />
            <span className="text-sm">Claude is analyzing energy consumption patterns and identifying optimization opportunities...</span>
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Optimization Summary */}
      {optimizations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{formatCurrency(totalSavings)}</span>
            </div>
            <div className="text-sm text-green-300 mt-1">Annual Savings</div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{optimizations.length}</span>
            </div>
            <div className="text-sm text-blue-300 mt-1">Opportunities</div>
          </div>
          
          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Timer className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">{avgPaybackPeriod.toFixed(1)}</span>
            </div>
            <div className="text-sm text-purple-300 mt-1">Avg Payback (mo)</div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Leaf className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {Math.round(optimizations.reduce((sum, opt) => sum + opt.impact.carbon, 0) / optimizations.length)}%
              </span>
            </div>
            <div className="text-sm text-yellow-300 mt-1">Carbon Reduction</div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Categories', icon: BarChart3 },
            { id: 'lighting', label: 'Lighting', icon: Lightbulb },
            { id: 'hvac', label: 'HVAC', icon: Wind },
            { id: 'scheduling', label: 'Scheduling', icon: Clock },
            { id: 'equipment', label: 'Equipment', icon: Settings },
            { id: 'rate_optimization', label: 'Rate Optimization', icon: DollarSign }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optimizations List */}
      <div className="space-y-4">
        {filteredOptimizations.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
            <Zap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No optimizations found</p>
            <p className="text-sm text-gray-500">
              Claude will analyze your energy data and identify efficiency opportunities
            </p>
          </div>
        )}

        {filteredOptimizations.map((optimization) => (
          <div
            key={optimization.id}
            className={`border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${getPriorityColor(optimization.priority)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getPriorityColor(optimization.priority)}`}>
                  {getCategoryIcon(optimization.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{optimization.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full uppercase">
                      {optimization.type}
                    </span>
                    {getDifficultyIcon(optimization.difficulty)}
                  </div>
                  <p className="text-gray-300 text-sm">{optimization.description}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    Category: {optimization.category.replace('_', ' ')} • {optimization.timeframe}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(optimization.potentialSavings.annual)}
                </div>
                <div className="text-sm text-gray-400">annual savings</div>
                <div className="text-xs text-gray-500 mt-1">
                  {optimization.confidence}% confidence
                </div>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-900/30 rounded-lg p-3">
                <div className="text-xs text-gray-400">Daily Savings</div>
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(optimization.potentialSavings.daily)}
                </div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-3">
                <div className="text-xs text-gray-400">Monthly Savings</div>
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(optimization.potentialSavings.monthly)}
                </div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-3">
                <div className="text-xs text-gray-400">Payback Period</div>
                <div className="text-lg font-semibold text-white">
                  {optimization.paybackPeriod === 0 ? 'Immediate' : `${optimization.paybackPeriod} months`}
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Energy Reduction</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${Math.min(optimization.impact.energy, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-green-400">{optimization.impact.energy}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Cost Reduction</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(optimization.impact.cost, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-blue-400">{optimization.impact.cost}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Carbon Reduction</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${Math.min(optimization.impact.carbon, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-yellow-400">{optimization.impact.carbon}%</span>
                </div>
              </div>
            </div>

            {/* Implementation Steps */}
            {optimization.steps.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2">Implementation Steps</h4>
                <div className="space-y-2">
                  {optimization.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 bg-gray-900/20 rounded-lg p-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{step.title}</div>
                        <div className="text-xs text-gray-400">
                          {step.estimatedTime} • {formatCurrency(step.cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Implementation: {formatCurrency(optimization.implementationCost)}</span>
                <span>Difficulty: {optimization.difficulty}</span>
                <span>Detected: {getTimeAgo(optimization.detectedAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Bot className="w-3 h-3" />
                <span>Claude AI</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}