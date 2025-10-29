'use client';

import { useState, useEffect } from 'react';
import { 
  Layers,
  Calendar,
  Droplets,
  Wind,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  BookOpen,
  DollarSign,
  Shield,
  Zap,
  Navigation,
  ListTodo,
  TrendingUp
} from 'lucide-react';
import { RecipeControlSystem } from '@/components/cultivation/RecipeControlSystem';
import { MultiLevelRackControl } from '@/components/cultivation/MultiLevelRackControl';
import { IrrigationControlPanel } from '@/components/cultivation/IrrigationControlPanel';
import { HVACSystemDashboard } from '@/components/cultivation/HVACSystemDashboard';
import { CircadianRhythmManager } from '@/components/cultivation/CircadianRhythmManager';
import { AlertDetectionDashboard } from '@/components/alerts/AlertDetectionDashboard';
import { Toaster } from 'react-hot-toast';
import { VerticalFarmingIntegration } from '@/components/cultivation/VerticalFarmingIntegration';
import { RecipeManager } from '@/components/cultivation/RecipeManager';
import { CostTrackingDashboard } from '@/components/cultivation/CostTrackingDashboard';
import { EnergyMarketIntegration } from '@/components/cultivation/EnergyMarketIntegration';
import { CropSteeringDashboard } from '@/components/cultivation/CropSteeringDashboard';
import { TaskManagement } from '@/components/cultivation/TaskManagement';
import { EnvironmentalMonitoringGrid } from '@/components/cultivation/EnvironmentalMonitoringGrid';
import { WorkerSafetyModule } from '@/components/cultivation/WorkerSafetyModule';

type TabType = 'recipe' | 'recipes' | 'racks' | 'irrigation' | 'hvac' | 'circadian' | 'vertical' | 'alarms' | 'analytics' | 'costs' | 'energy' | 'steering' | 'tasks' | 'monitoring' | 'safety';

interface SystemStatus {
  name: string;
  status: 'active' | 'warning' | 'error' | 'offline';
  metric?: string;
  value?: string;
}

export default function CultivationDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('recipe');
  const [facilityId, setFacilityId] = useState<string>('cmh5wpg2p0000vdm4hfg2e5q6');

  useEffect(() => {
    // Get facility ID from localStorage or user context
    const storedFacilityId = localStorage.getItem('selectedFacilityId');
    if (storedFacilityId) {
      setFacilityId(storedFacilityId);
    }
  }, []);

  const systemStatuses: SystemStatus[] = [
    { name: 'Recipe Control', status: 'active', metric: 'Day', value: '15/45' },
    { name: 'Rack System', status: 'active', metric: 'Active', value: '6/8' },
    { name: 'Irrigation', status: 'warning', metric: 'Flow', value: '2.4 GPM' },
    { name: 'HVAC', status: 'active', metric: 'Temp', value: '72.4°F' },
    { name: 'CO₂ System', status: 'active', metric: 'Level', value: '824 ppm' },
    { name: 'Alarms', status: 'warning', metric: 'Active', value: '2' }
  ];

  const tabs = [
    { id: 'recipe' as TabType, label: 'Recipe Control', icon: Calendar },
    { id: 'recipes' as TabType, label: 'Recipe Library', icon: BookOpen },
    { id: 'steering' as TabType, label: 'Crop Steering', icon: Navigation },
    { id: 'monitoring' as TabType, label: 'Environmental', icon: Activity },
    { id: 'racks' as TabType, label: 'Rack Levels', icon: Layers },
    { id: 'irrigation' as TabType, label: 'Irrigation', icon: Droplets },
    { id: 'hvac' as TabType, label: 'HVAC System', icon: Wind },
    { id: 'circadian' as TabType, label: 'Circadian', icon: Clock },
    { id: 'vertical' as TabType, label: 'Vertical Farm', icon: Building },
    { id: 'tasks' as TabType, label: 'Tasks', icon: ListTodo },
    { id: 'costs' as TabType, label: 'Cost Tracking', icon: DollarSign },
    { id: 'energy' as TabType, label: 'Energy Markets', icon: Zap },
    { id: 'safety' as TabType, label: 'Worker Safety', icon: Shield },
    { id: 'alarms' as TabType, label: 'Alarms', icon: Bell },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Toast notifications for alerts */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }}
      />
      
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Cultivation Control Center</h1>
              <p className="text-gray-400">Professional Grow Management System</p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="/cultivation/advanced"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Advanced Features
              </a>
              <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* System Status Overview */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            {systemStatuses.map((system) => (
              <div
                key={system.name}
                className={`bg-gray-900 rounded-lg p-4 border ${getStatusColor(system.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{system.name}</span>
                  {getStatusIcon(system.status)}
                </div>
                {system.metric && system.value && (
                  <div>
                    <p className="text-2xl font-bold text-white">{system.value}</p>
                    <p className="text-xs text-gray-500">{system.metric}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Tabs - Scrollable */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'recipe' && <RecipeControlSystem />}
          {activeTab === 'recipes' && <RecipeManager />}
          {activeTab === 'steering' && <CropSteeringDashboard />}
          {activeTab === 'monitoring' && <EnvironmentalMonitoringGrid />}
          {activeTab === 'racks' && <MultiLevelRackControl />}
          {activeTab === 'irrigation' && <IrrigationControlPanel />}
          {activeTab === 'hvac' && <HVACSystemDashboard />}
          {activeTab === 'circadian' && <CircadianRhythmManager />}
          {activeTab === 'vertical' && <VerticalFarmingIntegration />}
          {activeTab === 'tasks' && <TaskManagement />}
          {activeTab === 'costs' && <CostTrackingDashboard />}
          {activeTab === 'energy' && <EnergyMarketIntegration />}
          {activeTab === 'safety' && <WorkerSafetyModule />}
          
          {activeTab === 'alarms' && (
            <AlertDetectionDashboard facilityId={facilityId} />
          )}
          
          {activeTab === 'analytics' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Advanced Analytics Dashboard</h3>
                  <p className="text-gray-500">Comprehensive grow data analysis and insights</p>
                  <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            <button className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-white">System Health Check</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-white">Schedule Maintenance</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-white">Generate Report</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-orange-500" />
                <span className="text-white">System Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}