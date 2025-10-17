/**
 * VibeLux Layer Manager for Forge Extensions
 * Proper layer management and WebGL scene integration
 */

interface LayerObject {
  id: string;
  type: 'hvac' | 'lighting' | 'cfd' | 'dimension' | 'annotation' | 'system';
  mesh: THREE.Object3D;
  metadata: any;
  visible: boolean;
  selectable: boolean;
  parentLayer?: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  objects: Map<string, LayerObject>;
  parent?: string;
  children: string[];
}

export class VibeLuxLayerManager {
  private viewer: Autodesk.Viewing.GuiViewer3D;
  private layers: Map<string, Layer> = new Map();
  private objects: Map<string, LayerObject> = new Map();
  private overlayScene: THREE.Scene;
  private renderOverlay: boolean = true;
  private layerPanel: Autodesk.Viewing.UI.DockingPanel | null = null;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D) {
    this.viewer = viewer;
    this.overlayScene = new THREE.Scene();
    this.initializeDefaultLayers();
    this.setupEventHandlers();
  }

  private initializeDefaultLayers(): void {
    // Create default layers for VibeLux extensions
    this.createLayer('hvac-equipment', 'HVAC Equipment', '#dc2626');
    this.createLayer('hvac-ducts', 'Ductwork', '#7c2d12');
    this.createLayer('lighting-fixtures', 'Lighting Fixtures', '#eab308');
    this.createLayer('electrical-panels', 'Electrical Panels', '#2563eb');
    this.createLayer('cfd-particles', 'CFD Particles', '#06b6d4');
    this.createLayer('cfd-vectors', 'Velocity Vectors', '#8b5cf6');
    this.createLayer('dimensions', 'Dimensions', '#10b981');
    this.createLayer('annotations', 'Annotations', '#6b7280');
    this.createLayer('temp-geometry', 'Temporary Objects', '#f59e0b');
  }

  private setupEventHandlers(): void {
    // Handle viewer render events for overlay
    this.viewer.addEventListener(Autodesk.Viewing.RENDER_OVERLAY_EVENT, () => {
      if (this.renderOverlay) {
        this.renderOverlayObjects();
      }
    });

    // Handle selection events
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
      this.handleSelectionChanged(event);
    });
  }

  public createLayer(id: string, name: string, color: string = '#ffffff', parent?: string): Layer {
    const layer: Layer = {
      id,
      name,
      visible: true,
      locked: false,
      color,
      objects: new Map(),
      parent,
      children: []
    };

    this.layers.set(id, layer);

    // Handle parent-child relationships
    if (parent && this.layers.has(parent)) {
      this.layers.get(parent)!.children.push(id);
    }

    this.updateLayerPanel();
    return layer;
  }

  public addObjectToLayer(
    layerId: string, 
    objectId: string, 
    mesh: THREE.Object3D, 
    type: LayerObject['type'],
    metadata: any = {}
  ): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) {
      console.error(`Layer ${layerId} not found`);
      return false;
    }

    // Create layer object
    const layerObject: LayerObject = {
      id: objectId,
      type,
      mesh,
      metadata,
      visible: layer.visible,
      selectable: !layer.locked,
      parentLayer: layerId
    };

    // Add to layer and global objects map
    layer.objects.set(objectId, layerObject);
    this.objects.set(objectId, layerObject);

    // Add to overlay scene instead of main scene for better control
    this.overlayScene.add(mesh);

    // Set up mesh userData for identification
    mesh.userData = {
      ...mesh.userData,
      vibeluxObject: true,
      layerId,
      objectId,
      type,
      metadata
    };

    // Apply layer properties
    this.applyLayerProperties(layerObject);

    this.viewer.impl.invalidate(true);
    this.updateLayerPanel();
    return true;
  }

  public removeObjectFromLayer(objectId: string): boolean {
    const object = this.objects.get(objectId);
    if (!object) return false;

    const layer = this.layers.get(object.parentLayer!);
    if (layer) {
      layer.objects.delete(objectId);
    }

    // Remove from scene
    this.overlayScene.remove(object.mesh);
    
    // Clean up mesh
    this.disposeMesh(object.mesh);

    this.objects.delete(objectId);
    this.viewer.impl.invalidate(true);
    this.updateLayerPanel();
    return true;
  }

  public setLayerVisibility(layerId: string, visible: boolean): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.visible = visible;

    // Update all objects in layer
    layer.objects.forEach(object => {
      object.visible = visible;
      object.mesh.visible = visible;
    });

    // Handle child layers
    layer.children.forEach(childId => {
      const childLayer = this.layers.get(childId);
      if (childLayer) {
        this.setLayerVisibility(childId, visible);
      }
    });

    this.viewer.impl.invalidate(true);
    this.updateLayerPanel();
  }

  public setLayerLocked(layerId: string, locked: boolean): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    layer.locked = locked;

    // Update all objects in layer
    layer.objects.forEach(object => {
      object.selectable = !locked;
    });

    this.updateLayerPanel();
  }

  public isolateLayer(layerId: string): void {
    // Hide all other layers
    this.layers.forEach((layer, id) => {
      if (id !== layerId) {
        this.setLayerVisibility(id, false);
      }
    });

    // Show target layer
    this.setLayerVisibility(layerId, true);
  }

  public showAllLayers(): void {
    this.layers.forEach((layer, id) => {
      this.setLayerVisibility(id, true);
    });
  }

  public hideAllLayers(): void {
    this.layers.forEach((layer, id) => {
      this.setLayerVisibility(id, false);
    });
  }

  public getObjectsInLayer(layerId: string): LayerObject[] {
    const layer = this.layers.get(layerId);
    return layer ? Array.from(layer.objects.values()) : [];
  }

  public getObjectsByType(type: LayerObject['type']): LayerObject[] {
    return Array.from(this.objects.values()).filter(obj => obj.type === type);
  }

  public selectObjectsInLayer(layerId: string): void {
    const objects = this.getObjectsInLayer(layerId);
    const selectableObjects = objects.filter(obj => obj.selectable && obj.visible);
    
    // Convert to selection format (would need proper dbId integration for real Forge models)
    const selections = selectableObjects.map(obj => obj.id);
    console.log('Selected objects in layer:', selections);
  }

  private applyLayerProperties(object: LayerObject): void {
    const layer = this.layers.get(object.parentLayer!);
    if (!layer) return;

    // Apply layer color
    object.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshBasicMaterial;
        if (material.color) {
          material.color.setStyle(layer.color);
        }
      }
    });

    // Apply visibility
    object.mesh.visible = object.visible && layer.visible;
  }

  private renderOverlayObjects(): void {
    if (!this.overlayScene || !this.viewer.impl) return;

    // Get camera and renderer from viewer
    const camera = this.viewer.impl.camera;
    const renderer = this.viewer.impl.renderer();

    if (!camera || !renderer) return;

    // Save current state
    const originalAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    try {
      // Render overlay scene
      renderer.render(this.overlayScene, camera);
    } catch (error) {
      console.error('Error rendering overlay objects:', error);
    } finally {
      // Restore state
      renderer.autoClear = originalAutoClear;
    }
  }

  private handleSelectionChanged(event: any): void {
    // Handle selection of layer objects
    const selection = event.dbIdArray || [];
    
    // Check if any selected objects are layer objects
    const layerObjectsSelected = selection.filter((id: number) => {
      // This would need proper integration with Forge's selection system
      return this.objects.has(id.toString());
    });

    if (layerObjectsSelected.length > 0) {
      console.log('Layer objects selected:', layerObjectsSelected);
    }
  }

  private disposeMesh(mesh: THREE.Object3D): void {
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  public createLayerPanel(): void {
    this.layerPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-layers-panel',
      'Layer Manager',
      { dockRight: true, shadow: true }
    );

    this.updateLayerPanel();
  }

  private updateLayerPanel(): void {
    if (!this.layerPanel) return;

    const panelContent = `
      <div class="layers-manager vibelux-extension-panel">
        <div class="extension-header">
          <h3>🗂️ Layer Manager</h3>
          <p>Manage VibeLux 3D objects and layers</p>
        </div>
        
        <div class="extension-section">
          <div class="layer-controls">
            <button class="btn btn-small" onclick="layerManager.showAllLayers()">👁️ Show All</button>
            <button class="btn btn-small" onclick="layerManager.hideAllLayers()">🙈 Hide All</button>
            <button class="btn btn-small" onclick="layerManager.createCustomLayer()">➕ New Layer</button>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Layers</h4>
          <div class="layers-list">
            ${Array.from(this.layers.entries()).map(([id, layer]) => `
              <div class="layer-item ${layer.visible ? 'visible' : 'hidden'} ${layer.locked ? 'locked' : ''}">
                <div class="layer-info">
                  <div class="layer-color" style="background: ${layer.color}"></div>
                  <span class="layer-name">${layer.name}</span>
                  <span class="object-count">(${layer.objects.size})</span>
                </div>
                <div class="layer-actions">
                  <button class="btn btn-small toggle-visibility" onclick="layerManager.toggleLayerVisibility('${id}')" title="Toggle Visibility">
                    ${layer.visible ? '👁️' : '🙈'}
                  </button>
                  <button class="btn btn-small toggle-lock" onclick="layerManager.toggleLayerLock('${id}')" title="Toggle Lock">
                    ${layer.locked ? '🔒' : '🔓'}
                  </button>
                  <button class="btn btn-small isolate-layer" onclick="layerManager.isolateLayer('${id}')" title="Isolate Layer">
                    🎯
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Statistics</h4>
          <div class="layer-stats">
            <div class="stat-item">
              <span class="label">Total Layers:</span>
              <span class="value">${this.layers.size}</span>
            </div>
            <div class="stat-item">
              <span class="label">Total Objects:</span>
              <span class="value">${this.objects.size}</span>
            </div>
            <div class="stat-item">
              <span class="label">Visible Objects:</span>
              <span class="value">${Array.from(this.objects.values()).filter(obj => obj.visible).length}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.layerPanel.container.innerHTML = panelContent;

    // Make layer manager globally accessible for button callbacks
    (window as any).layerManager = this;
  }

  // Public API methods for panel callbacks
  public toggleLayerVisibility(layerId: string): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      this.setLayerVisibility(layerId, !layer.visible);
    }
  }

  public toggleLayerLock(layerId: string): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      this.setLayerLocked(layerId, !layer.locked);
    }
  }

  public createCustomLayer(): void {
    const name = prompt('Enter layer name:');
    if (name) {
      const id = `custom-${Date.now()}`;
      const color = '#' + Math.floor(Math.random()*16777215).toString(16);
      this.createLayer(id, name, color);
    }
  }

  // WebGL Performance Optimization
  public enableFrustumCulling(): void {
    this.overlayScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = true;
      }
    });
  }

  public enableLevelOfDetail(): void {
    // Implement LOD for complex objects
    this.objects.forEach(object => {
      if (object.type === 'hvac' || object.type === 'lighting') {
        this.createLODForObject(object);
      }
    });
  }

  private createLODForObject(object: LayerObject): void {
    const lod = new THREE.LOD();
    
    // High detail (close up)
    lod.addLevel(object.mesh, 0);
    
    // Medium detail (medium distance)
    const mediumDetail = this.createSimplifiedMesh(object.mesh, 0.5);
    lod.addLevel(mediumDetail, 50);
    
    // Low detail (far away)
    const lowDetail = this.createSimplifiedMesh(object.mesh, 0.2);
    lod.addLevel(lowDetail, 200);
    
    // Replace original mesh with LOD
    this.overlayScene.remove(object.mesh);
    this.overlayScene.add(lod);
    object.mesh = lod;
  }

  private createSimplifiedMesh(originalMesh: THREE.Object3D, simplificationFactor: number): THREE.Object3D {
    // Create simplified version (placeholder implementation)
    const simplified = originalMesh.clone();
    simplified.scale.multiplyScalar(simplificationFactor);
    return simplified;
  }

  public getStats(): any {
    return {
      totalLayers: this.layers.size,
      totalObjects: this.objects.size,
      visibleObjects: Array.from(this.objects.values()).filter(obj => obj.visible).length,
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateMemoryUsage(): number {
    let totalVertices = 0;
    let totalTriangles = 0;

    this.objects.forEach(object => {
      object.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const geometry = child.geometry;
          if (geometry.attributes.position) {
            totalVertices += geometry.attributes.position.count;
          }
          if (geometry.index) {
            totalTriangles += geometry.index.count / 3;
          }
        }
      });
    });

    return {
      vertices: totalVertices,
      triangles: totalTriangles,
      estimatedMB: (totalVertices * 32 + totalTriangles * 16) / (1024 * 1024) // Rough estimate
    };
  }

  public dispose(): void {
    // Clean up all resources
    this.objects.forEach(object => {
      this.disposeMesh(object.mesh);
    });

    this.overlayScene.clear();
    this.objects.clear();
    this.layers.clear();

    if (this.layerPanel) {
      this.layerPanel.uninitialize();
      this.layerPanel = null;
    }
  }
}

export default VibeLuxLayerManager;