'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// SECURITIES COMPLIANCE: Investment features have been disabled
// to comply with SEC regulations. Redirecting to equipment leasing.
export default function InvestmentPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to compliant equipment leasing page
    router.replace('/equipment-leasing');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-400">Taking you to our equipment leasing options</p>
      </div>
    </div>
  );
}