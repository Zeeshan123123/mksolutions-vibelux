'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  ArrowLeft,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AffiliateConnectPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{
    connected: boolean;
    verified: boolean;
    accountId?: string;
  } | null>(null);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await fetch('/api/affiliate/connect/status');
      if (response.ok) {
        const data = await response.json();
        setAccountStatus(data);
      }
    } catch (error) {
      console.error('Failed to check account status:', error);
    }
  };

  const handleConnect = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/connect/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: 'individual', // Default for now
          country: 'US'
        })
      });

      const data = await response.json();

      if (response.ok && data.onboardingUrl) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.onboardingUrl;
      } else {
        toast.error(data.error || 'Failed to create payment account');
      }
    } catch (error) {
      toast.error('Failed to create payment account');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboard = async () => {
    try {
      const response = await fetch('/api/affiliate/connect/dashboard');
      const data = await response.json();

      if (response.ok && data.dashboardUrl) {
        window.open(data.dashboardUrl, '_blank');
      } else {
        toast.error('Failed to open dashboard');
      }
    } catch (error) {
      toast.error('Failed to open dashboard');
    }
  };

  if (!accountStatus) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Setup</h1>
              <p className="text-gray-400 mt-1">Connect your bank account to receive payouts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {/* Status Card */}
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-full ${
                accountStatus.verified 
                  ? 'bg-green-900/20 text-green-400' 
                  : accountStatus.connected
                  ? 'bg-yellow-900/20 text-yellow-400'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {accountStatus.verified ? (
                  <CheckCircle className="w-6 h-6" />
                ) : accountStatus.connected ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <CreditCard className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {accountStatus.verified 
                    ? 'Payment Account Active' 
                    : accountStatus.connected
                    ? 'Verification Required'
                    : 'Payment Account Required'
                  }
                </h2>
                <p className="text-gray-400 mt-1">
                  {accountStatus.verified 
                    ? 'Your account is verified and ready to receive payouts'
                    : accountStatus.connected
                    ? 'Please complete your account verification'
                    : 'Connect your bank account to start receiving commission payouts'
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {!accountStatus.connected ? (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Connect Bank Account
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDashboard}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Manage Account
                  </button>
                  {!accountStatus.verified && (
                    <button
                      onClick={handleConnect}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Complete Verification
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Information */}
            <div className="mt-8 p-6 bg-gray-800/50 rounded-lg">
              <h3 className="font-semibold text-white mb-3">What you need to know:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  Payouts are processed monthly on the 15th
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  Minimum payout amount is $50
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  A 2.5% platform fee is deducted from gross commissions
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  Your tax information will be required for 1099 reporting
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  Bank transfers typically take 2-5 business days
                </li>
              </ul>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-400 font-medium">Secure Payment Processing</p>
                  <p className="text-sm text-blue-300 mt-1">
                    We use Stripe Connect to securely handle all payment processing. 
                    Your banking information is encrypted and never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-white mb-3">Need Help?</h3>
          <p className="text-gray-400 text-sm mb-4">
            If you have questions about setting up your payment account or need assistance 
            with verification, our support team is here to help.
          </p>
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
            Contact Affiliate Support →
          </button>
        </div>
      </div>
    </div>
  );
}