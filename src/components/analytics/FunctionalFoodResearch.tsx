'use client';

import React, { useState } from 'react';
import { FunctionalFoodProduction } from '@/components/cultivation/FunctionalFoodProduction';
import {
  Beaker,
  TrendingUp,
  Brain,
  LineChart,
  Target,
  Info,
  ChevronRight,
  Database,
  Microscope,
  FlaskConical,
  BarChart3
} from 'lucide-react';

export function FunctionalFoodResearch() {
  const [activeResearchMode, setActiveResearchMode] = useState<'production' | 'regression' | 'discovery'>('production');

  return (
    <div className="space-y-6">
      {/* Research Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Functional Food Research Lab</h2>
            <p className="text-gray-400">
              Discover optimal growing conditions to maximize nutritional compounds and health benefits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Beaker className="w-8 h-8 text-purple-400" />
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Research Mode Tabs */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveResearchMode('production')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeResearchMode === 'production'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Production Protocols
          </button>
          <button
            onClick={() => setActiveResearchMode('regression')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeResearchMode === 'regression'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Regression Analysis
          </button>
          <button
            onClick={() => setActiveResearchMode('discovery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeResearchMode === 'discovery'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Recipe Discovery
          </button>
        </div>
      </div>

      {/* Research Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/analytics/regression-analysis"
          className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-purple-600 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Regression Models</h3>
          <p className="text-sm text-gray-400">
            Correlate growing conditions with nutritional outcomes
          </p>
        </a>

        <a
          href="/analytics/model-development"
          className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-purple-600 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">ML Models</h3>
          <p className="text-sm text-gray-400">
            Develop predictive models for compound optimization
          </p>
        </a>

        <a
          href="/analytics"
          className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-purple-600 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-green-400" />
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Data Integration</h3>
          <p className="text-sm text-gray-400">
            Connect with spectral and environmental data
          </p>
        </a>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-blue-400 mb-1">Research Focus</p>
            <p>
              This research lab combines cultivation protocols with advanced analytics to discover 
              optimal growing conditions for enhanced nutritional content. Use regression models 
              to find correlations between environmental parameters and target compounds.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeResearchMode === 'production' && (
        <FunctionalFoodProduction />
      )}

      {activeResearchMode === 'regression' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Regression Analysis</h3>
            <p className="text-gray-400 mb-6">
              Analyze correlations between growing conditions and nutritional outcomes
            </p>
            <a
              href="/analytics/regression-analysis"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Open Regression Tools
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {activeResearchMode === 'discovery' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="text-center py-12">
            <FlaskConical className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Recipe Discovery Engine</h3>
            <p className="text-gray-400 mb-6">
              AI-powered discovery of novel growing recipes for target compounds
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <Microscope className="w-4 h-4" />
              Start Discovery Process
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Protocols</span>
            <Beaker className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">12</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Compounds Tracked</span>
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">47</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Success Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">84%</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Patents Filed</span>
            <Brain className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
      </div>
    </div>
  );
}