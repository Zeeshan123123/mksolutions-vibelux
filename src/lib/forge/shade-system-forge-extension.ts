/**
 * VibeLux Shade System 3D Extension
 * Provides comprehensive shade screen, energy curtain, and light control systems
 */

interface ShadeSystem {
  id: string;
  name: string;
  type: 'retractable' | 'fixed' | 'rolling' | 'folding';
  configuration: 'horizontal' | 'vertical' | 'gable' | 'slope';
  zones: ShadeZone[];
  controls: ShadeControl;
  materials: ShadeMaterial[];
  automation: ShadeAutomation;
}

interface ShadeZone {
  id: string;
  name: string;
  area: number; // m²
  screens: ShadeScreen[];
  position: {
    start: THREE.Vector3;
    end: THREE.Vector3;
    height: number;
  };
  orientation: 'north' | 'south' | 'east' | 'west' | 'horizontal';
  groupId?: string; // For synchronized control
}

interface ShadeScreen {
  id: string;
  type: 'shade' | 'energy' | 'blackout' | 'insect' | 'combination';
  material: ShadeMaterial;
  position: number; // 0-100% deployed
  status: 'retracted' | 'deployed' | 'moving' | 'error';
  motor: ScreenMotor;
  dimensions: {
    width: number;
    length: number;
    thickness: number;
  };
  mesh?: THREE.Mesh;
}

interface ShadeMaterial {
  id: string;
  name: string;
  type: 'aluminum' | 'polyester' | 'polyethylene' | 'acrylic' | 'composite';
  properties: {
    shading: number; // % light reduction
    energySaving: number; // % energy saved
    diffusion: number; // % light diffusion
    ventilation: number; // % open area for airflow
    uvBlocking: number; // % UV blocked
    durability: number; // years expected life
  };
  color: string;
  pattern: 'solid' | 'stripe' | 'mesh' | 'aluminized';
  fireRating?: string;
  warranty: number; // years
}

interface ScreenMotor {
  id: string;
  type: 'rack-pinion' | 'cable-drum' | 'tubular' | 'chain-drive';
  power: number; // watts
  torque: number; // Nm
  speed: number; // m/min
  position: number; // 0-100%
  encoder: boolean;
  limitSwitches: {
    top: boolean;
    bottom: boolean;
  };
  emergency: {
    manualOverride: boolean;
    batteryBackup: boolean;
  };
}

interface ShadeControl {
  type: 'manual' | 'automated' | 'hybrid';
  interface: 'buttons' | 'touchscreen' | 'mobile' | 'computer';
  zones: ControlZone[];
  sensors: ShadeSensor[];
  weatherStation?: WeatherStation;
}

interface ControlZone {
  id: string;
  name: string;
  screens: string[]; // Screen IDs
  schedule: ScreenSchedule;
  overrides: Override[];
}

interface ScreenSchedule {
  events: ScheduleEvent[];
  mode: 'time' | 'solar' | 'temperature' | 'light' | 'weather';
  constraints: {
    minInterval: number; // minutes between movements
    maxMovements: number; // per day
    windSpeedLimit: number; // m/s
    rainClose: boolean;
    snowClose: boolean;
  };
}

interface ScheduleEvent {
  id: string;
  time?: string; // HH:MM
  solarAngle?: number; // degrees
  temperature?: number; // °C
  lightLevel?: number; // W/m²
  position: number; // 0-100%
  priority: number;
  active: boolean;
}

interface Override {
  id: string;
  type: 'manual' | 'weather' | 'emergency' | 'maintenance';
  active: boolean;
  position?: number;
  duration?: number; // minutes
  reason: string;
}

interface ShadeSensor {
  id: string;
  type: 'light' | 'temperature' | 'wind' | 'rain' | 'snow' | 'position';
  location: THREE.Vector3;
  reading: number;
  unit: string;
  status: 'active' | 'error' | 'offline';
}

interface WeatherStation {
  id: string;
  sensors: {
    solarRadiation: number; // W/m²
    temperature: number; // °C
    windSpeed: number; // m/s
    windDirection: number; // degrees
    rainfall: number; // mm/hr
    humidity: number; // %
  };
  location: THREE.Vector3;
}

interface ShadeAutomation {
  strategies: AutomationStrategy[];
  integration: {
    climate: boolean;
    irrigation: boolean;
    lighting: boolean;
    hvac: boolean;
  };
  alerts: Alert[];
}

interface AutomationStrategy {
  id: string;
  name: string;
  type: 'energy-saving' | 'crop-protection' | 'light-control' | 'temperature-control';
  active: boolean;
  conditions: Condition[];
  actions: Action[];
  priority: number;
}

interface Condition {
  parameter: string;
  operator: 'gt' | 'lt' | 'eq' | 'between';
  value: number | [number, number];
  duration?: number; // minutes condition must be true
}

interface Action {
  type: 'deploy' | 'retract' | 'position' | 'alert';
  target: string[]; // Zone or screen IDs
  value?: number; // Position 0-100%
  delay?: number; // minutes
}

interface Alert {
  id: string;
  type: 'maintenance' | 'malfunction' | 'weather' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface LightAnalysis {
  zone: string;
  dailyLightIntegral: number; // mol/m²/day
  parLevel: number; // μmol/m²/s
  shadeHours: number;
  energySavings: number; // kWh
  temperatureReduction: number; // °C
}

class ShadeSystemExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel;
  private systems: Map<string, ShadeSystem> = new Map();
  private activeSystem: ShadeSystem | null = null;
  private layerManager: any;
  private animationFrameId: number | null = null;
  private currentView: 'design' | 'control' | 'schedule' | 'analysis' | 'maintenance' = 'design';
  private screenLibrary: Map<string, ShadeMaterial> = new Map();

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any) {
    super(viewer, options);
    this.initializeScreenLibrary();
  }

  load() {
    console.log('VibeLux Shade System Extension loaded');
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
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    console.log('VibeLux Shade System Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: any) {
    this.layerManager = layerManager;
  }

  private initializeScreenLibrary() {
    // Shade screens
    this.screenLibrary.set('shade_50', {
      id: 'shade_50',
      name: 'OLS 50 - Light Shade Screen',
      type: 'polyester',
      properties: {
        shading: 50,
        energySaving: 25,
        diffusion: 85,
        ventilation: 25,
        uvBlocking: 95,
        durability: 10
      },
      color: 'white',
      pattern: 'stripe',
      fireRating: 'Class A',
      warranty: 5
    });

    this.screenLibrary.set('shade_70', {
      id: 'shade_70',
      name: 'OLS 70 - Heavy Shade Screen',
      type: 'polyester',
      properties: {
        shading: 70,
        energySaving: 35,
        diffusion: 90,
        ventilation: 20,
        uvBlocking: 98,
        durability: 10
      },
      color: 'white',
      pattern: 'stripe',
      warranty: 5
    });

    // Energy screens
    this.screenLibrary.set('energy_clear', {
      id: 'energy_clear',
      name: 'Luxous 1147 FR - Clear Energy Screen',
      type: 'composite',
      properties: {
        shading: 15,
        energySaving: 47,
        diffusion: 75,
        ventilation: 15,
        uvBlocking: 85,
        durability: 15
      },
      color: 'transparent',
      pattern: 'solid',
      fireRating: 'Class A',
      warranty: 7
    });

    this.screenLibrary.set('energy_aluminum', {
      id: 'energy_aluminum',
      name: 'Luxous 1347 FR - Aluminum Energy Screen',
      type: 'aluminum',
      properties: {
        shading: 35,
        energySaving: 67,
        diffusion: 0,
        ventilation: 0,
        uvBlocking: 100,
        durability: 15
      },
      color: 'silver',
      pattern: 'aluminized',
      fireRating: 'Class A',
      warranty: 7
    });

    // Blackout screens
    this.screenLibrary.set('blackout_100', {
      id: 'blackout_100',
      name: 'Obscura 9950 FR W - Total Blackout',
      type: 'composite',
      properties: {
        shading: 100,
        energySaving: 50,
        diffusion: 0,
        ventilation: 0,
        uvBlocking: 100,
        durability: 12
      },
      color: 'white/black',
      pattern: 'solid',
      fireRating: 'Class A',
      warranty: 5
    });

    // Insect screens
    this.screenLibrary.set('insect_mesh', {
      id: 'insect_mesh',
      name: 'Econet 1515 - Insect Screen',
      type: 'polyethylene',
      properties: {
        shading: 15,
        energySaving: 5,
        diffusion: 20,
        ventilation: 70,
        uvBlocking: 30,
        durability: 8
      },
      color: 'transparent',
      pattern: 'mesh',
      warranty: 3
    });
  }

  private createUI() {
    const panelDiv = document.createElement('div');
    panelDiv.innerHTML = `
      <div class="shade-system-panel">
        <div class="panel-header">
          <h3>Shade System Designer</h3>
          <div class="view-tabs">
            <button class="tab-btn active" data-view="design">Design</button>
            <button class="tab-btn" data-view="control">Control</button>
            <button class="tab-btn" data-view="schedule">Schedule</button>
            <button class="tab-btn" data-view="analysis">Analysis</button>
            <button class="tab-btn" data-view="maintenance">Maintenance</button>
          </div>
        </div>

        <!-- Design View -->
        <div class="view-content" id="design-view">
          <div class="system-selector">
            <label>Shade System Configuration:</label>
            <select id="system-config-select">
              <option value="">Select Configuration...</option>
              <option value="horizontal">Horizontal (Roof)</option>
              <option value="vertical">Vertical (Side Wall)</option>
              <option value="gable">Gable End</option>
              <option value="slope">Sloped Roof</option>
            </select>
            <button id="new-shade-system-btn" class="btn btn-primary">Create System</button>
          </div>

          <div class="screen-selector">
            <h4>Screen Types</h4>
            <div class="screen-categories">
              <div class="category">
                <h5>Shade Screens</h5>
                <button class="screen-btn" data-screen="shade_50">50% Shade</button>
                <button class="screen-btn" data-screen="shade_70">70% Shade</button>
                <button class="screen-btn" data-screen="custom_shade">Custom %</button>
              </div>
              <div class="category">
                <h5>Energy Screens</h5>
                <button class="screen-btn" data-screen="energy_clear">Clear Energy</button>
                <button class="screen-btn" data-screen="energy_aluminum">Aluminum Energy</button>
              </div>
              <div class="category">
                <h5>Special Purpose</h5>
                <button class="screen-btn" data-screen="blackout_100">Blackout</button>
                <button class="screen-btn" data-screen="insect_mesh">Insect Mesh</button>
              </div>
            </div>
          </div>

          <div class="zone-designer">
            <h4>Shade Zones</h4>
            <div id="zone-list"></div>
            <button id="add-zone-btn" class="btn btn-secondary">Add Zone</button>
            <button id="auto-zone-btn" class="btn btn-secondary">Auto Generate Zones</button>
          </div>

          <div class="motor-config">
            <h4>Motor Configuration</h4>
            <label>Drive System:</label>
            <select id="motor-type-select">
              <option value="rack-pinion">Rack & Pinion</option>
              <option value="cable-drum">Cable & Drum</option>
              <option value="tubular">Tubular Motor</option>
              <option value="chain-drive">Chain Drive</option>
            </select>
            <div class="motor-specs">
              <p>Power: <span id="motor-power">-</span> W</p>
              <p>Speed: <span id="motor-speed">-</span> m/min</p>
              <p>Max Load: <span id="motor-load">-</span> kg</p>
            </div>
          </div>
        </div>

        <!-- Control View -->
        <div class="view-content hidden" id="control-view">
          <div class="control-interface">
            <h4>Screen Control</h4>
            <div class="control-mode">
              <label>Control Mode:</label>
              <select id="control-mode-select">
                <option value="manual">Manual</option>
                <option value="auto">Automatic</option>
                <option value="schedule">Schedule</option>
              </select>
            </div>

            <div class="zone-controls">
              <div id="zone-control-list"></div>
            </div>

            <div class="group-controls">
              <h5>Group Control</h5>
              <button id="all-open-btn" class="btn btn-success">All Open</button>
              <button id="all-close-btn" class="btn btn-danger">All Close</button>
              <button id="all-stop-btn" class="btn btn-warning">Emergency Stop</button>
            </div>

            <div class="position-presets">
              <h5>Position Presets</h5>
              <div class="preset-buttons">
                <button class="preset-btn" data-position="0">Fully Open</button>
                <button class="preset-btn" data-position="25">25%</button>
                <button class="preset-btn" data-position="50">50%</button>
                <button class="preset-btn" data-position="75">75%</button>
                <button class="preset-btn" data-position="100">Fully Closed</button>
              </div>
            </div>
          </div>

          <div class="sensor-status">
            <h4>Environmental Sensors</h4>
            <div class="sensor-grid">
              <div class="sensor-item">
                <span class="sensor-label">Solar Radiation:</span>
                <span class="sensor-value" id="solar-radiation">0 W/m²</span>
              </div>
              <div class="sensor-item">
                <span class="sensor-label">Temperature:</span>
                <span class="sensor-value" id="temperature">0°C</span>
              </div>
              <div class="sensor-item">
                <span class="sensor-label">Wind Speed:</span>
                <span class="sensor-value" id="wind-speed">0 m/s</span>
              </div>
              <div class="sensor-item">
                <span class="sensor-label">Rain:</span>
                <span class="sensor-value" id="rain-status">No</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule View -->
        <div class="view-content hidden" id="schedule-view">
          <div class="schedule-manager">
            <h4>Shade Schedule</h4>
            <div class="schedule-type">
              <label>Schedule Type:</label>
              <select id="schedule-type-select">
                <option value="time">Time-Based</option>
                <option value="solar">Solar Angle</option>
                <option value="temperature">Temperature</option>
                <option value="light">Light Level</option>
                <option value="weather">Weather Reactive</option>
              </select>
            </div>

            <div class="schedule-calendar" id="schedule-calendar">
              <!-- Dynamic calendar content -->
            </div>

            <div class="schedule-events">
              <h5>Scheduled Events</h5>
              <div id="event-list"></div>
              <button id="add-event-btn" class="btn btn-primary">Add Event</button>
            </div>

            <div class="automation-rules">
              <h5>Automation Rules</h5>
              <div id="rule-list"></div>
              <button id="add-rule-btn" class="btn btn-secondary">Add Rule</button>
            </div>
          </div>
        </div>

        <!-- Analysis View -->
        <div class="view-content hidden" id="analysis-view">
          <div class="light-analysis">
            <h4>Light Analysis</h4>
            <button id="run-light-analysis-btn" class="btn btn-primary">Run Analysis</button>
            <div id="light-results" class="hidden">
              <div class="analysis-metric">
                <label>Average DLI:</label>
                <span id="avg-dli">0 mol/m²/day</span>
              </div>
              <div class="analysis-metric">
                <label>PAR Reduction:</label>
                <span id="par-reduction">0%</span>
              </div>
              <div class="analysis-metric">
                <label>Shade Hours/Day:</label>
                <span id="shade-hours">0 hrs</span>
              </div>
            </div>
            <div id="light-heatmap"></div>
          </div>

          <div class="energy-analysis">
            <h4>Energy Savings</h4>
            <div class="energy-metrics">
              <div class="metric">
                <label>Cooling Load Reduction:</label>
                <span id="cooling-reduction">0%</span>
              </div>
              <div class="metric">
                <label>Heating Retention:</label>
                <span id="heating-retention">0%</span>
              </div>
              <div class="metric">
                <label>Annual Savings:</label>
                <span id="annual-savings">$0</span>
              </div>
            </div>
            <canvas id="energy-chart"></canvas>
          </div>

          <div class="crop-impact">
            <h4>Crop Impact Analysis</h4>
            <select id="crop-select">
              <option value="">Select Crop...</option>
              <option value="tomato">Tomato</option>
              <option value="cucumber">Cucumber</option>
              <option value="lettuce">Lettuce</option>
              <option value="pepper">Pepper</option>
              <option value="strawberry">Strawberry</option>
            </select>
            <div id="crop-recommendations" class="hidden"></div>
          </div>
        </div>

        <!-- Maintenance View -->
        <div class="view-content hidden" id="maintenance-view">
          <div class="system-health">
            <h4>System Health</h4>
            <div class="health-overview">
              <div class="health-indicator">
                <span class="indicator-label">Overall Status:</span>
                <span class="indicator-value" id="overall-status">Good</span>
              </div>
              <div class="health-indicator">
                <span class="indicator-label">Last Maintenance:</span>
                <span class="indicator-value" id="last-maintenance">30 days ago</span>
              </div>
              <div class="health-indicator">
                <span class="indicator-label">Next Service:</span>
                <span class="indicator-value" id="next-service">60 days</span>
              </div>
            </div>
          </div>

          <div class="motor-diagnostics">
            <h4>Motor Diagnostics</h4>
            <div id="motor-status-list"></div>
          </div>

          <div class="maintenance-log">
            <h4>Maintenance History</h4>
            <div id="maintenance-history"></div>
            <button id="log-maintenance-btn" class="btn btn-secondary">Log Maintenance</button>
          </div>

          <div class="alerts-section">
            <h4>Active Alerts</h4>
            <div id="alert-list"></div>
          </div>
        </div>

        <div class="panel-footer">
          <button id="export-shade-btn" class="btn btn-primary">Export Design</button>
          <button id="generate-specs-btn" class="btn btn-secondary">Generate Specs</button>
          <button id="simulate-btn" class="btn btn-secondary">Simulate Movement</button>
        </div>
      </div>
    `;

    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'shade-system-panel',
      'Shade System',
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
    
    const button = new Autodesk.Viewing.UI.Button('shade-system-button');
    button.setIcon('icon-settings');
    button.setToolTip('Shade System');
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

    // System configuration
    const configSelect = this.panel.container.querySelector('#system-config-select') as HTMLSelectElement;
    configSelect?.addEventListener('change', (e) => {
      const config = (e.target as HTMLSelectElement).value;
      if (config) {
        this.updateMotorSpecs(config);
      }
    });

    const newSystemBtn = this.panel.container.querySelector('#new-shade-system-btn');
    newSystemBtn?.addEventListener('click', () => {
      const config = configSelect?.value;
      if (config) {
        this.createNewSystem(config as any);
      }
    });

    // Screen selection
    const screenButtons = this.panel.container.querySelectorAll('.screen-btn');
    screenButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screen = (e.target as HTMLElement).dataset.screen;
        if (screen) {
          this.selectScreenType(screen);
        }
      });
    });

    // Zone management
    const addZoneBtn = this.panel.container.querySelector('#add-zone-btn');
    addZoneBtn?.addEventListener('click', () => {
      this.showAddZoneDialog();
    });

    const autoZoneBtn = this.panel.container.querySelector('#auto-zone-btn');
    autoZoneBtn?.addEventListener('click', () => {
      this.autoGenerateZones();
    });

    // Control buttons
    const allOpenBtn = this.panel.container.querySelector('#all-open-btn');
    allOpenBtn?.addEventListener('click', () => {
      this.controlAllScreens(0);
    });

    const allCloseBtn = this.panel.container.querySelector('#all-close-btn');
    allCloseBtn?.addEventListener('click', () => {
      this.controlAllScreens(100);
    });

    const allStopBtn = this.panel.container.querySelector('#all-stop-btn');
    allStopBtn?.addEventListener('click', () => {
      this.emergencyStop();
    });

    // Preset buttons
    const presetButtons = this.panel.container.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const position = parseInt((e.target as HTMLElement).dataset.position || '0');
        this.setAllScreensPosition(position);
      });
    });

    // Schedule events
    const addEventBtn = this.panel.container.querySelector('#add-event-btn');
    addEventBtn?.addEventListener('click', () => {
      this.showAddEventDialog();
    });

    const addRuleBtn = this.panel.container.querySelector('#add-rule-btn');
    addRuleBtn?.addEventListener('click', () => {
      this.showAddRuleDialog();
    });

    // Analysis
    const runAnalysisBtn = this.panel.container.querySelector('#run-light-analysis-btn');
    runAnalysisBtn?.addEventListener('click', () => {
      this.runLightAnalysis();
    });

    const cropSelect = this.panel.container.querySelector('#crop-select') as HTMLSelectElement;
    cropSelect?.addEventListener('change', (e) => {
      const crop = (e.target as HTMLSelectElement).value;
      if (crop) {
        this.analyzeCropImpact(crop);
      }
    });

    // Export and simulate
    const exportBtn = this.panel.container.querySelector('#export-shade-btn');
    exportBtn?.addEventListener('click', () => {
      this.exportShadeDesign();
    });

    const simulateBtn = this.panel.container.querySelector('#simulate-btn');
    simulateBtn?.addEventListener('click', () => {
      this.startSimulation();
    });

    // Viewer events
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, 
      this.onSelectionChanged.bind(this));
  }

  private switchView(view: 'design' | 'control' | 'schedule' | 'analysis' | 'maintenance') {
    this.currentView = view;
    
    // Hide all views
    const views = this.panel.container.querySelectorAll('.view-content');
    views.forEach(v => v.classList.add('hidden'));
    
    // Show selected view
    const selectedView = this.panel.container.querySelector(`#${view}-view`);
    selectedView?.classList.remove('hidden');
    
    // Update view-specific content
    switch (view) {
      case 'control':
        this.updateControlView();
        break;
      case 'schedule':
        this.updateScheduleView();
        break;
      case 'analysis':
        this.updateAnalysisView();
        break;
      case 'maintenance':
        this.updateMaintenanceView();
        break;
    }
  }

  private createNewSystem(configuration: string) {
    const system: ShadeSystem = {
      id: `shade_${Date.now()}`,
      name: `${configuration.charAt(0).toUpperCase() + configuration.slice(1)} Shade System`,
      type: 'retractable',
      configuration: configuration as any,
      zones: [],
      controls: {
        type: 'automated',
        interface: 'touchscreen',
        zones: [],
        sensors: []
      },
      materials: [],
      automation: {
        strategies: [],
        integration: {
          climate: true,
          irrigation: false,
          lighting: true,
          hvac: true
        },
        alerts: []
      }
    };

    this.systems.set(system.id, system);
    this.activeSystem = system;
    
    // Create visual representation
    this.createSystemVisualization(configuration);
    this.updateZoneList();
  }

  private createSystemVisualization(configuration: string) {
    if (!this.layerManager) return;

    const bounds = this.viewer.model.getBoundingBox();
    const center = bounds.center();
    
    switch (configuration) {
      case 'horizontal':
        this.createHorizontalShadeSystem(bounds);
        break;
      case 'vertical':
        this.createVerticalShadeSystem(bounds);
        break;
      case 'gable':
        this.createGableShadeSystem(bounds);
        break;
      case 'slope':
        this.createSlopedShadeSystem(bounds);
        break;
    }
  }

  private createHorizontalShadeSystem(bounds: any) {
    const width = bounds.max.x - bounds.min.x;
    const length = bounds.max.z - bounds.min.z;
    const height = bounds.max.y - 0.5; // Mount below roof
    
    // Create shade zones
    const numZones = Math.ceil(length / 10); // 10m zones
    
    for (let i = 0; i < numZones; i++) {
      const zoneStart = bounds.min.z + (i * length / numZones);
      const zoneEnd = bounds.min.z + ((i + 1) * length / numZones);
      
      const zone: ShadeZone = {
        id: `zone_${i}`,
        name: `Zone ${i + 1}`,
        area: width * (zoneEnd - zoneStart),
        screens: [],
        position: {
          start: new THREE.Vector3(bounds.min.x, height, zoneStart),
          end: new THREE.Vector3(bounds.max.x, height, zoneEnd),
          height: height
        },
        orientation: 'horizontal'
      };
      
      // Create screen mesh
      const screenGeom = new THREE.PlaneGeometry(width, zoneEnd - zoneStart);
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const screenMesh = new THREE.Mesh(screenGeom, screenMat);
      screenMesh.position.set(
        (bounds.min.x + bounds.max.x) / 2,
        height,
        (zoneStart + zoneEnd) / 2
      );
      screenMesh.rotation.x = -Math.PI / 2;
      
      // Create screen object
      const screen: ShadeScreen = {
        id: `screen_${i}`,
        type: 'shade',
        material: this.screenLibrary.get('shade_50')!,
        position: 0,
        status: 'retracted',
        motor: {
          id: `motor_${i}`,
          type: 'rack-pinion',
          power: 750,
          torque: 50,
          speed: 3,
          position: 0,
          encoder: true,
          limitSwitches: { top: true, bottom: true },
          emergency: { manualOverride: true, batteryBackup: false }
        },
        dimensions: {
          width: width,
          length: zoneEnd - zoneStart,
          thickness: 0.002
        },
        mesh: screenMesh
      };
      
      zone.screens.push(screen);
      this.activeSystem!.zones.push(zone);
      
      this.layerManager.addObject('Shade', screenMesh, {
        userData: {
          type: 'shade_screen',
          systemId: this.activeSystem!.id,
          zoneId: zone.id,
          screenId: screen.id
        }
      });
      
      // Add support structure
      this.addSupportStructure(zone.position, 'horizontal');
    }
  }

  private createVerticalShadeSystem(bounds: any) {
    const wallHeight = bounds.max.y - bounds.min.y;
    const wallLength = bounds.max.z - bounds.min.z;
    
    // Create screens for each wall
    const walls = [
      { name: 'East', x: bounds.max.x, normal: new THREE.Vector3(1, 0, 0) },
      { name: 'West', x: bounds.min.x, normal: new THREE.Vector3(-1, 0, 0) }
    ];
    
    walls.forEach((wall, wallIndex) => {
      const numZones = Math.ceil(wallLength / 8); // 8m zones
      
      for (let i = 0; i < numZones; i++) {
        const zoneStart = bounds.min.z + (i * wallLength / numZones);
        const zoneEnd = bounds.min.z + ((i + 1) * wallLength / numZones);
        
        const zone: ShadeZone = {
          id: `zone_${wall.name}_${i}`,
          name: `${wall.name} Zone ${i + 1}`,
          area: wallHeight * (zoneEnd - zoneStart),
          screens: [],
          position: {
            start: new THREE.Vector3(wall.x, bounds.min.y, zoneStart),
            end: new THREE.Vector3(wall.x, bounds.max.y, zoneEnd),
            height: wallHeight
          },
          orientation: wall.name.toLowerCase() as any
        };
        
        // Create vertical screen
        const screenGeom = new THREE.PlaneGeometry(zoneEnd - zoneStart, wallHeight);
        const screenMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenMesh.position.set(
          wall.x,
          (bounds.min.y + bounds.max.y) / 2,
          (zoneStart + zoneEnd) / 2
        );
        screenMesh.rotation.y = wall.name === 'East' ? Math.PI / 2 : -Math.PI / 2;
        
        const screen: ShadeScreen = {
          id: `screen_${wall.name}_${i}`,
          type: 'shade',
          material: this.screenLibrary.get('shade_50')!,
          position: 0,
          status: 'retracted',
          motor: {
            id: `motor_${wall.name}_${i}`,
            type: 'cable-drum',
            power: 550,
            torque: 35,
            speed: 2.5,
            position: 0,
            encoder: true,
            limitSwitches: { top: true, bottom: true },
            emergency: { manualOverride: true, batteryBackup: false }
          },
          dimensions: {
            width: zoneEnd - zoneStart,
            length: wallHeight,
            thickness: 0.002
          },
          mesh: screenMesh
        };
        
        zone.screens.push(screen);
        this.activeSystem!.zones.push(zone);
        
        this.layerManager.addObject('Shade', screenMesh, {
          userData: {
            type: 'shade_screen',
            systemId: this.activeSystem!.id,
            zoneId: zone.id,
            screenId: screen.id,
            orientation: 'vertical'
          }
        });
        
        // Add guide rails
        this.addGuideRails(zone.position, 'vertical');
      }
    });
  }

  private createGableShadeSystem(bounds: any) {
    // Create triangular shade screens for gable ends
    const gableHeight = (bounds.max.y - bounds.min.y) * 0.3; // Assuming 30% gable
    const gableWidth = bounds.max.x - bounds.min.x;
    
    const gableEnds = [
      { name: 'North', z: bounds.min.z },
      { name: 'South', z: bounds.max.z }
    ];
    
    gableEnds.forEach(gable => {
      const vertices = [
        new THREE.Vector3(bounds.min.x, bounds.max.y - gableHeight, gable.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y - gableHeight, gable.z),
        new THREE.Vector3((bounds.min.x + bounds.max.x) / 2, bounds.max.y, gable.z)
      ];
      
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(gableWidth, 0);
      shape.lineTo(gableWidth / 2, gableHeight);
      shape.closePath();
      
      const geom = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(bounds.min.x, bounds.max.y - gableHeight, gable.z);
      
      const zone: ShadeZone = {
        id: `zone_gable_${gable.name}`,
        name: `${gable.name} Gable`,
        area: (gableWidth * gableHeight) / 2,
        screens: [{
          id: `screen_gable_${gable.name}`,
          type: 'shade',
          material: this.screenLibrary.get('shade_70')!,
          position: 0,
          status: 'retracted',
          motor: {
            id: `motor_gable_${gable.name}`,
            type: 'chain-drive',
            power: 370,
            torque: 25,
            speed: 2,
            position: 0,
            encoder: true,
            limitSwitches: { top: true, bottom: true },
            emergency: { manualOverride: true, batteryBackup: false }
          },
          dimensions: {
            width: gableWidth,
            length: gableHeight,
            thickness: 0.002
          },
          mesh
        }],
        position: {
          start: vertices[0],
          end: vertices[2],
          height: gableHeight
        },
        orientation: gable.name.toLowerCase() as any
      };
      
      this.activeSystem!.zones.push(zone);
      
      this.layerManager.addObject('Shade', mesh, {
        userData: {
          type: 'shade_screen',
          systemId: this.activeSystem!.id,
          zoneId: zone.id,
          configuration: 'gable'
        }
      });
    });
  }

  private createSlopedShadeSystem(bounds: any) {
    // Create shade system for sloped/curved roofs
    const roofPitch = 30; // degrees
    const width = bounds.max.x - bounds.min.x;
    const length = bounds.max.z - bounds.min.z;
    const rise = Math.tan(roofPitch * Math.PI / 180) * (width / 2);
    
    // Create curved path for shade
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(bounds.min.x, bounds.max.y - 0.5, bounds.min.z),
      new THREE.Vector3((bounds.min.x + bounds.max.x) / 2, bounds.max.y + rise - 0.5, bounds.min.z),
      new THREE.Vector3(bounds.max.x, bounds.max.y - 0.5, bounds.min.z)
    ]);
    
    const numZones = Math.ceil(length / 8);
    
    for (let i = 0; i < numZones; i++) {
      const zoneStart = bounds.min.z + (i * length / numZones);
      const zoneEnd = bounds.min.z + ((i + 1) * length / numZones);
      
      // Create curved screen geometry
      const points = curve.getPoints(20);
      const shape = new THREE.Shape();
      shape.moveTo(points[0].x, points[0].y);
      points.forEach(p => shape.lineTo(p.x, p.y));
      
      const extrudeSettings = {
        steps: 1,
        depth: zoneEnd - zoneStart,
        bevelEnabled: false
      };
      
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.z = zoneStart;
      
      const zone: ShadeZone = {
        id: `zone_slope_${i}`,
        name: `Slope Zone ${i + 1}`,
        area: width * (zoneEnd - zoneStart) * 1.2, // Account for slope
        screens: [{
          id: `screen_slope_${i}`,
          type: 'energy',
          material: this.screenLibrary.get('energy_clear')!,
          position: 0,
          status: 'retracted',
          motor: {
            id: `motor_slope_${i}`,
            type: 'rack-pinion',
            power: 750,
            torque: 50,
            speed: 2.5,
            position: 0,
            encoder: true,
            limitSwitches: { top: true, bottom: true },
            emergency: { manualOverride: true, batteryBackup: true }
          },
          dimensions: {
            width: width,
            length: zoneEnd - zoneStart,
            thickness: 0.003
          },
          mesh
        }],
        position: {
          start: new THREE.Vector3(bounds.min.x, bounds.max.y, zoneStart),
          end: new THREE.Vector3(bounds.max.x, bounds.max.y + rise, zoneEnd),
          height: bounds.max.y + rise / 2
        },
        orientation: 'horizontal'
      };
      
      this.activeSystem!.zones.push(zone);
      
      this.layerManager.addObject('Shade', mesh, {
        userData: {
          type: 'shade_screen',
          systemId: this.activeSystem!.id,
          zoneId: zone.id,
          configuration: 'slope'
        }
      });
    }
  }

  private addSupportStructure(position: any, type: string) {
    const material = new THREE.MeshBasicMaterial({ color: 0x666666 });
    
    if (type === 'horizontal') {
      // Add support beams
      const beamGeom = new THREE.BoxGeometry(0.1, 0.1, position.end.z - position.start.z);
      
      // Side beams
      for (const x of [position.start.x, position.end.x]) {
        const beam = new THREE.Mesh(beamGeom, material);
        beam.position.set(
          x,
          position.height,
          (position.start.z + position.end.z) / 2
        );
        
        this.layerManager.addObject('Shade', beam, {
          userData: {
            type: 'support_beam',
            systemId: this.activeSystem!.id
          }
        });
      }
      
      // Cross beams every 3m
      const crossBeamGeom = new THREE.BoxGeometry(position.end.x - position.start.x, 0.1, 0.1);
      const numCrossBeams = Math.ceil((position.end.z - position.start.z) / 3);
      
      for (let i = 0; i <= numCrossBeams; i++) {
        const z = position.start.z + (i * (position.end.z - position.start.z) / numCrossBeams);
        const crossBeam = new THREE.Mesh(crossBeamGeom, material);
        crossBeam.position.set(
          (position.start.x + position.end.x) / 2,
          position.height,
          z
        );
        
        this.layerManager.addObject('Shade', crossBeam, {
          userData: {
            type: 'cross_beam',
            systemId: this.activeSystem!.id
          }
        });
      }
    }
  }

  private addGuideRails(position: any, type: string) {
    const railMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const railGeom = new THREE.BoxGeometry(0.05, position.height, 0.05);
    
    // Side rails
    for (const z of [position.start.z, position.end.z]) {
      const rail = new THREE.Mesh(railGeom, railMat);
      rail.position.set(
        position.start.x,
        (position.start.y + position.end.y) / 2,
        z
      );
      
      this.layerManager.addObject('Shade', rail, {
        userData: {
          type: 'guide_rail',
          systemId: this.activeSystem!.id
        }
      });
    }
  }

  private updateMotorSpecs(configuration: string) {
    const motorPower = this.panel.container.querySelector('#motor-power');
    const motorSpeed = this.panel.container.querySelector('#motor-speed');
    const motorLoad = this.panel.container.querySelector('#motor-load');
    
    const specs: any = {
      horizontal: { power: '750W', speed: '3.0 m/min', load: '500 kg' },
      vertical: { power: '550W', speed: '2.5 m/min', load: '300 kg' },
      gable: { power: '370W', speed: '2.0 m/min', load: '200 kg' },
      slope: { power: '750W', speed: '2.5 m/min', load: '450 kg' }
    };
    
    if (motorPower) motorPower.textContent = specs[configuration]?.power || '-';
    if (motorSpeed) motorSpeed.textContent = specs[configuration]?.speed || '-';
    if (motorLoad) motorLoad.textContent = specs[configuration]?.load || '-';
  }

  private selectScreenType(screenType: string) {
    if (screenType === 'custom_shade') {
      // Show custom shade dialog
      const percent = prompt('Enter shade percentage (0-100):', '60');
      if (percent) {
        const customShade: ShadeMaterial = {
          id: `custom_${Date.now()}`,
          name: `Custom ${percent}% Shade`,
          type: 'polyester',
          properties: {
            shading: parseInt(percent),
            energySaving: parseInt(percent) * 0.5,
            diffusion: 85,
            ventilation: 30 - (parseInt(percent) * 0.3),
            uvBlocking: 90 + (parseInt(percent) * 0.1),
            durability: 10
          },
          color: 'custom',
          pattern: 'stripe',
          warranty: 5
        };
        this.screenLibrary.set(customShade.id, customShade);
      }
    }
    
    // Update active screen type for new zones
    console.log('Selected screen type:', screenType);
  }

  private autoGenerateZones() {
    if (!this.activeSystem) return;
    
    const bounds = this.viewer.model.getBoundingBox();
    const config = this.activeSystem.configuration;
    
    // Clear existing zones
    this.activeSystem.zones = [];
    this.clearShadeObjects();
    
    // Generate optimal zones based on configuration
    switch (config) {
      case 'horizontal':
        this.createHorizontalShadeSystem(bounds);
        break;
      case 'vertical':
        this.createVerticalShadeSystem(bounds);
        break;
      case 'gable':
        this.createGableShadeSystem(bounds);
        break;
      case 'slope':
        this.createSlopedShadeSystem(bounds);
        break;
    }
    
    this.updateZoneList();
    this.viewer.impl.sceneUpdated(true);
  }

  private showAddZoneDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
      <div class="modal-content">
        <h4>Add Shade Zone</h4>
        <form id="zone-form">
          <label>Zone Name:</label>
          <input type="text" id="zone-name" required>
          
          <label>Screen Type:</label>
          <select id="zone-screen-type">
            ${Array.from(this.screenLibrary.entries()).map(([id, screen]) => 
              `<option value="${id}">${screen.name}</option>`
            ).join('')}
          </select>
          
          <label>Width (m):</label>
          <input type="number" id="zone-width" step="0.1" required>
          
          <label>Length (m):</label>
          <input type="number" id="zone-length" step="0.1" required>
          
          <label>Motor Type:</label>
          <select id="zone-motor">
            <option value="rack-pinion">Rack & Pinion</option>
            <option value="cable-drum">Cable & Drum</option>
            <option value="tubular">Tubular Motor</option>
            <option value="chain-drive">Chain Drive</option>
          </select>
          
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">Add Zone</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-dialog').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const form = dialog.querySelector('#zone-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addCustomZone(form);
      dialog.remove();
    });
  }

  private addCustomZone(form: HTMLFormElement) {
    if (!this.activeSystem) return;
    
    const name = (form.querySelector('#zone-name') as HTMLInputElement).value;
    const screenType = (form.querySelector('#zone-screen-type') as HTMLSelectElement).value;
    const width = parseFloat((form.querySelector('#zone-width') as HTMLInputElement).value);
    const length = parseFloat((form.querySelector('#zone-length') as HTMLInputElement).value);
    const motorType = (form.querySelector('#zone-motor') as HTMLSelectElement).value;
    
    // Create custom zone
    // Implementation would add zone at current camera position or selected location
    console.log('Adding custom zone:', { name, screenType, width, length, motorType });
    
    this.updateZoneList();
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
        <p>Area: ${zone.area.toFixed(1)}m²</p>
        <p>Screens: ${zone.screens.length}</p>
        <p>Orientation: ${zone.orientation}</p>
        <button class="btn btn-sm" onclick="editZone('${zone.id}')">Edit</button>
      `;
      zoneList.appendChild(zoneDiv);
    });
  }

  private updateControlView() {
    const zoneControlList = this.panel.container.querySelector('#zone-control-list');
    if (!zoneControlList || !this.activeSystem) return;
    
    zoneControlList.innerHTML = '';
    
    this.activeSystem.zones.forEach(zone => {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'zone-control-item';
      controlDiv.innerHTML = `
        <h5>${zone.name}</h5>
        <div class="position-control">
          <label>Position:</label>
          <input type="range" min="0" max="100" value="${zone.screens[0]?.position || 0}" 
                 class="position-slider" data-zone="${zone.id}">
          <span class="position-value">${zone.screens[0]?.position || 0}%</span>
        </div>
        <div class="control-buttons">
          <button class="btn btn-sm" onclick="openZone('${zone.id}')">Open</button>
          <button class="btn btn-sm" onclick="closeZone('${zone.id}')">Close</button>
          <button class="btn btn-sm" onclick="stopZone('${zone.id}')">Stop</button>
        </div>
      `;
      zoneControlList.appendChild(controlDiv);
      
      // Add slider event
      const slider = controlDiv.querySelector('.position-slider') as HTMLInputElement;
      const valueSpan = controlDiv.querySelector('.position-value');
      
      slider?.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        if (valueSpan) valueSpan.textContent = value + '%';
        this.setZonePosition(zone.id, parseInt(value));
      });
    });
    
    // Update sensor readings
    this.updateSensorReadings();
  }

  private updateSensorReadings() {
    // Simulate sensor readings
    const solarRadiation = this.panel.container.querySelector('#solar-radiation');
    const temperature = this.panel.container.querySelector('#temperature');
    const windSpeed = this.panel.container.querySelector('#wind-speed');
    const rainStatus = this.panel.container.querySelector('#rain-status');
    
    if (solarRadiation) solarRadiation.textContent = Math.round(200 + Math.random() * 600) + ' W/m²';
    if (temperature) temperature.textContent = (20 + Math.random() * 15).toFixed(1) + '°C';
    if (windSpeed) windSpeed.textContent = (Math.random() * 10).toFixed(1) + ' m/s';
    if (rainStatus) rainStatus.textContent = Math.random() > 0.8 ? 'Yes' : 'No';
  }

  private setZonePosition(zoneId: string, position: number) {
    const zone = this.activeSystem?.zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    zone.screens.forEach(screen => {
      screen.position = position;
      this.updateScreenVisual(screen, position);
    });
  }

  private updateScreenVisual(screen: ShadeScreen, position: number) {
    if (!screen.mesh) return;
    
    // Update opacity based on position
    const material = screen.mesh.material as THREE.MeshBasicMaterial;
    material.opacity = 0.1 + (position / 100) * 0.7;
    
    // Could also animate actual mesh position for rolling screens
    this.viewer.impl.sceneUpdated(true);
  }

  private controlAllScreens(position: number) {
    this.activeSystem?.zones.forEach(zone => {
      this.setZonePosition(zone.id, position);
    });
    this.updateControlView();
  }

  private setAllScreensPosition(position: number) {
    this.controlAllScreens(position);
  }

  private emergencyStop() {
    // Stop all motor movements
    this.activeSystem?.zones.forEach(zone => {
      zone.screens.forEach(screen => {
        screen.status = 'error';
        console.log(`Emergency stop: ${screen.id}`);
      });
    });
    
    // Show alert
    alert('Emergency stop activated! All screen movements halted.');
  }

  private updateScheduleView() {
    // Create schedule calendar
    const calendar = this.panel.container.querySelector('#schedule-calendar');
    if (!calendar) return;
    
    // Simple daily schedule view
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    let html = '<table class="schedule-table"><tr><th>Hour</th><th>Position</th><th>Mode</th></tr>';
    
    hours.forEach(hour => {
      html += `<tr>
        <td>${hour}:00</td>
        <td><input type="number" min="0" max="100" value="0" class="schedule-position" data-hour="${hour}"></td>
        <td><select class="schedule-mode" data-hour="${hour}">
          <option value="manual">Manual</option>
          <option value="auto">Auto</option>
          <option value="skip">Skip</option>
        </select></td>
      </tr>`;
    });
    
    html += '</table>';
    calendar.innerHTML = html;
    
    // Update event list
    this.updateEventList();
    this.updateRuleList();
  }

  private updateEventList() {
    const eventList = this.panel.container.querySelector('#event-list');
    if (!eventList || !this.activeSystem) return;
    
    eventList.innerHTML = '';
    
    // Show scheduled events
    this.activeSystem.zones.forEach(zone => {
      zone.screens.forEach(screen => {
        // Display any scheduled events for this screen
      });
    });
  }

  private updateRuleList() {
    const ruleList = this.panel.container.querySelector('#rule-list');
    if (!ruleList || !this.activeSystem) return;
    
    ruleList.innerHTML = '';
    
    this.activeSystem.automation.strategies.forEach(strategy => {
      const ruleDiv = document.createElement('div');
      ruleDiv.className = 'rule-item';
      ruleDiv.innerHTML = `
        <h6>${strategy.name}</h6>
        <p>Type: ${strategy.type}</p>
        <p>Priority: ${strategy.priority}</p>
        <label>
          <input type="checkbox" ${strategy.active ? 'checked' : ''}>
          Active
        </label>
      `;
      ruleList.appendChild(ruleDiv);
    });
  }

  private showAddEventDialog() {
    // Implementation similar to irrigation system
  }

  private showAddRuleDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
      <div class="modal-content">
        <h4>Add Automation Rule</h4>
        <form id="rule-form">
          <label>Rule Name:</label>
          <input type="text" id="rule-name" required>
          
          <label>Strategy Type:</label>
          <select id="strategy-type">
            <option value="energy-saving">Energy Saving</option>
            <option value="crop-protection">Crop Protection</option>
            <option value="light-control">Light Control</option>
            <option value="temperature-control">Temperature Control</option>
          </select>
          
          <label>Trigger Condition:</label>
          <select id="trigger-param">
            <option value="temperature">Temperature</option>
            <option value="solarRadiation">Solar Radiation</option>
            <option value="time">Time of Day</option>
            <option value="windSpeed">Wind Speed</option>
          </select>
          
          <label>Operator:</label>
          <select id="trigger-operator">
            <option value="gt">Greater than</option>
            <option value="lt">Less than</option>
            <option value="eq">Equals</option>
            <option value="between">Between</option>
          </select>
          
          <label>Value:</label>
          <input type="number" id="trigger-value" required>
          
          <label>Action:</label>
          <select id="action-type">
            <option value="deploy">Deploy to Position</option>
            <option value="retract">Retract</option>
            <option value="position">Set Position</option>
          </select>
          
          <label>Target Position (%):</label>
          <input type="number" id="action-position" min="0" max="100" value="50">
          
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">Add Rule</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-dialog').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const form = dialog.querySelector('#rule-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addAutomationRule(form);
      dialog.remove();
    });
  }

  private addAutomationRule(form: HTMLFormElement) {
    if (!this.activeSystem) return;
    
    const strategy: AutomationStrategy = {
      id: `rule_${Date.now()}`,
      name: (form.querySelector('#rule-name') as HTMLInputElement).value,
      type: (form.querySelector('#strategy-type') as HTMLSelectElement).value as any,
      active: true,
      conditions: [{
        parameter: (form.querySelector('#trigger-param') as HTMLSelectElement).value,
        operator: (form.querySelector('#trigger-operator') as HTMLSelectElement).value as any,
        value: parseFloat((form.querySelector('#trigger-value') as HTMLInputElement).value)
      }],
      actions: [{
        type: (form.querySelector('#action-type') as HTMLSelectElement).value as any,
        target: this.activeSystem.zones.map(z => z.id),
        value: parseInt((form.querySelector('#action-position') as HTMLInputElement).value)
      }],
      priority: 5
    };
    
    this.activeSystem.automation.strategies.push(strategy);
    this.updateRuleList();
  }

  private updateAnalysisView() {
    // Update analysis metrics
    const avgDli = this.panel.container.querySelector('#avg-dli');
    const parReduction = this.panel.container.querySelector('#par-reduction');
    const shadeHours = this.panel.container.querySelector('#shade-hours');
    
    if (avgDli) avgDli.textContent = '25.5 mol/m²/day';
    if (parReduction) parReduction.textContent = '45%';
    if (shadeHours) shadeHours.textContent = '6.5 hrs';
    
    // Update energy metrics
    const coolingReduction = this.panel.container.querySelector('#cooling-reduction');
    const heatingRetention = this.panel.container.querySelector('#heating-retention');
    const annualSavings = this.panel.container.querySelector('#annual-savings');
    
    if (coolingReduction) coolingReduction.textContent = '35%';
    if (heatingRetention) heatingRetention.textContent = '25%';
    if (annualSavings) annualSavings.textContent = '$12,500';
  }

  private runLightAnalysis() {
    if (!this.activeSystem) return;
    
    // Perform light analysis
    const results = this.calculateLightMetrics();
    
    // Show results
    const resultsDiv = this.panel.container.querySelector('#light-results');
    if (resultsDiv) {
      resultsDiv.classList.remove('hidden');
    }
    
    // Create light distribution heatmap
    this.createLightHeatmap();
  }

  private calculateLightMetrics(): LightAnalysis {
    // Simplified calculation
    return {
      zone: 'all',
      dailyLightIntegral: 25.5,
      parLevel: 450,
      shadeHours: 6.5,
      energySavings: 1250,
      temperatureReduction: 3.5
    };
  }

  private createLightHeatmap() {
    const heatmapDiv = this.panel.container.querySelector('#light-heatmap');
    if (!heatmapDiv) return;
    
    // Create canvas for heatmap
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Generate heatmap showing light distribution with shading
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const lightLevel = this.calculateLightAtPoint(x, y);
        const color = this.lightLevelToColor(lightLevel);
        
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

  private calculateLightAtPoint(x: number, y: number): number {
    // Simulate light levels with shade screens
    const baseLight = 1000; // W/m²
    const shadeReduction = 0.5; // 50% shade
    
    // Add some variation
    const variation = Math.sin(x * 0.1) * 0.1 + Math.cos(y * 0.1) * 0.1;
    
    return baseLight * (1 - shadeReduction) * (1 + variation);
  }

  private lightLevelToColor(level: number): { r: number; g: number; b: number } {
    // Color gradient from blue (low) to yellow (high)
    const normalized = level / 1000;
    
    return {
      r: Math.round(normalized * 255),
      g: Math.round(normalized * 200),
      b: Math.round((1 - normalized) * 100)
    };
  }

  private analyzeCropImpact(crop: string) {
    const recommendations = this.panel.container.querySelector('#crop-recommendations');
    if (!recommendations) return;
    
    const cropData: any = {
      tomato: {
        idealDLI: 22,
        maxTemp: 28,
        shadeNeeded: 'Moderate (30-50%)',
        criticalPeriod: 'Midday (11am-3pm)'
      },
      cucumber: {
        idealDLI: 20,
        maxTemp: 26,
        shadeNeeded: 'Light (20-30%)',
        criticalPeriod: 'Early afternoon (12pm-2pm)'
      },
      lettuce: {
        idealDLI: 12,
        maxTemp: 22,
        shadeNeeded: 'Heavy (50-70%)',
        criticalPeriod: 'All day in summer'
      },
      pepper: {
        idealDLI: 25,
        maxTemp: 30,
        shadeNeeded: 'Light (20-30%)',
        criticalPeriod: 'Peak summer only'
      },
      strawberry: {
        idealDLI: 17,
        maxTemp: 24,
        shadeNeeded: 'Moderate (40-50%)',
        criticalPeriod: 'Afternoon (1pm-4pm)'
      }
    };
    
    const data = cropData[crop];
    if (!data) return;
    
    recommendations.classList.remove('hidden');
    recommendations.innerHTML = `
      <h5>Recommendations for ${crop.charAt(0).toUpperCase() + crop.slice(1)}</h5>
      <ul>
        <li>Ideal DLI: ${data.idealDLI} mol/m²/day</li>
        <li>Maximum Temperature: ${data.maxTemp}°C</li>
        <li>Shade Requirement: ${data.shadeNeeded}</li>
        <li>Critical Shading Period: ${data.criticalPeriod}</li>
      </ul>
      <div class="shade-schedule-suggestion">
        <h6>Suggested Schedule:</h6>
        <p>Deploy screens to ${data.shadeNeeded.match(/\d+/)?.[0] || 30}% during ${data.criticalPeriod}</p>
        <button class="btn btn-primary btn-sm" onclick="applySchedule('${crop}')">Apply Schedule</button>
      </div>
    `;
  }

  private updateMaintenanceView() {
    // Update system health
    const overallStatus = this.panel.container.querySelector('#overall-status');
    const lastMaintenance = this.panel.container.querySelector('#last-maintenance');
    const nextService = this.panel.container.querySelector('#next-service');
    
    if (overallStatus) overallStatus.textContent = 'Good';
    if (lastMaintenance) lastMaintenance.textContent = '30 days ago';
    if (nextService) nextService.textContent = '60 days';
    
    // Update motor diagnostics
    this.updateMotorDiagnostics();
    
    // Update maintenance history
    this.updateMaintenanceHistory();
    
    // Update alerts
    this.updateAlerts();
  }

  private updateMotorDiagnostics() {
    const motorList = this.panel.container.querySelector('#motor-status-list');
    if (!motorList || !this.activeSystem) return;
    
    motorList.innerHTML = '';
    
    this.activeSystem.zones.forEach(zone => {
      zone.screens.forEach(screen => {
        const motorDiv = document.createElement('div');
        motorDiv.className = 'motor-status';
        motorDiv.innerHTML = `
          <h6>${zone.name} - Motor ${screen.motor.id}</h6>
          <div class="motor-metrics">
            <p>Position: ${screen.motor.position}%</p>
            <p>Current Draw: ${(2.5 + Math.random()).toFixed(1)}A</p>
            <p>Temperature: ${(35 + Math.random() * 10).toFixed(1)}°C</p>
            <p>Run Time: ${Math.round(100 + Math.random() * 500)}h</p>
            <p>Status: <span class="status-good">Normal</span></p>
          </div>
        `;
        motorList.appendChild(motorDiv);
      });
    });
  }

  private updateMaintenanceHistory() {
    const historyDiv = this.panel.container.querySelector('#maintenance-history');
    if (!historyDiv) return;
    
    const history = [
      { date: '2024-11-15', type: 'Routine', description: 'Cleaned screens, lubricated rails' },
      { date: '2024-10-01', type: 'Inspection', description: 'Motor alignment check' },
      { date: '2024-08-20', type: 'Repair', description: 'Replaced limit switch Zone 3' }
    ];
    
    historyDiv.innerHTML = history.map(entry => `
      <div class="history-entry">
        <span class="entry-date">${entry.date}</span>
        <span class="entry-type">${entry.type}</span>
        <span class="entry-desc">${entry.description}</span>
      </div>
    `).join('');
  }

  private updateAlerts() {
    const alertList = this.panel.container.querySelector('#alert-list');
    if (!alertList || !this.activeSystem) return;
    
    alertList.innerHTML = '';
    
    this.activeSystem.automation.alerts.forEach(alert => {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${alert.severity}`;
      alertDiv.innerHTML = `
        <span class="alert-icon">${this.getAlertIcon(alert.severity)}</span>
        <span class="alert-message">${alert.message}</span>
        <span class="alert-time">${this.formatTime(alert.timestamp)}</span>
        ${!alert.acknowledged ? '<button class="btn btn-sm" onclick="acknowledgeAlert(\'' + alert.id + '\')">Ack</button>' : ''}
      `;
      alertList.appendChild(alertDiv);
    });
  }

  private getAlertIcon(severity: string): string {
    const icons: any = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨'
    };
    return icons[severity] || '📋';
  }

  private formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  }

  private startSimulation() {
    if (!this.activeSystem) return;
    
    // Start animation loop
    const animate = () => {
      this.activeSystem?.zones.forEach(zone => {
        zone.screens.forEach(screen => {
          // Simulate screen movement
          if (screen.status === 'moving') {
            const targetPosition = 50; // Example target
            const speed = 2; // % per frame
            
            if (Math.abs(screen.position - targetPosition) > speed) {
              screen.position += screen.position < targetPosition ? speed : -speed;
              this.updateScreenVisual(screen, screen.position);
            } else {
              screen.position = targetPosition;
              screen.status = 'deployed';
            }
          }
        });
      });
      
      this.viewer.impl.sceneUpdated(true);
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Set some screens to moving
    this.activeSystem.zones.forEach(zone => {
      zone.screens.forEach(screen => {
        screen.status = 'moving';
      });
    });
    
    animate();
    
    // Stop after 5 seconds
    setTimeout(() => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }, 5000);
  }

  private exportShadeDesign() {
    if (!this.activeSystem) return;
    
    const exportData = {
      system: {
        id: this.activeSystem.id,
        name: this.activeSystem.name,
        type: this.activeSystem.type,
        configuration: this.activeSystem.configuration
      },
      zones: this.activeSystem.zones.map(zone => ({
        id: zone.id,
        name: zone.name,
        area: zone.area,
        orientation: zone.orientation,
        screens: zone.screens.map(screen => ({
          type: screen.type,
          material: screen.material,
          dimensions: screen.dimensions,
          motor: screen.motor
        }))
      })),
      automation: this.activeSystem.automation,
      specifications: this.generateSpecifications()
    };
    
    // Create download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shade_system_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generateSpecifications(): any {
    if (!this.activeSystem) return {};
    
    let totalArea = 0;
    let totalMotors = 0;
    const materials = new Set<string>();
    
    this.activeSystem.zones.forEach(zone => {
      totalArea += zone.area;
      totalMotors += zone.screens.length;
      zone.screens.forEach(screen => {
        materials.add(screen.material.name);
      });
    });
    
    return {
      totalCoverageArea: totalArea,
      numberOfZones: this.activeSystem.zones.length,
      numberOfMotors: totalMotors,
      screenMaterials: Array.from(materials),
      controlSystem: this.activeSystem.controls.type,
      estimatedCost: this.calculateSystemCost()
    };
  }

  private calculateSystemCost(): number {
    if (!this.activeSystem) return 0;
    
    let cost = 0;
    
    this.activeSystem.zones.forEach(zone => {
      // Screen material cost
      cost += zone.area * 25; // $25/m² average
      
      // Motor cost
      zone.screens.forEach(screen => {
        cost += screen.motor.power * 2; // Rough estimate based on power
      });
      
      // Support structure
      cost += zone.area * 15; // $15/m² for structure
    });
    
    // Control system
    cost += 5000; // Base control system
    
    // Installation (30% of materials)
    cost *= 1.3;
    
    return Math.round(cost);
  }

  private onSelectionChanged(event: any) {
    const dbIds = event.dbIdArray;
    if (dbIds.length === 0) return;
    
    // Check if selected object is a shade component
    const dbId = dbIds[0];
    this.viewer.getProperties(dbId, (props: any) => {
      if (props.properties.some((p: any) => p.displayName === 'systemId')) {
        // Show component details
        console.log('Selected shade component:', props);
      }
    });
  }

  private clearShadeObjects() {
    if (!this.layerManager) return;
    
    // Remove all objects from shade layer
    const layer = this.layerManager.getLayer('Shade');
    if (layer && layer.visible) {
      this.viewer.impl.scene.traverse((child: any) => {
        if (child.userData && child.userData.systemId === this.activeSystem?.id) {
          this.viewer.impl.scene.remove(child);
        }
      });
    }
  }

  private cleanupVisualizations() {
    this.clearShadeObjects();
    this.systems.clear();
    this.activeSystem = null;
  }

  private addStyles() {
    const styles = `
      .shade-system-panel {
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

      .screen-selector {
        margin-bottom: 20px;
      }

      .screen-categories {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .category h5 {
        margin: 0 0 5px 0;
        font-size: 12px;
        color: #666;
      }

      .screen-btn {
        padding: 5px 10px;
        margin: 2px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-size: 11px;
        border-radius: 3px;
      }

      .screen-btn:hover {
        background: #f0f0f0;
      }

      .zone-designer {
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

      .motor-config {
        margin-bottom: 20px;
      }

      .motor-specs {
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
        margin-top: 10px;
      }

      .motor-specs p {
        margin: 5px 0;
        font-size: 12px;
      }

      .control-interface {
        margin-bottom: 20px;
      }

      .zone-control-item {
        padding: 15px;
        margin: 10px 0;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .zone-control-item h5 {
        margin: 0 0 10px 0;
        font-size: 14px;
      }

      .position-control {
        margin: 10px 0;
      }

      .position-control label {
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
      }

      .position-slider {
        width: 70%;
        vertical-align: middle;
      }

      .position-value {
        display: inline-block;
        width: 25%;
        text-align: right;
        font-size: 12px;
        font-weight: bold;
      }

      .control-buttons {
        display: flex;
        gap: 5px;
      }

      .group-controls {
        padding: 15px;
        background: #f0f0f0;
        border-radius: 3px;
        margin-bottom: 20px;
      }

      .group-controls h5 {
        margin: 0 0 10px 0;
        font-size: 13px;
      }

      .position-presets {
        margin-bottom: 20px;
      }

      .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .preset-btn {
        padding: 5px 10px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-size: 11px;
        border-radius: 3px;
      }

      .preset-btn:hover {
        background: #f0f0f0;
      }

      .sensor-status {
        margin-bottom: 20px;
      }

      .sensor-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 10px;
      }

      .sensor-item {
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .sensor-label {
        display: block;
        font-size: 11px;
        color: #666;
      }

      .sensor-value {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }

      .schedule-table th,
      .schedule-table td {
        padding: 5px;
        border: 1px solid #ddd;
        text-align: center;
      }

      .schedule-position {
        width: 50px;
      }

      .schedule-mode {
        width: 80px;
      }

      .automation-rules {
        margin-top: 20px;
      }

      .rule-item {
        padding: 10px;
        margin: 5px 0;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .rule-item h6 {
        margin: 0 0 5px 0;
        font-size: 12px;
      }

      .rule-item p {
        margin: 2px 0;
        font-size: 11px;
        color: #666;
      }

      .analysis-metric {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
        margin: 5px 0;
      }

      .analysis-metric label {
        font-size: 12px;
        color: #666;
      }

      .analysis-metric span {
        font-size: 14px;
        font-weight: bold;
      }

      #light-heatmap,
      #energy-chart {
        margin: 20px 0;
        text-align: center;
      }

      #light-heatmap canvas,
      #energy-chart {
        max-width: 100%;
        border: 1px solid #ddd;
      }

      .crop-impact select {
        width: 100%;
        padding: 5px;
        margin: 10px 0;
      }

      #crop-recommendations {
        padding: 15px;
        background: #f0f8ff;
        border-radius: 3px;
        margin-top: 10px;
      }

      #crop-recommendations h5 {
        margin: 0 0 10px 0;
        font-size: 14px;
      }

      #crop-recommendations ul {
        margin: 10px 0;
        padding-left: 20px;
      }

      #crop-recommendations li {
        margin: 5px 0;
        font-size: 12px;
      }

      .shade-schedule-suggestion {
        margin-top: 15px;
        padding: 10px;
        background: white;
        border-radius: 3px;
      }

      .shade-schedule-suggestion h6 {
        margin: 0 0 5px 0;
        font-size: 12px;
      }

      .shade-schedule-suggestion p {
        margin: 5px 0;
        font-size: 11px;
      }

      .health-overview {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 15px 0;
      }

      .health-indicator {
        padding: 10px;
        background: #f8f8f8;
        border-radius: 3px;
        text-align: center;
      }

      .indicator-label {
        display: block;
        font-size: 11px;
        color: #666;
      }

      .indicator-value {
        display: block;
        font-size: 14px;
        font-weight: bold;
        margin-top: 5px;
      }

      .motor-status {
        padding: 10px;
        margin: 10px 0;
        background: #f8f8f8;
        border-radius: 3px;
      }

      .motor-status h6 {
        margin: 0 0 8px 0;
        font-size: 12px;
      }

      .motor-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        font-size: 11px;
      }

      .motor-metrics p {
        margin: 2px 0;
      }

      .status-good {
        color: #28a745;
        font-weight: bold;
      }

      .history-entry {
        display: grid;
        grid-template-columns: 80px 80px 1fr;
        gap: 10px;
        padding: 8px;
        margin: 5px 0;
        background: #f8f8f8;
        border-radius: 3px;
        font-size: 11px;
      }

      .entry-date {
        color: #666;
      }

      .entry-type {
        font-weight: bold;
      }

      .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        margin: 5px 0;
        border-radius: 3px;
        font-size: 12px;
      }

      .alert-info {
        background: #d1ecf1;
        color: #0c5460;
      }

      .alert-warning {
        background: #fff3cd;
        color: #856404;
      }

      .alert-critical {
        background: #f8d7da;
        color: #721c24;
      }

      .alert-icon {
        font-size: 16px;
      }

      .alert-message {
        flex: 1;
      }

      .alert-time {
        font-size: 10px;
        color: #666;
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

      .btn-success {
        background: #28a745;
        color: white;
      }

      .btn-danger {
        background: #dc3545;
        color: white;
      }

      .btn-warning {
        background: #ffc107;
        color: #212529;
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

      .energy-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 15px 0;
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
        margin-top: 5px;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

// Register the extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.ShadeSystem', ShadeSystemExtension);

export default ShadeSystemExtension;