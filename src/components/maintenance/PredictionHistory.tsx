'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ErrorBar,
  Cell
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Info,
  ChevronDown,
  Target,
  Activity,
  BarChart3,
  Eye,
  Brain,
  Zap,
  Clock,
  TrendingDown,
  AlertCircle,
  Database,
  Settings
} from 'lucide-react';

interface PredictionRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  predictedDate: Date;
  actualDate: Date | null;
  predictedFailureType: string;
  actualFailureType: string | null;
  confidence: number;
  predictionMadeDate: Date;
  leadTime: number; // days between prediction and predicted failure
  accuracy: 'correct' | 'early' | 'late' | 'false-positive' | 'missed';
  daysDifference: number | null; // difference between predicted and actual
  cost: number;
  savedCost: number | null;
}

interface HistoricalMetrics {
  date: Date;
  predictions: number;
  actualFailures: number;
  accuracy: number;
  falsePositiveRate: number;
  missedFailureRate: number;
  avgConfidence: number;
  avgLeadTime: number;
}

interface EquipmentTypeMetrics {
  type: string;
  totalPredictions: number;
  accuracy: number;
  falsePositiveRate: number;
  avgLeadTime: number;
  totalCostSaved: number;
}

export function PredictionHistory() {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<number>(0);
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'confidence' | 'lead-time'>('accuracy');
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState<PredictionRecord[]>([]);
  const [metrics, setMetrics] = useState<HistoricalMetrics[]>([]);

  // Generate mock historical data
  useEffect(() => {
    generateMockData();
  }, [timeRange]);

  const generateMockData = () => {
    setIsLoading(true);
    
    // Generate prediction records
    const records: PredictionRecord[] = [];
    const daysToGenerate = timeRange === '1M' ? 30 : 
                          timeRange === '3M' ? 90 : 
                          timeRange === '6M' ? 180 : 
                          timeRange === '1Y' ? 365 : 730;
    
    const equipmentTypes = ['Lighting', 'HVAC', 'Water System', 'Electrical', 'Sensors'];
    const failureTypes = ['Component Failure', 'Performance Degradation', 'Overheating', 'Electrical Fault', 'Mechanical Wear'];
    
    for (let i = 0; i < daysToGenerate * 2; i++) {
      const predictionMadeDate = new Date(Date.now() - (daysToGenerate - i/2) * 24 * 60 * 60 * 1000);
      const leadTime = Math.floor(Math.random() * 60) + 7; // 7-67 days lead time
      const predictedDate = new Date(predictionMadeDate.getTime() + leadTime * 24 * 60 * 60 * 1000);
      const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence
      
      // Simulate whether prediction was correct
      const isCorrect = Math.random() < (confidence * 0.9); // Higher confidence = more likely correct
      const isFalsePositive = !isCorrect && Math.random() < 0.3;
      const daysDiff = isCorrect ? Math.floor((Math.random() - 0.5) * 20) : null; // ±10 days variance
      
      let accuracy: PredictionRecord['accuracy'];
      let actualDate = null;
      
      if (isCorrect) {
        actualDate = new Date(predictedDate.getTime() + daysDiff! * 24 * 60 * 60 * 1000);
        if (daysDiff! < -7) accuracy = 'early';
        else if (daysDiff! > 7) accuracy = 'late';
        else accuracy = 'correct';
      } else if (isFalsePositive) {
        accuracy = 'false-positive';
      } else {
        accuracy = 'missed';
        // For missed failures, the failure happened but wasn't predicted accurately
        actualDate = new Date(predictedDate.getTime() + (Math.random() * 30 + 30) * 24 * 60 * 60 * 1000);
      }
      
      records.push({
        id: `pred-${i}`,
        equipmentId: `eq-${Math.floor(Math.random() * 20)}`,
        equipmentName: `${equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]} Unit ${Math.floor(Math.random() * 10) + 1}`,
        equipmentType: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
        predictedDate,
        actualDate,
        predictedFailureType: failureTypes[Math.floor(Math.random() * failureTypes.length)],
        actualFailureType: isCorrect ? failureTypes[Math.floor(Math.random() * failureTypes.length)] : null,
        confidence,
        predictionMadeDate,
        leadTime,
        accuracy,
        daysDifference: daysDiff,
        cost: Math.floor(Math.random() * 5000) + 500,
        savedCost: accuracy === 'correct' || accuracy === 'early' ? Math.floor(Math.random() * 15000) + 2000 : null
      });
    }
    
    // Generate daily metrics
    const dailyMetrics: HistoricalMetrics[] = [];
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(Date.now() - (daysToGenerate - i) * 24 * 60 * 60 * 1000);
      const dayRecords = records.filter(r => 
        r.predictedDate.toDateString() === date.toDateString()
      );
      
      const correctPredictions = dayRecords.filter(r => ['correct', 'early', 'late'].includes(r.accuracy)).length;
      const falsePositives = dayRecords.filter(r => r.accuracy === 'false-positive').length;
      const missed = dayRecords.filter(r => r.accuracy === 'missed').length;
      
      dailyMetrics.push({
        date,
        predictions: dayRecords.length,
        actualFailures: dayRecords.filter(r => r.actualDate && r.actualDate.toDateString() === date.toDateString()).length,
        accuracy: dayRecords.length > 0 ? (correctPredictions / dayRecords.length) * 100 : 0,
        falsePositiveRate: dayRecords.length > 0 ? (falsePositives / dayRecords.length) * 100 : 0,
        missedFailureRate: missed / (dayRecords.length || 1) * 100,
        avgConfidence: dayRecords.length > 0 ? dayRecords.reduce((sum, r) => sum + r.confidence, 0) / dayRecords.length * 100 : 0,
        avgLeadTime: dayRecords.length > 0 ? dayRecords.reduce((sum, r) => sum + r.leadTime, 0) / dayRecords.length : 0
      });
    }
    
    setPredictionHistory(records);
    setMetrics(dailyMetrics);
    setIsLoading(false);
  };

  // Calculate aggregate metrics
  const filteredRecords = predictionHistory.filter(r => 
    (selectedEquipmentType === 'all' || r.equipmentType === selectedEquipmentType) &&
    r.confidence * 100 >= confidenceFilter
  );

  const overallAccuracy = filteredRecords.length > 0 
    ? (filteredRecords.filter(r => ['correct', 'early', 'late'].includes(r.accuracy)).length / filteredRecords.length) * 100
    : 0;

  const falsePositiveRate = filteredRecords.length > 0
    ? (filteredRecords.filter(r => r.accuracy === 'false-positive').length / filteredRecords.length) * 100
    : 0;

  const meanAbsoluteError = filteredRecords
    .filter(r => r.daysDifference !== null)
    .reduce((sum, r) => sum + Math.abs(r.daysDifference!), 0) / 
    (filteredRecords.filter(r => r.daysDifference !== null).length || 1);

  const totalCostSaved = filteredRecords
    .filter(r => r.savedCost)
    .reduce((sum, r) => sum + r.savedCost!, 0);

  // Equipment type breakdown
  const equipmentTypes = Array.from(new Set(predictionHistory.map(r => r.equipmentType)));
  const equipmentMetrics: EquipmentTypeMetrics[] = equipmentTypes.map(type => {
    const typeRecords = predictionHistory.filter(r => r.equipmentType === type);
    const correctCount = typeRecords.filter(r => ['correct', 'early', 'late'].includes(r.accuracy)).length;
    
    return {
      type,
      totalPredictions: typeRecords.length,
      accuracy: typeRecords.length > 0 ? (correctCount / typeRecords.length) * 100 : 0,
      falsePositiveRate: typeRecords.length > 0 
        ? (typeRecords.filter(r => r.accuracy === 'false-positive').length / typeRecords.length) * 100 
        : 0,
      avgLeadTime: typeRecords.length > 0 
        ? typeRecords.reduce((sum, r) => sum + r.leadTime, 0) / typeRecords.length 
        : 0,
      totalCostSaved: typeRecords
        .filter(r => r.savedCost)
        .reduce((sum, r) => sum + r.savedCost!, 0)
    };
  });

  // Prepare chart data with confidence intervals
  const chartData = metrics.map(m => ({
    date: m.date.toLocaleDateString(),
    accuracy: m.accuracy,
    accuracyLower: Math.max(0, m.accuracy - 10), // Simple confidence interval
    accuracyUpper: Math.min(100, m.accuracy + 10),
    predictions: m.predictions,
    actualFailures: m.actualFailures,
    confidence: m.avgConfidence,
    leadTime: m.avgLeadTime,
    falsePositiveRate: m.falsePositiveRate
  }));

  // Scatter plot data for prediction accuracy
  const scatterData = filteredRecords
    .filter(r => r.actualDate && r.daysDifference !== null)
    .map(r => ({
      confidence: r.confidence * 100,
      daysDifference: r.daysDifference,
      leadTime: r.leadTime,
      equipmentType: r.equipmentType,
      cost: r.cost
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}{entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Prediction History & Analytics
          </h2>
          <p className="text-gray-400">
            Historical analysis of predictive maintenance performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => generateMockData()}
            disabled={isLoading}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="grid grid-cols-4 gap-4">
          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Time Range</label>
            <div className="flex gap-1">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Equipment Type</label>
            <select
              value={selectedEquipmentType}
              onChange={(e) => setSelectedEquipmentType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Min Confidence: {confidenceFilter}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Metric Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Display Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="accuracy">Accuracy</option>
              <option value="confidence">Confidence</option>
              <option value="lead-time">Lead Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Overall Accuracy</span>
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{overallAccuracy.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredRecords.filter(r => ['correct', 'early', 'late'].includes(r.accuracy)).length} / {filteredRecords.length} predictions
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">False Positive Rate</span>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{falsePositiveRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredRecords.filter(r => r.accuracy === 'false-positive').length} false alarms
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Mean Absolute Error</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{meanAbsoluteError.toFixed(1)} days</p>
          <p className="text-sm text-gray-500 mt-1">Average prediction deviation</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Cost Savings</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">${(totalCostSaved / 1000).toFixed(0)}k</p>
          <p className="text-sm text-gray-500 mt-1">Through predictive maintenance</p>
        </div>
      </div>

      {/* Main Chart - Predictions vs Actuals with Confidence Intervals */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Prediction Accuracy Over Time</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Info className="w-4 h-4" />
            Shaded area shows confidence interval
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Confidence interval */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="accuracyUpper"
                stackId="1"
                stroke="none"
                fill="#3B82F6"
                fillOpacity={0.1}
                name="Confidence Upper"
                legendType="none"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="accuracyLower"
                stackId="1"
                stroke="none"
                fill="#FFFFFF"
                fillOpacity={0.1}
                name="Confidence Lower"
                legendType="none"
              />
              
              {/* Main accuracy line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Accuracy %"
                dot={false}
              />
              
              {/* Bar chart for counts */}
              <Bar
                yAxisId="right"
                dataKey="predictions"
                fill="#8B5CF6"
                opacity={0.6}
                name="Predictions"
              />
              <Bar
                yAxisId="right"
                dataKey="actualFailures"
                fill="#EF4444"
                opacity={0.6}
                name="Actual Failures"
              />
              
              <Brush dataKey="date" height={30} stroke="#8B5CF6" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction Accuracy Scatter Plot */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Confidence vs Accuracy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="confidence" 
                  name="Confidence" 
                  unit="%" 
                  stroke="#9CA3AF"
                  domain={[50, 100]}
                />
                <YAxis 
                  dataKey="daysDifference" 
                  name="Days Difference" 
                  stroke="#9CA3AF"
                  domain={[-30, 30]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#666" />
                <Scatter 
                  name="Predictions" 
                  data={scatterData} 
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Type Performance */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Performance by Equipment Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentMetrics} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="type" type="category" stroke="#9CA3AF" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" fill="#10B981" name="Accuracy %" />
                <Bar dataKey="falsePositiveRate" fill="#EF4444" name="False Positive %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Equipment Type Analysis</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm">Show Details</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Equipment Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total Predictions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Accuracy</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">False Positive Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Avg Lead Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Cost Saved</th>
              </tr>
            </thead>
            <tbody>
              {equipmentMetrics.map((metric) => (
                <tr key={metric.type} className="border-b border-gray-800">
                  <td className="px-4 py-3 font-medium text-white">{metric.type}</td>
                  <td className="px-4 py-3 text-gray-300">{metric.totalPredictions}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${metric.accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-300">{metric.accuracy.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${
                      metric.falsePositiveRate < 10 ? 'text-green-400' :
                      metric.falsePositiveRate < 20 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {metric.falsePositiveRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{metric.avgLeadTime.toFixed(0)} days</td>
                  <td className="px-4 py-3 text-green-400 font-medium">
                    ${(metric.totalCostSaved / 1000).toFixed(1)}k
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDetails && (
          <div className="mt-6 space-y-4">
            {/* Additional insights */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Model Insights
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Lighting equipment shows highest prediction accuracy (95.2%) with 32-day average lead time</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Water System predictions have higher false positive rate due to seasonal variations</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>Model accuracy improved by 12% after incorporating weather data correlation</span>
                </li>
              </ul>
            </div>

            {/* Recent prediction examples */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">Recent Prediction Examples</h4>
              <div className="space-y-2">
                {filteredRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        record.accuracy === 'correct' ? 'bg-green-400' :
                        record.accuracy === 'false-positive' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      <span className="text-gray-300">{record.equipmentName}</span>
                      <span className="text-gray-500">{record.predictedFailureType}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">
                        {record.confidence ? `${(record.confidence * 100).toFixed(0)}% confidence` : ''}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.accuracy === 'correct' ? 'bg-green-900/30 text-green-400' :
                        record.accuracy === 'early' ? 'bg-blue-900/30 text-blue-400' :
                        record.accuracy === 'late' ? 'bg-yellow-900/30 text-yellow-400' :
                        record.accuracy === 'false-positive' ? 'bg-orange-900/30 text-orange-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {record.accuracy.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Performance Trends */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
        <div className="flex items-start gap-3">
          <Database className="w-6 h-6 text-purple-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Predictive Model Performance Summary</h3>
            <div className="grid grid-cols-3 gap-6 mt-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Model Version</p>
                <p className="text-xl font-bold text-white">v3.2.1</p>
                <p className="text-xs text-green-400">+8% accuracy from v3.1</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Training Data Points</p>
                <p className="text-xl font-bold text-white">847,293</p>
                <p className="text-xs text-gray-500">Last updated 2 days ago</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Prediction Horizon</p>
                <p className="text-xl font-bold text-white">90 days</p>
                <p className="text-xs text-gray-500">Optimal accuracy window</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}