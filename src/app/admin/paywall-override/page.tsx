import React from 'react';
import { requireAccess, isAdminUser } from '@/lib/auth/access-control';
import { redirect } from 'next/navigation';
import PaywallOverrideClient from './client';

export const dynamic = 'force-dynamic';

// Server-side admin check
export default async function PaywallOverridePage() {
  const adminStatus = await isAdminUser();
  
  if (!adminStatus.isAdmin) {
    redirect('/');
  }
  
  return <PaywallOverrideClient adminStatus={adminStatus} />;
}