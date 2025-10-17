'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const RecipeMarketplace = dynamic(
  () => import('@/components/recipe-marketplace/RecipeMarketplace'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white">Loading Recipe Marketplace...</div>
        </div>
      </div>
    )
  }
);

export default function RecipeMarketplacePage() {
  return <RecipeMarketplace />;
}