'use client';

import React from 'react';
import { Sparkles, Wrench, ArrowRight } from 'lucide-react';

const EmergencyMaintenancePage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Wrench className="h-12 w-12 text-orange-400 animate-pulse" />
              <Sparkles className="h-16 w-16 text-purple-400" />
              <Wrench className="h-12 w-12 text-orange-400 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Advanced Design Studio
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Professional cultivation space design tools
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm">
              <Wrench className="h-4 w-4" />
              System Optimization In Progress
            </div>
          </div>

          {/* Main Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold mb-4 text-orange-400">
                🔧 Temporary Maintenance Mode
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                We're currently optimizing our advanced design platform for better performance and reliability. 
                This upgrade will provide you with faster loading times and enhanced stability.
              </p>
              
              {/* Progress indicator */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full animate-pulse" style={{width: '85%'}}></div>
              </div>
              <p className="text-sm text-gray-400">
                Optimization: 85% Complete • Estimated completion: 2-4 hours
              </p>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-6 border border-green-700/30 hover:border-green-600/50 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-400">Quick Designer</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Access our streamlined design interface for basic layouts and lighting calculations while we complete the advanced platform upgrade.
              </p>
              <a 
                href="/designer" 
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 group-hover:scale-105"
              >
                Launch Quick Designer
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-blue-400">Smart Calculators</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Use our comprehensive lighting, energy, and DLI calculators to plan your cultivation space requirements.
              </p>
              <a 
                href="/calculators" 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 group-hover:scale-105"
              >
                Open Calculators
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contact Option */}
          <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-purple-700/30 text-center">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">
                💡 Need Advanced Features Now?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our design team is available for priority consultation and custom professional layouts. 
                We can provide immediate assistance while the platform completes its optimization.
              </p>
            </div>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Contact Design Team
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-400 text-sm">
            <p>Thank you for your patience as we enhance your VibeLux experience.</p>
            <p className="mt-2">Questions? Email us at support@vibelux.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMaintenancePage;