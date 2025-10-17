'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Settings,
  Download,
  Eye,
  EyeOff,
  Zap,
  Building,
  Droplets,
  Wind,
  Activity,
  TrendingUp,
  Target,
  AlertCircle,
  Info
} from 'lucide-react';
import { useFacilityDesign } from '../context/FacilityDesignContext';
import { useDesigner } from '../context/DesignerContext';
import { logger } from '@/lib/client-logger';

interface SystemValidationPanelProps {
  onClose: () => void;
}

interface ValidationRule {
  id: string;
  category: 'safety' | 'capacity' | 'code' | 'efficiency' | 'compatibility';
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  systems: string[];
  check: (facilityState: any, designerState: any) => ValidationResult;
}

interface ValidationResult {
  passed: boolean;
  message: string;
  recommendation?: string;
  value?: number;
  threshold?: number;
  unit?: string;
}

interface SystemCheck {
  systemId: string;
  systemName: string;
  status: 'pass' | 'warning' | 'fail' | 'not-tested';
  score: number; // 0-100
  issues: ValidationIssue[];
  lastChecked: Date;
}

interface ValidationIssue {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation?: string;
  affectedSystems: string[];
}

export function SystemValidationPanel({ onClose }: SystemValidationPanelProps) {
  const { state: facilityState, validateDesign } = useFacilityDesign();
  const { state } = useDesigner();
  
  const [validationResults, setValidationResults] = useState<SystemCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [validationRules] = useState<ValidationRule[]>(getValidationRules());
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  // Auto-validate on load and when systems change
  useEffect(() => {
    runValidation();
  }, [facilityState.systems]);

  const runValidation = async () => {
    setIsValidating(true);
    
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results: SystemCheck[] = [];
      const systems = Object.values(facilityState.systems);
      
      systems.forEach(system => {
        const issues: ValidationIssue[] = [];
        let score = 100;
        
        // Run validation rules for each system
        validationRules.forEach(rule => {
          if (rule.systems.includes(system.type) || rule.systems.includes('all')) {
            const result = rule.check(facilityState, state);
            
            if (!result.passed) {
              const severityPenalty = rule.severity === 'critical' ? 30 : 
                                   rule.severity === 'warning' ? 15 : 5;
              score = Math.max(0, score - severityPenalty);
              
              issues.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                message: result.message,
                recommendation: result.recommendation,
                affectedSystems: [system.id]
              });
            }
          }
        });
        
        const status = score >= 90 ? 'pass' : 
                     score >= 70 ? 'warning' : 'fail';
        
        results.push({
          systemId: system.id,
          systemName: system.type.charAt(0).toUpperCase() + system.type.slice(1).replace('-', ' '),
          status,
          score,
          issues,
          lastChecked: new Date()
        });
      });
      
      setValidationResults(results);
      setOverallScore(results.reduce((sum, r) => sum + r.score, 0) / results.length);
      setLastValidation(new Date());
      
      // Update facility design validation status
      validateDesign();
      
    } catch (error) {
      logger.error('system', 'Validation error:', error );
    } finally {
      setIsValidating(false);
    }
  };

  const exportValidationReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      facility: {
        name: state.room.name || 'Unnamed Facility',
        type: state.room.roomType,
        dimensions: `${state.room.width}' x ${state.room.height}' x ${state.room.ceilingHeight || 10}'`
      },
      validation: {
        overallScore,
        lastValidation,
        systemResults: validationResults,
        totalIssues: validationResults.reduce((sum, r) => sum + r.issues.length, 0),
        criticalIssues: validationResults.reduce((sum, r) => 
          sum + r.issues.filter(i => i.severity === 'critical').length, 0),
        warningIssues: validationResults.reduce((sum, r) => 
          sum + r.issues.filter(i => i.severity === 'warning').length, 0)
      },
      recommendations: generateRecommendations()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility-validation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    // Analyze common issues
    const allIssues = validationResults.flatMap(r => r.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Resolve Critical Issues',
        description: `${criticalIssues.length} critical issues require immediate attention`,
        action: 'Review electrical capacity, structural loads, and safety requirements'
      });
    }
    
    if (overallScore < 80) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve System Integration',
        description: 'Overall facility score below recommended threshold',
        action: 'Review system dependencies and optimize configurations'
      });
    }
    
    return recommendations;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'fail': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'fail': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return AlertCircle;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Validation</h2>
              <p className="text-gray-400">Comprehensive facility design validation and compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              {lastValidation ? `Last check: ${lastValidation.toLocaleTimeString()}` : 'Not validated'}
            </div>
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validating...' : 'Re-validate'}
            </button>
            <button
              onClick={exportValidationReport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Summary */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Validation Score</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                        className={
                          overallScore >= 90 ? 'text-green-400' :
                          overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{overallScore.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    overallScore >= 90 ? 'text-green-400' :
                    overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {overallScore >= 90 ? 'Excellent' :
                     overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                  </div>
                  <div className="text-sm text-gray-400">Overall facility score</div>
                </div>
              </div>

              {/* System Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">System Status</h3>
                <div className="space-y-2">
                  {validationResults.map((result) => {
                    const StatusIcon = getStatusIcon(result.status);
                    return (
                      <div
                        key={result.systemId}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedSystem === result.systemId ? 'bg-gray-700' : 'hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedSystem(result.systemId)}
                      >
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(result.status)}`} />
                          <span className="text-gray-300 text-sm">{result.systemName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">{result.score.toFixed(0)}%</div>
                          {result.issues.length > 0 && (
                            <div className="text-xs text-red-400">{result.issues.length} issues</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Issue Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Issue Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Issues:</span>
                    <span className="text-red-400 font-medium">
                      {validationResults.reduce((sum, r) => 
                        sum + r.issues.filter(i => i.severity === 'critical').length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warnings:</span>
                    <span className="text-yellow-400 font-medium">
                      {validationResults.reduce((sum, r) => 
                        sum + r.issues.filter(i => i.severity === 'warning').length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Info:</span>
                    <span className="text-blue-400 font-medium">
                      {validationResults.reduce((sum, r) => 
                        sum + r.issues.filter(i => i.severity === 'info').length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Detailed Results */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {selectedSystem ? (
                // System-specific details
                <div>
                  {(() => {
                    const system = validationResults.find(r => r.systemId === selectedSystem);
                    if (!system) return null;
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{system.systemName} Validation</h3>
                            <div className="flex items-center gap-2">
                              <div className={`text-lg font-semibold ${getStatusColor(system.status)}`}>
                                {system.score.toFixed(0)}%
                              </div>
                              <div className={`px-2 py-1 rounded text-sm ${getStatusColor(system.status)}`}>
                                {system.status.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          
                          {system.issues.length > 0 ? (
                            <div className="space-y-3">
                              {system.issues.map((issue, index) => {
                                const SeverityIcon = getSeverityIcon(issue.severity);
                                return (
                                  <div key={index} className="p-3 bg-gray-800 border-l-4 border-current rounded-r">
                                    <div className="flex items-start gap-3">
                                      <SeverityIcon className={`w-5 h-5 ${getSeverityColor(issue.severity)} flex-shrink-0 mt-0.5`} />
                                      <div className="flex-1">
                                        <div className={`font-medium ${getSeverityColor(issue.severity)} capitalize`}>
                                          {issue.severity} - {issue.ruleName}
                                        </div>
                                        <div className="text-gray-300 mt-1">{issue.message}</div>
                                        {issue.recommendation && (
                                          <div className="text-blue-400 mt-2 text-sm">
                                            Recommendation: {issue.recommendation}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span>All validation checks passed for this system</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // Overall validation results
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Validation Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-400">
                          {validationResults.filter(r => r.status === 'pass').length}
                        </div>
                        <div className="text-sm text-gray-400">Systems Passing</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-2xl font-bold text-yellow-400">
                          {validationResults.filter(r => r.status === 'warning').length}
                        </div>
                        <div className="text-sm text-gray-400">Systems with Warnings</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-400">
                          {validationResults.filter(r => r.status === 'fail').length}
                        </div>
                        <div className="text-sm text-gray-400">Systems Failing</div>
                      </div>
                    </div>
                  </div>

                  {/* All Issues */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">All Issues</h3>
                    <div className="space-y-3">
                      {validationResults.flatMap(system => 
                        system.issues.map((issue, index) => {
                          const SeverityIcon = getSeverityIcon(issue.severity);
                          return (
                            <div key={`${system.systemId}-${index}`} className="p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-start gap-3">
                                <SeverityIcon className={`w-5 h-5 ${getSeverityColor(issue.severity)} flex-shrink-0 mt-0.5`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-medium ${getSeverityColor(issue.severity)} capitalize`}>
                                      {issue.severity}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-400 text-sm">{system.systemName}</span>
                                  </div>
                                  <div className="text-white font-medium">{issue.ruleName}</div>
                                  <div className="text-gray-300 mt-1">{issue.message}</div>
                                  {issue.recommendation && (
                                    <div className="text-blue-400 mt-2 text-sm">
                                      Recommendation: {issue.recommendation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {generateRecommendations().map((rec, index) => (
                        <div key={index} className="p-3 bg-gray-800 border-l-4 border-blue-500 rounded-r">
                          <div className="font-medium text-white">{rec.title}</div>
                          <div className="text-gray-300 mt-1">{rec.description}</div>
                          <div className="text-blue-400 mt-2 text-sm">{rec.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Validation rules configuration
function getValidationRules(): ValidationRule[] {
  return [
    {
      id: 'electrical-capacity',
      category: 'capacity',
      name: 'Electrical Capacity Check',
      description: 'Verify total electrical load does not exceed facility capacity',
      severity: 'critical',
      systems: ['electrical', 'all'],
      check: (facilityState, designerState) => {
        const totalLoad = facilityState.metrics.totalElectricalLoad;
        const capacity = 50000; // 50kW example limit
        
        if (totalLoad > capacity) {
          return {
            passed: false,
            message: `Total electrical load (${totalLoad}W) exceeds facility capacity (${capacity}W)`,
            recommendation: 'Reduce electrical loads or upgrade electrical service',
            value: totalLoad,
            threshold: capacity,
            unit: 'W'
          };
        }
        
        return { passed: true, message: 'Electrical capacity within limits' };
      }
    },
    {
      id: 'structural-load',
      category: 'safety',
      name: 'Structural Load Check',
      description: 'Verify structural loads are within safe limits',
      severity: 'critical',
      systems: ['structural', 'all'],
      check: (facilityState, designerState) => {
        const totalLoad = facilityState.metrics.totalStructuralLoad;
        const capacity = 100000; // 100k lbs example limit
        
        if (totalLoad > capacity) {
          return {
            passed: false,
            message: `Total structural load (${totalLoad} lbs) exceeds building capacity`,
            recommendation: 'Reduce equipment density or add structural reinforcement',
            value: totalLoad,
            threshold: capacity,
            unit: 'lbs'
          };
        }
        
        return { passed: true, message: 'Structural loads within safe limits' };
      }
    },
    {
      id: 'hvac-sizing',
      category: 'efficiency',
      name: 'HVAC Sizing Check',
      description: 'Verify HVAC capacity matches calculated loads',
      severity: 'warning',
      systems: ['hvac'],
      check: (facilityState, designerState) => {
        const hvacSystem = Object.values(facilityState.systems).find(s => s.type === 'hvac');
        if (!hvacSystem) {
          return { passed: false, message: 'No HVAC system configured' };
        }
        
        const capacity = hvacSystem.loads.thermal;
        const requiredCapacity = facilityState.metrics.totalThermalLoad;
        const oversizing = (capacity - requiredCapacity) / requiredCapacity;
        
        if (oversizing > 0.25) {
          return {
            passed: false,
            message: `HVAC system is oversized by ${(oversizing * 100).toFixed(0)}%`,
            recommendation: 'Consider smaller HVAC equipment to reduce costs and improve efficiency'
          };
        }
        
        if (oversizing < 0.1) {
          return {
            passed: false,
            message: `HVAC system may be undersized`,
            recommendation: 'Increase HVAC capacity or verify load calculations'
          };
        }
        
        return { passed: true, message: 'HVAC sizing is appropriate' };
      }
    },
    {
      id: 'energy-efficiency',
      category: 'efficiency',
      name: 'Energy Efficiency Check',
      description: 'Verify facility meets energy efficiency targets',
      severity: 'info',
      systems: ['all'],
      check: (facilityState, designerState) => {
        const efficiency = facilityState.metrics.energyEfficiency;
        const target = 15; // kWh/sq ft/year target
        
        if (efficiency > target * 1.5) {
          return {
            passed: false,
            message: `Energy efficiency (${efficiency.toFixed(1)} kWh/sq ft/yr) significantly exceeds target`,
            recommendation: 'Consider more efficient lighting and HVAC equipment'
          };
        }
        
        if (efficiency > target) {
          return {
            passed: false,
            message: `Energy efficiency (${efficiency.toFixed(1)} kWh/sq ft/yr) exceeds target of ${target}`,
            recommendation: 'Optimize equipment efficiency ratings'
          };
        }
        
        return { passed: true, message: 'Energy efficiency meets targets' };
      }
    },
    {
      id: 'water-pressure',
      category: 'safety',
      name: 'Water Pressure Check',
      description: 'Verify irrigation system pressures are safe and effective',
      severity: 'warning',
      systems: ['irrigation'],
      check: (facilityState, designerState) => {
        const irrigationSystem = Object.values(facilityState.systems).find(s => s.type === 'irrigation');
        if (!irrigationSystem || !irrigationSystem.data) {
          return { passed: true, message: 'No irrigation system to check' };
        }
        
        const maxPressure = irrigationSystem.data.maxPressure || 0;
        const safeLimit = 80; // PSI
        
        if (maxPressure > safeLimit) {
          return {
            passed: false,
            message: `Maximum water pressure (${maxPressure} PSI) exceeds safe limit`,
            recommendation: 'Add pressure regulators or reduce pump pressure'
          };
        }
        
        return { passed: true, message: 'Water pressures within safe limits' };
      }
    }
  ];
}