import { SimpleDocumentOnboarding } from '@/components/onboarding/SimpleDocumentOnboarding';

export default function DocumentOnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleDocumentOnboarding />
    </div>
  );
}

export const metadata = {
  title: 'Document Setup - Get Started in 5 Minutes | Vibelux',
  description: 'Quick setup for your document management system. Personalized configuration based on your team size and use case.',
};