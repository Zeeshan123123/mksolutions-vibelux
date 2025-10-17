import QRCode from 'qrcode';
import { affiliateSystem } from './affiliate-system';

export interface AffiliateQROptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: boolean;
  format?: 'svg' | 'png' | 'dataurl';
}

export interface AffiliateQRBatch {
  affiliateId: string;
  links: Array<{
    id: string;
    shortCode: string;
    qrCode: string;
    originalUrl: string;
    affiliateUrl: string;
    campaign?: string;
    description?: string;
  }>;
  batchId: string;
  createdAt: Date;
}

export class AffiliateQRGenerator {
  private defaultOptions: AffiliateQROptions = {
    size: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#8b5cf6', // VibeLux purple
      light: '#FFFFFF'
    },
    format: 'dataurl'
  };

  constructor(private baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.ai') {}

  /**
   * Generate QR code for existing affiliate link
   */
  async generateLinkQR(
    affiliateId: string,
    linkId: string,
    options?: AffiliateQROptions
  ): Promise<{ qrCode: string; affiliateUrl: string }> {
    // Get link from affiliate system
    const link = await this.getAffiliateLink(linkId);
    if (!link) {
      throw new Error('Affiliate link not found');
    }

    const affiliateUrl = `${this.baseUrl}/go/${link.shortCode}`;
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    const qrCode = await this.generateQRCode(affiliateUrl, mergedOptions);
    
    return {
      qrCode,
      affiliateUrl
    };
  }

  /**
   * Generate QR codes for multiple products/pages
   */
  async generateBatchQR(
    affiliateId: string,
    urls: Array<{
      url: string;
      campaign?: string;
      description?: string;
      customAlias?: string;
    }>,
    options?: AffiliateQROptions
  ): Promise<AffiliateQRBatch> {
    const batchId = this.generateBatchId();
    const links = [];

    for (const urlData of urls) {
      // Create affiliate link
      const link = await affiliateSystem.generateLink(affiliateId, {
        url: urlData.url,
        campaign: urlData.campaign,
        customAlias: urlData.customAlias,
        title: urlData.description
      });

      // Generate QR code
      const affiliateUrl = `${this.baseUrl}/go/${link.shortCode}`;
      const qrCode = await this.generateQRCode(affiliateUrl, options);

      links.push({
        id: link.id,
        shortCode: link.shortCode,
        qrCode,
        originalUrl: urlData.url,
        affiliateUrl,
        campaign: urlData.campaign,
        description: urlData.description
      });
    }

    return {
      affiliateId,
      links,
      batchId,
      createdAt: new Date()
    };
  }

  /**
   * Generate platform-specific QR codes (Instagram, TikTok, etc.)
   */
  async generatePlatformQRs(
    affiliateId: string,
    baseUrl: string,
    platforms: Array<{
      platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter';
      campaign?: string;
      customText?: string;
    }>,
    options?: AffiliateQROptions
  ): Promise<Array<{
    platform: string;
    qrCode: string;
    affiliateUrl: string;
    customText?: string;
    suggestedCaption: string;
  }>> {
    const results = [];

    for (const platform of platforms) {
      // Create platform-specific link
      const link = await affiliateSystem.generateLink(affiliateId, {
        url: baseUrl,
        campaign: platform.campaign || platform.platform,
        source: platform.platform,
        medium: 'qr-code'
      });

      const affiliateUrl = `${this.baseUrl}/go/${link.shortCode}`;
      
      // Generate QR with platform colors
      const platformOptions = this.getPlatformOptions(platform.platform, options);
      const qrCode = await this.generateQRCode(affiliateUrl, platformOptions);

      // Generate suggested caption
      const suggestedCaption = this.generatePlatformCaption(platform.platform, affiliateUrl);

      results.push({
        platform: platform.platform,
        qrCode,
        affiliateUrl,
        customText: platform.customText,
        suggestedCaption
      });
    }

    return results;
  }

  /**
   * Generate print-ready QR codes with labels
   */
  async generatePrintableQRs(
    affiliateId: string,
    products: Array<{
      name: string;
      url: string;
      price?: string;
      description?: string;
    }>,
    options?: AffiliateQROptions & {
      includeLabels?: boolean;
      layout?: '2x2' | '3x3' | '4x4';
      paperSize?: 'letter' | 'a4';
    }
  ): Promise<{
    qrCodes: Array<{
      productName: string;
      qrCode: string;
      affiliateUrl: string;
      label?: string;
    }>;
    printLayout?: string; // SVG or Canvas for printing
  }> {
    const qrCodes = [];

    for (const product of products) {
      // Create product-specific link
      const link = await affiliateSystem.generateLink(affiliateId, {
        url: product.url,
        campaign: 'print-materials',
        source: 'qr-print',
        medium: 'offline',
        title: product.name
      });

      const affiliateUrl = `${this.baseUrl}/go/${link.shortCode}`;
      const qrCode = await this.generateQRCode(affiliateUrl, {
        ...options,
        format: 'svg' // Better for printing
      });

      const label = options?.includeLabels ? 
        this.generateProductLabel(product) : undefined;

      qrCodes.push({
        productName: product.name,
        qrCode,
        affiliateUrl,
        label
      });
    }

    // Generate print layout if requested
    const printLayout = options?.layout ? 
      await this.generatePrintLayout(qrCodes, options) : undefined;

    return {
      qrCodes,
      printLayout
    };
  }

  /**
   * Generate tracking QR codes for events/trade shows
   */
  async generateEventQRs(
    affiliateId: string,
    event: {
      name: string;
      date: string;
      location: string;
      boothNumber?: string;
    },
    materials: Array<{
      type: 'business-card' | 'banner' | 'flyer' | 'booth-display';
      targetUrl: string;
      callToAction?: string;
    }>,
    options?: AffiliateQROptions
  ): Promise<Array<{
    materialType: string;
    qrCode: string;
    affiliateUrl: string;
    trackingCode: string;
    callToAction?: string;
  }>> {
    const results = [];

    for (const material of materials) {
      const trackingCode = `${event.name.toLowerCase().replace(/\s+/g, '-')}-${material.type}`;
      
      // Create event-specific link
      const link = await affiliateSystem.generateLink(affiliateId, {
        url: material.targetUrl,
        campaign: event.name,
        source: 'event',
        medium: material.type,
        content: trackingCode
      });

      const affiliateUrl = `${this.baseUrl}/go/${link.shortCode}`;
      
      // Use high error correction for event materials
      const eventOptions = {
        ...options,
        errorCorrectionLevel: 'H' as const,
        size: material.type === 'business-card' ? 150 : 300
      };

      const qrCode = await this.generateQRCode(affiliateUrl, eventOptions);

      results.push({
        materialType: material.type,
        qrCode,
        affiliateUrl,
        trackingCode,
        callToAction: material.callToAction
      });
    }

    return results;
  }

  /**
   * Core QR code generation
   */
  private async generateQRCode(url: string, options: AffiliateQROptions): Promise<string> {
    const qrOptions = {
      width: options.size || this.defaultOptions.size,
      margin: options.margin || this.defaultOptions.margin,
      errorCorrectionLevel: options.errorCorrectionLevel || this.defaultOptions.errorCorrectionLevel,
      color: {
        dark: options.color?.dark || this.defaultOptions.color?.dark,
        light: options.color?.light || this.defaultOptions.color?.light
      }
    };

    switch (options.format) {
      case 'svg':
        return await QRCode.toString(url, { ...qrOptions, type: 'svg' });
      case 'png':
        return await QRCode.toBuffer(url, { ...qrOptions, type: 'png' }) as any;
      case 'dataurl':
      default:
        return await QRCode.toDataURL(url, qrOptions);
    }
  }

  /**
   * Get platform-specific styling
   */
  private getPlatformOptions(platform: string, baseOptions?: AffiliateQROptions): AffiliateQROptions {
    const platformColors = {
      instagram: { dark: '#E4405F', light: '#FFFFFF' },
      tiktok: { dark: '#000000', light: '#FFFFFF' },
      youtube: { dark: '#FF0000', light: '#FFFFFF' },
      facebook: { dark: '#1877F2', light: '#FFFFFF' },
      twitter: { dark: '#1DA1F2', light: '#FFFFFF' }
    };

    return {
      ...this.defaultOptions,
      ...baseOptions,
      color: platformColors[platform as keyof typeof platformColors] || this.defaultOptions.color
    };
  }

  /**
   * Generate platform-specific captions
   */
  private generatePlatformCaption(platform: string, affiliateUrl: string): string {
    const captions = {
      instagram: `🌱 Check out these amazing LED grow lights! Perfect for indoor gardening 🌿\n\nScan the QR code or visit: ${affiliateUrl}\n\n#ledgrowlights #indoorgrowing #hydroponics #vibelux`,
      tiktok: `Link in bio! 👆 These LED grow lights are game changers for indoor plants 🌱✨ #growlights #indoorplants #plantparent`,
      youtube: `🔗 Links mentioned in this video:\nVibeLux LED Grow Lights: ${affiliateUrl}\n\nGreat for anyone getting into indoor growing!`,
      facebook: `Just discovered these incredible LED grow lights! If you're into indoor gardening or hydroponics, definitely check them out: ${affiliateUrl}`,
      twitter: `🌿 VibeLux has some amazing LED grow lights for indoor growing! Perfect for anyone wanting to grow plants indoors 🏠🌱\n\n${affiliateUrl}\n\n#GrowLights #IndoorGardening #LEDs`
    };

    return captions[platform as keyof typeof captions] || `Check out VibeLux: ${affiliateUrl}`;
  }

  /**
   * Generate product label for printing
   */
  private generateProductLabel(product: { name: string; price?: string; description?: string }): string {
    let label = product.name;
    if (product.price) {
      label += `\n${product.price}`;
    }
    if (product.description) {
      label += `\n${product.description.substring(0, 50)}...`;
    }
    return label;
  }

  /**
   * Generate print layout (placeholder)
   */
  private async generatePrintLayout(
    qrCodes: Array<{ productName: string; qrCode: string; label?: string }>,
    options: { layout?: string; paperSize?: string }
  ): Promise<string> {
    // This would generate an SVG or Canvas layout for printing
    // Implementation depends on specific printing requirements
    return `<svg><!-- Print layout for ${qrCodes.length} QR codes --></svg>`;
  }

  /**
   * Helper methods
   */
  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private async getAffiliateLink(linkId: string) {
    // This would integrate with your database to get the link
    // For now, returning a mock structure
    return {
      id: linkId,
      shortCode: 'ABC123',
      originalUrl: 'https://vibelux.ai/products/led-lights'
    };
  }
}

// Export default instance
export const affiliateQRGenerator = new AffiliateQRGenerator();