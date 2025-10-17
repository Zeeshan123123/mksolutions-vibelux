'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Shield, 
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[];
  customerId: string;
  onUpdate?: () => void;
}

export function PaymentMethodManager({ 
  paymentMethods: initialMethods, 
  customerId,
  onUpdate 
}: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddPaymentMethod = async () => {
    try {
      setIsLoading(true);
      
      // Create a setup session for adding payment method
      const response = await fetch('/api/stripe/create-setup-intent', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Redirect to Stripe's payment method collection
      const { error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method_data: {
          billing_details: {
            // You can pre-fill billing details here if available
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Refresh payment methods
      await refreshPaymentMethods();
      toast.success('Payment method added successfully');
    } catch (error) {
      logger.error('system', 'Error adding payment method:', error );
      toast.error('Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setDeletingId(paymentMethodId);
      
      const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }

      // Update local state
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      toast.success('Payment method removed');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      logger.error('system', 'Error removing payment method:', error );
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}/set-default`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }

      // Update local state
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        is_default: pm.id === paymentMethodId
      })));
      
      toast.success('Default payment method updated');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      logger.error('system', 'Error setting default payment method:', error );
      toast.error('Failed to update default payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPaymentMethods = async () => {
    try {
      const response = await fetch('/api/stripe/payment-methods');
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const methods = await response.json();
      setPaymentMethods(methods);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      logger.error('system', 'Error refreshing payment methods:', error );
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // In a real app, you'd have brand-specific icons
    return <CreditCard className="w-8 h-6 text-gray-400" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
        <button
          onClick={handleAddPaymentMethod}
          disabled={isLoading}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Payment Method
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No payment methods added yet</p>
          <button
            onClick={handleAddPaymentMethod}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                  {getCardBrandIcon(method.card.brand)}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• {method.card.last4}
                  </p>
                  <p className="text-sm text-gray-400">
                    Expires {method.card.exp_month}/{method.card.exp_year}
                  </p>
                </div>
                {method.is_default && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Default
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-gray-300 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleRemovePaymentMethod(method.id)}
                  disabled={deletingId === method.id}
                  className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                >
                  {deletingId === method.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">Secure Payment Processing</p>
            <p className="text-gray-300 text-sm mt-1">
              Your payment information is encrypted and securely processed by Stripe. 
              VibeLux never has access to your full card details.
            </p>
          </div>
        </div>
      </div>

      {paymentMethods.length > 0 && !paymentMethods.some(pm => pm.is_default) && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">No Default Payment Method</p>
              <p className="text-gray-300 text-sm mt-1">
                Please set a default payment method to ensure uninterrupted service.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}