'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Zap, 
  Building, 
  Gauge,
  Mail,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';

interface ComingSoonPageProps {
  children: React.ReactNode;
}

export function ComingSoonPage({ children }: ComingSoonPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  // Admin whitelist - add your admin emails here
  const ADMIN_EMAILS = [
    'admin@vibelux.com',
    'blake@vibelux.com',
    'demo@vibelux.com',
    'blake.lange@example.com', // Add your actual email here
    // Add more admin emails as needed
  ];

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if user is admin by email or role
      const userEmail = user.primaryEmailAddress?.emailAddress || '';
      const isWhitelisted = ADMIN_EMAILS.includes(userEmail);
      const hasAdminRole = user.publicMetadata?.role === 'ADMIN';
      
      setIsAdmin(isWhitelisted || hasAdminRole);
      setLoading(false);
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // If admin, show the actual application
  if (isAdmin) {
    return <>{children}</>;
  }

  // Otherwise show coming soon page
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 w-full">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-2xl shadow-purple-500/20">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              LAUNCHING SOON
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              The Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {" "}Cultivation Management
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Complete operations platform for commercial growers. Daily management, 
              inventory control, compliance automation, and energy optimization.
            </p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-12">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <Gauge className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Daily Operations</h3>
              <p className="text-gray-400 text-sm">
                Complete shift management, task workflows, and harvest tracking
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <Building className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
              <p className="text-gray-400 text-sm">
                AI-powered insights and predictive maintenance alerts
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <Zap className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Energy Optimization</h3>
              <p className="text-gray-400 text-sm">
                Reduce energy costs with intelligent automation
              </p>
            </div>
          </div>

          {/* Email signup */}
          {!subscribed ? (
            <div className="mt-8 md:mt-12 px-4">
              <p className="text-gray-400 mb-4">Be the first to know when we launch</p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await fetch('/api/waitlist/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email })
                    });
                    const data = await response.json();
                    if (data.subscribed) {
                      setSubscribed(true);
                    }
                  } catch (error) {
                    logger.error('system', 'Subscription error:', error );
                    setSubscribed(true); // Show success anyway
                  }
                }}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full sm:w-auto"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  Get Early Access
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-8 md:mt-12 p-6 bg-green-900/20 border border-green-600/50 rounded-xl">
              <p className="text-green-400 font-semibold">
                ✓ You're on the list! We'll notify you as soon as we launch.
              </p>
            </div>
          )}

          {/* Admin login button */}
          <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-gray-800">
            {!showLogin ? (
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-600 hover:text-gray-400 text-sm flex items-center gap-2 mx-auto transition-colors"
              >
                <Lock className="w-3 h-3" />
                Admin Access
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Admin Demo Access</p>
                {isSignedIn ? (
                  <div className="space-y-3">
                    <p className="text-yellow-400 text-sm">
                      Not authorized. Please sign in with an admin account.
                    </p>
                    <Link href="/sign-in">
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                        Sign in with different account
                      </button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/sign-in">
                    <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                      Sign in as Admin
                    </button>
                  </Link>
                )}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-600 hover:text-gray-400 text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-6 text-center border-t border-gray-800">
        <p className="text-gray-600 text-sm">
          © 2024 VibeLux. Built for commercial cultivators.
        </p>
      </div>
    </div>
  );
}