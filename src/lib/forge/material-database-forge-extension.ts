/**
 * VibeLux Material Database Extension for Autodesk Forge
 * Comprehensive material library with optical, thermal, and structural properties
 */

import { VibeLuxLayerManager } from './layer-manager';

interface MaterialProperty {
  name: string;
  value: number | string | boolean;
  unit?: string;
  description: string;
  source?: string; // Reference to data source
  accuracy?: number; // Measurement accuracy
  temperature?: number; // Temperature at which property was measured
}

interface MaterialCertification {
  standard: string;
  certificationBody: string;
  certificateNumber?: string;
  validUntil?: Date;
  scope: string;
  rating?: string;
}

interface MaterialDatabase {
  id: string;
  name: string;
  category: 'glazing' | 'structure' | 'insulation' | 'growing-medium' | 'equipment' | 'coating' | 'sealant';
  subcategory: string;
  manufacturer: {
    name: string;
    website?: string;
    contact?: string;
    location?: string;
  };
  model: string;
  description: string;
  
  // Optical Properties (for light mapping)
  optical: {
    visible: {
      transmittance: MaterialProperty;
      reflectance: MaterialProperty;
      absorptance: MaterialProperty;
      hazeIndex: MaterialProperty;
      clarityIndex: MaterialProperty;
    };
    infrared: {
      transmittance: MaterialProperty;
      reflectance: MaterialProperty;
      emissivity: MaterialProperty;
    };
    uv: {
      transmittance: MaterialProperty;
      reflectance: MaterialProperty;
      degradationRate: MaterialProperty;
    };
    photometric: {
      lightTransmission: MaterialProperty; // SHGC equivalent
      solarHeatGainCoeff: MaterialProperty;
      uValue: MaterialProperty; // Thermal transmittance
      rValue?: MaterialProperty; // Thermal resistance
    };
  };

  // Thermal Properties
  thermal: {
    conductivity: MaterialProperty;
    specificHeat: MaterialProperty;
    density: MaterialProperty;
    thermalExpansion: MaterialProperty;
    meltingPoint?: MaterialProperty;
    operatingRange: {
      min: MaterialProperty;
      max: MaterialProperty;
    };
  };

  // Structural Properties
  structural: {
    mechanical: {
      youngsModulus: MaterialProperty;
      shearModulus: MaterialProperty;
      poissonRatio: MaterialProperty;
      yieldStrength: MaterialProperty;
      ultimateStrength: MaterialProperty;
      fatigueLimit: MaterialProperty;
    };
    physical: {
      density: MaterialProperty;
      hardness: MaterialProperty;
      impactStrength: MaterialProperty;
    };
  };

  // Environmental Properties
  environmental: {
    weathering: {
      uvResistance: MaterialProperty;
      temperatureCycling: MaterialProperty;
      moistureResistance: MaterialProperty;
      chemicalResistance: MaterialProperty;
    };
    sustainability: {
      recycledContent: MaterialProperty;
      recyclability: MaterialProperty;
      embodiedEnergy: MaterialProperty;
      carbonFootprint: MaterialProperty;
      lifespan: MaterialProperty;
    };
    biological: {
      algaeResistance?: MaterialProperty;
      fungalResistance?: MaterialProperty;
      insectResistance?: MaterialProperty;
    };
  };

  // Cost & Availability
  economic: {
    materialCost: MaterialProperty;
    installationCost: MaterialProperty;
    maintenanceCost: MaterialProperty;
    availability: MaterialProperty;
    leadTime: MaterialProperty;
  };

  // Standards & Certifications
  certifications: MaterialCertification[];
  
  // Testing Data
  testData: {
    testDate: Date;
    laboratory: string;
    testMethod: string;
    sampleSize: number;
    conditions: string;
    dataSheet?: string; // URL to PDF
  }[];

  // Usage Guidelines
  applications: {
    recommended: string[];
    notRecommended: string[];
    specialConsiderations: string[];
  };

  // Visual Properties
  appearance: {
    color: string; // Hex color
    finish: 'glossy' | 'matte' | 'textured' | 'clear' | 'translucent';
    transparency: number; // 0-1
    thickness: MaterialProperty;
  };

  // Metadata
  metadata: {
    dateAdded: Date;
    lastUpdated: Date;
    version: string;
    dataSource: string;
    tags: string[];
    notes?: string;
  };
}

interface MaterialComparison {
  materials: string[]; // Material IDs
  properties: string[]; // Property names to compare
  criteria: 'optical' | 'thermal' | 'structural' | 'environmental' | 'economic';
  weighting?: { [property: string]: number };
}

interface MaterialRecommendation {
  materialId: string;
  score: number;
  reasons: string[];
  concerns: string[];
  alternatives: string[];
}

class MaterialDatabaseForgeExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private layerManager: VibeLuxLayerManager | null = null;
  private materialDatabase: Map<string, MaterialDatabase> = new Map();
  private searchFilters: {
    category: string;
    manufacturer: string;
    priceRange: { min: number; max: number };
    properties: string[];
    certifications: string[];
  } = {
    category: 'all',
    manufacturer: 'all',
    priceRange: { min: 0, max: 10000 },
    properties: [],
    certifications: []
  };
  private selectedMaterials: Set<string> = new Set();
  private comparisonMode: boolean = false;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.initializeMaterialDatabase();
  }

  load(): boolean {
    this.setupUI();
    console.log('VibeLux Material Database Extension loaded');
    return true;
  }

  unload(): boolean {
    if (this.panel) {
      this.panel.uninitialize();
      this.panel = null;
    }
    console.log('VibeLux Material Database Extension unloaded');
    return true;
  }

  setLayerManager(layerManager: VibeLuxLayerManager): void {
    this.layerManager = layerManager;
  }

  private setupUI(): void {
    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-materials-panel',
      'Material Database',
      {
        dockRight: true,
        shadow: true,
        width: 450,
        height: 700
      }
    );

    this.updatePanel();
    this.createToolbarButton();
  }

  private createToolbarButton(): void {
    const toolbar = this.viewer.getToolbar(true);
    const materialsToolbar = toolbar.getControl('vibelux-materials-toolbar');
    
    if (!materialsToolbar) {
      const controlGroup = new Autodesk.Viewing.UI.ControlGroup('vibelux-materials-toolbar');
      
      const materialsButton = new Autodesk.Viewing.UI.Button('materials-db-btn');
      materialsButton.setToolTip('Material Database');
      materialsButton.setIcon('data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A2,2 0 0,1 14,4V8L17,7V13H20A2,2 0 0,1 22,15V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V15A2,2 0 0,1 4,13H7V7L10,8V4A2,2 0 0,1 12,2Z"/>
        </svg>
      `));
      materialsButton.onClick = () => {
        this.togglePanel();
      };
      
      controlGroup.addControl(materialsButton);
      toolbar.addControl(controlGroup);
    }
  }

  private togglePanel(): void {
    if (this.panel) {
      this.panel.setVisible(!this.panel.isVisible());
    }
  }

  private initializeMaterialDatabase(): void {
    // Initialize comprehensive material database with real greenhouse materials
    
    // Polycarbonate Glazing
    this.addMaterial({
      id: 'pc-clear-16mm',
      name: 'Clear Polycarbonate 16mm',
      category: 'glazing',
      subcategory: 'structured-panels',
      manufacturer: {
        name: 'Polygal',
        website: 'https://polygal.com',
        location: 'Israel'
      },
      model: 'Polygal Clear 16mm',
      description: 'High-quality structured polycarbonate glazing with excellent light transmission and thermal insulation',
      optical: this.createOpticalProperties({
        visibleTransmittance: 0.91,
        visibleReflectance: 0.08,
        hazeIndex: 0.02,
        lightTransmission: 0.85,
        solarHeatGainCoeff: 0.68,
        uValue: 2.1
      }),
      thermal: this.createThermalProperties({
        conductivity: 0.2,
        specificHeat: 1200,
        density: 1200,
        thermalExpansion: 65e-6,
        operatingRange: { min: -40, max: 120 }
      }),
      structural: this.createStructuralProperties({
        youngsModulus: 2.3e9,
        yieldStrength: 60e6,
        ultimateStrength: 70e6,
        impactStrength: 850
      }),
      environmental: this.createEnvironmentalProperties({
        uvResistance: 0.95,
        temperatureCycling: 0.9,
        moistureResistance: 0.98,
        lifespan: 25
      }),
      economic: this.createEconomicProperties({
        materialCost: 45,
        installationCost: 25,
        maintenanceCost: 2
      }),
      certifications: [
        {
          standard: 'ASTM D638',
          certificationBody: 'ASTM',
          scope: 'Tensile Properties of Plastics'
        }
      ],
      appearance: {
        color: '#ffffff',
        finish: 'clear',
        transparency: 0.91,
        thickness: { name: 'thickness', value: 16, unit: 'mm', description: 'Panel thickness' }
      }
    });

    // Low-Iron Glass
    this.addMaterial({
      id: 'glass-low-iron-4mm',
      name: 'Low-Iron Glass 4mm',
      category: 'glazing',
      subcategory: 'flat-glass',
      manufacturer: {
        name: 'Guardian Glass',
        website: 'https://guardian.com',
        location: 'USA'
      },
      model: 'Guardian UltraClear',
      description: 'Ultra-clear low-iron glass with maximum light transmission for optimal plant growth',
      optical: this.createOpticalProperties({
        visibleTransmittance: 0.97,
        visibleReflectance: 0.03,
        hazeIndex: 0.0,
        lightTransmission: 0.94,
        solarHeatGainCoeff: 0.87,
        uValue: 5.8
      }),
      thermal: this.createThermalProperties({
        conductivity: 1.0,
        specificHeat: 840,
        density: 2500,
        thermalExpansion: 9e-6,
        operatingRange: { min: -40, max: 300 }
      }),
      structural: this.createStructuralProperties({
        youngsModulus: 70e9,
        yieldStrength: 50e6,
        ultimateStrength: 150e6,
        impactStrength: 0.5
      }),
      environmental: this.createEnvironmentalProperties({
        uvResistance: 1.0,
        temperatureCycling: 0.95,
        moistureResistance: 1.0,
        lifespan: 50
      }),
      economic: this.createEconomicProperties({
        materialCost: 35,
        installationCost: 40,
        maintenanceCost: 1
      }),
      certifications: [
        {
          standard: 'ASTM C1048',
          certificationBody: 'ASTM',
          scope: 'Heat-Treated Flat Glass'
        }
      ],
      appearance: {
        color: '#ffffff',
        finish: 'clear',
        transparency: 0.97,
        thickness: { name: 'thickness', value: 4, unit: 'mm', description: 'Glass thickness' }
      }
    });

    // Aluminum Structural Frame
    this.addMaterial({
      id: 'aluminum-6063-t5',
      name: 'Aluminum Alloy 6063-T5',
      category: 'structure',
      subcategory: 'framing',
      manufacturer: {
        name: 'Hydro Aluminum',
        website: 'https://hydro.com',
        location: 'Norway'
      },
      model: '6063-T5 Structural',
      description: 'Lightweight, corrosion-resistant aluminum alloy ideal for greenhouse framing',
      optical: this.createOpticalProperties({
        visibleTransmittance: 0.0,
        visibleReflectance: 0.75,
        hazeIndex: 0.0,
        lightTransmission: 0.0,
        solarHeatGainCoeff: 0.0,
        uValue: 0.0
      }),
      thermal: this.createThermalProperties({
        conductivity: 201,
        specificHeat: 900,
        density: 2700,
        thermalExpansion: 23e-6,
        operatingRange: { min: -40, max: 200 }
      }),
      structural: this.createStructuralProperties({
        youngsModulus: 69e9,
        yieldStrength: 185e6,
        ultimateStrength: 220e6,
        impactStrength: 25
      }),
      environmental: this.createEnvironmentalProperties({
        uvResistance: 0.98,
        temperatureCycling: 0.95,
        moistureResistance: 0.95,
        recycledContent: 0.75,
        lifespan: 50
      }),
      economic: this.createEconomicProperties({
        materialCost: 8.5,
        installationCost: 15,
        maintenanceCost: 0.5
      }),
      certifications: [
        {
          standard: 'ASTM B221',
          certificationBody: 'ASTM',
          scope: 'Aluminum Alloy Extruded Bars, Rods, Wire, Profiles, and Tubes'
        }
      ],
      appearance: {
        color: '#c0c0c0',
        finish: 'matte',
        transparency: 0.0,
        thickness: { name: 'thickness', value: 2, unit: 'mm', description: 'Wall thickness' }
      }
    });

    // Rockwool Growing Medium
    this.addMaterial({
      id: 'rockwool-grodan-ao',
      name: 'Grodan AO Rockwool',
      category: 'growing-medium',
      subcategory: 'substrate',
      manufacturer: {
        name: 'Grodan',
        website: 'https://grodan.com',
        location: 'Netherlands'
      },
      model: 'AO Rockwool Slabs',
      description: 'Precision-manufactured rockwool growing medium with optimal root zone properties',
      optical: this.createOpticalProperties({
        visibleTransmittance: 0.0,
        visibleReflectance: 0.15,
        hazeIndex: 1.0,
        lightTransmission: 0.0,
        solarHeatGainCoeff: 0.0,
        uValue: 0.0
      }),
      thermal: this.createThermalProperties({
        conductivity: 0.04,
        specificHeat: 840,
        density: 80,
        thermalExpansion: 0,
        operatingRange: { min: 0, max: 85 }
      }),
      structural: this.createStructuralProperties({
        youngsModulus: 0.1e9,
        yieldStrength: 0.1e6,
        ultimateStrength: 0.2e6,
        impactStrength: 0.1
      }),
      environmental: this.createEnvironmentalProperties({
        uvResistance: 0.8,
        temperatureCycling: 0.9,
        moistureResistance: 0.4,
        fungalResistance: 0.95,
        recyclability: 0.9,
        lifespan: 5
      }),
      economic: this.createEconomicProperties({
        materialCost: 12,
        installationCost: 8,
        maintenanceCost: 15
      }),
      certifications: [
        {
          standard: 'RHP Certified',
          certificationBody: 'RHP Foundation',
          scope: 'Growing Media Quality'
        }
      ],
      appearance: {
        color: '#8B4513',
        finish: 'textured',
        transparency: 0.0,
        thickness: { name: 'thickness', value: 75, unit: 'mm', description: 'Slab thickness' }
      }
    });

    console.log(`Material database initialized with ${this.materialDatabase.size} materials`);
  }

  private addMaterial(material: Partial<MaterialDatabase>): void {
    const completeMaterial: MaterialDatabase = {
      ...material,
      testData: material.testData || [],
      applications: material.applications || {
        recommended: [],
        notRecommended: [],
        specialConsiderations: []
      },
      metadata: {
        dateAdded: new Date(),
        lastUpdated: new Date(),
        version: '1.0',
        dataSource: 'VibeLux Database',
        tags: [],
        ...material.metadata
      }
    } as MaterialDatabase;

    this.materialDatabase.set(completeMaterial.id, completeMaterial);
  }

  private createOpticalProperties(values: any): MaterialDatabase['optical'] {
    return {
      visible: {
        transmittance: { name: 'Visible Transmittance', value: values.visibleTransmittance || 0, unit: '%', description: 'Visible light transmission (380-780nm)' },
        reflectance: { name: 'Visible Reflectance', value: values.visibleReflectance || 0, unit: '%', description: 'Visible light reflection (380-780nm)' },
        absorptance: { name: 'Visible Absorptance', value: 1 - (values.visibleTransmittance || 0) - (values.visibleReflectance || 0), unit: '%', description: 'Visible light absorption' },
        hazeIndex: { name: 'Haze Index', value: values.hazeIndex || 0, unit: '%', description: 'Light scattering measurement' },
        clarityIndex: { name: 'Clarity Index', value: 100 - (values.hazeIndex || 0), unit: '%', description: 'Optical clarity measurement' }
      },
      infrared: {
        transmittance: { name: 'IR Transmittance', value: values.irTransmittance || 0, unit: '%', description: 'Infrared transmission (780-2500nm)' },
        reflectance: { name: 'IR Reflectance', value: values.irReflectance || 0, unit: '%', description: 'Infrared reflection' },
        emissivity: { name: 'Emissivity', value: values.emissivity || 0.9, unit: '', description: 'Thermal radiation emissivity' }
      },
      uv: {
        transmittance: { name: 'UV Transmittance', value: values.uvTransmittance || 0, unit: '%', description: 'UV transmission (280-380nm)' },
        reflectance: { name: 'UV Reflectance', value: values.uvReflectance || 0, unit: '%', description: 'UV reflection' },
        degradationRate: { name: 'UV Degradation Rate', value: values.uvDegradationRate || 0, unit: '%/year', description: 'Material degradation under UV exposure' }
      },
      photometric: {
        lightTransmission: { name: 'Light Transmission', value: values.lightTransmission || 0, unit: '%', description: 'Photometric light transmission' },
        solarHeatGainCoeff: { name: 'SHGC', value: values.solarHeatGainCoeff || 0, unit: '', description: 'Solar Heat Gain Coefficient' },
        uValue: { name: 'U-Value', value: values.uValue || 0, unit: 'W/m²·K', description: 'Thermal transmittance' }
      }
    };
  }

  private createThermalProperties(values: any): MaterialDatabase['thermal'] {
    return {
      conductivity: { name: 'Thermal Conductivity', value: values.conductivity || 0, unit: 'W/m·K', description: 'Heat conduction coefficient' },
      specificHeat: { name: 'Specific Heat', value: values.specificHeat || 0, unit: 'J/kg·K', description: 'Heat capacity per unit mass' },
      density: { name: 'Density', value: values.density || 0, unit: 'kg/m³', description: 'Material density' },
      thermalExpansion: { name: 'Thermal Expansion', value: values.thermalExpansion || 0, unit: '1/K', description: 'Linear thermal expansion coefficient' },
      operatingRange: {
        min: { name: 'Min Operating Temp', value: values.operatingRange?.min || -40, unit: '°C', description: 'Minimum operating temperature' },
        max: { name: 'Max Operating Temp', value: values.operatingRange?.max || 120, unit: '°C', description: 'Maximum operating temperature' }
      }
    };
  }

  private createStructuralProperties(values: any): MaterialDatabase['structural'] {
    return {
      mechanical: {
        youngsModulus: { name: "Young's Modulus", value: values.youngsModulus || 0, unit: 'Pa', description: 'Elastic modulus' },
        shearModulus: { name: 'Shear Modulus', value: values.shearModulus || 0, unit: 'Pa', description: 'Shear modulus' },
        poissonRatio: { name: "Poisson's Ratio", value: values.poissonRatio || 0, unit: '', description: 'Lateral strain ratio' },
        yieldStrength: { name: 'Yield Strength', value: values.yieldStrength || 0, unit: 'Pa', description: 'Yield stress at 0.2% offset' },
        ultimateStrength: { name: 'Ultimate Strength', value: values.ultimateStrength || 0, unit: 'Pa', description: 'Maximum tensile stress' },
        fatigueLimit: { name: 'Fatigue Limit', value: values.fatigueLimit || 0, unit: 'Pa', description: 'Endurance limit' }
      },
      physical: {
        density: { name: 'Density', value: values.density || 0, unit: 'kg/m³', description: 'Material density' },
        hardness: { name: 'Hardness', value: values.hardness || 0, unit: 'HB', description: 'Brinell hardness' },
        impactStrength: { name: 'Impact Strength', value: values.impactStrength || 0, unit: 'J/m', description: 'Charpy impact energy' }
      }
    };
  }

  private createEnvironmentalProperties(values: any): MaterialDatabase['environmental'] {
    return {
      weathering: {
        uvResistance: { name: 'UV Resistance', value: values.uvResistance || 0, unit: 'rating', description: 'Resistance to UV degradation (0-1)' },
        temperatureCycling: { name: 'Temperature Cycling', value: values.temperatureCycling || 0, unit: 'rating', description: 'Thermal cycling resistance (0-1)' },
        moistureResistance: { name: 'Moisture Resistance', value: values.moistureResistance || 0, unit: 'rating', description: 'Resistance to moisture (0-1)' },
        chemicalResistance: { name: 'Chemical Resistance', value: values.chemicalResistance || 0, unit: 'rating', description: 'Resistance to chemicals (0-1)' }
      },
      sustainability: {
        recycledContent: { name: 'Recycled Content', value: values.recycledContent || 0, unit: '%', description: 'Percentage of recycled material' },
        recyclability: { name: 'Recyclability', value: values.recyclability || 0, unit: 'rating', description: 'End-of-life recyclability (0-1)' },
        embodiedEnergy: { name: 'Embodied Energy', value: values.embodiedEnergy || 0, unit: 'MJ/kg', description: 'Energy required for production' },
        carbonFootprint: { name: 'Carbon Footprint', value: values.carbonFootprint || 0, unit: 'kg CO₂/kg', description: 'Production carbon emissions' },
        lifespan: { name: 'Expected Lifespan', value: values.lifespan || 0, unit: 'years', description: 'Expected service life' }
      },
      biological: {
        algaeResistance: values.algaeResistance ? { name: 'Algae Resistance', value: values.algaeResistance, unit: 'rating', description: 'Resistance to algae growth (0-1)' } : undefined,
        fungalResistance: values.fungalResistance ? { name: 'Fungal Resistance', value: values.fungalResistance, unit: 'rating', description: 'Resistance to fungal growth (0-1)' } : undefined,
        insectResistance: values.insectResistance ? { name: 'Insect Resistance', value: values.insectResistance, unit: 'rating', description: 'Resistance to insect damage (0-1)' } : undefined
      }
    };
  }

  private createEconomicProperties(values: any): MaterialDatabase['economic'] {
    return {
      materialCost: { name: 'Material Cost', value: values.materialCost || 0, unit: '$/m²', description: 'Cost per square meter' },
      installationCost: { name: 'Installation Cost', value: values.installationCost || 0, unit: '$/m²', description: 'Installation cost per square meter' },
      maintenanceCost: { name: 'Maintenance Cost', value: values.maintenanceCost || 0, unit: '$/m²/year', description: 'Annual maintenance cost' },
      availability: { name: 'Availability', value: values.availability || 1, unit: 'rating', description: 'Market availability (0-1)' },
      leadTime: { name: 'Lead Time', value: values.leadTime || 30, unit: 'days', description: 'Typical delivery time' }
    };
  }

  private updatePanel(): void {
    if (!this.panel) return;

    const filteredMaterials = this.getFilteredMaterials();

    const panelContent = `
      <div class="material-database-panel vibelux-extension-panel">
        <div class="extension-header">
          <h3>🧪 Material Database</h3>
          <p>Comprehensive material library with properties</p>
        </div>

        <!-- Search and Filters -->
        <div class="extension-section">
          <h4>Search & Filters</h4>
          <div class="search-controls">
            <input type="text" id="material-search" placeholder="Search materials..." 
                   onkeyup="materialDb.searchMaterials(this.value)">
            
            <div class="filter-controls">
              <div class="filter-group">
                <label>Category:</label>
                <select id="category-filter" onchange="materialDb.updateFilter('category', this.value)">
                  <option value="all">All Categories</option>
                  <option value="glazing">Glazing</option>
                  <option value="structure">Structure</option>
                  <option value="insulation">Insulation</option>
                  <option value="growing-medium">Growing Medium</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label>Manufacturer:</label>
                <select id="manufacturer-filter" onchange="materialDb.updateFilter('manufacturer', this.value)">
                  <option value="all">All Manufacturers</option>
                  ${this.getUniqueManufacturers().map(mfg => `
                    <option value="${mfg}">${mfg}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div class="mode-toggle">
              <label>
                <input type="checkbox" ${this.comparisonMode ? 'checked' : ''} 
                       onchange="materialDb.toggleComparisonMode(this.checked)">
                Comparison Mode
              </label>
            </div>
          </div>
        </div>

        <!-- Material List -->
        <div class="extension-section">
          <h4>Materials (${filteredMaterials.length})</h4>
          <div class="materials-list">
            ${filteredMaterials.map(material => this.renderMaterialCard(material)).join('')}
          </div>
        </div>

        ${this.comparisonMode && this.selectedMaterials.size > 1 ? this.renderComparison() : ''}

        <!-- Quick Actions -->
        <div class="extension-section">
          <h4>Quick Actions</h4>
          <div class="quick-actions">
            <button class="btn btn-primary" onclick="materialDb.recommendMaterials()">
              🎯 Get Recommendations
            </button>
            <button class="btn btn-secondary" onclick="materialDb.exportDatabase()">
              📤 Export Database
            </button>
            <button class="btn btn-secondary" onclick="materialDb.importMaterials()">
              📥 Import Materials
            </button>
          </div>
        </div>

        <!-- Statistics -->
        <div class="extension-section">
          <h4>Database Statistics</h4>
          <div class="db-stats">
            <div class="stat-item">
              <span class="stat-label">Total Materials:</span>
              <span class="stat-value">${this.materialDatabase.size}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Categories:</span>
              <span class="stat-value">${this.getUniqueCategories().length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Manufacturers:</span>
              <span class="stat-value">${this.getUniqueManufacturers().length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Certifications:</span>
              <span class="stat-value">${this.getTotalCertifications()}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.panel.container.innerHTML = panelContent;
    
    // Make extension globally accessible for button callbacks
    (window as any).materialDb = this;
  }

  private renderMaterialCard(material: MaterialDatabase): string {
    const isSelected = this.selectedMaterials.has(material.id);
    
    return `
      <div class="material-card ${isSelected ? 'selected' : ''}" 
           onclick="materialDb.${this.comparisonMode ? 'toggleSelection' : 'viewMaterial'}('${material.id}')">
        
        ${this.comparisonMode ? `
          <div class="selection-checkbox">
            <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation()">
          </div>
        ` : ''}
        
        <div class="material-header">
          <div class="material-swatch" style="background-color: ${material.appearance.color}; opacity: ${material.appearance.transparency}"></div>
          <div class="material-title">
            <h5>${material.name}</h5>
            <span class="material-manufacturer">${material.manufacturer.name}</span>
            <span class="material-category">${material.category}</span>
          </div>
        </div>
        
        <div class="material-properties">
          <div class="property-row">
            <span class="prop-label">Light Trans.:</span>
            <span class="prop-value">${(material.optical.photometric.lightTransmission.value * 100).toFixed(1)}%</span>
          </div>
          <div class="property-row">
            <span class="prop-label">U-Value:</span>
            <span class="prop-value">${material.optical.photometric.uValue.value.toFixed(1)} W/m²·K</span>
          </div>
          <div class="property-row">
            <span class="prop-label">Cost:</span>
            <span class="prop-value">$${material.economic.materialCost.value.toFixed(2)}/m²</span>
          </div>
          <div class="property-row">
            <span class="prop-label">Lifespan:</span>
            <span class="prop-value">${material.environmental.sustainability.lifespan.value} years</span>
          </div>
        </div>
        
        <div class="material-certifications">
          ${material.certifications.slice(0, 2).map(cert => `
            <span class="cert-badge">${cert.standard}</span>
          `).join('')}
          ${material.certifications.length > 2 ? `<span class="cert-more">+${material.certifications.length - 2}</span>` : ''}
        </div>
        
        <div class="material-actions">
          <button class="btn btn-small" onclick="event.stopPropagation(); materialDb.viewDetails('${material.id}')">📋 Details</button>
          <button class="btn btn-small" onclick="event.stopPropagation(); materialDb.applyMaterial('${material.id}')">✨ Apply</button>
        </div>
      </div>
    `;
  }

  private renderComparison(): string {
    const selectedMaterials = Array.from(this.selectedMaterials).map(id => this.materialDatabase.get(id)!);
    
    return `
      <div class="extension-section comparison-section">
        <h4>Material Comparison</h4>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                ${selectedMaterials.map(mat => `<th>${mat.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Light Transmission</td>
                ${selectedMaterials.map(mat => `
                  <td>${(mat.optical.photometric.lightTransmission.value * 100).toFixed(1)}%</td>
                `).join('')}
              </tr>
              <tr>
                <td>U-Value</td>
                ${selectedMaterials.map(mat => `
                  <td>${mat.optical.photometric.uValue.value.toFixed(1)} W/m²·K</td>
                `).join('')}
              </tr>
              <tr>
                <td>Material Cost</td>
                ${selectedMaterials.map(mat => `
                  <td>$${mat.economic.materialCost.value.toFixed(2)}/m²</td>
                `).join('')}
              </tr>
              <tr>
                <td>Lifespan</td>
                ${selectedMaterials.map(mat => `
                  <td>${mat.environmental.sustainability.lifespan.value} years</td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="comparison-actions">
          <button class="btn btn-secondary" onclick="materialDb.clearSelection()">Clear Selection</button>
          <button class="btn btn-primary" onclick="materialDb.exportComparison()">📊 Export Comparison</button>
        </div>
      </div>
    `;
  }

  // Public API methods for panel callbacks
  public searchMaterials(query: string): void {
    // Implement search functionality
    this.updatePanel();
  }

  public updateFilter(filterType: string, value: string): void {
    (this.searchFilters as any)[filterType] = value;
    this.updatePanel();
  }

  public toggleComparisonMode(enabled: boolean): void {
    this.comparisonMode = enabled;
    if (!enabled) {
      this.selectedMaterials.clear();
    }
    this.updatePanel();
  }

  public toggleSelection(materialId: string): void {
    if (this.selectedMaterials.has(materialId)) {
      this.selectedMaterials.delete(materialId);
    } else {
      this.selectedMaterials.add(materialId);
    }
    this.updatePanel();
  }

  public viewMaterial(materialId: string): void {
    const material = this.materialDatabase.get(materialId);
    if (material) {
      // Open detailed view - would open a modal or separate panel
      console.log('Viewing material:', material.name);
      alert(`Material Details:\n\n${material.name}\n${material.description}\n\nLight Transmission: ${(material.optical.photometric.lightTransmission.value * 100).toFixed(1)}%\nU-Value: ${material.optical.photometric.uValue.value.toFixed(1)} W/m²·K\nCost: $${material.economic.materialCost.value.toFixed(2)}/m²`);
    }
  }

  public recommendMaterials(): void {
    // Simulate material recommendation based on project requirements
    const recommendations = this.generateRecommendations();
    
    alert(`Material Recommendations:\n\n${recommendations.map(rec => 
      `${this.materialDatabase.get(rec.materialId)?.name} (Score: ${rec.score.toFixed(1)})\nReasons: ${rec.reasons.join(', ')}`
    ).join('\n\n')}`);
  }

  private generateRecommendations(): MaterialRecommendation[] {
    // Simplified recommendation algorithm
    const materials = Array.from(this.materialDatabase.values());
    
    return materials.map(material => {
      let score = 0;
      const reasons: string[] = [];
      
      // Score based on light transmission for glazing materials
      if (material.category === 'glazing') {
        const lightTrans = material.optical.photometric.lightTransmission.value;
        if (lightTrans > 0.9) {
          score += 20;
          reasons.push('Excellent light transmission');
        }
      }
      
      // Score based on cost-effectiveness
      const costPerYear = material.economic.materialCost.value / material.environmental.sustainability.lifespan.value;
      if (costPerYear < 5) {
        score += 15;
        reasons.push('Cost-effective');
      }
      
      // Score based on environmental factors
      if (material.environmental.sustainability.recycledContent.value > 0.5) {
        score += 10;
        reasons.push('Sustainable');
      }
      
      return {
        materialId: material.id,
        score,
        reasons,
        concerns: [],
        alternatives: []
      };
    }).filter(rec => rec.score > 10).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private getFilteredMaterials(): MaterialDatabase[] {
    let materials = Array.from(this.materialDatabase.values());
    
    if (this.searchFilters.category !== 'all') {
      materials = materials.filter(mat => mat.category === this.searchFilters.category);
    }
    
    if (this.searchFilters.manufacturer !== 'all') {
      materials = materials.filter(mat => mat.manufacturer.name === this.searchFilters.manufacturer);
    }
    
    return materials;
  }

  private getUniqueCategories(): string[] {
    return [...new Set(Array.from(this.materialDatabase.values()).map(mat => mat.category))];
  }

  private getUniqueManufacturers(): string[] {
    return [...new Set(Array.from(this.materialDatabase.values()).map(mat => mat.manufacturer.name))];
  }

  private getTotalCertifications(): number {
    return Array.from(this.materialDatabase.values())
      .reduce((total, mat) => total + mat.certifications.length, 0);
  }

  public exportDatabase(): void {
    const data = Array.from(this.materialDatabase.values());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vibelux_material_database.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public clearSelection(): void {
    this.selectedMaterials.clear();
    this.updatePanel();
  }
}

// Register extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.MaterialDatabase', MaterialDatabaseForgeExtension);

export default MaterialDatabaseForgeExtension;