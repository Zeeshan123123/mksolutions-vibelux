'use client';

import React, { useState } from 'react';
import { 
  Brain, Leaf, Eye, Activity, 
  TrendingUp, Settings, Download, Share2, Cpu
} from 'lucide-react';
import { NavigationLayout } from '@/components/navigation/NavigationLayout';
import { PlantCommunicationHub } from '@/components/plant-monitoring/PlantCommunicationHub';
import { AdvancedPlantSensors } from '@/components/plant-monitoring/AdvancedPlantSensors';
import { AIEnhancedPlantAnalytics } from '@/components/plant-monitoring/AIEnhancedPlantAnalytics';

export default function PlantMonitoringPage() {
  const [activeView, setActiveView] = useState<'hub' | 'sensors' | 'ai-analytics'>('hub');

  return (
    <NavigationLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Plant Monitoring System</h1>
              <p className="text-gray-400 mt-1">Advanced sensor integration and plant communication</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
        {/* View Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveView('hub')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'hub'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Brain className="w-5 h-5" />
            Communication Hub
          </button>
          <button
            onClick={() => setActiveView('sensors')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'sensors'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Eye className="w-5 h-5" />
            Sensor Details
          </button>
          <button
            onClick={() => setActiveView('ai-analytics')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'ai-analytics'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Cpu className="w-5 h-5" />
            AI Analytics
          </button>
        </div>

        {/* Content */}
        {activeView === 'hub' ? (
          <PlantCommunicationHub />
        ) : activeView === 'sensors' ? (
          <AdvancedPlantSensors />
        ) : (
          <AIEnhancedPlantAnalytics />
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Real-time Monitoring</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Continuous monitoring of plant physiological responses through advanced sensors
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Sap flow measurement</li>
              <li>• Stomatal conductance</li>
              <li>• Stem diameter changes</li>
              <li>• Leaf wetness detection</li>
              <li>• Electrical signaling</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Integration</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Machine learning algorithms interpret plant signals and predict needs
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Pattern recognition</li>
              <li>• Stress prediction</li>
              <li>• Yield optimization</li>
              <li>• Disease prevention</li>
              <li>• Resource efficiency</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Automated Response</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Automatic environmental adjustments based on plant feedback
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Dynamic lighting control</li>
              <li>• Climate optimization</li>
              <li>• Irrigation scheduling</li>
              <li>• Nutrient delivery</li>
              <li>• Alert notifications</li>
            </ul>
          </div>
        </div>
    </NavigationLayout>
  );
}