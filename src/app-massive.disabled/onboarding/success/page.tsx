'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { logger } from '@/lib/client-logger';

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [utilityName, setUtilityName] = useState('');

  useEffect(() => {
    // Fire confetti on success
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Get utility info from URL params (passed by UtilityAPI)
    const utility = searchParams?.get('utility') || 'your utility';
    setUtilityName(utility);

    // Process the authorization
    processAuthorization();
  }, []);

  const processAuthorization = async () => {
    try {
      // Get authorization code from URL
      const authCode = searchParams?.get('authorization') || searchParams?.get('code');
      const facilityId = searchParams?.get('facility_id');

      if (authCode && facilityId) {
        // Send to backend to complete authorization
        const response = await fetch('/api/utility/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId,
            authorizationCode: authCode,
            utilityName
          })
        });

        if (response.ok) {
          // Success - data sync has started
          setTimeout(() => setIsProcessing(false), 2000);
        } else {
          logger.error('system', 'Authorization processing failed');
          setIsProcessing(false);
        }
      } else {
        // Direct success without code (for demo)
        setTimeout(() => setIsProcessing(false), 2000);
      }
    } catch (error) {
      logger.error('system', 'Error processing authorization:', error );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {isProcessing ? 'Connecting to Your Utility...' : 'Connection Successful!'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {isProcessing 
              ? 'Please wait while we establish a secure connection'
              : `You're now connected to ${utilityName}. We're analyzing your energy data.`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isProcessing && (
            <>
              {/* What Happens Next */}
              <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">What Happens Next:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Data Sync (24 hours)</h4>
                      <p className="text-sm text-gray-600">
                        We'll pull 12 months of historical usage and billing data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">AI Analysis (48 hours)</h4>
                      <p className="text-sm text-gray-600">
                        Our AI identifies savings opportunities and optimization strategies
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Savings Report (72 hours)</h4>
                      <p className="text-sm text-gray-600">
                        Receive your personalized savings plan with guaranteed results
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected Results */}
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">20-40%</p>
                  <p className="text-sm text-gray-600">Average Savings</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">$0</p>
                  <p className="text-sm text-gray-600">Upfront Cost</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">70/30</p>
                  <p className="text-sm text-gray-600">Revenue Share</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Go to Dashboard
                </Button>
                
                <Button
                  onClick={() => router.push('/facilities')}
                  variant="outline"
                  className="w-full"
                >
                  Add Another Location
                </Button>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                This usually takes just a few seconds...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}