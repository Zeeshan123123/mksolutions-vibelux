/**
 * Dimension Tools Forge Extension
 * Professional CAD-style dimensioning tools integrated with Forge
 */

import { ForgeExtension } from './vibelux-forge-extensions';
import { VibeLuxLayerManager } from './layer-manager';

interface DimensionPoint {
  x: number;
  y: number;
  z: number;
  screenPosition?: { x: number; y: number };
}

interface Dimension {
  id: string;
  type: 'linear' | 'angular' | 'radial' | 'diameter' | 'arc-length';
  points: DimensionPoint[];
  value: number;
  unit: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  precision: number;
  text: string;
  textPosition: DimensionPoint;
  layer: string;
  style: DimensionStyle;
  mesh: THREE.Group;
  visible: boolean;
  locked: boolean;
}

interface DimensionStyle {
  color: string;
  lineWidth: number;
  textSize: number;
  textColor: string;
  arrowSize: number;
  arrowType: 'arrow' | 'tick' | 'dot' | 'none';
  extensionLineOffset: number;
  extensionLineOvershoot: number;
  textOffset: number;
  showUnits: boolean;
  precision: number;
}

/**
 * Dimension Tools Extension
 * Professional dimensioning with CAD-style features
 */
export class DimensionToolsExtension extends ForgeExtension {
  private dimensionPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private dimensions: Map<string, Dimension> = new Map();
  private activeTool: string | null = null;
  private isDrawing: boolean = false;
  private currentPoints: DimensionPoint[] = [];
  private layerManager: VibeLuxLayerManager | null = null;
  private snapPoints: DimensionPoint[] = [];
  private snapDistance: number = 10; // pixels
  private gridSnap: boolean = true;
  private objectSnap: boolean = true;

  private defaultStyle: DimensionStyle = {
    color: '#00ff00',
    lineWidth: 2,
    textSize: 12,
    textColor: '#ffffff',
    arrowSize: 8,
    arrowType: 'arrow',
    extensionLineOffset: 2,
    extensionLineOvershoot: 4,
    textOffset: 4,
    showUnits: true,
    precision: 2
  };

  private currentStyle: DimensionStyle = { ...this.defaultStyle };

  getName(): string {
    return 'VibeLux.DimensionTools';
  }

  load(): boolean {
    this.createDimensionPanel();
    this.setupToolbar();
    this.setupEventHandlers();
    this.initializeSnapPoints();
    console.log('VibeLux Dimension Tools Extension loaded');
    return true;
  }

  unload(): boolean {
    this.clearAllDimensions();
    if (this.dimensionPanel) {
      this.dimensionPanel.uninitialize();
      this.dimensionPanel = null;
    }
    return true;
  }

  public setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private createDimensionPanel(): void {
    this.dimensionPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-dimension-panel',
      'Dimension Tools',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="dimension-tools vibelux-extension-panel">
        <div class="extension-header">
          <h3>📏 Dimension Tools</h3>
          <p>Professional CAD-style dimensioning</p>
        </div>
        
        <div class="extension-section">
          <h4>Dimension Tools</h4>
          <div class="tool-grid">
            <button class="tool-btn" data-tool="linear" title="Linear Dimension">
              <div class="tool-icon">📏</div>
              <span>Linear</span>
            </button>
            <button class="tool-btn" data-tool="angular" title="Angular Dimension">
              <div class="tool-icon">📐</div>
              <span>Angular</span>
            </button>
            <button class="tool-btn" data-tool="radial" title="Radial Dimension">
              <div class="tool-icon">⭕</div>
              <span>Radial</span>
            </button>
            <button class="tool-btn" data-tool="diameter" title="Diameter Dimension">
              <div class="tool-icon">⌀</div>
              <span>Diameter</span>
            </button>
            <button class="tool-btn" data-tool="arc-length" title="Arc Length Dimension">
              <div class="tool-icon">🌙</div>
              <span>Arc Length</span>
            </button>
            <button class="tool-btn" data-tool="continuous" title="Continuous Dimensions">
              <div class="tool-icon">📊</div>
              <span>Continuous</span>
            </button>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Snap Settings</h4>
          <div class="snap-controls">
            <label class="checkbox-item">
              <input type="checkbox" id="grid-snap" checked>
              <span>🔲 Grid Snap</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="object-snap" checked>
              <span>🎯 Object Snap</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="endpoint-snap" checked>
              <span>📍 Endpoint Snap</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="midpoint-snap" checked>
              <span>⚫ Midpoint Snap</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="center-snap" checked>
              <span>🎭 Center Snap</span>
            </label>
          </div>
          
          <div class="snap-distance">
            <label>Snap Distance:</label>
            <input type="range" id="snap-distance" min="5" max="50" value="10">
            <span id="snap-value">10px</span>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Dimension Style</h4>
          <div class="style-controls">
            <div class="form-group">
              <label>Line Color:</label>
              <input type="color" id="line-color" value="#00ff00" class="color-input">
            </div>
            
            <div class="form-group">
              <label>Text Color:</label>
              <input type="color" id="text-color" value="#ffffff" class="color-input">
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label>Line Width:</label>
                <input type="number" id="line-width" value="2" min="1" max="10" class="form-control">
              </div>
              <div class="form-group half">
                <label>Text Size:</label>
                <input type="number" id="text-size" value="12" min="8" max="24" class="form-control">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label>Arrow Type:</label>
                <select id="arrow-type" class="form-control">
                  <option value="arrow">Arrow</option>
                  <option value="tick">Tick</option>
                  <option value="dot">Dot</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div class="form-group half">
                <label>Arrow Size:</label>
                <input type="number" id="arrow-size" value="8" min="4" max="20" class="form-control">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label>Precision:</label>
                <select id="precision" class="form-control">
                  <option value="0">0</option>
                  <option value="1">0.0</option>
                  <option value="2" selected>0.00</option>
                  <option value="3">0.000</option>
                  <option value="4">0.0000</option>
                </select>
              </div>
              <div class="form-group half">
                <label>Units:</label>
                <select id="units" class="form-control">
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="in">in</option>
                  <option value="ft" selected>ft</option>
                </select>
              </div>
            </div>
            
            <div class="checkbox-item">
              <input type="checkbox" id="show-units" checked>
              <span>Show Units</span>
            </div>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Dimension List</h4>
          <div id="dimension-list" class="dimension-list">
            <p class="no-dimensions">No dimensions created yet</p>
          </div>
          
          <div class="dimension-actions">
            <button id="select-all-dims" class="btn btn-secondary">
              ✓ Select All
            </button>
            <button id="hide-all-dims" class="btn btn-secondary">
              👁️ Hide All
            </button>
            <button id="delete-all-dims" class="btn btn-danger">
              🗑️ Delete All
            </button>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Export & Import</h4>
          <div class="export-controls">
            <button id="export-dimensions" class="btn btn-primary">
              📤 Export Dimensions
            </button>
            <button id="import-dimensions" class="btn btn-secondary">
              📥 Import Dimensions
            </button>
          </div>
        </div>
        
        <div class="extension-section">
          <h4>Current Tool Status</h4>
          <div id="tool-status" class="tool-status">
            <div class="status-item">
              <span class="label">Active Tool:</span>
              <span class="value" id="active-tool">None</span>
            </div>
            <div class="status-item">
              <span class="label">Points Collected:</span>
              <span class="value" id="points-count">0</span>
            </div>
            <div class="status-item">
              <span class="label">Total Dimensions:</span>
              <span class="value" id="total-dimensions">0</span>
            </div>
          </div>
          
          <div id="tool-instructions" class="tool-instructions">
            <p>Select a dimension tool to begin</p>
          </div>
        </div>
      </div>
    `;

    this.dimensionPanel.container.innerHTML = panelContent;
    this.setupDimensionInterface();
  }

  private setupDimensionInterface(): void {
    // Tool selection
    const toolButtons = this.dimensionPanel?.container.querySelectorAll('.tool-btn');
    toolButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const tool = (e.currentTarget as HTMLElement).dataset.tool;
        if (tool) {
          this.activateTool(tool);
        }
      });
    });

    // Snap settings
    const gridSnap = this.dimensionPanel?.container.querySelector('#grid-snap') as HTMLInputElement;
    const objectSnap = this.dimensionPanel?.container.querySelector('#object-snap') as HTMLInputElement;
    const snapDistance = this.dimensionPanel?.container.querySelector('#snap-distance') as HTMLInputElement;
    const snapValue = this.dimensionPanel?.container.querySelector('#snap-value');

    gridSnap?.addEventListener('change', (e) => {
      this.gridSnap = (e.target as HTMLInputElement).checked;
    });

    objectSnap?.addEventListener('change', (e) => {
      this.objectSnap = (e.target as HTMLInputElement).checked;
    });

    snapDistance?.addEventListener('input', (e) => {
      this.snapDistance = parseInt((e.target as HTMLInputElement).value);
      if (snapValue) snapValue.textContent = `${this.snapDistance}px`;
    });

    // Style controls
    this.setupStyleControls();

    // Action buttons
    const selectAllBtn = this.dimensionPanel?.container.querySelector('#select-all-dims');
    const hideAllBtn = this.dimensionPanel?.container.querySelector('#hide-all-dims');
    const deleteAllBtn = this.dimensionPanel?.container.querySelector('#delete-all-dims');
    const exportBtn = this.dimensionPanel?.container.querySelector('#export-dimensions');
    const importBtn = this.dimensionPanel?.container.querySelector('#import-dimensions');

    selectAllBtn?.addEventListener('click', () => this.selectAllDimensions());
    hideAllBtn?.addEventListener('click', () => this.hideAllDimensions());
    deleteAllBtn?.addEventListener('click', () => this.deleteAllDimensions());
    exportBtn?.addEventListener('click', () => this.exportDimensions());
    importBtn?.addEventListener('click', () => this.importDimensions());
  }

  private setupStyleControls(): void {
    const controls = [
      'line-color', 'text-color', 'line-width', 'text-size',
      'arrow-type', 'arrow-size', 'precision', 'units', 'show-units'
    ];

    controls.forEach(controlId => {
      const element = this.dimensionPanel?.container.querySelector(`#${controlId}`);
      element?.addEventListener('change', () => this.updateCurrentStyle());
    });
  }

  private updateCurrentStyle(): void {
    const lineColor = (this.dimensionPanel?.container.querySelector('#line-color') as HTMLInputElement)?.value;
    const textColor = (this.dimensionPanel?.container.querySelector('#text-color') as HTMLInputElement)?.value;
    const lineWidth = parseInt((this.dimensionPanel?.container.querySelector('#line-width') as HTMLInputElement)?.value || '2');
    const textSize = parseInt((this.dimensionPanel?.container.querySelector('#text-size') as HTMLInputElement)?.value || '12');
    const arrowType = (this.dimensionPanel?.container.querySelector('#arrow-type') as HTMLSelectElement)?.value as any;
    const arrowSize = parseInt((this.dimensionPanel?.container.querySelector('#arrow-size') as HTMLInputElement)?.value || '8');
    const precision = parseInt((this.dimensionPanel?.container.querySelector('#precision') as HTMLSelectElement)?.value || '2');
    const showUnits = (this.dimensionPanel?.container.querySelector('#show-units') as HTMLInputElement)?.checked;

    this.currentStyle = {
      ...this.currentStyle,
      color: lineColor || this.currentStyle.color,
      textColor: textColor || this.currentStyle.textColor,
      lineWidth,
      textSize,
      arrowType,
      arrowSize,
      precision,
      showUnits: showUnits !== undefined ? showUnits : this.currentStyle.showUnits
    };
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const dimensionGroup = toolbar.getControl('dimension-controls') || 
      toolbar.addControl('dimension-controls', { collapsible: true, index: 4 });

    // Linear dimension tool
    const linearBtn = new Autodesk.Viewing.UI.Button('linear-dimension-btn');
    linearBtn.setToolTip('Linear Dimension (LI)');
    linearBtn.setIcon('adsk-icon-measure');
    linearBtn.onClick = () => this.activateTool('linear');
    dimensionGroup.addControl(linearBtn);

    // Angular dimension tool
    const angularBtn = new Autodesk.Viewing.UI.Button('angular-dimension-btn');
    angularBtn.setToolTip('Angular Dimension (AN)');
    angularBtn.setIcon('adsk-icon-measure');
    angularBtn.onClick = () => this.activateTool('angular');
    dimensionGroup.addControl(angularBtn);

    // Radial dimension tool
    const radialBtn = new Autodesk.Viewing.UI.Button('radial-dimension-btn');
    radialBtn.setToolTip('Radial Dimension');
    radialBtn.setIcon('adsk-icon-measure');
    radialBtn.onClick = () => this.activateTool('radial');
    dimensionGroup.addControl(radialBtn);

    // Toggle dimension panel
    const panelToggle = new Autodesk.Viewing.UI.Button('dimension-panel-toggle');
    panelToggle.setToolTip('Dimension Panel');
    panelToggle.setIcon('adsk-icon-properties');
    panelToggle.onClick = () => this.toggleDimensionPanel();
    dimensionGroup.addControl(panelToggle);
  }

  private setupEventHandlers(): void {
    // Mouse click handler for point collection
    this.viewer.addEventListener(Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT, () => {
      this.viewer.canvas.addEventListener('click', (event) => {
        if (this.activeTool && this.isDrawing) {
          this.handleCanvasClick(event);
        }
      });

      this.viewer.canvas.addEventListener('mousemove', (event) => {
        if (this.activeTool) {
          this.handleMouseMove(event);
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
  }

  private initializeSnapPoints(): void {
    // Initialize snap points from model geometry
    this.updateSnapPoints();
  }

  private updateSnapPoints(): void {
    this.snapPoints = [];
    const model = this.viewer.model;
    
    if (model) {
      const bbox = model.getBoundingBox();
      if (bbox) {
        // Add bounding box corners as snap points
        const corners = [
          { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
          { x: bbox.max.x, y: bbox.min.y, z: bbox.min.z },
          { x: bbox.max.x, y: bbox.max.y, z: bbox.min.z },
          { x: bbox.min.x, y: bbox.max.y, z: bbox.min.z },
          { x: bbox.min.x, y: bbox.min.y, z: bbox.max.z },
          { x: bbox.max.x, y: bbox.min.y, z: bbox.max.z },
          { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z },
          { x: bbox.min.x, y: bbox.max.y, z: bbox.max.z }
        ];
        
        this.snapPoints.push(...corners);
      }
    }
  }

  private activateTool(tool: string): void {
    // Deactivate current tool
    if (this.activeTool) {
      this.deactivateTool();
    }

    this.activeTool = tool;
    this.isDrawing = true;
    this.currentPoints = [];

    // Update UI
    this.updateToolUI();
    this.updateInstructions(tool);

    // Change cursor
    this.viewer.canvas.style.cursor = 'crosshair';

    console.log(`Activated dimension tool: ${tool}`);
  }

  private deactivateTool(): void {
    this.activeTool = null;
    this.isDrawing = false;
    this.currentPoints = [];
    
    // Reset cursor
    this.viewer.canvas.style.cursor = 'default';
    
    // Update UI
    this.updateToolUI();
    this.updateInstructions('none');
  }

  private updateToolUI(): void {
    // Update tool button states
    const toolButtons = this.dimensionPanel?.container.querySelectorAll('.tool-btn');
    toolButtons?.forEach(button => {
      const tool = (button as HTMLElement).dataset.tool;
      if (tool === this.activeTool) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Update status
    const activeToolElement = this.dimensionPanel?.container.querySelector('#active-tool');
    const pointsCountElement = this.dimensionPanel?.container.querySelector('#points-count');
    const totalDimensionsElement = this.dimensionPanel?.container.querySelector('#total-dimensions');

    if (activeToolElement) activeToolElement.textContent = this.activeTool || 'None';
    if (pointsCountElement) pointsCountElement.textContent = this.currentPoints.length.toString();
    if (totalDimensionsElement) totalDimensionsElement.textContent = this.dimensions.size.toString();
  }

  private updateInstructions(tool: string): void {
    const instructionsElement = this.dimensionPanel?.container.querySelector('#tool-instructions');
    if (!instructionsElement) return;

    const instructions: Record<string, string> = {
      'none': 'Select a dimension tool to begin',
      'linear': 'Click first point, then second point to create linear dimension',
      'angular': 'Click first line, then second line to create angular dimension',
      'radial': 'Click on circle or arc to create radial dimension',
      'diameter': 'Click on circle to create diameter dimension', 
      'arc-length': 'Click on arc to create arc length dimension',
      'continuous': 'Click points to create continuous dimensions'
    };

    instructionsElement.innerHTML = `<p>${instructions[tool] || instructions['none']}</p>`;
  }

  private handleCanvasClick(event: MouseEvent): void {
    if (!this.activeTool) return;

    const point = this.getClickPoint(event);
    if (!point) return;

    // Apply snapping
    const snappedPoint = this.applySnapping(point);
    this.currentPoints.push(snappedPoint);

    // Check if we have enough points for the current tool
    if (this.hasEnoughPoints()) {
      this.createDimension();
    }

    this.updateToolUI();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.activeTool || !this.isDrawing) return;

    // Update preview if needed
    this.updatePreview(event);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.activeTool) return;

    switch (event.key) {
      case 'Escape':
        this.deactivateTool();
        break;
      case 'Enter':
        if (this.hasEnoughPoints()) {
          this.createDimension();
        }
        break;
    }
  }

  private getClickPoint(event: MouseEvent): DimensionPoint | null {
    const rect = this.viewer.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldPoint = this.viewer.clientToWorld(x, y, true);
    if (!worldPoint) return null;

    return {
      x: worldPoint.x,
      y: worldPoint.y,
      z: worldPoint.z,
      screenPosition: { x, y }
    };
  }

  private applySnapping(point: DimensionPoint): DimensionPoint {
    if (!this.objectSnap && !this.gridSnap) return point;

    let snappedPoint = { ...point };

    // Object snapping
    if (this.objectSnap && point.screenPosition) {
      const closestSnap = this.findClosestSnapPoint(point);
      if (closestSnap) {
        snappedPoint = closestSnap;
      }
    }

    // Grid snapping
    if (this.gridSnap) {
      const gridSize = 1; // 1 unit grid
      snappedPoint.x = Math.round(snappedPoint.x / gridSize) * gridSize;
      snappedPoint.y = Math.round(snappedPoint.y / gridSize) * gridSize;
      snappedPoint.z = Math.round(snappedPoint.z / gridSize) * gridSize;
    }

    return snappedPoint;
  }

  private findClosestSnapPoint(point: DimensionPoint): DimensionPoint | null {
    if (!point.screenPosition) return null;

    let closestPoint: DimensionPoint | null = null;
    let minDistance = this.snapDistance;

    for (const snapPoint of this.snapPoints) {
      const screenPos = this.worldToScreen(snapPoint);
      if (screenPos) {
        const distance = Math.sqrt(
          Math.pow(screenPos.x - point.screenPosition.x, 2) +
          Math.pow(screenPos.y - point.screenPosition.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = { ...snapPoint, screenPosition: screenPos };
        }
      }
    }

    return closestPoint;
  }

  private worldToScreen(point: DimensionPoint): { x: number; y: number } | null {
    const vector = new THREE.Vector3(point.x, point.y, point.z);
    const camera = this.viewer.impl.camera;
    const canvas = this.viewer.canvas;
    
    if (!camera || !canvas) return null;

    vector.project(camera);
    
    return {
      x: (vector.x * 0.5 + 0.5) * canvas.clientWidth,
      y: (vector.y * -0.5 + 0.5) * canvas.clientHeight
    };
  }

  private hasEnoughPoints(): boolean {
    const requiredPoints: Record<string, number> = {
      'linear': 2,
      'angular': 3,
      'radial': 1,
      'diameter': 1,
      'arc-length': 1,
      'continuous': 2
    };

    return this.currentPoints.length >= (requiredPoints[this.activeTool!] || 2);
  }

  private createDimension(): void {
    if (!this.activeTool || !this.hasEnoughPoints()) return;

    const dimensionId = `dim_${Date.now()}`;
    const value = this.calculateDimensionValue();
    const text = this.formatDimensionText(value);
    const textPosition = this.calculateTextPosition();

    const dimension: Dimension = {
      id: dimensionId,
      type: this.activeTool as any,
      points: [...this.currentPoints],
      value,
      unit: 'ft',
      precision: this.currentStyle.precision,
      text,
      textPosition,
      layer: 'dimensions',
      style: { ...this.currentStyle },
      mesh: new THREE.Group(),
      visible: true,
      locked: false
    };

    // Create 3D representation
    this.create3DDimension(dimension);

    // Add to dimensions map
    this.dimensions.set(dimensionId, dimension);

    // Add to layer manager
    if (this.layerManager) {
      this.layerManager.addObjectToLayer(
        'dimensions',
        dimensionId,
        dimension.mesh,
        'dimension',
        { dimension }
      );
    } else {
      this.viewer.impl.scene.add(dimension.mesh);
    }

    // Update UI
    this.updateDimensionList();
    this.updateToolUI();

    // Reset for next dimension
    this.currentPoints = [];

    // Auto-deactivate for single-use tools
    if (['radial', 'diameter', 'arc-length'].includes(this.activeTool)) {
      this.deactivateTool();
    }

    this.viewer.impl.invalidate(true);
    console.log(`Created ${this.activeTool} dimension:`, dimension);
  }

  private calculateDimensionValue(): number {
    if (!this.activeTool || this.currentPoints.length < 2) return 0;

    switch (this.activeTool) {
      case 'linear':
        const p1 = this.currentPoints[0];
        const p2 = this.currentPoints[1];
        return Math.sqrt(
          Math.pow(p2.x - p1.x, 2) +
          Math.pow(p2.y - p1.y, 2) +
          Math.pow(p2.z - p1.z, 2)
        );

      case 'angular':
        // Calculate angle between three points
        if (this.currentPoints.length >= 3) {
          const [p1, vertex, p3] = this.currentPoints;
          const v1 = new THREE.Vector3(p1.x - vertex.x, p1.y - vertex.y, p1.z - vertex.z);
          const v2 = new THREE.Vector3(p3.x - vertex.x, p3.y - vertex.y, p3.z - vertex.z);
          return v1.angleTo(v2) * (180 / Math.PI); // Convert to degrees
        }
        return 0;

      case 'radial':
      case 'diameter':
        // For now, return a default radius
        return 5;

      default:
        return 0;
    }
  }

  private formatDimensionText(value: number): string {
    const precision = this.currentStyle.precision;
    const showUnits = this.currentStyle.showUnits;
    const unit = 'ft'; // Default unit

    let formattedValue = value.toFixed(precision);
    
    if (this.activeTool === 'angular') {
      formattedValue += '°';
    } else if (showUnits) {
      formattedValue += unit;
    }

    return formattedValue;
  }

  private calculateTextPosition(): DimensionPoint {
    if (this.currentPoints.length < 2) {
      return this.currentPoints[0] || { x: 0, y: 0, z: 0 };
    }

    // Calculate midpoint for text placement
    const p1 = this.currentPoints[0];
    const p2 = this.currentPoints[1];
    
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2 + this.currentStyle.textOffset,
      z: (p1.z + p2.z) / 2
    };
  }

  private create3DDimension(dimension: Dimension): void {
    const group = dimension.mesh;
    
    switch (dimension.type) {
      case 'linear':
        this.createLinearDimension(dimension, group);
        break;
      case 'angular':
        this.createAngularDimension(dimension, group);
        break;
      case 'radial':
        this.createRadialDimension(dimension, group);
        break;
    }

    // Add dimension text
    this.addDimensionText(dimension, group);
  }

  private createLinearDimension(dimension: Dimension, group: THREE.Group): void {
    if (dimension.points.length < 2) return;

    const p1 = dimension.points[0];
    const p2 = dimension.points[1];
    const style = dimension.style;

    // Create dimension line
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(p1.x, p1.y, p1.z),
      new THREE.Vector3(p2.x, p2.y, p2.z)
    ]);

    const material = new THREE.LineBasicMaterial({ 
      color: style.color,
      linewidth: style.lineWidth
    });

    const line = new THREE.Line(geometry, material);
    group.add(line);

    // Create extension lines
    this.createExtensionLines(dimension, group);

    // Create arrows
    this.createArrows(dimension, group);
  }

  private createAngularDimension(dimension: Dimension, group: THREE.Group): void {
    if (dimension.points.length < 3) return;

    const [p1, vertex, p3] = dimension.points;
    const style = dimension.style;

    // Create arc for angular dimension
    const radius = 2;
    const v1 = new THREE.Vector3(p1.x - vertex.x, p1.y - vertex.y, p1.z - vertex.z).normalize();
    const v2 = new THREE.Vector3(p3.x - vertex.x, p3.y - vertex.y, p3.z - vertex.z).normalize();
    const angle = v1.angleTo(v2);

    const curve = new THREE.EllipseCurve(
      vertex.x, vertex.y,
      radius, radius,
      0, angle,
      false,
      0
    );

    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, vertex.z)));

    const material = new THREE.LineBasicMaterial({ 
      color: style.color,
      linewidth: style.lineWidth
    });

    const arc = new THREE.Line(geometry, material);
    group.add(arc);
  }

  private createRadialDimension(dimension: Dimension, group: THREE.Group): void {
    const center = dimension.points[0];
    const style = dimension.style;
    const radius = dimension.value;

    // Create radius line
    const endPoint = {
      x: center.x + radius,
      y: center.y,
      z: center.z
    };

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(center.x, center.y, center.z),
      new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z)
    ]);

    const material = new THREE.LineBasicMaterial({ 
      color: style.color,
      linewidth: style.lineWidth
    });

    const line = new THREE.Line(geometry, material);
    group.add(line);

    // Create center mark
    const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const centerMaterial = new THREE.MeshBasicMaterial({ color: style.color });
    const centerMark = new THREE.Mesh(centerGeometry, centerMaterial);
    centerMark.position.set(center.x, center.y, center.z);
    group.add(centerMark);
  }

  private createExtensionLines(dimension: Dimension, group: THREE.Group): void {
    // Implementation for extension lines
    const style = dimension.style;
    const offset = style.extensionLineOffset;
    const overshoot = style.extensionLineOvershoot;

    // Create extension lines for linear dimensions
    // This would be more complex implementation
  }

  private createArrows(dimension: Dimension, group: THREE.Group): void {
    if (dimension.style.arrowType === 'none') return;

    const style = dimension.style;
    const arrowSize = style.arrowSize / 10; // Scale down for 3D

    dimension.points.forEach((point, index) => {
      if (index === 0 || index === dimension.points.length - 1) {
        // Create arrow at endpoints
        const arrowGeometry = new THREE.ConeGeometry(arrowSize / 2, arrowSize, 6);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: style.color });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.set(point.x, point.y, point.z);
        group.add(arrow);
      }
    });
  }

  private addDimensionText(dimension: Dimension, group: THREE.Group): void {
    // Create text sprite for dimension value
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = dimension.style.textColor;
    context.font = `${dimension.style.textSize * 2}px Arial`;
    context.textAlign = 'center';
    context.fillText(dimension.text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    const pos = dimension.textPosition;
    sprite.position.set(pos.x, pos.y, pos.z);
    sprite.scale.set(2, 0.5, 1);
    
    group.add(sprite);
  }

  private updatePreview(event: MouseEvent): void {
    // Implementation for preview during dimension creation
  }

  private updateDimensionList(): void {
    const listElement = this.dimensionPanel?.container.querySelector('#dimension-list');
    if (!listElement) return;

    if (this.dimensions.size === 0) {
      listElement.innerHTML = '<p class="no-dimensions">No dimensions created yet</p>';
      return;
    }

    const dimensionsHtml = Array.from(this.dimensions.values()).map(dim => `
      <div class="dimension-item" data-id="${dim.id}">
        <div class="dimension-info">
          <span class="dimension-type">${dim.type.toUpperCase()}</span>
          <span class="dimension-value">${dim.text}</span>
        </div>
        <div class="dimension-actions">
          <button class="btn btn-small" onclick="dimensionTools.focusDimension('${dim.id}')" title="Focus">
            🎯
          </button>
          <button class="btn btn-small" onclick="dimensionTools.toggleDimensionVisibility('${dim.id}')" title="Toggle Visibility">
            ${dim.visible ? '👁️' : '🙈'}
          </button>
          <button class="btn btn-small btn-danger" onclick="dimensionTools.deleteDimension('${dim.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    listElement.innerHTML = dimensionsHtml;

    // Make dimension tools globally accessible for button callbacks
    (window as any).dimensionTools = this;
  }

  // Public API methods for UI callbacks
  public focusDimension(dimensionId: string): void {
    const dimension = this.dimensions.get(dimensionId);
    if (dimension && dimension.points.length > 0) {
      const center = dimension.textPosition;
      this.viewer.navigation.setRequestTransitionWithUp(
        true,
        new THREE.Vector3(center.x, center.y, center.z),
        new THREE.Vector3(center.x + 10, center.y + 10, center.z + 10),
        new THREE.Vector3(0, 1, 0)
      );
    }
  }

  public toggleDimensionVisibility(dimensionId: string): void {
    const dimension = this.dimensions.get(dimensionId);
    if (dimension) {
      dimension.visible = !dimension.visible;
      dimension.mesh.visible = dimension.visible;
      this.viewer.impl.invalidate(true);
      this.updateDimensionList();
    }
  }

  public deleteDimension(dimensionId: string): void {
    const dimension = this.dimensions.get(dimensionId);
    if (dimension) {
      // Remove from scene
      if (this.layerManager) {
        this.layerManager.removeObjectFromLayer(dimensionId);
      } else {
        this.viewer.impl.scene.remove(dimension.mesh);
      }

      // Dispose geometry and materials
      dimension.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
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

      this.dimensions.delete(dimensionId);
      this.viewer.impl.invalidate(true);
      this.updateDimensionList();
      this.updateToolUI();
    }
  }

  private selectAllDimensions(): void {
    const dimensionIds = Array.from(this.dimensions.keys());
    // In a real implementation, this would integrate with Forge's selection system
    console.log('Selected all dimensions:', dimensionIds);
  }

  private hideAllDimensions(): void {
    this.dimensions.forEach(dimension => {
      dimension.visible = false;
      dimension.mesh.visible = false;
    });
    this.viewer.impl.invalidate(true);
    this.updateDimensionList();
  }

  private deleteAllDimensions(): void {
    if (confirm('Delete all dimensions? This cannot be undone.')) {
      this.clearAllDimensions();
    }
  }

  private clearAllDimensions(): void {
    this.dimensions.forEach((dimension, id) => {
      this.deleteDimension(id);
    });
  }

  private exportDimensions(): void {
    const exportData = {
      dimensions: Array.from(this.dimensions.values()).map(dim => ({
        id: dim.id,
        type: dim.type,
        points: dim.points,
        value: dim.value,
        text: dim.text,
        style: dim.style,
        visible: dim.visible
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalCount: this.dimensions.size
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibelux-dimensions.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private importDimensions(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            this.processImportedDimensions(data);
          } catch (error) {
            console.error('Error importing dimensions:', error);
            alert('Error importing dimensions file');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  private processImportedDimensions(data: any): void {
    if (data.dimensions && Array.isArray(data.dimensions)) {
      data.dimensions.forEach((dimData: any) => {
        // Recreate dimension from imported data
        const dimension: Dimension = {
          ...dimData,
          mesh: new THREE.Group()
        };
        
        this.create3DDimension(dimension);
        this.dimensions.set(dimension.id, dimension);
        
        if (this.layerManager) {
          this.layerManager.addObjectToLayer(
            'dimensions',
            dimension.id,
            dimension.mesh,
            'dimension',
            { dimension }
          );
        } else {
          this.viewer.impl.scene.add(dimension.mesh);
        }
      });
      
      this.updateDimensionList();
      this.updateToolUI();
      this.viewer.impl.invalidate(true);
      
      console.log(`Imported ${data.dimensions.length} dimensions`);
    }
  }

  private toggleDimensionPanel(): void {
    if (this.dimensionPanel) {
      this.dimensionPanel.setVisible(!this.dimensionPanel.isVisible());
    }
  }

  // Public API method for keyboard shortcuts extension
  public activateLinearDimension(): void {
    this.activateTool('linear');
  }

  public activateAngularDimension(): void {
    this.activateTool('angular');
  }

  public getDimensions(): Dimension[] {
    return Array.from(this.dimensions.values());
  }

  public getDimensionCount(): number {
    return this.dimensions.size;
  }
}

export default DimensionToolsExtension;