/**
 * S3 Storage Client for VibeLux
 * Handles file storage and retrieval from AWS S3
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { createHash } from 'crypto';

export interface S3Config {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket: string;
  endpoint?: string; // For S3-compatible services
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  acl?: 'private' | 'public-read';
  cacheControl?: string;
  contentDisposition?: string;
  serverSideEncryption?: boolean;
}

export interface FileObject {
  key: string;
  size: number;
  lastModified: Date;
  etag?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class S3StorageClient {
  private client: S3Client;
  private bucket: string;

  constructor(config?: S3Config) {
    const defaultConfig: S3Config = {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET || 'vibelux-storage',
    };

    const finalConfig = { ...defaultConfig, ...config };
    this.bucket = finalConfig.bucket;

    this.client = new S3Client({
      region: finalConfig.region,
      credentials: finalConfig.accessKeyId && finalConfig.secretAccessKey ? {
        accessKeyId: finalConfig.accessKeyId,
        secretAccessKey: finalConfig.secretAccessKey,
      } : undefined,
      endpoint: finalConfig.endpoint,
    });
  }

  async upload(
    key: string,
    body: Buffer | Uint8Array | string | Readable,
    options?: UploadOptions
  ): Promise<{ key: string; etag: string; url: string }> {
    try {
      const input: PutObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: options?.contentType || this.getContentType(key),
        Metadata: options?.metadata,
        CacheControl: options?.cacheControl,
        ContentDisposition: options?.contentDisposition,
        ACL: options?.acl,
        ServerSideEncryption: options?.serverSideEncryption ? 'AES256' : undefined,
      };

      if (options?.tags) {
        input.Tagging = Object.entries(options.tags)
          .map(([k, v]) => `${k}=${v}`)
          .join('&');
      }

      const command = new PutObjectCommand(input);
      const response = await this.client.send(command);

      const url = await this.getSignedUrl(key, 3600); // 1 hour expiry

      return {
        key,
        etag: response.ETag || '',
        url,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      return this.streamToBuffer(response.Body as Readable);
    } catch (error) {
      console.error('S3 download error:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  async getStream(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      return response.Body as Readable;
    } catch (error) {
      console.error('S3 stream error:', error);
      throw new Error(`Failed to get file stream: ${error}`);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async getMetadata(key: string): Promise<FileObject | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        etag: response.ETag,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async list(
    prefix?: string,
    maxKeys: number = 1000
  ): Promise<FileObject[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.client.send(command);
      
      return (response.Contents || []).map(obj => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
        etag: obj.ETag,
      }));
    } catch (error) {
      console.error('S3 list error:', error);
      throw new Error(`Failed to list files: ${error}`);
    }
  }

  async copy(
    sourceKey: string,
    destinationKey: string,
    options?: UploadOptions
  ): Promise<{ key: string; etag: string }> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
        MetadataDirective: options?.metadata ? 'REPLACE' : 'COPY',
        Metadata: options?.metadata,
        ContentType: options?.contentType,
        ACL: options?.acl,
        ServerSideEncryption: options?.serverSideEncryption ? 'AES256' : undefined,
      });

      const response = await this.client.send(command);

      return {
        key: destinationKey,
        etag: response.CopyObjectResult?.ETag || '',
      };
    } catch (error) {
      console.error('S3 copy error:', error);
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  async getSignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  async getUploadUrl(
    key: string,
    contentType?: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType || this.getContentType(key),
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('S3 upload URL error:', error);
      throw new Error(`Failed to generate upload URL: ${error}`);
    }
  }

  // Helper methods
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      json: 'application/json',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      zip: 'application/zip',
      txt: 'text/plain',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  generateKey(prefix: string, filename: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hash = createHash('md5').update(filename + Date.now()).digest('hex').substr(0, 8);
    
    return `${prefix}/${year}/${month}/${day}/${hash}-${filename}`;
  }

  // Batch operations
  async uploadBatch(
    files: Array<{ key: string; body: Buffer | string; options?: UploadOptions }>
  ): Promise<Array<{ key: string; etag: string; url: string; error?: string }>> {
    const results = await Promise.allSettled(
      files.map(file => this.upload(file.key, file.body, file.options))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          key: files[index].key,
          etag: '',
          url: '',
          error: result.reason.message,
        };
      }
    });
  }

  async deleteBatch(keys: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    const results = await Promise.allSettled(keys.map(key => this.delete(key)));
    
    const deleted: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        deleted.push(keys[index]);
      } else {
        failed.push(keys[index]);
      }
    });

    return { deleted, failed };
  }
}

// Export singleton instance
export const s3Client = new S3StorageClient();