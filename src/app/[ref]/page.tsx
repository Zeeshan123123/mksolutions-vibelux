'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AffiliateRedirect() {
  const router = useRouter();
  const params = useParams();
  const ref = params.ref as string;

  useEffect(() => {
    // Track the click
    fetch('/api/affiliate/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ref })
    }).catch(console.error);

    // Set cookie for attribution
    document.cookie = `vb_ref=${ref}; max-age=15552000; path=/`; // 180 days (6 months)

    // Redirect to homepage or intended destination
    const urlParams = new URLSearchParams(window.location.search);
    const destination = urlParams.get('to') || '/';
    
    setTimeout(() => {
      router.push(destination);
    }, 100);
  }, [ref, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}