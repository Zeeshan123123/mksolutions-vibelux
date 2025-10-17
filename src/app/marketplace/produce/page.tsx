'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const EnhancedProduceMarketplace = dynamic(
  () => import('@/components/marketplace/EnhancedProduceMarketplace'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white">Loading Produce Marketplace...</div>
        </div>
      </div>
    )
  }
);

export default function ProduceMarketplacePage() {
  return <EnhancedProduceMarketplace />;
}