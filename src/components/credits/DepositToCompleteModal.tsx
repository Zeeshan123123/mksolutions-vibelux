'use client';

import { useState } from 'react';
import { AlertCircle, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useCreditStore } from '@/store/credit-store';
import { loadStripe } from '@stripe/stripe-js';
import { logger } from '@/lib/client-logger';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DepositToCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  creditsNeeded: number;
  operationName: string;
  progress: number;
}

export function DepositToCompleteModal({
  isOpen,
  onClose,
  onResume,
  creditsNeeded,
  operationName,
  progress
}: DepositToCompleteModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { credits, refreshCredits } = useCreditStore();
  
  if (!isOpen) return null;

  // Calculate recommended package based on credits needed
  const recommendedPackage = creditsNeeded <= 100 ? 'starter' : 
                            creditsNeeded <= 500 ? 'growth' :
                            creditsNeeded <= 1000 ? 'pro' : 'enterprise';

  const handleQuickPurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Create checkout session for exact amount needed
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId: recommendedPackage,
          returnUrl: window.location.href,
          metadata: {
            purpose: 'complete_operation',
            operationName,
            creditsNeeded
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Redirect to checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('system', 'Quick purchase error:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseExistingCredits = async () => {
    await refreshCredits();
    if (credits.available >= creditsNeeded) {
      onResume();
    } else {
      alert(`You still need ${creditsNeeded - credits.available} more credits.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              Additional Credits Required
            </h2>
            <p className="text-gray-400 mb-4">
              Your {operationName} is {progress}% complete.
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">To complete this operation:</div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{creditsNeeded}</div>
                  <div className="text-xs text-gray-500">credits needed</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{credits.available}</div>
                  <div className="text-xs text-gray-500">your balance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleQuickPurchase}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Deposit {creditsNeeded} Credits & Continue
                </>
              )}
            </button>

            <button
              onClick={handleUseExistingCredits}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              I've Already Purchased Credits
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white font-medium py-3 px-4 transition-colors"
            >
              Cancel Operation
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your progress has been saved. You can resume anytime after purchasing credits.
          </p>
        </div>
      </div>
    </div>
  );
}