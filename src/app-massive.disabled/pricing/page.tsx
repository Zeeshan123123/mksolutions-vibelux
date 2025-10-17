import { UnifiedPricingPage } from '@/components/pricing/UnifiedPricingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Start Free & Make Money | VibeLux',
  description: 'Make money with our free Energy Savings Program or choose affordable plans starting at $49/month. 940+ features including visual fixture layout designer, no upfront costs, pay as you grow.',
  keywords: 'VibeLux pricing, energy savings, grow light calculator, PPFD calculator, horticultural lighting, indoor farming software, agricultural automation',
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}