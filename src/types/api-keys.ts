export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only present when initially created or regenerated
  keyPreview: string;
  permissions: string[];
  rateLimit: number;
  environment: 'development' | 'staging' | 'production';
  expiresAt?: Date;
  lastUsed?: Date;
  createdAt: Date;
  status: 'active' | 'expired' | 'revoked';
  usage: {
    today: number;
    thisMonth: number;
    total: number;
  };
}

export interface CreateApiKeyRequest {
  name: string;
  environment: 'development' | 'staging' | 'production';
  permissions: string[];
  expiresIn: string;
  rateLimit: number;
}

export interface ApiKeyResponse extends ApiKey {
  message?: string;
}