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

interface AutodeskViewerRealProps {
  urn: string;
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

export function AutodeskViewerReal({
  urn,
  onModelLoad,
  onSelectionChange,
  className = '',
  showToolbar = true,
  enableMeasurements = true,
  enableSectioning = true
}: AutodeskViewerRealProps) {
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
      logger.error('system', 'Error getting access token:', error );
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
      script.onerror = () => reject(new Error('Failed to load Viewer SDK'));
      document.head.appendChild(script);
    });
  };

  // Initialize viewer
  const initializeViewer = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get access token
      const token = await getAccessToken();
      setAccessToken(token);

      // Load SDK
      await loadViewerSDK();

      if (!viewerRef.current || !window.Autodesk) {
        throw new Error('Viewer container or SDK not available');
      }

      // Initialize viewer
      const options = {
        env: 'AutodeskProduction',
        api: 'derivativeV2',
        getAccessToken: (callback: (token: string, expire: number) => void) => {
          callback(token, 3600); // Token expires in 1 hour
        }
      };

      window.Autodesk.Viewing.Initializer(options, () => {
        // Create viewer instance
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current);
        viewer3DRef.current = viewer;

        // Start viewer
        viewer.start();

        // Load model if URN is provided
        if (urn) {
          loadModel(viewer, urn);
        }

        // Set up event listeners
        viewer.addEventListener(window.Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event: any) => {
          const selection = viewer.getSelection();
          setSelectedObjects(selection);
          onSelectionChange?.(selection);
        });

        viewer.addEventListener(window.Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
          setViewerReady(true);
          setLoading(false);
          onModelLoad?.(viewer);
        });

        viewer.addEventListener(window.Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, () => {
          // Model structure loaded
          viewer.fitToView();
        });

        setLoading(false);
      });

    } catch (err) {
      logger.error('system', 'Viewer initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize viewer');
      setLoading(false);
    }
  };

  // Load model from URN
  const loadModel = (viewer: any, modelUrn: string) => {
    const documentId = `urn:${modelUrn}`;
    
    window.Autodesk.Viewing.Document.load(documentId, (doc: any) => {
      const viewables = doc.getRoot().getDefaultGeometry();
      if (viewables) {
        viewer.loadDocumentNode(doc, viewables);
      }
    }, (errorCode: number, errorMsg: string) => {
      logger.error('system', 'Document load error:', errorCode, errorMsg );
      setError(`Failed to load model: ${errorMsg}`);
    });
  };

  // Viewer controls
  const fitToView = () => {
    if (viewer3DRef.current) {
      viewer3DRef.current.fitToView();
    }
  };

  const setViewModeHandler = (mode: string) => {
    if (viewer3DRef.current) {
      const viewer = viewer3DRef.current;
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
      setViewMode(mode);
    }
  };

  const toggleGrid = () => {
    if (viewer3DRef.current) {
      const newState = !showGrid;
      viewer3DRef.current.setGroundShadow(newState);
      viewer3DRef.current.setGroundReflection(newState);
      setShowGrid(newState);
    }
  };

  const startMeasurement = (mode: 'distance' | 'area' | 'angle') => {
    if (viewer3DRef.current && enableMeasurements) {
      // Load measurement extension
      viewer3DRef.current.loadExtension('Autodesk.Measure').then(() => {
        setMeasurementMode(mode);
      });
    }
  };

  const exportSnapshot = () => {
    if (viewer3DRef.current) {
      const canvas = viewer3DRef.current.canvas;
      const link = document.createElement('a');
      link.download = 'model-snapshot.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    initializeViewer();

    return () => {
      if (viewer3DRef.current) {
        viewer3DRef.current.finish();
      }
    };
  }, []);

  useEffect(() => {
    if (viewerReady && viewer3DRef.current && urn) {
      loadModel(viewer3DRef.current, urn);
    }
  }, [urn, viewerReady]);

  if (error) {
    return (
      <Card className={`bg-gray-900 border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <Alert className="bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      {showToolbar && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-300">
              AutoCAD 3D Viewer
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={fitToView}
                disabled={!viewerReady}
                className="h-8 w-8 p-0"
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startMeasurement('distance')}
                disabled={!viewerReady || !enableMeasurements}
                className="h-8 w-8 p-0"
              >
                <Ruler className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleGrid}
                disabled={!viewerReady}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportSnapshot}
                disabled={!viewerReady}
                className="h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {viewerReady && (
            <div className="flex items-center gap-2 mt-2">
              <select
                value={viewMode}
                onChange={(e) => setViewModeHandler(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
              >
                <option value="shaded">Shaded</option>
                <option value="wireframe">Wireframe</option>
                <option value="ghosted">Ghosted</option>
              </select>
              
              {selectedObjects.length > 0 && (
                <span className="text-xs text-blue-400">
                  {selectedObjects.length} object(s) selected
                </span>
              )}
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="relative">
          <div
            ref={viewerRef}
            className="w-full h-96 bg-gray-800 rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-b-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Loading 3D model...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}