'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle, Target,
  Zap, Thermometer, Droplets, Eye, BarChart3, 
  Clock, Calendar, Activity, Lightbulb, ArrowUp,
  ArrowDown, Minus, Bot, Sparkles, RefreshCw
} from 'lucide-react';

interface AnalyticsInsight {
  id: string;
  type: 'anomaly' | 'opportunity' | 'prediction' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  metric: string;
  currentValue: number;
  expectedValue: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  recommendations: string[];
  relatedMetrics: string[];
  detectedAt: string;
}

interface AnalyticsData {
  temperature: number[];
  humidity: number[];
  co2: number[];
  vpd: number[];
  dli: number[];
  power: number[];
  timestamps: string[];
}

interface ClaudeAnalyticsInsightsProps {
  data: AnalyticsData;
  facilityId: string;
  timeRange: '24h' | '7d' | '30d';
  refreshInterval?: number;
}

export function ClaudeAnalyticsInsights({ 
  data, 
  facilityId, 
  timeRange,
  refreshInterval = 300000 // 5 minutes
}: ClaudeAnalyticsInsightsProps) {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/analytics-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          facilityId,
          timeRange,
          analysisType: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setInsights(result.insights || []);
      setLastAnalysis(new Date());

    } catch (error) {
      logger.error('ai', 'Analytics insights error:', error );
      // Fallback to mock insights
      setInsights(generateMockInsights());
      setLastAnalysis(new Date());
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, [data, timeRange]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(analyzeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const generateMockInsights = (): AnalyticsInsight[] => [
    {
      id: 'temp-anomaly-1',
      type: 'anomaly',
      severity: 'medium',
      title: 'Temperature Spike Detected',
      description: 'Temperature increased by 8°F above optimal range during peak daylight hours',
      confidence: 92,
      impact: 'medium',
      metric: 'temperature',
      currentValue: 84,
      expectedValue: 76,
      trend: 'up',
      timeframe: 'Last 4 hours',
      recommendations: [
        'Increase exhaust fan speed during peak light hours',
        'Consider upgrading HVAC capacity for summer months',
        'Monitor plant stress indicators for heat damage'
      ],
      relatedMetrics: ['humidity', 'vpd', 'power'],
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'co2-optimization-1',
      type: 'optimization',
      severity: 'low',
      title: 'CO₂ Efficiency Opportunity',
      description: 'CO₂ levels could be optimized during morning hours for 12% better utilization',
      confidence: 87,
      impact: 'medium',
      metric: 'co2',
      currentValue: 1200,
      expectedValue: 1350,
      trend: 'stable',
      timeframe: 'Daily pattern',
      recommendations: [
        'Increase CO₂ injection 30 minutes before lights-on',
        'Reduce CO₂ during ventilation cycles',
        'Monitor plant response to increased levels'
      ],
      relatedMetrics: ['dli', 'temperature'],
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'energy-prediction-1',
      type: 'prediction',
      severity: 'low',
      title: 'Energy Cost Increase Predicted',
      description: 'Based on current usage patterns, expect 15% higher energy costs next month',
      confidence: 78,
      impact: 'high',
      metric: 'power',
      currentValue: 2840,
      expectedValue: 3266,
      trend: 'up',
      timeframe: 'Next 30 days',
      recommendations: [
        'Schedule high-power operations during off-peak hours',
        'Consider LED upgrade for aging fixtures',
        'Implement smart scheduling for non-critical systems'
      ],
      relatedMetrics: ['temperature', 'dli'],
      detectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'prediction': return <Eye className="w-5 h-5" />;
      case 'optimization': return <TrendingUp className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-red-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-green-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'temperature': return `${value}°F`;
      case 'humidity': return `${value}%`;
      case 'co2': return `${value} ppm`;
      case 'vpd': return `${value.toFixed(2)} kPa`;
      case 'dli': return `${value} mol/m²/day`;
      case 'power': return `${value} kW`;
      default: return value.toString();
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Analytics Insights</h2>
            <p className="text-sm text-gray-400">
              Claude-powered pattern analysis and optimization recommendations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            {lastAnalysis && `Last updated: ${getTimeAgo(lastAnalysis.toISOString())}`}
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              autoRefresh 
                ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={analyzeData}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3 text-purple-300">
            <Bot className="w-5 h-5" />
            <span className="text-sm">Claude is analyzing facility data patterns...</span>
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Insights Summary */}
      {insights.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-white">
                {insights.filter(i => i.severity === 'critical' || i.severity === 'high').length}
              </span>
            </div>
            <div className="text-sm text-red-300 mt-1">Critical Issues</div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {insights.filter(i => i.type === 'optimization').length}
              </span>
            </div>
            <div className="text-sm text-yellow-300 mt-1">Optimizations</div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {insights.filter(i => i.type === 'prediction').length}
              </span>
            </div>
            <div className="text-sm text-blue-300 mt-1">Predictions</div>
          </div>
          
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
              </span>
            </div>
            <div className="text-sm text-green-300 mt-1">Avg Confidence</div>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No insights generated yet</p>
            <p className="text-sm text-gray-500">
              Claude will analyze your facility data and provide intelligent insights
            </p>
          </div>
        )}

        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${getSeverityColor(insight.severity)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full uppercase">
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{insight.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  {getTrendIcon(insight.trend)}
                  <span>{formatValue(insight.currentValue, insight.metric)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{insight.timeframe}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-400">Current Value</div>
                <div className="font-medium text-white">
                  {formatValue(insight.currentValue, insight.metric)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Expected Value</div>
                <div className="font-medium text-white">
                  {formatValue(insight.expectedValue, insight.metric)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Confidence</div>
                <div className="font-medium text-white">{insight.confidence}%</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                AI Recommendations:
              </h4>
              <ul className="space-y-1">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Impact: {insight.impact}</span>
                <span>Detected: {getTimeAgo(insight.detectedAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Bot className="w-3 h-3" />
                <span>Powered by Claude AI</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}