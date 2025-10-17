'use client'

import { PlantHealthAnalyzer } from '@/components/PlantHealthAnalyzer'
import Link from 'next/link'
import { ArrowLeft, Leaf, Camera, Activity } from 'lucide-react'

export default function PlantHealthPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Plant Health Analyzer
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/design"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Design Studio
              </Link>
              <Link
                href="/calculators"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Calculators
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Banner */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                AI-Powered Plant Health Analysis
              </h1>
              <p className="text-green-100">
                Upload plant images for instant disease detection, pest identification, and care recommendations
              </p>
            </div>
            <div className="flex items-center gap-4 text-green-100">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-1" />
                <div className="text-xs">Image Upload</div>
              </div>
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-1" />
                <div className="text-xs">AI Analysis</div>
              </div>
              <div className="text-center">
                <Leaf className="w-8 h-8 mx-auto mb-1" />
                <div className="text-xs">Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Health Analyzer Component */}
        <PlantHealthAnalyzer />

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Disease Detection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify common plant diseases including blight, mold, mildew, and bacterial infections using advanced computer vision.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Health Scoring
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get an overall health score (0-100) based on visual indicators like leaf color, wilting, and growth patterns.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Care Recommendations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive actionable care recommendations based on detected issues, from watering adjustments to treatment protocols.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}