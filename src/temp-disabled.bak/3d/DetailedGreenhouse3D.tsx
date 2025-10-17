'use client';

import React from 'react';

interface DetailedGreenhouse3DProps {
  greenhouseData?: any;
  onUpdate?: (data: any) => void;
}

export function DetailedGreenhouse3D({ greenhouseData, onUpdate }: DetailedGreenhouse3DProps) {
  return (
    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400">3D Visualization Coming Soon</p>
      </div>
    </div>
  );
}