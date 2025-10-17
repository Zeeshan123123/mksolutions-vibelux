/**
 * Unified Autodesk Forge Integration Service
 * Handles all Forge API interactions for VibeLux
 */

import { logger } from '@/lib/logging/production-logger';

export interface ForgeCredentials {
  clientId: string;
  clientSecret: string;
  bucketKey?: string;
}

export interface ForgeUploadResult {
  success: boolean;
  urn?: string;
  objectId?: string;
  error?: string;
}

export interface ForgeTranslationStatus {
  status: 'pending' | 'inprogress' | 'success' | 'failed' | 'timeout';
  progress: string;
  messages?: any[];
}

export interface ForgeViewerOptions {
  urn: string;
  viewType?: '2d' | '3d';
  extensions?: string[];
}

export class ForgeIntegrationService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private credentials: ForgeCredentials;

  constructor(credentials?: ForgeCredentials) {
    this.credentials = credentials || {
      clientId: process.env.FORGE_CLIENT_ID || '',
      clientSecret: process.env.FORGE_CLIENT_SECRET || '',
      bucketKey: process.env.FORGE_BUCKET_KEY || 'vibelux-designs'
    };
  }

  /**
   * Authenticate with Autodesk Forge
   */
  async authenticate(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return this.accessToken;
      }

      const response = await fetch('https://developer.api.autodesk.com/authentication/v1/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          grant_type: 'client_credentials',
          scope: 'data:read data:write data:create bucket:create bucket:read bucket:update bucket:delete'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

      logger.info('Forge authentication successful');
      return this.accessToken;
    } catch (error) {
      logger.error('Forge authentication failed:', error);
      throw error;
    }
  }

  /**
   * Create a storage bucket if it doesn't exist
   */
  async createBucket(bucketKey?: string): Promise<boolean> {
    try {
      const token = await this.authenticate();
      const bucket = bucketKey || this.credentials.bucketKey || 'vibelux-designs';

      const response = await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketKey: bucket,
          policyKey: 'persistent'
        })
      });

      if (response.status === 409) {
        // Bucket already exists
        return true;
      }

      if (!response.ok) {
        throw new Error(`Bucket creation failed: ${response.statusText}`);
      }

      logger.info(`Forge bucket created: ${bucket}`);
      return true;
    } catch (error) {
      logger.error('Forge bucket creation failed:', error);
      return false;
    }
  }

  /**
   * Upload a file to Forge
   */
  async uploadFile(file: File | Buffer, objectKey: string): Promise<ForgeUploadResult> {
    try {
      const token = await this.authenticate();
      const bucket = this.credentials.bucketKey || 'vibelux-designs';

      // Ensure bucket exists
      await this.createBucket(bucket);

      // Upload the file
      const response = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${bucket}/objects/${objectKey}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream'
          },
          body: file
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      const urn = Buffer.from(data.objectId).toString('base64').replace(/=/g, '');

      logger.info(`File uploaded to Forge: ${objectKey}`);
      
      return {
        success: true,
        urn,
        objectId: data.objectId
      };
    } catch (error) {
      logger.error('Forge upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start model translation/conversion
   */
  async translateModel(urn: string, outputFormat?: string): Promise<boolean> {
    try {
      const token = await this.authenticate();

      const response = await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-ads-force': 'true'
        },
        body: JSON.stringify({
          input: {
            urn,
            compressedUrn: false
          },
          output: {
            formats: [
              {
                type: outputFormat || 'svf2',
                views: ['2d', '3d']
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      logger.info(`Model translation started for URN: ${urn}`);
      return true;
    } catch (error) {
      logger.error('Forge translation failed:', error);
      return false;
    }
  }

  /**
   * Check translation status
   */
  async getTranslationStatus(urn: string): Promise<ForgeTranslationStatus> {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        status: data.status,
        progress: data.progress,
        messages: data.messages
      };
    } catch (error) {
      logger.error('Forge status check failed:', error);
      return {
        status: 'failed',
        progress: '0%'
      };
    }
  }

  /**
   * Generate viewer URL for embedded viewing
   */
  generateViewerUrl(urn: string): string {
    return `https://autodesk.github.io/forge-viewer-vue-nodejs-visual-reports/#/viewer?urn=${urn}`;
  }

  /**
   * Download derivatives (converted files)
   */
  async downloadDerivative(urn: string, derivativeUrn: string): Promise<Buffer | null> {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest/${derivativeUrn}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      logger.error('Forge download failed:', error);
      return null;
    }
  }

  /**
   * Export to specific format (DWG, IFC, etc.)
   */
  async exportToFormat(urn: string, format: 'dwg' | 'ifc' | 'rvt' | 'fbx' | 'obj'): Promise<Buffer | null> {
    try {
      // Start export job
      const token = await this.authenticate();

      const response = await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { urn },
          output: {
            formats: [{
              type: format,
              advanced: {
                exportFileStructure: 'single'
              }
            }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Wait for export to complete
      await this.waitForTranslation(urn);

      // Get manifest to find derivative URN
      const manifestResponse = await fetch(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const manifest = await manifestResponse.json();
      const derivative = manifest.derivatives?.find((d: any) => 
        d.outputType === format.toUpperCase()
      );

      if (!derivative) {
        throw new Error(`Export format ${format} not found`);
      }

      // Download the exported file
      return await this.downloadDerivative(urn, derivative.urn);
    } catch (error) {
      logger.error(`Export to ${format} failed:`, error);
      return null;
    }
  }

  /**
   * Wait for translation to complete
   */
  private async waitForTranslation(urn: string, maxWaitTime = 300000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTranslationStatus(urn);
      
      if (status.status === 'success') {
        return true;
      }
      
      if (status.status === 'failed' || status.status === 'timeout') {
        return false;
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return false;
  }

  /**
   * Get thumbnail for a model
   */
  async getThumbnail(urn: string, width = 400, height = 400): Promise<Buffer | null> {
    try {
      const token = await this.authenticate();

      const response = await fetch(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/thumbnail?width=${width}&height=${height}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Thumbnail fetch failed: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      logger.error('Forge thumbnail fetch failed:', error);
      return null;
    }
  }

  /**
   * List all objects in bucket
   */
  async listObjects(): Promise<any[]> {
    try {
      const token = await this.authenticate();
      const bucket = this.credentials.bucketKey || 'vibelux-designs';

      const response = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${bucket}/objects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`List objects failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      logger.error('Forge list objects failed:', error);
      return [];
    }
  }

  /**
   * Delete an object from bucket
   */
  async deleteObject(objectKey: string): Promise<boolean> {
    try {
      const token = await this.authenticate();
      const bucket = this.credentials.bucketKey || 'vibelux-designs';

      const response = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${bucket}/objects/${objectKey}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      logger.info(`Object deleted from Forge: ${objectKey}`);
      return true;
    } catch (error) {
      logger.error('Forge delete failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const forgeService = new ForgeIntegrationService();