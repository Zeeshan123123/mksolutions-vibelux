/**
 * Grid Service Forge Extension
 * Professional CAD-style grid system with snap functionality
 */

import { ForgeExtension } from './vibelux-forge-extensions';
import { VibeLuxLayerManager } from './layer-manager';

interface GridConfig {
  enabled: boolean;
  visible: boolean;
  snapEnabled: boolean;
  majorSpacing: number;
  minorSpacing: number;
  majorColor: string;
  minorColor: string;
  opacity: number;
  fadeDistance: number;
  adaptiveGrid: boolean;
  showAxes: boolean;
  showOrigin: boolean;
  lockToGround: boolean;
  infiniteGrid: boolean;
}

interface GridPlane {
  id: string;
  normal: THREE.Vector3;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  mesh: THREE.Group;
  visible: boolean;
}

/**
 * Grid Service Extension  
 * Professional grid system with multiple planes and snap functionality
 */
export class GridServiceExtension extends ForgeExtension {
  private gridPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private gridPlanes: Map<string, GridPlane> = new Map();
  private snapPoints: THREE.Vector3[] = [];
  private gridConfig: GridConfig;
  private isSnapping: boolean = false;
  private snapIndicator: THREE.Mesh | null = null;

  private defaultConfig: GridConfig = {
    enabled: true,
    visible: true,
    snapEnabled: true,
    majorSpacing: 10, // feet
    minorSpacing: 1,  // feet
    majorColor: '#ffffff',
    minorColor: '#666666',
    opacity: 0.3,
    fadeDistance: 100,
    adaptiveGrid: true,
    showAxes: true,
    showOrigin: true,
    lockToGround: true,
    infiniteGrid: true
  };

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, config: Partial<GridConfig> = {}) {
    super(viewer);
    this.gridConfig = { ...this.defaultConfig, ...config };
  }

  getName(): string {
    return 'VibeLux.GridService';
  }

  load(): boolean {
    this.createGridPanel();
    this.setupToolbar();
    this.setupEventHandlers();
    this.initializeGrids();
    this.setupSnapIndicator();
    console.log('VibeLux Grid Service Extension loaded');
    return true;
  }

  unload(): boolean {
    this.clearAllGrids();
    if (this.gridPanel) {
      this.gridPanel.uninitialize();
      this.gridPanel = null;
    }
    if (this.snapIndicator) {
      this.viewer.impl.scene.remove(this.snapIndicator);
      this.snapIndicator = null;
    }
    return true;
  }

  public setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private createGridPanel(): void {
    this.gridPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-grid-panel',
      'Grid Service',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="grid-service vibelux-extension-panel">
        <div class="extension-header">
          <h3>📐 Grid Service</h3>
          <p>Professional CAD grid system with snap functionality</p>
        </div>
        
        <div class="extension-section">
          <h4>Grid Control</h4>
          <div class="grid-controls">
            <label class="checkbox-item">
              <input type="checkbox" id="grid-enabled" ${this.gridConfig.enabled ? 'checked' : ''}>
              <span>🔲 Enable Grid</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="grid-visible" ${this.gridConfig.visible ? 'checked' : ''}>
              <span>👁️ Show Grid</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="snap-enabled" ${this.gridConfig.snapEnabled ? 'checked' : ''}>
              <span>🧲 Snap to Grid</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="adaptive-grid" ${this.gridConfig.adaptiveGrid ? 'checked' : ''}>
              <span>🔄 Adaptive Grid</span>
            </label>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Grid Spacing</h4>
          <div class="spacing-controls">
            <div class="form-group">
              <label>Major Grid Spacing:</label>
              <div class="input-with-unit">
                <input type="number" id="major-spacing" value="${this.gridConfig.majorSpacing}" min="1" max="100" step="1" class="form-control">
                <span class="unit">ft</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Minor Grid Spacing:</label>
              <div class="input-with-unit">
                <input type="number" id="minor-spacing" value="${this.gridConfig.minorSpacing}" min="0.1" max="10" step="0.1" class="form-control">
                <span class="unit">ft</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Grid Presets:</label>
              <select id="grid-presets" class="form-control">
                <option value="custom">Custom</option>
                <option value="imperial-large">Imperial Large (10' / 1')</option>
                <option value="imperial-medium">Imperial Medium (5' / 1')</option>
                <option value="imperial-small">Imperial Small (1' / 3")</option>
                <option value="metric-large">Metric Large (10m / 1m)</option>
                <option value="metric-medium">Metric Medium (5m / 1m)</option>
                <option value="metric-small">Metric Small (1m / 0.1m)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Grid Appearance</h4>
          <div class="appearance-controls">
            <div class="form-row">
              <div class="form-group half">
                <label>Major Lines:</label>
                <input type="color" id="major-color" value="${this.gridConfig.majorColor}" class="color-input">
              </div>
              <div class="form-group half">
                <label>Minor Lines:</label>
                <input type="color" id="minor-color" value="${this.gridConfig.minorColor}" class="color-input">
              </div>
            </div>
            
            <div class="form-group">
              <label>Opacity: <span id="opacity-value">${Math.round(this.gridConfig.opacity * 100)}%</span></label>
              <input type="range" id="grid-opacity" min="0" max="100" value="${Math.round(this.gridConfig.opacity * 100)}" class="range-input">
            </div>
            
            <div class="form-group">
              <label>Fade Distance: <span id="fade-value">${this.gridConfig.fadeDistance}ft</span></label>
              <input type="range" id="fade-distance" min="10" max="500" value="${this.gridConfig.fadeDistance}" class="range-input">
            </div>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Grid Planes</h4>
          <div class="plane-controls">
            <label class="checkbox-item">
              <input type="checkbox" id="show-xy-plane" checked>
              <span>📋 XY Plane (Ground)</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-xz-plane">
              <span>📐 XZ Plane (Front)</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-yz-plane">
              <span>📏 YZ Plane (Side)</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-axes" ${this.gridConfig.showAxes ? 'checked' : ''}>
              <span>🎯 Show Axes</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-origin" ${this.gridConfig.showOrigin ? 'checked' : ''}>
              <span>⭕ Show Origin</span>
            </label>
          </div>
          
          <div class="plane-list" id="grid-plane-list">
            <!-- Grid planes will be populated here -->
          </div>
          
          <button id="add-custom-plane" class="btn btn-secondary">
            ➕ Add Custom Plane
          </button>
        </div>
        
        <div class="extension-section">
          <h4>Snap Settings</h4>
          <div class="snap-controls">
            <div class="form-group">
              <label>Snap Tolerance: <span id="snap-tolerance-value">5px</span></label>
              <input type="range" id="snap-tolerance" min="1" max="20" value="5" class="range-input">
            </div>
            
            <div class="snap-types">
              <label class="checkbox-item">
                <input type="checkbox" id="snap-to-grid" checked>
                <span>🔲 Grid Points</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="snap-to-axes" checked>
                <span>📏 Axes</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="snap-to-origin" checked>
                <span>⭕ Origin</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="snap-to-intersections" checked>
                <span>✖️ Line Intersections</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Grid Actions</h4>
          <div class="grid-actions">
            <button id="center-grid" class="btn btn-primary">
              🎯 Center Grid on View
            </button>
            <button id="reset-grid" class="btn btn-secondary">
              🔄 Reset to Default
            </button>
            <button id="export-grid-settings" class="btn btn-outline">
              📤 Export Settings
            </button>
            <button id="import-grid-settings" class="btn btn-outline">
              📥 Import Settings
            </button>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Grid Statistics</h4>
          <div class="grid-stats">
            <div class="stat-item">
              <span class="label">Active Planes:</span>
              <span class="value" id="active-planes">1</span>
            </div>
            <div class="stat-item">
              <span class="label">Snap Points:</span>
              <span class="value" id="snap-points-count">0</span>
            </div>
            <div class="stat-item">
              <span class="label">Grid Performance:</span>
              <span class="value" id="grid-performance">Good</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.gridPanel.container.innerHTML = panelContent;
    this.setupGridInterface();
  }

  private setupGridInterface(): void {
    // Grid control toggles
    const gridEnabled = this.gridPanel?.container.querySelector('#grid-enabled') as HTMLInputElement;
    const gridVisible = this.gridPanel?.container.querySelector('#grid-visible') as HTMLInputElement;
    const snapEnabled = this.gridPanel?.container.querySelector('#snap-enabled') as HTMLInputElement;
    const adaptiveGrid = this.gridPanel?.container.querySelector('#adaptive-grid') as HTMLInputElement;

    gridEnabled?.addEventListener('change', (e) => {
      this.gridConfig.enabled = (e.target as HTMLInputElement).checked;
      this.updateGrids();
    });

    gridVisible?.addEventListener('change', (e) => {
      this.gridConfig.visible = (e.target as HTMLInputElement).checked;
      this.updateGridVisibility();
    });

    snapEnabled?.addEventListener('change', (e) => {
      this.gridConfig.snapEnabled = (e.target as HTMLInputElement).checked;
      this.updateSnapPoints();
    });

    adaptiveGrid?.addEventListener('change', (e) => {
      this.gridConfig.adaptiveGrid = (e.target as HTMLInputElement).checked;
      this.updateGrids();
    });

    // Spacing controls
    const majorSpacing = this.gridPanel?.container.querySelector('#major-spacing') as HTMLInputElement;
    const minorSpacing = this.gridPanel?.container.querySelector('#minor-spacing') as HTMLInputElement;
    const gridPresets = this.gridPanel?.container.querySelector('#grid-presets') as HTMLSelectElement;

    majorSpacing?.addEventListener('change', (e) => {
      this.gridConfig.majorSpacing = parseFloat((e.target as HTMLInputElement).value);
      this.updateGrids();
    });

    minorSpacing?.addEventListener('change', (e) => {
      this.gridConfig.minorSpacing = parseFloat((e.target as HTMLInputElement).value);
      this.updateGrids();
    });

    gridPresets?.addEventListener('change', (e) => {
      this.applyGridPreset((e.target as HTMLSelectElement).value);
    });

    // Appearance controls
    const majorColor = this.gridPanel?.container.querySelector('#major-color') as HTMLInputElement;
    const minorColor = this.gridPanel?.container.querySelector('#minor-color') as HTMLInputElement;
    const gridOpacity = this.gridPanel?.container.querySelector('#grid-opacity') as HTMLInputElement;
    const fadeDistance = this.gridPanel?.container.querySelector('#fade-distance') as HTMLInputElement;

    majorColor?.addEventListener('change', (e) => {
      this.gridConfig.majorColor = (e.target as HTMLInputElement).value;
      this.updateGridAppearance();
    });

    minorColor?.addEventListener('change', (e) => {
      this.gridConfig.minorColor = (e.target as HTMLInputElement).value;
      this.updateGridAppearance();
    });

    gridOpacity?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.gridConfig.opacity = value / 100;
      const opacityValue = this.gridPanel?.container.querySelector('#opacity-value');
      if (opacityValue) opacityValue.textContent = `${value}%`;
      this.updateGridAppearance();
    });

    fadeDistance?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.gridConfig.fadeDistance = value;
      const fadeValue = this.gridPanel?.container.querySelector('#fade-value');
      if (fadeValue) fadeValue.textContent = `${value}ft`;
      this.updateGrids();
    });

    // Plane controls
    const planeCheckboxes = ['show-xy-plane', 'show-xz-plane', 'show-yz-plane', 'show-axes', 'show-origin'];
    planeCheckboxes.forEach(id => {
      const checkbox = this.gridPanel?.container.querySelector(`#${id}`) as HTMLInputElement;
      checkbox?.addEventListener('change', () => this.updateGridPlanes());
    });

    // Action buttons
    const centerGrid = this.gridPanel?.container.querySelector('#center-grid');
    const resetGrid = this.gridPanel?.container.querySelector('#reset-grid');
    const exportSettings = this.gridPanel?.container.querySelector('#export-grid-settings');
    const importSettings = this.gridPanel?.container.querySelector('#import-grid-settings');
    const addCustomPlane = this.gridPanel?.container.querySelector('#add-custom-plane');

    centerGrid?.addEventListener('click', () => this.centerGridOnView());
    resetGrid?.addEventListener('click', () => this.resetToDefaults());
    exportSettings?.addEventListener('click', () => this.exportGridSettings());
    importSettings?.addEventListener('click', () => this.importGridSettings());
    addCustomPlane?.addEventListener('click', () => this.addCustomPlane());

    // Snap tolerance
    const snapTolerance = this.gridPanel?.container.querySelector('#snap-tolerance') as HTMLInputElement;
    snapTolerance?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      const toleranceValue = this.gridPanel?.container.querySelector('#snap-tolerance-value');
      if (toleranceValue) toleranceValue.textContent = `${value}px`;
    });
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const gridGroup = toolbar.getControl('grid-controls') || 
      toolbar.addControl('grid-controls', { collapsible: true, index: 3 });

    // Grid toggle button
    const gridToggle = new Autodesk.Viewing.UI.Button('grid-toggle-btn');
    gridToggle.setToolTip('Toggle Grid (G)');
    gridToggle.setIcon('adsk-icon-measure');
    gridToggle.onClick = () => this.toggleGrid();
    gridGroup.addControl(gridToggle);

    // Snap toggle button
    const snapToggle = new Autodesk.Viewing.UI.Button('snap-toggle-btn');
    snapToggle.setToolTip('Toggle Snap (F9)');
    snapToggle.setIcon('adsk-icon-properties');
    snapToggle.onClick = () => this.toggleSnap();
    gridGroup.addControl(snapToggle);

    // Grid settings button
    const gridSettings = new Autodesk.Viewing.UI.Button('grid-settings-btn');
    gridSettings.setToolTip('Grid Settings');
    gridSettings.setIcon('adsk-icon-visibility');
    gridSettings.onClick = () => this.toggleGridPanel();
    gridGroup.addControl(gridSettings);
  }

  private setupEventHandlers(): void {
    // Mouse move handler for snap preview
    this.viewer.addEventListener(Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT, () => {
      this.viewer.canvas.addEventListener('mousemove', (event) => {
        if (this.gridConfig.snapEnabled) {
          this.updateSnapPreview(event);
        }
      });
    });

    // Camera change handler for adaptive grid
    this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, () => {
      if (this.gridConfig.adaptiveGrid) {
        this.updateAdaptiveGrid();
      }
    });
  }

  private initializeGrids(): void {
    // Create default XY plane (ground grid)
    this.createGridPlane('xy', new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0));
    this.updateSnapPoints();
  }

  private createGridPlane(id: string, normal: THREE.Vector3, position: THREE.Vector3): void {
    const gridPlane: GridPlane = {
      id,
      normal: normal.clone(),
      position: position.clone(),
      rotation: new THREE.Euler(),
      mesh: new THREE.Group(),
      visible: true
    };

    // Calculate rotation from normal
    if (normal.equals(new THREE.Vector3(0, 0, 1))) {
      // XY plane (ground)
      gridPlane.rotation.set(0, 0, 0);
    } else if (normal.equals(new THREE.Vector3(0, 1, 0))) {
      // XZ plane (front)
      gridPlane.rotation.set(-Math.PI / 2, 0, 0);
    } else if (normal.equals(new THREE.Vector3(1, 0, 0))) {
      // YZ plane (side)
      gridPlane.rotation.set(0, 0, Math.PI / 2);
    }

    this.generateGridMesh(gridPlane);
    this.gridPlanes.set(id, gridPlane);

    // Add to layer manager or scene
    if (this.layerManager) {
      this.layerManager.addObjectToLayer(
        'temp-geometry',
        `grid-${id}`,
        gridPlane.mesh,
        'system',
        { gridPlane }
      );
    } else {
      this.viewer.impl.scene.add(gridPlane.mesh);
    }

    this.viewer.impl.invalidate(true);
  }

  private generateGridMesh(gridPlane: GridPlane): void {
    const group = gridPlane.mesh;
    group.clear(); // Clear existing mesh

    if (!this.gridConfig.enabled || !this.gridConfig.visible) return;

    const majorSpacing = this.gridConfig.majorSpacing;
    const minorSpacing = this.gridConfig.minorSpacing;
    const size = this.gridConfig.infiniteGrid ? this.gridConfig.fadeDistance : 50;

    // Create minor grid lines
    if (minorSpacing > 0) {
      const minorLines = this.createGridLines(size, minorSpacing, this.gridConfig.minorColor, 1);
      group.add(minorLines);
    }

    // Create major grid lines
    if (majorSpacing > 0) {
      const majorLines = this.createGridLines(size, majorSpacing, this.gridConfig.majorColor, 2);
      group.add(majorLines);
    }

    // Create axes if enabled
    if (this.gridConfig.showAxes) {
      const axes = this.createAxes(size);
      group.add(axes);
    }

    // Create origin marker if enabled
    if (this.gridConfig.showOrigin) {
      const origin = this.createOriginMarker();
      group.add(origin);
    }

    // Apply position and rotation
    group.position.copy(gridPlane.position);
    group.rotation.copy(gridPlane.rotation);

    // Apply fade effect based on camera distance
    this.applyFadeEffect(group);
  }

  private createGridLines(size: number, spacing: number, color: string, lineWidth: number): THREE.LineSegments {
    const points: THREE.Vector3[] = [];
    const halfSize = size / 2;
    const lines = Math.floor(size / spacing);

    // Create horizontal lines
    for (let i = -lines; i <= lines; i++) {
      const y = i * spacing;
      points.push(new THREE.Vector3(-halfSize, y, 0));
      points.push(new THREE.Vector3(halfSize, y, 0));
    }

    // Create vertical lines
    for (let i = -lines; i <= lines; i++) {
      const x = i * spacing;
      points.push(new THREE.Vector3(x, -halfSize, 0));
      points.push(new THREE.Vector3(x, halfSize, 0));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      opacity: this.gridConfig.opacity,
      transparent: true,
      linewidth: lineWidth
    });

    return new THREE.LineSegments(geometry, material);
  }

  private createAxes(size: number): THREE.Group {
    const axesGroup = new THREE.Group();
    const halfSize = size / 2;

    // X-axis (red)
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfSize, 0, 0),
      new THREE.Vector3(halfSize, 0, 0)
    ]);
    const xMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff0000, 
      opacity: this.gridConfig.opacity * 1.5,
      transparent: true,
      linewidth: 3
    });
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    axesGroup.add(xAxis);

    // Y-axis (green)
    const yGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -halfSize, 0),
      new THREE.Vector3(0, halfSize, 0)
    ]);
    const yMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      opacity: this.gridConfig.opacity * 1.5,
      transparent: true,
      linewidth: 3
    });
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    axesGroup.add(yAxis);

    return axesGroup;
  }

  private createOriginMarker(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      opacity: this.gridConfig.opacity * 2,
      transparent: true
    });
    const origin = new THREE.Mesh(geometry, material);
    origin.position.set(0, 0, 0);
    return origin;
  }

  private applyFadeEffect(group: THREE.Group): void {
    if (!this.gridConfig.adaptiveGrid) return;

    const camera = this.viewer.impl.camera;
    if (!camera) return;

    const distance = camera.position.distanceTo(group.position);
    const fadeStart = this.gridConfig.fadeDistance * 0.7;
    const fadeEnd = this.gridConfig.fadeDistance;

    let fadeOpacity = 1;
    if (distance > fadeStart) {
      fadeOpacity = Math.max(0, 1 - (distance - fadeStart) / (fadeEnd - fadeStart));
    }

    group.traverse((child) => {
      if (child instanceof THREE.Line || child instanceof THREE.LineSegments) {
        const material = child.material as THREE.LineBasicMaterial;
        material.opacity = this.gridConfig.opacity * fadeOpacity;
      }
    });
  }

  private setupSnapIndicator(): void {
    // Create snap indicator (small sphere)
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    this.snapIndicator = new THREE.Mesh(geometry, material);
    this.snapIndicator.visible = false;
    this.viewer.impl.scene.add(this.snapIndicator);
  }

  private updateSnapPoints(): void {
    this.snapPoints = [];

    if (!this.gridConfig.snapEnabled) return;

    const majorSpacing = this.gridConfig.majorSpacing;
    const minorSpacing = this.gridConfig.minorSpacing;
    const size = 50; // Reasonable size for snap points

    // Generate grid intersection points
    const halfSize = size / 2;
    const spacing = this.gridConfig.snapEnabled ? minorSpacing : majorSpacing;

    for (let x = -halfSize; x <= halfSize; x += spacing) {
      for (let y = -halfSize; y <= halfSize; y += spacing) {
        this.snapPoints.push(new THREE.Vector3(x, y, 0));
      }
    }

    // Add origin
    this.snapPoints.push(new THREE.Vector3(0, 0, 0));

    this.updateGridStats();
  }

  private updateSnapPreview(event: MouseEvent): void {
    if (!this.gridConfig.snapEnabled || !this.snapIndicator) return;

    const rect = this.viewer.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldPoint = this.viewer.clientToWorld(x, y, true);
    if (!worldPoint) {
      this.snapIndicator.visible = false;
      return;
    }

    // Find closest snap point
    let closestPoint: THREE.Vector3 | null = null;
    let minDistance = this.gridConfig.minorSpacing * 0.5; // Snap tolerance in world units

    for (const snapPoint of this.snapPoints) {
      const distance = worldPoint.distanceTo(snapPoint);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = snapPoint;
      }
    }

    if (closestPoint) {
      this.snapIndicator.position.copy(closestPoint);
      this.snapIndicator.visible = true;
      this.isSnapping = true;
    } else {
      this.snapIndicator.visible = false;
      this.isSnapping = false;
    }

    this.viewer.impl.invalidate(true);
  }

  private updateGrids(): void {
    this.gridPlanes.forEach(gridPlane => {
      this.generateGridMesh(gridPlane);
    });
    this.updateSnapPoints();
  }

  private updateGridVisibility(): void {
    this.gridPlanes.forEach(gridPlane => {
      gridPlane.mesh.visible = this.gridConfig.visible && gridPlane.visible;
    });
    this.viewer.impl.invalidate(true);
  }

  private updateGridAppearance(): void {
    this.gridPlanes.forEach(gridPlane => {
      gridPlane.mesh.traverse((child) => {
        if (child instanceof THREE.Line || child instanceof THREE.LineSegments) {
          const material = child.material as THREE.LineBasicMaterial;
          material.opacity = this.gridConfig.opacity;
          material.needsUpdate = true;
        }
      });
    });
    this.viewer.impl.invalidate(true);
  }

  private updateGridPlanes(): void {
    const showXY = (this.gridPanel?.container.querySelector('#show-xy-plane') as HTMLInputElement)?.checked;
    const showXZ = (this.gridPanel?.container.querySelector('#show-xz-plane') as HTMLInputElement)?.checked;
    const showYZ = (this.gridPanel?.container.querySelector('#show-yz-plane') as HTMLInputElement)?.checked;

    // Update existing planes
    const xyPlane = this.gridPlanes.get('xy');
    if (xyPlane) xyPlane.visible = showXY || false;

    // Create or remove XZ plane
    if (showXZ && !this.gridPlanes.has('xz')) {
      this.createGridPlane('xz', new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0));
    } else if (!showXZ && this.gridPlanes.has('xz')) {
      this.removeGridPlane('xz');
    }

    // Create or remove YZ plane
    if (showYZ && !this.gridPlanes.has('yz')) {
      this.createGridPlane('yz', new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0));
    } else if (!showYZ && this.gridPlanes.has('yz')) {
      this.removeGridPlane('yz');
    }

    // Update axes and origin settings
    this.gridConfig.showAxes = (this.gridPanel?.container.querySelector('#show-axes') as HTMLInputElement)?.checked || false;
    this.gridConfig.showOrigin = (this.gridPanel?.container.querySelector('#show-origin') as HTMLInputElement)?.checked || false;

    this.updateGrids();
    this.updateGridStats();
  }

  private removeGridPlane(id: string): void {
    const gridPlane = this.gridPlanes.get(id);
    if (gridPlane) {
      if (this.layerManager) {
        this.layerManager.removeObjectFromLayer(`grid-${id}`);
      } else {
        this.viewer.impl.scene.remove(gridPlane.mesh);
      }

      // Dispose geometry and materials
      gridPlane.mesh.traverse((child) => {
        if (child instanceof THREE.Line || child instanceof THREE.LineSegments || child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });

      this.gridPlanes.delete(id);
      this.viewer.impl.invalidate(true);
    }
  }

  private updateAdaptiveGrid(): void {
    if (!this.gridConfig.adaptiveGrid) return;

    const camera = this.viewer.impl.camera;
    if (!camera) return;

    // Adjust grid density based on camera distance
    const distance = camera.position.length();
    
    if (distance > 100) {
      this.gridConfig.minorSpacing = Math.max(1, distance / 50);
      this.gridConfig.majorSpacing = this.gridConfig.minorSpacing * 10;
    } else {
      this.gridConfig.minorSpacing = 1;
      this.gridConfig.majorSpacing = 10;
    }

    this.updateGrids();
  }

  private applyGridPreset(preset: string): void {
    const presets: Record<string, Partial<GridConfig>> = {
      'imperial-large': { majorSpacing: 10, minorSpacing: 1 },
      'imperial-medium': { majorSpacing: 5, minorSpacing: 1 },
      'imperial-small': { majorSpacing: 1, minorSpacing: 0.25 },
      'metric-large': { majorSpacing: 10, minorSpacing: 1 },
      'metric-medium': { majorSpacing: 5, minorSpacing: 1 },
      'metric-small': { majorSpacing: 1, minorSpacing: 0.1 }
    };

    const presetConfig = presets[preset];
    if (presetConfig) {
      Object.assign(this.gridConfig, presetConfig);
      
      // Update UI inputs
      const majorSpacing = this.gridPanel?.container.querySelector('#major-spacing') as HTMLInputElement;
      const minorSpacing = this.gridPanel?.container.querySelector('#minor-spacing') as HTMLInputElement;
      
      if (majorSpacing) majorSpacing.value = this.gridConfig.majorSpacing.toString();
      if (minorSpacing) minorSpacing.value = this.gridConfig.minorSpacing.toString();
      
      this.updateGrids();
    }
  }

  private centerGridOnView(): void {
    const camera = this.viewer.impl.camera;
    if (!camera) return;

    const target = this.viewer.navigation.getTarget();
    
    this.gridPlanes.forEach(gridPlane => {
      gridPlane.position.copy(target);
      gridPlane.mesh.position.copy(target);
    });

    this.updateSnapPoints();
    this.viewer.impl.invalidate(true);
  }

  private resetToDefaults(): void {
    this.gridConfig = { ...this.defaultConfig };
    
    // Update all UI controls
    this.syncUIWithConfig();
    
    this.updateGrids();
  }

  private syncUIWithConfig(): void {
    const controls = {
      'grid-enabled': this.gridConfig.enabled,
      'grid-visible': this.gridConfig.visible,
      'snap-enabled': this.gridConfig.snapEnabled,
      'adaptive-grid': this.gridConfig.adaptiveGrid,
      'show-axes': this.gridConfig.showAxes,
      'show-origin': this.gridConfig.showOrigin
    };

    Object.entries(controls).forEach(([id, value]) => {
      const element = this.gridPanel?.container.querySelector(`#${id}`) as HTMLInputElement;
      if (element) element.checked = value;
    });

    const valueControls = {
      'major-spacing': this.gridConfig.majorSpacing,
      'minor-spacing': this.gridConfig.minorSpacing,
      'major-color': this.gridConfig.majorColor,
      'minor-color': this.gridConfig.minorColor
    };

    Object.entries(valueControls).forEach(([id, value]) => {
      const element = this.gridPanel?.container.querySelector(`#${id}`) as HTMLInputElement;
      if (element) element.value = value.toString();
    });

    // Update range inputs
    const gridOpacity = this.gridPanel?.container.querySelector('#grid-opacity') as HTMLInputElement;
    const fadeDistance = this.gridPanel?.container.querySelector('#fade-distance') as HTMLInputElement;
    
    if (gridOpacity) gridOpacity.value = (this.gridConfig.opacity * 100).toString();
    if (fadeDistance) fadeDistance.value = this.gridConfig.fadeDistance.toString();
  }

  private addCustomPlane(): void {
    const normal = prompt('Enter plane normal (x,y,z):');
    const position = prompt('Enter plane position (x,y,z):');
    
    if (normal && position) {
      try {
        const [nx, ny, nz] = normal.split(',').map(n => parseFloat(n.trim()));
        const [px, py, pz] = position.split(',').map(p => parseFloat(p.trim()));
        
        const customId = `custom-${Date.now()}`;
        this.createGridPlane(
          customId,
          new THREE.Vector3(nx, ny, nz),
          new THREE.Vector3(px, py, pz)
        );
        
        this.updateGridStats();
      } catch (error) {
        alert('Invalid input format. Use: x,y,z');
      }
    }
  }

  private updateGridStats(): void {
    const activePlanes = Array.from(this.gridPlanes.values()).filter(p => p.visible).length;
    const snapPointsCount = this.snapPoints.length;
    
    const activePlanesElement = this.gridPanel?.container.querySelector('#active-planes');
    const snapPointsElement = this.gridPanel?.container.querySelector('#snap-points-count');
    const performanceElement = this.gridPanel?.container.querySelector('#grid-performance');
    
    if (activePlanesElement) activePlanesElement.textContent = activePlanes.toString();
    if (snapPointsElement) snapPointsElement.textContent = snapPointsCount.toString();
    
    // Calculate performance rating
    let performance = 'Excellent';
    if (snapPointsCount > 10000) performance = 'Good';
    if (snapPointsCount > 50000) performance = 'Fair';
    if (snapPointsCount > 100000) performance = 'Poor';
    
    if (performanceElement) performanceElement.textContent = performance;
  }

  private clearAllGrids(): void {
    this.gridPlanes.forEach((gridPlane, id) => {
      this.removeGridPlane(id);
    });
    this.snapPoints = [];
  }

  private exportGridSettings(): void {
    const settings = {
      config: this.gridConfig,
      planes: Array.from(this.gridPlanes.entries()).map(([id, plane]) => ({
        id,
        normal: plane.normal.toArray(),
        position: plane.position.toArray(),
        visible: plane.visible
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibelux-grid-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private importGridSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            this.applyImportedSettings(settings);
          } catch (error) {
            console.error('Error importing grid settings:', error);
            alert('Error importing grid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  private applyImportedSettings(settings: any): void {
    if (settings.config) {
      this.gridConfig = { ...this.defaultConfig, ...settings.config };
      this.syncUIWithConfig();
    }

    if (settings.planes) {
      // Clear existing custom planes
      const customPlanes = Array.from(this.gridPlanes.keys()).filter(id => id.startsWith('custom-'));
      customPlanes.forEach(id => this.removeGridPlane(id));

      // Create imported planes
      settings.planes.forEach((planeData: any) => {
        if (planeData.id !== 'xy') { // Don't recreate default plane
          this.createGridPlane(
            planeData.id,
            new THREE.Vector3().fromArray(planeData.normal),
            new THREE.Vector3().fromArray(planeData.position)
          );
        }
      });
    }

    this.updateGrids();
    console.log('Grid settings imported successfully');
  }

  // Public API methods
  public toggleGrid(): void {
    this.gridConfig.visible = !this.gridConfig.visible;
    this.updateGridVisibility();
    
    const checkbox = this.gridPanel?.container.querySelector('#grid-visible') as HTMLInputElement;
    if (checkbox) checkbox.checked = this.gridConfig.visible;
  }

  public toggleSnap(): void {
    this.gridConfig.snapEnabled = !this.gridConfig.snapEnabled;
    this.updateSnapPoints();
    
    const checkbox = this.gridPanel?.container.querySelector('#snap-enabled') as HTMLInputElement;
    if (checkbox) checkbox.checked = this.gridConfig.snapEnabled;
    
    if (this.snapIndicator) {
      this.snapIndicator.visible = false;
    }
  }

  public toggleGridPanel(): void {
    if (this.gridPanel) {
      this.gridPanel.setVisible(!this.gridPanel.isVisible());
    }
  }

  public snapToGrid(point: THREE.Vector3): THREE.Vector3 {
    if (!this.gridConfig.snapEnabled) return point;

    const spacing = this.gridConfig.minorSpacing;
    return new THREE.Vector3(
      Math.round(point.x / spacing) * spacing,
      Math.round(point.y / spacing) * spacing,
      Math.round(point.z / spacing) * spacing
    );
  }

  public isGridEnabled(): boolean {
    return this.gridConfig.enabled;
  }

  public isSnapEnabled(): boolean {
    return this.gridConfig.snapEnabled;
  }

  public getGridConfig(): GridConfig {
    return { ...this.gridConfig };
  }

  public getSnapPoints(): THREE.Vector3[] {
    return [...this.snapPoints];
  }
}

export default GridServiceExtension;