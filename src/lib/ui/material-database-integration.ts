/**
 * Material Specification Database UI Integration
 * Connects the professional material database to the design interface
 * Provides interactive material selection, specification viewing, and integration
 */

import { MaterialSpecification, MaterialCategory, TestingData, InstallationProcedure } from '../professional-standards/material-specification-database';
import { BrandingConfig } from '../professional-standards/title-block-system';

export interface MaterialSearchOptions {
  category?: MaterialCategory;
  application?: string;
  priceRange?: { min: number; max: number };
  structuralRating?: { min: number; max: number };
  thermalRating?: { min: number; max: number };
  weatherRating?: { min: number; max: number };
  availabilityRequired?: boolean;
  sustainabilityRequired?: boolean;
  textSearch?: string;
}

export interface MaterialSelectionContext {
  projectType: 'greenhouse' | 'commercial' | 'residential';
  location: {
    climate: 'tropical' | 'temperate' | 'arid' | 'cold';
    windLoad: number; // psf
    snowLoad: number; // psf
    seismicZone: number;
  };
  budget: {
    total: number;
    materialBudget: number;
    prioritizeValue: boolean;
  };
  requirements: {
    structuralRequirements: string[];
    codeCompliance: string[];
    sustainabilityGoals: string[];
  };
}

export interface MaterialComparisonData {
  materials: MaterialSpecification[];
  comparisonMatrix: MaterialComparisonRow[];
  recommendations: MaterialRecommendation[];
  costAnalysis: MaterialCostAnalysis;
}

export interface MaterialComparisonRow {
  materialId: string;
  name: string;
  category: string;
  properties: Record<string, any>;
  scores: {
    structural: number;
    thermal: number;
    durability: number;
    cost: number;
    sustainability: number;
    overall: number;
  };
}

export interface MaterialRecommendation {
  materialId: string;
  confidence: number;
  reasons: string[];
  warnings: string[];
  alternatives: string[];
}

export interface MaterialCostAnalysis {
  totalMaterialCost: number;
  costBreakdown: MaterialCostBreakdown[];
  valueEngineering: ValueEngineeringOption[];
  lifecycle: LifecycleCostAnalysis;
}

export interface MaterialCostBreakdown {
  materialId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  laborFactor: number;
  installationCost: number;
  percentage: number;
}

export interface ValueEngineeringOption {
  description: string;
  originalMaterial: string;
  alternativeMaterial: string;
  costSavings: number;
  performanceImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface LifecycleCostAnalysis {
  initialCost: number;
  maintenanceCost: number;
  replacementCost: number;
  energyCost: number;
  totalLifecycleCost: number;
  paybackPeriod: number;
  roi: number;
}

export interface MaterialUIState {
  selectedMaterials: Set<string>;
  comparisonMode: boolean;
  filterOptions: MaterialSearchOptions;
  sortBy: 'name' | 'cost' | 'performance' | 'availability';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'comparison';
  showAdvancedFilters: boolean;
}

/**
 * Material Database UI Integration Class
 */
export class MaterialDatabaseIntegration {
  private vibeluxBranding: BrandingConfig;
  private uiState: MaterialUIState;
  private materialCache: Map<string, MaterialSpecification> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map();

  constructor(branding: BrandingConfig) {
    this.vibeluxBranding = branding;
    this.uiState = {
      selectedMaterials: new Set(),
      comparisonMode: false,
      filterOptions: {},
      sortBy: 'name',
      sortOrder: 'asc',
      viewMode: 'grid',
      showAdvancedFilters: false
    };
    this.initializeSearchIndex();
  }

  private initializeSearchIndex(): void {
    // Build search index for fast material lookup
    // This would be populated from the material database
  }

  /**
   * Generate material selection interface component
   */
  public generateMaterialSelector(
    context: MaterialSelectionContext,
    onMaterialSelect: (materialId: string) => void
  ): MaterialSelectorComponent {
    return {
      id: 'vibelux-material-selector',
      type: 'material-selector',
      config: {
        branding: this.vibeluxBranding,
        context,
        filterOptions: this.getContextualFilters(context),
        onSelect: onMaterialSelect,
        styling: this.getMaterialSelectorStyling()
      },
      render: () => this.renderMaterialSelector(context)
    };
  }

  /**
   * Generate material comparison interface
   */
  public generateMaterialComparison(
    materialIds: string[],
    context: MaterialSelectionContext
  ): MaterialComparisonComponent {
    const comparisonData = this.generateComparisonData(materialIds, context);
    
    return {
      id: 'vibelux-material-comparison',
      type: 'material-comparison',
      config: {
        branding: this.vibeluxBranding,
        comparisonData,
        context,
        styling: this.getMaterialComparisonStyling()
      },
      render: () => this.renderMaterialComparison(comparisonData)
    };
  }

  /**
   * Generate material specification viewer
   */
  public generateSpecificationViewer(
    materialId: string,
    detailLevel: 'summary' | 'detailed' | 'technical'
  ): MaterialSpecViewerComponent {
    const material = this.getMaterialById(materialId);
    
    return {
      id: `vibelux-spec-viewer-${materialId}`,
      type: 'specification-viewer',
      config: {
        branding: this.vibeluxBranding,
        material,
        detailLevel,
        styling: this.getSpecViewerStyling()
      },
      render: () => this.renderSpecificationViewer(material, detailLevel)
    };
  }

  /**
   * Generate interactive material search interface
   */
  public generateMaterialSearch(
    context: MaterialSelectionContext,
    onResults: (materials: MaterialSpecification[]) => void
  ): MaterialSearchComponent {
    return {
      id: 'vibelux-material-search',
      type: 'material-search',
      config: {
        branding: this.vibeluxBranding,
        context,
        searchOptions: this.getAdvancedSearchOptions(context),
        onResults,
        styling: this.getMaterialSearchStyling()
      },
      render: () => this.renderMaterialSearch(context)
    };
  }

  private renderMaterialSelector(context: MaterialSelectionContext): string {
    return `
      <div class="vibelux-material-selector" data-theme="vibelux-professional">
        <style>
          .vibelux-material-selector {
            font-family: ${this.vibeluxBranding.typography.primaryFont};
            background: linear-gradient(135deg, ${this.vibeluxBranding.brandColors.primary}10, ${this.vibeluxBranding.brandColors.secondary}05);
            border: 2px solid ${this.vibeluxBranding.brandColors.primary};
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 8px 32px rgba(0, 168, 107, 0.1);
          }
          
          .material-selector-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid ${this.vibeluxBranding.brandColors.primary};
          }
          
          .vibelux-logo-header {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .vibelux-logo-icon {
            width: 40px;
            height: 40px;
            background: ${this.vibeluxBranding.brandColors.primary};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          }
          
          .material-selector-title {
            font-family: ${this.vibeluxBranding.typography.headingFont};
            font-size: ${this.vibeluxBranding.typography.sizes.heading}px;
            color: ${this.vibeluxBranding.brandColors.text};
            margin: 0;
          }
          
          .context-info {
            background: ${this.vibeluxBranding.brandColors.primary}15;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            border-left: 4px solid ${this.vibeluxBranding.brandColors.primary};
          }
          
          .filter-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }
          
          .filter-group {
            background: white;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid ${this.vibeluxBranding.brandColors.neutral}40;
          }
          
          .filter-label {
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.text};
            margin-bottom: 8px;
            display: block;
          }
          
          .filter-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid ${this.vibeluxBranding.brandColors.neutral}60;
            border-radius: 4px;
            font-family: ${this.vibeluxBranding.typography.primaryFont};
          }
          
          .filter-input:focus {
            outline: none;
            border-color: ${this.vibeluxBranding.brandColors.primary};
            box-shadow: 0 0 0 2px ${this.vibeluxBranding.brandColors.primary}20;
          }
          
          .material-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
          }
          
          .material-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid ${this.vibeluxBranding.brandColors.neutral}30;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .material-card:hover {
            border-color: ${this.vibeluxBranding.brandColors.primary};
            box-shadow: 0 4px 20px ${this.vibeluxBranding.brandColors.primary}20;
            transform: translateY(-2px);
          }
          
          .material-card.selected {
            border-color: ${this.vibeluxBranding.brandColors.primary};
            background: ${this.vibeluxBranding.brandColors.primary}05;
          }
          
          .material-name {
            font-weight: 600;
            font-size: ${this.vibeluxBranding.typography.sizes.body}px;
            color: ${this.vibeluxBranding.brandColors.text};
            margin: 0 0 8px 0;
          }
          
          .material-category {
            color: ${this.vibeluxBranding.brandColors.primary};
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }
          
          .material-properties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .property-item {
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
            color: ${this.vibeluxBranding.brandColors.text};
          }
          
          .property-label {
            font-weight: 500;
          }
          
          .material-rating {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: ${this.vibeluxBranding.brandColors.neutral}10;
            border-radius: 6px;
          }
          
          .rating-label {
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
            color: ${this.vibeluxBranding.brandColors.text};
          }
          
          .rating-score {
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.primary};
          }
          
          .vibelux-quality-badge {
            background: ${this.vibeluxBranding.brandColors.accent};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
        
        <div class="material-selector-header">
          <div class="vibelux-logo-header">
            <div class="vibelux-logo-icon">V</div>
            <h2 class="material-selector-title">Professional Material Selection</h2>
          </div>
          <div class="vibelux-quality-badge">Quality Assured</div>
        </div>
        
        <div class="context-info">
          <h3 style="margin: 0 0 8px 0; color: ${this.vibeluxBranding.brandColors.primary};">
            Project Context: ${context.projectType.toUpperCase()} 
          </h3>
          <p style="margin: 0; color: ${this.vibeluxBranding.brandColors.text};">
            Climate: ${context.location.climate} | Wind Load: ${context.location.windLoad} psf | 
            Snow Load: ${context.location.snowLoad} psf | Budget: $${context.budget.materialBudget.toLocaleString()}
          </p>
        </div>
        
        <div class="filter-controls">
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select class="filter-input" id="category-filter">
              <option value="">All Categories</option>
              <option value="structural">Structural Systems</option>
              <option value="glazing">Glazing Systems</option>
              <option value="mechanical">Mechanical Systems</option>
              <option value="electrical">Electrical Systems</option>
              <option value="controls">Control Systems</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Price Range</label>
            <input type="range" class="filter-input" id="price-range" min="0" max="10000" value="5000">
            <span style="font-size: ${this.vibeluxBranding.typography.sizes.small}px;">$0 - $10,000</span>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Minimum Rating</label>
            <select class="filter-input" id="rating-filter">
              <option value="0">Any Rating</option>
              <option value="80">80+ (Excellent)</option>
              <option value="70">70+ (Good)</option>
              <option value="60">60+ (Acceptable)</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Search</label>
            <input type="text" class="filter-input" placeholder="Search materials..." id="search-input">
          </div>
        </div>
        
        <div class="material-grid" id="material-results">
          ${this.generateMaterialCards(context)}
        </div>
      </div>
    `;
  }

  private renderMaterialComparison(comparisonData: MaterialComparisonData): string {
    return `
      <div class="vibelux-material-comparison" data-theme="vibelux-professional">
        <style>
          .vibelux-material-comparison {
            font-family: ${this.vibeluxBranding.typography.primaryFont};
            background: white;
            border: 2px solid ${this.vibeluxBranding.brandColors.primary};
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 168, 107, 0.1);
          }
          
          .comparison-header {
            background: linear-gradient(135deg, ${this.vibeluxBranding.brandColors.primary}, ${this.vibeluxBranding.brandColors.secondary});
            color: white;
            padding: 24px;
            text-align: center;
          }
          
          .comparison-title {
            font-family: ${this.vibeluxBranding.typography.headingFont};
            font-size: ${this.vibeluxBranding.typography.sizes.title}px;
            margin: 0 0 8px 0;
          }
          
          .comparison-subtitle {
            opacity: 0.9;
            margin: 0;
          }
          
          .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
          }
          
          .comparison-table th {
            background: ${this.vibeluxBranding.brandColors.primary}15;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.text};
            border-bottom: 2px solid ${this.vibeluxBranding.brandColors.primary}30;
          }
          
          .comparison-table td {
            padding: 12px 16px;
            border-bottom: 1px solid ${this.vibeluxBranding.brandColors.neutral}20;
            vertical-align: top;
          }
          
          .comparison-table tr:hover {
            background: ${this.vibeluxBranding.brandColors.primary}05;
          }
          
          .material-header-cell {
            background: ${this.vibeluxBranding.brandColors.primary}10;
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.primary};
          }
          
          .score-cell {
            text-align: center;
            font-weight: 600;
          }
          
          .score-excellent { color: ${this.vibeluxBranding.brandColors.accent}; }
          .score-good { color: ${this.vibeluxBranding.brandColors.primary}; }
          .score-fair { color: ${this.vibeluxBranding.brandColors.secondary}; }
          .score-poor { color: #e74c3c; }
          
          .recommendations-section {
            padding: 24px;
            background: ${this.vibeluxBranding.brandColors.primary}05;
            border-top: 1px solid ${this.vibeluxBranding.brandColors.primary}20;
          }
          
          .recommendation-card {
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            border-left: 4px solid ${this.vibeluxBranding.brandColors.primary};
          }
          
          .recommendation-title {
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.primary};
            margin: 0 0 8px 0;
          }
          
          .confidence-badge {
            background: ${this.vibeluxBranding.brandColors.accent};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
            font-weight: 600;
            float: right;
          }
        </style>
        
        <div class="comparison-header">
          <h2 class="comparison-title">Material Comparison Analysis</h2>
          <p class="comparison-subtitle">Vibelux Professional Standards Assessment</p>
        </div>
        
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Property</th>
              ${comparisonData.materials.map(m => `<th class="material-header-cell">${m.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${this.generateComparisonRows(comparisonData)}
          </tbody>
        </table>
        
        <div class="recommendations-section">
          <h3 style="margin: 0 0 16px 0; color: ${this.vibeluxBranding.brandColors.primary};">
            Vibelux Professional Recommendations
          </h3>
          ${comparisonData.recommendations.map(rec => `
            <div class="recommendation-card">
              <h4 class="recommendation-title">
                ${this.getMaterialName(rec.materialId)}
                <span class="confidence-badge">${Math.round(rec.confidence * 100)}% Confidence</span>
              </h4>
              <ul style="margin: 8px 0; padding-left: 20px;">
                ${rec.reasons.map(reason => `<li>${reason}</li>`).join('')}
              </ul>
              ${rec.warnings.length > 0 ? `
                <div style="color: #e74c3c; font-size: ${this.vibeluxBranding.typography.sizes.small}px; margin-top: 8px;">
                  <strong>Considerations:</strong> ${rec.warnings.join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderSpecificationViewer(material: MaterialSpecification, detailLevel: string): string {
    return `
      <div class="vibelux-spec-viewer" data-detail-level="${detailLevel}">
        <style>
          .vibelux-spec-viewer {
            font-family: ${this.vibeluxBranding.typography.primaryFont};
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 800px;
          }
          
          .spec-header {
            background: linear-gradient(135deg, ${this.vibeluxBranding.brandColors.primary}, ${this.vibeluxBranding.brandColors.secondary});
            color: white;
            padding: 24px;
          }
          
          .spec-title {
            font-family: ${this.vibeluxBranding.typography.headingFont};
            font-size: ${this.vibeluxBranding.typography.sizes.title}px;
            margin: 0 0 8px 0;
          }
          
          .spec-category {
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
          }
          
          .spec-content {
            padding: 24px;
          }
          
          .spec-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid ${this.vibeluxBranding.brandColors.neutral}20;
          }
          
          .spec-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          
          .section-title {
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.primary};
            margin: 0 0 16px 0;
            font-size: ${this.vibeluxBranding.typography.sizes.heading}px;
          }
          
          .properties-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
          }
          
          .property-card {
            background: ${this.vibeluxBranding.brandColors.primary}05;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid ${this.vibeluxBranding.brandColors.primary};
          }
          
          .property-label {
            font-weight: 600;
            color: ${this.vibeluxBranding.brandColors.text};
            margin-bottom: 4px;
          }
          
          .property-value {
            color: ${this.vibeluxBranding.brandColors.text};
            font-size: ${this.vibeluxBranding.typography.sizes.body}px;
          }
          
          .property-unit {
            color: ${this.vibeluxBranding.brandColors.neutral};
            font-size: ${this.vibeluxBranding.typography.sizes.small}px;
          }
          
          .vibelux-certification {
            background: ${this.vibeluxBranding.brandColors.accent}15;
            border: 2px solid ${this.vibeluxBranding.brandColors.accent};
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-top: 24px;
          }
          
          .certification-badge {
            background: ${this.vibeluxBranding.brandColors.accent};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
          }
        </style>
        
        <div class="spec-header">
          <h2 class="spec-title">${material.name}</h2>
          <div class="spec-category">${material.category} | ${material.subcategory}</div>
        </div>
        
        <div class="spec-content">
          ${detailLevel === 'summary' ? this.renderSummaryContent(material) : ''}
          ${detailLevel === 'detailed' ? this.renderDetailedContent(material) : ''}
          ${detailLevel === 'technical' ? this.renderTechnicalContent(material) : ''}
          
          <div class="vibelux-certification">
            <div class="certification-badge">Vibelux Approved</div>
            <p style="margin: 8px 0 0 0; color: ${this.vibeluxBranding.brandColors.text};">
              This material meets Vibelux professional standards for greenhouse construction
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private renderMaterialSearch(context: MaterialSelectionContext): string {
    return `
      <div class="vibelux-material-search">
        <style>
          .vibelux-material-search {
            font-family: ${this.vibeluxBranding.typography.primaryFont};
            background: linear-gradient(135deg, ${this.vibeluxBranding.brandColors.primary}05, white);
            border-radius: 12px;
            padding: 24px;
            border: 1px solid ${this.vibeluxBranding.brandColors.primary}30;
          }
          
          .search-header {
            text-align: center;
            margin-bottom: 32px;
          }
          
          .search-title {
            font-family: ${this.vibeluxBranding.typography.headingFont};
            color: ${this.vibeluxBranding.brandColors.primary};
            margin: 0 0 8px 0;
          }
          
          .search-input-group {
            position: relative;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .search-input {
            width: 100%;
            padding: 16px 50px 16px 20px;
            border: 2px solid ${this.vibeluxBranding.brandColors.primary}30;
            border-radius: 25px;
            font-size: ${this.vibeluxBranding.typography.sizes.body}px;
            transition: all 0.3s ease;
          }
          
          .search-input:focus {
            outline: none;
            border-color: ${this.vibeluxBranding.brandColors.primary};
            box-shadow: 0 0 0 3px ${this.vibeluxBranding.brandColors.primary}20;
          }
          
          .search-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: ${this.vibeluxBranding.brandColors.primary};
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .search-button:hover {
            background: ${this.vibeluxBranding.brandColors.secondary};
            transform: translateY(-50%) scale(1.1);
          }
          
          .advanced-filters {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-top: 24px;
            border: 1px solid ${this.vibeluxBranding.brandColors.neutral}30;
          }
          
          .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .search-results {
            margin-top: 32px;
          }
          
          .results-count {
            color: ${this.vibeluxBranding.brandColors.text};
            margin-bottom: 16px;
            font-weight: 500;
          }
        </style>
        
        <div class="search-header">
          <h2 class="search-title">Vibelux Material Database</h2>
          <p style="color: ${this.vibeluxBranding.brandColors.text}; margin: 0;">
            Search our comprehensive database of professionally certified materials
          </p>
        </div>
        
        <div class="search-input-group">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search materials, manufacturers, or specifications..."
            id="material-search-input"
          >
          <button class="search-button" id="search-button">🔍</button>
        </div>
        
        <div class="advanced-filters" id="advanced-filters">
          <h3 style="margin: 0 0 16px 0; color: ${this.vibeluxBranding.brandColors.primary};">
            Advanced Filters
          </h3>
          <div class="filter-grid">
            ${this.generateAdvancedFilterControls(context)}
          </div>
        </div>
        
        <div class="search-results" id="search-results">
          <div class="results-count">Ready to search ${this.getMaterialDatabaseSize()} professional materials</div>
        </div>
      </div>
    `;
  }

  // Helper methods for generating UI components
  private generateMaterialCards(context: MaterialSelectionContext): string {
    // This would fetch and display actual materials based on context
    const sampleMaterials = this.getSampleMaterialsForContext(context);
    
    return sampleMaterials.map(material => `
      <div class="material-card" data-material-id="${material.id}" onclick="selectMaterial('${material.id}')">
        <h4 class="material-name">${material.name}</h4>
        <div class="material-category">${material.category}</div>
        <div class="material-properties">
          <div class="property-item">
            <span class="property-label">Cost:</span> $${material.pricing.basePrice}/${material.pricing.unit}
          </div>
          <div class="property-item">
            <span class="property-label">Lead Time:</span> ${material.availability.leadTime} days
          </div>
          <div class="property-item">
            <span class="property-label">Structural:</span> ${material.properties.mechanical.tensileStrength} psi
          </div>
          <div class="property-item">
            <span class="property-label">Thermal:</span> R-${material.properties.thermal.thermalResistance}
          </div>
        </div>
        <div class="material-rating">
          <span class="rating-label">Overall Rating</span>
          <span class="rating-score">${this.calculateOverallRating(material)}/100</span>
        </div>
      </div>
    `).join('');
  }

  private generateComparisonRows(comparisonData: MaterialComparisonData): string {
    const properties = [
      { key: 'cost', label: 'Cost per Unit', format: (val: any) => `$${val}` },
      { key: 'structural', label: 'Structural Rating', format: (val: any) => `${val}/100` },
      { key: 'thermal', label: 'Thermal Performance', format: (val: any) => `${val}/100` },
      { key: 'durability', label: 'Durability Rating', format: (val: any) => `${val}/100` },
      { key: 'sustainability', label: 'Sustainability Score', format: (val: any) => `${val}/100` },
      { key: 'availability', label: 'Lead Time', format: (val: any) => `${val} days` }
    ];

    return properties.map(prop => `
      <tr>
        <td style="font-weight: 600;">${prop.label}</td>
        ${comparisonData.comparisonMatrix.map(material => {
          const value = material.scores[prop.key as keyof typeof material.scores] || material.properties[prop.key];
          const scoreClass = this.getScoreClass(typeof value === 'number' ? value : 0);
          return `<td class="score-cell ${scoreClass}">${prop.format(value)}</td>`;
        }).join('')}
      </tr>
    `).join('');
  }

  private generateAdvancedFilterControls(context: MaterialSelectionContext): string {
    return `
      <div class="filter-group">
        <label>Application Type</label>
        <select class="filter-input">
          <option value="">Any Application</option>
          <option value="structural">Structural</option>
          <option value="glazing">Glazing</option>
          <option value="insulation">Insulation</option>
          <option value="foundation">Foundation</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Sustainability Rating</label>
        <select class="filter-input">
          <option value="">Any Rating</option>
          <option value="90">Excellent (90+)</option>
          <option value="80">Good (80+)</option>
          <option value="70">Fair (70+)</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Climate Suitability</label>
        <select class="filter-input">
          <option value="">${context.location.climate}</option>
          <option value="all">All Climates</option>
          <option value="harsh">Harsh Weather</option>
          <option value="marine">Marine Environment</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Code Compliance</label>
        <select class="filter-input">
          <option value="">Any Compliance</option>
          <option value="ibc">IBC 2021</option>
          <option value="nec">NEC 2023</option>
          <option value="ngma">NGMA Standards</option>
        </select>
      </div>
    `;
  }

  // Utility methods
  private getContextualFilters(context: MaterialSelectionContext): MaterialSearchOptions {
    return {
      priceRange: { min: 0, max: context.budget.materialBudget * 0.3 },
      structuralRating: { min: 70, max: 100 },
      availabilityRequired: true
    };
  }

  private getSampleMaterialsForContext(context: MaterialSelectionContext): MaterialSpecification[] {
    // This would be replaced with actual database query
    return [];
  }

  private generateComparisonData(materialIds: string[], context: MaterialSelectionContext): MaterialComparisonData {
    // This would generate actual comparison data
    return {
      materials: [],
      comparisonMatrix: [],
      recommendations: [],
      costAnalysis: {
        totalMaterialCost: 0,
        costBreakdown: [],
        valueEngineering: [],
        lifecycle: {
          initialCost: 0,
          maintenanceCost: 0,
          replacementCost: 0,
          energyCost: 0,
          totalLifecycleCost: 0,
          paybackPeriod: 0,
          roi: 0
        }
      }
    };
  }

  private getMaterialById(materialId: string): MaterialSpecification {
    // This would fetch from the material database
    return this.materialCache.get(materialId) || {} as MaterialSpecification;
  }

  private calculateOverallRating(material: MaterialSpecification): number {
    // Calculate weighted score based on structural, thermal, cost, and sustainability
    return 85; // Placeholder
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-fair';
    return 'score-poor';
  }

  private getMaterialName(materialId: string): string {
    const material = this.getMaterialById(materialId);
    return material.name || materialId;
  }

  private renderSummaryContent(material: MaterialSpecification): string {
    return `
      <div class="spec-section">
        <h3 class="section-title">Overview</h3>
        <p>${material.description}</p>
      </div>
      
      <div class="spec-section">
        <h3 class="section-title">Key Properties</h3>
        <div class="properties-grid">
          <div class="property-card">
            <div class="property-label">Cost</div>
            <div class="property-value">$${material.pricing.basePrice} <span class="property-unit">per ${material.pricing.unit}</span></div>
          </div>
          <div class="property-card">
            <div class="property-label">Lead Time</div>
            <div class="property-value">${material.availability.leadTime} <span class="property-unit">days</span></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderDetailedContent(material: MaterialSpecification): string {
    return this.renderSummaryContent(material) + `
      <div class="spec-section">
        <h3 class="section-title">Detailed Specifications</h3>
        <div class="properties-grid">
          <div class="property-card">
            <div class="property-label">Tensile Strength</div>
            <div class="property-value">${material.properties.mechanical.tensileStrength} <span class="property-unit">psi</span></div>
          </div>
          <div class="property-card">
            <div class="property-label">Thermal Resistance</div>
            <div class="property-value">R-${material.properties.thermal.thermalResistance}</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderTechnicalContent(material: MaterialSpecification): string {
    return this.renderDetailedContent(material) + `
      <div class="spec-section">
        <h3 class="section-title">Technical Data</h3>
        <div class="properties-grid">
          ${Object.entries(material.properties.mechanical).map(([key, value]) => `
            <div class="property-card">
              <div class="property-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
              <div class="property-value">${value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private getMaterialDatabaseSize(): number {
    return 2847; // Placeholder for actual database size
  }

  private getMaterialSelectorStyling(): any {
    return {
      primaryColor: this.vibeluxBranding.brandColors.primary,
      secondaryColor: this.vibeluxBranding.brandColors.secondary,
      fontFamily: this.vibeluxBranding.typography.primaryFont
    };
  }

  private getMaterialComparisonStyling(): any {
    return this.getMaterialSelectorStyling();
  }

  private getSpecViewerStyling(): any {
    return this.getMaterialSelectorStyling();
  }

  private getMaterialSearchStyling(): any {
    return this.getMaterialSelectorStyling();
  }

  private getAdvancedSearchOptions(context: MaterialSelectionContext): any {
    return {
      categories: ['structural', 'glazing', 'mechanical', 'electrical', 'controls'],
      applications: ['greenhouse', 'commercial', 'residential'],
      climateFilters: ['tropical', 'temperate', 'arid', 'cold']
    };
  }
}

// Component interfaces for UI framework integration
export interface MaterialSelectorComponent {
  id: string;
  type: 'material-selector';
  config: any;
  render: () => string;
}

export interface MaterialComparisonComponent {
  id: string;
  type: 'material-comparison';
  config: any;
  render: () => string;
}

export interface MaterialSpecViewerComponent {
  id: string;
  type: 'specification-viewer';
  config: any;
  render: () => string;
}

export interface MaterialSearchComponent {
  id: string;
  type: 'material-search';
  config: any;
  render: () => string;
}

// Export the material database integration
export const materialDatabaseIntegration = new MaterialDatabaseIntegration({
  companyLogo: {
    imagePath: '/assets/vibelux-logo.svg',
    position: [10, 10],
    size: [120, 40],
    scalable: true,
    aspectRatio: 3.0,
    format: 'svg',
    colorMode: 'full-color',
    placement: 'primary'
  },
  companyName: 'Vibelux',
  companyAddress: {
    street: '123 Innovation Drive',
    city: 'Tech Valley',
    state: 'CA',
    zipCode: '94000',
    country: 'USA'
  },
  contact: {
    phone: '(555) 123-GROW',
    email: 'info@vibelux.com',
    website: 'www.vibelux.com'
  },
  website: 'www.vibelux.com',
  brandColors: {
    primary: '#00A86B',
    secondary: '#2E8B57',
    accent: '#32CD32',
    neutral: '#708090',
    text: '#2F4F4F'
  },
  typography: {
    primaryFont: 'Arial',
    secondaryFont: 'Helvetica',
    headingFont: 'Arial Black',
    sizes: {
      title: 14,
      heading: 12,
      body: 10,
      caption: 8,
      small: 6
    }
  }
});