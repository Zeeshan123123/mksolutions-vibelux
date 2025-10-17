'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MODULES } from '@/lib/pricing/unified-pricing';
import { 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Zap,
  Crown,
  Sparkles
} from 'lucide-react';

const FEATURE_DESCRIPTIONS = {
  'research-analytics-suite': {
    title: 'Research & Analytics Suite',
    description: 'Complete research, analytics, and biotechnology platform',
    price: '$399/month',
    features: [
      'ANOVA & statistical tests',
      'Factorial & split-plot designs',
      'Power analysis calculator',
      'Experimental design wizard',
      'Research data logger',
      'Literature review AI assistant',
      'Publication-ready reports',
      'Gene expression predictions',
      'Metabolite optimization',
      'Advanced plant health monitoring'
    ],
    category: 'Research & Science',
    icon: <Sparkles className="w-8 h-8 text-purple-400" />
  },
  'advanced-designer-suite': {
    title: 'Advanced Designer Suite',
    description: 'Complete professional design toolkit',
    price: '$89/month',
    features: [
      'Advanced lighting designer (full access)',
      'Electrical estimator (included - $29 value)',
      'Advanced PPFD/DLI calculations',
      'Custom fixture library',
      'Professional reporting',
      'CAD export capabilities',
      '3D room modeling',
      'Shadow analysis',
      'Multi-tier design',
      'IES file support'
    ],
    category: 'Design & Engineering',
    icon: <Zap className="w-8 h-8 text-blue-400" />
  },
  'smart-facility-suite': {
    title: 'Smart Facility Suite',
    description: 'Complete industrial automation and facility management',
    price: '$199/month',
    features: [
      'Multi-zone climate control',
      'Real-time environmental monitoring',
      'Control strategies builder',
      'Equipment auto-discovery',
      'Industrial protocol support (Modbus, BACnet, OPC UA)',
      'PLC integration (Allen-Bradley, Siemens)',
      'Process monitoring and control',
      'Historical data trending',
      'Energy Savings Premium (included)',
      'Weather AI Premium (included)'
    ],
    category: 'Industrial Automation',
    icon: <Crown className="w-8 h-8 text-green-400" />
  },
  'food-safety-operations-suite': {
    title: 'Food Safety & Operations Suite',
    description: 'Complete food safety compliance and operations management',
    price: '$149/month',
    features: [
      'HACCP plan templates',
      'Compliance tracking',
      'Audit preparation',
      'Regulatory reporting',
      'Certification management',
      'Employee scheduling',
      'Time tracking & clock-in',
      'QR code task assignments',
      'Mobile workforce app',
      'Labor cost analytics'
    ],
    category: 'Compliance & Operations',
    icon: <CheckCircle className="w-8 h-8 text-green-400" />
  },
  'business-intelligence-suite': {
    title: 'Business Intelligence Suite',
    description: 'Complete business intelligence and financial management',
    price: '$99/month',
    features: [
      'Advanced financial modeling',
      'Grant and rebate optimization',
      'Investment portfolio management',
      'Tax optimization strategies',
      'Automated claims processing',
      'Real-time risk monitoring',
      'Expert consultation credits',
      'Priority support access',
      'Marketplace premium features',
      'Reduced transaction fees'
    ],
    category: 'Business & Finance',
    icon: <Star className="w-8 h-8 text-yellow-400" />
  }
};

const TIER_DESCRIPTIONS = {
  starter: {
    title: 'Starter',
    price: '$49/month',
    description: 'Perfect for small operations - Get hooked on VibeLux!',
    features: [
      'Advanced lighting designer (full access)',
      'All calculators (25+)',
      'Basic environmental monitoring (view-only)',
      'Basic workflow automation (5 workflows)',
      'Standard AI credits (500/month)',
      'QR code generation',
      'Mobile app access'
    ]
  },
  professional: {
    title: 'Professional',
    price: '$149/month',
    description: 'For growing operations with full control',
    features: [
      'Everything in Starter',
      'Full BMS environmental controls',
      'Advanced workflow automation (unlimited)',
      'Advanced AI credits (2000/month)',
      'Multi-room management',
      'Advanced analytics and reporting',
      'Priority support'
    ]
  },
  enterprise: {
    title: 'Enterprise',
    price: '$299/month',
    description: 'For multi-site operations',
    features: [
      'Everything in Professional',
      'Multi-facility management',
      'Advanced integrations (unlimited)',
      'Enterprise AI credits (5000/month)',
      'White-label options',
      'Custom development support',
      'Dedicated account manager'
    ]
  }
};

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentTier, hasModule } = useSubscription();
  
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [upgradeType, setUpgradeType] = useState<'module' | 'tier'>('module');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const feature = searchParams.get('feature');
    const upgradeReason = searchParams.get('reason');
    
    if (feature) {
      setSelectedFeature(feature);
      setReason(upgradeReason || '');
      
      // Determine if this is a module or tier upgrade
      if (FEATURE_DESCRIPTIONS[feature as keyof typeof FEATURE_DESCRIPTIONS]) {
        setUpgradeType('module');
      } else if (TIER_DESCRIPTIONS[feature as keyof typeof TIER_DESCRIPTIONS]) {
        setUpgradeType('tier');
      }
    }
  }, [searchParams]);

  const handleUpgrade = (featureId: string) => {
    // Redirect to actual payment/subscription flow
    router.push(`/pricing?upgrade=${featureId}&source=paywall`);
  };

  const renderFeatureUpgrade = () => {
    if (!selectedFeature) return null;
    
    const featureInfo = FEATURE_DESCRIPTIONS[selectedFeature as keyof typeof FEATURE_DESCRIPTIONS];
    if (!featureInfo) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
            {featureInfo.icon}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{featureInfo.title} Required</h1>
          <p className="text-gray-400 text-lg">{featureInfo.description}</p>
          {reason && (
            <div className="mt-4 px-4 py-2 bg-red-900/20 border border-red-700 rounded-lg inline-block">
              <p className="text-red-400 text-sm">{decodeURIComponent(reason)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Details */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">What's Included</h3>
              <span className="text-2xl font-bold text-green-400">{featureInfo.price}</span>
            </div>
            
            <ul className="space-y-3">
              {featureInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade Action */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Upgrade?</h3>
              <p className="text-gray-400 mb-6">
                Get instant access to {featureInfo.title} and unlock powerful capabilities for your operation.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleUpgrade(selectedFeature)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Upgrade Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                >
                  View All Plans
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="w-full px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTierUpgrade = () => {
    if (!selectedFeature) return null;
    
    const tierInfo = TIER_DESCRIPTIONS[selectedFeature as keyof typeof TIER_DESCRIPTIONS];
    if (!tierInfo) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
            <Crown className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{tierInfo.title} Tier Required</h1>
          <p className="text-gray-400 text-lg">{tierInfo.description}</p>
          {reason && (
            <div className="mt-4 px-4 py-2 bg-red-900/20 border border-red-700 rounded-lg inline-block">
              <p className="text-red-400 text-sm">{decodeURIComponent(reason)}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Upgrade to {tierInfo.title}</h3>
            <span className="text-2xl font-bold text-green-400">{tierInfo.price}</span>
          </div>
          
          <ul className="space-y-3 mb-6">
            {tierInfo.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleUpgrade(selectedFeature)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              Upgrade to {tierInfo.title}
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {upgradeType === 'module' ? renderFeatureUpgrade() : renderTierUpgrade()}
      </div>
    </div>
  );
}