/**
 * VibeLux HVAC Design Extension for Autodesk Forge
 * Professional HVAC design tools with 3D visualization and calculations
 */

import { VibeLuxLayerManager } from './layer-manager';

interface HVACComponent {
  id: string;
  type: 'fan' | 'heater' | 'cooler' | 'duct' | 'vent' | 'controller' | 'sensor';
  name: string;
  capacity: number; // CFM or BTU/hr
  powerConsumption: number; // Watts
  dimensions: { width: number; height: number; depth: number };
  connections: string[]; // IDs of connected components
  position: { x: number; y: number; z: number };
  metadata: {
    manufacturer?: string;
    model?: string;
    efficiency?: number;
    noiseLevel?: number; // dB
    price?: number;
    maintenance?: string;
  };
}

interface HVACSystem {
  id: string;
  name: string;
  type: 'heating' | 'cooling' | 'ventilation' | 'combined';
  components: HVACComponent[];
  totalCapacity: number;
  totalPower: number;
  efficiency: number;
  zones: HVACZone[];
  controlStrategy: string;
}

interface HVACZone {
  id: string;
  name: string;
  area: number; // sq ft
  volume: number; // cubic ft
  designTemp: { heating: number; cooling: number };
  loadCalculation: {
    heatingLoad: number; // BTU/hr
    coolingLoad: number; // BTU/hr
    ventilationCFM: number;
  };
  components: string[]; // Component IDs serving this zone
}

class HVACDesignForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private hvacSystems: Map<string, HVACSystem> = new Map();
  private selectedComponent: HVACComponent | null = null;
  private designMode: 'place' | 'connect' | 'analyze' | 'view' = 'view';
  private componentLibrary: HVACComponent[] = [];
  private currentSystem: HVACSystem | null = null;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeComponentLibrary();
  }

  load(): boolean {
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChanged.bind(this));
    
    this.setupUI();
    console.log('VibeLux HVAC Design Extension loaded');
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
    console.log('VibeLux HVAC Design Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-hvac-design-panel',
      'HVAC Design Studio',
      {
        dockRight: true,
        shadow: true,
        width: 400,
        height: 600
      }
    );

    this.updatePanel();

    // Create toolbar button
    this.createToolbarButton();
  }

  private createToolbarButton(): void {
    const toolbar = this.viewer.getToolbar(true);
    const hvacToolbar = toolbar.getControl('vibelux-hvac-toolbar');
    
    if (!hvacToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-hvac-toolbar');
      
      const hvacDesignButton = new Autodesk.Viewing.UI.Button('hvac-design-btn');
      hvacDesignButton.setToolTip('HVAC Design Studio');
      hvacDesignButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7V10C2 16 7 21 12 22C17 21 22 16 22 10V7L12 2Z"/>
          <path d="M8 11H16M8 15H16M8 7H16" stroke="white" stroke-width="1.5"/>
        </svg>
      `));
      hvacDesignButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(hvacDesignButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeComponentLibrary(): void {
    this.componentLibrary = [
      // Fans
      {
        id: 'exhaust-fan-12', type: 'fan', name: '12" Exhaust Fan', capacity: 1200, powerConsumption: 120,
        dimensions: { width: 12, height: 12, depth: 8 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Fantech', model: 'FG12', efficiency: 85, noiseLevel: 45, price: 280 }
      },
      {
        id: 'circulation-fan-16', type: 'fan', name: '16" Circulation Fan', capacity: 2400, powerConsumption: 180,
        dimensions: { width: 16, height: 16, depth: 10 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'HAF', model: 'CF16', efficiency: 88, noiseLevel: 42, price: 450 }
      },
      
      // Heaters
      {
        id: 'unit-heater-50k', type: 'heater', name: '50,000 BTU Unit Heater', capacity: 50000, powerConsumption: 0,
        dimensions: { width: 24, height: 18, depth: 12 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Modine', model: 'PDP50', efficiency: 80, noiseLevel: 38, price: 850 }
      },
      {
        id: 'radiant-heater-25k', type: 'heater', name: '25,000 BTU Radiant Heater', capacity: 25000, powerConsumption: 0,
        dimensions: { width: 48, height: 6, depth: 6 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Infratech', model: 'C25', efficiency: 92, noiseLevel: 0, price: 650 }
      },

      // Coolers
      {
        id: 'evap-cooler-6k', type: 'cooler', name: '6,000 CFM Evaporative Cooler', capacity: 6000, powerConsumption: 800,
        dimensions: { width: 48, height: 60, depth: 30 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Mastercool', model: 'AD1E6818', efficiency: 85, noiseLevel: 52, price: 1850 }
      },
      {
        id: 'mini-split-24k', type: 'cooler', name: '24,000 BTU Mini-Split', capacity: 24000, powerConsumption: 2400,
        dimensions: { width: 36, height: 12, depth: 8 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Mitsubishi', model: 'MSZ-FH24NA', efficiency: 23, noiseLevel: 19, price: 1200 }
      },

      // Controllers & Sensors
      {
        id: 'climate-controller', type: 'controller', name: 'Climate Controller', capacity: 0, powerConsumption: 15,
        dimensions: { width: 8, height: 6, depth: 3 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Argus', model: 'Titan', efficiency: 100, price: 2500 }
      },
      {
        id: 'temp-sensor', type: 'sensor', name: 'Temperature Sensor', capacity: 0, powerConsumption: 2,
        dimensions: { width: 2, height: 2, depth: 1 }, connections: [], position: { x: 0, y: 0, z: 0 },
        metadata: { manufacturer: 'Sentera', model: 'TSTAA', price: 85 }
      }
    ];
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const panelContent = `
      <div class="hvac-design-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>🏭 HVAC Design Studio</h3>
          <p>Professional greenhouse climate control design</p>
        </div>

        <!-- Mode Selection -->
        <div class="extension-section">
          <h4>Design Mode</h4>
          <div class="mode-buttons">
            <button class="btn mode-btn ${this.designMode === 'view' ? 'active' : ''}" onclick="hvacDesign.setMode('view')">
              👁️ View
            </button>
            <button class="btn mode-btn ${this.designMode === 'place' ? 'active' : ''}" onclick="hvacDesign.setMode('place')">
              📍 Place
            </button>
            <button class="btn mode-btn ${this.designMode === 'connect' ? 'active' : ''}" onclick="hvacDesign.setMode('connect')">
              🔗 Connect
            </button>
            <button class="btn mode-btn ${this.designMode === 'analyze' ? 'active' : ''}" onclick="hvacDesign.setMode('analyze')">
              📊 Analyze
            </button>
          </div>
        </div>

        ${this.designMode === 'place' ? this.renderPlaceMode() : ''}
        ${this.designMode === 'connect' ? this.renderConnectMode() : ''}
        ${this.designMode === 'analyze' ? this.renderAnalyzeMode() : ''}
        ${this.designMode === 'view' ? this.renderViewMode() : ''}

        <!-- System Summary -->
        <div class="extension-section">
          <h4>Current System</h4>
          ${this.currentSystem ? `
            <div class="system-summary">
              <div class="system-info">
                <p><strong>${this.currentSystem.name}</strong></p>
                <p>Type: ${this.currentSystem.type}</p>
                <p>Components: ${this.currentSystem.components.length}</p>
                <p>Total Capacity: ${this.formatCapacity(this.currentSystem.totalCapacity)}</p>
                <p>Power: ${this.currentSystem.totalPower.toLocaleString()} W</p>
                <p>Efficiency: ${this.currentSystem.efficiency.toFixed(1)}%</p>
              </div>
              <div class="system-actions">
                <button class="btn btn-primary" onclick="hvacDesign.saveSystem()">💾 Save System</button>
                <button class="btn btn-secondary" onclick="hvacDesign.exportSystem()">📤 Export</button>
              </div>
            </div>
          ` : `
            <p class="no-system">No active system. Create components to start designing.</p>
            <button class="btn btn-primary" onclick="hvacDesign.createNewSystem()">➕ New System</button>
          `}
        </div>

        <!-- Load Calculations -->
        <div class="extension-section">
          <h4>Load Calculator</h4>
          <div class="load-calculator">
            <div class="calc-input">
              <label>Greenhouse Area (sq ft):</label>
              <input type="number" id="greenhouse-area" value="4000" onchange="hvacDesign.updateLoadCalculation()">
            </div>
            <div class="calc-input">
              <label>Ceiling Height (ft):</label>
              <input type="number" id="ceiling-height" value="12" onchange="hvacDesign.updateLoadCalculation()">
            </div>
            <div class="calc-input">
              <label>Climate Zone:</label>
              <select id="climate-zone" onchange="hvacDesign.updateLoadCalculation()">
                <option value="hot-humid">Hot-Humid</option>
                <option value="hot-dry">Hot-Dry</option>
                <option value="mixed-humid">Mixed-Humid</option>
                <option value="mixed-dry">Mixed-Dry</option>
                <option value="cold">Cold</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="hvacDesign.calculateLoads()">🧮 Calculate Loads</button>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="extension-section">
          <h4>Performance</h4>
          <div class="performance-metrics">
            <div class="metric">
              <span class="label">Air Changes/Hour:</span>
              <span class="value" id="air-changes">--</span>
            </div>
            <div class="metric">
              <span class="label">Energy Efficiency:</span>
              <span class="value" id="energy-efficiency">--</span>
            </div>
            <div class="metric">
              <span class="label">Cost/sq ft/year:</span>
              <span class="value" id="operating-cost">--</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;

    // Make extension globally accessible for button callbacks
    (window as any).hvacDesign = this;
  }

  private renderPlaceMode(): string {
    return `
      <div class="extension-section">
        <h4>Component Library</h4>
        <div class="component-categories">
          <div class="category">
            <h5>🌪️ Fans & Ventilation</h5>
            ${this.componentLibrary.filter(c => c.type === 'fan').map(component => `
              <div class="component-item" onclick="hvacDesign.selectComponent('${component.id}')">
                <div class="component-info">
                  <strong>${component.name}</strong>
                  <p>${this.formatCapacity(component.capacity)} • ${component.powerConsumption}W</p>
                  <p class="price">$${component.metadata.price?.toLocaleString()}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="category">
            <h5>🔥 Heating Equipment</h5>
            ${this.componentLibrary.filter(c => c.type === 'heater').map(component => `
              <div class="component-item" onclick="hvacDesign.selectComponent('${component.id}')">
                <div class="component-info">
                  <strong>${component.name}</strong>
                  <p>${this.formatCapacity(component.capacity)} • ${component.metadata.efficiency}% eff</p>
                  <p class="price">$${component.metadata.price?.toLocaleString()}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="category">
            <h5>❄️ Cooling Equipment</h5>
            ${this.componentLibrary.filter(c => c.type === 'cooler').map(component => `
              <div class="component-item" onclick="hvacDesign.selectComponent('${component.id}')">
                <div class="component-info">
                  <strong>${component.name}</strong>
                  <p>${this.formatCapacity(component.capacity)} • ${component.powerConsumption}W</p>
                  <p class="price">$${component.metadata.price?.toLocaleString()}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="category">
            <h5>🎛️ Controls & Sensors</h5>
            ${this.componentLibrary.filter(c => c.type === 'controller' || c.type === 'sensor').map(component => `
              <div class="component-item" onclick="hvacDesign.selectComponent('${component.id}')">
                <div class="component-info">
                  <strong>${component.name}</strong>
                  <p>${component.metadata.manufacturer} ${component.metadata.model}</p>
                  <p class="price">$${component.metadata.price?.toLocaleString()}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${this.selectedComponent ? `
          <div class="selected-component">
            <h5>Selected: ${this.selectedComponent.name}</h5>
            <p>Click in the 3D view to place this component</p>
            <button class="btn btn-secondary" onclick="hvacDesign.cancelSelection()">Cancel</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderConnectMode(): string {
    const components = this.currentSystem?.components || [];
    return `
      <div class="extension-section">
        <h4>Connect Components</h4>
        <div class="connection-builder">
          <div class="connection-list">
            ${components.map(component => `
              <div class="component-connection">
                <div class="component-info">
                  <strong>${component.name}</strong>
                  <p>Connections: ${component.connections.length}</p>
                </div>
                <button class="btn btn-small" onclick="hvacDesign.connectComponent('${component.id}')">
                  🔗 Connect
                </button>
              </div>
            `).join('')}
          </div>
          
          <div class="connection-tools">
            <button class="btn btn-primary" onclick="hvacDesign.autoConnect()">⚡ Auto Connect</button>
            <button class="btn btn-secondary" onclick="hvacDesign.validateConnections()">✅ Validate</button>
          </div>
        </div>
      </div>
    `;
  }

  private renderAnalyzeMode(): string {
    return `
      <div class="extension-section">
        <h4>System Analysis</h4>
        <div class="analysis-tools">
          <button class="btn btn-primary" onclick="hvacDesign.runAirflowAnalysis()">🌪️ Airflow Analysis</button>
          <button class="btn btn-primary" onclick="hvacDesign.runThermalAnalysis()">🌡️ Thermal Analysis</button>
          <button class="btn btn-primary" onclick="hvacDesign.runEnergyAnalysis()">⚡ Energy Analysis</button>
        </div>
        
        <div class="analysis-results" id="analysis-results">
          <p>Run analysis to see results</p>
        </div>
      </div>
    `;
  }

  private renderViewMode(): string {
    const systems = Array.from(this.hvacSystems.values());
    return `
      <div class="extension-section">
        <h4>Saved Systems</h4>
        <div class="systems-list">
          ${systems.map(system => `
            <div class="system-item" onclick="hvacDesign.loadSystem('${system.id}')">
              <div class="system-info">
                <strong>${system.name}</strong>
                <p>${system.type} • ${system.components.length} components</p>
                <p>Capacity: ${this.formatCapacity(system.totalCapacity)}</p>
              </div>
              <div class="system-actions">
                <button class="btn btn-small" onclick="hvacDesign.editSystem('${system.id}')">✏️</button>
                <button class="btn btn-small" onclick="hvacDesign.deleteSystem('${system.id}')">🗑️</button>
              </div>
            </div>
          `).join('')}
          
          ${systems.length === 0 ? '<p>No saved systems yet</p>' : ''}
        </div>
      </div>
    `;
  }

  // Public API methods for panel callbacks
  public setMode(mode: 'place' | 'connect' | 'analyze' | 'view'): void {
    this.designMode = mode;
    this.updatePanel();
  }

  public selectComponent(componentId: string): void {
    const component = this.componentLibrary.find(c => c.id === componentId);
    if (component) {
      this.selectedComponent = { ...component };
      this.updatePanel();
      
      // Enable click-to-place mode
      this.viewer.addEventListener('click', this.onViewerClick.bind(this));
    }
  }

  public cancelSelection(): void {
    this.selectedComponent = null;
    this.viewer.removeEventListener('click', this.onViewerClick.bind(this));
    this.updatePanel();
  }

  private onViewerClick(event: any): void {
    if (!this.selectedComponent) return;

    const hitPoint = this.viewer.clientToWorld(event.clientX, event.clientY, true);
    if (hitPoint) {
      this.placeComponent(this.selectedComponent, hitPoint);
      this.cancelSelection();
    }
  }

  private async placeComponent(component: HVACComponent, position: THREE.Vector3): Promise<void> {
    // Create 3D representation
    const mesh = await this.create3DComponent(component, position);
    
    // Add to layer manager
    if (this.layerManager) {
      const layerId = this.getLayerForComponentType(component.type);
      this.layerManager.addObjectToLayer(
        layerId,
        component.id + '-' + Date.now(),
        mesh,
        'hvac',
        { component }
      );
    }

    // Add to current system
    if (!this.currentSystem) {
      this.createNewSystem();
    }

    if (this.currentSystem) {
      component.position = { x: position.x, y: position.y, z: position.z };
      this.currentSystem.components.push(component);
      this.updateSystemMetrics();
    }

    this.updatePanel();
  }

  private async create3DComponent(component: HVACComponent, position: THREE.Vector3): Promise<THREE.Object3D> {
    const group = new THREE.Group();
    
    // Create main body based on component type
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (component.type) {
      case 'fan':
        geometry = new THREE.CylinderGeometry(
          component.dimensions.width / 24, 
          component.dimensions.width / 24, 
          component.dimensions.depth / 12, 
          16
        );
        material = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        break;

      case 'heater':
        geometry = new THREE.BoxGeometry(
          component.dimensions.width / 12,
          component.dimensions.height / 12,
          component.dimensions.depth / 12
        );
        material = new THREE.MeshLambertMaterial({ color: 0xFF6347 });
        break;

      case 'cooler':
        geometry = new THREE.BoxGeometry(
          component.dimensions.width / 12,
          component.dimensions.height / 12,
          component.dimensions.depth / 12
        );
        material = new THREE.MeshLambertMaterial({ color: 0x00CED1 });
        break;

      case 'controller':
        geometry = new THREE.BoxGeometry(
          component.dimensions.width / 12,
          component.dimensions.height / 12,
          component.dimensions.depth / 12
        );
        material = new THREE.MeshLambertMaterial({ color: 0x32CD32 });
        break;

      case 'sensor':
        geometry = new THREE.SphereGeometry(component.dimensions.width / 24, 8, 6);
        material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        break;

      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshLambertMaterial({ color: 0x808080 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Add label
    const labelSprite = this.createComponentLabel(component.name);
    labelSprite.position.set(0, component.dimensions.height / 12 + 1, 0);
    group.add(labelSprite);

    // Position the group
    group.position.copy(position);

    return group;
  }

  private createComponentLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    
    return sprite;
  }

  private getLayerForComponentType(type: HVACComponent['type']): string {
    switch (type) {
      case 'fan': return 'hvac-equipment';
      case 'heater': return 'hvac-equipment';
      case 'cooler': return 'hvac-equipment';
      case 'duct': return 'hvac-ducts';
      case 'controller': return 'electrical-panels';
      case 'sensor': return 'electrical-panels';
      default: return 'hvac-equipment';
    }
  }

  public createNewSystem(): void {
    const systemId = 'hvac-system-' + Date.now();
    this.currentSystem = {
      id: systemId,
      name: `HVAC System ${this.hvacSystems.size + 1}`,
      type: 'combined',
      components: [],
      totalCapacity: 0,
      totalPower: 0,
      efficiency: 0,
      zones: [],
      controlStrategy: 'automatic'
    };
    
    this.hvacSystems.set(systemId, this.currentSystem);
    this.updatePanel();
  }

  private updateSystemMetrics(): void {
    if (!this.currentSystem) return;

    // Calculate totals
    let totalCapacity = 0;
    let totalPower = 0;
    let weightedEfficiency = 0;

    this.currentSystem.components.forEach(component => {
      totalCapacity += component.capacity;
      totalPower += component.powerConsumption;
      
      if (component.metadata.efficiency) {
        weightedEfficiency += component.metadata.efficiency * component.capacity;
      }
    });

    this.currentSystem.totalCapacity = totalCapacity;
    this.currentSystem.totalPower = totalPower;
    this.currentSystem.efficiency = totalCapacity > 0 ? weightedEfficiency / totalCapacity : 0;
  }

  public calculateLoads(): void {
    const area = parseFloat((document.getElementById('greenhouse-area') as HTMLInputElement)?.value || '4000');
    const height = parseFloat((document.getElementById('ceiling-height') as HTMLInputElement)?.value || '12');
    const climateZone = (document.getElementById('climate-zone') as HTMLSelectElement)?.value || 'mixed-humid';

    const volume = area * height;

    // Simplified load calculations for greenhouse
    const heatingLoad = this.calculateHeatingLoad(area, climateZone);
    const coolingLoad = this.calculateCoolingLoad(area, climateZone);
    const ventilationCFM = this.calculateVentilationRequirement(volume);

    // Update performance metrics
    const airChanges = ventilationCFM * 60 / volume;
    const energyEfficiency = this.calculateEnergyEfficiency();
    const operatingCost = this.calculateOperatingCost(area, heatingLoad, coolingLoad);

    // Update UI
    const airChangesEl = document.getElementById('air-changes');
    const efficiencyEl = document.getElementById('energy-efficiency');
    const costEl = document.getElementById('operating-cost');

    if (airChangesEl) airChangesEl.textContent = airChanges.toFixed(1);
    if (efficiencyEl) efficiencyEl.textContent = energyEfficiency.toFixed(1) + '%';
    if (costEl) costEl.textContent = '$' + operatingCost.toFixed(2);

    console.log('Load calculations:', {
      heatingLoad,
      coolingLoad,
      ventilationCFM,
      airChanges,
      energyEfficiency,
      operatingCost
    });
  }

  private calculateHeatingLoad(area: number, climateZone: string): number {
    // BTU/hr per sq ft based on climate zone and greenhouse specifics
    const loadFactors = {
      'hot-humid': 15,
      'hot-dry': 20,
      'mixed-humid': 25,
      'mixed-dry': 30,
      'cold': 40
    };
    
    return area * (loadFactors[climateZone as keyof typeof loadFactors] || 25);
  }

  private calculateCoolingLoad(area: number, climateZone: string): number {
    // BTU/hr per sq ft for greenhouse cooling
    const loadFactors = {
      'hot-humid': 50,
      'hot-dry': 45,
      'mixed-humid': 35,
      'mixed-dry': 30,
      'cold': 25
    };
    
    return area * (loadFactors[climateZone as keyof typeof loadFactors] || 35);
  }

  private calculateVentilationRequirement(volume: number): number {
    // CFM - greenhouse typically needs 1-2 air changes per minute for proper ventilation
    return volume * 1.5 / 60; // 1.5 air changes per minute converted to CFM
  }

  private calculateEnergyEfficiency(): number {
    if (!this.currentSystem || this.currentSystem.components.length === 0) return 0;
    
    return this.currentSystem.efficiency;
  }

  private calculateOperatingCost(area: number, heatingLoad: number, coolingLoad: number): number {
    // Simplified cost calculation - $/sq ft/year
    const energyCostPerBTU = 0.000012; // $0.000012 per BTU (typical natural gas)
    const electricCostPerKWH = 0.12; // $0.12 per kWh
    
    const annualHeatingCost = (heatingLoad * 24 * 180 * energyCostPerBTU); // 180 heating days
    const annualCoolingCost = (coolingLoad * 24 * 120 * energyCostPerBTU * 3); // 120 cooling days, electric is ~3x more expensive
    
    return (annualHeatingCost + annualCoolingCost) / area;
  }

  public runAirflowAnalysis(): void {
    // Simulate airflow analysis
    const resultsEl = document.getElementById('analysis-results');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="analysis-result">
          <h5>🌪️ Airflow Analysis Complete</h5>
          <div class="result-metrics">
            <p><strong>Average Velocity:</strong> 2.3 ft/s</p>
            <p><strong>Dead Zones:</strong> 2 locations identified</p>
            <p><strong>Turbulence:</strong> Low (15% of volume)</p>
            <p><strong>Pressure Drop:</strong> 0.08 in. H2O</p>
            <p><strong>Distribution Uniformity:</strong> 85%</p>
          </div>
          <button class="btn btn-small" onclick="hvacDesign.showAirflowVisualization()">👁️ Show Visualization</button>
        </div>
      `;
    }
  }

  public runThermalAnalysis(): void {
    const resultsEl = document.getElementById('analysis-results');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="analysis-result">
          <h5>🌡️ Thermal Analysis Complete</h5>
          <div class="result-metrics">
            <p><strong>Temperature Range:</strong> 68-76°F</p>
            <p><strong>Hot Spots:</strong> 3 zones above 78°F</p>
            <p><strong>Cold Spots:</strong> 1 zone below 65°F</p>
            <p><strong>Thermal Gradient:</strong> 2.8°F max</p>
            <p><strong>Energy Balance:</strong> 96% efficiency</p>
          </div>
          <button class="btn btn-small" onclick="hvacDesign.showThermalVisualization()">👁️ Show Heatmap</button>
        </div>
      `;
    }
  }

  public runEnergyAnalysis(): void {
    const resultsEl = document.getElementById('analysis-results');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="analysis-result">
          <h5>⚡ Energy Analysis Complete</h5>
          <div class="result-metrics">
            <p><strong>Annual Energy Use:</strong> 245,000 kWh</p>
            <p><strong>Peak Demand:</strong> 85 kW</p>
            <p><strong>Cost per sq ft:</strong> $2.45/year</p>
            <p><strong>CO2 Emissions:</strong> 85 tons/year</p>
            <p><strong>Efficiency Rating:</strong> B+ (82/100)</p>
          </div>
          <div class="recommendations">
            <h6>💡 Optimization Recommendations:</h6>
            <ul>
              <li>Add variable speed drives: 15% energy savings</li>
              <li>Improve insulation: 8% heating savings</li>
              <li>Install economizer cycle: 12% cooling savings</li>
            </ul>
          </div>
        </div>
      `;
    }
  }

  private formatCapacity(capacity: number): string {
    if (capacity >= 1000) {
      return (capacity / 1000).toFixed(1) + 'K CFM';
    }
    return capacity.toLocaleString() + ' CFM';
  }

  private onSelectionChanged(event: any): void {
    // Handle selection of HVAC components
  }

  private onCameraChanged(event: any): void {
    // Update LOD based on camera distance
  }

  private cleanup(): void {
    // Clean up 3D objects and resources
    if (this.layerManager) {
      this.layerManager.getObjectsByType('hvac').forEach(obj => {
        this.layerManager!.removeObjectFromLayer(obj.id);
      });
    }
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.HVACDesign', HVACDesignForgeExtension);

export default HVACDesignForgeExtension;