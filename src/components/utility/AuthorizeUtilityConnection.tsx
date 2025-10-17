/**
 * Utility Connection Authorization Component
 * Handles customer authorization flow for utility data access
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, Shield, Zap } from 'lucide-react';
import { logger } from '@/lib/client-logger';

interface AuthorizeUtilityConnectionProps {
  facilityId: string;
  facilityName: string;
  onSuccess?: () => void;
}

export default function AuthorizeUtilityConnection({
  facilityId,
  facilityName,
  onSuccess
}: AuthorizeUtilityConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success' | 'error'>('idle');
  const [authUrl, setAuthUrl] = useState<string>('');

  const handleAuthorize = async () => {
    setIsLoading(true);
    setStatus('authorizing');

    try {
      const response = await fetch(`/api/utility/authorize?facilityId=${facilityId}`);
      const data = await response.json();

      if (response.ok) {
        setAuthUrl(data.authorizationUrl);
        // Open authorization URL in new window
        window.open(data.authorizationUrl, '_blank', 'width=600,height=700');
        
        // Poll for completion (in real app, you'd use webhooks)
        pollForCompletion();
      } else {
        throw new Error(data.error || 'Authorization failed');
      }
    } catch (error) {
      logger.error('system', 'Authorization error:', error );
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const pollForCompletion = () => {
    // Simple polling - in production, use webhooks
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/utility/connections?facilityId=${facilityId}`);
        const data = await response.json();
        
        if (data.connections?.length > 0) {
          setStatus('success');
          clearInterval(interval);
          onSuccess?.();
        }
      } catch (error) {
        logger.error('system', 'Polling error:', error );
      }
    }, 5000);

    // Stop polling after 10 minutes
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Connect Your Utility Account
        </CardTitle>
        <CardDescription>
          Authorize VibeLux to access your utility data for {facilityName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'idle' && (
          <>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure & Private</h4>
                  <p className="text-sm text-gray-600">
                    We use bank-level encryption and never store your utility login credentials
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Automatic Data Sync</h4>
                  <p className="text-sm text-gray-600">
                    Get real-time energy usage and billing data for accurate savings calculations
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>What happens next:</strong>
                <ol className="mt-2 space-y-1 text-sm">
                  <li>1. Click "Authorize Connection" to open your utility's secure portal</li>
                  <li>2. Login with your utility account credentials</li>
                  <li>3. Grant VibeLux permission to access your energy data</li>
                  <li>4. Return here to complete the setup</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleAuthorize}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Preparing Authorization...' : 'Authorize Connection'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {status === 'authorizing' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h4 className="font-medium">Waiting for Authorization</h4>
              <p className="text-sm text-gray-600">
                Complete the authorization in the popup window, then return here
              </p>
            </div>
            <Button variant="outline" onClick={() => window.open(authUrl, '_blank')}>
              Reopen Authorization Window
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <h4 className="font-medium text-green-800">Connection Successful!</h4>
              <p className="text-sm text-gray-600">
                Your utility account is now connected. We're syncing your historical data.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Authorization failed. Please try again or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}