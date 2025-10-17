'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AdvancedAnalyticsRedirect() {
  useEffect(() => {
    redirect('/analytics');
  }, []);

  return null;
}