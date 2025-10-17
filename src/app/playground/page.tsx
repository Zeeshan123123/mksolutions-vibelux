'use client';

import React from 'react';
import { Cpu, Zap, Code, Terminal, Play, Settings, FileText, Database } from 'lucide-react';

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Cpu className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">VibeLux Playground</h1>
              <p className="text-gray-400">Experiment with lighting design algorithms and test platform features</p>
            </div>
          </div>
        </div>

        {/* Playground Tools */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Algorithm Testing */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Algorithm Testing</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Test lighting algorithms and calculation methods in a sandboxed environment.
            </p>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Test PPFD Algorithms
              </button>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energy Calculations
              </button>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Spectrum Analysis
              </button>
            </div>
          </div>

          {/* API Testing */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">API Testing</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Test API endpoints and data flows in a safe development environment.
            </p>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Database className="w-4 h-4" />
                Test Database Queries
              </button>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Zap className="w-4 h-4" />
                API Performance
              </button>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Mock Data Generator
              </button>
            </div>
          </div>

          {/* Feature Sandbox */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Play className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Feature Sandbox</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Preview and test upcoming features before they go live.
            </p>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Code className="w-4 h-4" />
                Beta Features
              </button>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Experimental Tools
              </button>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Debug Console
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Development Environment</h3>
              <p className="text-sm text-gray-400">
                The playground is currently in development. Full interactive testing capabilities will be available soon.
                For immediate testing needs, use the{' '}
                <a href="/calculators" className="text-yellow-400 hover:text-yellow-300">calculators page</a>
                {' '}or{' '}
                <a href="/demo" className="text-yellow-400 hover:text-yellow-300">demo tools</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}