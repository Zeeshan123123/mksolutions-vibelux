import { UnifiedPricingPage } from '@/components/pricing/UnifiedPricingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simple Pricing - Start Free & Save Energy | VibeLux',
  description: 'Start free with our Energy Savings Program and make money while reducing costs. Or choose from affordable plans starting at $39/month.',
};

export default function SimplePricingPage() {
  return <UnifiedPricingPage />;
}