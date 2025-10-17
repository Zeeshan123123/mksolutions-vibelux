'use client';

import React, { useEffect, useRef, useState } from 'react';
import ForgeExtensionManager from '@/lib/forge/forge-extension-manager';

interface ForgeViewerProps {
  documentId?: string;
  onViewerReady?: (viewer: Autodesk.Viewing.GuiViewer3D) => void;
  onExtensionsReady?: (extensionManager: ForgeExtensionManager) => void;
  enableAI?: boolean;
  enableHeatmap?: boolean;
  enableSpectral?: boolean;
  className?: string;
}

export function ForgeViewer({
  documentId,
  onViewerReady,
  onExtensionsReady,
  enableAI = true,
  enableHeatmap = true, 
  enableSpectral = true,
  className = ''
}: ForgeViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Autodesk.Viewing.GuiViewer3D | null>(null);
  const [extensionManager, setExtensionManager] = useState<ForgeExtensionManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forgeReady, setForgeReady] = useState(false);

  // Initialize Forge Viewer SDK
  useEffect(() => {
    const initializeForge = async () => {
      try {
        // Check if Forge SDK is already loaded
        if (typeof Autodesk !== 'undefined') {
          setForgeReady(true);
          return;
        }

        // Load Forge SDK
        await loadForgeSDK();
        setForgeReady(true);
      } catch (err) {
        console.error('Failed to load Forge SDK:', err);
        setError('Failed to load Forge SDK');
        setLoading(false);
      }
    };

    initializeForge();
  }, []);

  // Initialize viewer once Forge is ready
  useEffect(() => {
    if (!forgeReady || !viewerRef.current) return;

    const initializeViewer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize Autodesk environment
        const options = {
          env: 'AutodeskProduction2',
          api: 'streamingV2',
          getAccessToken: async (onSuccess: (token: string, expiry: number) => void) => {
            try {
              const response = await fetch('/api/forge/token');
              const data = await response.json();
              onSuccess(data.access_token, data.expires_in);
            } catch (error) {
              console.error('Failed to get access token:', error);
            }
          }
        };

        Autodesk.Viewing.Initializer(options, async () => {
          // Create viewer
          const viewerOptions = {
            extensions: [], // Extensions will be loaded separately
            theme: 'light-theme'
          };

          const newViewer = new Autodesk.Viewing.GuiViewer3D(
            viewerRef.current!,
            viewerOptions
          );

          const startCode = newViewer.start();
          if (startCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            setError('WebGL not supported');
            return;
          }

          setViewer(newViewer);

          // Initialize VibeLux extensions
          const extManager = new ForgeExtensionManager(newViewer, {
            enableAI,
            enableHeatmap,
            enableSpectral
          });

          await extManager.initializeExtensions();
          setExtensionManager(extManager);

          // Load document if provided
          if (documentId) {
            await loadDocument(newViewer, documentId);
          } else {
            // Load default/empty model for design mode
            await loadDefaultModel(newViewer);
          }

          setLoading(false);

          // Notify parent components
          onViewerReady?.(newViewer);
          onExtensionsReady?.(extManager);
        });
      } catch (err) {
        console.error('Failed to initialize viewer:', err);
        setError('Failed to initialize viewer');
        setLoading(false);
      }
    };

    initializeViewer();

    // Cleanup
    return () => {
      if (viewer) {
        extensionManager?.unloadAllExtensions();
        viewer.finish();
      }
    };
  }, [forgeReady, documentId, enableAI, enableHeatmap, enableSpectral]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (viewer) {
        viewer.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewer]);

  if (loading) {
    return (
      <div className={`forge-viewer-loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading VibeLux 3D Designer...</p>
          <div className="loading-steps">
            <div className="step active">🔧 Initializing Forge SDK</div>
            <div className="step">🎨 Setting up 3D viewer</div>
            <div className="step">🤖 Loading AI extensions</div>
            <div className="step">🌈 Preparing spectral tools</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`forge-viewer-error ${className}`}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load 3D Designer</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`forge-viewer-container ${className}`}>
      <div 
        ref={viewerRef}
        className="forge-viewer"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* AI Chat Overlay (will be managed by extension) */}
      <div id="vibelux-ai-overlay" className="hidden" />
      
      {/* Status Bar */}
      <div className="forge-status-bar">
        <div className="status-left">
          <span className="status-indicator active">🟢 VibeLux AI Ready</span>
          {extensionManager?.isExtensionLoaded('VibeLux.PPFDHeatmap') && (
            <span className="status-indicator">📊 PPFD Analysis</span>
          )}
          {extensionManager?.isExtensionLoaded('VibeLux.SpectralAnalysis') && (
            <span className="status-indicator">🌈 Spectral Tools</span>
          )}
        </div>
        <div className="status-right">
          <span className="forge-branding">Powered by Autodesk Forge</span>
        </div>
      </div>
    </div>
  );
}

// Utility functions
async function loadForgeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof Autodesk !== 'undefined') {
      resolve();
      return;
    }

    // Load Forge Viewer CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
    document.head.appendChild(css);

    // Load Forge Viewer JS
    const script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
    script.onload = () => {
      // Wait a bit for Autodesk object to be fully initialized
      setTimeout(resolve, 100);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadDocument(
  viewer: Autodesk.Viewing.GuiViewer3D, 
  documentId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    Autodesk.Viewing.Document.load(
      documentId,
      (doc: Autodesk.Viewing.Document) => {
        const viewables = doc.getRoot().getDefaultGeometry();
        if (viewables) {
          viewer.loadDocumentNode(doc, viewables).then(resolve).catch(reject);
        } else {
          reject(new Error('No viewable content found'));
        }
      },
      (error: any) => {
        console.error('Failed to load document:', error);
        reject(error);
      }
    );
  });
}

async function loadDefaultModel(
  viewer: Autodesk.Viewing.GuiViewer3D
): Promise<void> {
  // Create a simple greenhouse base model for design mode
  const geometry = new THREE.BoxGeometry(40, 20, 12); // 40x20x12 foot greenhouse
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x88cc88, 
    opacity: 0.3, 
    transparent: true,
    wireframe: true
  });
  const greenhouse = new THREE.Mesh(geometry, material);
  greenhouse.position.set(20, 10, 6); // Center it
  
  // Add to scene
  viewer.impl.scene.add(greenhouse);
  
  // Add ground plane
  const groundGeometry = new THREE.PlaneGeometry(60, 40);
  const groundMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4a5d23,
    opacity: 0.8,
    transparent: true
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(20, 10, 0);
  
  viewer.impl.scene.add(ground);
  
  // Set camera to good starting position
  viewer.setViewCube('front');
  viewer.fitToView();
  
  // Invalidate to trigger redraw
  viewer.impl.invalidate(true);
}

export default ForgeViewer;