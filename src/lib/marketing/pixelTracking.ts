/**
 * Comprehensive Pixel Tracking System
 * Supports Facebook, Google, LinkedIn, TikTok, Twitter, and custom pixels
 */

interface PixelEvent {
  event: string;
  data?: Record<string, any>;
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  custom_data?: Record<string, any>;
}

interface UserIdentification {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  external_id?: string;
  subscription_tier?: string;
  user_role?: string;
}

class PixelTrackingManager {
  private static instance: PixelTrackingManager;
  private pixels: Map<string, any> = new Map();
  private userInfo: UserIdentification = {};
  private sessionData: Record<string, any> = {};

  static getInstance(): PixelTrackingManager {
    if (!PixelTrackingManager.instance) {
      PixelTrackingManager.instance = new PixelTrackingManager();
    }
    return PixelTrackingManager.instance;
  }

  /**
   * Initialize all marketing pixels
   */
  async initializePixels(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Initialize Facebook Pixel
      await this.initializeFacebookPixel();
      
      // Initialize Google Analytics & Google Ads
      await this.initializeGooglePixels();
      
      // Initialize LinkedIn Insight Tag
      await this.initializeLinkedInPixel();
      
      // Initialize TikTok Pixel
      await this.initializeTikTokPixel();
      
      // Initialize Twitter Pixel
      await this.initializeTwitterPixel();
      
      // Initialize custom tracking
      await this.initializeCustomTracking();

      console.log('✅ All marketing pixels initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing pixels:', error);
    }
  }

  /**
   * Facebook Pixel Implementation
   */
  private async initializeFacebookPixel(): Promise<void> {
    const fbPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    if (!fbPixelId) return;

    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${fbPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Store pixel reference
    this.pixels.set('facebook', (window as any).fbq);
  }

  /**
   * Google Analytics & Google Ads
   */
  private async initializeGooglePixels(): Promise<void> {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const gadsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

    if (gaId) {
      // Google Analytics 4
      const gaScript = document.createElement('script');
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);

      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
        ${gadsId ? `gtag('config', '${gadsId}');` : ''}
      `;
      document.head.appendChild(configScript);

      this.pixels.set('google', (window as any).gtag);
    }
  }

  /**
   * LinkedIn Insight Tag
   */
  private async initializeLinkedInPixel(): Promise<void> {
    const linkedInId = process.env.NEXT_PUBLIC_LINKEDIN_INSIGHT_TAG;
    if (!linkedInId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      _linkedin_partner_id = "${linkedInId}";
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);
      })(window.lintrk);
    `;
    document.head.appendChild(script);

    this.pixels.set('linkedin', (window as any).lintrk);
  }

  /**
   * TikTok Pixel
   */
  private async initializeTikTokPixel(): Promise<void> {
    const tiktokId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    if (!tiktokId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${tiktokId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);

    this.pixels.set('tiktok', (window as any).ttq);
  }

  /**
   * Twitter Pixel
   */
  private async initializeTwitterPixel(): Promise<void> {
    const twitterId = process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID;
    if (!twitterId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
      },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
      a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
      twq('init','${twitterId}');
      twq('track','PageView');
    `;
    document.head.appendChild(script);

    this.pixels.set('twitter', (window as any).twq);
  }

  /**
   * Custom tracking for internal analytics
   */
  private async initializeCustomTracking(): Promise<void> {
    // Initialize session tracking
    this.sessionData = {
      session_id: this.generateSessionId(),
      session_start: new Date().toISOString(),
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      utm_content: new URLSearchParams(window.location.search).get('utm_content'),
      utm_term: new URLSearchParams(window.location.search).get('utm_term'),
      referrer: document.referrer,
      landing_page: window.location.pathname,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };

    // Store in localStorage for session persistence
    localStorage.setItem('vibelux_session', JSON.stringify(this.sessionData));
  }

  /**
   * Set user identification across all pixels
   */
  setUserIdentification(userInfo: UserIdentification): void {
    this.userInfo = { ...this.userInfo, ...userInfo };

    // Facebook Pixel
    if (this.pixels.has('facebook') && userInfo.email) {
      const fbq = this.pixels.get('facebook');
      fbq('init', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, {
        em: this.hashEmail(userInfo.email),
        ph: userInfo.phone ? this.hashPhone(userInfo.phone) : undefined,
        fn: userInfo.first_name ? this.hashName(userInfo.first_name) : undefined,
        ln: userInfo.last_name ? this.hashName(userInfo.last_name) : undefined,
        external_id: userInfo.external_id
      });
    }

    // Google Analytics
    if (this.pixels.has('google')) {
      const gtag = this.pixels.get('google');
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userInfo.external_id,
        custom_map: {
          subscription_tier: userInfo.subscription_tier,
          user_role: userInfo.user_role
        }
      });
    }

    // TikTok Pixel
    if (this.pixels.has('tiktok') && userInfo.email) {
      const ttq = this.pixels.get('tiktok');
      ttq.identify({
        email: userInfo.email,
        phone_number: userInfo.phone,
        external_id: userInfo.external_id
      });
    }
  }

  /**
   * Track events across all pixels
   */
  trackEvent(eventName: string, eventData: PixelEvent = {}): void {
    try {
      // Enrich event data with session info
      const enrichedData = {
        ...eventData.data,
        ...this.sessionData,
        user_info: this.userInfo,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title
      };

      // Facebook Pixel
      this.trackFacebookEvent(eventName, { ...eventData, data: enrichedData });

      // Google Analytics
      this.trackGoogleEvent(eventName, enrichedData);

      // LinkedIn
      this.trackLinkedInEvent(eventName, enrichedData);

      // TikTok
      this.trackTikTokEvent(eventName, { ...eventData, data: enrichedData });

      // Twitter
      this.trackTwitterEvent(eventName, enrichedData);

      // Custom tracking (send to our API)
      this.trackCustomEvent(eventName, enrichedData);

    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Facebook event tracking
   */
  private trackFacebookEvent(eventName: string, eventData: PixelEvent): void {
    if (!this.pixels.has('facebook')) return;

    const fbq = this.pixels.get('facebook');
    const fbEventMap: Record<string, string> = {
      page_view: 'PageView',
      view_content: 'ViewContent',
      add_to_cart: 'AddToCart',
      initiate_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      lead: 'Lead',
      complete_registration: 'CompleteRegistration',
      add_to_wishlist: 'AddToWishlist',
      search: 'Search',
      start_trial: 'StartTrial',
      subscribe: 'Subscribe'
    };

    const fbEvent = fbEventMap[eventName] || 'CustomEvent';
    
    if (fbEvent === 'CustomEvent') {
      fbq('trackCustom', eventName, eventData.data);
    } else {
      fbq('track', fbEvent, {
        value: eventData.value,
        currency: eventData.currency || 'USD',
        content_ids: eventData.content_ids,
        content_type: eventData.content_type,
        content_name: eventData.content_name,
        ...eventData.custom_data
      });
    }
  }

  /**
   * Google Analytics event tracking
   */
  private trackGoogleEvent(eventName: string, eventData: Record<string, any>): void {
    if (!this.pixels.has('google')) return;

    const gtag = this.pixels.get('google');
    gtag('event', eventName, {
      event_category: eventData.category || 'engagement',
      event_label: eventData.label,
      value: eventData.value,
      custom_parameters: eventData
    });
  }

  /**
   * LinkedIn event tracking
   */
  private trackLinkedInEvent(eventName: string, eventData: Record<string, any>): void {
    if (!this.pixels.has('linkedin')) return;

    const lintrk = this.pixels.get('linkedin');
    lintrk('track', { conversion_id: this.getLinkedInConversionId(eventName) });
  }

  /**
   * TikTok event tracking
   */
  private trackTikTokEvent(eventName: string, eventData: PixelEvent): void {
    if (!this.pixels.has('tiktok')) return;

    const ttq = this.pixels.get('tiktok');
    const tiktokEventMap: Record<string, string> = {
      page_view: 'ViewContent',
      add_to_cart: 'AddToCart',
      initiate_checkout: 'InitiateCheckout',
      purchase: 'CompletePayment',
      complete_registration: 'CompleteRegistration'
    };

    const tiktokEvent = tiktokEventMap[eventName] || eventName;
    ttq.track(tiktokEvent, {
      value: eventData.value,
      currency: eventData.currency || 'USD',
      content_id: eventData.content_ids?.[0],
      content_type: eventData.content_type,
      description: eventData.content_name
    });
  }

  /**
   * Twitter event tracking
   */
  private trackTwitterEvent(eventName: string, eventData: Record<string, any>): void {
    if (!this.pixels.has('twitter')) return;

    const twq = this.pixels.get('twitter');
    const twitterEventMap: Record<string, string> = {
      purchase: 'tw-purchase',
      add_to_cart: 'tw-add-to-cart',
      complete_registration: 'tw-sign-up'
    };

    const twitterEvent = twitterEventMap[eventName];
    if (twitterEvent) {
      twq('track', twitterEvent, {
        value: eventData.value,
        currency: eventData.currency || 'USD'
      });
    }
  }

  /**
   * Custom event tracking (send to our API)
   */
  private async trackCustomEvent(eventName: string, eventData: Record<string, any>): Promise<void> {
    try {
      await fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          data: eventData,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashEmail(email: string): string {
    // In production, use proper hashing (SHA-256)
    return btoa(email.toLowerCase().trim());
  }

  private hashPhone(phone: string): string {
    return btoa(phone.replace(/\D/g, ''));
  }

  private hashName(name: string): string {
    return btoa(name.toLowerCase().trim());
  }

  private getLinkedInConversionId(eventName: string): string {
    const conversionMap: Record<string, string> = {
      purchase: process.env.NEXT_PUBLIC_LINKEDIN_PURCHASE_CONVERSION_ID || '',
      lead: process.env.NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID || '',
      complete_registration: process.env.NEXT_PUBLIC_LINKEDIN_SIGNUP_CONVERSION_ID || ''
    };
    return conversionMap[eventName] || '';
  }
}

// Export singleton instance
export const pixelTracker = PixelTrackingManager.getInstance();

// Convenience functions for common events
export const trackPageView = () => pixelTracker.trackEvent('page_view');
export const trackPurchase = (value: number, currency = 'USD', orderId: string) => 
  pixelTracker.trackEvent('purchase', { value, currency, content_ids: [orderId] });
export const trackAddToCart = (productId: string, value: number) => 
  pixelTracker.trackEvent('add_to_cart', { content_ids: [productId], value });
export const trackLead = (source: string) => 
  pixelTracker.trackEvent('lead', { data: { lead_source: source } });
export const trackSignup = (method: string) => 
  pixelTracker.trackEvent('complete_registration', { data: { signup_method: method } });
export const trackTrialStart = (tier: string) => 
  pixelTracker.trackEvent('start_trial', { data: { trial_tier: tier } });