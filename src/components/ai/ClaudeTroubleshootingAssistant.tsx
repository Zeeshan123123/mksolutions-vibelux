'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  AlertTriangle, CheckCircle, Wrench, Search, Bot, 
  Sparkles, RefreshCw, Clock, Target, Lightbulb,
  TrendingUp, TrendingDown, Activity, Zap, Eye,
  ThermometerSun, Droplets, Wind, Leaf, Settings,
  ChevronDown, ChevronRight, HelpCircle, BookOpen,
  Play, Pause, RotateCcw, FileText, MessageCircle
} from 'lucide-react';

interface DiagnosticResult {
  id: string;
  category: 'environmental' | 'equipment' | 'plant_health' | 'system' | 'energy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'investigating' | 'resolved' | 'recurring';
  title: string;
  description: string;
  symptoms: string[];
  possibleCauses: string[];
  confidence: number;
  detectedAt: string;
  affectedSystems: string[];
  solutions: TroubleshootingSolution[];
  relatedIssues: string[];
  preventionTips: string[];
}

interface TroubleshootingSolution {
  id: string;
  title: string;
  description: string;
  steps: SolutionStep[];
  difficulty: 'easy' | 'medium' | 'complex';
  estimatedTime: string;
  requiredTools: string[];
  cost: number;
  successRate: number;
  prerequisites: string[];
}

interface SolutionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  warning?: string;
  expectedResult: string;
  troubleshootingTips: string[];
}

interface SystemStatus {
  system: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  lastCheck: string;
  metrics: {
    performance: number;
    reliability: number;
    efficiency: number;
  };
}

interface ClaudeTroubleshootingAssistantProps {
  facilityId: string;
  systemData: {
    environmental: any;
    equipment: any;
    plantHealth: any;
    energy: any;
  };
  embedded?: boolean;
}

export function ClaudeTroubleshootingAssistant({
  facilityId,
  systemData,
  embedded = false
}: ClaudeTroubleshootingAssistantProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'solutions' | 'prevention'>('diagnostics');

  const runDiagnostics = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/troubleshooting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityId,
          systemData,
          analysisType: 'comprehensive',
          includePreventiveMaintenance: true
        })
      });

      if (!response.ok) {
        throw new Error('Troubleshooting analysis failed');
      }

      const data = await response.json();
      setDiagnostics(data.diagnostics || []);
      setSystemStatuses(data.systemStatuses || []);
      setLastAnalysis(new Date());

    } catch (error) {
      logger.error('ai', 'Troubleshooting error:', error );
      setDiagnostics(getMockDiagnostics());
      setSystemStatuses(getMockSystemStatuses());
      setLastAnalysis(new Date());
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [facilityId]);

  const getMockDiagnostics = (): DiagnosticResult[] => [
    {
      id: 'env-001',
      category: 'environmental',
      severity: 'high',
      status: 'identified',
      title: 'Temperature Fluctuation in Zone 2',
      description: 'Significant temperature variations detected in growing zone 2, potentially affecting plant development',
      symptoms: [
        'Temperature swings of 8-12°F within 2-hour periods',
        'Inconsistent HVAC cycling patterns',
        'Leaf stress indicators on plants in affected area'
      ],
      possibleCauses: [
        'Failing temperature sensor calibration',
        'HVAC damper malfunction',
        'Air circulation blockage',
        'Heat leak from adjacent lighting system'
      ],
      confidence: 88,
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      affectedSystems: ['HVAC Zone 2', 'Environmental Monitoring', 'Plant Health'],
      solutions: [
        {
          id: 'sol-001',
          title: 'Calibrate Temperature Sensors',
          description: 'Recalibrate all temperature sensors in Zone 2 and verify accuracy',
          steps: [
            {
              id: 'step-001',
              order: 1,
              title: 'Locate Temperature Sensors',
              description: 'Identify all temperature sensors in Zone 2 growing area',
              expectedResult: 'List of 4-6 sensors with serial numbers and locations',
              troubleshootingTips: ['Check sensor mounting height and orientation', 'Look for sensors blocked by plants or equipment']
            },
            {
              id: 'step-002',
              order: 2,
              title: 'Test with Reference Thermometer',
              description: 'Use calibrated reference thermometer to compare readings',
              warning: 'Allow 15 minutes for temperature stabilization before taking readings',
              expectedResult: 'Variance should be within ±1°F',
              troubleshootingTips: ['Take readings at multiple heights', 'Test during different HVAC cycles']
            }
          ],
          difficulty: 'medium',
          estimatedTime: '2-3 hours',
          requiredTools: ['Calibrated thermometer', 'Ladder', 'Multimeter'],
          cost: 150,
          successRate: 85,
          prerequisites: ['HVAC system knowledge', 'Sensor documentation']
        }
      ],
      relatedIssues: ['Humidity variations', 'Plant stress symptoms'],
      preventionTips: [
        'Schedule monthly sensor calibration checks',
        'Install redundant sensors in critical zones',
        'Monitor temperature trends for early detection'
      ]
    },
    {
      id: 'eq-001',
      category: 'equipment',
      severity: 'medium',
      status: 'investigating',
      title: 'LED Driver Performance Degradation',
      description: 'Gradual reduction in light output from LED fixtures in flowering room',
      symptoms: [
        'Light intensity decreased by 15% over past month',
        'Increased heat generation from LED drivers',
        'Inconsistent color spectrum measurements'
      ],
      possibleCauses: [
        'LED driver thermal degradation',
        'Component aging in power supply',
        'Voltage fluctuations affecting driver performance',
        'Dust accumulation affecting heat dissipation'
      ],
      confidence: 82,
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      affectedSystems: ['Lighting System', 'Plant Photosynthesis', 'Energy Consumption'],
      solutions: [
        {
          id: 'sol-002',
          title: 'LED System Maintenance and Testing',
          description: 'Comprehensive LED driver testing and maintenance protocol',
          steps: [
            {
              id: 'step-003',
              order: 1,
              title: 'Measure Light Output',
              description: 'Use PAR meter to measure photosynthetic photon flux density',
              expectedResult: 'PPFD readings within 5% of baseline measurements',
              troubleshootingTips: ['Take measurements at canopy level', 'Test multiple points across growing area']
            }
          ],
          difficulty: 'complex',
          estimatedTime: '4-6 hours',
          requiredTools: ['PAR meter', 'Thermal camera', 'Voltage meter'],
          cost: 300,
          successRate: 75,
          prerequisites: ['Electrical safety training', 'LED system documentation']
        }
      ],
      relatedIssues: ['Energy efficiency decline', 'Plant growth irregularities'],
      preventionTips: [
        'Clean LED fixtures monthly',
        'Monitor driver temperatures',
        'Schedule annual light output testing'
      ]
    }
  ];

  const getMockSystemStatuses = (): SystemStatus[] => [
    {
      system: 'HVAC System',
      status: 'warning',
      lastCheck: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metrics: { performance: 78, reliability: 85, efficiency: 72 }
    },
    {
      system: 'Lighting System',
      status: 'warning',
      lastCheck: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metrics: { performance: 82, reliability: 90, efficiency: 75 }
    },
    {
      system: 'Irrigation System',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      metrics: { performance: 94, reliability: 96, efficiency: 88 }
    },
    {
      system: 'Environmental Monitoring',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      metrics: { performance: 91, reliability: 93, efficiency: 89 }
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'offline': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <ThermometerSun className="w-5 h-5 text-green-400" />;
      case 'equipment': return <Settings className="w-5 h-5 text-blue-400" />;
      case 'plant_health': return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'system': return <Activity className="w-5 h-5 text-purple-400" />;
      case 'energy': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <Wrench className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredDiagnostics = diagnostics.filter(diagnostic => {
    const matchesCategory = selectedCategory === 'all' || diagnostic.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || diagnostic.severity === selectedSeverity;
    return matchesCategory && matchesSeverity;
  });

  const containerClass = embedded 
    ? 'space-y-6' 
    : 'bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Claude Troubleshooting Assistant</h2>
            <p className="text-sm text-gray-400">
              AI-powered facility diagnostics and problem resolution
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastAnalysis && (
            <div className="text-xs text-gray-400">
              Last scan: {getTimeAgo(lastAnalysis.toISOString())}
            </div>
          )}
          <button
            onClick={runDiagnostics}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3 text-orange-300">
            <Bot className="w-5 h-5" />
            <span className="text-sm">Claude is analyzing facility systems and identifying potential issues...</span>
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* System Status Overview */}
      {systemStatuses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatuses.map((system) => (
            <div key={system.system} className={`rounded-lg p-4 border ${getStatusColor(system.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white text-sm">{system.system}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  system.status === 'healthy' ? 'bg-green-400' :
                  system.status === 'warning' ? 'bg-yellow-400' :
                  system.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Performance</span>
                  <span className="text-white">{system.metrics.performance}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Reliability</span>
                  <span className="text-white">{system.metrics.reliability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'diagnostics', label: 'Active Issues', icon: AlertTriangle },
            { id: 'solutions', label: 'Solutions', icon: Lightbulb },
            { id: 'prevention', label: 'Prevention', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'diagnostics' && (
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="environmental">Environmental</option>
              <option value="equipment">Equipment</option>
              <option value="plant_health">Plant Health</option>
              <option value="system">System</option>
              <option value="energy">Energy</option>
            </select>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          {filteredDiagnostics.length === 0 && !isAnalyzing && (
            <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No issues detected</p>
              <p className="text-sm text-gray-500">All systems are operating normally</p>
            </div>
          )}

          {filteredDiagnostics.map((diagnostic) => (
            <div
              key={diagnostic.id}
              className={`border rounded-xl p-6 transition-all duration-200 ${getSeverityColor(diagnostic.severity)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(diagnostic.severity)}`}>
                    {getCategoryIcon(diagnostic.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{diagnostic.title}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full uppercase">
                        {diagnostic.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{diagnostic.description}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      Category: {diagnostic.category.replace('_', ' ')} • Detected: {getTimeAgo(diagnostic.detectedAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {diagnostic.confidence}% confidence
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpanded(diagnostic.id)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    {expandedItems.has(diagnostic.id) ? 
                      <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItems.has(diagnostic.id) && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  {/* Symptoms */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Observed Symptoms</h4>
                    <ul className="space-y-1">
                      {diagnostic.symptoms.map((symptom, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Possible Causes */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Possible Causes</h4>
                    <ul className="space-y-1">
                      {diagnostic.possibleCauses.map((cause, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Affected Systems */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Affected Systems</h4>
                    <div className="flex flex-wrap gap-2">
                      {diagnostic.affectedSystems.map((system, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'solutions' && (
        <div className="space-y-4">
          {diagnostics.flatMap(d => d.solutions).map((solution) => (
            <div key={solution.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">{solution.title}</h3>
                  <p className="text-sm text-gray-300 mb-2">{solution.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Difficulty: {solution.difficulty}</span>
                    <span>Time: {solution.estimatedTime}</span>
                    <span>Success Rate: {solution.successRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">${solution.cost}</div>
                  <div className="text-xs text-gray-400">estimated cost</div>
                </div>
              </div>

              {solution.steps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Solution Steps</h4>
                  <div className="space-y-3">
                    {solution.steps.map((step) => (
                      <div key={step.id} className="bg-gray-900/30 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {step.order}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-white text-sm">{step.title}</h5>
                            <p className="text-xs text-gray-300 mt-1">{step.description}</p>
                            {step.warning && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded">
                                <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-yellow-300">{step.warning}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'prevention' && (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Preventive Maintenance Tips
            </h3>
            <div className="grid gap-4">
              {diagnostics.flatMap(d => d.preventionTips).slice(0, 8).map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}