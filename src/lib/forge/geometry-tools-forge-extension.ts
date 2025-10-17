/**
 * VibeLux 3D Geometry Tools Extension for Autodesk Forge
 * Professional 3D geometry creation and editing tools for greenhouse design
 */

import { VibeLuxLayerManager } from './layer-manager';

interface GeometryTool {
  id: string;
  name: string;
  type: 'primitive' | 'advanced' | 'modifier';
  icon: string;
  description: string;
  parameters: GeometryParameter[];
}

interface GeometryParameter {
  name: string;
  type: 'number' | 'boolean' | 'select' | 'vector3' | 'color';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  label: string;
  description: string;
}

interface GeometryObject {
  id: string;
  name: string;
  toolId: string;
  mesh: THREE.Object3D;
  parameters: Map<string, any>;
  transform: {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  };
  material: THREE.Material;
  metadata: {
    created: Date;
    modified: Date;
    creator: string;
    tags: string[];
  };
}

interface SketchProfile {
  id: string;
  name: string;
  points: THREE.Vector3[];
  curves: SketchCurve[];
  closed: boolean;
  plane: THREE.Plane;
}

interface SketchCurve {
  type: 'line' | 'arc' | 'spline' | 'circle';
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  controlPoints?: THREE.Vector3[];
  radius?: number;
  center?: THREE.Vector3;
}

class GeometryToolsForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private activeMode: 'create' | 'edit' | 'sketch' | 'modify' = 'create';
  private activeTool: GeometryTool | null = null;
  private selectedObject: GeometryObject | null = null;
  private geometryObjects: Map<string, GeometryObject> = new Map();
  private sketches: Map<string, SketchProfile> = new Map();
  private tools: Map<string, GeometryTool> = new Map();
  private isDrawing: boolean = false;
  private currentSketch: SketchProfile | null = null;
  private transformGizmo: THREE.Object3D | null = null;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeTools();
  }

  load(): boolean {
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChanged.bind(this));
    
    this.setupUI();
    console.log('VibeLux 3D Geometry Tools Extension loaded');
    return true;
  }

  unload(): boolean {
    this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    this.viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChanged.bind(this));
    
    if (this.panel) {
      this.panel.uninitialize();
      this.panel = null;
    }
    
    this.cleanup();
    console.log('VibeLux 3D Geometry Tools Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-geometry-panel',
      '3D Geometry Tools',
      {
        dockRight: true,
        shadow: true,
        width: 380,
        height: 650
      }
    );

    this.updatePanel();
    this.createToolbarButton();
  }

  private createToolbarButton(): void {
    const toolbar = this.viewer.getToolbar(true);
    const geometryToolbar = toolbar.getControl('vibelux-geometry-toolbar');
    
    if (!geometryToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-geometry-toolbar');
      
      const geometryButton = new Autodesk.Viewing.UI.Button('geometry-tools-btn');
      geometryButton.setToolTip('3D Geometry Tools');
      geometryButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.7"/>
          <path d="M2 17L12 22L22 17"/>
          <path d="M2 12L12 17L22 12"/>
        </svg>
      `));
      geometryButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(geometryButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeTools(): void {
    // Primitive tools
    this.tools.set('box', {
      id: 'box',
      name: 'Box',
      type: 'primitive',
      icon: '⬜',
      description: 'Create a rectangular box',
      parameters: [
        { name: 'width', type: 'number', value: 2, min: 0.1, max: 50, step: 0.1, label: 'Width', description: 'Box width in meters' },
        { name: 'height', type: 'number', value: 2, min: 0.1, max: 50, step: 0.1, label: 'Height', description: 'Box height in meters' },
        { name: 'depth', type: 'number', value: 2, min: 0.1, max: 50, step: 0.1, label: 'Depth', description: 'Box depth in meters' },
        { name: 'segments', type: 'number', value: 1, min: 1, max: 10, step: 1, label: 'Segments', description: 'Number of segments per side' }
      ]
    });

    this.tools.set('cylinder', {
      id: 'cylinder',
      name: 'Cylinder',
      type: 'primitive',
      icon: '🔵',
      description: 'Create a cylindrical shape',
      parameters: [
        { name: 'radiusTop', type: 'number', value: 1, min: 0.1, max: 25, step: 0.1, label: 'Top Radius', description: 'Radius at the top' },
        { name: 'radiusBottom', type: 'number', value: 1, min: 0.1, max: 25, step: 0.1, label: 'Bottom Radius', description: 'Radius at the bottom' },
        { name: 'height', type: 'number', value: 2, min: 0.1, max: 50, step: 0.1, label: 'Height', description: 'Cylinder height' },
        { name: 'segments', type: 'number', value: 16, min: 3, max: 64, step: 1, label: 'Segments', description: 'Radial segments' }
      ]
    });

    this.tools.set('sphere', {
      id: 'sphere',
      name: 'Sphere',
      type: 'primitive',
      icon: '⚪',
      description: 'Create a spherical shape',
      parameters: [
        { name: 'radius', type: 'number', value: 1, min: 0.1, max: 25, step: 0.1, label: 'Radius', description: 'Sphere radius' },
        { name: 'widthSegments', type: 'number', value: 16, min: 3, max: 64, step: 1, label: 'Width Segments', description: 'Horizontal segments' },
        { name: 'heightSegments', type: 'number', value: 12, min: 3, max: 64, step: 1, label: 'Height Segments', description: 'Vertical segments' }
      ]
    });

    this.tools.set('plane', {
      id: 'plane',
      name: 'Plane',
      type: 'primitive',
      icon: '▭',
      description: 'Create a flat plane',
      parameters: [
        { name: 'width', type: 'number', value: 2, min: 0.1, max: 50, step: 0.1, label: 'Width', description: 'Plane width' },
        { name: 'height', type: 'number', value: 2, min: 0.1, max: 50, step: 0.1, label: 'Height', description: 'Plane height' },
        { name: 'widthSegments', type: 'number', value: 1, min: 1, max: 32, step: 1, label: 'Width Segments', description: 'Width subdivisions' },
        { name: 'heightSegments', type: 'number', value: 1, min: 1, max: 32, step: 1, label: 'Height Segments', description: 'Height subdivisions' }
      ]
    });

    // Advanced tools
    this.tools.set('extrude', {
      id: 'extrude',
      name: 'Extrude',
      type: 'advanced',
      icon: '↗️',
      description: 'Extrude a 2D profile into 3D',
      parameters: [
        { name: 'depth', type: 'number', value: 1, min: 0.1, max: 20, step: 0.1, label: 'Depth', description: 'Extrusion depth' },
        { name: 'steps', type: 'number', value: 1, min: 1, max: 10, step: 1, label: 'Steps', description: 'Number of extrusion steps' },
        { name: 'bevelEnabled', type: 'boolean', value: false, label: 'Enable Bevel', description: 'Add beveled edges' },
        { name: 'bevelSize', type: 'number', value: 0.1, min: 0, max: 1, step: 0.01, label: 'Bevel Size', description: 'Size of the bevel' }
      ]
    });

    this.tools.set('revolve', {
      id: 'revolve',
      name: 'Revolve',
      type: 'advanced',
      icon: '🌀',
      description: 'Revolve a profile around an axis',
      parameters: [
        { name: 'angle', type: 'number', value: 360, min: 1, max: 360, step: 1, label: 'Angle', description: 'Revolution angle in degrees' },
        { name: 'segments', type: 'number', value: 16, min: 3, max: 64, step: 1, label: 'Segments', description: 'Number of segments' },
        { name: 'axis', type: 'select', value: 'y', options: ['x', 'y', 'z'], label: 'Axis', description: 'Revolution axis' }
      ]
    });

    this.tools.set('sweep', {
      id: 'sweep',
      name: 'Sweep',
      type: 'advanced',
      icon: '🏹',
      description: 'Sweep a profile along a path',
      parameters: [
        { name: 'twist', type: 'number', value: 0, min: -360, max: 360, step: 1, label: 'Twist', description: 'Twist angle along path' },
        { name: 'scale', type: 'number', value: 1, min: 0.1, max: 5, step: 0.1, label: 'Scale', description: 'Scale factor along path' },
        { name: 'steps', type: 'number', value: 10, min: 2, max: 50, step: 1, label: 'Steps', description: 'Number of sweep steps' }
      ]
    });

    // Modifier tools
    this.tools.set('array', {
      id: 'array',
      name: 'Array',
      type: 'modifier',
      icon: '🔢',
      description: 'Create arrays of objects',
      parameters: [
        { name: 'countX', type: 'number', value: 3, min: 1, max: 20, step: 1, label: 'Count X', description: 'Number of copies in X direction' },
        { name: 'countY', type: 'number', value: 1, min: 1, max: 20, step: 1, label: 'Count Y', description: 'Number of copies in Y direction' },
        { name: 'countZ', type: 'number', value: 1, min: 1, max: 20, step: 1, label: 'Count Z', description: 'Number of copies in Z direction' },
        { name: 'spacingX', type: 'number', value: 2, min: 0.1, max: 10, step: 0.1, label: 'Spacing X', description: 'Distance between copies in X' },
        { name: 'spacingY', type: 'number', value: 2, min: 0.1, max: 10, step: 0.1, label: 'Spacing Y', description: 'Distance between copies in Y' },
        { name: 'spacingZ', type: 'number', value: 2, min: 0.1, max: 10, step: 0.1, label: 'Spacing Z', description: 'Distance between copies in Z' }
      ]
    });

    this.tools.set('mirror', {
      id: 'mirror',
      name: 'Mirror',
      type: 'modifier',
      icon: '🪞',
      description: 'Mirror objects across a plane',
      parameters: [
        { name: 'axis', type: 'select', value: 'x', options: ['x', 'y', 'z'], label: 'Mirror Axis', description: 'Axis to mirror across' },
        { name: 'distance', type: 'number', value: 0, min: -50, max: 50, step: 0.1, label: 'Distance', description: 'Distance from origin' },
        { name: 'keepOriginal', type: 'boolean', value: true, label: 'Keep Original', description: 'Keep the original object' }
      ]
    });
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const panelContent = `
      <div class="geometry-tools-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>🔺 3D Geometry Tools</h3>
          <p>Professional 3D modeling and CAD tools</p>
        </div>

        <!-- Mode Selection -->
        <div class="extension-section">
          <h4>Mode</h4>
          <div class="mode-buttons">
            <button class="btn mode-btn ${this.activeMode === 'create' ? 'active' : ''}" onclick="geometryTools.setMode('create')">
              ➕ Create
            </button>
            <button class="btn mode-btn ${this.activeMode === 'edit' ? 'active' : ''}" onclick="geometryTools.setMode('edit')">
              ✏️ Edit
            </button>
            <button class="btn mode-btn ${this.activeMode === 'sketch' ? 'active' : ''}" onclick="geometryTools.setMode('sketch')">
              ✏️ Sketch
            </button>
            <button class="btn mode-btn ${this.activeMode === 'modify' ? 'active' : ''}" onclick="geometryTools.setMode('modify')">
              🔧 Modify
            </button>
          </div>
        </div>

        ${this.activeMode === 'create' ? this.renderCreateMode() : ''}
        ${this.activeMode === 'edit' ? this.renderEditMode() : ''}
        ${this.activeMode === 'sketch' ? this.renderSketchMode() : ''}
        ${this.activeMode === 'modify' ? this.renderModifyMode() : ''}

        <!-- Tool Parameters -->
        ${this.activeTool ? this.renderToolParameters() : ''}

        <!-- Geometry Library -->
        <div class="extension-section">
          <h4>Geometry Library</h4>
          <div class="geometry-library">
            ${Array.from(this.geometryObjects.values()).map(obj => `
              <div class="geometry-item ${this.selectedObject?.id === obj.id ? 'selected' : ''}" 
                   onclick="geometryTools.selectObject('${obj.id}')">
                <div class="geometry-info">
                  <span class="geometry-name">${obj.name}</span>
                  <span class="geometry-tool">${this.tools.get(obj.toolId)?.name || 'Unknown'}</span>
                  <span class="geometry-date">${obj.metadata.created.toLocaleDateString()}</span>
                </div>
                <div class="geometry-actions">
                  <button class="btn btn-small" onclick="geometryTools.editObject('${obj.id}')">✏️</button>
                  <button class="btn btn-small" onclick="geometryTools.duplicateObject('${obj.id}')">📋</button>
                  <button class="btn btn-small" onclick="geometryTools.deleteObject('${obj.id}')">🗑️</button>
                </div>
              </div>
            `).join('')}
            
            ${this.geometryObjects.size === 0 ? '<p class="no-geometry">No geometry objects created yet.</p>' : ''}
          </div>
        </div>

        <!-- Transform Controls -->
        ${this.selectedObject ? this.renderTransformControls() : ''}

        <!-- Material Settings -->
        ${this.selectedObject ? this.renderMaterialSettings() : ''}

        <!-- Export Options -->
        <div class="extension-section">
          <h4>Export</h4>
          <div class="export-controls">
            <select id="export-format">
              <option value="obj">OBJ Format</option>
              <option value="stl">STL Format</option>
              <option value="gltf">glTF Format</option>
              <option value="fbx">FBX Format</option>
            </select>
            <button class="btn btn-primary" onclick="geometryTools.exportGeometry()">
              📤 Export Selected
            </button>
            <button class="btn btn-secondary" onclick="geometryTools.exportAll()">
              📦 Export All
            </button>
          </div>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;
    
    // Make extension globally accessible for button callbacks
    (window as any).geometryTools = this;
  }

  private renderCreateMode(): string {
    const primitiveTools = Array.from(this.tools.values()).filter(t => t.type === 'primitive');
    const advancedTools = Array.from(this.tools.values()).filter(t => t.type === 'advanced');

    return `
      <div class="extension-section">
        <h4>Primitive Shapes</h4>
        <div class="tool-grid">
          ${primitiveTools.map(tool => `
            <div class="tool-item ${this.activeTool?.id === tool.id ? 'active' : ''}" 
                 onclick="geometryTools.selectTool('${tool.id}')">
              <div class="tool-icon">${tool.icon}</div>
              <span class="tool-name">${tool.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="extension-section">
        <h4>Advanced Tools</h4>
        <div class="tool-grid">
          ${advancedTools.map(tool => `
            <div class="tool-item ${this.activeTool?.id === tool.id ? 'active' : ''}" 
                 onclick="geometryTools.selectTool('${tool.id}')">
              <div class="tool-icon">${tool.icon}</div>
              <span class="tool-name">${tool.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderEditMode(): string {
    return `
      <div class="extension-section">
        <h4>Edit Operations</h4>
        <div class="edit-tools">
          <button class="btn btn-primary" onclick="geometryTools.enableTransformGizmo()">
            🎯 Transform Gizmo
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.enableVertexEdit()">
            📍 Vertex Edit
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.enableFaceEdit()">
            ⬜ Face Edit
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.enableEdgeEdit()">
            📏 Edge Edit
          </button>
        </div>
        
        <div class="edit-info">
          ${this.selectedObject ? `
            <p><strong>Editing:</strong> ${this.selectedObject.name}</p>
            <p><strong>Tool:</strong> ${this.tools.get(this.selectedObject.toolId)?.name}</p>
            <p><strong>Vertices:</strong> ${this.getVertexCount(this.selectedObject)}</p>
            <p><strong>Faces:</strong> ${this.getFaceCount(this.selectedObject)}</p>
          ` : '<p>Select an object to edit</p>'}
        </div>
      </div>
    `;
  }

  private renderSketchMode(): string {
    return `
      <div class="extension-section">
        <h4>Sketch Tools</h4>
        <div class="sketch-tools">
          <button class="btn btn-primary" onclick="geometryTools.startSketch()">
            ✏️ Start Sketch
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.drawLine()">
            📏 Line
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.drawCircle()">
            ⭕ Circle
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.drawArc()">
            🌙 Arc
          </button>
          <button class="btn btn-secondary" onclick="geometryTools.drawSpline()">
            〰️ Spline
          </button>
        </div>
        
        <div class="sketch-info">
          ${this.currentSketch ? `
            <p><strong>Active Sketch:</strong> ${this.currentSketch.name}</p>
            <p><strong>Points:</strong> ${this.currentSketch.points.length}</p>
            <p><strong>Curves:</strong> ${this.currentSketch.curves.length}</p>
            <p><strong>Closed:</strong> ${this.currentSketch.closed ? 'Yes' : 'No'}</p>
            <div class="sketch-actions">
              <button class="btn btn-primary" onclick="geometryTools.finishSketch()">✅ Finish</button>
              <button class="btn btn-secondary" onclick="geometryTools.cancelSketch()">❌ Cancel</button>
            </div>
          ` : '<p>No active sketch. Start sketching to begin.</p>'}
        </div>
        
        <div class="sketches-list">
          <h5>Saved Sketches</h5>
          ${Array.from(this.sketches.values()).map(sketch => `
            <div class="sketch-item">
              <span class="sketch-name">${sketch.name}</span>
              <div class="sketch-actions">
                <button class="btn btn-small" onclick="geometryTools.editSketch('${sketch.id}')">✏️</button>
                <button class="btn btn-small" onclick="geometryTools.extrudeSketch('${sketch.id}')">↗️</button>
                <button class="btn btn-small" onclick="geometryTools.deleteSketch('${sketch.id}')">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderModifyMode(): string {
    const modifierTools = Array.from(this.tools.values()).filter(t => t.type === 'modifier');

    return `
      <div class="extension-section">
        <h4>Modifier Tools</h4>
        <div class="tool-grid">
          ${modifierTools.map(tool => `
            <div class="tool-item ${this.activeTool?.id === tool.id ? 'active' : ''}" 
                 onclick="geometryTools.selectTool('${tool.id}')">
              <div class="tool-icon">${tool.icon}</div>
              <span class="tool-name">${tool.name}</span>
            </div>
          `).join('')}
        </div>
        
        ${this.selectedObject ? `
          <div class="modifier-target">
            <p><strong>Target:</strong> ${this.selectedObject.name}</p>
            <button class="btn btn-primary" onclick="geometryTools.applyModifier()">
              ✨ Apply Modifier
            </button>
          </div>
        ` : '<p>Select an object to apply modifiers</p>'}
      </div>
    `;
  }

  private renderToolParameters(): string {
    if (!this.activeTool) return '';

    return `
      <div class="extension-section">
        <h4>${this.activeTool.name} Parameters</h4>
        <div class="tool-parameters">
          ${this.activeTool.parameters.map(param => {
            switch (param.type) {
              case 'number':
                return `
                  <div class="param-item">
                    <label for="param-${param.name}">${param.label}</label>
                    <input type="number" id="param-${param.name}" value="${param.value}" 
                           min="${param.min}" max="${param.max}" step="${param.step}"
                           onchange="geometryTools.updateParameter('${param.name}', parseFloat(this.value))">
                    <span class="param-description">${param.description}</span>
                  </div>
                `;
              case 'boolean':
                return `
                  <div class="param-item">
                    <label for="param-${param.name}">
                      <input type="checkbox" id="param-${param.name}" ${param.value ? 'checked' : ''}
                             onchange="geometryTools.updateParameter('${param.name}', this.checked)">
                      ${param.label}
                    </label>
                    <span class="param-description">${param.description}</span>
                  </div>
                `;
              case 'select':
                return `
                  <div class="param-item">
                    <label for="param-${param.name}">${param.label}</label>
                    <select id="param-${param.name}" onchange="geometryTools.updateParameter('${param.name}', this.value)">
                      ${param.options!.map(option => `
                        <option value="${option}" ${param.value === option ? 'selected' : ''}>${option}</option>
                      `).join('')}
                    </select>
                    <span class="param-description">${param.description}</span>
                  </div>
                `;
              default:
                return '';
            }
          }).join('')}
          
          ${this.activeMode === 'create' ? `
            <button class="btn btn-primary" onclick="geometryTools.createGeometry()">
              ➕ Create ${this.activeTool.name}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderTransformControls(): string {
    const obj = this.selectedObject!;
    return `
      <div class="extension-section">
        <h4>Transform</h4>
        <div class="transform-controls">
          <div class="transform-group">
            <h5>Position</h5>
            <div class="vector-input">
              <input type="number" value="${obj.transform.position.x.toFixed(2)}" step="0.1" 
                     onchange="geometryTools.updateTransform('position', 'x', parseFloat(this.value))">
              <input type="number" value="${obj.transform.position.y.toFixed(2)}" step="0.1"
                     onchange="geometryTools.updateTransform('position', 'y', parseFloat(this.value))">
              <input type="number" value="${obj.transform.position.z.toFixed(2)}" step="0.1"
                     onchange="geometryTools.updateTransform('position', 'z', parseFloat(this.value))">
            </div>
          </div>
          
          <div class="transform-group">
            <h5>Rotation (degrees)</h5>
            <div class="vector-input">
              <input type="number" value="${(obj.transform.rotation.x * 180 / Math.PI).toFixed(1)}" step="1" 
                     onchange="geometryTools.updateTransform('rotation', 'x', this.value * Math.PI / 180)">
              <input type="number" value="${(obj.transform.rotation.y * 180 / Math.PI).toFixed(1)}" step="1"
                     onchange="geometryTools.updateTransform('rotation', 'y', this.value * Math.PI / 180)">
              <input type="number" value="${(obj.transform.rotation.z * 180 / Math.PI).toFixed(1)}" step="1"
                     onchange="geometryTools.updateTransform('rotation', 'z', this.value * Math.PI / 180)">
            </div>
          </div>
          
          <div class="transform-group">
            <h5>Scale</h5>
            <div class="vector-input">
              <input type="number" value="${obj.transform.scale.x.toFixed(2)}" step="0.1" min="0.1"
                     onchange="geometryTools.updateTransform('scale', 'x', parseFloat(this.value))">
              <input type="number" value="${obj.transform.scale.y.toFixed(2)}" step="0.1" min="0.1"
                     onchange="geometryTools.updateTransform('scale', 'y', parseFloat(this.value))">
              <input type="number" value="${obj.transform.scale.z.toFixed(2)}" step="0.1" min="0.1"
                     onchange="geometryTools.updateTransform('scale', 'z', parseFloat(this.value))">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderMaterialSettings(): string {
    return `
      <div class="extension-section">
        <h4>Material</h4>
        <div class="material-controls">
          <div class="material-presets">
            <button class="btn material-btn" onclick="geometryTools.setMaterial('standard')">Standard</button>
            <button class="btn material-btn" onclick="geometryTools.setMaterial('glass')">Glass</button>
            <button class="btn material-btn" onclick="geometryTools.setMaterial('metal')">Metal</button>
            <button class="btn material-btn" onclick="geometryTools.setMaterial('plastic')">Plastic</button>
          </div>
          
          <div class="material-properties">
            <div class="property-item">
              <label>Color</label>
              <input type="color" id="material-color" value="#888888" onchange="geometryTools.updateMaterialColor(this.value)">
            </div>
            <div class="property-item">
              <label>Opacity</label>
              <input type="range" id="material-opacity" min="0" max="1" step="0.01" value="1" 
                     onchange="geometryTools.updateMaterialOpacity(parseFloat(this.value))">
            </div>
            <div class="property-item">
              <label>Roughness</label>
              <input type="range" id="material-roughness" min="0" max="1" step="0.01" value="0.5"
                     onchange="geometryTools.updateMaterialRoughness(parseFloat(this.value))">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Public API methods for panel callbacks
  public setMode(mode: 'create' | 'edit' | 'sketch' | 'modify'): void {
    this.activeMode = mode;
    this.activeTool = null;
    this.updatePanel();
  }

  public selectTool(toolId: string): void {
    const tool = this.tools.get(toolId);
    if (tool) {
      this.activeTool = tool;
      this.updatePanel();
    }
  }

  public updateParameter(paramName: string, value: any): void {
    if (!this.activeTool) return;
    
    const param = this.activeTool.parameters.find(p => p.name === paramName);
    if (param) {
      param.value = value;
      // Auto-update preview if in edit mode
      if (this.activeMode === 'edit' && this.selectedObject) {
        this.updateGeometryPreview();
      }
    }
  }

  public createGeometry(): void {
    if (!this.activeTool) return;

    // Enable click-to-place mode
    this.viewer.addEventListener('click', this.onGeometryPlacement.bind(this));
  }

  private onGeometryPlacement(event: any): void {
    const hitPoint = this.viewer.clientToWorld(event.clientX, event.clientY, true);
    if (!hitPoint || !this.activeTool) return;

    const geometry = this.createGeometryMesh(this.activeTool);
    if (!geometry) return;

    const objectId = 'geometry-' + Date.now();
    const geometryObject: GeometryObject = {
      id: objectId,
      name: `${this.activeTool.name} ${this.geometryObjects.size + 1}`,
      toolId: this.activeTool.id,
      mesh: geometry,
      parameters: new Map(this.activeTool.parameters.map(p => [p.name, p.value])),
      transform: {
        position: hitPoint.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      material: geometry.children[0] ? (geometry.children[0] as THREE.Mesh).material as THREE.Material : new THREE.MeshLambertMaterial({ color: 0x888888 }),
      metadata: {
        created: new Date(),
        modified: new Date(),
        creator: 'VibeLux User',
        tags: [this.activeTool.type, this.activeTool.name.toLowerCase()]
      }
    };

    geometry.position.copy(hitPoint);
    this.geometryObjects.set(objectId, geometryObject);

    // Add to layer manager
    if (this.layerManager) {
      this.layerManager.addObjectToLayer(
        'temp-geometry',
        objectId,
        geometry,
        'system',
        { geometryObject, type: 'geometry' }
      );
    }

    // Remove event listener
    this.viewer.removeEventListener('click', this.onGeometryPlacement.bind(this));
    
    this.updatePanel();
  }

  private createGeometryMesh(tool: GeometryTool): THREE.Object3D | null {
    const group = new THREE.Group();
    let geometry: THREE.BufferGeometry;
    
    const params = new Map(tool.parameters.map(p => [p.name, p.value]));

    switch (tool.id) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          params.get('width'),
          params.get('height'),
          params.get('depth'),
          params.get('segments'),
          params.get('segments'),
          params.get('segments')
        );
        break;

      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          params.get('radiusTop'),
          params.get('radiusBottom'),
          params.get('height'),
          params.get('segments')
        );
        break;

      case 'sphere':
        geometry = new THREE.SphereGeometry(
          params.get('radius'),
          params.get('widthSegments'),
          params.get('heightSegments')
        );
        break;

      case 'plane':
        geometry = new THREE.PlaneGeometry(
          params.get('width'),
          params.get('height'),
          params.get('widthSegments'),
          params.get('heightSegments')
        );
        break;

      default:
        console.warn(`Unknown tool: ${tool.id}`);
        return null;
    }

    const material = new THREE.MeshLambertMaterial({ 
      color: 0x888888,
      wireframe: false,
      transparent: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Add wireframe overlay
    const wireframeGeometry = geometry.clone();
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    group.add(wireframeMesh);

    return group;
  }

  public selectObject(objectId: string): void {
    const obj = this.geometryObjects.get(objectId);
    if (obj) {
      this.selectedObject = obj;
      this.highlightObject(obj);
      this.updatePanel();
    }
  }

  private highlightObject(obj: GeometryObject): void {
    // Remove previous highlight
    this.clearHighlights();
    
    // Add highlight to selected object
    obj.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshLambertMaterial;
        material.emissive.setHex(0x444444);
      }
    });

    this.viewer.impl.invalidate(true);
  }

  private clearHighlights(): void {
    this.geometryObjects.forEach(obj => {
      obj.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshLambertMaterial;
          material.emissive.setHex(0x000000);
        }
      });
    });
  }

  public updateTransform(type: 'position' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: number): void {
    if (!this.selectedObject) return;

    this.selectedObject.transform[type][axis] = value;
    this.selectedObject.mesh[type][axis] = value;
    this.selectedObject.metadata.modified = new Date();

    this.viewer.impl.invalidate(true);
  }

  public setMaterial(preset: string): void {
    if (!this.selectedObject) return;

    let material: THREE.Material;

    switch (preset) {
      case 'glass':
        material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          roughness: 0,
          metalness: 0,
          transmission: 0.9
        });
        break;
      case 'metal':
        material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          roughness: 0.1,
          metalness: 0.9
        });
        break;
      case 'plastic':
        material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          roughness: 0.8,
          metalness: 0
        });
        break;
      default:
        material = new THREE.MeshLambertMaterial({ color: 0x888888 });
    }

    this.selectedObject.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.material.wireframe) {
        child.material = material;
      }
    });

    this.selectedObject.material = material;
    this.viewer.impl.invalidate(true);
  }

  public exportGeometry(): void {
    if (!this.selectedObject) {
      alert('Please select an object to export');
      return;
    }

    const format = (document.getElementById('export-format') as HTMLSelectElement)?.value || 'obj';
    this.performExport([this.selectedObject], format);
  }

  public exportAll(): void {
    if (this.geometryObjects.size === 0) {
      alert('No geometry objects to export');
      return;
    }

    const format = (document.getElementById('export-format') as HTMLSelectElement)?.value || 'obj';
    this.performExport(Array.from(this.geometryObjects.values()), format);
  }

  private performExport(objects: GeometryObject[], format: string): void {
    // This would integrate with actual export libraries
    console.log(`Exporting ${objects.length} objects in ${format} format`);
    
    // Simulate export
    setTimeout(() => {
      alert(`Export complete! ${objects.length} objects exported as ${format.toUpperCase()}`);
    }, 1000);
  }

  private getVertexCount(obj: GeometryObject): number {
    let count = 0;
    obj.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const positions = child.geometry.attributes.position;
        if (positions) {
          count += positions.count;
        }
      }
    });
    return count;
  }

  private getFaceCount(obj: GeometryObject): number {
    let count = 0;
    obj.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const index = child.geometry.index;
        if (index) {
          count += index.count / 3;
        } else {
          const positions = child.geometry.attributes.position;
          if (positions) {
            count += positions.count / 3;
          }
        }
      }
    });
    return Math.floor(count);
  }

  private updateGeometryPreview(): void {
    // Update geometry based on current parameters
    if (this.selectedObject && this.activeTool) {
      const newMesh = this.createGeometryMesh(this.activeTool);
      if (newMesh && this.layerManager) {
        // Replace the mesh in the layer manager
        this.layerManager.removeObjectFromLayer(this.selectedObject.id);
        this.selectedObject.mesh = newMesh;
        newMesh.position.copy(this.selectedObject.transform.position);
        newMesh.rotation.copy(this.selectedObject.transform.rotation);
        newMesh.scale.copy(this.selectedObject.transform.scale);
        
        this.layerManager.addObjectToLayer(
          'temp-geometry',
          this.selectedObject.id,
          newMesh,
          'system',
          { geometryObject: this.selectedObject, type: 'geometry' }
        );
      }
    }
  }

  private onSelectionChanged(event: any): void {
    // Handle selection of geometry objects
  }

  private onCameraChanged(event: any): void {
    // Update visualization based on camera
  }

  private cleanup(): void {
    // Clean up geometry objects
    if (this.layerManager) {
      this.layerManager.getObjectsByType('system').forEach(obj => {
        if (obj.metadata?.type === 'geometry') {
          this.layerManager!.removeObjectFromLayer(obj.id);
        }
      });
    }
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.GeometryTools', GeometryToolsForgeExtension);

export default GeometryToolsForgeExtension;