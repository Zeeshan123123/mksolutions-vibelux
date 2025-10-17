'use client';

import { useEffect, useState } from 'react';
import { FileUp, AlertCircle, TrendingUp } from 'lucide-react';
import { CADUsageStats, CADUsageTracker } from '@/lib/cad-usage-tracker';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';

export function CADUsageIndicator() {
  const { user } = useUser();
  const [usage, setUsage] = useState<CADUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      if (!user) return;
      
      try {
        const subscriptionTier = user.publicMetadata?.subscriptionTier as string || 'free';
        const stats = await CADUsageTracker.getUsage(user.id, subscriptionTier);
        setUsage(stats);
      } catch (error) {
        logger.error('system', 'Failed to fetch CAD usage:', error );
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [user]);

  if (loading || !usage) {
    return null;
  }

  const percentage = usage.limit === Infinity ? 0 : (usage.used / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = usage.remaining === 0;

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileUp className="w-5 h-5 text-teal-400" />
          <h3 className="font-medium text-white">CAD Imports</h3>
        </div>
        {isNearLimit && !isAtLimit && (
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Near limit</span>
          </div>
        )}
        {isAtLimit && (
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Limit reached</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {usage.limit === Infinity ? (
          <div className="text-sm text-gray-400">
            Unlimited CAD imports
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Monthly usage</span>
              <span className="text-white font-medium">
                {usage.used} / {usage.limit}
              </span>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{usage.remaining} imports remaining</span>
              <span>Resets {new Date(usage.resetDate).toLocaleDateString()}</span>
            </div>
          </>
        )}

        {/* Supported formats */}
        <div className="pt-2 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Supported formats:</p>
          <p className="text-xs text-gray-400">
            {usage.formats[0] === 'all' 
              ? '60+ formats including DWG, Revit, IFC, SketchUp' 
              : usage.formats.map(f => f.toUpperCase()).join(', ')}
          </p>
        </div>

        {/* Upgrade prompt */}
        {isNearLimit && usage.limit !== Infinity && (
          <Link 
            href="/pricing"
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Upgrade for more imports</span>
          </Link>
        )}
      </div>
    </div>
  );
}