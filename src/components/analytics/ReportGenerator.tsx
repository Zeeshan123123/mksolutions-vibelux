'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table,
  Clock,
  Mail,
  Settings,
  Plus,
  X,
  Play,
  Save,
  RefreshCw,
  Eye,
  Users,
  Share2
} from 'lucide-react';

interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  facilityId: string;
  dataSource: 'sensor_data' | 'harvest_data' | 'financial_data' | 'analytics_summary';
  metrics: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  dateRange: {
    type: 'relative' | 'absolute';
    start?: Date;
    end?: Date;
    period?: '1d' | '7d' | '30d' | '90d' | '1y';
  };
  visualizations: VisualizationConfig[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
  schedule?: ScheduleConfig;
  recipients?: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VisualizationConfig {
  id: string;
  type: 'table' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'metric_card';
  title: string;
  metrics: string[];
  chartOptions?: any;
}

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  timezone: string;
  dayOfWeek?: number; // For weekly
  dayOfMonth?: number; // For monthly
}

interface ReportGeneratorProps {
  className?: string;
  facilityId: string;
  onReportGenerated?: (report: any) => void;
}

const AVAILABLE_METRICS = {
  sensor_data: [
    { id: 'temperature_avg', label: 'Average Temperature', unit: '°C' },
    { id: 'humidity_avg', label: 'Average Humidity', unit: '%' },
    { id: 'co2_avg', label: 'Average CO2', unit: 'ppm' },
    { id: 'light_intensity_avg', label: 'Average Light Intensity', unit: 'PPFD' },
    { id: 'power_consumption', label: 'Power Consumption', unit: 'kWh' }
  ],
  harvest_data: [
    { id: 'total_yield', label: 'Total Yield', unit: 'kg' },
    { id: 'avg_quality_grade', label: 'Average Quality Grade', unit: '' },
    { id: 'harvest_count', label: 'Number of Harvests', unit: '' },
    { id: 'yield_per_plant', label: 'Yield per Plant', unit: 'g' }
  ],
  financial_data: [
    { id: 'revenue', label: 'Revenue', unit: '$' },
    { id: 'expenses', label: 'Expenses', unit: '$' },
    { id: 'profit_margin', label: 'Profit Margin', unit: '%' },
    { id: 'cost_per_kg', label: 'Cost per Kg', unit: '$/kg' }
  ],
  analytics_summary: [
    { id: 'efficiency_score', label: 'Efficiency Score', unit: '%' },
    { id: 'growth_rate', label: 'Growth Rate', unit: '%/day' },
    { id: 'energy_efficiency', label: 'Energy Efficiency', unit: 'kWh/kg' },
    { id: 'space_utilization', label: 'Space Utilization', unit: '%' }
  ]
};

export default function ReportGenerator({
  className = '',
  facilityId,
  onReportGenerated
}: ReportGeneratorProps) {
  const [report, setReport] = useState<ReportConfig>({
    id: `report-${Date.now()}`,
    name: 'New Report',
    facilityId,
    dataSource: 'sensor_data',
    metrics: [],
    filters: {},
    aggregation: 'avg',
    dateRange: {
      type: 'relative',
      period: '30d'
    },
    visualizations: [],
    format: 'pdf',
    isPublic: false,
    createdBy: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationConfig | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    try {
      const response = await fetch(`/api/analytics/reports?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedReports(data.reports || []);
      }
    } catch (error) {
      logger.error('system', 'Failed to load saved reports:', error );
    }
  };

  const updateReport = (updates: Partial<ReportConfig>) => {
    setReport(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  const addMetric = (metricId: string) => {
    if (!report.metrics.includes(metricId)) {
      updateReport({
        metrics: [...report.metrics, metricId]
      });
    }
  };

  const removeMetric = (metricId: string) => {
    updateReport({
      metrics: report.metrics.filter(m => m !== metricId)
    });
  };

  const addVisualization = (type: VisualizationConfig['type']) => {
    const newViz: VisualizationConfig = {
      id: `viz-${Date.now()}`,
      type,
      title: `${type.replace('_', ' ').toUpperCase()} Chart`,
      metrics: report.metrics.slice(0, 3) // Use first 3 metrics
    };

    updateReport({
      visualizations: [...report.visualizations, newViz]
    });
  };

  const updateVisualization = (vizId: string, updates: Partial<VisualizationConfig>) => {
    updateReport({
      visualizations: report.visualizations.map(viz =>
        viz.id === vizId ? { ...viz, ...updates } : viz
      )
    });
  };

  const removeVisualization = (vizId: string) => {
    updateReport({
      visualizations: report.visualizations.filter(viz => viz.id !== vizId)
    });
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/analytics/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...report,
          preview: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview);
      }
    } catch (error) {
      logger.error('system', 'Failed to generate preview:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/analytics/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.${report.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        if (onReportGenerated) {
          onReportGenerated(report);
        }
      }
    } catch (error) {
      logger.error('system', 'Failed to generate report:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReport = async () => {
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        await loadSavedReports();
        alert('Report template saved successfully!');
      }
    } catch (error) {
      logger.error('system', 'Failed to save report:', error );
    }
  };

  const scheduleReport = async (scheduleConfig: ScheduleConfig) => {
    try {
      const response = await fetch('/api/analytics/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId: report.id,
          schedule: scheduleConfig
        })
      });

      if (response.ok) {
        updateReport({ schedule: scheduleConfig });
        setShowScheduleModal(false);
        alert('Report scheduled successfully!');
      }
    } catch (error) {
      logger.error('system', 'Failed to schedule report:', error );
    }
  };

  const availableMetrics = AVAILABLE_METRICS[report.dataSource] || [];

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <input
              type="text"
              value={report.name}
              onChange={(e) => updateReport({ name: e.target.value })}
              className="text-xl font-semibold bg-transparent text-white border-b border-gray-600 focus:border-purple-400 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={generatePreview}
              disabled={isGenerating || report.metrics.length === 0}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button
              onClick={saveReport}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
            
            <button
              onClick={generateReport}
              disabled={isGenerating || report.metrics.length === 0}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-sm"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Generate Report
            </button>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Add a description..."
          value={report.description || ''}
          onChange={(e) => updateReport({ description: e.target.value })}
          className="w-full px-3 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-300"
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Data Source Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Data Source</label>
          <select
            value={report.dataSource}
            onChange={(e) => updateReport({ 
              dataSource: e.target.value as ReportConfig['dataSource'],
              metrics: [] // Reset metrics when changing data source
            })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
          >
            <option value="sensor_data">Sensor Data</option>
            <option value="harvest_data">Harvest Data</option>
            <option value="financial_data">Financial Data</option>
            <option value="analytics_summary">Analytics Summary</option>
          </select>
        </div>

        {/* Metrics Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Metrics</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {availableMetrics.map(metric => (
              <button
                key={metric.id}
                onClick={() => 
                  report.metrics.includes(metric.id) 
                    ? removeMetric(metric.id)
                    : addMetric(metric.id)
                }
                className={`p-2 text-left text-sm rounded border transition-all ${
                  report.metrics.includes(metric.id)
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{metric.label}</div>
                {metric.unit && (
                  <div className="text-xs opacity-75">{metric.unit}</div>
                )}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-gray-400">
            Selected: {report.metrics.length} metrics
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={report.dateRange.type === 'relative'}
                  onChange={() => updateReport({
                    dateRange: { ...report.dateRange, type: 'relative' }
                  })}
                  className="text-purple-600"
                />
                <span className="text-sm text-gray-300">Relative</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={report.dateRange.type === 'absolute'}
                  onChange={() => updateReport({
                    dateRange: { ...report.dateRange, type: 'absolute' }
                  })}
                  className="text-purple-600"
                />
                <span className="text-sm text-gray-300">Absolute</span>
              </label>
            </div>

            {report.dateRange.type === 'relative' ? (
              <select
                value={report.dateRange.period}
                onChange={(e) => updateReport({
                  dateRange: { ...report.dateRange, period: e.target.value as any }
                })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={report.dateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateReport({
                      dateRange: { ...report.dateRange, start: new Date(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={report.dateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateReport({
                      dateRange: { ...report.dateRange, end: new Date(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visualizations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">Visualizations</label>
            <div className="flex gap-2">
              <button
                onClick={() => addVisualization('table')}
                className="p-1 text-gray-400 hover:text-white"
                title="Add Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => addVisualization('line_chart')}
                className="p-1 text-gray-400 hover:text-white"
                title="Add Line Chart"
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => addVisualization('bar_chart')}
                className="p-1 text-gray-400 hover:text-white"
                title="Add Bar Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => addVisualization('pie_chart')}
                className="p-1 text-gray-400 hover:text-white"
                title="Add Pie Chart"
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {report.visualizations.map(viz => (
              <div
                key={viz.id}
                className="p-3 bg-gray-900 rounded border border-gray-700 flex items-center justify-between"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={viz.title}
                    onChange={(e) => updateVisualization(viz.id, { title: e.target.value })}
                    className="font-medium bg-transparent text-white border-b border-gray-600 focus:border-purple-400 outline-none"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Type: {viz.type.replace('_', ' ')} • Metrics: {viz.metrics.length}
                  </div>
                </div>
                <button
                  onClick={() => removeVisualization(viz.id)}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
            <select
              value={report.format}
              onChange={(e) => updateReport({ format: e.target.value as ReportConfig['format'] })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
            >
              <option value="pdf">PDF Document</option>
              <option value="excel">Excel Spreadsheet</option>
              <option value="csv">CSV File</option>
              <option value="json">JSON Data</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aggregation</label>
            <select
              value={report.aggregation}
              onChange={(e) => updateReport({ aggregation: e.target.value as ReportConfig['aggregation'] })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
            >
              <option value="avg">Average</option>
              <option value="sum">Sum</option>
              <option value="count">Count</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>
        </div>

        {/* Scheduling */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">Scheduling</label>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
            >
              <Clock className="w-4 h-4" />
              {report.schedule?.enabled ? 'Edit Schedule' : 'Add Schedule'}
            </button>
          </div>
          
          {report.schedule?.enabled && (
            <div className="p-3 bg-gray-900 rounded border border-gray-700">
              <div className="text-sm text-gray-300">
                <strong>Frequency:</strong> {report.schedule.frequency}<br />
                <strong>Time:</strong> {report.schedule.time}<br />
                <strong>Timezone:</strong> {report.schedule.timezone}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewData && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
            <div className="p-4 bg-gray-900 rounded border border-gray-700 max-h-64 overflow-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <div className="p-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Saved Report Templates</h3>
          <div className="grid grid-cols-3 gap-3">
            {savedReports.map(saved => (
              <button
                key={saved.id}
                onClick={() => setReport(saved)}
                className="p-3 bg-gray-900 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded text-left transition-all"
              >
                <h4 className="text-sm font-medium text-white mb-1">{saved.name}</h4>
                <p className="text-xs text-gray-400">
                  {saved.metrics.length} metrics • {saved.format.toUpperCase()}
                </p>
                {saved.schedule?.enabled && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    Scheduled
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}