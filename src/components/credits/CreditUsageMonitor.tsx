'use client';

import { useEffect } from 'react';
import { AlertCircle, CreditCard, TrendingUp, Zap } from 'lucide-react';
import { useCreditStore, useAvailableCredits, useIsLowOnCredits, useCreditPercentage } from '@/store/credit-store';
import { useNotificationStore } from '@/store/notification-store';

export function CreditUsageMonitor() {
  const { credits, showLowCreditWarning, setShowPurchaseModal, refreshCredits } = useCreditStore();
  const availableCredits = useAvailableCredits();
  const isLowOnCredits = useIsLowOnCredits();
  const creditPercentage = useCreditPercentage();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // Refresh credits on mount
    refreshCredits();
    
    // Set up periodic refresh
    const interval = setInterval(refreshCredits, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [refreshCredits]);

  useEffect(() => {
    // Show warning when credits are low
    if (isLowOnCredits && !showLowCreditWarning) {
      addNotification({
        type: 'warning',
        title: 'Low on Credits',
        message: `You have ${availableCredits} credits remaining. Consider purchasing more.`,
        action: {
          label: 'Buy Credits',
          onClick: () => setShowPurchaseModal(true),
        },
      });
    }
  }, [isLowOnCredits, showLowCreditWarning, availableCredits, addNotification, setShowPurchaseModal]);

  const getProgressColor = () => {
    if (creditPercentage > 50) return 'bg-green-600';
    if (creditPercentage > 20) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-white">Credit Balance</h3>
        </div>
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Buy Credits
        </button>
      </div>

      <div className="space-y-3">
        {/* Available Credits */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Available</span>
          <span className="text-lg font-semibold text-white">{availableCredits}</span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
        </div>

        {/* Credit Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-500">Monthly</div>
            <div className="font-medium text-gray-300">{credits.monthlyAllocation}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-500">Purchased</div>
            <div className="font-medium text-gray-300">{credits.purchased}</div>
          </div>
        </div>

        {/* Low Credit Warning */}
        {isLowOnCredits && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-300">
              Running low on credits. Some features may be limited.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Credit Display for Headers
export function CreditBadge() {
  const availableCredits = useAvailableCredits();
  const { setShowPurchaseModal } = useCreditStore();
  const isLowOnCredits = useIsLowOnCredits();

  return (
    <button
      onClick={() => setShowPurchaseModal(true)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
        isLowOnCredits
          ? 'bg-yellow-900/20 border border-yellow-800 hover:bg-yellow-900/30'
          : 'bg-gray-800 hover:bg-gray-700'
      }`}
    >
      <Zap className={`w-4 h-4 ${isLowOnCredits ? 'text-yellow-400' : 'text-gray-400'}`} />
      <span className={`text-sm font-medium ${isLowOnCredits ? 'text-yellow-300' : 'text-gray-300'}`}>
        {availableCredits} credits
      </span>
    </button>
  );
}

// Credit Cost Indicator
interface CreditCostProps {
  action: string;
  cost: number;
  className?: string;
}

export function CreditCost({ action, cost, className = '' }: CreditCostProps) {
  const availableCredits = useAvailableCredits();
  const hasEnoughCredits = availableCredits >= cost;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Zap className={`w-4 h-4 ${hasEnoughCredits ? 'text-gray-400' : 'text-red-400'}`} />
      <span className={hasEnoughCredits ? 'text-gray-400' : 'text-red-400'}>
        {cost} credits
      </span>
      {!hasEnoughCredits && (
        <span className="text-xs text-red-400">
          (need {cost - availableCredits} more)
        </span>
      )}
    </div>
  );
}