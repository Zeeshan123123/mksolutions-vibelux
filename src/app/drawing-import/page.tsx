'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CultivationLayout, ParsedDrawing } from '@/lib/drawing/types';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const DrawingImport = dynamic(
  () => import('@/components/drawing/DrawingImport').then(mod => mod.DrawingImport),
  { ssr: false }
);

export default function DrawingImportPage() {
  const [layout, setLayout] = useState<CultivationLayout | null>(null);
  const [drawing, setDrawing] = useState<ParsedDrawing | null>(null);

  const handleLayoutGenerated = (generatedLayout: CultivationLayout) => {
    setLayout(generatedLayout);
    console.log('Layout generated:', generatedLayout);
  };

  const handleDrawingParsed = (parsedDrawing: ParsedDrawing) => {
    setDrawing(parsedDrawing);
    console.log('Drawing parsed:', parsedDrawing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/cultivation-designer">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Designer
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">Drawing Import</h1>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">
                AI-Powered Layout Generation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Import Your Facility Drawing
          </h2>
          <p className="text-gray-600 mt-2">
            Upload a PDF or image of your floor plan, and we'll automatically generate an optimized cultivation layout
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Smart Parsing</h3>
            <p className="text-sm text-gray-600">
              Automatically extracts dimensions, room names, and layout from your drawings
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">AI Optimization</h3>
            <p className="text-sm text-gray-600">
              Generates optimal table placement, lighting, and HVAC layouts based on best practices
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Compliance Check</h3>
            <p className="text-sm text-gray-600">
              Validates layouts against industry standards and regulatory requirements
            </p>
          </div>
        </div>

        {/* Import Component */}
        <DrawingImport 
          onLayoutGenerated={handleLayoutGenerated}
          onDrawingParsed={handleDrawingParsed}
        />

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            Tips for Best Results
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Ensure dimensions are clearly visible in your drawing (e.g., "64' x 22'")
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Include room names or labels for better identification
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              For hand-drawn sketches, use dark ink and write dimensions clearly
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              PDF exports from CAD software work best for accurate parsing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}