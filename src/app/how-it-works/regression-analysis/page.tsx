import { Metadata } from 'next';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import RegressionAnalysisShowcase from '@/components/marketing/RegressionAnalysisShowcase';

export const metadata: Metadata = {
  title: 'Light-Outcome Regression Analysis | VibeLux',
  description: 'Revolutionary regression analysis linking precise light spectra to specific outcomes across cannabis, functional foods, biomass, and pharmaceutical applications.',
  keywords: 'regression analysis, light spectra, outcome optimization, precision agriculture, data-driven cultivation, photobiology, controlled environment agriculture',
  openGraph: {
    title: 'Light-Outcome Regression Analysis - The Future of Precision Agriculture',
    description: 'Discover how VibeLux uses advanced regression analysis to link light spectra to precise agricultural outcomes across multiple applications.',
    type: 'website',
  },
};

export default function RegressionAnalysisPage() {
  return (
    <>
      <MarketingNavigation />
      <RegressionAnalysisShowcase />
      <Footer />
    </>
  );
}