"use client"

import { useState } from 'react'
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard'
import { SpectralCorrelationDashboard } from '@/components/analytics/SpectralCorrelationDashboard'
import { CannabisCompoundAnalysis } from '@/components/analytics/CannabisCompoundAnalysis'
import { ProduceNutritionAnalytics } from '@/components/analytics/ProduceNutritionAnalytics'
import InteractiveYieldDashboard from '@/components/analytics/InteractiveYieldDashboard'
import { FunctionalFoodResearch } from '@/components/analytics/FunctionalFoodResearch'
import { Brain, BarChart3, Leaf, TrendingUp, Apple, Beaker } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState<'yield' | 'general' | 'spectral' | 'cannabis' | 'nutrition' | 'functional'>('yield')

  return (
    <div className="min-h-screen bg-[#0f0d1f]">
      <div className="container mx-auto px-4 py-8">
        {/* View Toggle - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <button
            onClick={() => setActiveView('yield')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'yield'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Yield</span>
          </button>
          <button
            onClick={() => setActiveView('general')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'general'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">General</span>
          </button>
          <button
            onClick={() => setActiveView('spectral')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'spectral'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Brain className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Spectral</span>
          </button>
          <button
            onClick={() => setActiveView('cannabis')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'cannabis'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Leaf className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Cannabis</span>
          </button>
          <button
            onClick={() => setActiveView('nutrition')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'nutrition'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Apple className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Nutrition</span>
          </button>
          <button
            onClick={() => setActiveView('functional')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'functional'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Beaker className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Functional</span>
          </button>
        </div>

        {/* Content */}
        {activeView === 'yield' ? (
          <InteractiveYieldDashboard />
        ) : activeView === 'general' ? (
          <AdvancedAnalyticsDashboard />
        ) : activeView === 'spectral' ? (
          <SpectralCorrelationDashboard />
        ) : activeView === 'cannabis' ? (
          <CannabisCompoundAnalysis />
        ) : activeView === 'nutrition' ? (
          <ProduceNutritionAnalytics />
        ) : activeView === 'functional' ? (
          <FunctionalFoodResearch />
        ) : (
          <InteractiveYieldDashboard />
        )}
      </div>
    </div>
  )
}