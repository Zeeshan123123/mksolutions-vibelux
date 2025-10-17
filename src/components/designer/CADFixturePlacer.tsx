'use client';

import { useState, useEffect, useRef } from 'react';
import { Lightbulb, Plus, Settings, Eye, Layers } from 'lucide-react';
import { logger } from '@/lib/client-logger';
import { Button } from '@/components/ui/button';

interface CADFixturePlacerProps {
  viewer: any;
  selectedTool: string;
  onFixturePlaced: (fixture: any) => void;
  fixtureLibrary: any[];
  selectedFixture: any;
}

export function CADFixturePlacer({
  viewer,
  selectedTool,
  onFixturePlaced,
  fixtureLibrary,
  selectedFixture
}: CADFixturePlacerProps) {
  const [placementMode, setPlacementMode] = useState(false);
  const [placedFixtures, setPlacedFixtures] = useState<any[]>([]);
  const clickHandlerRef = useRef<any>(null);

  useEffect(() => {
    if (!viewer) return;

    // Enable fixture placement mode
    if (selectedTool === 'fixture' && selectedFixture) {
      enableFixturePlacement();
    } else {
      disableFixturePlacement();
    }

    return () => {
      disableFixturePlacement();
    };
  }, [viewer, selectedTool, selectedFixture]);

  const enableFixturePlacement = () => {
    if (!viewer) return;

    setPlacementMode(true);
    
    // Create click handler for fixture placement
    clickHandlerRef.current = (event: any) => {
      const result = viewer.clientToWorld(event.clientX, event.clientY);
      if (result) {
        placeFixtureAt3D(result.point);
      }
    };

    // Add click listener to viewer
    viewer.canvas.addEventListener('click', clickHandlerRef.current);
    
    // Change cursor to indicate placement mode
    viewer.canvas.style.cursor = 'crosshair';
  };

  const disableFixturePlacement = () => {
    if (!viewer) return;

    setPlacementMode(false);

    // Remove click handler
    if (clickHandlerRef.current) {
      viewer.canvas.removeEventListener('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }

    // Reset cursor
    viewer.canvas.style.cursor = 'default';
  };

  const placeFixtureAt3D = (position: { x: number; y: number; z: number }) => {
    if (!selectedFixture) return;

    const fixture = {
      id: `fixture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'fixture',
      model: selectedFixture,
      position: position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      enabled: true,
      dimmingLevel: 100,
      // Add fixture-specific properties
      wattage: selectedFixture.wattage || 0,
      ppf: selectedFixture.ppf || 0,
      efficacy: selectedFixture.efficacy || 0,
      spectrum: selectedFixture.spectrum || 'Full Spectrum',
      mountingHeight: position.z
    };

    // Add fixture to placed fixtures list
    setPlacedFixtures(prev => [...prev, fixture]);
    
    // Create 3D representation in viewer
    createFixture3D(fixture);
    
    // Notify parent component
    onFixturePlaced(fixture);
  };

  const createFixture3D = (fixture: any) => {
    if (!viewer) return;

    try {
      // Create simple box geometry for fixture representation
      const geometry = new THREE.BoxGeometry(
        fixture.model.width || 2,
        fixture.model.length || 4,
        fixture.model.height || 0.5
      );

      // Create material with fixture color
      const material = new THREE.MeshLambertMaterial({
        color: fixture.enabled ? 0x4ade80 : 0x6b7280,
        transparent: true,
        opacity: 0.8
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        fixture.position.x,
        fixture.position.y,
        fixture.position.z
      );

      // Add fixture ID for selection
      mesh.userData = {
        fixtureId: fixture.id,
        type: 'fixture',
        fixture: fixture
      };

      // Add to viewer scene
      viewer.scene.add(mesh);
      
      // Add light cone visualization if fixture is enabled
      if (fixture.enabled) {
        createLightCone(fixture, mesh);
      }

      // Refresh viewer
      viewer.impl.invalidate(true);

    } catch (error) {
      logger.error('system', 'Error creating 3D fixture:', error );
      // Fallback: use viewer's built-in markup for fixture placement
      createFixtureMarkup(fixture);
    }
  };

  const createLightCone = (fixture: any, fixtureMesh: any) => {
    if (!viewer) return;

    try {
      // Create cone geometry for light visualization
      const coneGeometry = new THREE.ConeGeometry(
        fixture.model.beamAngle ? Math.tan((fixture.model.beamAngle * Math.PI) / 360) * 8 : 3,
        8, // Height of light cone
        8
      );

      // Create semi-transparent material for light cone
      const coneMaterial = new THREE.MeshLambertMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });

      const lightCone = new THREE.Mesh(coneGeometry, coneMaterial);
      lightCone.position.copy(fixtureMesh.position);
      lightCone.position.z -= 4; // Position cone below fixture
      lightCone.rotation.x = Math.PI; // Point downward

      // Add to scene
      viewer.scene.add(lightCone);

    } catch (error) {
      logger.error('system', 'Error creating light cone:', error );
    }
  };

  const createFixtureMarkup = (fixture: any) => {
    // Fallback using Autodesk viewer markup
    if (viewer.loadExtension) {
      viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(() => {
        const markupsExt = viewer.getExtension('Autodesk.Viewing.MarkupsCore');
        if (markupsExt) {
          // Create markup for fixture
          markupsExt.enterEditMode();
          // Add fixture markup at position
          markupsExt.leaveEditMode();
        }
      });
    }
  };

  const removeFixture = (fixtureId: string) => {
    // Remove from placed fixtures
    setPlacedFixtures(prev => prev.filter(f => f.id !== fixtureId));
    
    // Remove from 3D scene
    if (viewer && viewer.scene) {
      const objectsToRemove: any[] = [];
      viewer.scene.traverse((child: any) => {
        if (child.userData && child.userData.fixtureId === fixtureId) {
          objectsToRemove.push(child);
        }
      });
      
      objectsToRemove.forEach(obj => {
        viewer.scene.remove(obj);
      });
      
      viewer.impl.invalidate(true);
    }
  };

  const toggleFixture = (fixtureId: string) => {
    setPlacedFixtures(prev => prev.map(fixture => {
      if (fixture.id === fixtureId) {
        const updated = { ...fixture, enabled: !fixture.enabled };
        
        // Update 3D representation
        if (viewer && viewer.scene) {
          viewer.scene.traverse((child: any) => {
            if (child.userData && child.userData.fixtureId === fixtureId) {
              child.material.color.setHex(updated.enabled ? 0x4ade80 : 0x6b7280);
            }
          });
          viewer.impl.invalidate(true);
        }
        
        return updated;
      }
      return fixture;
    }));
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      {placementMode && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Fixture Placement Mode</span>
          </div>
          <div className="text-xs text-gray-300 mb-2">
            Click on the 3D model to place fixtures
          </div>
          {selectedFixture && (
            <div className="text-xs text-gray-400">
              Selected: {selectedFixture.manufacturer} {selectedFixture.model}
            </div>
          )}
        </div>
      )}

      {placedFixtures.length > 0 && (
        <div className="mt-4 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              Placed Fixtures ({placedFixtures.length})
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {placedFixtures.map(fixture => (
              <div key={fixture.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate">
                  {fixture.model.model || 'Fixture'}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFixture(fixture.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Eye className={`w-3 h-3 ${fixture.enabled ? 'text-green-400' : 'text-gray-500'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFixture(fixture.id)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Declare THREE.js types if not available
declare global {
  interface Window {
    THREE: any;
  }
}

// Fallback THREE.js implementation if not loaded
const THREE = typeof window !== 'undefined' && window.THREE ? window.THREE : {
  BoxGeometry: class { constructor(w: number, h: number, d: number) {} },
  ConeGeometry: class { constructor(r: number, h: number, s: number) {} },
  MeshLambertMaterial: class { constructor(props: any) {} },
  Mesh: class { 
    constructor(geo: any, mat: any) {}
    position = { set: () => {}, copy: () => {} };
    rotation = { x: 0, y: 0, z: 0 };
    userData = {};
  },
  DoubleSide: 2
};