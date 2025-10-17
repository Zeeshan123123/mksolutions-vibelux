import { UnifiedPricingPage } from '@/components/pricing/UnifiedPricingPage';
import { DetailedPricingComparison } from '@/components/pricing/DetailedPricingComparison';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - 1000+ Features Starting at $29/month | VibeLux',
  description: 'Access the industry\'s most comprehensive platform with 1000+ features. Free Energy Savings Program or plans from $29/month. Includes 25+ calculators, 1,000+ components, AI optimization, and complete facility management.',
  keywords: 'VibeLux pricing, CEA platform, grow light software, facility management, energy optimization, agricultural automation, cultivation software',
};

export default function PricingPage() {
  return (
    <>
      <UnifiedPricingPage />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <DetailedPricingComparison />
      </div>
    </>
  );
}