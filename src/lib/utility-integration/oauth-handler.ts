/**
 * OAuth Handler for Utility Authentication
 * Manages OAuth flows for various utility providers
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/lib/db';
import { UtilityProvider } from './utility-types';
import { PGEConnector } from './connectors/pge-connector';
import { SCEConnector } from './connectors/sce-connector';
import { UtilityAPIConnector } from './connectors/utilityapi-connector';

export interface OAuthState {
  facilityId: string;
  providerId: string;
  userId: string;
  timestamp: number;
  nonce: string;
}

export interface OAuthSession {
  id: string;
  facilityId: string;
  providerId: string;
  userId: string;
  state: string;
  codeVerifier?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
  error?: string;
}

export class OAuthHandler {
  private stateStore = new Map<string, OAuthState>();
  private sessionTimeout = 10 * 60 * 1000; // 10 minutes

  /**
   * Initialize OAuth flow
   */
  async initializeOAuthFlow(
    facilityId: string,
    providerId: string,
    userId: string,
    redirectUri: string
  ): Promise<{ authUrl: string; sessionId: string }> {
    // Create secure state parameter
    const state = this.generateSecureState();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Store state data
    const stateData: OAuthState = {
      facilityId,
      providerId,
      userId,
      timestamp: Date.now(),
      nonce
    };
    
    this.stateStore.set(state, stateData);
    
    // Create session in database
    const session = await this.createOAuthSession({
      facilityId,
      providerId,
      userId,
      state,
      redirectUri
    });
    
    // Get authorization URL based on provider
    const authUrl = await this.getProviderAuthUrl(providerId, state, redirectUri);
    
    // Clean up old states
    this.cleanupExpiredStates();
    
    return {
      authUrl,
      sessionId: session.id
    };
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    code: string,
    state: string
  ): Promise<{ success: boolean; facilityId?: string; error?: string }> {
    try {
      // Validate state
      const stateData = this.stateStore.get(state);
      if (!stateData) {
        throw new Error('Invalid or expired state parameter');
      }
      
      // Check state expiration
      if (Date.now() - stateData.timestamp > this.sessionTimeout) {
        throw new Error('OAuth session expired');
      }
      
      // Get session from database
      const session = await this.getOAuthSession(state);
      if (!session) {
        throw new Error('OAuth session not found');
      }
      
      // Exchange code for tokens
      const tokenResult = await this.exchangeCodeForTokens(
        session.providerId,
        code,
        session.redirectUri || ''
      );
      
      if (!tokenResult.success) {
        throw new Error(tokenResult.error || 'Token exchange failed');
      }
      
      // Store tokens securely
      await this.storeTokens(
        stateData.facilityId,
        stateData.providerId,
        tokenResult.accessToken!,
        tokenResult.refreshToken!,
        tokenResult.expiresIn!
      );
      
      // Update session status
      await this.updateSessionStatus(session.id, 'completed');
      
      // Clean up state
      this.stateStore.delete(state);
      
      return {
        success: true,
        facilityId: stateData.facilityId
      };
      
    } catch (error) {
      logger.error('api', 'OAuth callback error:', error );
      
      // Update session status
      if (state) {
        const session = await this.getOAuthSession(state);
        if (session) {
          await this.updateSessionStatus(
            session.id, 
            'failed', 
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed'
      };
    }
  }

  /**
   * Get provider-specific auth URL
   */
  private async getProviderAuthUrl(
    providerId: string,
    state: string,
    redirectUri: string
  ): Promise<string> {
    const config = await this.getProviderConfig(providerId);
    
    switch (providerId) {
      case 'pge': {
        const connector = new PGEConnector({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri
        });
        return connector.getAuthorizationUrl(state);
      }
      
      case 'sce': {
        const connector = new SCEConnector({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri
        });
        return connector.getAuthorizationUrl(state);
      }
      
      case 'utilityapi': {
        // UtilityAPI uses a different flow with forms
        throw new Error('UtilityAPI requires form-based authorization');
      }
      
      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(
    providerId: string,
    code: string,
    redirectUri: string
  ): Promise<any> {
    const config = await this.getProviderConfig(providerId);
    
    switch (providerId) {
      case 'pge': {
        const connector = new PGEConnector({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri
        });
        return await connector.exchangeCodeForToken(code);
      }
      
      case 'sce': {
        const connector = new SCEConnector({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri
        });
        return await connector.exchangeCodeForToken(code);
      }
      
      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  }

  /**
   * Store OAuth tokens securely
   */
  private async storeTokens(
    facilityId: string,
    providerId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    const encryptedTokens = {
      accessToken: this.encryptToken(accessToken),
      refreshToken: this.encryptToken(refreshToken),
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    };
    
    await sql`
      INSERT INTO utility_oauth_tokens (
        facility_id,
        provider_id,
        access_token,
        refresh_token,
        expires_at,
        created_at
      ) VALUES (
        ${facilityId},
        ${providerId},
        ${encryptedTokens.accessToken},
        ${encryptedTokens.refreshToken},
        ${encryptedTokens.expiresAt},
        NOW()
      )
      ON CONFLICT (facility_id, provider_id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `;
  }

  /**
   * Create OAuth session in database
   */
  private async createOAuthSession(params: {
    facilityId: string;
    providerId: string;
    userId: string;
    state: string;
    redirectUri: string;
  }): Promise<OAuthSession> {
    const [session] = await sql<OAuthSession[]>`
      INSERT INTO oauth_sessions (
        facility_id,
        provider_id,
        user_id,
        state,
        redirect_uri,
        status,
        expires_at
      ) VALUES (
        ${params.facilityId},
        ${params.providerId},
        ${params.userId},
        ${params.state},
        ${params.redirectUri},
        'pending',
        ${new Date(Date.now() + this.sessionTimeout)}
      )
      RETURNING *
    `;
    
    return session;
  }

  /**
   * Get OAuth session by state
   */
  private async getOAuthSession(state: string): Promise<OAuthSession | null> {
    const [session] = await sql<OAuthSession[]>`
      SELECT * FROM oauth_sessions
      WHERE state = ${state}
      AND expires_at > NOW()
      AND status = 'pending'
    `;
    
    return session || null;
  }

  /**
   * Update session status
   */
  private async updateSessionStatus(
    sessionId: string,
    status: 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    await sql`
      UPDATE oauth_sessions
      SET 
        status = ${status},
        error = ${error || null},
        updated_at = NOW()
      WHERE id = ${sessionId}
    `;
  }

  /**
   * Get provider configuration
   */
  private async getProviderConfig(providerId: string): Promise<any> {
    // In production, fetch from secure config or environment
    const configs: Record<string, any> = {
      pge: {
        clientId: process.env.PGE_CLIENT_ID!,
        clientSecret: process.env.PGE_CLIENT_SECRET!
      },
      sce: {
        clientId: process.env.SCE_CLIENT_ID!,
        clientSecret: process.env.SCE_CLIENT_SECRET!
      }
    };
    
    const config = configs[providerId];
    if (!config) {
      throw new Error(`Configuration not found for provider: ${providerId}`);
    }
    
    return config;
  }

  /**
   * Generate secure state parameter
   */
  private generateSecureState(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Encrypt token for storage
   */
  private encryptToken(token: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.UTILITY_ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt token
   */
  decryptToken(encryptedToken: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.UTILITY_ENCRYPTION_KEY!, 'hex');
    
    const parts = encryptedToken.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Clean up expired states
   */
  private cleanupExpiredStates(): void {
    const now = Date.now();
    const expiredStates: string[] = [];
    
    this.stateStore.forEach((state, key) => {
      if (now - state.timestamp > this.sessionTimeout) {
        expiredStates.push(key);
      }
    });
    
    expiredStates.forEach(key => this.stateStore.delete(key));
  }

  /**
   * Refresh access token if needed
   */
  async refreshTokenIfNeeded(
    facilityId: string,
    providerId: string
  ): Promise<string | null> {
    const [tokenData] = await sql`
      SELECT * FROM utility_oauth_tokens
      WHERE facility_id = ${facilityId}
      AND provider_id = ${providerId}
    `;
    
    if (!tokenData) {
      return null;
    }
    
    // Check if token is expired or will expire soon (5 minutes buffer)
    const expiresAt = new Date(tokenData.expires_at);
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    
    if (expiresAt.getTime() - Date.now() > bufferTime) {
      // Token is still valid
      return this.decryptToken(tokenData.access_token);
    }
    
    // Need to refresh token
    const config = await this.getProviderConfig(providerId);
    const refreshToken = this.decryptToken(tokenData.refresh_token);
    
    let refreshResult;
    switch (providerId) {
      case 'pge': {
        const connector = new PGEConnector({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: '' // Not needed for refresh
        });
        refreshResult = await connector.refreshAccessToken(refreshToken);
        break;
      }
      
      case 'sce': {
        const connector = new SCEConnector({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: ''
        });
        refreshResult = await connector.refreshAccessToken(refreshToken);
        break;
      }
      
      default:
        throw new Error(`Token refresh not supported for provider: ${providerId}`);
    }
    
    if (refreshResult.success) {
      await this.storeTokens(
        facilityId,
        providerId,
        refreshResult.accessToken!,
        refreshResult.refreshToken!,
        refreshResult.expiresIn!
      );
      
      return refreshResult.accessToken!;
    }
    
    return null;
  }
}

export default OAuthHandler;