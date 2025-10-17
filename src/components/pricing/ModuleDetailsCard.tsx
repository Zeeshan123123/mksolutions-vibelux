'use client';

import React from 'react';
import { Check, Info, Star, Lock, Unlock } from 'lucide-react';
import { Module } from '@/lib/pricing/unified-pricing';

interface ModuleDetailsCardProps {
  module: Module & {
    includedInPlans?: string[];
    requiredPlan?: string;
    popularWith?: string[];
    savingsInBundle?: number;
    roiEstimate?: string;
    setupTime?: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

export function ModuleDetailsCard({ module, isSelected, onToggle }: ModuleDetailsCardProps) {
  const getPlanBadgeColor = (plan: string) => {
    const colors: Record<string, string> = {
      'Free': 'bg-gray-600',
      'Solo': 'bg-blue-600',
      'Starter': 'bg-green-600',
      'Teams': 'bg-purple-600',
      'Professional': 'bg-orange-600',
      'Enterprise': 'bg-red-600',
    };
    return colors[plan] || 'bg-gray-600';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'essential': 'text-blue-400 border-blue-400/20 bg-blue-400/10',
      'professional': 'text-purple-400 border-purple-400/20 bg-purple-400/10',
      'enterprise': 'text-orange-400 border-orange-400/20 bg-orange-400/10',
      'suite': 'text-green-400 border-green-400/20 bg-green-400/10',
      'addon': 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
    };
    return colors[category] || 'text-gray-400 border-gray-400/20 bg-gray-400/10';
  };

  const getValueProposition = (price: number) => {
    if (price < 50) return 'Budget-Friendly';
    if (price < 100) return 'Great Value';
    if (price < 200) return 'Professional';
    return 'Enterprise-Grade';
  };

  return (
    <div
      className={`border rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-purple-600 bg-purple-900/20 shadow-purple-600/20'
          : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
      }`}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="font-bold text-lg text-white">{module.name}</h3>
            {module.popularWith && module.popularWith.length > 0 && (
              <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(module.category)}`}>
              {module.category.charAt(0).toUpperCase() + module.category.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {getValueProposition(module.price)}
            </span>
          </div>

          <p className="text-sm text-gray-400">{module.description}</p>
        </div>

        {/* Price */}
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-white">${module.price}</div>
          <div className="text-xs text-gray-400">/month</div>
        </div>
      </div>

      {/* Included In Plans */}
      {module.includedInPlans && module.includedInPlans.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Unlock className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-gray-300">Included in:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {module.includedInPlans.map((plan) => (
              <span
                key={plan}
                className={`inline-flex px-2 py-1 rounded text-xs text-white font-medium ${getPlanBadgeColor(plan)}`}
              >
                {plan}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Required Plan */}
      {module.requiredPlan && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400">
              Requires {module.requiredPlan} plan or higher
            </span>
          </div>
        </div>
      )}

      {/* Key Features */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-400 mb-2">Key Features:</div>
        <ul className="space-y-1">
          {module.features.slice(0, 5).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs">
              <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        {module.features.length > 5 && (
          <button className="text-xs text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            +{module.features.length - 5} more features
          </button>
        )}
      </div>

      {/* Value Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {module.setupTime && (
          <div className="bg-gray-800/30 rounded-lg p-2">
            <div className="text-xs text-gray-500">Setup Time</div>
            <div className="text-sm font-medium text-white">{module.setupTime}</div>
          </div>
        )}
        {module.roiEstimate && (
          <div className="bg-gray-800/30 rounded-lg p-2">
            <div className="text-xs text-gray-500">ROI</div>
            <div className="text-sm font-medium text-green-400">{module.roiEstimate}</div>
          </div>
        )}
      </div>

      {/* Bundle Savings */}
      {module.savingsInBundle && module.savingsInBundle > 0 && (
        <div className="p-3 bg-green-900/20 border border-green-600/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400">Available in bundles</span>
            <span className="text-xs font-bold text-green-400">
              Save up to ${module.savingsInBundle}/mo
            </span>
          </div>
        </div>
      )}

      {/* Popular With */}
      {module.popularWith && module.popularWith.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-gray-400">
              Popular with: {module.popularWith.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Selection Indicator */}
      <div className={`mt-4 text-center py-2 rounded-lg font-medium text-sm transition-all ${
        isSelected 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}>
        {isSelected ? '✓ Selected' : 'Click to Select'}
      </div>
    </div>
  );
}