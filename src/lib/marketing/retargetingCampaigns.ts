/**
 * Retargeting Campaign Management System
 * Creates audience segments and triggers retargeting campaigns
 */

interface RetargetingAudience {
  id: string;
  name: string;
  description: string;
  criteria: AudienceCriteria;
  platforms: ('facebook' | 'google' | 'linkedin' | 'tiktok' | 'twitter')[];
  campaignType: 'awareness' | 'consideration' | 'conversion' | 'retention';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  isActive: boolean;
}

interface AudienceCriteria {
  pages_visited?: string[];
  pages_not_visited?: string[];
  events_completed?: string[];
  events_not_completed?: string[];
  time_on_site_min?: number;
  days_since_visit?: number;
  subscription_tier?: string[];
  user_role?: string[];
  custom_filters?: Record<string, any>;
}

interface CampaignTrigger {
  id: string;
  name: string;
  audienceId: string;
  trigger_event: string;
  delay_minutes?: number;
  conditions: Record<string, any>;
  campaign_content: CampaignContent;
  isActive: boolean;
}

interface CampaignContent {
  headline: string;
  description: string;
  cta_text: string;
  landing_url: string;
  image_url?: string;
  video_url?: string;
  offer_text?: string;
  urgency_text?: string;
}

class RetargetingCampaignManager {
  private static instance: RetargetingCampaignManager;
  private audiences: Map<string, RetargetingAudience> = new Map();
  private campaigns: Map<string, CampaignTrigger> = new Map();
  private userProfile: Record<string, any> = {};

  static getInstance(): RetargetingCampaignManager {
    if (!RetargetingCampaignManager.instance) {
      RetargetingCampaignManager.instance = new RetargetingCampaignManager();
    }
    return RetargetingCampaignManager.instance;
  }

  /**
   * Initialize predefined retargeting audiences
   */
  initializeRetargetingAudiences(): void {
    // Document Management Interest Audiences
    this.createAudience({
      id: 'doc_mgmt_visitors',
      name: 'Document Management Page Visitors',
      description: 'Users who visited document management features but didn\'t sign up',
      criteria: {
        pages_visited: ['/features/document-management', '/documents', '/demo/document-management'],
        events_not_completed: ['complete_registration', 'start_trial'],
        time_on_site_min: 30
      },
      platforms: ['facebook', 'google', 'linkedin'],
      campaignType: 'consideration',
      priority: 'high',
      createdAt: new Date(),
      isActive: true
    });

    this.createAudience({
      id: 'template_browsers',
      name: 'Template Browsers',
      description: 'Users who browsed templates but didn\'t download',
      criteria: {
        pages_visited: ['/templates'],
        events_not_completed: ['download_template', 'start_trial'],
        time_on_site_min: 60
      },
      platforms: ['facebook', 'google', 'tiktok'],
      campaignType: 'conversion',
      priority: 'high',
      createdAt: new Date(),
      isActive: true
    });

    this.createAudience({
      id: 'trial_starters',
      name: 'Trial Starters - No Purchase',
      description: 'Users who started trial but haven\'t upgraded',
      criteria: {
        events_completed: ['start_trial'],
        events_not_completed: ['purchase'],
        days_since_visit: 3
      },
      platforms: ['facebook', 'google', 'linkedin', 'twitter'],
      campaignType: 'conversion',
      priority: 'critical',
      createdAt: new Date(),
      isActive: true
    });

    this.createAudience({
      id: 'cart_abandoners',
      name: 'Cart Abandoners',
      description: 'Users who added to cart but didn\'t complete purchase',
      criteria: {
        events_completed: ['add_to_cart'],
        events_not_completed: ['purchase'],
        days_since_visit: 1
      },
      platforms: ['facebook', 'google', 'tiktok'],
      campaignType: 'conversion',
      priority: 'critical',
      createdAt: new Date(),
      isActive: true
    });

    this.createAudience({
      id: 'feature_engaged',
      name: 'Feature-Engaged Visitors',
      description: 'Users who engaged with specific features but didn\'t convert',
      criteria: {
        pages_visited: ['/calculators', '/design/advanced', '/energy-optimization'],
        time_on_site_min: 120,
        events_not_completed: ['complete_registration']
      },
      platforms: ['facebook', 'google', 'linkedin'],
      campaignType: 'consideration',
      priority: 'medium',
      createdAt: new Date(),
      isActive: true
    });

    this.createAudience({
      id: 'pricing_visitors',
      name: 'Pricing Page Visitors',
      description: 'Users who viewed pricing but didn\'t start trial',
      criteria: {
        pages_visited: ['/pricing'],
        events_not_completed: ['start_trial', 'complete_registration'],
        time_on_site_min: 45
      },
      platforms: ['facebook', 'google'],
      campaignType: 'conversion',
      priority: 'high',
      createdAt: new Date(),
      isActive: true
    });

    this.createAudience({
      id: 'free_users',
      name: 'Free Plan Users',
      description: 'Active free users who might upgrade',
      criteria: {
        subscription_tier: ['free'],
        events_completed: ['login'],
        days_since_visit: 7
      },
      platforms: ['facebook', 'google', 'linkedin'],
      campaignType: 'conversion',
      priority: 'medium',
      createdAt: new Date(),
      isActive: true
    });

    console.log('✅ Retargeting audiences initialized');
  }

  /**
   * Initialize campaign triggers
   */
  initializeCampaignTriggers(): void {
    // Document Management Interest Campaign
    this.createCampaignTrigger({
      id: 'doc_mgmt_retarget',
      name: 'Document Management Retargeting',
      audienceId: 'doc_mgmt_visitors',
      trigger_event: 'audience_match',
      delay_minutes: 60,
      conditions: { min_visits: 1, max_days_since_visit: 7 },
      campaign_content: {
        headline: 'Still Managing Documents the Hard Way? 📄',
        description: 'See why 500+ businesses chose our document management system. Smart version control, team collaboration, enterprise security.',
        cta_text: 'Start Free Trial',
        landing_url: '/onboarding/documents?utm_source=retargeting&utm_campaign=doc_mgmt',
        image_url: '/marketing/document-management-hero.jpg',
        offer_text: '14-day free trial • No credit card required',
        urgency_text: 'Join hundreds of growing businesses today'
      },
      isActive: true
    });

    // Template Download Campaign
    this.createCampaignTrigger({
      id: 'template_download_push',
      name: 'Template Download Push',
      audienceId: 'template_browsers',
      trigger_event: 'audience_match',
      delay_minutes: 30,
      conditions: { min_time_on_page: 60 },
      campaign_content: {
        headline: 'Get Professional SOP Templates FREE 📋',
        description: 'Download industry-specific templates for LED cultivation, safety protocols, quality control. Used by 500+ facilities.',
        cta_text: 'Download Free Templates',
        landing_url: '/templates?utm_source=retargeting&utm_campaign=templates',
        image_url: '/marketing/templates-showcase.jpg',
        offer_text: 'FREE professional templates • Instant download',
        urgency_text: 'Get up and running in 30 minutes'
      },
      isActive: true
    });

    // Trial Conversion Campaign
    this.createCampaignTrigger({
      id: 'trial_conversion',
      name: 'Trial to Paid Conversion',
      audienceId: 'trial_starters',
      trigger_event: 'trial_day_7',
      delay_minutes: 0,
      conditions: { trial_usage: 'active' },
      campaign_content: {
        headline: 'Your Trial Expires Soon - Upgrade Now! ⏰',
        description: 'Continue accessing professional document management, version control, and team collaboration. Special launch pricing available.',
        cta_text: 'Upgrade Now - 50% Off',
        landing_url: '/pricing?utm_source=retargeting&utm_campaign=trial_conversion&discount=LAUNCH50',
        offer_text: '50% off first 3 months • Cancel anytime',
        urgency_text: 'Limited time: Launch pricing ends soon!'
      },
      isActive: true
    });

    // Cart Abandonment Campaign
    this.createCampaignTrigger({
      id: 'cart_recovery',
      name: 'Cart Abandonment Recovery',
      audienceId: 'cart_abandoners',
      trigger_event: 'cart_abandoned',
      delay_minutes: 15,
      conditions: { cart_value_min: 29 },
      campaign_content: {
        headline: 'Complete Your Purchase - Items Still Available! 🛒',
        description: 'Your document management subscription is waiting. Join 500+ businesses with professional version control and collaboration.',
        cta_text: 'Complete Purchase',
        landing_url: '/checkout?utm_source=retargeting&utm_campaign=cart_recovery',
        offer_text: 'Free 14-day trial included • Cancel anytime',
        urgency_text: 'Secure your spot - limited early access pricing'
      },
      isActive: true
    });

    // Feature Engagement Follow-up
    this.createCampaignTrigger({
      id: 'feature_followup',
      name: 'Feature Engagement Follow-up',
      audienceId: 'feature_engaged',
      trigger_event: 'high_engagement',
      delay_minutes: 180,
      conditions: { pages_visited_min: 3 },
      campaign_content: {
        headline: 'Ready to Streamline Your Operations? 🚀',
        description: 'You explored our advanced features. See how complete workflow automation can transform your business operations.',
        cta_text: 'Get Personalized Demo',
        landing_url: '/demo/workflow-automation?utm_source=retargeting&utm_campaign=feature_engaged',
        offer_text: 'Free personalized demo • Implementation support',
        urgency_text: 'Book demo this week - get free setup worth $500'
      },
      isActive: true
    });

    // Pricing Page Retargeting
    this.createCampaignTrigger({
      id: 'pricing_retarget',
      name: 'Pricing Page Retargeting',
      audienceId: 'pricing_visitors',
      trigger_event: 'pricing_viewed',
      delay_minutes: 120,
      conditions: { time_on_pricing_min: 45 },
      campaign_content: {
        headline: 'Questions About Pricing? Get Answers! 💬',
        description: 'Talk to our team about finding the right plan for your needs. Custom pricing available for growing businesses.',
        cta_text: 'Schedule Call',
        landing_url: '/consultations?utm_source=retargeting&utm_campaign=pricing_questions',
        offer_text: 'Free consultation • Custom pricing available',
        urgency_text: 'Book this week - get month 1 free'
      },
      isActive: true
    });

    // Free User Upgrade Campaign
    this.createCampaignTrigger({
      id: 'free_user_upgrade',
      name: 'Free User Upgrade Push',
      audienceId: 'free_users',
      trigger_event: 'free_limit_approached',
      delay_minutes: 0,
      conditions: { usage_percentage: 80 },
      campaign_content: {
        headline: 'Ready to Unlock Full Power? 🔓',
        description: 'You\'re using 80% of your free plan. Upgrade now for unlimited access, advanced features, and priority support.',
        cta_text: 'Upgrade to Professional',
        landing_url: '/pricing?utm_source=retargeting&utm_campaign=free_upgrade&highlight=professional',
        offer_text: 'Upgrade now • 30-day money-back guarantee',
        urgency_text: 'Upgrade before hitting limits - seamless transition'
      },
      isActive: true
    });

    console.log('✅ Campaign triggers initialized');
  }

  /**
   * Check if user matches any retargeting audience
   */
  async checkAudienceMatches(userActivity: Record<string, any>): Promise<RetargetingAudience[]> {
    const matches: RetargetingAudience[] = [];

    for (const [id, audience] of this.audiences.entries()) {
      if (!audience.isActive) continue;

      if (await this.doesUserMatchCriteria(userActivity, audience.criteria)) {
        matches.push(audience);
      }
    }

    return matches;
  }

  /**
   * Trigger retargeting campaigns based on user activity
   */
  async triggerRetargetingCampaigns(
    userActivity: Record<string, any>,
    userInfo: Record<string, any>
  ): Promise<void> {
    try {
      const audienceMatches = await this.checkAudienceMatches(userActivity);

      for (const audience of audienceMatches) {
        const campaigns = Array.from(this.campaigns.values())
          .filter(campaign => campaign.audienceId === audience.id && campaign.isActive);

        for (const campaign of campaigns) {
          if (this.shouldTriggerCampaign(campaign, userActivity)) {
            await this.executeCampaign(campaign, userInfo, audience);
          }
        }
      }
    } catch (error) {
      console.error('Error triggering retargeting campaigns:', error);
    }
  }

  /**
   * Execute a specific retargeting campaign
   */
  private async executeCampaign(
    campaign: CampaignTrigger,
    userInfo: Record<string, any>,
    audience: RetargetingAudience
  ): Promise<void> {
    try {
      // Log campaign execution
      await this.logCampaignExecution(campaign, userInfo, audience);

      // Create custom audiences on each platform
      for (const platform of audience.platforms) {
        await this.createPlatformAudience(platform, audience, userInfo);
      }

      // Send to email retargeting if email available
      if (userInfo.email) {
        await this.triggerEmailRetargeting(campaign, userInfo);
      }

      // Track campaign trigger event
      await this.trackCampaignEvent('campaign_triggered', {
        campaign_id: campaign.id,
        audience_id: audience.id,
        user_info: userInfo,
        platforms: audience.platforms
      });

    } catch (error) {
      console.error('Error executing campaign:', error);
    }
  }

  /**
   * Create platform-specific audiences
   */
  private async createPlatformAudience(
    platform: string,
    audience: RetargetingAudience,
    userInfo: Record<string, any>
  ): Promise<void> {
    const audienceData = {
      name: `${audience.name} - ${platform}`,
      description: audience.description,
      user_data: userInfo,
      criteria: audience.criteria,
      campaign_type: audience.campaignType,
      priority: audience.priority
    };

    // Send to platform-specific audience creation API
    await fetch(`/api/marketing/audiences/${platform}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(audienceData)
    });
  }

  /**
   * Trigger email retargeting
   */
  private async triggerEmailRetargeting(
    campaign: CampaignTrigger,
    userInfo: Record<string, any>
  ): Promise<void> {
    const emailData = {
      to: userInfo.email,
      subject: campaign.campaign_content.headline,
      template: 'retargeting_campaign',
      data: {
        ...campaign.campaign_content,
        user_name: userInfo.first_name || 'there',
        personalization: this.getPersonalizationData(userInfo)
      },
      campaign_id: campaign.id,
      delay_minutes: campaign.delay_minutes || 0
    };

    await fetch('/api/marketing/email/retargeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
  }

  /**
   * Helper methods
   */
  private createAudience(audience: RetargetingAudience): void {
    this.audiences.set(audience.id, audience);
  }

  private createCampaignTrigger(campaign: CampaignTrigger): void {
    this.campaigns.set(campaign.id, campaign);
  }

  private async doesUserMatchCriteria(
    userActivity: Record<string, any>,
    criteria: AudienceCriteria
  ): Promise<boolean> {
    // Check pages visited
    if (criteria.pages_visited) {
      const visitedPages = userActivity.pages_visited || [];
      const hasVisitedRequired = criteria.pages_visited.some(page => 
        visitedPages.includes(page)
      );
      if (!hasVisitedRequired) return false;
    }

    // Check pages not visited
    if (criteria.pages_not_visited) {
      const visitedPages = userActivity.pages_visited || [];
      const hasVisitedExcluded = criteria.pages_not_visited.some(page => 
        visitedPages.includes(page)
      );
      if (hasVisitedExcluded) return false;
    }

    // Check events completed
    if (criteria.events_completed) {
      const completedEvents = userActivity.events_completed || [];
      const hasCompletedRequired = criteria.events_completed.every(event => 
        completedEvents.includes(event)
      );
      if (!hasCompletedRequired) return false;
    }

    // Check events not completed
    if (criteria.events_not_completed) {
      const completedEvents = userActivity.events_completed || [];
      const hasCompletedExcluded = criteria.events_not_completed.some(event => 
        completedEvents.includes(event)
      );
      if (hasCompletedExcluded) return false;
    }

    // Check time on site
    if (criteria.time_on_site_min) {
      const timeOnSite = userActivity.time_on_site || 0;
      if (timeOnSite < criteria.time_on_site_min) return false;
    }

    // Check days since visit
    if (criteria.days_since_visit) {
      const lastVisit = new Date(userActivity.last_visit || 0);
      const daysSince = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < criteria.days_since_visit) return false;
    }

    return true;
  }

  private shouldTriggerCampaign(
    campaign: CampaignTrigger,
    userActivity: Record<string, any>
  ): boolean {
    // Check campaign-specific conditions
    if (campaign.conditions.min_visits) {
      const visitCount = userActivity.visit_count || 0;
      if (visitCount < campaign.conditions.min_visits) return false;
    }

    if (campaign.conditions.max_days_since_visit) {
      const lastVisit = new Date(userActivity.last_visit || 0);
      const daysSince = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > campaign.conditions.max_days_since_visit) return false;
    }

    return true;
  }

  private async logCampaignExecution(
    campaign: CampaignTrigger,
    userInfo: Record<string, any>,
    audience: RetargetingAudience
  ): Promise<void> {
    await fetch('/api/analytics/campaign-execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaign.id,
        audience_id: audience.id,
        user_id: userInfo.user_id,
        timestamp: new Date().toISOString(),
        platforms: audience.platforms,
        campaign_type: audience.campaignType,
        priority: audience.priority
      })
    });
  }

  private async trackCampaignEvent(event: string, data: Record<string, any>): Promise<void> {
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

  private getPersonalizationData(userInfo: Record<string, any>): Record<string, any> {
    return {
      subscription_tier: userInfo.subscription_tier || 'free',
      user_role: userInfo.user_role || 'user',
      company: userInfo.company || 'your business',
      industry: userInfo.industry || 'cultivation',
      last_login: userInfo.last_login,
      features_used: userInfo.features_used || []
    };
  }
}

// Export singleton instance
export const retargetingManager = RetargetingCampaignManager.getInstance();

// Initialize on module load
if (typeof window !== 'undefined') {
  retargetingManager.initializeRetargetingAudiences();
  retargetingManager.initializeCampaignTriggers();
}