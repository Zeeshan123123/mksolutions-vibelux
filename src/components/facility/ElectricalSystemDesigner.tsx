'use client';

import React, { useState } from 'react';
import { Zap, AlertTriangle, Activity, Settings } from 'lucide-react';

interface ElectricalSystemDesignerProps {
  facilityData?: any;
  onUpdate?: (data: any) => void;
}

export function ElectricalSystemDesigner({ 
  facilityData, 
  onUpdate 
}: ElectricalSystemDesignerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Electrical System Design</h2>
            <p className="text-gray-400">Professional electrical system configuration</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {['overview', 'panels', 'circuits', 'analysis'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px] bg-gray-700/50 rounded-lg p-6">
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Electrical System Designer
          </h3>
          <p className="text-gray-400">
            Professional electrical system design features coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ElectricalSystemDesigner;