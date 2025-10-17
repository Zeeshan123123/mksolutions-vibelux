/**
 * Shared Utility Integration Types
 * Extracted to break circular dependencies
 */

export interface UtilityProvider {
  id: string;
  name: string;
  region: string;
  apiEndpoint: string;
  authType: 'oauth2' | 'api-key' | 'basic';
  supportedServices: ('billing' | 'usage' | 'outages' | 'rates' | 'rebates')[];
  rateStructure: 'fixed' | 'tiered' | 'time-of-use' | 'demand';
  ratePeriods?: {
    peak: { start: string; end: string; rate: number };
    offPeak: { start: string; end: string; rate: number };
    shoulder?: { start: string; end: string; rate: number };
  };
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUrl: string;
  scope: string[];
}

export interface UtilityCredentials {
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  username?: string;
  accountNumber?: string;
  expiresAt?: Date;
}