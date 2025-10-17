'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useDesigner } from '../context/DesignerContext';

// Stub component
const ThreeJS3DVisualization = () => (
  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
    <div className="text-gray-500">3D visualization disabled for performance</div>
  </div>
);


interface Enhanced3DCanvasProps {
  viewType?: 'perspective' | 'top' | 'front' | 'side';
  syncWith2D?: boolean;
  quality?: 'low' | 'medium' | 'high';
  showControls?: boolean;
}

export function Enhanced3DCanvas({
  viewType = 'perspective',
  syncWith2D = true,
  quality = 'medium',
  showControls = true
}: Enhanced3DCanvasProps) {
  const { state, dispatch } = useDesigner();
  const { room } = state;
  const [viewMode, setViewMode] = React.useState<'3d' | 'ppfd' | 'thermal' | 'layers'>('3d');

  // Determine if this should show a greenhouse based on room size
  const isGreenhouse = room && (room.height > 8 || room.width > 20 || room.length > 30);

  // Set greenhouse structure type if detected
  React.useEffect(() => {
    if (isGreenhouse && room && !room.structureType) {
      // Update room to have greenhouse structure type
      dispatch({ 
        type: 'UPDATE_ROOM', 
        payload: { 
          ...room, 
          structureType: room.length > 100 ? 'gutter-connect' : 'single-span' 
        } 
      });
    }
  }, [isGreenhouse, room, dispatch]);

  // Use original Three.js version which has greenhouse support
  return (
    <ThreeJS3DVisualization
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      quality={quality}
    />
  );
}