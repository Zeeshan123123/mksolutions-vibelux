'use client';

import React from 'react';
import { BarChart3, Database, Zap, FileText } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';

interface UsageMetricsProps {
  tier: string;
  usage: {
    projects: number;
    savedDesigns: number;
    apiCalls: number;
    storage: number; // in MB
  };
}

export function UsageMetrics({ tier, usage }: UsageMetricsProps) {
  const plan = PRICING_PLANS[tier as keyof typeof PRICING_PLANS] || PRICING_PLANS.free;
  
  const getUsagePercentage = (used: number, limit: number | string) => {
    if (limit === -1 || limit === 'Unlimited') return 0;
    if (typeof limit === 'number' && limit > 0) {
      return Math.min((used / limit) * 100, 100);
    }
    return 0;
  };

  const formatLimit = (limit: number | string) => {
    if (limit === -1) return 'Unlimited';
    return limit.toString();
  };

  const metrics = [
    {
      name: 'Projects',
      icon: FileText,
      used: usage.projects,
      limit: plan.limitations?.rooms || 'Unlimited',
      color: 'blue'
    },
    {
      name: 'Saved Designs',
      icon: BarChart3,
      used: usage.savedDesigns,
      limit: plan.limitations?.savedDesigns || 'Unlimited',
      color: 'green'
    },
    {
      name: 'AI Queries',
      icon: Zap,
      used: usage.apiCalls,
      limit: plan.limitations?.aiQueries || 5,
      color: 'purple',
      period: 'month'
    },
    {
      name: 'Storage',
      icon: Database,
      used: Math.round(usage.storage / 1024), // Convert to GB
      limit: 100, // 100 GB default
      unit: 'GB',
      color: 'orange'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Usage Overview</h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => {
          const percentage = getUsagePercentage(metric.used, metric.limit);
          const Icon = metric.icon;
          
          return (
            <div key={metric.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${metric.color}-400`} />
                  <span className="text-sm text-gray-300">{metric.name}</span>
                </div>
                <span className="text-sm text-white">
                  {metric.used} / {formatLimit(metric.limit)} {metric.unit || ''}
                  {metric.period && <span className="text-gray-500">/{metric.period}</span>}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${metric.color}-500 transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {percentage > 80 && (
                <p className="text-xs text-yellow-400 mt-1">
                  {percentage >= 100 ? 'Limit reached' : `${Math.round(100 - percentage)}% remaining`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {tier === 'free' && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">
            Upgrade to increase your limits
          </p>
          <a
            href="/pricing"
            className="text-xs text-green-400 hover:text-green-300"
          >
            View upgrade options →
          </a>
        </div>
      )}
    </div>
  );
}