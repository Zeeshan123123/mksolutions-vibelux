/**
 * Abandoned Cart Recovery System
 * Multi-channel approach: Email, SMS, Push, Retargeting Ads
 */

interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  plan_type?: string;
  billing_cycle?: 'monthly' | 'yearly';
  features?: string[];
  discount_applied?: string;
  original_price?: number;
}

interface AbandonedCart {
  id: string;
  user_id?: string;
  session_id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  items: CartItem[];
  total_value: number;
  currency: string;
  abandoned_at: Date;
  last_updated: Date;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  page_source: string;
  device_type: string;
  location?: {
    country: string;
    state: string;
    city: string;
  };
  recovery_stage: 'abandoned' | 'email_1' | 'email_2' | 'email_3' | 'sms_sent' | 'recovered' | 'expired';
  recovery_attempts: number;
  last_recovery_sent?: Date;
  recovered_at?: Date;
  recovery_channel?: 'email' | 'sms' | 'push' | 'retargeting';
  recovery_value?: number;
}

interface RecoveryTemplate {
  id: string;
  stage: number;
  channel: 'email' | 'sms' | 'push';
  delay_hours: number;
  subject: string;
  content: RecoveryContent;
  incentive?: RecoveryIncentive;
  urgency_level: 'low' | 'medium' | 'high';
  personalization: boolean;
}

interface RecoveryContent {
  headline: string;
  body: string;
  cta_text: string;
  cta_url: string;
  product_showcase: boolean;
  testimonial?: string;
  social_proof?: string;
}

interface RecoveryIncentive {
  type: 'discount' | 'free_trial_extension' | 'free_setup' | 'bonus_features';
  value: number | string;
  code?: string;
  expiry_hours: number;
  minimum_value?: number;
}

class AbandonedCartRecoveryManager {
  private static instance: AbandonedCartRecoveryManager;
  private abandonedCarts: Map<string, AbandonedCart> = new Map();
  private recoveryTemplates: Map<string, RecoveryTemplate> = new Map();
  private recoveryIntervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): AbandonedCartRecoveryManager {
    if (!AbandonedCartRecoveryManager.instance) {
      AbandonedCartRecoveryManager.instance = new AbandonedCartRecoveryManager();
    }
    return AbandonedCartRecoveryManager.instance;
  }

  /**
   * Initialize recovery templates
   */
  initializeRecoveryTemplates(): void {
    // Email Recovery Sequence
    this.createRecoveryTemplate({
      id: 'email_stage_1',
      stage: 1,
      channel: 'email',
      delay_hours: 1,
      subject: 'Complete your Vibelux setup? Your cart is waiting 🛒',
      content: {
        headline: 'Hi {first_name}, finish setting up your document management system?',
        body: `You were just moments away from upgrading to professional document management! 
               Your cart contains everything you need to eliminate version confusion and boost team productivity.
               
               What you'll get:
               • Smart version control for all your SOPs
               • Real-time team collaboration 
               • Enterprise-grade security & audit trails
               • Professional templates for instant setup
               
               Complete your purchase now and join 500+ growing businesses.`,
        cta_text: 'Complete Purchase',
        cta_url: '/checkout?recovery=true&stage=1',
        product_showcase: true,
        social_proof: '500+ businesses trust Vibelux with their critical documents'
      },
      urgency_level: 'low',
      personalization: true
    });

    this.createRecoveryTemplate({
      id: 'email_stage_2',
      stage: 2,
      channel: 'email',
      delay_hours: 24,
      subject: 'Still thinking it over? Here\'s 20% off your Vibelux plan 💡',
      content: {
        headline: 'Hi {first_name}, we saved your cart and added a special discount!',
        body: `We understand choosing the right document management system is important.
               To help with your decision, we're offering 20% off your first 3 months.
               
               Why customers choose Vibelux:
               "90% reduction in version confusion incidents" - Sarah Martinez, GreenTech Cultivation
               "Saved 3 hours per week finding current documents" - Mike Chen, Precision Grow
               
               Your discount expires in 48 hours - don't miss out!`,
        cta_text: 'Claim 20% Discount',
        cta_url: '/checkout?recovery=true&stage=2&discount=CART20',
        product_showcase: true,
        testimonial: '"The document checkout system prevented so many conflicts. Game changer!" - Jessica T.'
      },
      incentive: {
        type: 'discount',
        value: 20,
        code: 'CART20',
        expiry_hours: 48,
        minimum_value: 29
      },
      urgency_level: 'medium',
      personalization: true
    });

    this.createRecoveryTemplate({
      id: 'email_stage_3',
      stage: 3,
      channel: 'email',
      delay_hours: 72,
      subject: 'Last chance: Your cart expires in 24 hours ⏰',
      content: {
        headline: 'Hi {first_name}, this is your final reminder',
        body: `Your Vibelux cart will expire in 24 hours, and we'd hate for you to miss out.
               
               This is your last chance to:
               ✅ Get 20% off your first 3 months
               ✅ Lock in current pricing (prices increase next month)
               ✅ Access professional document management features
               ✅ Join our exclusive early adopter community
               
               After 24 hours, this offer disappears forever.`,
        cta_text: 'Complete Purchase Now',
        cta_url: '/checkout?recovery=true&stage=3&discount=CART20&urgent=true',
        product_showcase: false,
        social_proof: 'Join 500+ businesses who\'ve already upgraded'
      },
      incentive: {
        type: 'discount',
        value: 20,
        code: 'CART20',
        expiry_hours: 24,
        minimum_value: 29
      },
      urgency_level: 'high',
      personalization: true
    });

    // SMS Recovery
    this.createRecoveryTemplate({
      id: 'sms_stage_1',
      stage: 1,
      channel: 'sms',
      delay_hours: 4,
      subject: '',
      content: {
        headline: '',
        body: 'Hi {first_name}! You left items in your Vibelux cart. Complete your purchase and get 20% off: {cta_url}',
        cta_text: 'Complete Purchase',
        cta_url: '/checkout?recovery=true&channel=sms&discount=SMS20',
        product_showcase: false
      },
      incentive: {
        type: 'discount',
        value: 20,
        code: 'SMS20',
        expiry_hours: 48
      },
      urgency_level: 'medium',
      personalization: true
    });

    // Push Notification Recovery
    this.createRecoveryTemplate({
      id: 'push_stage_1',
      stage: 1,
      channel: 'push',
      delay_hours: 2,
      subject: 'Complete your Vibelux purchase',
      content: {
        headline: 'Your cart is waiting!',
        body: 'Finish setting up your document management system. Get 15% off now.',
        cta_text: 'Complete Purchase',
        cta_url: '/checkout?recovery=true&channel=push&discount=PUSH15',
        product_showcase: false
      },
      incentive: {
        type: 'discount',
        value: 15,
        code: 'PUSH15',
        expiry_hours: 24
      },
      urgency_level: 'low',
      personalization: false
    });

    console.log('✅ Recovery templates initialized');
  }

  /**
   * Track cart abandonment
   */
  async trackCartAbandonment(cartData: {
    user_id?: string;
    session_id: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    items: CartItem[];
    utm_data?: Record<string, string>;
    page_source: string;
    device_info: Record<string, any>;
  }): Promise<void> {
    try {
      const cartId = `cart_${cartData.session_id}_${Date.now()}`;
      const totalValue = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const abandonedCart: AbandonedCart = {
        id: cartId,
        user_id: cartData.user_id,
        session_id: cartData.session_id,
        email: cartData.email,
        phone: cartData.phone,
        first_name: cartData.first_name,
        last_name: cartData.last_name,
        items: cartData.items,
        total_value: totalValue,
        currency: cartData.items[0]?.currency || 'USD',
        abandoned_at: new Date(),
        last_updated: new Date(),
        utm_source: cartData.utm_data?.utm_source,
        utm_campaign: cartData.utm_data?.utm_campaign,
        utm_medium: cartData.utm_data?.utm_medium,
        page_source: cartData.page_source,
        device_type: cartData.device_info.device_type || 'desktop',
        location: cartData.device_info.location,
        recovery_stage: 'abandoned',
        recovery_attempts: 0
      };

      // Store abandoned cart
      this.abandonedCarts.set(cartId, abandonedCart);

      // Start recovery sequence
      await this.startRecoverySequence(cartId);

      // Track abandonment event
      await this.trackRecoveryEvent('cart_abandoned', {
        cart_id: cartId,
        total_value: totalValue,
        item_count: cartData.items.length,
        user_id: cartData.user_id,
        session_id: cartData.session_id,
        utm_source: cartData.utm_data?.utm_source
      });

      // Trigger retargeting campaigns
      await this.triggerRetargetingCampaigns(abandonedCart);

    } catch (error) {
      console.error('Error tracking cart abandonment:', error);
    }
  }

  /**
   * Start automated recovery sequence
   */
  private async startRecoverySequence(cartId: string): Promise<void> {
    const cart = this.abandonedCarts.get(cartId);
    if (!cart) return;

    // Schedule recovery emails
    this.scheduleRecoveryMessage(cartId, 'email_stage_1');
    this.scheduleRecoveryMessage(cartId, 'email_stage_2');
    this.scheduleRecoveryMessage(cartId, 'email_stage_3');

    // Schedule SMS if phone number available
    if (cart.phone) {
      this.scheduleRecoveryMessage(cartId, 'sms_stage_1');
    }

    // Schedule push notification if user is registered
    if (cart.user_id) {
      this.scheduleRecoveryMessage(cartId, 'push_stage_1');
    }
  }

  /**
   * Schedule individual recovery message
   */
  private scheduleRecoveryMessage(cartId: string, templateId: string): void {
    const template = this.recoveryTemplates.get(templateId);
    if (!template) return;

    const timeoutId = setTimeout(async () => {
      await this.sendRecoveryMessage(cartId, templateId);
    }, template.delay_hours * 60 * 60 * 1000);

    this.recoveryIntervals.set(`${cartId}_${templateId}`, timeoutId);
  }

  /**
   * Send recovery message
   */
  private async sendRecoveryMessage(cartId: string, templateId: string): Promise<void> {
    try {
      const cart = this.abandonedCarts.get(cartId);
      const template = this.recoveryTemplates.get(templateId);
      
      if (!cart || !template || cart.recovery_stage === 'recovered') return;

      // Check if cart has been recovered or expired
      if (cart.recovered_at || this.isCartExpired(cart)) {
        return;
      }

      // Send message based on channel
      switch (template.channel) {
        case 'email':
          await this.sendRecoveryEmail(cart, template);
          break;
        case 'sms':
          await this.sendRecoverySMS(cart, template);
          break;
        case 'push':
          await this.sendRecoveryPush(cart, template);
          break;
      }

      // Update cart recovery stage
      cart.recovery_attempts++;
      cart.last_recovery_sent = new Date();
      cart.recovery_stage = this.getNextRecoveryStage(template);
      
      this.abandonedCarts.set(cartId, cart);

      // Track recovery message sent
      await this.trackRecoveryEvent('recovery_message_sent', {
        cart_id: cartId,
        template_id: templateId,
        channel: template.channel,
        stage: template.stage,
        total_value: cart.total_value
      });

    } catch (error) {
      console.error('Error sending recovery message:', error);
    }
  }

  /**
   * Send recovery email
   */
  private async sendRecoveryEmail(cart: AbandonedCart, template: RecoveryTemplate): Promise<void> {
    if (!cart.email) return;

    const personalizedContent = this.personalizeContent(template.content, cart);
    const trackingUrl = this.generateTrackingUrl(template.content.cta_url, cart.id, template.id);

    const emailData = {
      to: cart.email,
      subject: this.personalizeText(template.subject, cart),
      template: 'abandoned_cart_recovery',
      data: {
        first_name: cart.first_name || 'there',
        headline: personalizedContent.headline,
        body: personalizedContent.body,
        cta_text: personalizedContent.cta_text,
        cta_url: trackingUrl,
        items: cart.items,
        total_value: cart.total_value,
        currency: cart.currency,
        incentive: template.incentive,
        urgency_level: template.urgency_level,
        testimonial: personalizedContent.testimonial,
        social_proof: personalizedContent.social_proof,
        product_showcase: personalizedContent.product_showcase
      },
      tracking: {
        cart_id: cart.id,
        template_id: template.id,
        channel: 'email'
      }
    };

    await fetch('/api/marketing/email/abandoned-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
  }

  /**
   * Send recovery SMS
   */
  private async sendRecoverySMS(cart: AbandonedCart, template: RecoveryTemplate): Promise<void> {
    if (!cart.phone) return;

    const personalizedBody = this.personalizeText(template.content.body, cart);
    const trackingUrl = this.generateTrackingUrl(template.content.cta_url, cart.id, template.id);
    const shortUrl = await this.shortenUrl(trackingUrl);

    const smsData = {
      to: cart.phone,
      message: personalizedBody.replace('{cta_url}', shortUrl),
      tracking: {
        cart_id: cart.id,
        template_id: template.id,
        channel: 'sms'
      }
    };

    await fetch('/api/marketing/sms/abandoned-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsData)
    });
  }

  /**
   * Send recovery push notification
   */
  private async sendRecoveryPush(cart: AbandonedCart, template: RecoveryTemplate): Promise<void> {
    if (!cart.user_id) return;

    const trackingUrl = this.generateTrackingUrl(template.content.cta_url, cart.id, template.id);

    const pushData = {
      user_id: cart.user_id,
      title: template.subject,
      body: template.content.body,
      url: trackingUrl,
      icon: '/icons/cart-recovery.png',
      tracking: {
        cart_id: cart.id,
        template_id: template.id,
        channel: 'push'
      }
    };

    await fetch('/api/marketing/push/abandoned-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushData)
    });
  }

  /**
   * Mark cart as recovered
   */
  async markCartAsRecovered(
    cartId: string, 
    recoveryChannel: string, 
    recoveryValue: number
  ): Promise<void> {
    const cart = this.abandonedCarts.get(cartId);
    if (!cart) return;

    cart.recovery_stage = 'recovered';
    cart.recovered_at = new Date();
    cart.recovery_channel = recoveryChannel as any;
    cart.recovery_value = recoveryValue;

    this.abandonedCarts.set(cartId, cart);

    // Cancel pending recovery messages
    this.cancelPendingRecoveries(cartId);

    // Track successful recovery
    await this.trackRecoveryEvent('cart_recovered', {
      cart_id: cartId,
      recovery_channel: recoveryChannel,
      recovery_value: recoveryValue,
      original_value: cart.total_value,
      recovery_rate: (recoveryValue / cart.total_value) * 100,
      time_to_recovery: Date.now() - cart.abandoned_at.getTime(),
      attempts_before_recovery: cart.recovery_attempts
    });
  }

  /**
   * Get recovery analytics
   */
  async getRecoveryAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<Record<string, any>> {
    const carts = Array.from(this.abandonedCarts.values());
    const cutoffDate = new Date();
    
    switch (timeframe) {
      case 'day':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
    }

    const recentCarts = carts.filter(cart => cart.abandoned_at >= cutoffDate);
    const recoveredCarts = recentCarts.filter(cart => cart.recovery_stage === 'recovered');
    
    const totalAbandoned = recentCarts.reduce((sum, cart) => sum + cart.total_value, 0);
    const totalRecovered = recoveredCarts.reduce((sum, cart) => sum + (cart.recovery_value || 0), 0);

    return {
      timeframe,
      total_abandoned_carts: recentCarts.length,
      total_recovered_carts: recoveredCarts.length,
      recovery_rate: recentCarts.length > 0 ? (recoveredCarts.length / recentCarts.length) * 100 : 0,
      total_abandoned_value: totalAbandoned,
      total_recovered_value: totalRecovered,
      recovery_value_rate: totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0,
      avg_time_to_recovery: this.calculateAverageTimeToRecovery(recoveredCarts),
      recovery_by_channel: this.getRecoveryByChannel(recoveredCarts),
      recovery_by_stage: this.getRecoveryByStage(recoveredCarts)
    };
  }

  /**
   * Helper methods
   */
  private createRecoveryTemplate(template: RecoveryTemplate): void {
    this.recoveryTemplates.set(template.id, template);
  }

  private personalizeContent(content: RecoveryContent, cart: AbandonedCart): RecoveryContent {
    return {
      ...content,
      headline: this.personalizeText(content.headline, cart),
      body: this.personalizeText(content.body, cart),
      cta_text: this.personalizeText(content.cta_text, cart)
    };
  }

  private personalizeText(text: string, cart: AbandonedCart): string {
    return text
      .replace('{first_name}', cart.first_name || 'there')
      .replace('{last_name}', cart.last_name || '')
      .replace('{total_value}', `$${cart.total_value}`)
      .replace('{currency}', cart.currency)
      .replace('{item_count}', cart.items.length.toString());
  }

  private generateTrackingUrl(baseUrl: string, cartId: string, templateId: string): string {
    const url = new URL(baseUrl, process.env.NEXT_PUBLIC_BASE_URL);
    url.searchParams.set('cart_id', cartId);
    url.searchParams.set('template_id', templateId);
    url.searchParams.set('utm_source', 'abandoned_cart');
    url.searchParams.set('utm_campaign', 'cart_recovery');
    return url.toString();
  }

  private async shortenUrl(url: string): Promise<string> {
    try {
      const response = await fetch('/api/utils/shorten-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      return data.short_url || url;
    } catch {
      return url;
    }
  }

  private isCartExpired(cart: AbandonedCart): boolean {
    const expiry = new Date(cart.abandoned_at);
    expiry.setDate(expiry.getDate() + 7); // Carts expire after 7 days
    return new Date() > expiry;
  }

  private getNextRecoveryStage(template: RecoveryTemplate): AbandonedCart['recovery_stage'] {
    const stageMap: Record<string, AbandonedCart['recovery_stage']> = {
      'email_stage_1': 'email_1',
      'email_stage_2': 'email_2',
      'email_stage_3': 'email_3',
      'sms_stage_1': 'sms_sent',
      'push_stage_1': 'abandoned'
    };
    return stageMap[template.id] || 'abandoned';
  }

  private cancelPendingRecoveries(cartId: string): void {
    for (const [key, timeout] of this.recoveryIntervals.entries()) {
      if (key.startsWith(cartId)) {
        clearTimeout(timeout);
        this.recoveryIntervals.delete(key);
      }
    }
  }

  private async triggerRetargetingCampaigns(cart: AbandonedCart): Promise<void> {
    const retargetingData = {
      user_id: cart.user_id,
      email: cart.email,
      cart_value: cart.total_value,
      items: cart.items,
      utm_source: cart.utm_source,
      abandoned_at: cart.abandoned_at
    };

    await fetch('/api/marketing/retargeting/cart-abandonment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(retargetingData)
    });
  }

  private async trackRecoveryEvent(event: string, data: Record<string, any>): Promise<void> {
    await fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      })
    });
  }

  private calculateAverageTimeToRecovery(recoveredCarts: AbandonedCart[]): number {
    if (recoveredCarts.length === 0) return 0;
    
    const totalTime = recoveredCarts.reduce((sum, cart) => {
      if (!cart.recovered_at) return sum;
      return sum + (cart.recovered_at.getTime() - cart.abandoned_at.getTime());
    }, 0);
    
    return totalTime / recoveredCarts.length / (1000 * 60 * 60); // Return in hours
  }

  private getRecoveryByChannel(recoveredCarts: AbandonedCart[]): Record<string, number> {
    const byChannel: Record<string, number> = {};
    recoveredCarts.forEach(cart => {
      if (cart.recovery_channel) {
        byChannel[cart.recovery_channel] = (byChannel[cart.recovery_channel] || 0) + 1;
      }
    });
    return byChannel;
  }

  private getRecoveryByStage(recoveredCarts: AbandonedCart[]): Record<string, number> {
    const byStage: Record<string, number> = {};
    recoveredCarts.forEach(cart => {
      byStage[cart.recovery_stage] = (byStage[cart.recovery_stage] || 0) + 1;
    });
    return byStage;
  }
}

// Export singleton instance
export const cartRecoveryManager = AbandonedCartRecoveryManager.getInstance();

// Initialize on module load
if (typeof window !== 'undefined') {
  cartRecoveryManager.initializeRecoveryTemplates();
}

// Convenience functions
export const trackCartAbandonment = (cartData: any) => cartRecoveryManager.trackCartAbandonment(cartData);
export const markCartRecovered = (cartId: string, channel: string, value: number) => 
  cartRecoveryManager.markCartAsRecovered(cartId, channel, value);
export const getRecoveryAnalytics = (timeframe?: 'day' | 'week' | 'month') => 
  cartRecoveryManager.getRecoveryAnalytics(timeframe);