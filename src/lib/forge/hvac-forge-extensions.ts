/**
 * HVAC & MEP Forge Extensions Suite
 * Complete mechanical, electrical, and plumbing design integration
 */

import { ForgeExtension } from './vibelux-forge-extensions';
import { CFDEngine } from '../cfd/cfd-engine';

/**
 * HVAC Design Extension
 * 3D HVAC equipment placement and system design
 */
export class HVACDesignExtension extends ForgeExtension {
  private hvacPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private hvacEquipment: Map<string, any> = new Map();
  private ductwork: Map<string, any> = new Map();
  private selectedEquipment: string | null = null;

  getName(): string {
    return 'VibeLux.HVACDesign';
  }

  load(): boolean {
    this.createHVACPanel();
    this.setupToolbar();
    this.setupEventHandlers();
    console.log('VibeLux HVAC Design Extension loaded');
    return true;
  }

  unload(): boolean {
    if (this.hvacPanel) {
      this.hvacPanel.uninitialize();
      this.hvacPanel = null;
    }
    return true;
  }

  private createHVACPanel(): void {
    this.hvacPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-hvac-panel',
      'HVAC System Designer',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="hvac-designer">
        <div class="hvac-header">
          <h3>🌡️ HVAC System Designer</h3>
          <p>Design complete mechanical systems in 3D</p>
        </div>
        
        <div class="hvac-section">
          <h4>Equipment Library</h4>
          <div class="equipment-grid">
            <div class="equipment-item" data-type="exhaust-fan">
              <div class="equipment-icon">🌪️</div>
              <span>Exhaust Fan</span>
            </div>
            <div class="equipment-item" data-type="supply-fan">
              <div class="equipment-icon">💨</div>
              <span>Supply Fan</span>
            </div>
            <div class="equipment-item" data-type="heater">
              <div class="equipment-icon">🔥</div>
              <span>Unit Heater</span>
            </div>
            <div class="equipment-item" data-type="cooling-pad">
              <div class="equipment-icon">❄️</div>
              <span>Cooling Pad</span>
            </div>
            <div class="equipment-item" data-type="air-handler">
              <div class="equipment-icon">🏭</div>
              <span>Air Handler</span>
            </div>
            <div class="equipment-item" data-type="duct">
              <div class="equipment-icon">🔲</div>
              <span>Ductwork</span>
            </div>
          </div>
        </div>
        
        <div class="hvac-section">
          <h4>System Configuration</h4>
          <div class="config-group">
            <label>Facility Type:</label>
            <select id="facility-type">
              <option value="greenhouse">Greenhouse</option>
              <option value="vertical-farm">Vertical Farm</option>
              <option value="warehouse">Warehouse</option>
              <option value="research">Research Facility</option>
            </select>
          </div>
          
          <div class="config-group">
            <label>Climate Zone:</label>
            <select id="climate-zone">
              <option value="1a">1A - Very Hot, Humid</option>
              <option value="2a">2A - Hot, Humid</option>
              <option value="3a">3A - Warm, Humid</option>
              <option value="4a">4A - Mixed, Humid</option>
              <option value="5a">5A - Cool, Humid</option>
              <option value="6a">6A - Cold, Humid</option>
            </select>
          </div>
          
          <div class="config-group">
            <label>Design Temperature:</label>
            <div class="temp-range">
              <input type="range" id="temp-range" min="60" max="85" value="75">
              <span id="temp-value">75°F</span>
            </div>
          </div>
        </div>
        
        <div class="hvac-section">
          <h4>Equipment Properties</h4>
          <div id="equipment-properties">
            <p class="no-selection">Select equipment to view properties</p>
          </div>
        </div>
        
        <div class="hvac-section">
          <h4>System Analysis</h4>
          <div class="analysis-controls">
            <button id="calculate-loads" class="btn btn-primary">
              📊 Calculate Loads
            </button>
            <button id="run-cfd" class="btn btn-secondary">
              🌪️ Run CFD Analysis
            </button>
            <button id="size-equipment" class="btn btn-secondary">
              📏 Size Equipment
            </button>
          </div>
          
          <div id="analysis-results" class="analysis-results hidden">
            <div class="result-item">
              <span class="label">Heating Load:</span>
              <span class="value" id="heating-load">--</span>
            </div>
            <div class="result-item">
              <span class="label">Cooling Load:</span>
              <span class="value" id="cooling-load">--</span>
            </div>
            <div class="result-item">
              <span class="label">Ventilation:</span>
              <span class="value" id="ventilation-rate">--</span>
            </div>
            <div class="result-item">
              <span class="label">Air Changes:</span>
              <span class="value" id="air-changes">--</span>
            </div>
          </div>
        </div>
        
        <div class="hvac-section">
          <h4>Export & Reports</h4>
          <div class="export-controls">
            <button id="export-hvac-dwg" class="btn btn-outline">
              📄 Export DWG
            </button>
            <button id="generate-hvac-report" class="btn btn-outline">
              📋 Generate Report
            </button>
          </div>
        </div>
      </div>
    `;

    this.hvacPanel.container.innerHTML = panelContent;
    this.setupHVACInterface();
  }

  private setupHVACInterface(): void {
    // Equipment selection
    const equipmentItems = this.hvacPanel?.container.querySelectorAll('.equipment-item');
    equipmentItems?.forEach(item => {
      item.addEventListener('click', (e) => {
        const equipmentType = (e.currentTarget as HTMLElement).dataset.type;
        if (equipmentType) {
          this.selectEquipmentType(equipmentType);
        }
      });
    });

    // Temperature range
    const tempRange = this.hvacPanel?.container.querySelector('#temp-range') as HTMLInputElement;
    const tempValue = this.hvacPanel?.container.querySelector('#temp-value');
    tempRange?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (tempValue) tempValue.textContent = `${value}°F`;
    });

    // Analysis buttons
    const calculateLoads = this.hvacPanel?.container.querySelector('#calculate-loads');
    const runCFD = this.hvacPanel?.container.querySelector('#run-cfd');
    const sizeEquipment = this.hvacPanel?.container.querySelector('#size-equipment');

    calculateLoads?.addEventListener('click', () => this.calculateHVACLoads());
    runCFD?.addEventListener('click', () => this.runCFDAnalysis());
    sizeEquipment?.addEventListener('click', () => this.sizeEquipment());

    // Export buttons
    const exportDWG = this.hvacPanel?.container.querySelector('#export-hvac-dwg');
    const generateReport = this.hvacPanel?.container.querySelector('#generate-hvac-report');

    exportDWG?.addEventListener('click', () => this.exportHVACDrawing());
    generateReport?.addEventListener('click', () => this.generateHVACReport());
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const hvacGroup = toolbar.getControl('hvac-controls') || 
      toolbar.addControl('hvac-controls', { collapsible: true, index: 1 });

    // Equipment placement tool
    const placementTool = new Autodesk.Viewing.UI.Button('hvac-placement-btn');
    placementTool.setToolTip('Place HVAC Equipment');
    placementTool.setIcon('adsk-icon-properties');
    placementTool.onClick = () => this.togglePlacementMode();
    hvacGroup.addControl(placementTool);

    // Ductwork tool
    const ductworkTool = new Autodesk.Viewing.UI.Button('hvac-ductwork-btn');
    ductworkTool.setToolTip('Draw Ductwork');
    ductworkTool.setIcon('adsk-icon-measure');
    ductworkTool.onClick = () => this.toggleDuctworkMode();
    hvacGroup.addControl(ductworkTool);

    // Airflow visualization
    const airflowTool = new Autodesk.Viewing.UI.Button('hvac-airflow-btn');
    airflowTool.setToolTip('Show Airflow');
    airflowTool.setIcon('adsk-icon-visibility');
    airflowTool.onClick = () => this.toggleAirflowVisualization();
    hvacGroup.addControl(airflowTool);
  }

  private setupEventHandlers(): void {
    // Click handler for equipment placement
    this.viewer.addEventListener(Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT, () => {
      this.viewer.canvas.addEventListener('click', (event) => {
        if (this.selectedEquipment) {
          this.placeEquipment(event);
        }
      });
    });

    // Selection handler for equipment properties
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
      const selection = event.dbIdArray;
      if (selection.length > 0) {
        this.showEquipmentProperties(selection[0]);
      }
    });
  }

  private selectEquipmentType(equipmentType: string): void {
    this.selectedEquipment = equipmentType;
    
    // Highlight selected equipment
    const equipmentItems = this.hvacPanel?.container.querySelectorAll('.equipment-item');
    equipmentItems?.forEach(item => item.classList.remove('selected'));
    
    const selectedItem = this.hvacPanel?.container.querySelector(`[data-type="${equipmentType}"]`);
    selectedItem?.classList.add('selected');
    
    // Change cursor to indicate placement mode
    this.viewer.canvas.style.cursor = 'crosshair';
  }

  private async placeEquipment(event: MouseEvent): Promise<void> {
    if (!this.selectedEquipment) return;

    const rect = this.viewer.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const hitPoint = this.viewer.clientToWorld(x, y, true);
    if (!hitPoint) return;

    // Create 3D equipment based on type
    const equipment = await this.create3DEquipment(
      this.selectedEquipment, 
      hitPoint
    );
    
    if (equipment) {
      const equipmentId = `hvac_${Date.now()}`;
      this.hvacEquipment.set(equipmentId, equipment);
      
      // Add to scene
      this.viewer.impl.scene.add(equipment);
      this.viewer.impl.invalidate(true);
      
      // Clear selection
      this.selectedEquipment = null;
      this.viewer.canvas.style.cursor = 'default';
      
      // Remove selection from UI
      const equipmentItems = this.hvacPanel?.container.querySelectorAll('.equipment-item');
      equipmentItems?.forEach(item => item.classList.remove('selected'));
    }
  }

  private async create3DEquipment(
    equipmentType: string, 
    position: THREE.Vector3
  ): Promise<THREE.Object3D | null> {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    switch (equipmentType) {
      case 'exhaust-fan':
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
        material = new THREE.MeshBasicMaterial({ color: 0x666666 });
        break;
        
      case 'supply-fan':
        geometry = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 12);
        material = new THREE.MeshBasicMaterial({ color: 0x4444aa });
        break;
        
      case 'heater':
        geometry = new THREE.BoxGeometry(2, 1, 3);
        material = new THREE.MeshBasicMaterial({ color: 0xaa4444 });
        break;
        
      case 'cooling-pad':
        geometry = new THREE.BoxGeometry(8, 6, 1);
        material = new THREE.MeshBasicMaterial({ color: 0x44aaaa });
        break;
        
      case 'air-handler':
        geometry = new THREE.BoxGeometry(4, 3, 8);
        material = new THREE.MeshBasicMaterial({ color: 0x888888 });
        break;
        
      default:
        return null;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    // Add equipment metadata
    mesh.userData = {
      type: 'hvac_equipment',
      equipmentType: equipmentType,
      specifications: this.getEquipmentSpecs(equipmentType),
      id: `hvac_${Date.now()}`
    };
    
    return mesh;
  }

  private getEquipmentSpecs(equipmentType: string): any {
    const specs: Record<string, any> = {
      'exhaust-fan': {
        cfm: 5000,
        diameter: '36"',
        power: '1 HP',
        voltage: '480V',
        manufacturer: 'Schaefer',
        model: 'PFVK36'
      },
      'supply-fan': {
        cfm: 3500,
        diameter: '24"', 
        power: '0.75 HP',
        voltage: '480V',
        manufacturer: 'Multifan',
        model: 'V4E50'
      },
      'heater': {
        capacity: '500,000 BTU/hr',
        fuel: 'Natural Gas',
        efficiency: '85%',
        manufacturer: 'Modine',
        model: 'PDP500'
      },
      'cooling-pad': {
        efficiency: '85%',
        thickness: '6"',
        material: 'CELdek',
        manufacturer: 'Munters',
        model: 'CELdek 7090'
      },
      'air-handler': {
        cfm: 10000,
        heating: '1,000,000 BTU/hr',
        cooling: '30 tons',
        manufacturer: 'Trane',
        model: 'RTAC-150'
      }
    };
    
    return specs[equipmentType] || {};
  }

  private showEquipmentProperties(dbId: number): void {
    this.viewer.getProperties(dbId, (props) => {
      if (props.userData?.type === 'hvac_equipment') {
        const specs = props.userData.specifications;
        const propertiesDiv = this.hvacPanel?.container.querySelector('#equipment-properties');
        
        if (propertiesDiv) {
          propertiesDiv.innerHTML = `
            <div class="equipment-details">
              <h5>${props.userData.equipmentType.replace('-', ' ').toUpperCase()}</h5>
              ${Object.entries(specs).map(([key, value]) => 
                `<div class="prop-row">
                  <span class="prop-label">${key}:</span>
                  <span class="prop-value">${value}</span>
                </div>`
              ).join('')}
              <div class="prop-actions">
                <button class="btn btn-small" onclick="this.editEquipment('${props.userData.id}')">
                  ✏️ Edit
                </button>
                <button class="btn btn-small btn-danger" onclick="this.deleteEquipment('${props.userData.id}')">
                  🗑️ Delete
                </button>
              </div>
            </div>
          `;
        }
      }
    });
  }

  private async calculateHVACLoads(): Promise<void> {
    const facilityType = (this.hvacPanel?.container.querySelector('#facility-type') as HTMLSelectElement)?.value;
    const climateZone = (this.hvacPanel?.container.querySelector('#climate-zone') as HTMLSelectElement)?.value;
    const designTemp = parseInt((this.hvacPanel?.container.querySelector('#temp-range') as HTMLInputElement)?.value || '75');
    
    // Get facility dimensions from model
    const bbox = this.viewer.model?.getBoundingBox();
    if (!bbox) return;
    
    const volume = (bbox.max.x - bbox.min.x) * (bbox.max.y - bbox.min.y) * (bbox.max.z - bbox.min.z);
    const area = (bbox.max.x - bbox.min.x) * (bbox.max.y - bbox.min.y);
    
    // Calculate loads based on facility type and climate
    const loads = this.calculateLoads(facilityType, climateZone, designTemp, volume, area);
    
    // Display results
    const resultsDiv = this.hvacPanel?.container.querySelector('#analysis-results');
    resultsDiv?.classList.remove('hidden');
    
    const heatingLoad = this.hvacPanel?.container.querySelector('#heating-load');
    const coolingLoad = this.hvacPanel?.container.querySelector('#cooling-load');
    const ventilationRate = this.hvacPanel?.container.querySelector('#ventilation-rate');
    const airChanges = this.hvacPanel?.container.querySelector('#air-changes');
    
    if (heatingLoad) heatingLoad.textContent = `${loads.heating.toLocaleString()} BTU/hr`;
    if (coolingLoad) coolingLoad.textContent = `${loads.cooling.toLocaleString()} BTU/hr`;
    if (ventilationRate) ventilationRate.textContent = `${loads.ventilation.toLocaleString()} CFM`;
    if (airChanges) airChanges.textContent = `${loads.airChanges.toFixed(1)} ACH`;
  }

  private calculateLoads(
    facilityType: string,
    climateZone: string, 
    designTemp: number,
    volume: number,
    area: number
  ): any {
    // Simplified load calculations (real version would be more sophisticated)
    const baseHeating = area * 40; // 40 BTU/hr/sqft base load
    const baseCooling = area * 25; // 25 BTU/hr/sqft base load
    const baseVentilation = volume * 0.1; // 0.1 CFM/cuft
    
    // Climate zone multipliers
    const climateMultipliers: Record<string, { heating: number; cooling: number }> = {
      '1a': { heating: 0.5, cooling: 1.5 },
      '2a': { heating: 0.7, cooling: 1.3 },
      '3a': { heating: 0.9, cooling: 1.1 },
      '4a': { heating: 1.0, cooling: 1.0 },
      '5a': { heating: 1.2, cooling: 0.8 },
      '6a': { heating: 1.5, cooling: 0.6 }
    };
    
    // Facility type multipliers
    const facilityMultipliers: Record<string, { heating: number; cooling: number; ventilation: number }> = {
      'greenhouse': { heating: 1.5, cooling: 1.2, ventilation: 2.0 },
      'vertical-farm': { heating: 0.8, cooling: 1.8, ventilation: 1.5 },
      'warehouse': { heating: 1.0, cooling: 1.0, ventilation: 1.0 },
      'research': { heating: 1.1, cooling: 1.3, ventilation: 3.0 }
    };
    
    const climateMultiplier = climateMultipliers[climateZone] || climateMultipliers['4a'];
    const facilityMultiplier = facilityMultipliers[facilityType] || facilityMultipliers['greenhouse'];
    
    return {
      heating: baseHeating * climateMultiplier.heating * facilityMultiplier.heating,
      cooling: baseCooling * climateMultiplier.cooling * facilityMultiplier.cooling,
      ventilation: baseVentilation * facilityMultiplier.ventilation,
      airChanges: (baseVentilation * facilityMultiplier.ventilation * 60) / volume
    };
  }

  private async runCFDAnalysis(): Promise<void> {
    // Get CFD extension if available
    const cfdExtension = this.viewer.getExtension('VibeLux.CFDVisualization');
    if (cfdExtension) {
      await cfdExtension.runAnalysis();
    } else {
      console.log('CFD Extension not loaded');
    }
  }

  private sizeEquipment(): void {
    // Auto-size equipment based on calculated loads
    const loads = this.getCalculatedLoads();
    if (!loads) {
      alert('Please calculate loads first');
      return;
    }
    
    // Size each piece of equipment
    this.hvacEquipment.forEach((equipment, id) => {
      const equipmentType = equipment.userData.equipmentType;
      const newSpecs = this.autoSizeEquipment(equipmentType, loads);
      equipment.userData.specifications = { ...equipment.userData.specifications, ...newSpecs };
    });
    
    // Update display
    this.viewer.impl.invalidate(true);
  }

  private autoSizeEquipment(equipmentType: string, loads: any): any {
    switch (equipmentType) {
      case 'exhaust-fan':
        return {
          cfm: Math.ceil(loads.ventilation / 2), // Split between supply and exhaust
          power: `${Math.ceil(loads.ventilation / 5000)} HP`
        };
      case 'supply-fan':
        return {
          cfm: Math.ceil(loads.ventilation / 2),
          power: `${Math.ceil(loads.ventilation / 5000)} HP`
        };
      case 'heater':
        return {
          capacity: `${Math.ceil(loads.heating / 100000) * 100000} BTU/hr`
        };
      default:
        return {};
    }
  }

  private getCalculatedLoads(): any {
    const heatingElement = this.hvacPanel?.container.querySelector('#heating-load');
    if (!heatingElement || heatingElement.textContent === '--') {
      return null;
    }
    
    return {
      heating: parseInt(heatingElement.textContent?.replace(/[^0-9]/g, '') || '0'),
      cooling: parseInt(this.hvacPanel?.container.querySelector('#cooling-load')?.textContent?.replace(/[^0-9]/g, '') || '0'),
      ventilation: parseInt(this.hvacPanel?.container.querySelector('#ventilation-rate')?.textContent?.replace(/[^0-9]/g, '') || '0')
    };
  }

  private togglePlacementMode(): void {
    // Toggle equipment placement mode
    if (this.selectedEquipment) {
      this.selectedEquipment = null;
      this.viewer.canvas.style.cursor = 'default';
    } else {
      // Show equipment selection UI
      this.hvacPanel?.setVisible(true);
    }
  }

  private toggleDuctworkMode(): void {
    // Implement ductwork drawing mode
    console.log('Ductwork mode toggle');
  }

  private toggleAirflowVisualization(): void {
    // Toggle airflow particle visualization
    const cfdExtension = this.viewer.getExtension('VibeLux.CFDVisualization');
    if (cfdExtension) {
      cfdExtension.toggleVisualization();
    }
  }

  private exportHVACDrawing(): void {
    // Export HVAC layout to DWG
    const hvacData = {
      equipment: Array.from(this.hvacEquipment.values()).map(eq => ({
        type: eq.userData.equipmentType,
        position: eq.position,
        specifications: eq.userData.specifications
      })),
      ductwork: Array.from(this.ductwork.values()),
      calculations: this.getCalculatedLoads()
    };
    
    // Trigger export via API
    fetch('/api/export/hvac-dwg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hvacData)
    }).then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hvac-layout.dwg';
        a.click();
      });
  }

  private generateHVACReport(): void {
    // Generate professional HVAC report
    const reportExtension = this.viewer.getExtension('VibeLux.ProfessionalReports');
    if (reportExtension) {
      reportExtension.generateHVACReport({
        equipment: this.hvacEquipment,
        calculations: this.getCalculatedLoads(),
        specifications: this.getSystemSpecifications()
      });
    }
  }

  private getSystemSpecifications(): any {
    return {
      facilityType: (this.hvacPanel?.container.querySelector('#facility-type') as HTMLSelectElement)?.value,
      climateZone: (this.hvacPanel?.container.querySelector('#climate-zone') as HTMLSelectElement)?.value,
      designTemperature: (this.hvacPanel?.container.querySelector('#temp-range') as HTMLInputElement)?.value + '°F',
      totalEquipment: this.hvacEquipment.size
    };
  }
}

export default HVACDesignExtension;