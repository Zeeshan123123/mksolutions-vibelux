'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Shield,
  ArrowUpRight
} from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';

interface SubscriptionManagerProps {
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null;
  stripeCustomerId: string | null;
}

export function SubscriptionManager({ subscription, stripeCustomerId }: SubscriptionManagerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!stripeCustomerId) {
      toast.error('No active subscription found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      logger.error('system', 'Error opening customer portal:', error );
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-green-400">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'trialing':
        return (
          <span className="flex items-center gap-1 text-blue-400">
            <Shield className="w-4 h-4" />
            Trial
          </span>
        );
      case 'canceled':
      case 'incomplete':
        return (
          <span className="flex items-center gap-1 text-red-400">
            <XCircle className="w-4 h-4" />
            {status === 'canceled' ? 'Canceled' : 'Incomplete'}
          </span>
        );
      case 'past_due':
        return (
          <span className="flex items-center gap-1 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            Past Due
          </span>
        );
      default:
        return <span className="text-gray-400">{status}</span>;
    }
  };

  if (!subscription || !stripeCustomerId) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
          <p className="text-gray-400 mb-6">
            Choose a plan to unlock all features and start optimizing your cultivation facility.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            View Plans
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const currentPlan = Object.values(PRICING_PLANS).find(p => p.id === subscription.plan);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Current Plan</h3>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">
                {currentPlan?.name || subscription.plan}
              </span>
              {getStatusBadge(subscription.status)}
            </div>
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Manage Subscription
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Billing Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Current Period Ends</span>
            </div>
            <span className="text-white">
              {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
            </span>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Subscription Ending</p>
                  <p className="text-gray-300 text-sm mt-1">
                    Your subscription will end on {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}. 
                    You can reactivate anytime before this date.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Features */}
      {currentPlan && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <p className="text-gray-400 text-sm mb-4">
          Manage your subscription, payment methods, and invoices through the Stripe Customer Portal.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Update Payment Method
          </button>
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Download Invoices
          </button>
          {!subscription.cancelAtPeriodEnd && subscription.plan !== 'business' && (
            <button
              onClick={() => router.push('/pricing')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">Secure Billing</p>
            <p className="text-gray-300 text-sm mt-1">
              All payment information is securely processed by Stripe. VibeLux never stores your credit card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}