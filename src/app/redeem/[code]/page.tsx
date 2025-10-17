'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Gift, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';

interface PromoCodeInfo {
  code: string;
  description: string;
  credits: number;
  isValid: boolean;
  isExpired: boolean;
  isUsed: boolean;
  isMaxedOut: boolean;
  expiresAt: string;
  remainingUses: number;
}

export default function RedeemPromoCode({ params }: { params: { code: string } }) {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [promoInfo, setPromoInfo] = useState<PromoCodeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkPromoCode();
  }, [params.code]);

  const checkPromoCode = async () => {
    try {
      const response = await fetch(`/api/promo-codes/${params.code}/check`);
      const data = await response.json();
      
      if (response.ok) {
        setPromoInfo(data.promoCode);
        
        // Track the click/view
        await fetch(`/api/promo-codes/${params.code}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' })
        });
      } else {
        setError(data.error || 'Invalid promo code');
      }
    } catch (error) {
      logger.error('system', 'Error checking promo code:', error );
      setError('Failed to check promo code');
    } finally {
      setLoading(false);
    }
  };

  const redeemCode = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setRedeeming(true);
    setError('');

    try {
      const response = await fetch(`/api/promo-codes/${params.code}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        setRedeemed(true);
        
        // Track successful redemption
        await fetch(`/api/promo-codes/${params.code}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'redeem' })
        });
      } else {
        setError(data.error || 'Failed to redeem code');
      }
    } catch (error) {
      logger.error('system', 'Error redeeming code:', error );
      setError('Failed to redeem code');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Checking promo code...</p>
        </div>
      </div>
    );
  }

  if (error || !promoInfo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Promo Code</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign Up for VibeLux
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (redeemed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Credits Redeemed!</h1>
          <p className="text-gray-400 mb-2">You've successfully redeemed</p>
          <p className="text-3xl font-bold text-purple-400 mb-6">{promoInfo.credits} Credits</p>
          <p className="text-gray-400 mb-8">Your credits are ready to use for AI-powered facility design and optimization!</p>
          
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Using Credits
            </Link>
            <Link
              href="/design"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try AI Designer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canRedeem = promoInfo.isValid && !promoInfo.isExpired && !promoInfo.isUsed && !promoInfo.isMaxedOut;

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 text-center">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full text-sm font-medium text-purple-400 mb-4">
                <Sparkles className="w-4 h-4" />
                Promo Code
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {promoInfo.credits} Free Credits!
              </h1>
              <p className="text-gray-400">{promoInfo.description}</p>
            </div>

            {/* Promo Code */}
            <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-400 mb-1">Promo Code</div>
              <div className="text-2xl font-mono font-bold text-purple-400">{promoInfo.code}</div>
            </div>

            {/* Status */}
            {!canRedeem && (
              <div className="mb-6">
                {promoInfo.isExpired && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>This code has expired</span>
                  </div>
                )}
                {promoInfo.isUsed && (
                  <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>You've already used this code</span>
                  </div>
                )}
                {promoInfo.isMaxedOut && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>This code has reached its usage limit</span>
                  </div>
                )}
              </div>
            )}

            {/* What you can do with credits */}
            <div className="text-left mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Use your credits for:</h3>
              <div className="space-y-2">
                {[
                  'AI-powered facility design',
                  'Advanced lighting optimization',
                  'Energy efficiency analysis',
                  'Yield prediction modeling',
                  'Equipment recommendations'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-400">
                    <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {canRedeem ? (
              <div className="space-y-3">
                {isSignedIn ? (
                  <button
                    onClick={redeemCode}
                    disabled={redeeming}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {redeeming ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        Redeem {promoInfo.credits} Credits
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <Link
                      href={`/sign-up?redirect=${encodeURIComponent(window.location.pathname)}`}
                      className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all text-center"
                    >
                      Sign Up to Redeem
                    </Link>
                    <Link
                      href={`/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`}
                      className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all text-center"
                    >
                      Already have an account? Sign In
                    </Link>
                  </>
                )}
                
                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/sign-up"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
              >
                Sign Up for VibeLux
              </Link>
            )}

            {/* Footer info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Expires: {new Date(promoInfo.expiresAt).toLocaleDateString()}</span>
                <span>{promoInfo.remainingUses} uses remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}