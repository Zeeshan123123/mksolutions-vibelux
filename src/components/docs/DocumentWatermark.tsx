'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';

interface DocumentWatermarkProps {
  documentId: string;
  className?: string;
  opacity?: number;
}

export function DocumentWatermark({ 
  documentId, 
  className = '',
  opacity = 0.1 
}: DocumentWatermarkProps) {
  const { user } = useUser();

  if (!user) return null;

  const watermarkText = `CONFIDENTIAL - ${user.emailAddresses[0]?.emailAddress} - ${new Date().toISOString().split('T')[0]} - Doc: ${documentId}`;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 200px,
          rgba(156, 163, 175, ${opacity}) 200px,
          rgba(156, 163, 175, ${opacity}) 250px
        )`,
        backgroundSize: '400px 400px'
      }}
    >
      {/* Text watermarks at multiple positions */}
      <div className="absolute top-1/4 left-1/4 transform -rotate-45 select-none">
        <span 
          className="text-gray-400 text-sm font-mono whitespace-nowrap"
          style={{ opacity }}
        >
          {watermarkText}
        </span>
      </div>
      
      <div className="absolute top-3/4 left-1/2 transform -rotate-45 select-none">
        <span 
          className="text-gray-400 text-sm font-mono whitespace-nowrap"
          style={{ opacity }}
        >
          {watermarkText}
        </span>
      </div>
      
      <div className="absolute top-1/2 left-3/4 transform -rotate-45 select-none">
        <span 
          className="text-gray-400 text-sm font-mono whitespace-nowrap"
          style={{ opacity }}
        >
          {watermarkText}
        </span>
      </div>

      {/* Invisible tracking div */}
      <div 
        id="document-watermark-data"
        data-user-id={user.id}
        data-user-email={user.emailAddresses[0]?.emailAddress}
        data-document-id={documentId}
        data-timestamp={new Date().toISOString()}
        className="hidden"
      />
    </div>
  );
}

/**
 * Hook for tracking document interactions
 */
export function useDocumentTracking(documentId: string, documentTitle: string) {
  const { user } = useUser();

  const trackAccess = React.useCallback(async (accessType: 'view' | 'download' | 'print' | 'copy') => {
    if (!user) return;

    try {
      await fetch('/api/documents/track-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          documentTitle,
          accessType,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track document access:', error);
    }
  }, [user, documentId, documentTitle]);

  // Track initial view
  React.useEffect(() => {
    if (user) {
      trackAccess('view');
    }
  }, [user, trackAccess]);

  // Track print attempts
  React.useEffect(() => {
    const handleBeforePrint = () => trackAccess('print');
    const handleAfterPrint = () => trackAccess('print');

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [trackAccess]);

  // Track copy attempts (basic detection)
  React.useEffect(() => {
    const handleCopy = () => trackAccess('copy');

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [trackAccess]);

  return { trackAccess };
}