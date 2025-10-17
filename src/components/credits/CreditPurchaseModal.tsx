'use client';

import { useState } from 'react';
import { X, CreditCard, Zap, Star, ShieldCheck } from 'lucide-react';
import { CREDIT_PACKAGES } from '@/lib/pricing/unified-pricing';
import { useCreditStore } from '@/store/credit-store';
import { loadStripe } from '@stripe/stripe-js';
import { logger } from '@/lib/client-logger';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditPurchaseModal({ isOpen, onClose }: CreditPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { credits, refreshCredits } = useCreditStore();

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage }),
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
      logger.error('system', 'Purchase error:', error );
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
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
        <div className="relative bg-gray-900 rounded-xl max-w-4xl w-full p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-purple-400" />
                Purchase Credits
              </h2>
              <p className="text-gray-400 mt-1">
                Current balance: {credits.available} credits
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Credit Packages */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {CREDIT_PACKAGES.map((pkg) => {
              const totalCredits = pkg.credits + (pkg.credits * pkg.bonus / 100);
              const isSelected = selectedPackage === pkg.id;
              
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative bg-gray-800 rounded-lg p-4 text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-purple-600 bg-gray-800/80'
                      : 'hover:bg-gray-800/80'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-white">
                      {totalCredits.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">credits</div>
                    
                    {pkg.bonus > 0 && (
                      <div className="text-green-400 text-sm mt-1">
                        +{pkg.bonus}% bonus
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-white">${pkg.price}</div>
                    <div className="text-xs text-gray-500">
                      ${(pkg.price / totalCredits).toFixed(3)}/credit
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-purple-600 rounded-lg pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Credit Usage Examples */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-white mb-3">What can you do with credits?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium mb-1">AI Designer</div>
                <ul className="space-y-1 text-gray-400">
                  <li>• Simple design: 10 credits</li>
                  <li>• Complex layout: 25 credits</li>
                  <li>• Full optimization: 50 credits</li>
                </ul>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Reports & Analytics</div>
                <ul className="space-y-1 text-gray-400">
                  <li>• Basic report: 5 credits</li>
                  <li>• Detailed analysis: 10 credits</li>
                  <li>• Custom report: 20 credits</li>
                </ul>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Advanced Features</div>
                <ul className="space-y-1 text-gray-400">
                  <li>• API calls: 1 credit each</li>
                  <li>• Simulations: 5-50 credits</li>
                  <li>• Batch operations: varies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure payment via Stripe</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage || isProcessing}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedPackage && !isProcessing
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Purchase Credits'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}