'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname, useSearchParams } from 'next/navigation';
import { pixelTracker, trackPageView } from '@/lib/marketing/pixelTracking';
import { retargetingManager } from '@/lib/marketing/retargetingCampaigns';
import { cartRecoveryManager, trackCartAbandonment } from '@/lib/marketing/abandonedCartRecovery';

interface MarketingInitializerProps {
  children: React.ReactNode;
}

export function MarketingInitializer({ children }: MarketingInitializerProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize marketing systems
  useEffect(() => {
    const initializeMarketing = async () => {
      try {
        // Initialize pixel tracking
        await pixelTracker.initializePixels();
        
        // Initialize retargeting campaigns
        retargetingManager.initializeRetargetingAudiences();
        retargetingManager.initializeCampaignTriggers();
        
        // Initialize cart recovery
        cartRecoveryManager.initializeRecoveryTemplates();
        
        console.log('🚀 Marketing systems initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing marketing systems:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initializeMarketing();
    }
  }, []);

  // Set user identification when user loads
  useEffect(() => {
    if (isLoaded && user) {
      const userInfo = {
        email: user.emailAddresses[0]?.emailAddress,
        phone: user.phoneNumbers[0]?.phoneNumber,
        first_name: user.firstName,
        last_name: user.lastName,
        external_id: user.id,
        subscription_tier: user.publicMetadata?.subscriptionTier as string || 'free',
        user_role: user.publicMetadata?.role as string || 'user'
      };

      // Set user identification for pixel tracking
      pixelTracker.setUserIdentification(userInfo);
      
      console.log('✅ User identification set for marketing pixels');
    }
  }, [user, isLoaded]);

  // Track page views and user activity
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track page view
    trackPageView();

    // Track user activity for retargeting
    const trackUserActivity = async () => {
      const userActivity = {
        pages_visited: [pathname],
        last_visit: new Date().toISOString(),
        visit_count: parseInt(localStorage.getItem('vibelux_visit_count') || '0') + 1,
        session_id: JSON.parse(localStorage.getItem('vibelux_session') || '{}').session_id,
        utm_source: searchParams.get('utm_source'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_medium: searchParams.get('utm_medium'),
        time_on_site: 0, // Will be updated by scroll/time tracking
        events_completed: JSON.parse(localStorage.getItem('vibelux_events_completed') || '[]'),
        subscription_tier: user?.publicMetadata?.subscriptionTier || 'free',
        user_role: user?.publicMetadata?.role || 'user'
      };

      // Update visit count
      localStorage.setItem('vibelux_visit_count', userActivity.visit_count.toString());

      // Check for retargeting opportunities
      if (user) {
        const userInfo = {
          user_id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
          subscription_tier: user.publicMetadata?.subscriptionTier as string || 'free',
          user_role: user.publicMetadata?.role as string || 'user',
          company: user.publicMetadata?.company as string,
          industry: user.publicMetadata?.industry as string,
          last_login: new Date().toISOString()
        };

        await retargetingManager.triggerRetargetingCampaigns(userActivity, userInfo);
      }
    };

    // Delay activity tracking to avoid blocking page load
    const timeoutId = setTimeout(trackUserActivity, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams, user]);

  // Track time on page
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();

    const trackTimeOnPage = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      // Track significant time milestones
      if (timeOnPage === 30) {
        pixelTracker.trackEvent('time_on_page_30s', { 
          data: { page: pathname, time_seconds: 30 } 
        });
      } else if (timeOnPage === 60) {
        pixelTracker.trackEvent('time_on_page_1m', { 
          data: { page: pathname, time_seconds: 60 } 
        });
      } else if (timeOnPage === 120) {
        pixelTracker.trackEvent('time_on_page_2m', { 
          data: { page: pathname, time_seconds: 120 } 
        });
      }
    };

    // Track time on page every 30 seconds
    const interval = setInterval(trackTimeOnPage, 30000);

    // Track when user leaves page
    const handleBeforeUnload = () => {
      const finalTimeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      // Update user activity with final time on page
      const storedActivity = JSON.parse(localStorage.getItem('vibelux_user_activity') || '{}');
      storedActivity.time_on_site = (storedActivity.time_on_site || 0) + finalTimeOnPage;
      localStorage.setItem('vibelux_user_activity', JSON.stringify(storedActivity));
      
      // Track page exit
      navigator.sendBeacon('/api/analytics/track-event', JSON.stringify({
        event: 'page_exit',
        data: {
          page: pathname,
          time_on_page: finalTimeOnPage,
          user_id: user?.id,
          timestamp: new Date().toISOString()
        }
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Track time when component unmounts
    };
  }, [pathname, user]);

  // Track cart abandonment when user leaves checkout/pricing pages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isCheckoutPage = pathname.includes('/checkout') || pathname.includes('/pricing');
    if (!isCheckoutPage) return;

    const handleCartAbandonment = async () => {
      // Check if user has items in cart or was on pricing page
      const cartData = JSON.parse(localStorage.getItem('vibelux_cart') || 'null');
      const pricingSelection = JSON.parse(localStorage.getItem('vibelux_pricing_selection') || 'null');

      if (cartData || (pricingSelection && pathname.includes('/pricing'))) {
        const sessionData = JSON.parse(localStorage.getItem('vibelux_session') || '{}');
        
        // Create cart data for abandonment tracking
        const abandonmentData = {
          user_id: user?.id,
          session_id: sessionData.session_id,
          email: user?.emailAddresses[0]?.emailAddress,
          phone: user?.phoneNumbers[0]?.phoneNumber,
          first_name: user?.firstName,
          last_name: user?.lastName,
          items: cartData?.items || [{
            id: pricingSelection?.plan || 'professional',
            name: `${pricingSelection?.plan || 'Professional'} Plan`,
            price: pricingSelection?.price || 99,
            currency: 'USD',
            quantity: 1,
            plan_type: pricingSelection?.plan || 'professional',
            billing_cycle: pricingSelection?.billing || 'monthly'
          }],
          utm_data: {
            utm_source: searchParams.get('utm_source'),
            utm_campaign: searchParams.get('utm_campaign'),
            utm_medium: searchParams.get('utm_medium')
          },
          page_source: pathname,
          device_info: {
            device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            location: sessionData.location
          }
        };

        // Only track if user spent significant time on page
        const timeOnPage = performance.now();
        if (timeOnPage > 10000) { // More than 10 seconds
          await trackCartAbandonment(abandonmentData);
        }
      }
    };

    // Track abandonment when user navigates away or closes tab
    const handleBeforeUnload = () => {
      handleCartAbandonment();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, searchParams, user]);

  // Track scroll depth for engagement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let maxScrollDepth = 0;
    const scrollDepthThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
      }

      // Track scroll depth milestones
      scrollDepthThresholds.forEach(threshold => {
        if (scrollDepth >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          pixelTracker.trackEvent('scroll_depth', {
            data: {
              page: pathname,
              depth_percentage: threshold,
              max_depth: maxScrollDepth
            }
          });
        }
      });
    };

    const throttledScroll = throttle(handleScroll, 1000);
    window.addEventListener('scroll', throttledScroll);

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [pathname]);

  return <>{children}</>;
}

// Utility function to throttle scroll events
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}