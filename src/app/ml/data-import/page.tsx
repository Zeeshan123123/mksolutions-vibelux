'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import MLDataQualityDashboard from '@/components/ml/MLDataQualityDashboard';
import {
  Database,
  Brain,
  Zap,
  FileText,
  TrendingUp,
  CheckCircle,
  Upload,
  Settings,
  Target,
  BarChart3
} from 'lucide-react';

export default function MLDataImportPage() {
  const { isLoaded, userId } = useAuth();
  const [activeStep, setActiveStep] = useState(1);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please sign in to access ML data import features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">ML Data Import & Analysis</h1>
              <p className="text-gray-400">
                Import Excel/CSV data, assess quality, and prepare for machine learning workflows
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 rounded-lg p-3">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {[
                { step: 1, title: 'Upload Data', icon: Upload, description: 'CSV, Excel, or JSON files' },
                { step: 2, title: 'Quality Assessment', icon: CheckCircle, description: 'AI-powered validation' },
                { step: 3, title: 'Feature Engineering', icon: Settings, description: 'Automated preprocessing' },
                { step: 4, title: 'ML Training', icon: Brain, description: 'Model development' }
              ].map(({ step, title, icon: Icon, description }) => (
                <div key={step} className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${activeStep >= step ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'}
                  `}>
                    {activeStep > step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${activeStep >= step ? 'text-white' : 'text-gray-400'}`}>
                      {title}
                    </div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI-Powered Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI-Powered Analysis</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Automatic field interpretation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Cultivation-specific validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Data quality scoring
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                ML readiness assessment
              </li>
            </ul>
          </div>

          {/* Feature Engineering */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Advanced Feature Engineering</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Automated feature creation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Time-series features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Interaction variables
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Domain-specific ratios
              </li>
            </ul>
          </div>

          {/* ML Integration */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">ML Integration</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Multiple model types
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Automated hyperparameters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Cross-validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Performance metrics
              </li>
            </ul>
          </div>
        </div>

        {/* Supported Use Cases */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Supported ML Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Yield Prediction',
                description: 'Predict harvest yields based on environmental conditions',
                icon: TrendingUp,
                color: 'text-green-400'
              },
              {
                title: 'Quality Optimization',
                description: 'Optimize growing conditions for quality metrics',
                icon: Target,
                color: 'text-blue-400'
              },
              {
                title: 'Environment Control',
                description: 'Automate environmental parameter adjustments',
                icon: Settings,
                color: 'text-purple-400'
              },
              {
                title: 'Anomaly Detection',
                description: 'Identify unusual patterns and potential issues',
                icon: BarChart3,
                color: 'text-yellow-400'
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <useCase.icon className={`w-5 h-5 ${useCase.color}`} />
                  <h4 className="font-medium text-white">{useCase.title}</h4>
                </div>
                <p className="text-gray-400 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Requirements */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Data Requirements & Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Required Fields (Minimum)</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Environmental data (temperature, humidity)</li>
                <li>• Lighting parameters (PPFD, photoperiod)</li>
                <li>• Nutritional data (pH, EC)</li>
                <li>• Outcome variables (yield, quality metrics)</li>
                <li>• Timestamps (for temporal analysis)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Recommendations</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Minimum 100 records for ML training</li>
                <li>• Consistent data collection intervals</li>
                <li>• Complete growth cycle data</li>
                <li>• Multiple varieties/strains (if applicable)</li>
                <li>• Proper units and measurement scales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Component */}
      <MLDataQualityDashboard />
    </div>
  );
}