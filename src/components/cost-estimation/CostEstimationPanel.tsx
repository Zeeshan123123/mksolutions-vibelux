'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calculator,
  PieChart,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Settings,
  Eye,
  Edit,
  Save,
  Zap
} from 'lucide-react';

import type {
  Project,
  ProjectTask
} from '@/lib/project-management/project-types';
import { CostEstimator, type CostEstimate, type CostTracker } from '@/lib/cost-estimation/cost-estimator';
import { COST_DATABASE } from '@/lib/cost-estimation/cost-database';

interface CostEstimationPanelProps {
  project: Project;
  onEstimateUpdate?: (estimate: CostEstimate) => void;
  onCostTrackingUpdate?: (tracker: CostTracker) => void;
}

export function CostEstimationPanel({
  project,
  onEstimateUpdate,
  onCostTrackingUpdate
}: CostEstimationPanelProps) {
  const [activeTab, setActiveTab] = useState<'estimate' | 'tracking' | 'analysis'>('estimate');
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [tracker, setTracker] = useState<CostTracker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [estimationType, setEstimationType] = useState<'preliminary' | 'detailed'>('detailed');
  
  const costEstimator = new CostEstimator(COST_DATABASE);

  useEffect(() => {
    // Auto-generate estimate when component loads
    generateEstimate();
    trackCosts();
  }, [project.id]);

  const generateEstimate = async () => {
    setIsGenerating(true);
    try {
      const newEstimate = await costEstimator.generateEstimate(project, estimationType);
      setEstimate(newEstimate);
      if (onEstimateUpdate) {
        onEstimateUpdate(newEstimate);
      }
    } catch (error) {
      logger.error('system', 'Failed to generate estimate:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  const trackCosts = async () => {
    setIsTracking(true);
    try {
      const newTracker = await costEstimator.trackProjectCosts(project);
      setTracker(newTracker);
      if (onCostTrackingUpdate) {
        onCostTrackingUpdate(newTracker);
      }
    } catch (error) {
      logger.error('system', 'Failed to track costs:', error );
    } finally {
      setIsTracking(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getVarianceColor = (variance: number): string => {
    if (variance > 0) return 'text-green-600';
    if (variance < -project.budget.totalBudget * 0.05) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingDown className="w-4 h-4" />;
    if (variance < -project.budget.totalBudget * 0.05) return <TrendingUp className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-blue-600" />
              Cost Estimation & Budget Tracking
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time cost estimation and budget management for {project.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={estimationType}
              onChange={(e) => setEstimationType(e.target.value as 'preliminary' | 'detailed')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="preliminary">Preliminary Estimate</option>
              <option value="detailed">Detailed Estimate</option>
            </select>
            
            <button
              onClick={generateEstimate}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Estimate
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'estimate', name: 'Cost Estimate', icon: Calculator },
            { id: 'tracking', name: 'Cost Tracking', icon: TrendingUp },
            { id: 'analysis', name: 'Analysis', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Estimate Tab */}
      {activeTab === 'estimate' && estimate && (
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Total Estimated Cost</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(estimate.summary.totalCosts)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-600 text-sm mt-2">
                Confidence: {estimate.summary.confidence}%
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Budget Status</p>
                  <p className="text-2xl font-bold text-green-900">
                    {estimate.budgetComparison.status.toUpperCase()}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <p className={`text-sm mt-2 ${getVarianceColor(estimate.budgetComparison.variance)}`}>
                {estimate.budgetComparison.variance > 0 ? 'Under' : 'Over'} by {formatCurrency(Math.abs(estimate.budgetComparison.variance))}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Direct Costs</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(estimate.summary.directCosts)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-purple-600 text-sm mt-2">
                {((estimate.summary.directCosts / estimate.summary.totalCosts) * 100).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Accuracy Range</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {estimate.summary.accuracy}
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-orange-600 text-sm mt-2">
                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)} estimate
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Breakdown by Category */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Category</h3>
              <div className="space-y-4">
                {Object.entries(estimate.breakdown).map(([category, cost]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        category === 'materials' ? 'bg-blue-500' :
                        category === 'labor' ? 'bg-green-500' :
                        category === 'equipment' ? 'bg-purple-500' :
                        category === 'services' ? 'bg-yellow-500' :
                        category === 'overhead' ? 'bg-orange-500' :
                        category === 'contingency' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="font-medium text-gray-900 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(cost.total)}</p>
                      <p className="text-sm text-gray-500">
                        {((cost.total / estimate.summary.totalCosts) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Project Phase</h3>
              <div className="space-y-4">
                {estimate.phaseBreakdown.map((phase, index) => (
                  <div key={phase.phaseId} className="p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{phase.phaseName}</h4>
                      <span className="font-semibold text-gray-900">{formatCurrency(phase.total)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Materials:</span>
                        <div className="font-medium">{formatCurrency(phase.materials)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Labor:</span>
                        <div className="font-medium">{formatCurrency(phase.labor)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Equipment:</span>
                        <div className="font-medium">{formatCurrency(phase.equipment)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Services:</span>
                        <div className="font-medium">{formatCurrency(phase.services)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {estimate.riskFactors.length > 0 && (
            <div className="mt-8 bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Cost Risk Factors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estimate.riskFactors.map((risk) => (
                  <div key={risk.id} className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.probability > 0.7 ? 'bg-red-100 text-red-800' :
                        risk.probability > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {(risk.probability * 100).toFixed(0)}% Probability
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{risk.mitigation}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Impact:</span>
                      <span className="font-medium">{formatCurrency(risk.impact)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cost Tracking Tab */}
      {activeTab === 'tracking' && tracker && (
        <div className="p-6">
          {/* Tracking Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Actual Costs</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(tracker.actual.total)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-sm mt-2">
                Incurred to date
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Committed Costs</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(tracker.committed.total)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-600 text-sm mt-2">
                Under contract
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Forecasted</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(tracker.forecasted.total)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-purple-600 text-sm mt-2">
                Remaining work
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Performance Index</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tracker.variance.performanceIndex.toFixed(2)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Cost efficiency
              </p>
            </div>
          </div>

          {/* Variance Analysis */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Variance Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Cost Variance</span>
                  {getVarianceIcon(tracker.variance.costVariance)}
                </div>
                <p className={`text-2xl font-bold ${getVarianceColor(tracker.variance.costVariance)}`}>
                  {formatCurrency(tracker.variance.costVariance)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {tracker.variance.costVariance > 0 ? 'Under budget' : 'Over budget'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Schedule Variance</span>
                  {getVarianceIcon(tracker.variance.scheduleVariance)}
                </div>
                <p className={`text-2xl font-bold ${getVarianceColor(tracker.variance.scheduleVariance)}`}>
                  {formatCurrency(tracker.variance.scheduleVariance)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Schedule impact
                </p>
              </div>
            </div>
          </div>

          {/* Cost Alerts */}
          {tracker.alerts.length > 0 && (
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Cost Alerts
              </h3>
              <div className="space-y-3">
                {tracker.alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'bg-red-100 border-red-500' :
                    alert.severity === 'high' ? 'bg-orange-100 border-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-100 border-yellow-500' :
                    'bg-blue-100 border-blue-500'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{alert.type.replace('_', ' ').toUpperCase()}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    <p className="text-sm text-gray-600">{alert.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && estimate && tracker && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cost Trends */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trends</h3>
              <div className="space-y-4">
                {tracker.trends.map((trend, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{trend.category}</span>
                      <div className="flex items-center">
                        {trend.trend === 'increasing' ? (
                          <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                        ) : trend.trend === 'decreasing' ? (
                          <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          trend.trend === 'increasing' ? 'text-red-600' :
                          trend.trend === 'decreasing' ? 'text-green-600' :
                          'text-yellow-600'
                        }`}>
                          {trend.rate > 0 ? '+' : ''}{trend.rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Confidence: {trend.confidence}%</p>
                      <p>Factors: {trend.factors.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Comparison */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs. Estimate Comparison</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Original Budget</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(estimate.budgetComparison.allocatedBudget)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Current Estimate</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(estimate.budgetComparison.estimatedCost)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        estimate.budgetComparison.variance > 0 ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (estimate.budgetComparison.estimatedCost / estimate.budgetComparison.allocatedBudget) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Variance</span>
                    <span className={`font-semibold ${getVarianceColor(estimate.budgetComparison.variance)}`}>
                      {estimate.budgetComparison.variance > 0 ? '+' : ''}{formatCurrency(estimate.budgetComparison.variance)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {estimate.budgetComparison.variancePercentage.toFixed(1)}% {estimate.budgetComparison.variance > 0 ? 'under' : 'over'} budget
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Assumptions</h3>
            <ul className="space-y-2">
              {estimate.assumptions.map((assumption, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={trackCosts}
              disabled={isTracking}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              {isTracking ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Tracking
                </>
              )}
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}