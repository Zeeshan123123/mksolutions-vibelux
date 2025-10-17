/**
 * Professional Report Generator Forge Extensions
 * Complete BIM-integrated reporting for MEP design
 */

import { ForgeExtension } from './vibelux-forge-extensions';
import { generateProfessionalReport, ProfessionalReportData } from '../reports/professionalReportGenerator';

interface ReportTemplate {
  id: string;
  name: string;
  type: 'hvac' | 'lighting' | 'electrical' | 'structural' | 'comprehensive' | 'cfd' | 'energy';
  description: string;
  sections: string[];
  estimatedPages: number;
  generationTime: number; // seconds
}

interface ReportConfig {
  template: string;
  includeDrawings: boolean;
  include3DViews: boolean;
  includeSchedules: boolean;
  includeCalculations: boolean;
  includeCFDAnalysis: boolean;
  format: 'pdf' | 'docx' | 'xlsx';
  branding: {
    companyName: string;
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

/**
 * Professional Report Generator Extension
 * Generates comprehensive BIM-based reports
 */
export class ProfessionalReportExtension extends ForgeExtension {
  private reportPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private modelData: any = {};
  private reportQueue: Map<string, any> = new Map();
  private isGenerating: boolean = false;

  private reportTemplates: ReportTemplate[] = [
    {
      id: 'comprehensive-mep',
      name: 'Comprehensive MEP Report',
      type: 'comprehensive',
      description: 'Complete mechanical, electrical, and plumbing design documentation',
      sections: ['Executive Summary', 'Design Criteria', 'HVAC Systems', 'Electrical Systems', 'Lighting Analysis', 'CFD Results', 'Equipment Schedules', 'Cost Analysis', 'Installation Details'],
      estimatedPages: 25,
      generationTime: 45
    },
    {
      id: 'hvac-design',
      name: 'HVAC System Design Report',
      type: 'hvac',
      description: 'Detailed HVAC design with load calculations and equipment sizing',
      sections: ['Load Calculations', 'System Selection', 'Equipment Schedules', 'Ductwork Layout', 'Control Strategy', 'Energy Analysis'],
      estimatedPages: 15,
      generationTime: 25
    },
    {
      id: 'lighting-analysis',
      name: 'Lighting Analysis Report',
      type: 'lighting',
      description: 'Comprehensive lighting design with photometric analysis',
      sections: ['Light Level Analysis', 'Fixture Schedule', 'Energy Consumption', 'Spectral Analysis', 'PPFD Distribution', 'Control Systems'],
      estimatedPages: 12,
      generationTime: 20
    },
    {
      id: 'cfd-analysis',
      name: 'CFD Analysis Report',
      type: 'cfd',
      description: 'Computational fluid dynamics analysis with airflow visualization',
      sections: ['Simulation Parameters', 'Velocity Distribution', 'Temperature Mapping', 'Pressure Analysis', 'Mixing Efficiency', 'Recommendations'],
      estimatedPages: 18,
      generationTime: 35
    },
    {
      id: 'energy-efficiency',
      name: 'Energy Efficiency Report',
      type: 'energy',
      description: 'Energy analysis with sustainability metrics and cost projections',
      sections: ['Energy Baseline', 'System Efficiency', 'Cost Analysis', 'ROI Projections', 'Sustainability Metrics', 'Recommendations'],
      estimatedPages: 10,
      generationTime: 15
    },
    {
      id: 'electrical-systems',
      name: 'Electrical Systems Report',
      type: 'electrical',
      description: 'Electrical design with panel schedules and load analysis',
      sections: ['Load Analysis', 'Panel Schedules', 'Circuit Design', 'Power Quality', 'Safety Systems', 'Code Compliance'],
      estimatedPages: 14,
      generationTime: 30
    }
  ];

  getName(): string {
    return 'VibeLux.ProfessionalReports';
  }

  load(): boolean {
    this.createReportPanel();
    this.setupToolbar();
    this.extractModelData();
    console.log('VibeLux Professional Reports Extension loaded');
    return true;
  }

  unload(): boolean {
    if (this.reportPanel) {
      this.reportPanel.uninitialize();
      this.reportPanel = null;
    }
    return true;
  }

  private createReportPanel(): void {
    this.reportPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-reports-panel',
      'Professional Reports',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="reports-generator">
        <div class="reports-header">
          <h3>📋 Professional Reports</h3>
          <p>Generate comprehensive BIM-based documentation</p>
        </div>
        
        <div class="reports-section">
          <h4>Report Templates</h4>
          <div class="template-selector">
            ${this.reportTemplates.map(template => `
              <div class="template-card" data-template="${template.id}">
                <div class="template-header">
                  <h5>${template.name}</h5>
                  <span class="template-badge">${template.type}</span>
                </div>
                <p class="template-description">${template.description}</p>
                <div class="template-info">
                  <span class="pages">~${template.estimatedPages} pages</span>
                  <span class="time">${template.generationTime}s</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="reports-section">
          <h4>Report Configuration</h4>
          <div class="config-form">
            <div class="form-group">
              <label>Selected Template:</label>
              <select id="selected-template" class="form-control">
                <option value="">Select a template...</option>
                ${this.reportTemplates.map(t => 
                  `<option value="${t.id}">${t.name}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label>Report Format:</label>
              <select id="report-format" class="form-control">
                <option value="pdf">PDF Document</option>
                <option value="docx">Word Document</option>
                <option value="xlsx">Excel Workbook</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Include Content:</label>
              <div class="checkbox-group">
                <label class="checkbox-item">
                  <input type="checkbox" id="include-drawings" checked>
                  <span>📐 2D Drawings</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="include-3d-views" checked>
                  <span>🎯 3D Views</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="include-schedules" checked>
                  <span>📊 Equipment Schedules</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="include-calculations" checked>
                  <span>🧮 Load Calculations</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="include-cfd">
                  <span>🌪️ CFD Analysis</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="reports-section">
          <h4>Company Branding</h4>
          <div class="branding-form">
            <div class="form-group">
              <label>Company Name:</label>
              <input type="text" id="company-name" class="form-control" value="VibeLux Industries">
            </div>
            
            <div class="form-group">
              <label>Primary Color:</label>
              <input type="color" id="primary-color" class="form-control" value="#3B82F6">
            </div>
            
            <div class="form-group">
              <label>Secondary Color:</label>
              <input type="color" id="secondary-color" class="form-control" value="#10B981">
            </div>
          </div>
        </div>
        
        <div class="reports-section">
          <h4>Project Information</h4>
          <div class="project-form">
            <div class="form-row">
              <div class="form-group half">
                <label>Project Name:</label>
                <input type="text" id="project-name" class="form-control" placeholder="Project Name">
              </div>
              <div class="form-group half">
                <label>Project Number:</label>
                <input type="text" id="project-number" class="form-control" placeholder="Project #">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label>Client:</label>
                <input type="text" id="client-name" class="form-control" placeholder="Client Name">
              </div>
              <div class="form-group half">
                <label>Designer:</label>
                <input type="text" id="designer-name" class="form-control" placeholder="Designer Name">
              </div>
            </div>
            
            <div class="form-group">
              <label>Location:</label>
              <input type="text" id="project-location" class="form-control" placeholder="Project Location">
            </div>
          </div>
        </div>
        
        <div class="reports-section">
          <h4>Generate Report</h4>
          <div class="generation-controls">
            <div class="report-preview" id="report-preview" style="display: none;">
              <h5>Report Preview</h5>
              <div id="preview-content"></div>
            </div>
            
            <div class="generation-buttons">
              <button id="preview-report" class="btn btn-secondary">
                👁️ Preview Report
              </button>
              <button id="generate-report" class="btn btn-primary">
                📄 Generate Report
              </button>
            </div>
            
            <div class="generation-status" id="generation-status" style="display: none;">
              <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
              </div>
              <span id="status-text">Preparing report...</span>
            </div>
          </div>
        </div>
        
        <div class="reports-section">
          <h4>Recent Reports</h4>
          <div id="recent-reports" class="recent-reports">
            <p class="no-reports">No reports generated yet</p>
          </div>
        </div>
      </div>
    `;

    this.reportPanel.container.innerHTML = panelContent;
    this.setupReportInterface();
  }

  private setupReportInterface(): void {
    // Template selection
    const templateCards = this.reportPanel?.container.querySelectorAll('.template-card');
    templateCards?.forEach(card => {
      card.addEventListener('click', (e) => {
        const templateId = (e.currentTarget as HTMLElement).dataset.template;
        if (templateId) {
          this.selectTemplate(templateId);
        }
      });
    });

    // Preview report
    const previewBtn = this.reportPanel?.container.querySelector('#preview-report');
    previewBtn?.addEventListener('click', () => this.previewReport());

    // Generate report
    const generateBtn = this.reportPanel?.container.querySelector('#generate-report');
    generateBtn?.addEventListener('click', () => this.generateReport());

    // Template dropdown sync
    const templateSelect = this.reportPanel?.container.querySelector('#selected-template') as HTMLSelectElement;
    templateSelect?.addEventListener('change', (e) => {
      const templateId = (e.target as HTMLSelectElement).value;
      if (templateId) {
        this.selectTemplate(templateId);
      }
    });
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const reportsGroup = toolbar.getControl('reports-controls') || 
      toolbar.addControl('reports-controls', { collapsible: true, index: 3 });

    // Generate report button
    const generateBtn = new Autodesk.Viewing.UI.Button('generate-report-btn');
    generateBtn.setToolTip('Generate Professional Report');
    generateBtn.setIcon('adsk-icon-properties');
    generateBtn.onClick = () => this.toggleReportPanel();
    reportsGroup.addControl(generateBtn);

    // Quick report buttons
    const quickHVAC = new Autodesk.Viewing.UI.Button('quick-hvac-report');
    quickHVAC.setToolTip('Quick HVAC Report');
    quickHVAC.setIcon('adsk-icon-measure');
    quickHVAC.onClick = () => this.generateQuickReport('hvac-design');
    reportsGroup.addControl(quickHVAC);

    const quickLighting = new Autodesk.Viewing.UI.Button('quick-lighting-report');
    quickLighting.setToolTip('Quick Lighting Report');
    quickLighting.setIcon('adsk-icon-visibility');
    quickLighting.onClick = () => this.generateQuickReport('lighting-analysis');
    reportsGroup.addControl(quickLighting);
  }

  private extractModelData(): void {
    // Extract data from current model
    const model = this.viewer.model;
    if (!model) return;

    this.modelData = {
      modelName: model.getData().name || 'Untitled Model',
      boundingBox: model.getBoundingBox(),
      metadata: model.getData().metadata,
      properties: {},
      equipment: {
        hvac: [],
        lighting: [],
        electrical: []
      },
      calculations: {},
      timestamp: new Date().toISOString()
    };

    // Extract equipment data
    this.extractEquipmentData();
    
    // Get load calculations if available
    this.extractCalculationData();
  }

  private extractEquipmentData(): void {
    // Get HVAC equipment from HVAC extension
    const hvacExtension = this.viewer.getExtension('VibeLux.HVACDesign');
    if (hvacExtension && hvacExtension.hvacEquipment) {
      this.modelData.equipment.hvac = Array.from(hvacExtension.hvacEquipment.values())
        .map(eq => ({
          id: eq.userData.id,
          type: eq.userData.equipmentType,
          position: eq.position,
          specifications: eq.userData.specifications
        }));
    }

    // Get lighting data from lighting extension
    const lightingExtension = this.viewer.getExtension('VibeLux.SpectralHeatmap');
    if (lightingExtension) {
      this.modelData.equipment.lighting = []; // Extract lighting fixtures
    }

    // Get CFD data if available
    const cfdExtension = this.viewer.getExtension('VibeLux.CFDVisualization');
    if (cfdExtension && cfdExtension.simulationResult) {
      this.modelData.cfd = {
        maxVelocity: cfdExtension.simulationResult.maxVelocity,
        avgTemperature: cfdExtension.simulationResult.avgTemperature,
        uniformityIndex: cfdExtension.simulationResult.uniformityIndex
      };
    }
  }

  private extractCalculationData(): void {
    // Extract load calculations from HVAC extension
    const hvacExtension = this.viewer.getExtension('VibeLux.HVACDesign');
    if (hvacExtension) {
      this.modelData.calculations = hvacExtension.getCalculatedLoads?.() || {};
    }
  }

  private selectTemplate(templateId: string): void {
    // Highlight selected template
    const templateCards = this.reportPanel?.container.querySelectorAll('.template-card');
    templateCards?.forEach(card => card.classList.remove('selected'));
    
    const selectedCard = this.reportPanel?.container.querySelector(`[data-template="${templateId}"]`);
    selectedCard?.classList.add('selected');

    // Update dropdown
    const templateSelect = this.reportPanel?.container.querySelector('#selected-template') as HTMLSelectElement;
    if (templateSelect) {
      templateSelect.value = templateId;
    }

    // Enable CFD checkbox for CFD report
    const cfdCheckbox = this.reportPanel?.container.querySelector('#include-cfd') as HTMLInputElement;
    const template = this.reportTemplates.find(t => t.id === templateId);
    if (cfdCheckbox && template) {
      cfdCheckbox.disabled = template.type !== 'cfd' && template.type !== 'comprehensive';
      if (template.type === 'cfd') {
        cfdCheckbox.checked = true;
      }
    }
  }

  private previewReport(): void {
    const config = this.getReportConfig();
    if (!config.template) {
      alert('Please select a report template');
      return;
    }

    const template = this.reportTemplates.find(t => t.id === config.template);
    if (!template) return;

    const previewDiv = this.reportPanel?.container.querySelector('#report-preview');
    const previewContent = this.reportPanel?.container.querySelector('#preview-content');
    
    if (previewDiv && previewContent) {
      previewContent.innerHTML = `
        <div class="preview-header">
          <h4>${template.name}</h4>
          <p>Estimated ${template.estimatedPages} pages • ${template.generationTime}s generation time</p>
        </div>
        <div class="preview-sections">
          <h5>Report Sections:</h5>
          <ul>
            ${template.sections.map(section => `<li>${section}</li>`).join('')}
          </ul>
        </div>
        <div class="preview-data">
          <h5>Available Data:</h5>
          <ul>
            <li>HVAC Equipment: ${this.modelData.equipment?.hvac?.length || 0} items</li>
            <li>Lighting Fixtures: ${this.modelData.equipment?.lighting?.length || 0} items</li>
            <li>CFD Analysis: ${this.modelData.cfd ? 'Available' : 'Not available'}</li>
            <li>Load Calculations: ${Object.keys(this.modelData.calculations || {}).length > 0 ? 'Available' : 'Not available'}</li>
          </ul>
        </div>
      `;
      previewDiv.style.display = 'block';
    }
  }

  private async generateReport(): Promise<void> {
    const config = this.getReportConfig();
    if (!config.template) {
      alert('Please select a report template');
      return;
    }

    this.isGenerating = true;
    this.showGenerationProgress(0, 'Initializing report generation...');

    try {
      // Capture 3D views if requested
      let views3D: string[] = [];
      if (config.include3DViews) {
        this.showGenerationProgress(20, 'Capturing 3D views...');
        views3D = await this.capture3DViews();
      }

      // Generate report data
      this.showGenerationProgress(40, 'Compiling report data...');
      const reportData = await this.compileReportData(config, views3D);

      // Generate the report
      this.showGenerationProgress(70, 'Generating document...');
      const reportBlob = await this.generateReportDocument(reportData, config);

      // Download the report
      this.showGenerationProgress(90, 'Preparing download...');
      this.downloadReport(reportBlob, config);

      this.showGenerationProgress(100, 'Report generated successfully!');
      
      // Add to recent reports
      this.addToRecentReports(config);

    } catch (error) {
      console.error('Report generation failed:', error);
      this.showGenerationProgress(0, 'Report generation failed. Please try again.');
    } finally {
      this.isGenerating = false;
      setTimeout(() => this.hideGenerationProgress(), 2000);
    }
  }

  private getReportConfig(): ReportConfig {
    const templateSelect = this.reportPanel?.container.querySelector('#selected-template') as HTMLSelectElement;
    const formatSelect = this.reportPanel?.container.querySelector('#report-format') as HTMLSelectElement;
    const includeDrawings = this.reportPanel?.container.querySelector('#include-drawings') as HTMLInputElement;
    const include3DViews = this.reportPanel?.container.querySelector('#include-3d-views') as HTMLInputElement;
    const includeSchedules = this.reportPanel?.container.querySelector('#include-schedules') as HTMLInputElement;
    const includeCalculations = this.reportPanel?.container.querySelector('#include-calculations') as HTMLInputElement;
    const includeCFD = this.reportPanel?.container.querySelector('#include-cfd') as HTMLInputElement;
    const companyName = this.reportPanel?.container.querySelector('#company-name') as HTMLInputElement;
    const primaryColor = this.reportPanel?.container.querySelector('#primary-color') as HTMLInputElement;
    const secondaryColor = this.reportPanel?.container.querySelector('#secondary-color') as HTMLInputElement;

    return {
      template: templateSelect?.value || '',
      includeDrawings: includeDrawings?.checked || false,
      include3DViews: include3DViews?.checked || false,
      includeSchedules: includeSchedules?.checked || false,
      includeCalculations: includeCalculations?.checked || false,
      includeCFDAnalysis: includeCFD?.checked || false,
      format: (formatSelect?.value as any) || 'pdf',
      branding: {
        companyName: companyName?.value || 'VibeLux Industries',
        colors: {
          primary: primaryColor?.value || '#3B82F6',
          secondary: secondaryColor?.value || '#10B981'
        }
      }
    };
  }

  private async capture3DViews(): Promise<string[]> {
    const views: string[] = [];
    
    // Capture current view
    const currentView = await this.captureViewerScreenshot();
    if (currentView) views.push(currentView);

    // Capture isometric view
    this.viewer.setViewCube('front');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isoView = await this.captureViewerScreenshot();
    if (isoView) views.push(isoView);

    // Capture top view
    this.viewer.setViewCube('top');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const topView = await this.captureViewerScreenshot();
    if (topView) views.push(topView);

    return views;
  }

  private async captureViewerScreenshot(): Promise<string | null> {
    return new Promise((resolve) => {
      this.viewer.getScreenShot(400, 300, (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    });
  }

  private async compileReportData(config: ReportConfig, views3D: string[]): Promise<ProfessionalReportData> {
    const projectName = (this.reportPanel?.container.querySelector('#project-name') as HTMLInputElement)?.value || 'Untitled Project';
    const projectNumber = (this.reportPanel?.container.querySelector('#project-number') as HTMLInputElement)?.value || '0000-00';
    const clientName = (this.reportPanel?.container.querySelector('#client-name') as HTMLInputElement)?.value || 'Client Name';
    const designerName = (this.reportPanel?.container.querySelector('#designer-name') as HTMLInputElement)?.value || 'Designer Name';
    const projectLocation = (this.reportPanel?.container.querySelector('#project-location') as HTMLInputElement)?.value || 'Project Location';

    // Calculate facility area and costs
    const bbox = this.modelData.boundingBox;
    const area = bbox ? (bbox.max.x - bbox.min.x) * (bbox.max.y - bbox.min.y) * 10.764 : 1000; // Convert to sq ft
    const estimatedCost = area * 150; // $150/sq ft estimate

    const reportData: ProfessionalReportData = {
      project: {
        name: projectName,
        number: projectNumber,
        date: new Date().toLocaleDateString(),
        client: clientName,
        location: projectLocation,
        designer: designerName,
        totalValue: estimatedCost,
        squareFootage: area
      },
      costBreakdown: {
        structure: [
          { description: 'Building structure and envelope', cost: estimatedCost * 0.3, costPerSqFt: 45 }
        ],
        mechanical: [
          { description: 'HVAC systems and controls', cost: estimatedCost * 0.25, costPerSqFt: 37.5 }
        ],
        electrical: [
          { description: 'Electrical distribution and lighting', cost: estimatedCost * 0.2, costPerSqFt: 30 }
        ],
        irrigation: [
          { description: 'Irrigation and water systems', cost: estimatedCost * 0.1, costPerSqFt: 15 }
        ],
        controls: [
          { description: 'Building automation and controls', cost: estimatedCost * 0.08, costPerSqFt: 12 }
        ],
        equipment: [
          { description: 'Process equipment and fixtures', cost: estimatedCost * 0.05, costPerSqFt: 7.5 }
        ],
        services: [
          { description: 'Engineering and project management', cost: estimatedCost * 0.02, costPerSqFt: 3 }
        ]
      },
      technicalSpecs: {
        structureType: 'Steel frame with insulated panels',
        dimensions: { width: 100, length: 200, height: 20, count: 1 },
        glazingType: 'High-performance glazing',
        ventilationType: 'Mechanical ventilation with heat recovery',
        heatingSystem: {
          boilers: [{ model: 'High-efficiency boiler', capacity: '500,000 BTU/hr', efficiency: '95%', quantity: 1 }],
          distribution: 'Hydronic distribution',
          zones: 4,
          totalCapacity: '500,000 BTU/hr'
        },
        coolingSystem: {
          chillers: [{ model: 'Air-cooled chiller', capacity: '50 tons', type: 'Screw', quantity: 1 }],
          fanCoils: [{ model: 'Fan coil units', capacity: '2-ton', quantity: 25 }],
          zones: 4,
          totalCapacity: '50 tons'
        },
        irrigationSystem: {
          tanks: [{ type: 'Storage tank', capacity: '5,000 gal', quantity: 1 }],
          pumps: [{ type: 'Centrifugal pump', flowRate: '100 GPM', pressure: '30 psi', quantity: 2 }],
          zones: [
            { name: 'Zone 1', area: area / 4, flowRate: '25 GPM', fixtureCount: 50 }
          ],
          waterTreatment: ['Filtration', 'UV sterilization']
        },
        lightingSystem: {
          fixtures: [{ type: 'LED grow lights', wattage: 400, quantity: 100, zone: 'Growing area' }],
          totalLoad: '40 kW',
          controlType: 'Smart lighting controls',
          ppfd: { min: 400, max: 600, avg: 500 }
        },
        controlSystem: {
          type: 'Building automation system',
          features: ['Climate control', 'Lighting control', 'Irrigation control'],
          ioPoints: 128,
          interfaces: ['Web interface', 'Mobile app']
        }
      },
      equipmentSchedules: {
        hvac: this.modelData.equipment.hvac.map((eq: any, index: number) => ({
          tag: `H-${index + 1}`,
          description: eq.type,
          location: 'Equipment room',
          specs: JSON.stringify(eq.specifications)
        })),
        electrical: [
          { panel: 'MDP', voltage: '480V', phase: 3, amperage: 800, circuits: 10 }
        ],
        pumps: [
          { tag: 'P-1', service: 'Irrigation', flow: '100 GPM', head: '30 ft', hp: 5 }
        ],
        tanks: [
          { tag: 'T-1', service: 'Water storage', capacity: '5,000 gal', material: 'Fiberglass' }
        ]
      },
      installationDetails: {
        foundation: 'Concrete slab on grade',
        structuralConnections: 'Bolted steel connections',
        mechanicalSupports: 'Vibration isolation',
        electricalRaceways: 'EMT conduit',
        controlWiring: 'Shielded cable'
      },
      drawings: {
        architectural: views3D,
        mechanical: [],
        electrical: [],
        plumbing: [],
        details: []
      }
    };

    return reportData;
  }

  private async generateReportDocument(reportData: ProfessionalReportData, config: ReportConfig): Promise<Blob> {
    // Use the existing professional report generator
    return await generateProfessionalReport(reportData);
  }

  private downloadReport(blob: Blob, config: ReportConfig): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const template = this.reportTemplates.find(t => t.id === config.template);
    const fileName = `${template?.name.replace(/\s+/g, '_') || 'report'}.${config.format}`;
    
    a.href = url;
    a.download = fileName;
    a.click();
    
    window.URL.revokeObjectURL(url);
  }

  private showGenerationProgress(percentage: number, message: string): void {
    const statusDiv = this.reportPanel?.container.querySelector('#generation-status');
    const progressFill = this.reportPanel?.container.querySelector('#progress-fill');
    const statusText = this.reportPanel?.container.querySelector('#status-text');
    
    if (statusDiv && progressFill && statusText) {
      statusDiv.style.display = 'block';
      (progressFill as HTMLElement).style.width = `${percentage}%`;
      statusText.textContent = message;
    }
  }

  private hideGenerationProgress(): void {
    const statusDiv = this.reportPanel?.container.querySelector('#generation-status');
    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
  }

  private addToRecentReports(config: ReportConfig): void {
    const recentDiv = this.reportPanel?.container.querySelector('#recent-reports');
    if (!recentDiv) return;

    const template = this.reportTemplates.find(t => t.id === config.template);
    const reportItem = document.createElement('div');
    reportItem.className = 'recent-report-item';
    reportItem.innerHTML = `
      <div class="report-info">
        <h5>${template?.name || 'Report'}</h5>
        <p>Generated ${new Date().toLocaleString()}</p>
      </div>
      <div class="report-actions">
        <button class="btn btn-small" onclick="this.regenerateReport('${config.template}')">
          🔄 Regenerate
        </button>
      </div>
    `;

    // Remove "no reports" message
    const noReports = recentDiv.querySelector('.no-reports');
    if (noReports) {
      noReports.remove();
    }

    recentDiv.insertBefore(reportItem, recentDiv.firstChild);
  }

  private toggleReportPanel(): void {
    if (this.reportPanel) {
      this.reportPanel.setVisible(!this.reportPanel.isVisible());
    }
  }

  private async generateQuickReport(templateId: string): Promise<void> {
    // Quick generation with default settings
    const config: ReportConfig = {
      template: templateId,
      includeDrawings: true,
      include3DViews: true,
      includeSchedules: true,
      includeCalculations: true,
      includeCFDAnalysis: false,
      format: 'pdf',
      branding: {
        companyName: 'VibeLux Industries',
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981'
        }
      }
    };

    // Update model data
    this.extractModelData();

    // Generate report
    await this.generateReport();
  }

  // Public API methods for other extensions
  public async generateHVACReport(data: any): Promise<void> {
    // Called by HVAC extension
    this.modelData.hvac = data;
    await this.generateQuickReport('hvac-design');
  }

  public async generateLightingReport(data: any): Promise<void> {
    // Called by lighting extension
    this.modelData.lighting = data;
    await this.generateQuickReport('lighting-analysis');
  }

  public async generateCFDReport(data: any): Promise<void> {
    // Called by CFD extension
    this.modelData.cfd = data;
    await this.generateQuickReport('cfd-analysis');
  }
}

export default ProfessionalReportExtension;