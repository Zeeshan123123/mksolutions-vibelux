/**
 * VibeLux Environmental Controls 3D Extension for Autodesk Forge
 * Complete environmental control systems for greenhouse automation
 */

import { VibeLuxLayerManager } from './layer-manager';

interface EnvironmentalSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'pressure' | 'wind' | 'rain';
  name: string;
  position: THREE.Vector3;
  zone: string;
  currentValue: number;
  targetValue?: number;
  range: { min: number; max: number };
  units: string;
  accuracy: number;
  lastUpdate: Date;
  status: 'active' | 'inactive' | 'error' | 'calibrating';
  calibrationDate?: Date;
  batteryLevel?: number;
  wirelessSignal?: number;
}

interface ControlDevice {
  id: string;
  type: 'fan' | 'heater' | 'cooler' | 'vent' | 'pump' | 'valve' | 'shade' | 'misting' | 'lighting';
  name: string;
  position: THREE.Vector3;
  zone: string;
  currentState: number; // 0-100% or on/off
  targetState?: number;
  capacity: number;
  powerConsumption: number;
  efficiency: number;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  lastMaintenance?: Date;
  operatingHours: number;
  controlMode: 'manual' | 'automatic' | 'scheduled';
}

interface EnvironmentalZone {
  id: string;
  name: string;
  description: string;
  area: number; // m²
  volume: number; // m³
  cropType?: string;
  growthStage?: 'seed' | 'vegetative' | 'flowering' | 'harvest';
  
  // Environmental setpoints
  setpoints: {
    temperature: { day: number; night: number; tolerance: number };
    humidity: { day: number; night: number; tolerance: number };
    co2: { target: number; tolerance: number };
    light: { ppfd: number; photoperiod: number; spectrum: string };
    irrigation: { frequency: number; duration: number; ec: number; ph: number };
  };
  
  // Current conditions
  conditions: {
    temperature: number;
    humidity: number;
    co2: number;
    light: number;
    vaporPressureDeficit: number;
    dewPoint: number;
  };
  
  sensors: string[]; // Sensor IDs
  devices: string[]; // Device IDs
  bounds: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
}

interface ControlStrategy {
  id: string;
  name: string;
  type: 'pid' | 'fuzzy' | 'neural' | 'adaptive' | 'predictive';
  parameters: { [key: string]: number };
  active: boolean;
  performance: {
    setpointAccuracy: number;
    energyEfficiency: number;
    stabilityIndex: number;
  };
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  trigger: {
    type: 'sensor' | 'time' | 'external' | 'manual';
    condition: string; // e.g., "temperature > 25"
    sensorId?: string;
    timeSchedule?: string;
  };
  actions: {
    deviceId: string;
    action: 'on' | 'off' | 'set' | 'adjust';
    value?: number;
    duration?: number;
  }[];
  conditions: {
    zones?: string[];
    timeRange?: { start: string; end: string };
    weatherConditions?: string[];
  };
}

interface Recipe {
  id: string;
  name: string;
  cropType: string;
  description: string;
  stages: {
    name: string;
    duration: number; // days
    environmental: {
      temperature: { day: number; night: number };
      humidity: { day: number; night: number };
      co2: number;
      light: { ppfd: number; photoperiod: number };
      irrigation: { frequency: number; ec: number; ph: number };
    };
  }[];
  createdBy: string;
  dateCreated: Date;
  performance?: {
    yield: number;
    quality: number;
    energyUsage: number;
  };
}

class EnvironmentalControlsForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private zones: Map<string, EnvironmentalZone> = new Map();
  private sensors: Map<string, EnvironmentalSensor> = new Map();
  private devices: Map<string, ControlDevice> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private recipes: Map<string, Recipe> = new Map();
  private controlStrategies: Map<string, ControlStrategy> = new Map();
  private activeView: 'overview' | 'zones' | 'sensors' | 'devices' | 'automation' | 'recipes' = 'overview';
  private selectedZone: string | null = null;
  private isMonitoring: boolean = false;
  private simulationSpeed: number = 1; // 1x real-time

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeDefaultData();
  }

  load(): boolean {
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    
    this.setupUI();
    this.startMonitoring();
    console.log('VibeLux Environmental Controls Extension loaded');
    return true;
  }

  unload(): boolean {
    this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    
    this.stopMonitoring();
    
    if (this.panel) {
      this.panel.uninitialize();
      this.panel = null;
    }
    
    this.cleanup();
    console.log('VibeLux Environmental Controls Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-environmental-panel',
      'Environmental Controls',
      {
        dockRight: true,
        shadow: true,
        width: 450,
        height: 750
      }
    );

    this.updatePanel();
    this.createToolbarButton();
  }

  private createToolbarButton(): void {
    const toolbar = this.viewer.getToolbar(true);
    const envToolbar = toolbar.getControl('vibelux-env-toolbar');
    
    if (!envToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-env-toolbar');
      
      const envButton = new Autodesk.Viewing.UI.Button('env-controls-btn');
      envButton.setToolTip('Environmental Controls');
      envButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          <path d="M8.5,8.5L15.5,15.5M8.5,15.5L15.5,8.5" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="3" fill="none" stroke="white" stroke-width="1"/>
        </svg>
      `));
      envButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(envButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeDefaultData(): void {
    // Create default environmental zones
    this.zones.set('zone-1', {
      id: 'zone-1',
      name: 'Vegetative Zone A',
      description: 'Main growing area for vegetative crops',
      area: 1000,
      volume: 3000,
      cropType: 'Leafy Greens',
      growthStage: 'vegetative',
      setpoints: {
        temperature: { day: 24, night: 20, tolerance: 2 },
        humidity: { day: 65, night: 75, tolerance: 5 },
        co2: { target: 800, tolerance: 100 },
        light: { ppfd: 200, photoperiod: 14, spectrum: 'full-spectrum' },
        irrigation: { frequency: 3, duration: 10, ec: 1.8, ph: 6.0 }
      },
      conditions: {
        temperature: 23.5,
        humidity: 67,
        co2: 750,
        light: 195,
        vaporPressureDeficit: 0.85,
        dewPoint: 17.2
      },
      sensors: [],
      devices: [],
      bounds: {
        min: new THREE.Vector3(0, 0, 0),
        max: new THREE.Vector3(25, 3, 40)
      }
    });

    // Create sensors
    this.sensors.set('temp-01', {
      id: 'temp-01',
      type: 'temperature',
      name: 'Temperature Sensor 01',
      position: new THREE.Vector3(12, 2, 20),
      zone: 'zone-1',
      currentValue: 23.5,
      targetValue: 24,
      range: { min: 0, max: 50 },
      units: '°C',
      accuracy: 0.1,
      lastUpdate: new Date(),
      status: 'active',
      batteryLevel: 85,
      wirelessSignal: 92
    });

    this.sensors.set('humid-01', {
      id: 'humid-01',
      type: 'humidity',
      name: 'Humidity Sensor 01',
      position: new THREE.Vector3(12, 2, 20),
      zone: 'zone-1',
      currentValue: 67,
      targetValue: 65,
      range: { min: 0, max: 100 },
      units: '%RH',
      accuracy: 1,
      lastUpdate: new Date(),
      status: 'active',
      batteryLevel: 78,
      wirelessSignal: 89
    });

    // Create control devices
    this.devices.set('fan-01', {
      id: 'fan-01',
      type: 'fan',
      name: 'Circulation Fan 01',
      position: new THREE.Vector3(5, 2.5, 35),
      zone: 'zone-1',
      currentState: 45,
      targetState: 50,
      capacity: 2000, // CFM
      powerConsumption: 150, // Watts
      efficiency: 85,
      status: 'active',
      operatingHours: 2450,
      controlMode: 'automatic'
    });

    // Create automation rules
    this.automationRules.set('temp-control', {
      id: 'temp-control',
      name: 'Temperature Control',
      enabled: true,
      priority: 1,
      trigger: {
        type: 'sensor',
        condition: 'temperature > 26',
        sensorId: 'temp-01'
      },
      actions: [
        {
          deviceId: 'fan-01',
          action: 'set',
          value: 80
        }
      ],
      conditions: {
        zones: ['zone-1'],
        timeRange: { start: '06:00', end: '22:00' }
      }
    });

    // Create default recipe
    this.recipes.set('lettuce-standard', {
      id: 'lettuce-standard',
      name: 'Standard Lettuce Recipe',
      cropType: 'Lettuce',
      description: 'Optimized growing conditions for butterhead lettuce',
      stages: [
        {
          name: 'Germination',
          duration: 7,
          environmental: {
            temperature: { day: 22, night: 20 },
            humidity: { day: 80, night: 85 },
            co2: 600,
            light: { ppfd: 150, photoperiod: 16 },
            irrigation: { frequency: 2, ec: 1.2, ph: 6.0 }
          }
        },
        {
          name: 'Vegetative Growth',
          duration: 21,
          environmental: {
            temperature: { day: 24, night: 20 },
            humidity: { day: 65, night: 75 },
            co2: 800,
            light: { ppfd: 200, photoperiod: 14 },
            irrigation: { frequency: 3, ec: 1.8, ph: 6.0 }
          }
        }
      ],
      createdBy: 'VibeLux Team',
      dateCreated: new Date()
    });

    console.log('Environmental controls initialized with default data');
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const panelContent = `
      <div class="environmental-controls-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>🌱 Environmental Controls</h3>
          <p>Complete greenhouse automation system</p>
        </div>

        <!-- View Navigation -->
        <div class="extension-section">
          <div class="view-tabs">
            <button class="tab-btn ${this.activeView === 'overview' ? 'active' : ''}" 
                    onclick="envControls.setView('overview')">📊 Overview</button>
            <button class="tab-btn ${this.activeView === 'zones' ? 'active' : ''}" 
                    onclick="envControls.setView('zones')">🏠 Zones</button>
            <button class="tab-btn ${this.activeView === 'sensors' ? 'active' : ''}" 
                    onclick="envControls.setView('sensors')">📡 Sensors</button>
            <button class="tab-btn ${this.activeView === 'devices' ? 'active' : ''}" 
                    onclick="envControls.setView('devices')">⚙️ Devices</button>
            <button class="tab-btn ${this.activeView === 'automation' ? 'active' : ''}" 
                    onclick="envControls.setView('automation')">🤖 Rules</button>
            <button class="tab-btn ${this.activeView === 'recipes' ? 'active' : ''}" 
                    onclick="envControls.setView('recipes')">📋 Recipes</button>
          </div>
        </div>

        ${this.renderActiveView()}

        <!-- System Status -->
        <div class="extension-section">
          <h4>System Status</h4>
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">Monitoring:</span>
              <span class="status-value ${this.isMonitoring ? 'active' : 'inactive'}">
                ${this.isMonitoring ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Active Zones:</span>
              <span class="status-value">${this.zones.size}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Sensors Online:</span>
              <span class="status-value">${Array.from(this.sensors.values()).filter(s => s.status === 'active').length}/${this.sensors.size}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Devices Active:</span>
              <span class="status-value">${Array.from(this.devices.values()).filter(d => d.status === 'active').length}/${this.devices.size}</span>
            </div>
          </div>
          
          <div class="system-controls">
            <button class="btn ${this.isMonitoring ? 'btn-danger' : 'btn-primary'}" 
                    onclick="envControls.toggleMonitoring()">
              ${this.isMonitoring ? '⏹️ Stop' : '▶️ Start'} Monitoring
            </button>
            <button class="btn btn-secondary" onclick="envControls.exportData()">📤 Export Data</button>
          </div>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;
    
    // Make extension globally accessible for button callbacks
    (window as any).envControls = this;
  }

  private renderActiveView(): string {
    switch (this.activeView) {
      case 'overview': return this.renderOverview();
      case 'zones': return this.renderZones();
      case 'sensors': return this.renderSensors();
      case 'devices': return this.renderDevices();
      case 'automation': return this.renderAutomation();
      case 'recipes': return this.renderRecipes();
      default: return '';
    }
  }

  private renderOverview(): string {
    const avgTemp = Array.from(this.sensors.values())
      .filter(s => s.type === 'temperature')
      .reduce((avg, s) => avg + s.currentValue, 0) / this.sensors.size;

    const avgHumidity = Array.from(this.sensors.values())
      .filter(s => s.type === 'humidity')
      .reduce((avg, s) => avg + s.currentValue, 0) / this.sensors.size;

    return `
      <div class="extension-section">
        <h4>Environmental Overview</h4>
        <div class="overview-metrics">
          <div class="metric-grid">
            <div class="metric-card temperature">
              <h5>🌡️ Temperature</h5>
              <span class="metric-value">${avgTemp.toFixed(1)}°C</span>
              <span class="metric-status">Optimal</span>
            </div>
            <div class="metric-card humidity">
              <h5>💧 Humidity</h5>
              <span class="metric-value">${avgHumidity.toFixed(0)}%</span>
              <span class="metric-status">Good</span>
            </div>
            <div class="metric-card co2">
              <h5>🌬️ CO₂</h5>
              <span class="metric-value">750 ppm</span>
              <span class="metric-status">Optimal</span>
            </div>
            <div class="metric-card light">
              <h5>☀️ Light</h5>
              <span class="metric-value">195 PPFD</span>
              <span class="metric-status">Good</span>
            </div>
          </div>
        </div>

        <div class="recent-alerts">
          <h5>Recent Alerts</h5>
          <div class="alert-list">
            <div class="alert-item warning">
              <span class="alert-icon">⚠️</span>
              <span class="alert-text">Zone A humidity slightly high (67% vs 65% target)</span>
              <span class="alert-time">2 min ago</span>
            </div>
            <div class="alert-item info">
              <span class="alert-icon">ℹ️</span>
              <span class="alert-text">Fan 01 adjusted to 45% speed</span>
              <span class="alert-time">5 min ago</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderZones(): string {
    return `
      <div class="extension-section">
        <h4>Environmental Zones</h4>
        <div class="zones-controls">
          <button class="btn btn-primary" onclick="envControls.createZone()">➕ Add Zone</button>
          <button class="btn btn-secondary" onclick="envControls.optimizeZones()">🎯 Optimize</button>
        </div>
        
        <div class="zones-list">
          ${Array.from(this.zones.values()).map(zone => `
            <div class="zone-card ${this.selectedZone === zone.id ? 'selected' : ''}" 
                 onclick="envControls.selectZone('${zone.id}')">
              <div class="zone-header">
                <h5>${zone.name}</h5>
                <span class="zone-crop">${zone.cropType || 'No Crop'}</span>
                <span class="zone-stage">${zone.growthStage || 'N/A'}</span>
              </div>
              
              <div class="zone-conditions">
                <div class="condition-row">
                  <span class="condition-label">Temp:</span>
                  <span class="condition-value ${this.getConditionStatus('temperature', zone)}">${zone.conditions.temperature.toFixed(1)}°C</span>
                  <span class="condition-target">(${zone.setpoints.temperature.day}°C)</span>
                </div>
                <div class="condition-row">
                  <span class="condition-label">Humidity:</span>
                  <span class="condition-value ${this.getConditionStatus('humidity', zone)}">${zone.conditions.humidity.toFixed(0)}%</span>
                  <span class="condition-target">(${zone.setpoints.humidity.day}%)</span>
                </div>
                <div class="condition-row">
                  <span class="condition-label">CO₂:</span>
                  <span class="condition-value ${this.getConditionStatus('co2', zone)}">${zone.conditions.co2} ppm</span>
                  <span class="condition-target">(${zone.setpoints.co2.target} ppm)</span>
                </div>
              </div>
              
              <div class="zone-stats">
                <span class="zone-area">${zone.area}m²</span>
                <span class="zone-sensors">${zone.sensors.length} sensors</span>
                <span class="zone-devices">${zone.devices.length} devices</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderSensors(): string {
    return `
      <div class="extension-section">
        <h4>Sensor Network</h4>
        <div class="sensors-controls">
          <button class="btn btn-primary" onclick="envControls.addSensor()">📡 Add Sensor</button>
          <button class="btn btn-secondary" onclick="envControls.calibrateSensors()">🔧 Calibrate All</button>
        </div>
        
        <div class="sensors-grid">
          ${Array.from(this.sensors.values()).map(sensor => `
            <div class="sensor-card ${sensor.status}">
              <div class="sensor-header">
                <span class="sensor-icon">${this.getSensorIcon(sensor.type)}</span>
                <h5>${sensor.name}</h5>
                <span class="sensor-status ${sensor.status}">${sensor.status}</span>
              </div>
              
              <div class="sensor-reading">
                <span class="reading-value">${sensor.currentValue.toFixed(sensor.type === 'temperature' ? 1 : 0)}</span>
                <span class="reading-unit">${sensor.units}</span>
              </div>
              
              <div class="sensor-details">
                <div class="detail-row">
                  <span class="detail-label">Zone:</span>
                  <span class="detail-value">${this.zones.get(sensor.zone)?.name || 'Unknown'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Battery:</span>
                  <span class="detail-value">${sensor.batteryLevel || 'N/A'}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Signal:</span>
                  <span class="detail-value">${sensor.wirelessSignal || 'N/A'}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Updated:</span>
                  <span class="detail-value">${this.formatTimeAgo(sensor.lastUpdate)}</span>
                </div>
              </div>
              
              <div class="sensor-actions">
                <button class="btn btn-small" onclick="envControls.calibrateSensor('${sensor.id}')">🔧</button>
                <button class="btn btn-small" onclick="envControls.viewSensorHistory('${sensor.id}')">📊</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderDevices(): string {
    return `
      <div class="extension-section">
        <h4>Control Devices</h4>
        <div class="devices-controls">
          <button class="btn btn-primary" onclick="envControls.addDevice()">⚙️ Add Device</button>
          <button class="btn btn-secondary" onclick="envControls.runMaintenance()">🔧 Maintenance</button>
        </div>
        
        <div class="devices-list">
          ${Array.from(this.devices.values()).map(device => `
            <div class="device-card ${device.status}">
              <div class="device-header">
                <span class="device-icon">${this.getDeviceIcon(device.type)}</span>
                <h5>${device.name}</h5>
                <span class="device-status ${device.status}">${device.status}</span>
              </div>
              
              <div class="device-control">
                <div class="control-slider">
                  <label>Output: ${device.currentState}%</label>
                  <input type="range" min="0" max="100" value="${device.currentState}" 
                         onchange="envControls.setDeviceState('${device.id}', this.value)">
                </div>
                <div class="control-mode">
                  <select onchange="envControls.setControlMode('${device.id}', this.value)">
                    <option value="manual" ${device.controlMode === 'manual' ? 'selected' : ''}>Manual</option>
                    <option value="automatic" ${device.controlMode === 'automatic' ? 'selected' : ''}>Automatic</option>
                    <option value="scheduled" ${device.controlMode === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                  </select>
                </div>
              </div>
              
              <div class="device-stats">
                <div class="stat-row">
                  <span class="stat-label">Power:</span>
                  <span class="stat-value">${Math.round(device.powerConsumption * device.currentState / 100)}W</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Efficiency:</span>
                  <span class="stat-value">${device.efficiency}%</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Hours:</span>
                  <span class="stat-value">${device.operatingHours}h</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderAutomation(): string {
    return `
      <div class="extension-section">
        <h4>Automation Rules</h4>
        <div class="automation-controls">
          <button class="btn btn-primary" onclick="envControls.createRule()">➕ New Rule</button>
          <button class="btn btn-secondary" onclick="envControls.testRules()">🧪 Test Rules</button>
        </div>
        
        <div class="rules-list">
          ${Array.from(this.automationRules.values()).map(rule => `
            <div class="rule-card ${rule.enabled ? 'enabled' : 'disabled'}">
              <div class="rule-header">
                <h5>${rule.name}</h5>
                <label class="rule-toggle">
                  <input type="checkbox" ${rule.enabled ? 'checked' : ''} 
                         onchange="envControls.toggleRule('${rule.id}', this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="rule-definition">
                <div class="rule-trigger">
                  <strong>When:</strong> ${rule.trigger.condition}
                </div>
                <div class="rule-actions">
                  <strong>Then:</strong> 
                  ${rule.actions.map(action => 
                    `${this.devices.get(action.deviceId)?.name || 'Device'} → ${action.action} ${action.value || ''}`
                  ).join(', ')}
                </div>
              </div>
              
              <div class="rule-meta">
                <span class="rule-priority">Priority: ${rule.priority}</span>
                <div class="rule-actions-buttons">
                  <button class="btn btn-small" onclick="envControls.editRule('${rule.id}')">✏️</button>
                  <button class="btn btn-small" onclick="envControls.duplicateRule('${rule.id}')">📋</button>
                  <button class="btn btn-small" onclick="envControls.deleteRule('${rule.id}')">🗑️</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderRecipes(): string {
    return `
      <div class="extension-section">
        <h4>Growing Recipes</h4>
        <div class="recipes-controls">
          <button class="btn btn-primary" onclick="envControls.createRecipe()">📋 New Recipe</button>
          <button class="btn btn-secondary" onclick="envControls.importRecipe()">📥 Import</button>
        </div>
        
        <div class="recipes-list">
          ${Array.from(this.recipes.values()).map(recipe => `
            <div class="recipe-card">
              <div class="recipe-header">
                <h5>${recipe.name}</h5>
                <span class="recipe-crop">${recipe.cropType}</span>
              </div>
              
              <div class="recipe-description">
                <p>${recipe.description}</p>
              </div>
              
              <div class="recipe-stages">
                <strong>Stages (${recipe.stages.length}):</strong>
                ${recipe.stages.map(stage => `
                  <div class="stage-item">
                    <span class="stage-name">${stage.name}</span>
                    <span class="stage-duration">${stage.duration} days</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="recipe-meta">
                <span class="recipe-creator">By: ${recipe.createdBy}</span>
                <span class="recipe-date">${recipe.dateCreated.toLocaleDateString()}</span>
              </div>
              
              <div class="recipe-actions">
                <button class="btn btn-primary" onclick="envControls.applyRecipe('${recipe.id}')">✨ Apply</button>
                <button class="btn btn-secondary" onclick="envControls.editRecipe('${recipe.id}')">✏️ Edit</button>
                <button class="btn btn-secondary" onclick="envControls.exportRecipe('${recipe.id}')">📤 Export</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Public API methods for panel callbacks
  public setView(view: string): void {
    this.activeView = view as any;
    this.updatePanel();
  }

  public selectZone(zoneId: string): void {
    this.selectedZone = this.selectedZone === zoneId ? null : zoneId;
    this.updatePanel();
    
    if (this.selectedZone) {
      this.highlightZone(zoneId);
    } else {
      this.clearHighlights();
    }
  }

  public toggleMonitoring(): void {
    this.isMonitoring = !this.isMonitoring;
    
    if (this.isMonitoring) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
    
    this.updatePanel();
  }

  private startMonitoring(): void {
    this.isMonitoring = true;
    
    // Simulate real-time monitoring
    setInterval(() => {
      if (this.isMonitoring) {
        this.updateSensorReadings();
        this.processAutomationRules();
        this.updateDeviceStates();
      }
    }, 5000); // Update every 5 seconds
  }

  private stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private updateSensorReadings(): void {
    // Simulate sensor reading updates
    this.sensors.forEach(sensor => {
      if (sensor.status === 'active') {
        // Add small random variation to simulate real conditions
        const variation = (Math.random() - 0.5) * 0.2;
        sensor.currentValue += variation;
        
        // Keep within reasonable bounds
        sensor.currentValue = Math.max(sensor.range.min, 
          Math.min(sensor.range.max, sensor.currentValue));
        
        sensor.lastUpdate = new Date();
      }
    });
  }

  private processAutomationRules(): void {
    this.automationRules.forEach(rule => {
      if (rule.enabled) {
        // Simple rule evaluation (in real system would be more sophisticated)
        if (rule.trigger.type === 'sensor' && rule.trigger.sensorId) {
          const sensor = this.sensors.get(rule.trigger.sensorId);
          if (sensor) {
            // Parse simple condition (e.g., "temperature > 26")
            const condition = rule.trigger.condition;
            const matches = condition.match(/(temperature|humidity|co2|light)\s*([><=]+)\s*(\d+\.?\d*)/);
            
            if (matches) {
              const [, sensorType, operator, threshold] = matches;
              const value = sensor.currentValue;
              const thresholdNum = parseFloat(threshold);
              
              let triggered = false;
              switch (operator) {
                case '>': triggered = value > thresholdNum; break;
                case '<': triggered = value < thresholdNum; break;
                case '>=': triggered = value >= thresholdNum; break;
                case '<=': triggered = value <= thresholdNum; break;
                case '=': case '==': triggered = Math.abs(value - thresholdNum) < 0.1; break;
              }
              
              if (triggered) {
                // Execute actions
                rule.actions.forEach(action => {
                  const device = this.devices.get(action.deviceId);
                  if (device) {
                    switch (action.action) {
                      case 'set':
                        device.targetState = action.value || 0;
                        break;
                      case 'on':
                        device.targetState = 100;
                        break;
                      case 'off':
                        device.targetState = 0;
                        break;
                      case 'adjust':
                        device.targetState = Math.max(0, Math.min(100, 
                          (device.targetState || device.currentState) + (action.value || 0)));
                        break;
                    }
                  }
                });
              }
            }
          }
        }
      }
    });
  }

  private updateDeviceStates(): void {
    // Gradually move device states toward their targets
    this.devices.forEach(device => {
      if (device.targetState !== undefined) {
        const diff = device.targetState - device.currentState;
        if (Math.abs(diff) > 1) {
          // Move 10% toward target each update
          device.currentState += diff * 0.1;
        } else {
          device.currentState = device.targetState;
        }
        
        // Update operating hours
        if (device.currentState > 0) {
          device.operatingHours += (5 / 3600); // 5 seconds converted to hours
        }
      }
    });
  }

  private getConditionStatus(condition: string, zone: EnvironmentalZone): string {
    const current = zone.conditions[condition as keyof typeof zone.conditions];
    const setpoint = zone.setpoints[condition as keyof typeof zone.setpoints];
    
    if (typeof setpoint === 'object' && 'day' in setpoint) {
      const target = setpoint.day;
      const tolerance = setpoint.tolerance || 2;
      
      if (Math.abs(current - target) <= tolerance) {
        return 'optimal';
      } else if (Math.abs(current - target) <= tolerance * 2) {
        return 'warning';
      } else {
        return 'critical';
      }
    } else if (typeof setpoint === 'object' && 'target' in setpoint) {
      const target = setpoint.target;
      const tolerance = setpoint.tolerance || 50;
      
      if (Math.abs(current - target) <= tolerance) {
        return 'optimal';
      } else {
        return 'warning';
      }
    }
    
    return 'unknown';
  }

  private getSensorIcon(type: string): string {
    const icons = {
      temperature: '🌡️',
      humidity: '💧',
      co2: '🌬️',
      light: '☀️',
      ph: '🧪',
      ec: '⚡',
      pressure: '📊',
      wind: '💨',
      rain: '🌧️'
    };
    return icons[type as keyof typeof icons] || '📡';
  }

  private getDeviceIcon(type: string): string {
    const icons = {
      fan: '🌪️',
      heater: '🔥',
      cooler: '❄️',
      vent: '🚪',
      pump: '⚡',
      valve: '🚰',
      shade: '🏠',
      misting: '💨',
      lighting: '💡'
    };
    return icons[type as keyof typeof icons] || '⚙️';
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private highlightZone(zoneId: string): void {
    // Highlight the selected zone in the 3D view
    const zone = this.zones.get(zoneId);
    if (zone && this.layerManager) {
      // Create zone boundary visualization
      const geometry = new THREE.BoxGeometry(
        zone.bounds.max.x - zone.bounds.min.x,
        zone.bounds.max.y - zone.bounds.min.y,
        zone.bounds.max.z - zone.bounds.min.z
      );

      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 0.2,
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
        'selected-zone',
        zoneMesh,
        'system',
        { type: 'zone-highlight' }
      );
    }
  }

  private clearHighlights(): void {
    if (this.layerManager) {
      this.layerManager.removeObjectFromLayer('selected-zone');
    }
  }

  public setDeviceState(deviceId: string, value: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.targetState = parseInt(value);
      device.controlMode = 'manual';
    }
  }

  public toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  public exportData(): void {
    const data = {
      zones: Array.from(this.zones.entries()),
      sensors: Array.from(this.sensors.entries()),
      devices: Array.from(this.devices.entries()),
      rules: Array.from(this.automationRules.entries()),
      recipes: Array.from(this.recipes.entries()),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vibelux_environmental_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private onSelectionChanged(event: any): void {
    // Handle selection of environmental objects
  }

  private cleanup(): void {
    // Clean up environmental visualization objects
    if (this.layerManager) {
      this.layerManager.getObjectsByType('system').forEach(obj => {
        if (obj.metadata?.type === 'zone-highlight') {
          this.layerManager!.removeObjectFromLayer(obj.id);
        }
      });
    }
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.EnvironmentalControls', EnvironmentalControlsForgeExtension);

export default EnvironmentalControlsForgeExtension;