import { logger } from '@/lib/logging/production-logger';
// Autodesk authentication helper
let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  try {
    const response = await fetch('/api/autodesk/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get Autodesk access token');
    }

    const data = await response.json();
    
    // Cache the token with expiration
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000 // Subtract 60s for safety
    };

    return data.access_token;
  } catch (error) {
    logger.error('api', 'Autodesk authentication error:', error );
    throw error;
  }
}

// Clear cached token
export function clearAccessToken() {
  cachedToken = null;
}

// Check if token is valid
export function isTokenValid(): boolean {
  return cachedToken !== null && cachedToken.expires_at > Date.now();
}