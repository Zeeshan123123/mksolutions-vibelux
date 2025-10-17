'use client';

import React from 'react';
import { DrawingImportDemo } from '@/components/drawing/DrawingImportDemo';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DrawingImportDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/drawing-import">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Drawing Import
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">Drawing Import Demo: HPS to LED Conversion</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See Vibelux in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Watch how Vibelux transforms your facility drawings into optimized cultivation layouts
            with advanced lighting analysis and HPS to LED conversion recommendations.
          </p>
        </div>

        {/* Demo Component */}
        <DrawingImportDemo />

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            What This Demo Shows
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Automated Drawing Parsing:</strong> Vibelux extracts room dimensions from your PDF floor plans
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Intelligent Layout Generation:</strong> Optimizes table placement for maximum space utilization
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>1:1 HPS Replacement:</strong> Calculates exact Fluence SPYDR 2p fixtures needed to match HPS output
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>ROI Analysis:</strong> Shows power savings, reduced HVAC costs, and payback period
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>3D Visualization:</strong> View your new layout in interactive 3D before implementation
              </span>
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Facility?</h3>
          <p className="text-gray-600 mb-6">
            Upload your own drawings and get personalized recommendations
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/drawing-import">
              <Button size="lg">
                Try It With Your Drawings
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Schedule a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}