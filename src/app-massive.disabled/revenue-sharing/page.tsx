'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// SECURITIES COMPLIANCE: Revenue sharing disabled for SEC compliance
export default function RevenueSharingPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/pricing');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-400">Taking you to our pricing page</p>
      </div>
    </div>
  );
}