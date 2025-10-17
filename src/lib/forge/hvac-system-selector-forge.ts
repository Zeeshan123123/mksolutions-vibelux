/**
 * HVAC System Selector Forge Extension
 * 3D system selection and visualization integrated with existing selector
 */

import { ForgeExtension } from './vibelux-forge-extensions';
import { ENHANCED_HVAC_SYSTEMS, EnhancedHVACSystemType } from '../../components/EnhancedHVACSystemSelector';

interface SystemPlacement {
  id: string;
  system: EnhancedHVACSystemType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  mesh: THREE.Group;
  connections: string[];
}

interface SystemRequirements {
  coolingLoad: number;
  heatingLoad: number;
  area: number;
  climate: string;
  budget: number;
}

/**
 * HVAC System Selector Extension
 * Interactive 3D system selection and placement
 */
export class HVACSystemSelectorExtension extends ForgeExtension {
  private selectorPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private placedSystems: Map<string, SystemPlacement> = new Map();
  private selectedSystemType: EnhancedHVACSystemType | null = null;
  private isPlacementMode: boolean = false;
  private systemRequirements: SystemRequirements = {
    coolingLoad: 50,
    heatingLoad: 30,
    area: 1000,
    climate: 'mixed',
    budget: 100000
  };

  getName(): string {
    return 'VibeLux.HVACSystemSelector';
  }

  load(): boolean {
    this.createSelectorPanel();
    this.setupToolbar();
    this.setupEventHandlers();
    console.log('VibeLux HVAC System Selector Extension loaded');
    return true;
  }

  unload(): boolean {
    if (this.selectorPanel) {
      this.selectorPanel.uninitialize();
      this.selectorPanel = null;
    }
    this.clearAllSystems();
    return true;
  }

  private createSelectorPanel(): void {
    this.selectorPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-hvac-selector-panel',
      'HVAC System Selector',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="hvac-system-selector">
        <div class="selector-header">
          <h3>🏭 HVAC System Selector</h3>
          <p>Select and place HVAC systems in 3D</p>
        </div>
        
        <div class="selector-section">
          <h4>Facility Requirements</h4>
          <div class="requirements-form">
            <div class="form-row">
              <div class="form-group">
                <label>Cooling Load (tons):</label>
                <input type="number" id="cooling-load" value="50" min="1" max="500">
              </div>
              <div class="form-group">
                <label>Heating Load (kBtu/hr):</label>
                <input type="number" id="heating-load" value="300" min="10" max="5000">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Area (sq ft):</label>
                <input type="number" id="facility-area" value="1000" min="100" max="50000">
              </div>
              <div class="form-group">
                <label>Budget ($):</label>
                <input type="number" id="system-budget" value="100000" min="5000" max="1000000">
              </div>
            </div>
            
            <div class="form-group">
              <label>Climate Zone:</label>
              <select id="climate-zone">
                <option value="hot-humid">Hot-Humid</option>
                <option value="hot-dry">Hot-Dry</option>
                <option value="mixed" selected>Mixed</option>
                <option value="cold">Cold</option>
                <option value="marine">Marine</option>
              </select>
            </div>
            
            <button id="calculate-recommendations" class="btn btn-primary">
              🎯 Calculate Recommendations
            </button>
          </div>
        </div>
        
        <div class="selector-section">
          <h4>Recommended Systems</h4>
          <div id="system-recommendations" class="system-cards">
            <p class="no-recommendations">Click "Calculate Recommendations" to see options</p>
          </div>
        </div>
        
        <div class="selector-section">
          <h4>All Available Systems</h4>
          <div class="system-filter">
            <select id="category-filter">
              <option value="all">All Categories</option>
              <option value="packaged">Packaged Units</option>
              <option value="split">Split Systems</option>
              <option value="hydronic">Hydronic Systems</option>
              <option value="vrf">VRF Systems</option>
              <option value="dedicated">DOAS Systems</option>
              <option value="hybrid">Hybrid Systems</option>
            </select>
            
            <select id="efficiency-filter">
              <option value="all">All Efficiency</option>
              <option value="standard">Standard</option>
              <option value="high">High Efficiency</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          
          <div id="all-systems" class="system-cards">
            ${this.renderSystemCards(ENHANCED_HVAC_SYSTEMS)}
          </div>
        </div>
        
        <div class="selector-section">
          <h4>Placed Systems</h4>
          <div id="placed-systems" class="placed-systems">
            <p class="no-systems">No systems placed yet</p>
          </div>
          
          <div class="system-totals" id="system-totals" style="display: none;">
            <div class="total-item">
              <span>Total Cost:</span>
              <span id="total-cost">$0</span>
            </div>
            <div class="total-item">
              <span>Total Capacity:</span>
              <span id="total-capacity">0 tons</span>
            </div>
            <div class="total-item">
              <span>Systems Count:</span>
              <span id="systems-count">0</span>
            </div>
          </div>
        </div>
        
        <div class="selector-section">
          <h4>System Comparison</h4>
          <div class="comparison-controls">
            <button id="compare-selected" class="btn btn-secondary" disabled>
              📊 Compare Systems
            </button>
            <button id="export-selection" class="btn btn-secondary" disabled>
              📄 Export Selection
            </button>
            <button id="run-analysis" class="btn btn-primary" disabled>
              🔬 Run Analysis
            </button>
          </div>
          
          <div id="comparison-results" class="comparison-results" style="display: none;">
            <!-- Comparison results will be populated here -->
          </div>
        </div>
      </div>
    `;

    this.selectorPanel.container.innerHTML = panelContent;
    this.setupSelectorInterface();
  }

  private renderSystemCards(systems: EnhancedHVACSystemType[]): string {
    return systems.map(system => `
      <div class="system-card" data-system-id="${system.id}">
        <div class="system-header">
          <h5>${system.name}</h5>
          <span class="system-category">${system.category}</span>
        </div>
        
        <p class="system-description">${system.description}</p>
        
        <div class="system-specs">
          <div class="spec-item">
            <span class="label">Capacity:</span>
            <span class="value">${system.capacityRange.min}-${system.capacityRange.max} ${system.capacityRange.unit}</span>
          </div>
          <div class="spec-item">
            <span class="label">Efficiency:</span>
            <span class="value">${system.efficiency.cooling.min}-${system.efficiency.cooling.max} ${system.efficiency.cooling.unit}</span>
          </div>
          <div class="spec-item">
            <span class="label">Cost:</span>
            <span class="value">$${system.costRange.min.toLocaleString()}-${system.costRange.max.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="system-features">
          ${system.features.slice(0, 3).map(feature => 
            `<span class="feature-tag">${feature}</span>`
          ).join('')}
        </div>
        
        <div class="system-actions">
          <button class="btn btn-small btn-select" data-action="select">
            ✓ Select System
          </button>
          <button class="btn btn-small btn-details" data-action="details">
            ℹ️ Details
          </button>
          <button class="btn btn-small btn-place" data-action="place">
            📍 Place in 3D
          </button>
        </div>
      </div>
    `).join('');
  }

  private setupSelectorInterface(): void {
    // Requirements form handlers
    const coolingLoad = this.selectorPanel?.container.querySelector('#cooling-load') as HTMLInputElement;
    const heatingLoad = this.selectorPanel?.container.querySelector('#heating-load') as HTMLInputElement;
    const facilityArea = this.selectorPanel?.container.querySelector('#facility-area') as HTMLInputElement;
    const systemBudget = this.selectorPanel?.container.querySelector('#system-budget') as HTMLInputElement;
    const climateZone = this.selectorPanel?.container.querySelector('#climate-zone') as HTMLSelectElement;

    const updateRequirements = () => {
      this.systemRequirements = {
        coolingLoad: parseFloat(coolingLoad?.value || '50'),
        heatingLoad: parseFloat(heatingLoad?.value || '300'),
        area: parseFloat(facilityArea?.value || '1000'),
        climate: climateZone?.value || 'mixed',
        budget: parseFloat(systemBudget?.value || '100000')
      };
    };

    [coolingLoad, heatingLoad, facilityArea, systemBudget, climateZone].forEach(element => {
      element?.addEventListener('change', updateRequirements);
    });

    // Calculate recommendations
    const calculateBtn = this.selectorPanel?.container.querySelector('#calculate-recommendations');
    calculateBtn?.addEventListener('click', () => this.calculateRecommendations());

    // Filter handlers
    const categoryFilter = this.selectorPanel?.container.querySelector('#category-filter') as HTMLSelectElement;
    const efficiencyFilter = this.selectorPanel?.container.querySelector('#efficiency-filter') as HTMLSelectElement;

    [categoryFilter, efficiencyFilter].forEach(filter => {
      filter?.addEventListener('change', () => this.applyFilters());
    });

    // System card handlers
    this.setupSystemCardHandlers();

    // Comparison and analysis
    const compareBtn = this.selectorPanel?.container.querySelector('#compare-selected');
    const exportBtn = this.selectorPanel?.container.querySelector('#export-selection');
    const analysisBtn = this.selectorPanel?.container.querySelector('#run-analysis');

    compareBtn?.addEventListener('click', () => this.compareSelectedSystems());
    exportBtn?.addEventListener('click', () => this.exportSelection());
    analysisBtn?.addEventListener('click', () => this.runSystemAnalysis());
  }

  private setupSystemCardHandlers(): void {
    const systemCards = this.selectorPanel?.container.querySelectorAll('.system-card');
    
    systemCards?.forEach(card => {
      const systemId = card.getAttribute('data-system-id');
      const system = ENHANCED_HVAC_SYSTEMS.find(s => s.id === systemId);
      
      if (!system) return;

      // Select button
      const selectBtn = card.querySelector('[data-action="select"]');
      selectBtn?.addEventListener('click', () => this.selectSystem(system));

      // Details button
      const detailsBtn = card.querySelector('[data-action="details"]');
      detailsBtn?.addEventListener('click', () => this.showSystemDetails(system));

      // Place button
      const placeBtn = card.querySelector('[data-action="place"]');
      placeBtn?.addEventListener('click', () => this.enterPlacementMode(system));
    });
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const hvacGroup = toolbar.getControl('hvac-selector-controls') || 
      toolbar.addControl('hvac-selector-controls', { collapsible: true, index: 2 });

    // System selector toggle
    const selectorToggle = new Autodesk.Viewing.UI.Button('hvac-selector-toggle');
    selectorToggle.setToolTip('HVAC System Selector');
    selectorToggle.setIcon('adsk-icon-properties');
    selectorToggle.onClick = () => this.toggleSelectorPanel();
    hvacGroup.addControl(selectorToggle);

    // Quick placement tools
    const quickPackaged = new Autodesk.Viewing.UI.Button('quick-packaged');
    quickPackaged.setToolTip('Quick Place: Packaged Unit');
    quickPackaged.setIcon('adsk-icon-measure');
    quickPackaged.onClick = () => this.quickPlace('pkg-dx-premium');
    hvacGroup.addControl(quickPackaged);

    const quickChiller = new Autodesk.Viewing.UI.Button('quick-chiller');
    quickChiller.setToolTip('Quick Place: Chiller System');
    quickChiller.setIcon('adsk-icon-visibility');
    quickChiller.onClick = () => this.quickPlace('chilled-water-ahu');
    hvacGroup.addControl(quickChiller);
  }

  private setupEventHandlers(): void {
    // 3D placement click handler
    this.viewer.addEventListener(Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT, () => {
      this.viewer.canvas.addEventListener('click', (event) => {
        if (this.isPlacementMode && this.selectedSystemType) {
          this.placeSystemAt(event);
        }
      });
    });

    // System selection handler
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
      const selection = event.dbIdArray;
      if (selection.length > 0) {
        this.handleSystemSelection(selection[0]);
      }
    });
  }

  private calculateRecommendations(): void {
    const recommendationsDiv = this.selectorPanel?.container.querySelector('#system-recommendations');
    if (!recommendationsDiv) return;

    // Score systems based on requirements
    const scoredSystems = ENHANCED_HVAC_SYSTEMS
      .map(system => ({
        system,
        score: this.calculateSystemScore(system)
      }))
      .filter(item => item.score > 60) // Only show good matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 recommendations

    if (scoredSystems.length === 0) {
      recommendationsDiv.innerHTML = '<p class="no-recommendations">No suitable systems found for your requirements</p>';
      return;
    }

    recommendationsDiv.innerHTML = scoredSystems.map(({ system, score }) => `
      <div class="recommended-system" data-system-id="${system.id}">
        <div class="recommendation-header">
          <h5>${system.name}</h5>
          <span class="recommendation-score">${score.toFixed(0)}% match</span>
        </div>
        
        <p class="system-description">${system.description}</p>
        
        <div class="recommendation-reasons">
          <h6>Why recommended:</h6>
          <ul>
            ${this.getRecommendationReasons(system).map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        </div>
        
        <div class="recommendation-actions">
          <button class="btn btn-primary btn-place-recommended">
            📍 Place System
          </button>
          <button class="btn btn-secondary btn-details-recommended">
            ℹ️ View Details
          </button>
        </div>
      </div>
    `).join('');

    // Add event handlers for recommended systems
    this.setupRecommendationHandlers();
  }

  private calculateSystemScore(system: EnhancedHVACSystemType): number {
    let score = 0;
    const req = this.systemRequirements;

    // Capacity matching (30 points)
    const requiredTons = req.coolingLoad;
    if (requiredTons >= system.capacityRange.min && requiredTons <= system.capacityRange.max) {
      score += 30;
    } else {
      const capacityDiff = Math.min(
        Math.abs(requiredTons - system.capacityRange.min),
        Math.abs(requiredTons - system.capacityRange.max)
      );
      score += Math.max(0, 30 - (capacityDiff / requiredTons) * 30);
    }

    // Budget matching (25 points)
    const avgCost = (system.costRange.min + system.costRange.max) / 2;
    if (avgCost <= req.budget) {
      score += 25;
    } else {
      const budgetOverage = (avgCost - req.budget) / req.budget;
      score += Math.max(0, 25 - budgetOverage * 25);
    }

    // Climate suitability (20 points)
    if (system.climateZones.includes(req.climate)) {
      score += 20;
    }

    // Efficiency bonus (15 points)
    if (system.efficiency.cooling.unit === 'EER') {
      const efficiencyScore = Math.min(15, (system.efficiency.cooling.max - 12) * 3);
      score += Math.max(0, efficiencyScore);
    }

    // Features bonus (10 points)
    let featureScore = 0;
    if (system.controlCapabilities.humidity) featureScore += 3;
    if (system.controlCapabilities.co2) featureScore += 2;
    if (system.controlCapabilities.zoning) featureScore += 3;
    if (system.controlCapabilities.remote) featureScore += 2;
    score += featureScore;

    return Math.min(100, score);
  }

  private getRecommendationReasons(system: EnhancedHVACSystemType): string[] {
    const reasons = [];
    const req = this.systemRequirements;

    // Capacity match
    const requiredTons = req.coolingLoad;
    if (requiredTons >= system.capacityRange.min && requiredTons <= system.capacityRange.max) {
      reasons.push(`Perfect capacity match for ${requiredTons} tons`);
    }

    // Budget fit
    const avgCost = (system.costRange.min + system.costRange.max) / 2;
    if (avgCost <= req.budget) {
      reasons.push(`Within budget at ~$${avgCost.toLocaleString()}`);
    }

    // Climate suitability
    if (system.climateZones.includes(req.climate)) {
      reasons.push(`Designed for ${req.climate} climate`);
    }

    // High efficiency
    if (system.efficiency.cooling.max > 16) {
      reasons.push(`High efficiency (${system.efficiency.cooling.max} ${system.efficiency.cooling.unit})`);
    }

    // Special features
    if (system.controlCapabilities.humidity) {
      reasons.push('Includes humidity control');
    }
    if (system.controlCapabilities.co2) {
      reasons.push('CO₂ monitoring capability');
    }

    return reasons.slice(0, 4); // Limit to 4 reasons
  }

  private setupRecommendationHandlers(): void {
    const recommendedSystems = this.selectorPanel?.container.querySelectorAll('.recommended-system');
    
    recommendedSystems?.forEach(item => {
      const systemId = item.getAttribute('data-system-id');
      const system = ENHANCED_HVAC_SYSTEMS.find(s => s.id === systemId);
      
      if (!system) return;

      const placeBtn = item.querySelector('.btn-place-recommended');
      const detailsBtn = item.querySelector('.btn-details-recommended');

      placeBtn?.addEventListener('click', () => this.enterPlacementMode(system));
      detailsBtn?.addEventListener('click', () => this.showSystemDetails(system));
    });
  }

  private selectSystem(system: EnhancedHVACSystemType): void {
    this.selectedSystemType = system;
    
    // Highlight selected system card
    const systemCards = this.selectorPanel?.container.querySelectorAll('.system-card');
    systemCards?.forEach(card => card.classList.remove('selected'));
    
    const selectedCard = this.selectorPanel?.container.querySelector(`[data-system-id="${system.id}"]`);
    selectedCard?.classList.add('selected');

    // Update UI state
    this.updateSelectionButtons(true);
  }

  private showSystemDetails(system: EnhancedHVACSystemType): void {
    // Create detailed popup or modal
    const detailsContent = `
      <div class="system-details-modal">
        <div class="details-header">
          <h3>${system.name}</h3>
          <span class="system-category">${system.category}</span>
        </div>
        
        <div class="details-content">
          <div class="details-section">
            <h4>Description</h4>
            <p>${system.description}</p>
          </div>
          
          <div class="details-section">
            <h4>Specifications</h4>
            <div class="spec-grid">
              <div class="spec-item">
                <strong>Capacity Range:</strong>
                ${system.capacityRange.min}-${system.capacityRange.max} ${system.capacityRange.unit}
              </div>
              <div class="spec-item">
                <strong>Cooling Efficiency:</strong>
                ${system.efficiency.cooling.min}-${system.efficiency.cooling.max} ${system.efficiency.cooling.unit}
              </div>
              <div class="spec-item">
                <strong>Heating Efficiency:</strong>
                ${system.efficiency.heating.min}-${system.efficiency.heating.max} ${system.efficiency.heating.unit}
              </div>
              <div class="spec-item">
                <strong>Cost Range:</strong>
                $${system.costRange.min.toLocaleString()}-${system.costRange.max.toLocaleString()}
              </div>
              <div class="spec-item">
                <strong>Lifespan:</strong>
                ${system.lifespan} years
              </div>
              <div class="spec-item">
                <strong>Warranty:</strong>
                ${system.warranty} years
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h4>Features</h4>
            <ul>
              ${system.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="details-section">
            <h4>Control Capabilities</h4>
            <div class="capabilities-grid">
              <div class="capability ${system.controlCapabilities.zoning ? 'available' : 'unavailable'}">
                Zoning: ${system.controlCapabilities.zoning ? '✓' : '✗'}
              </div>
              <div class="capability ${system.controlCapabilities.humidity ? 'available' : 'unavailable'}">
                Humidity Control: ${system.controlCapabilities.humidity ? '✓' : '✗'}
              </div>
              <div class="capability ${system.controlCapabilities.co2 ? 'available' : 'unavailable'}">
                CO₂ Monitoring: ${system.controlCapabilities.co2 ? '✓' : '✗'}
              </div>
              <div class="capability ${system.controlCapabilities.remote ? 'available' : 'unavailable'}">
                Remote Access: ${system.controlCapabilities.remote ? '✓' : '✗'}
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h4>Pros & Cons</h4>
            <div class="pros-cons">
              <div class="pros">
                <h5>Advantages:</h5>
                <ul>
                  ${system.pros.map(pro => `<li>✓ ${pro}</li>`).join('')}
                </ul>
              </div>
              <div class="cons">
                <h5>Considerations:</h5>
                <ul>
                  ${system.cons.map(con => `<li>⚠ ${con}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="details-actions">
          <button class="btn btn-primary" onclick="this.closeSystemDetails()">Close</button>
          <button class="btn btn-secondary" onclick="this.selectSystemFromDetails('${system.id}')">Select System</button>
        </div>
      </div>
    `;

    // Show in overlay or separate panel
    console.log('System details:', detailsContent);
  }

  private enterPlacementMode(system: EnhancedHVACSystemType): void {
    this.selectedSystemType = system;
    this.isPlacementMode = true;
    
    // Change cursor
    this.viewer.canvas.style.cursor = 'crosshair';
    
    // Show placement instructions
    this.viewer.showViewer3D(true);
    
    // Update UI
    const placeBtn = this.selectorPanel?.container.querySelector(`[data-system-id="${system.id}"] .btn-place`);
    if (placeBtn) {
      placeBtn.textContent = '❌ Cancel Placement';
      placeBtn.onclick = () => this.exitPlacementMode();
    }
  }

  private exitPlacementMode(): void {
    this.isPlacementMode = false;
    this.viewer.canvas.style.cursor = 'default';
    
    // Restore button text
    if (this.selectedSystemType) {
      const placeBtn = this.selectorPanel?.container.querySelector(`[data-system-id="${this.selectedSystemType.id}"] .btn-place`);
      if (placeBtn) {
        placeBtn.textContent = '📍 Place in 3D';
        placeBtn.onclick = () => this.enterPlacementMode(this.selectedSystemType!);
      }
    }
  }

  private async placeSystemAt(event: MouseEvent): Promise<void> {
    if (!this.selectedSystemType) return;

    const rect = this.viewer.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const hitPoint = this.viewer.clientToWorld(x, y, true);
    if (!hitPoint) return;

    // Create 3D representation of the system
    const systemMesh = await this.create3DSystemRepresentation(this.selectedSystemType, hitPoint);
    
    if (systemMesh) {
      const placementId = `system_${Date.now()}`;
      const placement: SystemPlacement = {
        id: placementId,
        system: this.selectedSystemType,
        position: hitPoint,
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        mesh: systemMesh,
        connections: []
      };

      this.placedSystems.set(placementId, placement);
      
      // Add to scene
      this.viewer.impl.scene.add(systemMesh);
      this.viewer.impl.invalidate(true);
      
      // Update UI
      this.updatePlacedSystemsList();
      this.updateSystemTotals();
      this.exitPlacementMode();
    }
  }

  private async create3DSystemRepresentation(
    system: EnhancedHVACSystemType, 
    position: THREE.Vector3
  ): Promise<THREE.Group> {
    const group = new THREE.Group();
    
    // Create system visualization based on type
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    const dimensions = { width: 4, height: 3, depth: 6 };

    switch (system.category) {
      case 'packaged':
        geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
        material = new THREE.MeshBasicMaterial({ 
          color: 0x4a90e2,
          transparent: true,
          opacity: 0.8
        });
        break;
        
      case 'hydronic':
        geometry = new THREE.BoxGeometry(dimensions.width * 1.5, dimensions.height, dimensions.depth);
        material = new THREE.MeshBasicMaterial({ 
          color: 0x50c878,
          transparent: true,
          opacity: 0.8
        });
        break;
        
      case 'vrf':
        geometry = new THREE.CylinderGeometry(dimensions.width / 2, dimensions.width / 2, dimensions.height, 16);
        material = new THREE.MeshBasicMaterial({ 
          color: 0xff6b35,
          transparent: true,
          opacity: 0.8
        });
        break;
        
      default:
        geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
        material = new THREE.MeshBasicMaterial({ 
          color: 0x888888,
          transparent: true,
          opacity: 0.8
        });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    // Add system metadata
    mesh.userData = {
      type: 'hvac_system',
      systemId: system.id,
      systemData: system
    };

    group.add(mesh);

    // Add system label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'system-label';
    labelDiv.innerHTML = `
      <div class="label-content">
        <h4>${system.name}</h4>
        <p>${system.capacityRange.min}-${system.capacityRange.max} ${system.capacityRange.unit}</p>
      </div>
    `;

    // Add connections visualization for applicable systems
    if (system.category === 'hydronic' || system.category === 'vrf') {
      this.addConnectionPoints(group, system);
    }

    return group;
  }

  private addConnectionPoints(group: THREE.Group, system: EnhancedHVACSystemType): void {
    // Add connection points for piping/refrigerant lines
    const connectionGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const connectionMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    // Supply connection
    const supplyConnection = new THREE.Mesh(connectionGeometry, connectionMaterial);
    supplyConnection.position.set(2, 0, 0);
    supplyConnection.userData = { type: 'supply_connection' };
    group.add(supplyConnection);

    // Return connection
    const returnConnection = new THREE.Mesh(connectionGeometry, connectionMaterial);
    returnConnection.position.set(-2, 0, 0);
    returnConnection.userData = { type: 'return_connection' };
    group.add(returnConnection);

    // Power connection
    const powerConnection = new THREE.Mesh(connectionGeometry, 
      new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    powerConnection.position.set(0, 1.5, -3);
    powerConnection.userData = { type: 'power_connection' };
    group.add(powerConnection);
  }

  private updatePlacedSystemsList(): void {
    const placedDiv = this.selectorPanel?.container.querySelector('#placed-systems');
    if (!placedDiv) return;

    if (this.placedSystems.size === 0) {
      placedDiv.innerHTML = '<p class="no-systems">No systems placed yet</p>';
      return;
    }

    const systemsHtml = Array.from(this.placedSystems.values()).map(placement => `
      <div class="placed-system-item" data-placement-id="${placement.id}">
        <div class="system-info">
          <h5>${placement.system.name}</h5>
          <p>${placement.system.capacityRange.min}-${placement.system.capacityRange.max} ${placement.system.capacityRange.unit}</p>
          <span class="system-cost">~$${((placement.system.costRange.min + placement.system.costRange.max) / 2).toLocaleString()}</span>
        </div>
        <div class="system-actions">
          <button class="btn btn-small" onclick="this.focusOnSystem('${placement.id}')">
            🎯 Focus
          </button>
          <button class="btn btn-small btn-danger" onclick="this.removeSystem('${placement.id}')">
            🗑️ Remove
          </button>
        </div>
      </div>
    `).join('');

    placedDiv.innerHTML = systemsHtml;
  }

  private updateSystemTotals(): void {
    const totalsDiv = this.selectorPanel?.container.querySelector('#system-totals');
    if (!totalsDiv) return;

    if (this.placedSystems.size === 0) {
      totalsDiv.style.display = 'none';
      return;
    }

    let totalCost = 0;
    let totalCapacity = 0;

    this.placedSystems.forEach(placement => {
      totalCost += (placement.system.costRange.min + placement.system.costRange.max) / 2;
      totalCapacity += (placement.system.capacityRange.min + placement.system.capacityRange.max) / 2;
    });

    const totalCostElement = totalsDiv.querySelector('#total-cost');
    const totalCapacityElement = totalsDiv.querySelector('#total-capacity');
    const systemsCountElement = totalsDiv.querySelector('#systems-count');

    if (totalCostElement) totalCostElement.textContent = `$${totalCost.toLocaleString()}`;
    if (totalCapacityElement) totalCapacityElement.textContent = `${totalCapacity.toFixed(1)} tons`;
    if (systemsCountElement) systemsCountElement.textContent = this.placedSystems.size.toString();

    totalsDiv.style.display = 'block';
    this.updateSelectionButtons(this.placedSystems.size > 0);
  }

  private updateSelectionButtons(hasSelection: boolean): void {
    const compareBtn = this.selectorPanel?.container.querySelector('#compare-selected') as HTMLButtonElement;
    const exportBtn = this.selectorPanel?.container.querySelector('#export-selection') as HTMLButtonElement;
    const analysisBtn = this.selectorPanel?.container.querySelector('#run-analysis') as HTMLButtonElement;

    if (compareBtn) compareBtn.disabled = !hasSelection;
    if (exportBtn) exportBtn.disabled = !hasSelection;
    if (analysisBtn) analysisBtn.disabled = !hasSelection;
  }

  private applyFilters(): void {
    const categoryFilter = this.selectorPanel?.container.querySelector('#category-filter') as HTMLSelectElement;
    const efficiencyFilter = this.selectorPanel?.container.querySelector('#efficiency-filter') as HTMLSelectElement;
    
    const category = categoryFilter?.value || 'all';
    const efficiency = efficiencyFilter?.value || 'all';

    let filteredSystems = ENHANCED_HVAC_SYSTEMS;

    if (category !== 'all') {
      filteredSystems = filteredSystems.filter(system => system.category === category);
    }

    if (efficiency !== 'all') {
      filteredSystems = filteredSystems.filter(system => {
        const maxEff = system.efficiency.cooling.max;
        switch (efficiency) {
          case 'standard': return maxEff < 14;
          case 'high': return maxEff >= 14 && maxEff < 18;
          case 'premium': return maxEff >= 18;
          default: return true;
        }
      });
    }

    const allSystemsDiv = this.selectorPanel?.container.querySelector('#all-systems');
    if (allSystemsDiv) {
      allSystemsDiv.innerHTML = this.renderSystemCards(filteredSystems);
      this.setupSystemCardHandlers();
    }
  }

  private toggleSelectorPanel(): void {
    if (this.selectorPanel) {
      this.selectorPanel.setVisible(!this.selectorPanel.isVisible());
    }
  }

  private quickPlace(systemId: string): void {
    const system = ENHANCED_HVAC_SYSTEMS.find(s => s.id === systemId);
    if (system) {
      this.enterPlacementMode(system);
    }
  }

  private handleSystemSelection(dbId: number): void {
    // Handle selection of placed systems
    this.viewer.getProperties(dbId, (props) => {
      if (props.userData?.type === 'hvac_system') {
        const systemId = props.userData.systemId;
        const system = ENHANCED_HVAC_SYSTEMS.find(s => s.id === systemId);
        if (system) {
          this.showSystemDetails(system);
        }
      }
    });
  }

  private compareSelectedSystems(): void {
    // Implement system comparison
    const systems = Array.from(this.placedSystems.values()).map(p => p.system);
    // Show comparison in panel or modal
    console.log('Comparing systems:', systems);
  }

  private exportSelection(): void {
    // Export placed systems data
    const exportData = {
      systems: Array.from(this.placedSystems.values()).map(placement => ({
        system: placement.system,
        position: placement.position,
        id: placement.id
      })),
      requirements: this.systemRequirements,
      totals: this.calculateTotals()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hvac-system-selection.json';
    a.click();
  }

  private runSystemAnalysis(): void {
    // Run analysis on placed systems
    const cfdExtension = this.viewer.getExtension('VibeLux.CFDVisualization');
    const hvacExtension = this.viewer.getExtension('VibeLux.HVACDesign');
    
    if (cfdExtension) {
      cfdExtension.runAnalysis();
    }
    
    if (hvacExtension) {
      hvacExtension.calculateHVACLoads();
    }
  }

  private calculateTotals(): any {
    let totalCost = 0;
    let totalCapacity = 0;
    const totalPower = 0;

    this.placedSystems.forEach(placement => {
      totalCost += (placement.system.costRange.min + placement.system.costRange.max) / 2;
      totalCapacity += (placement.system.capacityRange.min + placement.system.capacityRange.max) / 2;
    });

    return {
      cost: totalCost,
      capacity: totalCapacity,
      power: totalPower,
      count: this.placedSystems.size
    };
  }

  private clearAllSystems(): void {
    this.placedSystems.forEach(placement => {
      this.viewer.impl.scene.remove(placement.mesh);
    });
    this.placedSystems.clear();
    this.viewer.impl.invalidate(true);
  }

  // Public API methods
  public getPlacedSystems(): SystemPlacement[] {
    return Array.from(this.placedSystems.values());
  }

  public removeSystem(placementId: string): void {
    const placement = this.placedSystems.get(placementId);
    if (placement) {
      this.viewer.impl.scene.remove(placement.mesh);
      this.placedSystems.delete(placementId);
      this.viewer.impl.invalidate(true);
      this.updatePlacedSystemsList();
      this.updateSystemTotals();
    }
  }

  public focusOnSystem(placementId: string): void {
    const placement = this.placedSystems.get(placementId);
    if (placement) {
      this.viewer.navigation.setRequestTransitionWithUp(true, placement.position, 
        new THREE.Vector3().addVectors(placement.position, new THREE.Vector3(10, 10, 10)),
        new THREE.Vector3(0, 1, 0));
    }
  }
}

export default HVACSystemSelectorExtension;