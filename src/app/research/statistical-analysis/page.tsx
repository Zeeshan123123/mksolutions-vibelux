import { redirect } from 'next/navigation';
import { StatisticalAnalysisClient } from '@/components/research/StatisticalAnalysisClient';

// Temporary access control function - replace with actual implementation
async function requireAccess(feature: string, options: any) {
  return { allowed: true, reason: null };
}

// Server-side access control
export default async function StatisticalAnalysisPage() {
  // Check server-side access to research suite
  const accessCheck = await requireAccess('research-statistical-analysis', {
    module: 'research-analytics-suite'
  });
  
  if (!accessCheck.allowed) {
    // Redirect to upgrade page with specific feature context
    redirect(`/upgrade?feature=research-analytics-suite&reason=${encodeURIComponent(accessCheck.reason || 'subscription_required')}`);
  }
  
  return <StatisticalAnalysisClient />;
}