/**
 * Twilio SMS Client for VibeLux
 * Handles SMS notifications and alerts
 */

import twilio from 'twilio';

export interface SMSMessage {
  to: string;
  body: string;
  mediaUrl?: string[];
  scheduledTime?: Date;
}

export interface SMSResponse {
  messageId: string;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'delivered';
  errorCode?: string;
  errorMessage?: string;
  price?: string;
  priceUnit?: string;
}

export class TwilioClient {
  private client: twilio.Twilio;
  private fromNumber: string;
  private messagingServiceSid?: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      const messageOptions: any = {
        to: message.to,
        body: message.body,
        from: this.messagingServiceSid ? undefined : this.fromNumber,
        messagingServiceSid: this.messagingServiceSid,
      };

      if (message.mediaUrl && message.mediaUrl.length > 0) {
        messageOptions.mediaUrl = message.mediaUrl;
      }

      if (message.scheduledTime) {
        messageOptions.sendAt = message.scheduledTime;
        messageOptions.scheduleType = 'fixed';
      }

      const response = await this.client.messages.create(messageOptions);

      return {
        messageId: response.sid,
        status: response.status as SMSResponse['status'],
        price: response.price,
        priceUnit: response.priceUnit,
      };
    } catch (error: any) {
      console.error('Twilio SMS Error:', error);
      return {
        messageId: '',
        status: 'failed',
        errorCode: error.code,
        errorMessage: error.message,
      };
    }
  }

  async sendBulkSMS(
    recipients: string[],
    body: string,
    options?: { mediaUrl?: string[]; dedupeRecipients?: boolean }
  ): Promise<SMSResponse[]> {
    // Remove duplicates if requested
    const uniqueRecipients = options?.dedupeRecipients
      ? Array.from(new Set(recipients))
      : recipients;

    // Send messages in parallel with rate limiting
    const batchSize = 10; // Twilio rate limit consideration
    const results: SMSResponse[] = [];

    for (let i = 0; i < uniqueRecipients.length; i += batchSize) {
      const batch = uniqueRecipients.slice(i, i + batchSize);
      const batchPromises = batch.map(to =>
        this.sendSMS({ to, body, mediaUrl: options?.mediaUrl })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting delay between batches
      if (i + batchSize < uniqueRecipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  async getMessageStatus(messageId: string): Promise<SMSResponse['status']> {
    try {
      const message = await this.client.messages(messageId).fetch();
      return message.status as SMSResponse['status'];
    } catch (error) {
      console.error('Error fetching message status:', error);
      return 'failed';
    }
  }

  async sendAlert(phoneNumber: string, alertType: string, details: Record<string, any>): Promise<SMSResponse> {
    const alertTemplates: Record<string, string> = {
      temperature: '🌡️ TEMP ALERT: {{location}} is at {{value}}°C ({{threshold}} threshold)',
      humidity: '💧 HUMIDITY ALERT: {{location}} at {{value}}% ({{threshold}} threshold)',
      equipment: '⚠️ EQUIPMENT ALERT: {{equipment}} - {{status}}',
      pest: '🐛 PEST ALERT: {{pestType}} detected in {{location}}',
      system: '🚨 SYSTEM ALERT: {{message}}',
      harvest: '🌿 HARVEST READY: {{crop}} in {{location}} is ready for harvest',
    };

    const template = alertTemplates[alertType] || alertTemplates.system;
    let message = template;

    // Replace placeholders
    Object.entries(details).forEach(([key, value]) => {
      message = message.replace(`{{${key}}}`, String(value));
    });

    // Add facility name and timestamp
    message = `[VibeLux] ${message}\n${new Date().toLocaleString()}`;

    return this.sendSMS({ to: phoneNumber, body: message });
  }

  async verifyPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const lookup = await this.client.lookups.v1
        .phoneNumbers(phoneNumber)
        .fetch({ type: ['carrier'] });
      
      return lookup.phoneNumber !== null;
    } catch (error) {
      console.error('Phone verification error:', error);
      return false;
    }
  }

  async createVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const verification = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms',
        });

      return { success: verification.status === 'pending' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async checkVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<{ verified: boolean; error?: string }> {
    try {
      const verificationCheck = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({
          to: phoneNumber,
          code,
        });

      return { verified: verificationCheck.status === 'approved' };
    } catch (error: any) {
      return { verified: false, error: error.message };
    }
  }

  // Format phone numbers to E.164 format
  formatPhoneNumber(phoneNumber: string, defaultCountryCode: string = '+1'): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      if (cleaned.length === 10) {
        // Assume US/CA number
        cleaned = defaultCountryCode + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        // US/CA with country code
        cleaned = '+' + cleaned;
      } else {
        // Add default country code
        cleaned = defaultCountryCode + cleaned;
      }
    } else {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const twilioClient = new TwilioClient();