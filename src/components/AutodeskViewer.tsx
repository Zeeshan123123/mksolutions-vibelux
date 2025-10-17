'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/client-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Download,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Home,
  Layers,
  Eye,
  EyeOff,
  Settings,
  FileText,
  Box,
  Ruler,
  Info,
  Camera,
  Sun,
  Grid3x3,
  AlertCircle
} from 'lucide-react';

interface AutodeskViewerProps {
  urn?: string;
  onModelLoad?: (viewer: any) => void;
  onSelectionChange?: (selection: any[]) => void;
  className?: string;
  showToolbar?: boolean;
  enableMeasurements?: boolean;
  enableSectioning?: boolean;
}

declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function AutodeskViewer({
  urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0LWlhbi9yYWNrc3lzdGVtLmlmYw',
  onModelLoad,
  onSelectionChange,
  className = '',
  showToolbar = true,
  enableMeasurements = true,
  enableSectioning = true
}: AutodeskViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewer3DRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  
  // Viewer state
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState('shaded');
  const [showGrid, setShowGrid] = useState(true);
  const [measurementMode, setMeasurementMode] = useState<'distance' | 'area' | 'angle' | null>(null);

  // Get Forge access token
  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/forge/auth');
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('system', 'Error getting access token:', error);
      throw error;
    }
  };

  // Load Autodesk Viewer SDK
  const loadViewerSDK = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.Autodesk) {
        resolve();
        return;
      }

      // Load Viewer SDK script
      const script = document.createElement('script');
      script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
      script.onload = () => {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
        document.head.appendChild(link);
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Autodesk Viewer SDK'));
      document.head.appendChild(script);
    });
  };

  // Initialize viewer
  const initializeViewer = async () => {
    if (!viewerRef.current || !urn) return;

    try {
      setLoading(true);
      setError(null);

      // Load SDK
      await loadViewerSDK();

      // Get access token
      const token = await getAccessToken();
      setAccessToken(token);

      // Initialize viewer
      const options = {
        env: 'AutodeskProduction',
        api: 'derivativeV2',
        getAccessToken: (callback: any) => {
          callback(token, 3600);
        }
      };

      window.Autodesk.Viewing.Initializer(options, () => {
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current);
        const startedCode = viewer.start();
        
        if (startedCode > 0) {
          throw new Error('Failed to create viewer');
        }

        viewer3DRef.current = viewer;
        setViewerReady(true);

        // Load model
        const documentId = 'urn:' + urn;
        window.Autodesk.Viewing.Document.load(documentId, (doc: any) => {
          const viewables = doc.getRoot().getDefaultGeometry();
          viewer.loadDocumentNode(doc, viewables).then(() => {
            setLoading(false);
            onModelLoad?.(viewer);
            
            // Setup selection listener
            viewer.addEventListener(window.Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event: any) => {
              const selection = event.dbIdArray || [];
              setSelectedObjects(selection);
              onSelectionChange?.(selection);
            });
          });
        }, (error: any) => {
          setError('Failed to load model: ' + error);
          setLoading(false);
        });
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeViewer();
    
    return () => {
      if (viewer3DRef.current) {
        viewer3DRef.current.finish();
      }
    };
  }, [urn]);

  // Viewer control functions
  const fitToView = () => {
    if (viewer3DRef.current) {
      viewer3DRef.current.fitToView();
    }
  };

  const setViewerMode = (mode: string) => {
    if (!viewer3DRef.current) return;
    
    const viewer = viewer3DRef.current;
    setViewMode(mode);
    
    switch (mode) {
      case 'shaded':
        viewer.setDisplayMode(window.Autodesk.Viewing.DISPLAY_MODES.SHADED);
        break;
      case 'wireframe':
        viewer.setDisplayMode(window.Autodesk.Viewing.DISPLAY_MODES.WIREFRAME);
        break;
      case 'ghosted':
        viewer.setDisplayMode(window.Autodesk.Viewing.DISPLAY_MODES.GHOSTED);
        break;
    }
  };

  const toggleGrid = () => {
    if (viewer3DRef.current) {
      const newGridState = !showGrid;
      viewer3DRef.current.setGroundShadow(newGridState);
      setShowGrid(newGridState);
    }
  };

  const takeScreenshot = () => {
    if (viewer3DRef.current) {
      const screenshot = viewer3DRef.current.getScreenShot(1920, 1080, (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model-screenshot.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const startMeasurement = (type: 'distance' | 'area' | 'angle') => {
    if (!viewer3DRef.current) return;
    
    const measureTool = viewer3DRef.current.toolController.getTool('measure');
    if (measureTool) {
      setMeasurementMode(type);
      viewer3DRef.current.toolController.activateTool('measure');
    }
  };

  const stopMeasurement = () => {
    if (viewer3DRef.current) {
      viewer3DRef.current.toolController.deactivateTool('measure');
      setMeasurementMode(null);
    }
  };

  if (error) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Viewer Error:</strong> {error}
              <br />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={initializeViewer}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full h-96 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            3D CAD Viewer
          </CardTitle>
          
          {showToolbar && viewerReady && (
            <div className="flex items-center gap-2">
              {/* View Controls */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'shaded' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewerMode('shaded')}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'wireframe' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewerMode('wireframe')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'ghosted' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewerMode('ghosted')}
                >
                  {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>

              {/* Navigation Controls */}
              <div className="flex border rounded-md">
                <Button variant="ghost" size="sm" onClick={fitToView}>
                  <Home className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => viewer3DRef.current?.navigation.setZoomValue(viewer3DRef.current.navigation.getZoomValue() * 1.2)}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => viewer3DRef.current?.navigation.setZoomValue(viewer3DRef.current.navigation.getZoomValue() * 0.8)}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>

              {/* Measurement Tools */}
              {enableMeasurements && (
                <div className="flex border rounded-md">
                  <Button
                    variant={measurementMode === 'distance' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => measurementMode === 'distance' ? stopMeasurement() : startMeasurement('distance')}
                  >
                    <Ruler className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Utility Controls */}
              <div className="flex border rounded-md">
                <Button variant="ghost" size="sm" onClick={takeScreenshot}>
                  <Camera className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleGrid}>
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D model...</p>
              </div>
            </div>
          )}
          
          <div
            ref={viewerRef}
            className="w-full h-80 bg-gray-100 dark:bg-gray-800"
          />

          {/* Selection Info */}
          {selectedObjects.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" />
                <span>{selectedObjects.length} object(s) selected</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}