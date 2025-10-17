"use client"

import { useState } from 'react'
import { Camera, Upload, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export function PlantHealthImaging() {
  const [viewMode, setViewMode] = useState<'live' | 'analysis' | 'history'>('live')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Plant Health Imaging & Analysis</h2>
            <p className="text-gray-400 mt-1">AI-powered disease detection and growth monitoring</p>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('live')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'live'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Live Camera
            </button>
            <button
              onClick={() => setViewMode('analysis')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'analysis'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'live' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Camera View</h3>
            <p className="text-gray-400">Live camera functionality is temporarily unavailable</p>
          </div>
        </div>
      )}

      {viewMode === 'analysis' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="text-center py-12">
            <Info className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Plant Analysis</h3>
            <p className="text-gray-400">AI analysis functionality is being updated</p>
          </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Analysis History</h3>
            <p className="text-gray-400">Historical data view is being improved</p>
          </div>
        </div>
      )}
    </div>
  )
}