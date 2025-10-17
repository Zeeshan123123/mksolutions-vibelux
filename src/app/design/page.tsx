'use client';

import { SimpleDesigner } from '@/components/designer/SimpleDesigner';
import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <SiteHeader />
      
      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300">
                Using Basic Designer (Free) • Limited to 1 room, 10 fixtures
              </span>
            </div>
            <Link 
              href="/design/advanced"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              Upgrade to Advanced Designer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Designer App */}
      <div className="pt-16">
        <SimpleDesigner />
      </div>
    </div>
  );
}