import { Metadata } from 'next';
import { SystemStatus } from '@/components/SystemStatus';

export const metadata: Metadata = {
  title: 'System Status - VibeLux',
  description: 'Real-time status of VibeLux services and infrastructure. Check service availability and performance metrics.',
};

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-20">
        <SystemStatus />
      </div>
    </div>
  );
}