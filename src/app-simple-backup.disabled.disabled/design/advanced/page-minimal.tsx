'use client';

import React from 'react';

// Minimal working version to test if the issue is with the complex component structure
export default function MinimalAdvancedDesignerPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-400">Advanced Designer</h1>
        <p className="text-gray-400 mb-8">Advanced lighting design tools are loading...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">This is a minimal version to test chunk loading</p>
      </div>
    </div>
  );
}