'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, TrendingUp, Crown } from 'lucide-react';
import { hasFeatureAccess, hasModuleAccess, getUpgradePrompt, type TierLevel } from '@/lib/access-control';
import { SUBSCRIPTION_TIERS } from '@/lib/pricing/unified-pricing';

interface TierGateProps {
  feature?: keyof ReturnType<typeof getUpgradePrompt>;
  module?: string;
  userTier: TierLevel;
  userModules?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function TierGate({
  feature,
  module,
  userTier,
  userModules = [],
  children,
  fallback,
  showUpgradePrompt = true,
}: TierGateProps) {
  const router = useRouter();
  
  // Check access
  const hasAccess = feature 
    ? hasFeatureAccess(feature, userTier)
    : module 
    ? hasModuleAccess(module, userTier, userModules)
    : true;
    
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Show upgrade prompt if enabled
  if (!showUpgradePrompt) {
    return null;
  }
  
  const upgradeInfo = feature ? getUpgradePrompt(feature) : null;
  const requiredTier = upgradeInfo?.requiredTier || 'professional';
  const tierData = SUBSCRIPTION_TIERS[requiredTier];
  
  const tierIcons = {
    starter: <Sparkles className="w-5 h-5" />,
    professional: <TrendingUp className="w-5 h-5" />,
    enterprise: <Crown className="w-5 h-5" />,
  };
  
  return (
    <Card className="border-2 border-dashed border-gray-700 bg-gray-900/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
        <CardTitle className="text-xl">
          {upgradeInfo?.title || 'Premium Feature'}
        </CardTitle>
        <CardDescription className="text-base">
          {upgradeInfo?.description || 'This feature requires a higher subscription tier.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400">Requires</span>
          <Badge variant="secondary" className="gap-1">
            {tierIcons[requiredTier as keyof typeof tierIcons]}
            {tierData.name} Tier
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => router.push('/pricing')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Upgrade to {tierData.name}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/pricing#compare')}
            className="w-full"
          >
            Compare Plans
          </Button>
        </div>
        
        {tierData.price > 0 && (
          <p className="text-sm text-gray-400">
            Starting at ${tierData.price}/month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Inline tier gate for smaller UI elements
export function InlineTierGate({
  feature,
  module,
  userTier,
  userModules = [],
  children,
  showLock = true,
}: Omit<TierGateProps, 'fallback' | 'showUpgradePrompt'> & { showLock?: boolean }) {
  const hasAccess = feature 
    ? hasFeatureAccess(feature, userTier)
    : module 
    ? hasModuleAccess(module, userTier, userModules)
    : true;
    
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative opacity-50 cursor-not-allowed">
      {children}
      {showLock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}

// Tab with tier indicator
export function TierTabTrigger({
  value,
  feature,
  userTier,
  children,
  className,
  ...props
}: {
  value: string;
  feature?: keyof ReturnType<typeof getUpgradePrompt>;
  userTier: TierLevel;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const hasAccess = feature ? hasFeatureAccess(feature, userTier) : true;
  
  return (
    <div className="relative">
      {children}
      {!hasAccess && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 h-5 px-1.5 bg-purple-900/50 text-purple-300"
        >
          <Lock className="w-3 h-3" />
        </Badge>
      )}
    </div>
  );
}