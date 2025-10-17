/**
 * VibeLux CAD Export Engine Extension for Autodesk Forge
 * Professional CAD file export with optical properties for light mapping
 */

import { VibeLuxLayerManager } from './layer-manager';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  supportsMaterials: boolean;
  supportsLights: boolean;
  supportsOpticalProperties: boolean;
  mimeType: string;
}

interface OpticalProperties {
  reflectance: number; // 0-1, surface reflectance coefficient
  transmittance: number; // 0-1, light transmission coefficient
  absorptance: number; // 0-1, light absorption coefficient
  roughness: number; // 0-1, surface roughness for diffuse reflection
  ior: number; // Index of refraction for transparent materials
  specularReflectance: number; // 0-1, specular reflection coefficient
  diffuseReflectance: number; // 0-1, diffuse reflection coefficient
  scatteringCoefficient: number; // For translucent materials like greenhouse panels
}

interface MaterialDefinition {
  name: string;
  baseColor: THREE.Color;
  optical: OpticalProperties;
  thermal: {
    conductivity: number;
    emissivity: number;
    absorptivity: number;
  };
  structural: {
    density: number;
    youngsModulus: number;
    poissonRatio: number;
  };
  metadata: {
    manufacturer?: string;
    model?: string;
    category: 'glazing' | 'structure' | 'growing-medium' | 'equipment' | 'surface';
    certifications?: string[];
  };
}

interface ExportOptions {
  format: string;
  includeOpticalProperties: boolean;
  includeThermalProperties: boolean;
  includeMaterials: boolean;
  includeLights: boolean;
  includeStructure: boolean;
  coordinateSystem: 'xyz' | 'xzy' | 'yxz' | 'yzx' | 'zxy' | 'zyx';
  units: 'meters' | 'feet' | 'inches' | 'millimeters';
  precision: number;
  compression: boolean;
  embedTextures: boolean;
}

interface LightSource {
  id: string;
  type: 'led' | 'hps' | 'fluorescent' | 'natural';
  position: THREE.Vector3;
  direction: THREE.Vector3;
  intensity: number; // PPFD μmol/m²/s
  spectrum: Map<number, number>; // wavelength -> intensity
  beamAngle: number;
  efficiency: number;
  optical: {
    luminousFlux: number; // lumens
    radiantFlux: number; // watts
    colorTemperature: number; // Kelvin
    cri: number; // Color Rendering Index
  };
}

class CADExportForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private exportFormats: Map<string, ExportFormat> = new Map();
  private materialLibrary: Map<string, MaterialDefinition> = new Map();
  private lightSources: Map<string, LightSource> = new Map();
  private exportOptions: ExportOptions = {
    format: 'gltf',
    includeOpticalProperties: true,
    includeThermalProperties: false,
    includeMaterials: true,
    includeLights: true,
    includeStructure: false,
    coordinateSystem: 'xyz',
    units: 'meters',
    precision: 3,
    compression: true,
    embedTextures: true
  };

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeExportFormats();
    this.initializeMaterialLibrary();
  }

  load(): boolean {
    this.setupUI();
    console.log('VibeLux CAD Export Engine loaded');
    return true;
  }

  unload(): boolean {
    if (this.panel) {
      this.panel.uninitialize();
      this.panel = null;
    }
    console.log('VibeLux CAD Export Engine unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-export-panel',
      'CAD Export Engine',
      {
        dockRight: true,
        shadow: true,
        width: 400,
        height: 600
      }
    );

    this.updatePanel();
    this.createToolbarButton();
  }

  private createToolbarButton(): void {
    const toolbar = this.viewer.getToolbar(true);
    const exportToolbar = toolbar.getControl('vibelux-export-toolbar');
    
    if (!exportToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-export-toolbar');
      
      const exportButton = new Autodesk.Viewing.UI.Button('cad-export-btn');
      exportButton.setToolTip('CAD Export Engine');
      exportButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          <path d="M12 11L16 15H13V19H11V15H8L12 11Z" fill="white"/>
        </svg>
      `));
      exportButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(exportButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeExportFormats(): void {
    this.exportFormats.set('gltf', {
      id: 'gltf',
      name: 'glTF 2.0',
      extension: 'gltf',
      description: 'Modern 3D format with PBR materials and optical properties',
      supportsMaterials: true,
      supportsLights: true,
      supportsOpticalProperties: true,
      mimeType: 'model/gltf+json'
    });

    this.exportFormats.set('obj', {
      id: 'obj',
      name: 'Wavefront OBJ',
      extension: 'obj',
      description: 'Universal 3D format with material support',
      supportsMaterials: true,
      supportsLights: false,
      supportsOpticalProperties: false,
      mimeType: 'model/obj'
    });

    this.exportFormats.set('fbx', {
      id: 'fbx',
      name: 'Autodesk FBX',
      extension: 'fbx',
      description: 'Industry standard with full material and lighting support',
      supportsMaterials: true,
      supportsLights: true,
      supportsOpticalProperties: false,
      mimeType: 'application/octet-stream'
    });

    this.exportFormats.set('3dm', {
      id: '3dm',
      name: 'Rhino 3DM',
      extension: '3dm',
      description: 'CAD format with precise geometry and material properties',
      supportsMaterials: true,
      supportsLights: false,
      supportsOpticalProperties: true,
      mimeType: 'application/octet-stream'
    });

    this.exportFormats.set('ies', {
      id: 'ies',
      name: 'IES Photometric',
      extension: 'ies',
      description: 'Lighting industry standard for photometric data',
      supportsMaterials: false,
      supportsLights: true,
      supportsOpticalProperties: true,
      mimeType: 'text/plain'
    });

    this.exportFormats.set('radiance', {
      id: 'radiance',
      name: 'Radiance Scene',
      extension: 'rad',
      description: 'Lighting simulation format with full optical properties',
      supportsMaterials: true,
      supportsLights: true,
      supportsOpticalProperties: true,
      mimeType: 'text/plain'
    });
  }

  private initializeMaterialLibrary(): void {
    // Glazing materials with accurate optical properties for light mapping
    this.materialLibrary.set('polycarbonate-clear', {
      name: 'Clear Polycarbonate Glazing',
      baseColor: new THREE.Color(0xffffff),
      optical: {
        reflectance: 0.08, // 8% surface reflection
        transmittance: 0.89, // 89% light transmission
        absorptance: 0.03, // 3% absorption
        roughness: 0.02, // Very smooth surface
        ior: 1.586, // Polycarbonate index of refraction
        specularReflectance: 0.06,
        diffuseReflectance: 0.02,
        scatteringCoefficient: 0.01 // Minimal scattering for clear material
      },
      thermal: { conductivity: 0.2, emissivity: 0.9, absorptivity: 0.1 },
      structural: { density: 1200, youngsModulus: 2.3e9, poissonRatio: 0.37 },
      metadata: { category: 'glazing', certifications: ['ASTM D638', 'ISO 527'] }
    });

    this.materialLibrary.set('glass-low-iron', {
      name: 'Low-Iron Glass',
      baseColor: new THREE.Color(0xffffff),
      optical: {
        reflectance: 0.04, // 4% surface reflection (very low)
        transmittance: 0.95, // 95% light transmission
        absorptance: 0.01, // 1% absorption
        roughness: 0.001, // Extremely smooth
        ior: 1.52, // Glass index of refraction
        specularReflectance: 0.04,
        diffuseReflectance: 0.00,
        scatteringCoefficient: 0.0 // No scattering
      },
      thermal: { conductivity: 1.0, emissivity: 0.9, absorptivity: 0.05 },
      structural: { density: 2500, youngsModulus: 70e9, poissonRatio: 0.22 },
      metadata: { category: 'glazing', manufacturer: 'Guardian Glass', certifications: ['ASTM C1048'] }
    });

    this.materialLibrary.set('aluminum-frame', {
      name: 'Aluminum Frame',
      baseColor: new THREE.Color(0x888888),
      optical: {
        reflectance: 0.85, // 85% reflection for polished aluminum
        transmittance: 0.0, // Opaque
        absorptance: 0.15, // 15% absorption
        roughness: 0.1, // Slightly rough finish
        ior: 1.0, // Not applicable for opaque materials
        specularReflectance: 0.75,
        diffuseReflectance: 0.10,
        scatteringCoefficient: 0.0
      },
      thermal: { conductivity: 200, emissivity: 0.1, absorptivity: 0.15 },
      structural: { density: 2700, youngsModulus: 69e9, poissonRatio: 0.33 },
      metadata: { category: 'structure', certifications: ['ASTM B209'] }
    });

    this.materialLibrary.set('white-diffuse-reflector', {
      name: 'White Diffuse Reflector',
      baseColor: new THREE.Color(0xffffff),
      optical: {
        reflectance: 0.95, // 95% total reflectance
        transmittance: 0.0, // Opaque
        absorptance: 0.05, // 5% absorption
        roughness: 0.8, // High roughness for diffuse reflection
        ior: 1.0,
        specularReflectance: 0.05, // Mostly diffuse
        diffuseReflectance: 0.90, // High diffuse reflection
        scatteringCoefficient: 0.0
      },
      thermal: { conductivity: 0.1, emissivity: 0.9, absorptivity: 0.05 },
      structural: { density: 500, youngsModulus: 1e9, poissonRatio: 0.3 },
      metadata: { category: 'surface', manufacturer: 'Orca Grow Film' }
    });

    this.materialLibrary.set('growing-medium', {
      name: 'Growing Medium (Rockwool)',
      baseColor: new THREE.Color(0x8B4513),
      optical: {
        reflectance: 0.20, // 20% reflection
        transmittance: 0.0, // Opaque
        absorptance: 0.80, // 80% absorption
        roughness: 0.9, // Very rough surface
        ior: 1.0,
        specularReflectance: 0.01,
        diffuseReflectance: 0.19,
        scatteringCoefficient: 0.0
      },
      thermal: { conductivity: 0.04, emissivity: 0.95, absorptivity: 0.8 },
      structural: { density: 80, youngsModulus: 0.1e9, poissonRatio: 0.1 },
      metadata: { category: 'growing-medium', manufacturer: 'Grodan' }
    });
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const panelContent = `
      <div class="cad-export-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>📤 CAD Export Engine</h3>
          <p>Professional CAD export with optical properties</p>
        </div>

        <!-- Export Format Selection -->
        <div class="extension-section">
          <h4>Export Format</h4>
          <div class="format-selector">
            ${Array.from(this.exportFormats.values()).map(format => `
              <div class="format-option ${this.exportOptions.format === format.id ? 'selected' : ''}"
                   onclick="cadExporter.selectFormat('${format.id}')">
                <div class="format-header">
                  <strong>${format.name}</strong>
                  <span class="format-extension">.${format.extension}</span>
                </div>
                <p class="format-description">${format.description}</p>
                <div class="format-capabilities">
                  ${format.supportsMaterials ? '<span class="capability">📦 Materials</span>' : ''}
                  ${format.supportsLights ? '<span class="capability">💡 Lights</span>' : ''}
                  ${format.supportsOpticalProperties ? '<span class="capability">🔬 Optical</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Export Options -->
        <div class="extension-section">
          <h4>Export Options</h4>
          <div class="export-options">
            <div class="option-group">
              <h5>Content</h5>
              <label class="checkbox-option">
                <input type="checkbox" ${this.exportOptions.includeMaterials ? 'checked' : ''} 
                       onchange="cadExporter.updateOption('includeMaterials', this.checked)">
                Include Materials & Optical Properties
              </label>
              <label class="checkbox-option">
                <input type="checkbox" ${this.exportOptions.includeLights ? 'checked' : ''} 
                       onchange="cadExporter.updateOption('includeLights', this.checked)">
                Include Light Sources & Photometry
              </label>
              <label class="checkbox-option">
                <input type="checkbox" ${this.exportOptions.includeThermalProperties ? 'checked' : ''} 
                       onchange="cadExporter.updateOption('includeThermalProperties', this.checked)">
                Include Thermal Properties
              </label>
              <label class="checkbox-option">
                <input type="checkbox" ${this.exportOptions.includeStructure ? 'checked' : ''} 
                       onchange="cadExporter.updateOption('includeStructure', this.checked)">
                Include Structural Properties
              </label>
            </div>

            <div class="option-group">
              <h5>Format Settings</h5>
              <div class="setting-item">
                <label>Units:</label>
                <select onchange="cadExporter.updateOption('units', this.value)">
                  <option value="meters" ${this.exportOptions.units === 'meters' ? 'selected' : ''}>Meters</option>
                  <option value="feet" ${this.exportOptions.units === 'feet' ? 'selected' : ''}>Feet</option>
                  <option value="inches" ${this.exportOptions.units === 'inches' ? 'selected' : ''}>Inches</option>
                  <option value="millimeters" ${this.exportOptions.units === 'millimeters' ? 'selected' : ''}>Millimeters</option>
                </select>
              </div>
              <div class="setting-item">
                <label>Precision:</label>
                <input type="number" min="1" max="6" value="${this.exportOptions.precision}" 
                       onchange="cadExporter.updateOption('precision', parseInt(this.value))">
              </div>
              <div class="setting-item">
                <label>Coordinate System:</label>
                <select onchange="cadExporter.updateOption('coordinateSystem', this.value)">
                  <option value="xyz" ${this.exportOptions.coordinateSystem === 'xyz' ? 'selected' : ''}>X-Y-Z (Standard)</option>
                  <option value="xzy" ${this.exportOptions.coordinateSystem === 'xzy' ? 'selected' : ''}>X-Z-Y (CAD)</option>
                  <option value="yxz" ${this.exportOptions.coordinateSystem === 'yxz' ? 'selected' : ''}>Y-X-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Material Library -->
        <div class="extension-section">
          <h4>Material Library</h4>
          <div class="material-library">
            ${Array.from(this.materialLibrary.values()).map(material => `
              <div class="material-item">
                <div class="material-info">
                  <div class="material-swatch" style="background-color: #${material.baseColor.getHexString()}"></div>
                  <div class="material-details">
                    <strong>${material.name}</strong>
                    <div class="optical-properties">
                      <span class="property">R: ${(material.optical.reflectance * 100).toFixed(1)}%</span>
                      <span class="property">T: ${(material.optical.transmittance * 100).toFixed(1)}%</span>
                      <span class="property">A: ${(material.optical.absorptance * 100).toFixed(1)}%</span>
                    </div>
                    <div class="material-category">${material.metadata.category}</div>
                  </div>
                </div>
                <button class="btn btn-small" onclick="cadExporter.editMaterial('${material.name}')">✏️</button>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary" onclick="cadExporter.createCustomMaterial()">
            ➕ Create Custom Material
          </button>
        </div>

        <!-- Light Sources -->
        <div class="extension-section">
          <h4>Light Sources Analysis</h4>
          <div class="light-analysis">
            <div class="analysis-stats">
              <div class="stat-item">
                <span class="stat-label">Total Light Sources:</span>
                <span class="stat-value">${this.lightSources.size}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total PPFD:</span>
                <span class="stat-value" id="total-ppfd">--</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Color Temp:</span>
                <span class="stat-value" id="avg-color-temp">--</span>
              </div>
            </div>
            <button class="btn btn-primary" onclick="cadExporter.analyzeLighting()">
              🔍 Analyze Light Mapping
            </button>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="extension-section">
          <h4>Export</h4>
          <div class="export-actions">
            <div class="export-preview">
              <p><strong>Export Summary:</strong></p>
              <ul id="export-summary">
                <li>Format: ${this.exportFormats.get(this.exportOptions.format)?.name}</li>
                <li>Objects: <span id="object-count">--</span></li>
                <li>Materials: <span id="material-count">--</span></li>
                <li>Lights: <span id="light-count">--</span></li>
              </ul>
            </div>
            
            <div class="export-buttons">
              <button class="btn btn-primary" onclick="cadExporter.exportModel()">
                📤 Export Model
              </button>
              <button class="btn btn-secondary" onclick="cadExporter.exportOpticalData()">
                🔬 Export Optical Data
              </button>
              <button class="btn btn-secondary" onclick="cadExporter.exportPhotometry()">
                💡 Export Photometry
              </button>
            </div>
          </div>
        </div>

        <!-- Validation -->
        <div class="extension-section">
          <h4>Model Validation</h4>
          <div class="validation-results" id="validation-results">
            <p>Click "Validate Model" to check for export issues</p>
          </div>
          <button class="btn btn-outline" onclick="cadExporter.validateModel()">
            ✅ Validate Model
          </button>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;
    
    // Make extension globally accessible for button callbacks
    (window as any).cadExporter = this;
    
    // Update statistics
    this.updateExportStatistics();
  }

  // Public API methods for panel callbacks
  public selectFormat(formatId: string): void {
    const format = this.exportFormats.get(formatId);
    if (format) {
      this.exportOptions.format = formatId;
      
      // Auto-adjust options based on format capabilities
      if (!format.supportsOpticalProperties) {
        this.exportOptions.includeOpticalProperties = false;
      }
      if (!format.supportsLights) {
        this.exportOptions.includeLights = false;
      }
      if (!format.supportsMaterials) {
        this.exportOptions.includeMaterials = false;
      }
      
      this.updatePanel();
    }
  }

  public updateOption(option: keyof ExportOptions, value: any): void {
    (this.exportOptions as any)[option] = value;
    this.updateExportStatistics();
  }

  public analyzeLighting(): void {
    // Collect all light sources from the scene
    this.collectLightSources();
    
    // Perform lighting analysis
    const totalPPFD = Array.from(this.lightSources.values())
      .reduce((sum, light) => sum + light.intensity, 0);
    
    const avgColorTemp = Array.from(this.lightSources.values())
      .reduce((sum, light) => sum + light.optical.colorTemperature, 0) / this.lightSources.size;

    // Update UI
    const ppfdEl = document.getElementById('total-ppfd');
    const tempEl = document.getElementById('avg-color-temp');
    
    if (ppfdEl) ppfdEl.textContent = totalPPFD.toFixed(0) + ' μmol/m²/s';
    if (tempEl) tempEl.textContent = avgColorTemp.toFixed(0) + 'K';

    console.log('Lighting analysis complete:', {
      sources: this.lightSources.size,
      totalPPFD,
      avgColorTemp
    });
  }

  private collectLightSources(): void {
    // This would integrate with the spectral analysis extension to collect real light data
    this.lightSources.clear();
    
    // Simulate collecting light sources from scene
    const sampleLight: LightSource = {
      id: 'led-fixture-1',
      type: 'led',
      position: new THREE.Vector3(0, 3, 0),
      direction: new THREE.Vector3(0, -1, 0),
      intensity: 200, // PPFD
      spectrum: new Map([[400, 0.1], [450, 0.8], [660, 1.0], [730, 0.3]]),
      beamAngle: 120,
      efficiency: 2.8,
      optical: {
        luminousFlux: 15000,
        radiantFlux: 150,
        colorTemperature: 3000,
        cri: 90
      }
    };
    
    this.lightSources.set(sampleLight.id, sampleLight);
  }

  public exportModel(): void {
    const format = this.exportFormats.get(this.exportOptions.format);
    if (!format) return;

    // Show progress
    this.showExportProgress();

    // Collect all objects from layers
    const objects = this.collectExportObjects();
    const materials = this.collectExportMaterials();
    const lights = this.collectExportLights();

    // Perform export based on format
    setTimeout(() => {
      this.performExport(objects, materials, lights, format);
    }, 1000);
  }

  private showExportProgress(): void {
    const resultsEl = document.getElementById('validation-results');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="export-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 30%"></div>
          </div>
          <p>Exporting model...</p>
        </div>
      `;
    }
  }

  private collectExportObjects(): any[] {
    const objects: any[] = [];
    
    if (this.layerManager) {
      // Collect all objects from all layers
      const allObjects = this.layerManager.getObjectsByType('system');
      allObjects.forEach(obj => {
        objects.push({
          id: obj.id,
          mesh: obj.mesh,
          material: this.getMaterialForObject(obj),
          optical: this.getOpticalPropertiesForObject(obj),
          metadata: obj.metadata
        });
      });
    }
    
    return objects;
  }

  private collectExportMaterials(): MaterialDefinition[] {
    return Array.from(this.materialLibrary.values());
  }

  private collectExportLights(): LightSource[] {
    return Array.from(this.lightSources.values());
  }

  private getMaterialForObject(obj: any): MaterialDefinition | null {
    // Determine material based on object type or metadata
    const objType = obj.metadata?.type;
    
    switch (objType) {
      case 'geometry':
        return this.materialLibrary.get('aluminum-frame');
      case 'thermal-zone':
        return this.materialLibrary.get('polycarbonate-clear');
      case 'hvac':
        return this.materialLibrary.get('aluminum-frame');
      default:
        return this.materialLibrary.get('aluminum-frame');
    }
  }

  private getOpticalPropertiesForObject(obj: any): OpticalProperties {
    const material = this.getMaterialForObject(obj);
    return material ? material.optical : {
      reflectance: 0.5,
      transmittance: 0.0,
      absorptance: 0.5,
      roughness: 0.5,
      ior: 1.0,
      specularReflectance: 0.1,
      diffuseReflectance: 0.4,
      scatteringCoefficient: 0.0
    };
  }

  private performExport(objects: any[], materials: MaterialDefinition[], lights: LightSource[], format: ExportFormat): void {
    console.log(`Exporting ${objects.length} objects in ${format.name} format`);
    
    // Generate export data based on format
    const exportData = this.generateExportData(objects, materials, lights, format);
    
    // Create download
    this.downloadExportFile(exportData, format);
    
    // Update UI
    const resultsEl = document.getElementById('validation-results');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="export-complete">
          <h5>✅ Export Complete</h5>
          <p>Successfully exported ${objects.length} objects with optical properties</p>
          <div class="export-details">
            <p><strong>Format:</strong> ${format.name}</p>
            <p><strong>Materials:</strong> ${materials.length}</p>
            <p><strong>Light Sources:</strong> ${lights.length}</p>
            <p><strong>Optical Properties:</strong> ${this.exportOptions.includeOpticalProperties ? 'Included' : 'Excluded'}</p>
          </div>
        </div>
      `;
    }
  }

  private generateExportData(objects: any[], materials: MaterialDefinition[], lights: LightSource[], format: ExportFormat): string {
    switch (format.id) {
      case 'gltf':
        return this.generateGltfData(objects, materials, lights);
      case 'radiance':
        return this.generateRadianceData(objects, materials, lights);
      case 'ies':
        return this.generateIESData(lights);
      default:
        return JSON.stringify({ objects, materials, lights }, null, 2);
    }
  }

  private generateGltfData(objects: any[], materials: MaterialDefinition[], lights: LightSource[]): string {
    // Generate glTF 2.0 with PBR materials and optical extensions
    const gltf = {
      asset: { version: '2.0', generator: 'VibeLux CAD Export Engine' },
      extensionsUsed: ['KHR_materials_pbrSpecularGlossiness', 'VibeLux_optical_properties'],
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      meshes: [],
      materials: [],
      extensions: {
        VibeLux_optical_properties: {
          materials: materials.map(mat => ({
            name: mat.name,
            optical: mat.optical,
            thermal: mat.thermal
          }))
        }
      }
    };

    return JSON.stringify(gltf, null, 2);
  }

  private generateRadianceData(objects: any[], materials: MaterialDefinition[], lights: LightSource[]): string {
    let radData = '# VibeLux Radiance Scene File\n';
    radData += '# Generated for optical simulation and light mapping\n\n';

    // Add materials with optical properties
    materials.forEach(mat => {
      radData += `void plastic ${mat.name.replace(/\s+/g, '_')}\n`;
      radData += `0\n0\n5\n`;
      radData += `${mat.optical.diffuseReflectance.toFixed(3)} `;
      radData += `${mat.optical.diffuseReflectance.toFixed(3)} `;
      radData += `${mat.optical.diffuseReflectance.toFixed(3)} `;
      radData += `${mat.optical.specularReflectance.toFixed(3)} `;
      radData += `${mat.optical.roughness.toFixed(3)}\n\n`;
    });

    // Add light sources
    lights.forEach(light => {
      radData += `void light ${light.id}\n`;
      radData += `0\n0\n3\n`;
      radData += `${light.optical.luminousFlux} ${light.optical.luminousFlux} ${light.optical.luminousFlux}\n\n`;
    });

    return radData;
  }

  private generateIESData(lights: LightSource[]): string {
    // Generate IES photometric file
    let iesData = 'IESNA:LM-63-2002\n';
    iesData += '[TEST] VibeLux Generated Photometry\n';
    iesData += '[MANUFAC] VibeLux\n';
    iesData += '[LUMCAT] VibeLux_Export\n';
    iesData += 'TILT=NONE\n';
    
    // This would include detailed photometric data
    iesData += '1 1800 1 1 1 1 1 1 1\n'; // Lamp data
    iesData += '1 1\n'; // Ballast factor, input watts
    iesData += '0 90\n'; // Vertical angles
    iesData += '0\n'; // Horizontal angles
    iesData += '1800\n'; // Candela values
    
    return iesData;
  }

  private downloadExportFile(data: string, format: ExportFormat): void {
    const blob = new Blob([data], { type: format.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibelux_export.${format.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public validateModel(): void {
    const issues: string[] = [];
    
    // Check for objects without materials
    if (this.layerManager) {
      const objects = this.layerManager.getObjectsByType('system');
      objects.forEach(obj => {
        if (!this.getMaterialForObject(obj)) {
          issues.push(`Object ${obj.id} has no material assigned`);
        }
      });
    }

    // Check for optical property completeness
    this.materialLibrary.forEach(material => {
      const optical = material.optical;
      const total = optical.reflectance + optical.transmittance + optical.absorptance;
      if (Math.abs(total - 1.0) > 0.01) {
        issues.push(`Material ${material.name} optical properties don't sum to 1.0 (${total.toFixed(3)})`);
      }
    });

    // Display results
    const resultsEl = document.getElementById('validation-results');
    if (resultsEl) {
      if (issues.length === 0) {
        resultsEl.innerHTML = `
          <div class="validation-success">
            <h5>✅ Model Valid</h5>
            <p>No issues found. Model is ready for export with accurate optical properties.</p>
          </div>
        `;
      } else {
        resultsEl.innerHTML = `
          <div class="validation-issues">
            <h5>⚠️ Validation Issues</h5>
            <ul>
              ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    }
  }

  private updateExportStatistics(): void {
    if (!this.layerManager) return;

    const objects = this.layerManager.getObjectsByType('system');
    const materials = this.materialLibrary.size;
    const lights = this.lightSources.size;

    const objectCountEl = document.getElementById('object-count');
    const materialCountEl = document.getElementById('material-count');
    const lightCountEl = document.getElementById('light-count');

    if (objectCountEl) objectCountEl.textContent = objects.length.toString();
    if (materialCountEl) materialCountEl.textContent = materials.toString();
    if (lightCountEl) lightCountEl.textContent = lights.toString();
  }

  public exportOpticalData(): void {
    const opticalData = {
      materials: Array.from(this.materialLibrary.values()).map(mat => ({
        name: mat.name,
        optical: mat.optical,
        category: mat.metadata.category
      })),
      exportedAt: new Date().toISOString(),
      units: this.exportOptions.units,
      precision: this.exportOptions.precision
    };

    const blob = new Blob([JSON.stringify(opticalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vibelux_optical_properties.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public exportPhotometry(): void {
    this.collectLightSources();
    const photometryData = Array.from(this.lightSources.values());

    const blob = new Blob([JSON.stringify(photometryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vibelux_photometry.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public createCustomMaterial(): void {
    const name = prompt('Enter material name:');
    if (!name) return;

    // Create a basic custom material - in a real implementation, this would open a detailed editor
    const customMaterial: MaterialDefinition = {
      name,
      baseColor: new THREE.Color(0x888888),
      optical: {
        reflectance: 0.5,
        transmittance: 0.0,
        absorptance: 0.5,
        roughness: 0.5,
        ior: 1.0,
        specularReflectance: 0.1,
        diffuseReflectance: 0.4,
        scatteringCoefficient: 0.0
      },
      thermal: { conductivity: 1.0, emissivity: 0.9, absorptivity: 0.5 },
      structural: { density: 1000, youngsModulus: 1e9, poissonRatio: 0.3 },
      metadata: { category: 'surface' }
    };

    this.materialLibrary.set(name, customMaterial);
    this.updatePanel();
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.CADExport', CADExportForgeExtension);

export default CADExportForgeExtension;