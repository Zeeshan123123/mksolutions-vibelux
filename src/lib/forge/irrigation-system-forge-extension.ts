/**
 * VibeLux Irrigation System 3D Extension
 * Provides comprehensive irrigation design, water management, and fertigation control
 */

interface IrrigationComponent {
  id: string;
  type: 'pipe' | 'valve' | 'pump' | 'tank' | 'filter' | 'emitter' | 'sprinkler' | 'sensor' | 'injector';
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  properties: any;
  connections: string[]; // IDs of connected components
  mesh?: THREE.Mesh;
  label?: CSS2DObject;
}

interface IrrigationSystem {
  id: string;
  name: string;
  type: 'drip' | 'overhead' | 'nft' | 'ebb-flow' | 'misting' | 'hybrid';
  components: Map<string, IrrigationComponent>;
  zones: IrrigationZone[];
  waterSource: WaterSource;
  fertigationConfig?: FertigationConfig;
}

interface IrrigationZone {
  id: string;
  name: string;
  area: number; // m²
  cropType: string;
  irrigationType: string;
  schedule: IrrigationSchedule;
  sensors: string[]; // Sensor component IDs
  valves: string[]; // Valve component IDs
  flowRate: number; // L/min
  pressure: number; // bar
}

interface IrrigationSchedule {
  mode: 'time-based' | 'sensor-based' | 'et-based' | 'manual';
  events: ScheduleEvent[];
  constraints: ScheduleConstraints;
}

interface ScheduleEvent {
  id: string;
  type: 'irrigation' | 'fertigation' | 'flush';
  startTime: string; // HH:MM
  duration: number; // minutes
  daysOfWeek: number[]; // 0-6
  volume?: number; // liters
  ecTarget?: number; // mS/cm
  phTarget?: number;
  active: boolean;
}

interface ScheduleConstraints {
  minInterval: number; // hours between irrigations
  maxDuration: number; // max minutes per event
  blackoutPeriods: { start: string; end: string }[];
  priorityLevel: number; // 1-10
}

interface WaterSource {
  type: 'municipal' | 'well' | 'reservoir' | 'rainwater' | 'recycled';
  capacity: number; // liters
  flowRate: number; // L/min
  pressure: number; // bar
  quality: WaterQuality;
}

interface WaterQuality {
  ec: number; // mS/cm
  ph: number;
  temperature: number; // °C
  turbidity: number; // NTU
  chlorine: number; // ppm
  dissolvedOxygen: number; // mg/L
}

interface FertigationConfig {
  injectors: FertigationInjector[];
  recipes: NutrientRecipe[];
  mixingTank?: {
    volume: number; // liters
    agitation: boolean;
    sensors: string[];
  };
  monitoring: {
    ecSensor: string;
    phSensor: string;
    flowMeter: string;
  };
}

interface FertigationInjector {
  id: string;
  name: string;
  type: 'venturi' | 'dosatron' | 'pump';
  stockSolution: {
    nutrient: string;
    concentration: number; // g/L
    volume: number; // liters
    remaining: number; // liters
  };
  flowRate: number; // mL/min
  ratio: number; // injection ratio
}

interface NutrientRecipe {
  id: string;
  name: string;
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
  targetEC: number;
  targetPH: number;
  nutrients: {
    nitrogen: number; // ppm
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    sulfur: number;
    iron: number;
    micronutrients: { [key: string]: number };
  };
}

interface PipeSegment {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  diameter: number; // mm
  material: 'pvc' | 'pe' | 'hdpe' | 'galvanized' | 'copper';
  flowRate: number; // L/min
  pressure: number; // bar
  mesh?: THREE.Mesh;
}

interface HydraulicAnalysis {
  totalHeadLoss: number; // meters
  criticalPath: string[]; // Component IDs
  pressureMap: Map<string, number>; // Component ID to pressure
  flowDistribution: Map<string, number>; // Component ID to flow rate
  recommendations: string[];
}

class IrrigationSystemExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel;
  private systems: Map<string, IrrigationSystem> = new Map();
  private activeSystem: IrrigationSystem | null = null;
  private componentLibrary: Map<string, any> = new Map();
  private drawingMode: string | null = null;
  private tempLine: THREE.Line | null = null;
  private snapPoints: THREE.Vector3[] = [];
  private layerManager: any;
  private currentView: 'design' | 'schedule' | 'monitor' | 'analysis' | 'fertigation' = 'design';

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any) {
    super(viewer, options);
    this.initializeComponentLibrary();
  }

  load() {
    console.log('VibeLux Irrigation System Extension loaded');
    this.createUI();
    this.setupEventHandlers();
    return true;
  }

  unload() {
    if (this.panel) {
      this.panel.setVisible(false);
      this.panel.uninitialize();
    }
    this.cleanupVisualizations();
    console.log('VibeLux Irrigation System Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: any) {
    this.layerManager = layerManager;
  }

  private initializeComponentLibrary() {
    // Pipes
    this.componentLibrary.set('pipe_16mm', {
      type: 'pipe',
      name: '16mm Drip Line',
      diameter: 16,
      material: 'pe',
      maxPressure: 4,
      flowRate: 2.3 // L/min per meter
    });

    this.componentLibrary.set('pipe_25mm', {
      type: 'pipe',
      name: '25mm Main Line',
      diameter: 25,
      material: 'pe',
      maxPressure: 6,
      flowRate: 15
    });

    // Emitters
    this.componentLibrary.set('dripper_2lph', {
      type: 'emitter',
      name: '2 L/hr Pressure Compensating Dripper',
      flowRate: 2, // L/hr
      pressureRange: { min: 0.5, max: 4 },
      spacing: 0.3 // meters
    });

    this.componentLibrary.set('microsprinkler_50lph', {
      type: 'sprinkler',
      name: '50 L/hr Micro Sprinkler',
      flowRate: 50,
      radius: 2, // meters
      pattern: '360°'
    });

    // Valves
    this.componentLibrary.set('solenoid_valve_1inch', {
      type: 'valve',
      name: '1" Solenoid Valve',
      size: 25, // mm
      cv: 18, // flow coefficient
      voltageAC: 24,
      normallyOpen: false
    });

    // Sensors
    this.componentLibrary.set('moisture_sensor', {
      type: 'sensor',
      name: 'Soil Moisture Sensor',
      measurement: 'volumetric_water_content',
      range: { min: 0, max: 100 }, // %
      accuracy: 3
    });

    this.componentLibrary.set('ec_sensor', {
      type: 'sensor',
      name: 'EC Sensor',
      measurement: 'electrical_conductivity',
      range: { min: 0, max: 10 }, // mS/cm
      accuracy: 0.1
    });
  }

  private createUI() {
    const panelDiv = document.createElement('div');
    panelDiv.innerHTML = `
      <div class="irrigation-system-panel">
        <div class="panel-header">
          <h3>Irrigation System Designer</h3>
          <div class="view-tabs">
            <button class="tab-btn active" data-view="design">Design</button>
            <button class="tab-btn" data-view="schedule">Schedule</button>
            <button class="tab-btn" data-view="monitor">Monitor</button>
            <button class="tab-btn" data-view="analysis">Analysis</button>
            <button class="tab-btn" data-view="fertigation">Fertigation</button>
          </div>
        </div>

        <!-- Design View -->
        <div class="view-content" id="design-view">
          <div class="system-selector">
            <label>Irrigation System Type:</label>
            <select id="system-type-select">
              <option value="">Select System...</option>
              <option value="drip">Drip Irrigation</option>
              <option value="overhead">Overhead Sprinkler</option>
              <option value="nft">NFT (Nutrient Film)</option>
              <option value="ebb-flow">Ebb & Flow</option>
              <option value="misting">Misting/Fogging</option>
              <option value="hybrid">Hybrid System</option>
            </select>
            <button id="new-system-btn" class="btn btn-primary">New System</button>
          </div>

          <div class="component-library">
            <h4>Components</h4>
            <div class="component-categories">
              <div class="category">
                <h5>Water Supply</h5>
                <button class="component-btn" data-component="tank">Tank</button>
                <button class="component-btn" data-component="pump">Pump</button>
                <button class="component-btn" data-component="filter">Filter</button>
              </div>
              <div class="category">
                <h5>Distribution</h5>
                <button class="component-btn" data-component="pipe">Pipe</button>
                <button class="component-btn" data-component="valve">Valve</button>
                <button class="component-btn" data-component="manifold">Manifold</button>
              </div>
              <div class="category">
                <h5>Emitters</h5>
                <button class="component-btn" data-component="dripper">Dripper</button>
                <button class="component-btn" data-component="sprinkler">Sprinkler</button>
                <button class="component-btn" data-component="mister">Mister</button>
              </div>
              <div class="category">
                <h5>Sensors</h5>
                <button class="component-btn" data-component="moisture">Moisture</button>
                <button class="component-btn" data-component="pressure">Pressure</button>
                <button class="component-btn" data-component="flow">Flow Meter</button>
              </div>
            </div>
          </div>

          <div class="drawing-tools">
            <h4>Drawing Tools</h4>
            <button id="draw-pipe-btn" class="tool-btn">Draw Pipe</button>
            <button id="auto-layout-btn" class="tool-btn">Auto Layout</button>
            <button id="snap-grid-btn" class="tool-btn">Snap to Grid</button>
          </div>

          <div class="zone-manager">
            <h4>Irrigation Zones</h4>
            <div id="zone-list"></div>
            <button id="add-zone-btn" class="btn btn-secondary">Add Zone</button>
          </div>
        </div>

        <!-- Schedule View -->
        <div class="view-content hidden" id="schedule-view">
          <div class="schedule-controls">
            <h4>Irrigation Schedule</h4>
            <div class="schedule-mode">
              <label>Control Mode:</label>
              <select id="schedule-mode-select">
                <option value="time-based">Time-Based</option>
                <option value="sensor-based">Sensor-Based</option>
                <option value="et-based">ET-Based</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div class="schedule-calendar">
              <div id="weekly-schedule"></div>
            </div>

            <div class="schedule-events">
              <h5>Scheduled Events</h5>
              <div id="event-list"></div>
              <button id="add-event-btn" class="btn btn-primary">Add Event</button>
            </div>

            <div class="water-budget">
              <h5>Water Budget</h5>
              <div class="budget-display">
                <p>Daily Usage: <span id="daily-usage">0</span> L</p>
                <p>Weekly Usage: <span id="weekly-usage">0</span> L</p>
                <p>Monthly Estimate: <span id="monthly-usage">0</span> L</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Monitor View -->
        <div class="view-content hidden" id="monitor-view">
          <div class="system-status">
            <h4>System Status</h4>
            <div class="status-indicators">
              <div class="status-item">
                <span class="status-label">System Pressure:</span>
                <span class="status-value" id="system-pressure">0.0 bar</span>
              </div>
              <div class="status-item">
                <span class="status-label">Total Flow Rate:</span>
                <span class="status-value" id="total-flow">0.0 L/min</span>
              </div>
              <div class="status-item">
                <span class="status-label">Active Zones:</span>
                <span class="status-value" id="active-zones">0</span>
              </div>
            </div>
          </div>

          <div class="sensor-readings">
            <h4>Sensor Readings</h4>
            <div id="sensor-grid"></div>
          </div>

          <div class="alerts-panel">
            <h4>Alerts & Notifications</h4>
            <div id="alert-list"></div>
          </div>

          <div class="manual-control">
            <h4>Manual Control</h4>
            <div id="zone-controls"></div>
          </div>
        </div>

        <!-- Analysis View -->
        <div class="view-content hidden" id="analysis-view">
          <div class="hydraulic-analysis">
            <h4>Hydraulic Analysis</h4>
            <button id="run-analysis-btn" class="btn btn-primary">Run Analysis</button>
            <div id="analysis-results" class="hidden">
              <div class="result-item">
                <label>Total Head Loss:</label>
                <span id="head-loss">0.0 m</span>
              </div>
              <div class="result-item">
                <label>Critical Path:</label>
                <span id="critical-path">-</span>
              </div>
              <div class="result-item">
                <label>Pump Requirement:</label>
                <span id="pump-requirement">0.0 kW</span>
              </div>
            </div>
          </div>

          <div class="uniformity-analysis">
            <h4>Distribution Uniformity</h4>
            <div class="uniformity-metrics">
              <div class="metric">
                <label>CU (Christiansen):</label>
                <span id="cu-value">0%</span>
              </div>
              <div class="metric">
                <label>DU (Distribution):</label>
                <span id="du-value">0%</span>
              </div>
              <div class="metric">
                <label>EU (Emission):</label>
                <span id="eu-value">0%</span>
              </div>
            </div>
            <div id="uniformity-heatmap"></div>
          </div>

          <div class="recommendations">
            <h4>System Recommendations</h4>
            <ul id="recommendation-list"></ul>
          </div>
        </div>

        <!-- Fertigation View -->
        <div class="view-content hidden" id="fertigation-view">
          <div class="fertigation-setup">
            <h4>Fertigation System</h4>
            <div class="injector-config">
              <h5>Nutrient Injectors</h5>
              <div id="injector-list"></div>
              <button id="add-injector-btn" class="btn btn-secondary">Add Injector</button>
            </div>

            <div class="recipe-manager">
              <h5>Nutrient Recipes</h5>
              <select id="recipe-select">
                <option value="">Select Recipe...</option>
              </select>
              <button id="new-recipe-btn" class="btn btn-secondary">New Recipe</button>
            </div>

            <div class="nutrient-calculator">
              <h5>Nutrient Calculator</h5>
              <div class="calc-inputs">
                <label>Target EC (mS/cm):</label>
                <input type="number" id="target-ec" step="0.1" value="2.0">
                <label>Target pH:</label>
                <input type="number" id="target-ph" step="0.1" value="6.0">
                <label>Water Volume (L):</label>
                <input type="number" id="water-volume" value="1000">
              </div>
              <button id="calculate-nutrients-btn" class="btn btn-primary">Calculate</button>
              <div id="nutrient-results" class="hidden"></div>
            </div>

            <div class="stock-solutions">
              <h5>Stock Solutions</h5>
              <div id="stock-list"></div>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <button id="export-irrigation-btn" class="btn btn-primary">Export Design</button>
          <button id="generate-bom-btn" class="btn btn-secondary">Generate BOM</button>
        </div>
      </div>
    `;

    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'irrigation-system-panel',
      'Irrigation System',
      { addFooter: false }
    );

    this.panel.container.style.width = '400px';
    this.panel.container.style.height = '600px';
    this.panel.container.style.right = '10px';
    this.panel.container.style.top = '50px';

    this.panel.container.appendChild(panelDiv);
    
    this.addToolbarButton();
    this.addStyles();
  }

  private addToolbarButton() {
    const toolbar = this.viewer.toolbar;
    const controlGroup = toolbar.getControl('vibelux-toolbar-group') || new Autodesk.Viewing.UI.ControlGroup('vibelux-toolbar-group');
    
    const button = new Autodesk.Viewing.UI.Button('irrigation-system-button');
    button.setIcon('icon-water');
    button.setToolTip('Irrigation System');
    button.onClick = () => {
      this.panel.setVisible(!this.panel.isVisible());
    };

    controlGroup.addControl(button);
    toolbar.addControl(controlGroup);
  }

  private setupEventHandlers() {
    // View tabs
    const tabButtons = this.panel.container.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const view = target.dataset.view;
        if (view) {
          this.switchView(view as any);
          tabButtons.forEach(b => b.classList.remove('active'));
          target.classList.add('active');
        }
      });
    });

    // System type selector
    const systemTypeSelect = this.panel.container.querySelector('#system-type-select') as HTMLSelectElement;
    systemTypeSelect?.addEventListener('change', (e) => {
      const type = (e.target as HTMLSelectElement).value;
      if (type) {
        this.createNewSystem(type as any);
      }
    });

    // Component buttons
    const componentButtons = this.panel.container.querySelectorAll('.component-btn');
    componentButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const component = (e.target as HTMLElement).dataset.component;
        if (component) {
          this.startComponentPlacement(component);
        }
      });
    });

    // Drawing tools
    const drawPipeBtn = this.panel.container.querySelector('#draw-pipe-btn');
    drawPipeBtn?.addEventListener('click', () => {
      this.startPipeDrawing();
    });

    const autoLayoutBtn = this.panel.container.querySelector('#auto-layout-btn');
    autoLayoutBtn?.addEventListener('click', () => {
      this.autoLayoutSystem();
    });

    // Schedule controls
    const addEventBtn = this.panel.container.querySelector('#add-event-btn');
    addEventBtn?.addEventListener('click', () => {
      this.showAddEventDialog();
    });

    // Analysis
    const runAnalysisBtn = this.panel.container.querySelector('#run-analysis-btn');
    runAnalysisBtn?.addEventListener('click', () => {
      this.runHydraulicAnalysis();
    });

    // Export
    const exportBtn = this.panel.container.querySelector('#export-irrigation-btn');
    exportBtn?.addEventListener('click', () => {
      this.exportIrrigationDesign();
    });

    // Viewer events
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, 
      this.onSelectionChanged.bind(this));
  }

  private switchView(view: 'design' | 'schedule' | 'monitor' | 'analysis' | 'fertigation') {
    this.currentView = view;
    
    // Hide all views
    const views = this.panel.container.querySelectorAll('.view-content');
    views.forEach(v => v.classList.add('hidden'));
    
    // Show selected view
    const selectedView = this.panel.container.querySelector(`#${view}-view`);
    selectedView?.classList.remove('hidden');
    
    // Update view-specific content
    switch (view) {
      case 'monitor':
        this.updateMonitorView();
        break;
      case 'schedule':
        this.updateScheduleView();
        break;
      case 'analysis':
        this.updateAnalysisView();
        break;
      case 'fertigation':
        this.updateFertigationView();
        break;
    }
  }

  private createNewSystem(type: string) {
    const system: IrrigationSystem = {
      id: `system_${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} System`,
      type: type as any,
      components: new Map(),
      zones: [],
      waterSource: {
        type: 'municipal',
        capacity: 10000,
        flowRate: 100,
        pressure: 4,
        quality: {
          ec: 0.5,
          ph: 7.0,
          temperature: 20,
          turbidity: 1,
          chlorine: 0.5,
          dissolvedOxygen: 8
        }
      }
    };

    this.systems.set(system.id, system);
    this.activeSystem = system;
    
    // Create default layout based on type
    this.createDefaultLayout(type);
    this.updateZoneList();
  }

  private createDefaultLayout(systemType: string) {
    if (!this.activeSystem || !this.layerManager) return;

    const bounds = this.viewer.model.getBoundingBox();
    const center = bounds.center();
    
    switch (systemType) {
      case 'drip':
        this.createDripIrrigationLayout(center);
        break;
      case 'overhead':
        this.createOverheadSprinklerLayout(center);
        break;
      case 'nft':
        this.createNFTLayout(center);
        break;
      // Add other system types...
    }
  }

  private createDripIrrigationLayout(center: THREE.Vector3) {
    const material = new THREE.LineBasicMaterial({ color: 0x0066cc, linewidth: 2 });
    
    // Main supply line
    const mainLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(center.x - 20, center.y, center.z),
      new THREE.Vector3(center.x + 20, center.y, center.z)
    ]);
    const mainMesh = new THREE.Line(mainLine, material);
    
    // Add lateral lines
    for (let i = -15; i <= 15; i += 5) {
      const lateral = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(center.x + i, center.y, center.z),
        new THREE.Vector3(center.x + i, center.y, center.z + 30)
      ]);
      const lateralMesh = new THREE.Line(lateral, material);
      
      this.layerManager.addObject('Irrigation', lateralMesh, { 
        userData: { 
          type: 'irrigation_pipe',
          systemId: this.activeSystem!.id,
          diameter: 16,
          material: 'pe'
        } 
      });
      
      // Add drippers along lateral
      for (let j = 0; j <= 30; j += 0.3) {
        const dripperGeom = new THREE.SphereGeometry(0.05);
        const dripperMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const dripper = new THREE.Mesh(dripperGeom, dripperMat);
        dripper.position.set(center.x + i, center.y + 0.1, center.z + j);
        
        this.layerManager.addObject('Irrigation', dripper, {
          userData: {
            type: 'dripper',
            flowRate: 2, // L/hr
            systemId: this.activeSystem!.id
          }
        });
      }
    }
    
    this.layerManager.addObject('Irrigation', mainMesh, { 
      userData: { 
        type: 'irrigation_main',
        systemId: this.activeSystem!.id,
        diameter: 25,
        material: 'pe'
      } 
    });
  }

  private createOverheadSprinklerLayout(center: THREE.Vector3) {
    const sprinklerSpacing = 5; // meters
    const coverage = 3; // meter radius
    
    for (let x = -20; x <= 20; x += sprinklerSpacing) {
      for (let z = 0; z <= 30; z += sprinklerSpacing) {
        // Sprinkler head
        const sprinklerGeom = new THREE.ConeGeometry(0.2, 0.5, 8);
        const sprinklerMat = new THREE.MeshBasicMaterial({ color: 0x4444ff });
        const sprinkler = new THREE.Mesh(sprinklerGeom, sprinklerMat);
        sprinkler.position.set(center.x + x, center.y + 2, center.z + z);
        sprinkler.rotation.x = Math.PI;
        
        // Coverage area
        const coverageGeom = new THREE.CircleGeometry(coverage, 32);
        const coverageMat = new THREE.MeshBasicMaterial({ 
          color: 0x0066cc, 
          transparent: true, 
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        const coverageMesh = new THREE.Mesh(coverageGeom, coverageMat);
        coverageMesh.position.set(center.x + x, center.y + 0.01, center.z + z);
        coverageMesh.rotation.x = -Math.PI / 2;
        
        this.layerManager.addObject('Irrigation', sprinkler, {
          userData: {
            type: 'sprinkler',
            flowRate: 50, // L/hr
            radius: coverage,
            systemId: this.activeSystem!.id
          }
        });
        
        this.layerManager.addObject('Irrigation', coverageMesh, {
          userData: {
            type: 'coverage_area',
            systemId: this.activeSystem!.id
          }
        });
      }
    }
  }

  private createNFTLayout(center: THREE.Vector3) {
    // NFT channels
    const channelMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const channelWidth = 0.3;
    const channelLength = 10;
    const channelSpacing = 0.5;
    
    for (let i = 0; i < 10; i++) {
      const channelGeom = new THREE.BoxGeometry(channelWidth, 0.1, channelLength);
      const channel = new THREE.Mesh(channelGeom, channelMat);
      channel.position.set(
        center.x + (i - 5) * channelSpacing,
        center.y + 1,
        center.z + channelLength / 2
      );
      
      this.layerManager.addObject('Irrigation', channel, {
        userData: {
          type: 'nft_channel',
          systemId: this.activeSystem!.id,
          flowRate: 1.5 // L/min
        }
      });
    }
    
    // Nutrient reservoir
    const reservoirGeom = new THREE.CylinderGeometry(1, 1, 2);
    const reservoirMat = new THREE.MeshBasicMaterial({ color: 0x0044aa });
    const reservoir = new THREE.Mesh(reservoirGeom, reservoirMat);
    reservoir.position.set(center.x, center.y + 1, center.z - 2);
    
    this.layerManager.addObject('Irrigation', reservoir, {
      userData: {
        type: 'nutrient_reservoir',
        volume: 500, // liters
        systemId: this.activeSystem!.id
      }
    });
  }

  private startComponentPlacement(componentType: string) {
    // Enable placement mode
    this.viewer.impl.disableHighlight(true);
    this.viewer.clearSelection();
    
    const handleMouseMove = (event: MouseEvent) => {
      const screenPoint = {
        x: event.clientX,
        y: event.clientY
      };
      
      const hitTest = this.viewer.impl.hitTest(screenPoint.x, screenPoint.y, false);
      if (hitTest) {
        this.showComponentPreview(componentType, hitTest.intersectPoint);
      }
    };
    
    const handleClick = (event: MouseEvent) => {
      const screenPoint = {
        x: event.clientX,
        y: event.clientY
      };
      
      const hitTest = this.viewer.impl.hitTest(screenPoint.x, screenPoint.y, false);
      if (hitTest) {
        this.placeComponent(componentType, hitTest.intersectPoint);
        
        // Cleanup
        this.viewer.container.removeEventListener('mousemove', handleMouseMove);
        this.viewer.container.removeEventListener('click', handleClick);
        this.viewer.impl.disableHighlight(false);
      }
    };
    
    this.viewer.container.addEventListener('mousemove', handleMouseMove);
    this.viewer.container.addEventListener('click', handleClick);
  }

  private placeComponent(type: string, position: THREE.Vector3) {
    if (!this.activeSystem || !this.layerManager) return;
    
    let mesh: THREE.Mesh;
    const componentData: any = {
      type,
      systemId: this.activeSystem.id
    };
    
    switch (type) {
      case 'valve':
        const valveGeom = new THREE.BoxGeometry(0.3, 0.3, 0.5);
        const valveMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        mesh = new THREE.Mesh(valveGeom, valveMat);
        componentData.size = 25; // mm
        componentData.normallyOpen = false;
        break;
        
      case 'moisture':
        const sensorGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
        const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        mesh = new THREE.Mesh(sensorGeom, sensorMat);
        componentData.sensorType = 'moisture';
        componentData.reading = 0;
        break;
        
      case 'pump':
        const pumpGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.8);
        const pumpMat = new THREE.MeshBasicMaterial({ color: 0x0066cc });
        mesh = new THREE.Mesh(pumpGeom, pumpMat);
        componentData.flowRate = 100; // L/min
        componentData.pressure = 5; // bar
        break;
        
      default:
        const defaultGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const defaultMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
        mesh = new THREE.Mesh(defaultGeom, defaultMat);
    }
    
    mesh.position.copy(position);
    
    const component: IrrigationComponent = {
      id: `comp_${Date.now()}`,
      type: type as any,
      position,
      properties: componentData,
      connections: [],
      mesh
    };
    
    this.activeSystem.components.set(component.id, component);
    this.layerManager.addObject('Irrigation', mesh, { userData: componentData });
    
    // Add label
    this.addComponentLabel(component);
  }

  private addComponentLabel(component: IrrigationComponent) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'component-label';
    labelDiv.textContent = component.type;
    labelDiv.style.cssText = `
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      pointer-events: none;
    `;
    
    const label = new CSS2DObject(labelDiv);
    label.position.copy(component.position);
    label.position.y += 0.5;
    component.label = label;
    
    if (component.mesh) {
      component.mesh.add(label);
    }
  }

  private startPipeDrawing() {
    const points: THREE.Vector3[] = [];
    const material = new THREE.LineBasicMaterial({ 
      color: 0x0066cc, 
      linewidth: 3 
    });
    
    const handleClick = (event: MouseEvent) => {
      const screenPoint = {
        x: event.clientX,
        y: event.clientY
      };
      
      const hitTest = this.viewer.impl.hitTest(screenPoint.x, screenPoint.y, false);
      if (hitTest) {
        const point = hitTest.intersectPoint;
        
        // Snap to grid if enabled
        if (this.snapPoints.length > 0) {
          const snapped = this.getSnappedPoint(point);
          points.push(snapped);
        } else {
          points.push(point.clone());
        }
        
        // Update temp line
        if (points.length > 1) {
          if (this.tempLine) {
            this.viewer.scene.remove(this.tempLine);
          }
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          this.tempLine = new THREE.Line(geometry, material);
          this.viewer.scene.add(this.tempLine);
        }
        
        // Double click to finish
        if (event.detail === 2) {
          this.finishPipeDrawing(points);
          this.viewer.container.removeEventListener('click', handleClick);
        }
      }
    };
    
    this.viewer.container.addEventListener('click', handleClick);
  }

  private finishPipeDrawing(points: THREE.Vector3[]) {
    if (!this.activeSystem || !this.layerManager || points.length < 2) return;
    
    // Create pipe segments
    for (let i = 0; i < points.length - 1; i++) {
      const segment: PipeSegment = {
        id: `pipe_${Date.now()}_${i}`,
        start: points[i],
        end: points[i + 1],
        diameter: 25,
        material: 'pe',
        flowRate: 0,
        pressure: 0
      };
      
      const geometry = new THREE.BufferGeometry().setFromPoints([
        segment.start,
        segment.end
      ]);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x0066cc, 
        linewidth: 3 
      });
      const mesh = new THREE.Line(geometry, material);
      
      segment.mesh = mesh;
      
      this.layerManager.addObject('Irrigation', mesh, {
        userData: {
          type: 'pipe',
          segment,
          systemId: this.activeSystem.id
        }
      });
    }
    
    // Clean up temp line
    if (this.tempLine) {
      this.viewer.scene.remove(this.tempLine);
      this.tempLine = null;
    }
  }

  private getSnappedPoint(point: THREE.Vector3): THREE.Vector3 {
    const gridSize = 0.5; // 50cm grid
    return new THREE.Vector3(
      Math.round(point.x / gridSize) * gridSize,
      point.y,
      Math.round(point.z / gridSize) * gridSize
    );
  }

  private autoLayoutSystem() {
    if (!this.activeSystem) return;
    
    // Analyze greenhouse layout
    const bounds = this.viewer.model.getBoundingBox();
    const width = bounds.max.x - bounds.min.x;
    const length = bounds.max.z - bounds.min.z;
    
    // Determine optimal layout based on system type
    switch (this.activeSystem.type) {
      case 'drip':
        this.generateOptimalDripLayout(bounds, width, length);
        break;
      case 'overhead':
        this.generateOptimalSprinklerLayout(bounds, width, length);
        break;
    }
    
    this.viewer.impl.sceneUpdated(true);
  }

  private generateOptimalDripLayout(bounds: any, width: number, length: number) {
    // Calculate optimal row spacing based on crop type
    const rowSpacing = 1.5; // meters
    const dripperSpacing = 0.3; // meters
    
    const numRows = Math.floor(width / rowSpacing);
    const actualSpacing = width / numRows;
    
    // Clear existing layout
    this.clearIrrigationObjects();
    
    // Create new optimized layout
    const center = bounds.center();
    for (let i = 0; i < numRows; i++) {
      const x = bounds.min.x + (i + 0.5) * actualSpacing;
      
      // Create drip line
      const points = [
        new THREE.Vector3(x, center.y, bounds.min.z),
        new THREE.Vector3(x, center.y, bounds.max.z)
      ];
      
      this.finishPipeDrawing(points);
      
      // Add drippers
      const numDrippers = Math.floor(length / dripperSpacing);
      for (let j = 0; j < numDrippers; j++) {
        const z = bounds.min.z + (j + 0.5) * dripperSpacing;
        this.placeComponent('dripper', new THREE.Vector3(x, center.y, z));
      }
    }
  }

  private generateOptimalSprinklerLayout(bounds: any, width: number, length: number) {
    const coverage = 3; // meter radius
    const overlap = 0.2; // 20% overlap
    const spacing = coverage * 2 * (1 - overlap);
    
    const numX = Math.ceil(width / spacing);
    const numZ = Math.ceil(length / spacing);
    
    // Clear existing
    this.clearIrrigationObjects();
    
    // Create grid layout
    for (let i = 0; i < numX; i++) {
      for (let j = 0; j < numZ; j++) {
        const x = bounds.min.x + (i + 0.5) * spacing;
        const z = bounds.min.z + (j + 0.5) * spacing;
        const y = bounds.max.y - 0.5; // Mount near ceiling
        
        this.placeComponent('sprinkler', new THREE.Vector3(x, y, z));
      }
    }
  }

  private runHydraulicAnalysis() {
    if (!this.activeSystem) return;
    
    // Perform hydraulic calculations
    const analysis = this.calculateHydraulics();
    
    // Display results
    const resultsDiv = this.panel.container.querySelector('#analysis-results');
    if (resultsDiv) {
      resultsDiv.classList.remove('hidden');
      
      const headLoss = this.panel.container.querySelector('#head-loss');
      if (headLoss) headLoss.textContent = analysis.totalHeadLoss.toFixed(2) + ' m';
      
      const criticalPath = this.panel.container.querySelector('#critical-path');
      if (criticalPath) criticalPath.textContent = analysis.criticalPath.join(' → ');
      
      const pumpReq = this.panel.container.querySelector('#pump-requirement');
      if (pumpReq) {
        const power = (analysis.totalHeadLoss * 9.81 * 100) / (0.7 * 1000); // kW
        pumpReq.textContent = power.toFixed(2) + ' kW';
      }
    }
    
    // Update recommendations
    this.updateRecommendations(analysis.recommendations);
    
    // Visualize pressure distribution
    this.visualizePressureDistribution(analysis.pressureMap);
  }

  private calculateHydraulics(): HydraulicAnalysis {
    // Hazen-Williams equation for pressure loss
    const C = 150; // Roughness coefficient for PE pipe
    
    let totalHeadLoss = 0;
    const pressureMap = new Map<string, number>();
    const flowMap = new Map<string, number>();
    
    // Calculate flow rates per zone
    this.activeSystem!.zones.forEach(zone => {
      flowMap.set(zone.id, zone.flowRate);
    });
    
    // Calculate pressure losses
    // Simplified calculation - in reality would use network analysis
    const pipeLength = 100; // meters total
    const flowRate = Array.from(flowMap.values()).reduce((a, b) => a + b, 0);
    const diameter = 50; // mm
    
    totalHeadLoss = 10.67 * Math.pow(flowRate / C, 1.852) * 
                    pipeLength / Math.pow(diameter, 4.87);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (totalHeadLoss > 20) {
      recommendations.push('Consider using larger diameter main lines');
    }
    
    if (flowRate > 200) {
      recommendations.push('Flow rate exceeds typical pump capacity - consider multiple zones');
    }
    
    return {
      totalHeadLoss,
      criticalPath: ['Source', 'Main', 'Zone 1'],
      pressureMap,
      flowDistribution: flowMap,
      recommendations
    };
  }

  private visualizePressureDistribution(pressureMap: Map<string, number>) {
    // Color code pipes based on pressure
    const minPressure = Math.min(...Array.from(pressureMap.values()));
    const maxPressure = Math.max(...Array.from(pressureMap.values()));
    
    this.activeSystem?.components.forEach((component, id) => {
      if (component.type === 'pipe' && component.mesh) {
        const pressure = pressureMap.get(id) || 0;
        const normalized = (pressure - minPressure) / (maxPressure - minPressure);
        
        // Green = good pressure, Red = low pressure
        const color = new THREE.Color();
        color.setHSL(normalized * 0.33, 1, 0.5);
        
        (component.mesh.material as THREE.LineBasicMaterial).color = color;
      }
    });
    
    this.viewer.impl.sceneUpdated(true);
  }

  private updateMonitorView() {
    // Update sensor readings
    const sensorGrid = this.panel.container.querySelector('#sensor-grid');
    if (!sensorGrid) return;
    
    sensorGrid.innerHTML = '';
    
    this.activeSystem?.components.forEach(component => {
      if (component.type === 'sensor') {
        const sensorDiv = document.createElement('div');
        sensorDiv.className = 'sensor-reading';
        sensorDiv.innerHTML = `
          <span class="sensor-name">${component.properties.sensorType}</span>
          <span class="sensor-value">${this.generateSensorReading(component)}</span>
        `;
        sensorGrid.appendChild(sensorDiv);
      }
    });
    
    // Update zone controls
    const zoneControls = this.panel.container.querySelector('#zone-controls');
    if (!zoneControls) return;
    
    zoneControls.innerHTML = '';
    
    this.activeSystem?.zones.forEach(zone => {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'zone-control';
      controlDiv.innerHTML = `
        <span class="zone-name">${zone.name}</span>
        <button class="btn btn-sm" onclick="toggleZone('${zone.id}')">
          ${zone.valves.some(v => true) ? 'Turn Off' : 'Turn On'}
        </button>
      `;
      zoneControls.appendChild(controlDiv);
    });
  }

  private generateSensorReading(sensor: IrrigationComponent): string {
    switch (sensor.properties.sensorType) {
      case 'moisture':
        return Math.round(20 + Math.random() * 60) + '%';
      case 'pressure':
        return (3 + Math.random() * 2).toFixed(1) + ' bar';
      case 'flow':
        return Math.round(10 + Math.random() * 90) + ' L/min';
      default:
        return 'N/A';
    }
  }

  private updateScheduleView() {
    // Create weekly schedule grid
    const scheduleDiv = this.panel.container.querySelector('#weekly-schedule');
    if (!scheduleDiv) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    let html = '<table class="schedule-table"><tr><th>Time</th>';
    days.forEach(day => html += `<th>${day}</th>`);
    html += '</tr>';
    
    hours.forEach(hour => {
      html += `<tr><td>${hour}:00</td>`;
      days.forEach((day, dayIndex) => {
        const hasEvent = this.hasScheduledEvent(dayIndex, hour);
        html += `<td class="schedule-cell ${hasEvent ? 'has-event' : ''}" 
                     data-day="${dayIndex}" data-hour="${hour}"></td>`;
      });
      html += '</tr>';
    });
    
    html += '</table>';
    scheduleDiv.innerHTML = html;
    
    // Update water budget
    this.updateWaterBudget();
  }

  private hasScheduledEvent(day: number, hour: number): boolean {
    if (!this.activeSystem) return false;
    
    return this.activeSystem.zones.some(zone => 
      zone.schedule.events.some(event => 
        event.daysOfWeek.includes(day) && 
        parseInt(event.startTime.split(':')[0]) === hour
      )
    );
  }

  private updateWaterBudget() {
    if (!this.activeSystem) return;
    
    let dailyUsage = 0;
    
    this.activeSystem.zones.forEach(zone => {
      zone.schedule.events.forEach(event => {
        if (event.active && event.type === 'irrigation') {
          const volume = event.volume || (zone.flowRate * event.duration);
          dailyUsage += volume / 7; // Average over week
        }
      });
    });
    
    const dailySpan = this.panel.container.querySelector('#daily-usage');
    const weeklySpan = this.panel.container.querySelector('#weekly-usage');
    const monthlySpan = this.panel.container.querySelector('#monthly-usage');
    
    if (dailySpan) dailySpan.textContent = dailyUsage.toFixed(0);
    if (weeklySpan) weeklySpan.textContent = (dailyUsage * 7).toFixed(0);
    if (monthlySpan) monthlySpan.textContent = (dailyUsage * 30).toFixed(0);
  }

  private updateAnalysisView() {
    // Calculate distribution uniformity
    if (!this.activeSystem) return;
    
    const emitters: THREE.Vector3[] = [];
    this.activeSystem.components.forEach(comp => {
      if (comp.type === 'emitter' || comp.type === 'sprinkler') {
        emitters.push(comp.position);
      }
    });
    
    if (emitters.length > 0) {
      const uniformity = this.calculateUniformity(emitters);
      
      const cuSpan = this.panel.container.querySelector('#cu-value');
      const duSpan = this.panel.container.querySelector('#du-value');
      const euSpan = this.panel.container.querySelector('#eu-value');
      
      if (cuSpan) cuSpan.textContent = (uniformity.cu * 100).toFixed(1) + '%';
      if (duSpan) duSpan.textContent = (uniformity.du * 100).toFixed(1) + '%';
      if (euSpan) euSpan.textContent = (uniformity.eu * 100).toFixed(1) + '%';
      
      // Create uniformity heatmap
      this.createUniformityHeatmap(emitters);
    }
  }

  private calculateUniformity(emitters: THREE.Vector3[]): { cu: number; du: number; eu: number } {
    // Simplified uniformity calculation
    // In reality, would calculate actual water distribution
    
    const cu = 0.85 + Math.random() * 0.1; // Christiansen Uniformity
    const du = 0.80 + Math.random() * 0.1; // Distribution Uniformity
    const eu = 0.90 + Math.random() * 0.05; // Emission Uniformity
    
    return { cu, du, eu };
  }

  private createUniformityHeatmap(emitters: THREE.Vector3[]) {
    const heatmapDiv = this.panel.container.querySelector('#uniformity-heatmap');
    if (!heatmapDiv) return;
    
    // Create simple canvas heatmap
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Generate heatmap data
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const uniformity = this.getPointUniformity(x, y, emitters, canvas);
        const color = this.uniformityToColor(uniformity);
        
        const index = (y * canvas.width + x) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    heatmapDiv.innerHTML = '';
    heatmapDiv.appendChild(canvas);
  }

  private getPointUniformity(x: number, y: number, emitters: THREE.Vector3[], canvas: HTMLCanvasElement): number {
    // Calculate water coverage at this point
    let totalCoverage = 0;
    
    emitters.forEach(emitter => {
      const distance = Math.sqrt(
        Math.pow(x - emitter.x * 10, 2) + 
        Math.pow(y - emitter.z * 10, 2)
      );
      
      if (distance < 30) { // 3m coverage radius
        totalCoverage += 1 - (distance / 30);
      }
    });
    
    return Math.min(totalCoverage, 1);
  }

  private uniformityToColor(uniformity: number): { r: number; g: number; b: number } {
    // Green = good coverage, Red = poor coverage
    const hue = uniformity * 120; // 0-120 degrees (red to green)
    const rgb = this.hslToRgb(hue / 360, 1, 0.5);
    
    return {
      r: Math.round(rgb[0] * 255),
      g: Math.round(rgb[1] * 255),
      b: Math.round(rgb[2] * 255)
    };
  }

  private hslToRgb(h: number, s: number, l: number): number[] {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [r, g, b];
  }

  private updateFertigationView() {
    // Update injector list
    const injectorList = this.panel.container.querySelector('#injector-list');
    if (!injectorList) return;
    
    injectorList.innerHTML = '';
    
    if (this.activeSystem?.fertigationConfig) {
      this.activeSystem.fertigationConfig.injectors.forEach(injector => {
        const injectorDiv = document.createElement('div');
        injectorDiv.className = 'injector-item';
        injectorDiv.innerHTML = `
          <h6>${injector.name}</h6>
          <p>Type: ${injector.type}</p>
          <p>Stock: ${injector.stockSolution.remaining}/${injector.stockSolution.volume}L</p>
          <p>Rate: ${injector.flowRate} mL/min</p>
        `;
        injectorList.appendChild(injectorDiv);
      });
    }
    
    // Update recipe selector
    const recipeSelect = this.panel.container.querySelector('#recipe-select') as HTMLSelectElement;
    if (!recipeSelect) return;
    
    recipeSelect.innerHTML = '<option value="">Select Recipe...</option>';
    
    const defaultRecipes: NutrientRecipe[] = [
      {
        id: 'tomato_veg',
        name: 'Tomato - Vegetative',
        cropType: 'tomato',
        growthStage: 'vegetative',
        targetEC: 2.0,
        targetPH: 6.0,
        nutrients: {
          nitrogen: 150,
          phosphorus: 50,
          potassium: 200,
          calcium: 150,
          magnesium: 50,
          sulfur: 60,
          iron: 2.5,
          micronutrients: {
            manganese: 0.5,
            zinc: 0.3,
            copper: 0.1,
            boron: 0.3,
            molybdenum: 0.05
          }
        }
      },
      {
        id: 'lettuce_general',
        name: 'Lettuce - General',
        cropType: 'lettuce',
        growthStage: 'vegetative',
        targetEC: 1.5,
        targetPH: 5.8,
        nutrients: {
          nitrogen: 100,
          phosphorus: 30,
          potassium: 150,
          calcium: 100,
          magnesium: 30,
          sulfur: 40,
          iron: 2.0,
          micronutrients: {
            manganese: 0.4,
            zinc: 0.2,
            copper: 0.05,
            boron: 0.2,
            molybdenum: 0.03
          }
        }
      }
    ];
    
    defaultRecipes.forEach(recipe => {
      const option = document.createElement('option');
      option.value = recipe.id;
      option.textContent = recipe.name;
      recipeSelect.appendChild(option);
    });
    
    // Set up nutrient calculator
    const calculateBtn = this.panel.container.querySelector('#calculate-nutrients-btn');
    calculateBtn?.addEventListener('click', () => {
      this.calculateNutrientRequirements();
    });
  }

  private calculateNutrientRequirements() {
    const targetEC = parseFloat((this.panel.container.querySelector('#target-ec') as HTMLInputElement)?.value || '2.0');
    const targetPH = parseFloat((this.panel.container.querySelector('#target-ph') as HTMLInputElement)?.value || '6.0');
    const waterVolume = parseFloat((this.panel.container.querySelector('#water-volume') as HTMLInputElement)?.value || '1000');
    
    // Calculate fertilizer amounts based on target EC
    const resultsDiv = this.panel.container.querySelector('#nutrient-results');
    if (!resultsDiv) return;
    
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = `
      <h6>Fertilizer Requirements for ${waterVolume}L</h6>
      <table class="nutrient-table">
        <tr>
          <td>Calcium Nitrate:</td>
          <td>${(waterVolume * 0.8 * targetEC).toFixed(1)}g</td>
        </tr>
        <tr>
          <td>Potassium Nitrate:</td>
          <td>${(waterVolume * 0.3 * targetEC).toFixed(1)}g</td>
        </tr>
        <tr>
          <td>Monopotassium Phosphate:</td>
          <td>${(waterVolume * 0.2 * targetEC).toFixed(1)}g</td>
        </tr>
        <tr>
          <td>Magnesium Sulfate:</td>
          <td>${(waterVolume * 0.4 * targetEC).toFixed(1)}g</td>
        </tr>
        <tr>
          <td>Micronutrient Mix:</td>
          <td>${(waterVolume * 0.05 * targetEC).toFixed(1)}g</td>
        </tr>
      </table>
      <p class="ph-adjustment">
        pH Adjustment: ${targetPH < 6.5 ? 'Add phosphoric acid' : 'Add potassium hydroxide'}
      </p>
    `;
  }

  private showAddEventDialog() {
    // Create modal dialog for adding irrigation events
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
      <div class="modal-content">
        <h4>Add Irrigation Event</h4>
        <form id="event-form">
          <label>Zone:</label>
          <select id="event-zone">
            ${this.activeSystem?.zones.map(z => 
              `<option value="${z.id}">${z.name}</option>`
            ).join('')}
          </select>
          
          <label>Start Time:</label>
          <input type="time" id="event-time" required>
          
          <label>Duration (minutes):</label>
          <input type="number" id="event-duration" min="1" max="120" value="15">
          
          <label>Days:</label>
          <div class="day-selector">
            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => 
              `<label><input type="checkbox" value="${i}"> ${day}</label>`
            ).join('')}
          </div>
          
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">Add Event</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-dialog').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const form = dialog.querySelector('#event-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addScheduleEvent(form);
      dialog.remove();
    });
  }

  private addScheduleEvent(form: HTMLFormElement) {
    if (!this.activeSystem) return;
    
    const zoneId = (form.querySelector('#event-zone') as HTMLSelectElement).value;
    const zone = this.activeSystem.zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    const time = (form.querySelector('#event-time') as HTMLInputElement).value;
    const duration = parseInt((form.querySelector('#event-duration') as HTMLInputElement).value);
    
    const days: number[] = [];
    form.querySelectorAll('.day-selector input:checked').forEach((checkbox) => {
      days.push(parseInt((checkbox as HTMLInputElement).value));
    });
    
    const event: ScheduleEvent = {
      id: `event_${Date.now()}`,
      type: 'irrigation',
      startTime: time,
      duration,
      daysOfWeek: days,
      active: true
    };
    
    zone.schedule.events.push(event);
    this.updateScheduleView();
  }

  private updateZoneList() {
    const zoneList = this.panel.container.querySelector('#zone-list');
    if (!zoneList || !this.activeSystem) return;
    
    zoneList.innerHTML = '';
    
    this.activeSystem.zones.forEach(zone => {
      const zoneDiv = document.createElement('div');
      zoneDiv.className = 'zone-item';
      zoneDiv.innerHTML = `
        <h5>${zone.name}</h5>
        <p>Area: ${zone.area}m² | Flow: ${zone.flowRate} L/min</p>
        <p>Type: ${zone.irrigationType}</p>
      `;
      zoneList.appendChild(zoneDiv);
    });
  }

  private updateRecommendations(recommendations: string[]) {
    const recList = this.panel.container.querySelector('#recommendation-list');
    if (!recList) return;
    
    recList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
  }

  private exportIrrigationDesign() {
    if (!this.activeSystem) return;
    
    const exportData = {
      system: {
        type: this.activeSystem.type,
        name: this.activeSystem.name,
        waterSource: this.activeSystem.waterSource
      },
      components: Array.from(this.activeSystem.components.values()).map(comp => ({
        id: comp.id,
        type: comp.type,
        position: comp.position,
        properties: comp.properties
      })),
      zones: this.activeSystem.zones,
      fertigation: this.activeSystem.fertigationConfig,
      analysis: this.calculateHydraulics()
    };
    
    // Generate BOM
    const bom = this.generateBillOfMaterials();
    
    // Create download
    const blob = new Blob([JSON.stringify({ design: exportData, bom }, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irrigation_design_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generateBillOfMaterials(): any[] {
    const bom: any[] = [];
    const componentCounts = new Map<string, number>();
    
    this.activeSystem?.components.forEach(comp => {
      const key = `${comp.type}_${JSON.stringify(comp.properties)}`;
      componentCounts.set(key, (componentCounts.get(key) || 0) + 1);
    });
    
    componentCounts.forEach((count, key) => {
      const [type, propsStr] = key.split('_');
      bom.push({
        type,
        quantity: count,
        unitPrice: this.getComponentPrice(type),
        totalPrice: count * this.getComponentPrice(type)
      });
    });
    
    return bom;
  }

  private getComponentPrice(type: string): number {
    const prices: { [key: string]: number } = {
      pipe: 2.5, // per meter
      valve: 45,
      dripper: 0.5,
      sprinkler: 12,
      sensor: 85,
      pump: 450,
      filter: 120,
      tank: 800
    };
    
    return prices[type] || 10;
  }

  private onSelectionChanged(event: any) {
    const dbIds = event.dbIdArray;
    if (dbIds.length === 0) return;
    
    // Check if selected object is an irrigation component
    const dbId = dbIds[0];
    this.viewer.getProperties(dbId, (props: any) => {
      if (props.properties.some((p: any) => p.displayName === 'systemId')) {
        // Show component properties
        console.log('Selected irrigation component:', props);
      }
    });
  }

  private showComponentPreview(type: string, position: THREE.Vector3) {
    // Show ghost preview of component at cursor position
    // Implementation depends on specific requirements
  }

  private clearIrrigationObjects() {
    if (!this.layerManager) return;
    
    // Remove all objects from irrigation layer
    const layer = this.layerManager.getLayer('Irrigation');
    if (layer && layer.visible) {
      // Clear layer objects
      this.viewer.impl.scene.traverse((child: any) => {
        if (child.userData && child.userData.systemId === this.activeSystem?.id) {
          this.viewer.impl.scene.remove(child);
        }
      });
    }
  }

  private cleanupVisualizations() {
    this.clearIrrigationObjects();
    this.systems.clear();
    this.activeSystem = null;
  }

  private addStyles() {
    const styles = `
      .irrigation-system-panel {
        font-family: Arial, sans-serif;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .panel-header {
        padding: 10px;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
      }

      .panel-header h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }

      .view-tabs {
        display: flex;
        gap: 5px;
      }

      .tab-btn {
        padding: 5px 10px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-size: 12px;
        border-radius: 3px;
      }

      .tab-btn.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .view-content {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
      }

      .view-content.hidden {
        display: none;
      }

      .system-selector {
        margin-bottom: 20px;
      }

      .system-selector label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }

      .system-selector select {
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
      }

      .component-library {
        margin-bottom: 20px;
      }

      .component-library h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
      }

      .component-categories {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .category h5 {
        margin: 0 0 5px 0;
        font-size: 12px;
        color: #666;
      }

      .component-btn {
        padding: 5px 10px;
        margin: 2px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-size: 11px;
        border-radius: 3px;
      }

      .component-btn:hover {
        background: #f0f0f0;
      }

      .drawing-tools {
        margin-bottom: 20px;
      }

      .tool-btn {
        display: block;
        width: 100%;
        padding: 8px;
        margin: 5px 0;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        border-radius: 3px;
      }

      .tool-btn:hover {
        background: #f0f0f0;
      }

      .zone-manager {
        margin-bottom: 20px;
      }

      .zone-item {
        padding: 10px;
        margin: 5px 0;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .zone-item h5 {
        margin: 0 0 5px 0;
        font-size: 13px;
      }

      .zone-item p {
        margin: 2px 0;
        font-size: 11px;
        color: #666;
      }

      .schedule-controls {
        padding: 10px 0;
      }

      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }

      .schedule-table th,
      .schedule-table td {
        padding: 4px;
        border: 1px solid #ddd;
        text-align: center;
      }

      .schedule-cell {
        cursor: pointer;
        height: 20px;
      }

      .schedule-cell:hover {
        background: #f0f0f0;
      }

      .schedule-cell.has-event {
        background: #007bff;
      }

      .water-budget {
        margin-top: 20px;
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .budget-display p {
        margin: 5px 0;
        font-size: 12px;
      }

      .status-indicators {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 10px 0;
      }

      .status-item {
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .status-label {
        display: block;
        font-size: 11px;
        color: #666;
      }

      .status-value {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .sensor-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin: 10px 0;
      }

      .sensor-reading {
        padding: 10px;
        background: #f0f0f0;
        border-radius: 3px;
        text-align: center;
      }

      .sensor-name {
        display: block;
        font-size: 11px;
        color: #666;
      }

      .sensor-value {
        display: block;
        font-size: 14px;
        font-weight: bold;
      }

      .zone-control {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin: 5px 0;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .hydraulic-analysis,
      .uniformity-analysis,
      .recommendations {
        margin-bottom: 20px;
      }

      .result-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        font-size: 12px;
      }

      .uniformity-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 10px 0;
      }

      .metric {
        text-align: center;
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .metric label {
        display: block;
        font-size: 11px;
        color: #666;
      }

      .metric span {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }

      #uniformity-heatmap {
        margin: 10px 0;
        text-align: center;
      }

      #uniformity-heatmap canvas {
        max-width: 100%;
        border: 1px solid #ddd;
      }

      .fertigation-setup {
        padding: 10px 0;
      }

      .injector-item {
        padding: 10px;
        margin: 5px 0;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .injector-item h6 {
        margin: 0 0 5px 0;
        font-size: 13px;
      }

      .injector-item p {
        margin: 2px 0;
        font-size: 11px;
        color: #666;
      }

      .nutrient-calculator {
        margin: 20px 0;
        padding: 15px;
        background: #f0f0f0;
        border-radius: 3px;
      }

      .calc-inputs label {
        display: block;
        margin: 10px 0 5px 0;
        font-size: 12px;
      }

      .calc-inputs input {
        width: 100%;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
      }

      .nutrient-table {
        width: 100%;
        margin: 10px 0;
        font-size: 12px;
      }

      .nutrient-table td {
        padding: 5px;
        border-bottom: 1px solid #eee;
      }

      .ph-adjustment {
        margin: 10px 0;
        padding: 10px;
        background: #fff3cd;
        border-radius: 3px;
        font-size: 12px;
      }

      .modal-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      .modal-content {
        background: white;
        padding: 20px;
        border-radius: 5px;
        max-width: 400px;
        width: 90%;
      }

      .modal-content h4 {
        margin: 0 0 15px 0;
      }

      .modal-content label {
        display: block;
        margin: 10px 0 5px 0;
        font-size: 12px;
      }

      .modal-content input,
      .modal-content select {
        width: 100%;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
      }

      .day-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 10px 0;
      }

      .day-selector label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
      }

      .modal-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }

      .btn-sm {
        padding: 4px 8px;
        font-size: 11px;
      }

      .panel-footer {
        padding: 10px;
        background: #f5f5f5;
        border-top: 1px solid #ddd;
        display: flex;
        gap: 10px;
      }

      .component-label {
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        pointer-events: none;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

// Register the extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.IrrigationSystem', IrrigationSystemExtension);

export default IrrigationSystemExtension;