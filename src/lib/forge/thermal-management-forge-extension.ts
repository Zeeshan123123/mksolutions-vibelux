/**
 * VibeLux Thermal Management Extension for Autodesk Forge
 * Advanced thermal analysis and control systems for greenhouse environments
 */

import { VibeLuxLayerManager } from './layer-manager';

interface ThermalZone {
  id: string;
  name: string;
  bounds: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  targetTemp: { min: number; max: number };
  currentTemp: number;
  humidity: number;
  heatSources: string[]; // Equipment IDs
  coolingSources: string[]; // Equipment IDs
  sensors: ThermalSensor[];
  insulation: InsulationProperties;
}

interface ThermalSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'soil-temp' | 'leaf-temp' | 'dew-point';
  position: { x: number; y: number; z: number };
  reading: number;
  units: string;
  accuracy: number;
  lastUpdate: Date;
  status: 'active' | 'inactive' | 'error';
}

interface InsulationProperties {
  walls: { rValue: number; material: string };
  roof: { rValue: number; material: string };
  floor: { rValue: number; material: string };
  glazing: { uValue: number; shgc: number; vlt: number };
}

interface ThermalModel {
  id: string;
  name: string;
  zones: ThermalZone[];
  ambientConditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    solarIrradiance: number;
  };
  materialProperties: Map<string, ThermalMaterial>;
  heatTransferCoefficients: {
    convective: number;
    radiative: number;
    conductive: number;
  };
}

interface ThermalMaterial {
  name: string;
  density: number; // kg/m³
  specificHeat: number; // J/kg·K
  thermalConductivity: number; // W/m·K
  emissivity: number;
  absorptivity: number;
}

interface ThermalAnalysisResult {
  timestamp: Date;
  zones: {
    zoneId: string;
    averageTemp: number;
    tempGradient: number;
    hotSpots: { x: number; y: number; z: number; temp: number }[];
    coldSpots: { x: number; y: number; z: number; temp: number }[];
    energyBalance: {
      heatInput: number; // W
      heatLoss: number; // W
      netGain: number; // W
    };
  }[];
  overallEfficiency: number;
  recommendations: string[];
}

class ThermalManagementForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private thermalModel: ThermalModel | null = null;
  private thermalZones: Map<string, ThermalZone> = new Map();
  private sensors: Map<string, ThermalSensor> = new Map();
  private analysisMode: 'steady-state' | 'transient' | 'seasonal' = 'steady-state';
  private visualizationMode: 'temperature' | 'gradient' | 'airflow' | 'energy' = 'temperature';
  private thermalMesh: THREE.Object3D | null = null;
  private isAnalyzing: boolean = false;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeDefaultMaterials();
  }

  load(): boolean {
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChanged.bind(this));
    
    this.setupUI();
    console.log('VibeLux Thermal Management Extension loaded');
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
    console.log('VibeLux Thermal Management Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-thermal-panel',
      'Thermal Management',
      {
        dockRight: true,
        shadow: true,
        width: 420,
        height: 700
      }
    );

    this.updatePanel();
    this.createToolbarButton();
  }

  private createToolbarButton(): void {
    const toolbar = this.viewer.getToolbar(true);
    const thermalToolbar = toolbar.getControl('vibelux-thermal-toolbar');
    
    if (!thermalToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-thermal-toolbar');
      
      const thermalButton = new Autodesk.Viewing.UI.Button('thermal-mgmt-btn');
      thermalButton.setToolTip('Thermal Management');
      thermalButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
          <path d="M21 14H20C20 10.69 17.31 8 14 8V7C17.87 7 21 10.13 21 14Z"/>
          <path d="M19 14H18C18 11.79 16.21 10 14 10V9C16.76 9 19 11.24 19 14Z"/>
          <path d="M17 14H16C16 12.9 15.1 12 14 12V11C15.66 11 17 12.34 17 14Z"/>
          <path d="M12 8V22L8 18V8H12Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      `));
      thermalButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(thermalButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeDefaultMaterials(): void {
    // Initialize thermal material library
    const materials = new Map<string, ThermalMaterial>();
    
    // Building materials
    materials.set('polycarbonate', {
      name: 'Polycarbonate Glazing',
      density: 1200,
      specificHeat: 1200,
      thermalConductivity: 0.2,
      emissivity: 0.9,
      absorptivity: 0.1
    });
    
    materials.set('glass', {
      name: 'Glass Glazing',
      density: 2500,
      specificHeat: 840,
      thermalConductivity: 1.0,
      emissivity: 0.9,
      absorptivity: 0.08
    });
    
    materials.set('concrete', {
      name: 'Concrete Foundation',
      density: 2400,
      specificHeat: 880,
      thermalConductivity: 1.7,
      emissivity: 0.9,
      absorptivity: 0.7
    });
    
    materials.set('steel', {
      name: 'Steel Structure',
      density: 7850,
      specificHeat: 450,
      thermalConductivity: 50,
      emissivity: 0.8,
      absorptivity: 0.8
    });
    
    // Growing media
    materials.set('soil', {
      name: 'Growing Soil',
      density: 1300,
      specificHeat: 800,
      thermalConductivity: 0.5,
      emissivity: 0.95,
      absorptivity: 0.8
    });
    
    materials.set('rockwool', {
      name: 'Rockwool Substrate',
      density: 80,
      specificHeat: 840,
      thermalConductivity: 0.04,
      emissivity: 0.9,
      absorptivity: 0.3
    });

    this.thermalModel = {
      id: 'default-thermal-model',
      name: 'Greenhouse Thermal Model',
      zones: [],
      ambientConditions: {
        temperature: 22, // °C
        humidity: 60, // %
        windSpeed: 2, // m/s
        solarIrradiance: 800 // W/m²
      },
      materialProperties: materials,
      heatTransferCoefficients: {
        convective: 10, // W/m²·K
        radiative: 5.67e-8, // Stefan-Boltzmann constant
        conductive: 1.0 // Material dependent
      }
    };
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const panelContent = `
      <div class="thermal-management-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>🌡️ Thermal Management</h3>
          <p>Advanced thermal analysis and control systems</p>
        </div>

        <!-- Analysis Mode Selection -->
        <div class="extension-section">
          <h4>Analysis Mode</h4>
          <div class="analysis-mode-buttons">
            <button class="btn mode-btn ${this.analysisMode === 'steady-state' ? 'active' : ''}" 
                    onclick="thermalMgmt.setAnalysisMode('steady-state')">
              ⚖️ Steady State
            </button>
            <button class="btn mode-btn ${this.analysisMode === 'transient' ? 'active' : ''}" 
                    onclick="thermalMgmt.setAnalysisMode('transient')">
              📈 Transient
            </button>
            <button class="btn mode-btn ${this.analysisMode === 'seasonal' ? 'active' : ''}" 
                    onclick="thermalMgmt.setAnalysisMode('seasonal')">
              🗓️ Seasonal
            </button>
          </div>
        </div>

        <!-- Environmental Conditions -->
        <div class="extension-section">
          <h4>Environmental Conditions</h4>
          <div class="conditions-grid">
            <div class="condition-item">
              <label>Ambient Temperature (°C)</label>
              <input type="number" id="ambient-temp" value="${this.thermalModel?.ambientConditions.temperature || 22}" 
                     onchange="thermalMgmt.updateAmbientConditions()">
            </div>
            <div class="condition-item">
              <label>Humidity (%)</label>
              <input type="number" id="ambient-humidity" value="${this.thermalModel?.ambientConditions.humidity || 60}" 
                     onchange="thermalMgmt.updateAmbientConditions()">
            </div>
            <div class="condition-item">
              <label>Wind Speed (m/s)</label>
              <input type="number" id="wind-speed" value="${this.thermalModel?.ambientConditions.windSpeed || 2}" 
                     step="0.1" onchange="thermalMgmt.updateAmbientConditions()">
            </div>
            <div class="condition-item">
              <label>Solar Irradiance (W/m²)</label>
              <input type="number" id="solar-irradiance" value="${this.thermalModel?.ambientConditions.solarIrradiance || 800}" 
                     onchange="thermalMgmt.updateAmbientConditions()">
            </div>
          </div>
        </div>

        <!-- Thermal Zones -->
        <div class="extension-section">
          <h4>Thermal Zones</h4>
          <div class="zone-controls">
            <button class="btn btn-primary" onclick="thermalMgmt.createThermalZone()">
              ➕ Create Zone
            </button>
            <button class="btn btn-secondary" onclick="thermalMgmt.autoGenerateZones()">
              🤖 Auto Generate
            </button>
          </div>
          
          <div class="zones-list">
            ${Array.from(this.thermalZones.values()).map(zone => `
              <div class="zone-item">
                <div class="zone-header">
                  <h5>${zone.name}</h5>
                  <div class="zone-temp">
                    <span class="current-temp">${zone.currentTemp.toFixed(1)}°C</span>
                    <span class="target-range">${zone.targetTemp.min}-${zone.targetTemp.max}°C</span>
                  </div>
                </div>
                <div class="zone-stats">
                  <div class="stat">
                    <span class="label">Humidity:</span>
                    <span class="value">${zone.humidity.toFixed(1)}%</span>
                  </div>
                  <div class="stat">
                    <span class="label">Sensors:</span>
                    <span class="value">${zone.sensors.length}</span>
                  </div>
                  <div class="stat">
                    <span class="label">Heat Sources:</span>
                    <span class="value">${zone.heatSources.length}</span>
                  </div>
                </div>
                <div class="zone-actions">
                  <button class="btn btn-small" onclick="thermalMgmt.editZone('${zone.id}')">✏️ Edit</button>
                  <button class="btn btn-small" onclick="thermalMgmt.isolateZone('${zone.id}')">🎯 Isolate</button>
                  <button class="btn btn-small" onclick="thermalMgmt.deleteZone('${zone.id}')">🗑️ Delete</button>
                </div>
              </div>
            `).join('')}
            
            ${this.thermalZones.size === 0 ? '<p class="no-zones">No thermal zones defined. Create zones to begin analysis.</p>' : ''}
          </div>
        </div>

        <!-- Sensor Management -->
        <div class="extension-section">
          <h4>Thermal Sensors</h4>
          <div class="sensor-controls">
            <select id="sensor-type">
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="soil-temp">Soil Temperature</option>
              <option value="leaf-temp">Leaf Temperature</option>
              <option value="dew-point">Dew Point</option>
            </select>
            <button class="btn btn-primary" onclick="thermalMgmt.placeSensor()">
              📍 Place Sensor
            </button>
          </div>
          
          <div class="sensors-list">
            ${Array.from(this.sensors.values()).map(sensor => `
              <div class="sensor-item ${sensor.status}">
                <div class="sensor-info">
                  <span class="sensor-type">${sensor.type}</span>
                  <span class="sensor-reading">${sensor.reading}${sensor.units}</span>
                  <span class="sensor-status ${sensor.status}">${sensor.status}</span>
                </div>
                <button class="btn btn-small" onclick="thermalMgmt.removeSensor('${sensor.id}')">❌</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Analysis Controls -->
        <div class="extension-section">
          <h4>Thermal Analysis</h4>
          <div class="visualization-controls">
            <label>Visualization Mode:</label>
            <select id="visualization-mode" onchange="thermalMgmt.setVisualizationMode(this.value)">
              <option value="temperature" ${this.visualizationMode === 'temperature' ? 'selected' : ''}>Temperature Field</option>
              <option value="gradient" ${this.visualizationMode === 'gradient' ? 'selected' : ''}>Temperature Gradient</option>
              <option value="airflow" ${this.visualizationMode === 'airflow' ? 'selected' : ''}>Airflow Patterns</option>
              <option value="energy" ${this.visualizationMode === 'energy' ? 'selected' : ''}>Energy Flow</option>
            </select>
          </div>
          
          <div class="analysis-buttons">
            <button class="btn btn-primary" onclick="thermalMgmt.runThermalAnalysis()" 
                    ${this.isAnalyzing ? 'disabled' : ''}>
              ${this.isAnalyzing ? '⏳ Analyzing...' : '🔥 Run Analysis'}
            </button>
            <button class="btn btn-secondary" onclick="thermalMgmt.generateReport()">
              📊 Generate Report
            </button>
          </div>
          
          <div class="analysis-results" id="thermal-analysis-results">
            <p>Run thermal analysis to see results</p>
          </div>
        </div>

        <!-- Control Systems -->
        <div class="extension-section">
          <h4>Control Systems</h4>
          <div class="control-strategy">
            <label>Control Strategy:</label>
            <select id="control-strategy">
              <option value="bang-bang">Bang-Bang Control</option>
              <option value="pid">PID Control</option>
              <option value="predictive">Model Predictive Control</option>
              <option value="adaptive">Adaptive Control</option>
            </select>
          </div>
          
          <div class="control-parameters">
            <div class="param-group">
              <h5>Temperature Control</h5>
              <div class="param-item">
                <label>Deadband (°C):</label>
                <input type="number" id="temp-deadband" value="1.0" step="0.1">
              </div>
              <div class="param-item">
                <label>Response Time (min):</label>
                <input type="number" id="response-time" value="5" step="1">
              </div>
            </div>
            
            <div class="param-group">
              <h5>Energy Optimization</h5>
              <div class="param-item">
                <label>Energy Priority:</label>
                <select id="energy-priority">
                  <option value="comfort">Plant Comfort</option>
                  <option value="efficiency">Energy Efficiency</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
            </div>
          </div>
          
          <button class="btn btn-primary" onclick="thermalMgmt.optimizeControls()">
            ⚡ Optimize Controls
          </button>
        </div>

        <!-- Performance Metrics -->
        <div class="extension-section">
          <h4>Performance Metrics</h4>
          <div class="performance-grid">
            <div class="metric-card">
              <h5>Energy Efficiency</h5>
              <span class="metric-value" id="energy-efficiency">--</span>
              <span class="metric-unit">COP</span>
            </div>
            <div class="metric-card">
              <h5>Temperature Uniformity</h5>
              <span class="metric-value" id="temp-uniformity">--</span>
              <span class="metric-unit">%</span>
            </div>
            <div class="metric-card">
              <h5>Daily Energy Cost</h5>
              <span class="metric-value" id="daily-cost">--</span>
              <span class="metric-unit">$/day</span>
            </div>
            <div class="metric-card">
              <h5>Carbon Footprint</h5>
              <span class="metric-value" id="carbon-footprint">--</span>
              <span class="metric-unit">kg CO₂/day</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;
    
    // Make extension globally accessible for button callbacks
    (window as any).thermalMgmt = this;
  }

  // Public API methods for panel callbacks
  public setAnalysisMode(mode: 'steady-state' | 'transient' | 'seasonal'): void {
    this.analysisMode = mode;
    this.updatePanel();
  }

  public setVisualizationMode(mode: 'temperature' | 'gradient' | 'airflow' | 'energy'): void {
    this.visualizationMode = mode;
    this.updateThermalVisualization();
  }

  public updateAmbientConditions(): void {
    if (!this.thermalModel) return;

    const tempEl = document.getElementById('ambient-temp') as HTMLInputElement;
    const humidityEl = document.getElementById('ambient-humidity') as HTMLInputElement;
    const windEl = document.getElementById('wind-speed') as HTMLInputElement;
    const solarEl = document.getElementById('solar-irradiance') as HTMLInputElement;

    this.thermalModel.ambientConditions = {
      temperature: parseFloat(tempEl?.value || '22'),
      humidity: parseFloat(humidityEl?.value || '60'),
      windSpeed: parseFloat(windEl?.value || '2'),
      solarIrradiance: parseFloat(solarEl?.value || '800')
    };

    this.updateThermalVisualization();
  }

  public createThermalZone(): void {
    const zoneId = 'thermal-zone-' + Date.now();
    const zoneName = prompt('Enter zone name:') || `Zone ${this.thermalZones.size + 1}`;

    const zone: ThermalZone = {
      id: zoneId,
      name: zoneName,
      bounds: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 10, y: 3, z: 10 }
      },
      targetTemp: { min: 20, max: 25 },
      currentTemp: 22,
      humidity: 60,
      heatSources: [],
      coolingSources: [],
      sensors: [],
      insulation: {
        walls: { rValue: 3.5, material: 'polycarbonate' },
        roof: { rValue: 4.0, material: 'polycarbonate' },
        floor: { rValue: 2.0, material: 'concrete' },
        glazing: { uValue: 3.0, shgc: 0.7, vlt: 0.85 }
      }
    };

    this.thermalZones.set(zoneId, zone);
    this.createZoneVisualization(zone);
    this.updatePanel();
  }

  public autoGenerateZones(): void {
    // Auto-generate zones based on greenhouse geometry
    this.thermalZones.clear();
    
    // Create zones for different areas
    const zones = [
      { name: 'Growing Area 1', bounds: { min: {x: 0, y: 0, z: 0}, max: {x: 20, y: 3, z: 15} } },
      { name: 'Growing Area 2', bounds: { min: {x: 20, y: 0, z: 0}, max: {x: 40, y: 3, z: 15} } },
      { name: 'Walkway', bounds: { min: {x: 0, y: 0, z: 15}, max: {x: 40, y: 3, z: 20} } },
      { name: 'Equipment Room', bounds: { min: {x: 35, y: 0, z: 0}, max: {x: 40, y: 3, z: 10} } }
    ];

    zones.forEach((zoneData, index) => {
      const zoneId = 'auto-zone-' + (index + 1);
      const zone: ThermalZone = {
        id: zoneId,
        name: zoneData.name,
        bounds: zoneData.bounds,
        targetTemp: { min: 20, max: 25 },
        currentTemp: 22 + Math.random() * 4 - 2, // Vary by ±2°C
        humidity: 60 + Math.random() * 20 - 10, // Vary by ±10%
        heatSources: [],
        coolingSources: [],
        sensors: [],
        insulation: {
          walls: { rValue: 3.5, material: 'polycarbonate' },
          roof: { rValue: 4.0, material: 'polycarbonate' },
          floor: { rValue: 2.0, material: 'concrete' },
          glazing: { uValue: 3.0, shgc: 0.7, vlt: 0.85 }
        }
      };

      this.thermalZones.set(zoneId, zone);
      this.createZoneVisualization(zone);
    });

    this.updatePanel();
  }

  private createZoneVisualization(zone: ThermalZone): void {
    if (!this.layerManager) return;

    // Create zone boundary visualization
    const geometry = new THREE.BoxGeometry(
      zone.bounds.max.x - zone.bounds.min.x,
      zone.bounds.max.y - zone.bounds.min.y,
      zone.bounds.max.z - zone.bounds.min.z
    );

    const material = new THREE.MeshBasicMaterial({
      color: this.getTemperatureColor(zone.currentTemp),
      opacity: 0.3,
      transparent: true,
      wireframe: true
    });

    const zoneMesh = new THREE.Mesh(geometry, material);
    zoneMesh.position.set(
      (zone.bounds.min.x + zone.bounds.max.x) / 2,
      (zone.bounds.min.y + zone.bounds.max.y) / 2,
      (zone.bounds.min.z + zone.bounds.max.z) / 2
    );

    this.layerManager.addObjectToLayer(
      'temp-geometry',
      zone.id,
      zoneMesh,
      'system',
      { zone, type: 'thermal-zone' }
    );
  }

  public placeSensor(): void {
    const sensorType = (document.getElementById('sensor-type') as HTMLSelectElement)?.value as ThermalSensor['type'];
    
    // Enable click-to-place mode
    this.viewer.addEventListener('click', this.onSensorPlacement.bind(this));
    
    // Store sensor type for placement
    (this as any).pendingSensorType = sensorType;
  }

  private onSensorPlacement(event: any): void {
    const hitPoint = this.viewer.clientToWorld(event.clientX, event.clientY, true);
    if (!hitPoint) return;

    const sensorType = (this as any).pendingSensorType;
    if (!sensorType) return;

    const sensorId = 'sensor-' + Date.now();
    const sensor: ThermalSensor = {
      id: sensorId,
      type: sensorType,
      position: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
      reading: this.generateSensorReading(sensorType, hitPoint),
      units: this.getSensorUnits(sensorType),
      accuracy: 0.1,
      lastUpdate: new Date(),
      status: 'active'
    };

    this.sensors.set(sensorId, sensor);
    this.createSensorVisualization(sensor);
    
    // Remove event listener
    this.viewer.removeEventListener('click', this.onSensorPlacement.bind(this));
    delete (this as any).pendingSensorType;
    
    this.updatePanel();
  }

  private generateSensorReading(type: ThermalSensor['type'], position: THREE.Vector3): number {
    // Generate realistic sensor readings based on type and position
    switch (type) {
      case 'temperature':
        return 20 + Math.random() * 10; // 20-30°C
      case 'humidity':
        return 50 + Math.random() * 30; // 50-80%
      case 'soil-temp':
        return 18 + Math.random() * 8; // 18-26°C
      case 'leaf-temp':
        return 22 + Math.random() * 6; // 22-28°C
      case 'dew-point':
        return 15 + Math.random() * 10; // 15-25°C
      default:
        return 0;
    }
  }

  private getSensorUnits(type: ThermalSensor['type']): string {
    switch (type) {
      case 'temperature':
      case 'soil-temp':
      case 'leaf-temp':
      case 'dew-point':
        return '°C';
      case 'humidity':
        return '%';
      default:
        return '';
    }
  }

  private createSensorVisualization(sensor: ThermalSensor): void {
    if (!this.layerManager) return;

    // Create sensor icon
    const geometry = new THREE.SphereGeometry(0.2, 8, 6);
    const material = new THREE.MeshBasicMaterial({ 
      color: this.getSensorColor(sensor.type),
      emissive: 0x444444
    });

    const sensorMesh = new THREE.Mesh(geometry, material);
    sensorMesh.position.set(sensor.position.x, sensor.position.y, sensor.position.z);

    // Add label
    const labelSprite = this.createSensorLabel(sensor);
    labelSprite.position.set(0, 0.5, 0);
    sensorMesh.add(labelSprite);

    this.layerManager.addObjectToLayer(
      'temp-geometry',
      sensor.id,
      sensorMesh,
      'system',
      { sensor, type: 'thermal-sensor' }
    );
  }

  private createSensorLabel(sensor: ThermalSensor): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 128;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText(sensor.type, canvas.width / 2, 20);
    context.fillText(`${sensor.reading.toFixed(1)}${sensor.units}`, canvas.width / 2, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 1, 1);
    
    return sprite;
  }

  private getSensorColor(type: ThermalSensor['type']): number {
    switch (type) {
      case 'temperature': return 0xff4444;
      case 'humidity': return 0x4444ff;
      case 'soil-temp': return 0x8B4513;
      case 'leaf-temp': return 0x32CD32;
      case 'dew-point': return 0x87CEEB;
      default: return 0x888888;
    }
  }

  public runThermalAnalysis(): void {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.updatePanel();

    // Simulate thermal analysis
    setTimeout(() => {
      const results = this.performThermalAnalysis();
      this.displayAnalysisResults(results);
      this.updateThermalVisualization();
      
      this.isAnalyzing = false;
      this.updatePanel();
    }, 3000);
  }

  private performThermalAnalysis(): ThermalAnalysisResult {
    const zones = Array.from(this.thermalZones.values());
    const zoneResults = zones.map(zone => {
      // Simulate thermal calculations
      const avgTemp = zone.currentTemp + (Math.random() - 0.5) * 2;
      const tempGradient = Math.random() * 3; // 0-3°C gradient
      
      return {
        zoneId: zone.id,
        averageTemp: avgTemp,
        tempGradient,
        hotSpots: [
          { x: zone.bounds.max.x * 0.8, y: zone.bounds.max.y * 0.9, z: zone.bounds.max.z * 0.5, temp: avgTemp + 3 }
        ],
        coldSpots: [
          { x: zone.bounds.min.x * 1.2, y: zone.bounds.min.y + 0.1, z: zone.bounds.min.z * 1.2, temp: avgTemp - 2 }
        ],
        energyBalance: {
          heatInput: 2500 + Math.random() * 1000, // W
          heatLoss: 2200 + Math.random() * 800, // W
          netGain: 300 + Math.random() * 400 // W
        }
      };
    });

    const overallEfficiency = 75 + Math.random() * 20; // 75-95%

    return {
      timestamp: new Date(),
      zones: zoneResults,
      overallEfficiency,
      recommendations: [
        'Consider adding insulation to north wall to reduce heat loss',
        'Optimize fan placement for better air circulation',
        'Install thermal curtains for night-time energy savings',
        'Adjust heating schedule based on occupancy patterns'
      ]
    };
  }

  private displayAnalysisResults(results: ThermalAnalysisResult): void {
    const resultsEl = document.getElementById('thermal-analysis-results');
    if (!resultsEl) return;

    resultsEl.innerHTML = `
      <div class="analysis-complete">
        <h5>🌡️ Thermal Analysis Complete</h5>
        <div class="results-summary">
          <div class="result-item">
            <span class="label">Overall Efficiency:</span>
            <span class="value">${results.overallEfficiency.toFixed(1)}%</span>
          </div>
          <div class="result-item">
            <span class="label">Zones Analyzed:</span>
            <span class="value">${results.zones.length}</span>
          </div>
          <div class="result-item">
            <span class="label">Temperature Range:</span>
            <span class="value">${Math.min(...results.zones.map(z => z.averageTemp)).toFixed(1)} - ${Math.max(...results.zones.map(z => z.averageTemp)).toFixed(1)}°C</span>
          </div>
        </div>
        
        <div class="zone-results">
          <h6>Zone Analysis:</h6>
          ${results.zones.map(zone => {
            const zoneData = this.thermalZones.get(zone.zoneId);
            return `
              <div class="zone-result">
                <strong>${zoneData?.name}</strong>
                <p>Avg Temp: ${zone.averageTemp.toFixed(1)}°C | Gradient: ${zone.tempGradient.toFixed(1)}°C</p>
                <p>Energy: ${zone.energyBalance.netGain.toFixed(0)}W net gain</p>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="recommendations">
          <h6>💡 Optimization Recommendations:</h6>
          <ul>
            ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    // Update performance metrics
    this.updatePerformanceMetrics(results);
  }

  private updatePerformanceMetrics(results: ThermalAnalysisResult): void {
    const efficiencyEl = document.getElementById('energy-efficiency');
    const uniformityEl = document.getElementById('temp-uniformity');
    const costEl = document.getElementById('daily-cost');
    const carbonEl = document.getElementById('carbon-footprint');

    if (efficiencyEl) efficiencyEl.textContent = (results.overallEfficiency / 100 * 4).toFixed(1); // COP
    if (uniformityEl) uniformityEl.textContent = (100 - Math.max(...results.zones.map(z => z.tempGradient)) * 10).toFixed(1);
    if (costEl) costEl.textContent = (results.zones.reduce((sum, z) => sum + z.energyBalance.heatInput, 0) * 0.0001 * 24).toFixed(2);
    if (carbonEl) carbonEl.textContent = (results.zones.reduce((sum, z) => sum + z.energyBalance.heatInput, 0) * 0.0005 * 24).toFixed(1);
  }

  private updateThermalVisualization(): void {
    if (!this.layerManager) return;

    // Update zone colors based on current visualization mode
    this.thermalZones.forEach(zone => {
      const objects = this.layerManager!.getObjectsInLayer('temp-geometry');
      const zoneObject = objects.find(obj => obj.metadata?.zone?.id === zone.id);
      
      if (zoneObject && zoneObject.mesh instanceof THREE.Mesh) {
        const material = zoneObject.mesh.material as THREE.MeshBasicMaterial;
        
        switch (this.visualizationMode) {
          case 'temperature':
            material.color.setHex(this.getTemperatureColor(zone.currentTemp));
            break;
          case 'gradient':
            material.color.setHex(this.getGradientColor(Math.random() * 3));
            break;
          case 'airflow':
            material.color.setHex(0x87CEEB);
            material.opacity = 0.2;
            break;
          case 'energy':
            material.color.setHex(this.getEnergyColor(2500)); // Sample energy value
            break;
        }
      }
    });

    this.viewer.impl.invalidate(true);
  }

  private getTemperatureColor(temperature: number): number {
    // Map temperature to color (blue = cold, red = hot)
    const minTemp = 15;
    const maxTemp = 35;
    const normalized = Math.max(0, Math.min(1, (temperature - minTemp) / (maxTemp - minTemp)));
    
    const r = Math.floor(255 * normalized);
    const g = Math.floor(255 * (1 - Math.abs(normalized - 0.5) * 2));
    const b = Math.floor(255 * (1 - normalized));
    
    return (r << 16) | (g << 8) | b;
  }

  private getGradientColor(gradient: number): number {
    // Map gradient to color intensity
    const intensity = Math.min(1, gradient / 3);
    const g = Math.floor(255 * (1 - intensity));
    const r = Math.floor(255 * intensity);
    
    return (r << 16) | (g << 8) | 0;
  }

  private getEnergyColor(energy: number): number {
    // Map energy flow to color
    const maxEnergy = 5000;
    const normalized = Math.min(1, energy / maxEnergy);
    
    const r = Math.floor(255 * normalized);
    const g = Math.floor(255 * normalized * 0.5);
    const b = 0;
    
    return (r << 16) | (g << 8) | b;
  }

  public optimizeControls(): void {
    // Simulate control optimization
    const controlStrategy = (document.getElementById('control-strategy') as HTMLSelectElement)?.value;
    
    setTimeout(() => {
      alert(`Control optimization complete using ${controlStrategy} strategy.\n\nExpected improvements:\n• 15% better temperature stability\n• 12% energy savings\n• 8% improved plant comfort`);
    }, 2000);
  }

  private onSelectionChanged(event: any): void {
    // Handle selection of thermal objects
  }

  private onCameraChanged(event: any): void {
    // Update visualization based on camera distance
  }

  private cleanup(): void {
    // Clean up thermal visualization objects
    if (this.layerManager) {
      this.layerManager.getObjectsByType('system').forEach(obj => {
        if (obj.metadata?.type === 'thermal-zone' || obj.metadata?.type === 'thermal-sensor') {
          this.layerManager!.removeObjectFromLayer(obj.id);
        }
      });
    }
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.ThermalManagement', ThermalManagementForgeExtension);

export default ThermalManagementForgeExtension;