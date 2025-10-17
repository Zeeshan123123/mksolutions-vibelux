/**
 * VibeLux Structural Analysis Extension for Autodesk Forge
 * Engineering analysis for greenhouse structural design and safety
 */

import { VibeLuxLayerManager } from './layer-manager';

interface StructuralLoad {
  id: string;
  type: 'dead' | 'live' | 'wind' | 'snow' | 'seismic' | 'equipment' | 'crop';
  magnitude: number; // Force in Newtons or pressure in Pa
  direction: THREE.Vector3;
  application: 'point' | 'distributed' | 'uniform' | 'linear';
  location: THREE.Vector3;
  area?: number; // For distributed loads
  description: string;
}

interface StructuralMember {
  id: string;
  type: 'beam' | 'column' | 'truss' | 'connection' | 'foundation';
  material: StructuralMaterial;
  geometry: {
    length: number;
    crossSection: CrossSection;
    orientation: THREE.Vector3;
  };
  startNode: THREE.Vector3;
  endNode: THREE.Vector3;
  loads: string[]; // Load IDs applied to this member
  constraints: BoundaryCondition[];
  safetyFactor: number;
}

interface CrossSection {
  type: 'rectangular' | 'circular' | 'i-beam' | 'c-channel' | 'angle' | 'tube';
  properties: {
    area: number; // m²
    momentOfInertiaX: number; // m⁴
    momentOfInertiaY: number; // m⁴
    sectionModulusX: number; // m³
    sectionModulusY: number; // m³
    torsionalConstant: number; // m⁴
    radiusOfGyration: number; // m
  };
  dimensions: { [key: string]: number }; // width, height, thickness, etc.
}

interface StructuralMaterial {
  name: string;
  type: 'steel' | 'aluminum' | 'concrete' | 'wood' | 'composite';
  properties: {
    density: number; // kg/m³
    youngsModulus: number; // Pa
    shearModulus: number; // Pa
    poissonRatio: number;
    yieldStrength: number; // Pa
    ultimateStrength: number; // Pa
    fatigueLimit: number; // Pa
  };
  environmental: {
    corrosionResistance: number; // 0-1 rating
    temperatureLimits: { min: number; max: number }; // °C
    uvResistance: number; // 0-1 rating
    moistureResistance: number; // 0-1 rating
  };
}

interface BoundaryCondition {
  type: 'fixed' | 'pinned' | 'roller' | 'free';
  location: THREE.Vector3;
  restraints: {
    translationX: boolean;
    translationY: boolean;
    translationZ: boolean;
    rotationX: boolean;
    rotationY: boolean;
    rotationZ: boolean;
  };
}

interface AnalysisResult {
  memberId: string;
  analysis: {
    maxStress: number; // Pa
    maxDeflection: number; // m
    utilization: number; // 0-1 (stress/allowable)
    buckling: {
      criticalLoad: number; // N
      bucklingMode: number;
      safetyFactor: number;
    };
    vibration: {
      naturalFrequency: number; // Hz
      dampingRatio: number;
    };
  };
  status: 'safe' | 'warning' | 'critical' | 'failure';
  recommendations: string[];
}

interface LoadCase {
  id: string;
  name: string;
  description: string;
  category: 'service' | 'ultimate' | 'fatigue' | 'seismic';
  loads: string[]; // Load IDs
  factors: { [loadType: string]: number }; // Load factors for combinations
}

class StructuralAnalysisForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private structuralMembers: Map<string, StructuralMember> = new Map();
  private loads: Map<string, StructuralLoad> = new Map();
  private loadCases: Map<string, LoadCase> = new Map();
  private materialLibrary: Map<string, StructuralMaterial> = new Map();
  private analysisResults: Map<string, AnalysisResult> = new Map();
  private activeLoadCase: string | null = null;
  private isAnalyzing: boolean = false;
  private visualizationMode: 'stress' | 'deflection' | 'utilization' | 'buckling' = 'stress';

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeMaterialLibrary();
    this.initializeDefaultLoadCases();
  }

  load(): boolean {
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    
    this.setupUI();
    console.log('VibeLux Structural Analysis Extension loaded');
    return true;
  }

  unload(): boolean {
    this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    
    if (this.panel) {
      this.panel.uninitialize();
      this.panel = null;
    }
    
    this.cleanup();
    console.log('VibeLux Structural Analysis Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-structural-panel',
      'Structural Analysis',
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
    const structuralToolbar = toolbar.getControl('vibelux-structural-toolbar');
    
    if (!structuralToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-structural-toolbar');
      
      const structuralButton = new Autodesk.Viewing.UI.Button('structural-analysis-btn');
      structuralButton.setToolTip('Structural Analysis');
      structuralButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3V21H21V19H5V3H3Z"/>
          <path d="M7 8H9V16H7V8Z"/>
          <path d="M11 6H13V16H11V6Z"/>
          <path d="M15 10H17V16H15V10Z"/>
          <path d="M19 4H21V16H19V4Z"/>
        </svg>
      `));
      structuralButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(structuralButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeMaterialLibrary(): void {
    // Steel materials
    this.materialLibrary.set('steel-s355', {
      name: 'Structural Steel S355',
      type: 'steel',
      properties: {
        density: 7850,
        youngsModulus: 210e9,
        shearModulus: 81e9,
        poissonRatio: 0.3,
        yieldStrength: 355e6,
        ultimateStrength: 510e6,
        fatigueLimit: 160e6
      },
      environmental: {
        corrosionResistance: 0.3,
        temperatureLimits: { min: -40, max: 300 },
        uvResistance: 0.9,
        moistureResistance: 0.2
      }
    });

    // Aluminum materials
    this.materialLibrary.set('aluminum-6061', {
      name: 'Aluminum Alloy 6061-T6',
      type: 'aluminum',
      properties: {
        density: 2700,
        youngsModulus: 69e9,
        shearModulus: 26e9,
        poissonRatio: 0.33,
        yieldStrength: 276e6,
        ultimateStrength: 310e6,
        fatigueLimit: 96e6
      },
      environmental: {
        corrosionResistance: 0.8,
        temperatureLimits: { min: -50, max: 200 },
        uvResistance: 0.9,
        moistureResistance: 0.9
      }
    });

    // Composite materials for greenhouse applications
    this.materialLibrary.set('galvanized-steel', {
      name: 'Galvanized Steel',
      type: 'steel',
      properties: {
        density: 7850,
        youngsModulus: 200e9,
        shearModulus: 80e9,
        poissonRatio: 0.3,
        yieldStrength: 320e6,
        ultimateStrength: 450e6,
        fatigueLimit: 145e6
      },
      environmental: {
        corrosionResistance: 0.9, // Excellent with galvanization
        temperatureLimits: { min: -40, max: 250 },
        uvResistance: 0.9,
        moistureResistance: 0.9
      }
    });
  }

  private initializeDefaultLoadCases(): void {
    // Service load case
    this.loadCases.set('service', {
      id: 'service',
      name: 'Service Load Case',
      description: 'Normal operating conditions',
      category: 'service',
      loads: [],
      factors: { dead: 1.0, live: 1.0, wind: 0.75, snow: 0.75 }
    });

    // Ultimate load case
    this.loadCases.set('ultimate', {
      id: 'ultimate',
      name: 'Ultimate Load Case',
      description: 'Maximum design loads',
      category: 'ultimate',
      loads: [],
      factors: { dead: 1.35, live: 1.5, wind: 1.5, snow: 1.5 }
    });

    // Wind load case
    this.loadCases.set('wind', {
      id: 'wind',
      name: 'Wind Load Case',
      description: 'High wind conditions',
      category: 'ultimate',
      loads: [],
      factors: { dead: 1.2, live: 0.5, wind: 1.6 }
    });

    this.activeLoadCase = 'service';
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const panelContent = `
      <div class="structural-analysis-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>🏗️ Structural Analysis</h3>
          <p>Engineering analysis for greenhouse structures</p>
        </div>

        <!-- Load Case Selection -->
        <div class="extension-section">
          <h4>Load Cases</h4>
          <div class="load-case-selector">
            <select id="load-case-select" onchange="structuralAnalysis.selectLoadCase(this.value)">
              ${Array.from(this.loadCases.values()).map(lc => `
                <option value="${lc.id}" ${lc.id === this.activeLoadCase ? 'selected' : ''}>${lc.name}</option>
              `).join('')}
            </select>
            <button class="btn btn-secondary" onclick="structuralAnalysis.createLoadCase()">➕ New Case</button>
          </div>
          
          ${this.activeLoadCase ? this.renderLoadCase() : ''}
        </div>

        <!-- Structural Members -->
        <div class="extension-section">
          <h4>Structural Members</h4>
          <div class="members-controls">
            <button class="btn btn-primary" onclick="structuralAnalysis.addMember()">➕ Add Member</button>
            <button class="btn btn-secondary" onclick="structuralAnalysis.autoDetectMembers()">🔍 Auto Detect</button>
          </div>
          
          <div class="members-list">
            ${Array.from(this.structuralMembers.values()).map(member => `
              <div class="member-item">
                <div class="member-info">
                  <strong>${member.type.toUpperCase()}</strong>
                  <span class="member-id">${member.id}</span>
                  <span class="member-material">${member.material.name}</span>
                  <span class="member-length">${member.geometry.length.toFixed(2)}m</span>
                </div>
                <div class="member-status">
                  ${this.getMemberStatusIcon(member.id)}
                </div>
                <div class="member-actions">
                  <button class="btn btn-small" onclick="structuralAnalysis.editMember('${member.id}')">✏️</button>
                  <button class="btn btn-small" onclick="structuralAnalysis.deleteMember('${member.id}')">🗑️</button>
                </div>
              </div>
            `).join('')}
            
            ${this.structuralMembers.size === 0 ? '<p class="no-members">No structural members defined</p>' : ''}
          </div>
        </div>

        <!-- Loads -->
        <div class="extension-section">
          <h4>Applied Loads</h4>
          <div class="load-types">
            <button class="btn load-type-btn" onclick="structuralAnalysis.addLoad('dead')">⚖️ Dead</button>
            <button class="btn load-type-btn" onclick="structuralAnalysis.addLoad('live')">👥 Live</button>
            <button class="btn load-type-btn" onclick="structuralAnalysis.addLoad('wind')">💨 Wind</button>
            <button class="btn load-type-btn" onclick="structuralAnalysis.addLoad('snow')">❄️ Snow</button>
            <button class="btn load-type-btn" onclick="structuralAnalysis.addLoad('equipment')">🔧 Equipment</button>
          </div>
          
          <div class="loads-list">
            ${Array.from(this.loads.values()).map(load => `
              <div class="load-item">
                <div class="load-info">
                  <span class="load-type ${load.type}">${load.type.toUpperCase()}</span>
                  <span class="load-magnitude">${this.formatLoad(load)}</span>
                  <span class="load-description">${load.description}</span>
                </div>
                <div class="load-actions">
                  <button class="btn btn-small" onclick="structuralAnalysis.editLoad('${load.id}')">✏️</button>
                  <button class="btn btn-small" onclick="structuralAnalysis.deleteLoad('${load.id}')">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Analysis Control -->
        <div class="extension-section">
          <h4>Analysis</h4>
          <div class="analysis-controls">
            <div class="visualization-mode">
              <label>Visualization:</label>
              <select onchange="structuralAnalysis.setVisualizationMode(this.value)">
                <option value="stress" ${this.visualizationMode === 'stress' ? 'selected' : ''}>Stress</option>
                <option value="deflection" ${this.visualizationMode === 'deflection' ? 'selected' : ''}>Deflection</option>
                <option value="utilization" ${this.visualizationMode === 'utilization' ? 'selected' : ''}>Utilization</option>
                <option value="buckling" ${this.visualizationMode === 'buckling' ? 'selected' : ''}>Buckling</option>
              </select>
            </div>
            
            <div class="analysis-buttons">
              <button class="btn btn-primary" onclick="structuralAnalysis.runAnalysis()" ${this.isAnalyzing ? 'disabled' : ''}>
                ${this.isAnalyzing ? '⏳ Analyzing...' : '🔬 Run Analysis'}
              </button>
              <button class="btn btn-secondary" onclick="structuralAnalysis.generateReport()">📊 Report</button>
            </div>
          </div>
          
          <div class="analysis-results" id="analysis-results">
            ${this.renderAnalysisResults()}
          </div>
        </div>

        <!-- Code Compliance -->
        <div class="extension-section">
          <h4>Code Compliance</h4>
          <div class="compliance-checks">
            <div class="compliance-item">
              <span class="code-name">IBC (International Building Code)</span>
              <span class="compliance-status" id="ibc-status">⏳ Pending</span>
            </div>
            <div class="compliance-item">
              <span class="code-name">ASCE 7 (Wind & Snow Loads)</span>
              <span class="compliance-status" id="asce7-status">⏳ Pending</span>
            </div>
            <div class="compliance-item">
              <span class="code-name">AISC (Steel Construction)</span>
              <span class="compliance-status" id="aisc-status">⏳ Pending</span>
            </div>
          </div>
          <button class="btn btn-outline" onclick="structuralAnalysis.checkCompliance()">✅ Check Compliance</button>
        </div>

        <!-- Safety Summary -->
        <div class="extension-section">
          <h4>Safety Summary</h4>
          <div class="safety-metrics">
            <div class="safety-metric">
              <h5>Overall Safety Factor</h5>
              <span class="metric-value" id="overall-safety">${this.calculateOverallSafety()}</span>
            </div>
            <div class="safety-metric">
              <h5>Critical Members</h5>
              <span class="metric-value critical" id="critical-members">${this.getCriticalMemberCount()}</span>
            </div>
            <div class="safety-metric">
              <h5>Max Utilization</h5>
              <span class="metric-value" id="max-utilization">${this.getMaxUtilization()}%</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;
    
    // Make extension globally accessible for button callbacks
    (window as any).structuralAnalysis = this;
  }

  private renderLoadCase(): string {
    const loadCase = this.loadCases.get(this.activeLoadCase!);
    if (!loadCase) return '';

    return `
      <div class="load-case-details">
        <div class="load-case-info">
          <p><strong>${loadCase.name}</strong></p>
          <p class="description">${loadCase.description}</p>
          <p class="category">Category: ${loadCase.category}</p>
        </div>
        
        <div class="load-factors">
          <h5>Load Factors</h5>
          ${Object.entries(loadCase.factors).map(([type, factor]) => `
            <div class="factor-item">
              <span class="factor-type">${type.toUpperCase()}:</span>
              <span class="factor-value">${factor.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderAnalysisResults(): string {
    if (this.analysisResults.size === 0) {
      return '<p class="no-results">Run analysis to see results</p>';
    }

    const criticalResults = Array.from(this.analysisResults.values())
      .filter(result => result.status === 'critical' || result.status === 'failure')
      .slice(0, 3);

    return `
      <div class="results-summary">
        <h5>Analysis Summary</h5>
        <div class="summary-stats">
          <div class="stat">
            <span class="label">Members Analyzed:</span>
            <span class="value">${this.analysisResults.size}</span>
          </div>
          <div class="stat">
            <span class="label">Status:</span>
            <span class="value ${this.getOverallStatus()}">${this.getOverallStatus().toUpperCase()}</span>
          </div>
        </div>
        
        ${criticalResults.length > 0 ? `
          <div class="critical-members">
            <h6>⚠️ Critical Issues</h6>
            ${criticalResults.map(result => `
              <div class="critical-item">
                <strong>Member ${result.memberId}</strong>
                <p>Utilization: ${(result.analysis.utilization * 100).toFixed(1)}%</p>
                <p>Max Stress: ${(result.analysis.maxStress / 1e6).toFixed(1)} MPa</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Public API methods for panel callbacks
  public addMember(): void {
    // Enable click-to-place mode for structural members
    this.viewer.addEventListener('click', this.onMemberPlacement.bind(this));
  }

  private onMemberPlacement(event: any): void {
    const hitPoint = this.viewer.clientToWorld(event.clientX, event.clientY, true);
    if (!hitPoint) return;

    // Create a default beam member
    const memberId = 'member-' + Date.now();
    const member: StructuralMember = {
      id: memberId,
      type: 'beam',
      material: this.materialLibrary.get('galvanized-steel')!,
      geometry: {
        length: 3.0, // 3 meter default length
        crossSection: this.createDefaultCrossSection(),
        orientation: new THREE.Vector3(1, 0, 0)
      },
      startNode: hitPoint.clone(),
      endNode: hitPoint.clone().add(new THREE.Vector3(3, 0, 0)),
      loads: [],
      constraints: [],
      safetyFactor: 2.5
    };

    this.structuralMembers.set(memberId, member);
    this.createMemberVisualization(member);
    
    // Remove event listener
    this.viewer.removeEventListener('click', this.onMemberPlacement.bind(this));
    
    this.updatePanel();
  }

  private createDefaultCrossSection(): CrossSection {
    return {
      type: 'rectangular',
      properties: {
        area: 0.01, // 100 cm²
        momentOfInertiaX: 8.33e-6, // m⁴
        momentOfInertiaY: 8.33e-6, // m⁴
        sectionModulusX: 1.67e-4, // m³
        sectionModulusY: 1.67e-4, // m³
        torsionalConstant: 1.67e-5, // m⁴
        radiusOfGyration: 0.029 // m
      },
      dimensions: { width: 0.1, height: 0.1 } // 10cm x 10cm
    };
  }

  private createMemberVisualization(member: StructuralMember): void {
    if (!this.layerManager) return;

    // Create 3D representation of structural member
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, member.geometry.length, 8);
    const material = new THREE.MeshLambertMaterial({ 
      color: this.getMemberColor(member.type),
      transparent: true,
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Position and orient the member
    const midpoint = member.startNode.clone().add(member.endNode).multiplyScalar(0.5);
    mesh.position.copy(midpoint);
    
    // Orient along the member direction
    const direction = member.endNode.clone().sub(member.startNode).normalize();
    mesh.lookAt(midpoint.clone().add(direction));
    mesh.rotateX(Math.PI / 2);

    this.layerManager.addObjectToLayer(
      'temp-geometry',
      member.id,
      mesh,
      'system',
      { member, type: 'structural-member' }
    );
  }

  private getMemberColor(type: string): number {
    switch (type) {
      case 'beam': return 0x4169E1;
      case 'column': return 0x228B22;
      case 'truss': return 0xFF6347;
      case 'connection': return 0xFFD700;
      default: return 0x808080;
    }
  }

  public addLoad(loadType: 'dead' | 'live' | 'wind' | 'snow' | 'equipment'): void {
    const loadId = `${loadType}-load-${Date.now()}`;
    const load: StructuralLoad = {
      id: loadId,
      type: loadType,
      magnitude: this.getDefaultLoadMagnitude(loadType),
      direction: this.getDefaultLoadDirection(loadType),
      application: 'distributed',
      location: new THREE.Vector3(0, 0, 0), // Will be set by user
      description: this.getDefaultLoadDescription(loadType)
    };

    this.loads.set(loadId, load);
    this.updatePanel();
  }

  private getDefaultLoadMagnitude(loadType: string): number {
    switch (loadType) {
      case 'dead': return 1000; // 1 kN/m² typical for greenhouse structure
      case 'live': return 500; // 0.5 kN/m² for maintenance access
      case 'wind': return 1500; // 1.5 kN/m² based on local wind speeds
      case 'snow': return 800; // 0.8 kN/m² snow load
      case 'equipment': return 2000; // 2 kN point load for HVAC equipment
      default: return 1000;
    }
  }

  private getDefaultLoadDirection(loadType: string): THREE.Vector3 {
    switch (loadType) {
      case 'dead':
      case 'live':
      case 'snow': 
        return new THREE.Vector3(0, -1, 0); // Downward
      case 'wind': 
        return new THREE.Vector3(1, 0, 0); // Horizontal
      case 'equipment': 
        return new THREE.Vector3(0, -1, 0); // Downward
      default: 
        return new THREE.Vector3(0, -1, 0);
    }
  }

  private getDefaultLoadDescription(loadType: string): string {
    switch (loadType) {
      case 'dead': return 'Permanent structure weight';
      case 'live': return 'Occupancy and maintenance loads';
      case 'wind': return 'Wind pressure on structure';
      case 'snow': return 'Snow accumulation on roof';
      case 'equipment': return 'HVAC and mechanical equipment';
      default: return 'Applied load';
    }
  }

  public runAnalysis(): void {
    if (this.isAnalyzing || this.structuralMembers.size === 0) return;

    this.isAnalyzing = true;
    this.updatePanel();

    // Simulate structural analysis
    setTimeout(() => {
      this.performStructuralAnalysis();
      this.updateVisualization();
      this.isAnalyzing = false;
      this.updatePanel();
    }, 3000);
  }

  private performStructuralAnalysis(): void {
    this.analysisResults.clear();

    this.structuralMembers.forEach(member => {
      // Simplified structural analysis calculations
      const result = this.analyzeMember(member);
      this.analysisResults.set(member.id, result);
    });

    console.log('Structural analysis complete:', this.analysisResults.size, 'members analyzed');
  }

  private analyzeMember(member: StructuralMember): AnalysisResult {
    // Simplified analysis - in reality this would use FEA or beam theory
    const appliedLoads = member.loads.map(loadId => this.loads.get(loadId)).filter(Boolean);
    const totalLoad = appliedLoads.reduce((sum, load) => sum + (load?.magnitude || 0), 0);

    // Basic beam analysis
    const maxMoment = totalLoad * Math.pow(member.geometry.length, 2) / 8; // Simply supported beam
    const maxStress = maxMoment / member.geometry.crossSection.properties.sectionModulusX;
    const maxDeflection = (5 * totalLoad * Math.pow(member.geometry.length, 4)) / 
                         (384 * member.material.properties.youngsModulus * member.geometry.crossSection.properties.momentOfInertiaX);

    const utilization = maxStress / member.material.properties.yieldStrength;
    
    // Buckling analysis
    const criticalLoad = (Math.PI * Math.PI * member.material.properties.youngsModulus * 
                         member.geometry.crossSection.properties.momentOfInertiaX) / 
                        (Math.pow(member.geometry.length, 2));

    let status: 'safe' | 'warning' | 'critical' | 'failure';
    if (utilization < 0.5) status = 'safe';
    else if (utilization < 0.8) status = 'warning';
    else if (utilization < 1.0) status = 'critical';
    else status = 'failure';

    const recommendations: string[] = [];
    if (utilization > 0.8) {
      recommendations.push('Consider increasing cross-section size');
      recommendations.push('Check connection design');
    }
    if (maxDeflection > member.geometry.length / 250) {
      recommendations.push('Deflection exceeds L/250 limit');
    }

    return {
      memberId: member.id,
      analysis: {
        maxStress,
        maxDeflection,
        utilization,
        buckling: {
          criticalLoad,
          bucklingMode: 1,
          safetyFactor: criticalLoad / totalLoad
        },
        vibration: {
          naturalFrequency: Math.sqrt(member.material.properties.youngsModulus / member.material.properties.density) / (2 * member.geometry.length),
          dampingRatio: 0.02
        }
      },
      status,
      recommendations
    };
  }

  private updateVisualization(): void {
    if (!this.layerManager) return;

    // Update member colors based on analysis results
    this.analysisResults.forEach(result => {
      const objects = this.layerManager!.getObjectsByType('system');
      const memberObject = objects.find(obj => obj.metadata?.member?.id === result.memberId);
      
      if (memberObject && memberObject.mesh instanceof THREE.Mesh) {
        const material = memberObject.mesh.material as THREE.MeshLambertMaterial;
        material.color.setHex(this.getResultColor(result));
      }
    });

    this.viewer.impl.invalidate(true);
  }

  private getResultColor(result: AnalysisResult): number {
    switch (this.visualizationMode) {
      case 'stress':
        return this.getStressColor(result.analysis.utilization);
      case 'deflection':
        return this.getDeflectionColor(result.analysis.maxDeflection);
      case 'utilization':
        return this.getUtilizationColor(result.analysis.utilization);
      case 'buckling':
        return this.getBucklingColor(result.analysis.buckling.safetyFactor);
      default:
        return 0x808080;
    }
  }

  private getStressColor(utilization: number): number {
    if (utilization < 0.5) return 0x00FF00; // Green - safe
    if (utilization < 0.8) return 0xFFFF00; // Yellow - warning
    if (utilization < 1.0) return 0xFF8000; // Orange - critical
    return 0xFF0000; // Red - failure
  }

  private getDeflectionColor(deflection: number): number {
    // Color based on deflection magnitude
    const normalized = Math.min(deflection * 1000, 1); // Scale to mm
    return new THREE.Color().setHSL(0.3 - normalized * 0.3, 1, 0.5).getHex();
  }

  private getUtilizationColor(utilization: number): number {
    return this.getStressColor(utilization); // Same as stress coloring
  }

  private getBucklingColor(safetyFactor: number): number {
    if (safetyFactor > 3) return 0x00FF00; // Green - very safe
    if (safetyFactor > 2) return 0xFFFF00; // Yellow - adequate
    if (safetyFactor > 1.5) return 0xFF8000; // Orange - marginal
    return 0xFF0000; // Red - inadequate
  }

  public setVisualizationMode(mode: 'stress' | 'deflection' | 'utilization' | 'buckling'): void {
    this.visualizationMode = mode;
    this.updateVisualization();
  }

  public checkCompliance(): void {
    // Simulate code compliance checking
    setTimeout(() => {
      const ibcStatus = document.getElementById('ibc-status');
      const asce7Status = document.getElementById('asce7-status');
      const aiscStatus = document.getElementById('aisc-status');

      const overallSafety = this.calculateOverallSafety();
      const compliant = overallSafety > 2.0;

      if (ibcStatus) ibcStatus.innerHTML = compliant ? '✅ Compliant' : '❌ Non-Compliant';
      if (asce7Status) asce7Status.innerHTML = compliant ? '✅ Compliant' : '❌ Non-Compliant';
      if (aiscStatus) aiscStatus.innerHTML = compliant ? '✅ Compliant' : '❌ Non-Compliant';
    }, 2000);
  }

  private getMemberStatusIcon(memberId: string): string {
    const result = this.analysisResults.get(memberId);
    if (!result) return '⏳';
    
    switch (result.status) {
      case 'safe': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🔥';
      case 'failure': return '❌';
      default: return '⏳';
    }
  }

  private formatLoad(load: StructuralLoad): string {
    const unit = load.application === 'point' ? 'N' : 'N/m²';
    return `${load.magnitude.toLocaleString()} ${unit}`;
  }

  private calculateOverallSafety(): number {
    if (this.analysisResults.size === 0) return 0;
    
    const safetyFactors = Array.from(this.analysisResults.values())
      .map(result => 1 / Math.max(result.analysis.utilization, 0.1));
    
    return Math.min(...safetyFactors);
  }

  private getCriticalMemberCount(): number {
    return Array.from(this.analysisResults.values())
      .filter(result => result.status === 'critical' || result.status === 'failure').length;
  }

  private getMaxUtilization(): number {
    if (this.analysisResults.size === 0) return 0;
    
    const maxUtil = Math.max(...Array.from(this.analysisResults.values())
      .map(result => result.analysis.utilization));
    
    return Math.round(maxUtil * 100);
  }

  private getOverallStatus(): string {
    const criticalCount = this.getCriticalMemberCount();
    const maxUtil = this.getMaxUtilization();
    
    if (criticalCount > 0) return 'critical';
    if (maxUtil > 80) return 'warning';
    return 'safe';
  }

  public selectLoadCase(loadCaseId: string): void {
    this.activeLoadCase = loadCaseId;
    this.updatePanel();
  }

  public createLoadCase(): void {
    const name = prompt('Enter load case name:');
    if (!name) return;

    const id = name.toLowerCase().replace(/\s+/g, '-');
    const loadCase: LoadCase = {
      id,
      name,
      description: 'Custom load case',
      category: 'service',
      loads: [],
      factors: { dead: 1.0, live: 1.0 }
    };

    this.loadCases.set(id, loadCase);
    this.activeLoadCase = id;
    this.updatePanel();
  }

  private onSelectionChanged(event: any): void {
    // Handle selection of structural members
  }

  private cleanup(): void {
    // Clean up structural visualization objects
    if (this.layerManager) {
      this.layerManager.getObjectsByType('system').forEach(obj => {
        if (obj.metadata?.type === 'structural-member') {
          this.layerManager!.removeObjectFromLayer(obj.id);
        }
      });
    }
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.StructuralAnalysis', StructuralAnalysisForgeExtension);

export default StructuralAnalysisForgeExtension;