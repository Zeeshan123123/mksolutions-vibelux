import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Health - VibeLux Admin',
  description: 'Monitor system health and performance metrics',
};

export default function SystemHealthPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SystemHealthDashboard />
    </div>
  );
}