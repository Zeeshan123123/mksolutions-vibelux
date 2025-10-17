import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'VibeLux - Professional Horticultural Lighting Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0a 100%)',
          }}
        />
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          {/* V Shape */}
          <svg width="120" height="120" viewBox="0 0 240 240" style={{ marginRight: 20 }}>
            {/* Left diagonal - Purple */}
            <path d="M 20 40 L 80 40 L 120 180 L 100 200 Z" fill="#8B5CF6" />
            
            {/* Right diagonal - Teal */}
            <path d="M 120 180 L 160 40 L 220 40 L 140 200 Z" fill="#06B6D4" />
          </svg>
          
          {/* Text */}
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 700 }}>
            <span style={{ color: '#8B5CF6' }}>Vibe</span>
            <span style={{ color: '#06B6D4' }}>Lux</span>
          </div>
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#e5e7eb',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Professional Horticultural Lighting Platform
        </div>
        
        {/* Subtext */}
        <div
          style={{
            fontSize: 20,
            color: '#9ca3af',
            textAlign: 'center',
            marginTop: 20,
            maxWidth: 700,
          }}
        >
          Advanced lighting design, analysis, and optimization for indoor farming
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}