'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, FileText, Shield, Download, Printer } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedDocumentViewerProps {
  documentId?: string;
  title?: string;
  isProtected?: boolean;
}

function ProtectedDocumentViewer({ 
  documentId = 'doc-001',
  title = 'Protected Document',
  isProtected = true 
}: ProtectedDocumentViewerProps) {
  const [isUnlocked, setIsUnlocked] = useState(!isProtected);
  const [content] = useState(`
    This is a protected document viewer component.
    
    It provides secure access to sensitive documents with:
    - Access control and authentication
    - Watermarking capabilities
    - Print and download restrictions
    - Audit trail tracking
    
    Only authorized users can view and interact with protected content.
  `);

  const handleUnlock = () => {
    // In production, this would verify credentials
    setIsUnlocked(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isProtected && (
              <Shield className="h-5 w-5 text-green-600" />
            )}
            {isUnlocked ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isUnlocked ? (
          <div className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This document is protected. Please authenticate to view the content.
              </AlertDescription>
            </Alert>
            <Button onClick={handleUnlock} className="w-full">
              <Unlock className="h-4 w-4 mr-2" />
              Unlock Document
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" disabled={isProtected}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" disabled={isProtected}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
            
            <div className="border rounded-lg p-6 bg-muted/20 min-h-[300px]">
              <pre className="whitespace-pre-wrap text-sm">
                {content}
              </pre>
              {isProtected && (
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  Document ID: {documentId} | Watermark: Confidential
                </div>
              )}
            </div>

            {isProtected && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This document is protected. Downloads and printing are disabled. All access is logged.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ProtectedDocumentViewer };
export default ProtectedDocumentViewer;