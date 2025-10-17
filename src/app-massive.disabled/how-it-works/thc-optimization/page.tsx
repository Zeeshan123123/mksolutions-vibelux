import { Metadata } from 'next';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import THCLightCorrelationHowItWorks from '@/components/marketing/THCLightCorrelationHowItWorks';

export const metadata: Metadata = {
  title: 'THC-Light Spectra Correlation | How It Works | VibeLux',
  description: 'Revolutionary cannabis cultivation using precision light spectra to maximize cannabinoid production. Science-backed UV-THC protocols for up to 25% THC increase.',
  keywords: 'THC enhancement, UV light cannabis, spectral recipes, cannabinoid optimization, cannabis lighting, precision cultivation, UV-B THC, terpene enhancement',
  openGraph: {
    title: 'THC-Light Spectra Correlation - Revolutionary Cannabis Optimization',
    description: 'Discover how VibeLux uses precision light spectra and UV protocols to increase THC production by up to 25% in cannabis cultivation.',
    type: 'website',
  },
};

export default function THCOptimizationPage() {
  return (
    <>
      <MarketingNavigation />
      <THCLightCorrelationHowItWorks />
      <Footer />
    </>
  );
}