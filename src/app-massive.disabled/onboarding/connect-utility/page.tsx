'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Shield, Clock, ArrowRight, CheckCircle } from 'lucide-react';

export default function ConnectUtilityPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [facilityId, setFacilityId] = useState<string>('');

  useEffect(() => {
    // Get facility ID from URL or user metadata
    const urlFacilityId = searchParams?.get('facility_id');
    if (urlFacilityId) {
      setFacilityId(urlFacilityId);
    } else if (user?.publicMetadata?.facilityId) {
      setFacilityId(user.publicMetadata.facilityId as string);
    }
  }, [user, searchParams]);

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Build UtilityAPI authorization URL
    const authUrl = new URL('https://utilityapi.com/authorize/blake_vibelux');
    
    // Add parameters
    authUrl.searchParams.append('facility_id', facilityId);
    authUrl.searchParams.append('user_id', user?.id || '');
    authUrl.searchParams.append('redirect_uri', `${window.location.origin}/onboarding/success`);
    
    // Redirect to UtilityAPI
    window.location.href = authUrl.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">Connect Your Utility Account</CardTitle>
          <CardDescription className="text-lg mt-2">
            Authorize VibeLux to access your energy data and start saving immediately
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">30-Second Setup</h3>
                <p className="text-sm text-gray-600">
                  No manual data entry or PDF uploads. Connect directly to your utility.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Bank-Level Security</h3>
                <p className="text-sm text-gray-600">
                  Your utility credentials are never stored. OAuth 2.0 secure authorization.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Automatic Savings Tracking</h3>
                <p className="text-sm text-gray-600">
                  We'll analyze 12 months of data and identify savings opportunities instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>Your Privacy Protected:</strong> We only access energy usage and billing data. 
              Personal information remains secure with your utility company. You can revoke access anytime.
            </AlertDescription>
          </Alert>

          {/* Supported Utilities */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Currently supporting:</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <span className="font-semibold text-gray-700">PG&E</span>
              <span className="font-semibold text-gray-700">SCE</span>
              <span className="font-semibold text-gray-700">ConEd</span>
              <span className="font-semibold text-gray-700">ComEd</span>
              <span className="text-blue-600 font-medium">+ More</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !facilityId}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Redirecting to Your Utility...
                </>
              ) : (
                <>
                  Connect Utility Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {!facilityId && (
              <p className="text-sm text-red-600 text-center mt-2">
                Missing facility information. Please contact support.
              </p>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now (you can connect later)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}