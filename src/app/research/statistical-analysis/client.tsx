'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/client-logger';
import { 
  ArrowLeft, BarChart3, Brain, TrendingUp, Activity, 
  Download, Upload, Play, Settings, Info, Lock,
  AlertCircle, CheckCircle, FileText, Code,
  Calculator, FlaskConical, Layers, Target
} from 'lucide-react';
import { StatisticalAnalysisDashboard } from '@/components/analytics/StatisticalAnalysisDashboard';
import StatisticalAnalysisPanel from '@/components/research/StatisticalAnalysisPanel';

export default function StatisticalAnalysisClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analysis' | 'design' | 'results'>('analysis');
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/research"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Statistical Analysis Suite</h1>
                <p className="text-gray-400 text-sm">Advanced statistical tools for research data</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistical Analysis
              </div>
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'design'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Experimental Design
              </div>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'results'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reports & Export
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Active Dataset</span>
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">Yield Trial #23</div>
                <div className="text-sm text-gray-500">1,248 observations</div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Variables</span>
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-gray-500">7 continuous, 5 categorical</div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Significance</span>
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">p &lt; 0.001</div>
                <div className="text-sm text-gray-500">Primary hypothesis</div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Power</span>
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">0.92</div>
                <div className="text-sm text-gray-500">Statistical power</div>
              </div>
            </div>
            
            {/* Analysis Dashboard */}
            <StatisticalAnalysisDashboard />
            
            {/* Statistical Analysis Panel */}
            <StatisticalAnalysisPanel 
              experimentId="example-experiment-id"
              experimentType="Factorial"
              onAnalysisComplete={(result) => {
                logger.info('system', 'Analysis completed:', { data: result });
              }}
            />
          </div>
        )}
        
        {activeTab === 'design' && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div className="text-center py-12">
              <FlaskConical className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Experimental Design Wizard</h3>
              <p className="text-gray-400 mb-6">Plan your next experiment with statistical rigor</p>
              <button
                onClick={() => router.push('/research/experiment-designer')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                Launch Design Wizard
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Export Options
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="w-8 h-8 text-blue-400" />
                    <span className="font-medium text-white">Export to R</span>
                  </div>
                  <p className="text-sm text-gray-400">Generate R script with data and analysis</p>
                </button>
                
                <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="w-8 h-8 text-green-400" />
                    <span className="font-medium text-white">Export to Python</span>
                  </div>
                  <p className="text-sm text-gray-400">Jupyter notebook with pandas/scipy</p>
                </button>
                
                <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-yellow-400" />
                    <span className="font-medium text-white">Publication Report</span>
                  </div>
                  <p className="text-sm text-gray-400">APA-formatted statistical report</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}