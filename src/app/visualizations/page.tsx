'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  GitBranch,
  Target,
  Calendar,
  Layers,
  Zap,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Settings,
  Download,
  Share2,
  Filter,
  Maximize2
} from 'lucide-react';
import { AdvancedVisualizationSuite } from '@/components/advanced-charts/AdvancedVisualizationSuite';
import { EnhancedChartRenderer } from '@/components/admin/DebugDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

export default function VisualizationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');

  const metrics: DashboardMetric[] = [
    {
      id: 'energy_efficiency',
      title: 'Energy Efficiency',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Zap,
      color: 'text-green-600'
    },
    {
      id: 'avg_temperature',
      title: 'Avg Temperature',
      value: '24.5°C',
      change: '+0.3°C',
      trend: 'up',
      icon: Thermometer,
      color: 'text-orange-600'
    },
    {
      id: 'humidity_level',
      title: 'Humidity Level',
      value: '68%',
      change: '-1.2%',
      trend: 'down',
      icon: Droplets,
      color: 'text-blue-600'
    },
    {
      id: 'light_intensity',
      title: 'Light Intensity',
      value: '850 μmol/m²/s',
      change: '+5.2%',
      trend: 'up',
      icon: Sun,
      color: 'text-yellow-600'
    }
  ];

  const lineChartData = [
    { name: 'Jan', energy: 4000, yield: 2400, efficiency: 85 },
    { name: 'Feb', energy: 3000, yield: 1398, efficiency: 88 },
    { name: 'Mar', energy: 2000, yield: 9800, efficiency: 92 },
    { name: 'Apr', energy: 2780, yield: 3908, efficiency: 89 },
    { name: 'May', energy: 1890, yield: 4800, efficiency: 94 },
    { name: 'Jun', energy: 2390, yield: 3800, efficiency: 91 }
  ];

  const pieChartData = [
    { name: 'LED Lighting', value: 45, color: '#8b5cf6' },
    { name: 'HVAC System', value: 30, color: '#3b82f6' },
    { name: 'Pumps & Fans', value: 15, color: '#10b981' },
    { name: 'Monitoring', value: 10, color: '#f59e0b' }
  ];

  const spiderChartData = {
    axes: [
      { name: 'Energy Efficiency', max: 100, min: 0 },
      { name: 'Yield Quality', max: 100, min: 0 },
      { name: 'Growth Rate', max: 100, min: 0 },
      { name: 'Resource Usage', max: 100, min: 0 },
      { name: 'Automation', max: 100, min: 0 },
      { name: 'Sustainability', max: 100, min: 0 }
    ],
    datasets: [
      {
        name: 'Current Performance',
        color: '#3b82f6',
        values: [94, 87, 78, 82, 90, 85],
        fillOpacity: 0.3
      },
      {
        name: 'Industry Average',
        color: '#6b7280',
        values: [75, 70, 65, 70, 60, 65],
        fillOpacity: 0.2
      }
    ]
  };

  const heatmapConfig = {
    colorScale: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    showColorbar: true,
    unit: '°C'
  };

  const gaugeConfig = {
    value: 87,
    min: 0,
    max: 100,
    thresholds: [40, 70],
    colors: ['#ef4444', '#f59e0b', '#10b981']
  };

  const categories = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'energy', name: 'Energy Flow', icon: GitBranch },
    { id: 'environmental', name: 'Environmental', icon: Activity },
    { id: 'advanced', name: 'Advanced', icon: Target }
  ];

  const renderOverviewCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Performance Trends
          </CardTitle>
          <CardDescription>Energy usage and efficiency over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <EnhancedChartRenderer
            type="line"
            title="Performance Trends"
            config={{
              data: lineChartData,
              showGrid: true,
              showLegend: true
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            Energy Distribution
          </CardTitle>
          <CardDescription>Power consumption by system component</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <EnhancedChartRenderer
            type="pie"
            title="Energy Distribution"
            config={{
              data: pieChartData,
              showLegend: true
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Temperature Distribution
          </CardTitle>
          <CardDescription>Heat map of facility temperature zones</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <EnhancedChartRenderer
            type="heatmap"
            title="Temperature Heatmap"
            config={heatmapConfig}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Efficiency Score
          </CardTitle>
          <CardDescription>Overall system performance gauge</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <EnhancedChartRenderer
            type="gauge"
            title="Efficiency Gauge"
            config={gaugeConfig}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceCharts = () => (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Multi-Parameter Performance Analysis
          </CardTitle>
          <CardDescription>Comprehensive performance metrics comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedChartRenderer
            type="spider"
            title="Performance Spider Chart"
            config={{ data: spiderChartData }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Monthly Comparison
            </CardTitle>
            <CardDescription>Performance metrics by month</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <EnhancedChartRenderer
              type="bar"
              title="Monthly Performance"
              config={{
                data: lineChartData,
                showGrid: true,
                showLegend: true
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Cumulative Trends
            </CardTitle>
            <CardDescription>Area chart showing cumulative performance</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <EnhancedChartRenderer
              type="area"
              title="Cumulative Performance"
              config={{
                data: lineChartData,
                showGrid: true,
                showLegend: true
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdvancedCharts = () => (
    <div className="space-y-6">
      <AdvancedVisualizationSuite />
    </div>
  );

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'overview':
        return renderOverviewCharts();
      case 'performance':
        return renderPerformanceCharts();
      case 'energy':
      case 'environmental':
      case 'advanced':
        return renderAdvancedCharts();
      default:
        return renderOverviewCharts();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Visualizations</h1>
          <p className="text-gray-600 mt-1">
            Interactive charts and analytics for facility management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Chart Content */}
      <div>
        {renderCategoryContent()}
      </div>

      {/* Chart Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Chart Guide
          </CardTitle>
          <CardDescription>Understanding your visualization options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-500" />
                Sankey Diagrams
              </h4>
              <p className="text-sm text-gray-600">
                Visualize energy flows and resource allocation throughout your facility systems.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Spider Charts
              </h4>
              <p className="text-sm text-gray-600">
                Compare multiple performance metrics simultaneously across different categories.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Gantt Charts
              </h4>
              <p className="text-sm text-gray-600">
                Track project timelines, dependencies, and resource allocation over time.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                Network Graphs
              </h4>
              <p className="text-sm text-gray-600">
                Understand system relationships and component interactions in your facility.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                Heat Maps
              </h4>
              <p className="text-sm text-gray-600">
                Identify patterns and hotspots in temperature, humidity, and other environmental data.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-500" />
                Vector Fields
              </h4>
              <p className="text-sm text-gray-600">
                Visualize airflow patterns and directional data throughout your growing environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}