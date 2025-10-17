'use client';

// Wrapper component for Room3DWebGLEnhanced to handle dynamic import issues
import dynamic from 'next/dynamic';

const Room3DWebGLEnhanced = dynamic(
  () => import('./Room3DWebGLEnhanced'),
  { 
    ssr: false,
    loading: () => <div>Loading 3D visualization...</div>
  }
);

export default Room3DWebGLEnhanced;