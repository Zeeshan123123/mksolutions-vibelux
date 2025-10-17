'use client';

import React, { useState, useEffect } from 'react';
// Icons removed - previously imported: Mail, Leaf, Zap, Building
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { logger } from '@/lib/client-logger';

export function ComingSoonOverlay() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      logger.info('system', 'ComingSoonOverlay - Starting admin check...', { data: {
        isLoaded, userId, isSignedIn
      }});

      // Wait for Clerk to fully load and have a user
      if (!isLoaded) {
        logger.info('system', 'ComingSoonOverlay - Clerk not loaded yet');
        return;
      }

      // If no user is logged in, show the overlay
      if (!userId || !isSignedIn) {
        logger.info('system', 'ComingSoonOverlay - No user logged in');
        setLoading(false);
        return;
      }

      // Wait a bit more to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        // For now, default to not admin to simplify the component
        // This can be enhanced later with proper user role checking
        const adminStatus = false;
        
        logger.info('system', 'ComingSoonOverlay - Admin check result:', { data: {
          adminStatus
        } });
        
        setIsAdmin(adminStatus);
      } catch (error) {
        logger.error('system', 'ComingSoonOverlay - Failed to check admin status:', error );
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [isLoaded, userId, isSignedIn]);

  // Only hide overlay for admin users (blake@vibelux.ai)
  if (loading) {
    return null; // Loading state
  }

  if (isAdmin) {
    return null; // Hide overlay for admin users only
  }
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 z-[99999] overflow-y-auto">
      {/* Background Pattern - Hidden on mobile for performance */}
      <div className="absolute inset-0 opacity-10 hidden md:block">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 border-2 border-purple-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-amber-400 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Add top spacing for mobile to center content initially but allow scrolling */}
        <div className="h-16 md:h-0"></div>

        {/* VibeLux Logo */}
        <div className="flex justify-center mb-8 md:mb-12">
          <Image
            src="/vibelux-logo.png"
            alt="VibeLux"
            width={1600}
            height={480}
            className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto max-w-[90vw]"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-4 md:mb-8 font-light px-2">
          Advanced Horticultural Lighting Intelligence Platform
        </p>

        {/* Coming Soon Message */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 md:p-8 mb-4 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
            Coming Soon
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 md:mb-6 leading-relaxed">
            We're preparing a platform that helps you reduce costs, increase yields, and manage 
            your operation with confidence. Built by growers, for growers.
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Smart Design Tools</h3>
              <p className="text-xs md:text-sm text-gray-400">AI-powered lighting design and optimization</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Facility Management</h3>
              <p className="text-xs md:text-sm text-gray-400">Complete greenhouse and indoor farm control</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Plant Biology</h3>
              <p className="text-xs md:text-sm text-gray-400">Science-based growing optimization</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 md:p-8">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            {/* Mail icon removed */}
            <h3 className="text-xl md:text-2xl font-bold text-white">Get in Touch</h3>
          </div>
          
          <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
            Interested in early access or have questions? We'd love to hear from you!
          </p>
          
          <a 
            href="mailto:blake@vibelux.ai"
            className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base"
          >
            {/* Mail icon removed */}
            blake@vibelux.ai
          </a>
          
          <p className="text-xs md:text-sm text-gray-400 mt-3 md:mt-4 px-4">
            Whether you're a grower, facility manager, researcher, or technology partner, 
            we want to connect with you.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 md:mt-8 text-center pb-8">
          <p className="text-gray-500 text-xs md:text-sm">
            © 2025 VibeLux. Revolutionizing horticultural lighting intelligence.
          </p>
        </div>
        
        {/* Add bottom spacing to ensure all content is accessible */}
        <div className="h-16 md:h-0"></div>
      </div>

      {/* Floating Elements - Smaller and fewer on mobile */}
      <div className="absolute top-10 left-10 w-1 h-1 md:w-2 md:h-2 bg-green-400 rounded-full animate-ping hidden sm:block"></div>
      <div className="absolute top-32 right-16 w-1 h-1 md:w-2 md:h-2 bg-blue-400 rounded-full animate-ping hidden sm:block" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-16 left-16 w-1 h-1 md:w-2 md:h-2 bg-purple-400 rounded-full animate-ping hidden md:block" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-32 right-32 w-1 h-1 md:w-2 md:h-2 bg-amber-400 rounded-full animate-ping hidden md:block" style={{ animationDelay: '6s' }}></div>
    </div>
  );
}