/**
 * Code Compliance Annotation System
 * Professional building code compliance checking and annotation system
 * Ensures drawings meet current building codes and standards
 */

export interface CodeStandard {
  id: string;
  name: string;
  version: string;
  authority: string;
  jurisdiction: string;
  adoptionDate: Date;
  effectiveDate: Date;
  type: CodeType;
  scope: string[];
  amendments?: CodeAmendment[];
}

export type CodeType = 
  | 'building'      // IBC, UBC, etc.
  | 'electrical'    // NEC, local electrical codes
  | 'mechanical'    // IMC, ASHRAE
  | 'plumbing'      // IPC, UPC
  | 'energy'        // IECC, ASHRAE 90.1
  | 'fire'          // IFC, NFPA
  | 'accessibility' // ADA, ICC A117.1
  | 'structural'    // ASCE 7, AISC, ACI
  | 'greenhouse'    // NGMA, specialized greenhouse codes
  | 'agricultural'; // State agricultural codes

export interface CodeAmendment {
  section: string;
  description: string;
  effectiveDate: Date;
  jurisdiction: string;
}

export interface CodeRequirement {
  id: string;
  standardId: string;
  section: string;
  subsection?: string;
  title: string;
  description: string;
  requirement: string;
  applicability: ApplicationCriteria;
  exceptions?: string[];
  references?: string[];
  enforcement: EnforcementLevel;
  lastUpdated: Date;
}

export interface ApplicationCriteria {
  buildingType: string[];
  occupancyClass: string[];
  constructionType: string[];
  area?: {
    min?: number;
    max?: number;
    unit: 'sf' | 'sm';
  };
  height?: {
    min?: number;
    max?: number;
    unit: 'ft' | 'm';
  };
  specialConditions?: string[];
}

export type EnforcementLevel = 'mandatory' | 'recommended' | 'optional' | 'local-option';

export interface ComplianceCheck {
  id: string;
  requirementId: string;
  projectElement: string;
  status: ComplianceStatus;
  checkDate: Date;
  checker: string;
  notes?: string;
  evidence?: ComplianceEvidence[];
  waivers?: ComplianceWaiver[];
}

export type ComplianceStatus = 
  | 'compliant'
  | 'non-compliant'
  | 'not-applicable'
  | 'needs-review'
  | 'waiver-requested'
  | 'deferred';

export interface ComplianceEvidence {
  type: 'calculation' | 'specification' | 'drawing' | 'test-report' | 'certification';
  description: string;
  reference: string;
  attachmentPath?: string;
}

export interface ComplianceWaiver {
  section: string;
  reason: string;
  alternativeCompliance: string;
  approvedBy?: string;
  approvalDate?: Date;
  conditions?: string[];
}

export interface ComplianceAnnotation {
  id: string;
  position: [number, number];
  drawingId: string;
  requirementId: string;
  annotationType: AnnotationType;
  text: string;
  symbol?: string;
  leader?: [number, number][];
  calloutNumber?: number;
  status: ComplianceStatus;
  lastUpdated: Date;
}

export type AnnotationType = 
  | 'requirement'
  | 'specification'
  | 'dimension'
  | 'material'
  | 'installation'
  | 'testing'
  | 'inspection'
  | 'certification';

/**
 * Code Compliance Management System
 */
export class CodeComplianceSystem {
  private standards: Map<string, CodeStandard> = new Map();
  private requirements: Map<string, CodeRequirement> = new Map();
  private checks: Map<string, ComplianceCheck> = new Map();
  private annotations: Map<string, ComplianceAnnotation> = new Map();

  constructor() {
    this.initializeStandardCodes();
    this.initializeGreenhouseRequirements();
  }

  private initializeStandardCodes(): void {
    // International Building Code
    this.addStandard({
      id: 'IBC-2021',
      name: 'International Building Code',
      version: '2021',
      authority: 'ICC',
      jurisdiction: 'Model Code',
      adoptionDate: new Date('2021-01-01'),
      effectiveDate: new Date('2021-01-01'),
      type: 'building',
      scope: ['all-buildings', 'greenhouses', 'agricultural']
    });

    // National Electrical Code
    this.addStandard({
      id: 'NEC-2023',
      name: 'National Electrical Code',
      version: '2023',
      authority: 'NFPA',
      jurisdiction: 'Model Code',
      adoptionDate: new Date('2023-01-01'),
      effectiveDate: new Date('2023-01-01'),
      type: 'electrical',
      scope: ['electrical-systems', 'lighting', 'power-distribution']
    });

    // International Mechanical Code
    this.addStandard({
      id: 'IMC-2021',
      name: 'International Mechanical Code',
      version: '2021',
      authority: 'ICC',
      jurisdiction: 'Model Code',
      adoptionDate: new Date('2021-01-01'),
      effectiveDate: new Date('2021-01-01'),
      type: 'mechanical',
      scope: ['hvac-systems', 'ventilation', 'refrigeration']
    });

    // ASCE 7 Structural Loads
    this.addStandard({
      id: 'ASCE7-22',
      name: 'Minimum Design Loads and Associated Criteria for Buildings and Other Structures',
      version: '2022',
      authority: 'ASCE',
      jurisdiction: 'Model Code',
      adoptionDate: new Date('2022-01-01'),
      effectiveDate: new Date('2022-01-01'),
      type: 'structural',
      scope: ['structural-design', 'wind-loads', 'snow-loads', 'seismic']
    });

    // NGMA Greenhouse Standards
    this.addStandard({
      id: 'NGMA-2020',
      name: 'National Greenhouse Manufacturers Association Standards',
      version: '2020',
      authority: 'NGMA',
      jurisdiction: 'Industry Standard',
      adoptionDate: new Date('2020-01-01'),
      effectiveDate: new Date('2020-01-01'),
      type: 'greenhouse',
      scope: ['greenhouse-structures', 'glazing-systems', 'ventilation']
    });
  }

  private initializeGreenhouseRequirements(): void {
    // Structural Requirements
    this.addRequirement({
      id: 'IBC-1607-LIVE',
      standardId: 'IBC-2021',
      section: '1607.13',
      title: 'Equipment Live Loads',
      description: 'Live loads for mechanical and electrical equipment',
      requirement: 'Minimum live load of 25 psf for areas with equipment access. Equipment load shall be actual weight or 25 psf, whichever is greater.',
      applicability: {
        buildingType: ['greenhouse', 'agricultural'],
        occupancyClass: ['A-4', 'U'],
        constructionType: ['all']
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });

    this.addRequirement({
      id: 'ASCE7-WIND',
      standardId: 'ASCE7-22',
      section: '26.2',
      title: 'Wind Load Requirements',
      description: 'Wind loads for low-rise buildings and structures',
      requirement: 'Design wind speeds per Figure 26.5-1A. Basic wind speed multiplied by importance factor for agricultural buildings.',
      applicability: {
        buildingType: ['greenhouse'],
        occupancyClass: ['U'],
        constructionType: ['all'],
        height: { max: 60, unit: 'ft' }
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });

    // Electrical Requirements
    this.addRequirement({
      id: 'NEC-547-AGRICULTURAL',
      standardId: 'NEC-2023',
      section: '547',
      title: 'Agricultural Buildings',
      description: 'Electrical installations in agricultural buildings',
      requirement: 'Equipment grounding conductors shall be insulated copper. Grounding electrode system required per 547.9.',
      applicability: {
        buildingType: ['greenhouse', 'agricultural'],
        occupancyClass: ['U'],
        constructionType: ['all']
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });

    this.addRequirement({
      id: 'NEC-410-LIGHTING',
      standardId: 'NEC-2023',
      section: '410.36',
      title: 'Luminaires in Wet Locations',
      description: 'Installation requirements for wet and damp locations',
      requirement: 'Luminaires installed in wet locations shall be marked "Suitable for Wet Locations" and installed to prevent water accumulation.',
      applicability: {
        buildingType: ['greenhouse'],
        occupancyClass: ['all'],
        constructionType: ['all'],
        specialConditions: ['high-humidity', 'irrigation-systems']
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });

    // Mechanical Requirements
    this.addRequirement({
      id: 'IMC-403-VENTILATION',
      standardId: 'IMC-2021',
      section: '403',
      title: 'Natural Ventilation',
      description: 'Requirements for natural ventilation systems',
      requirement: 'Natural ventilation openings shall have aggregate area not less than 4% of floor area. Openings shall be distributed to provide cross-ventilation.',
      applicability: {
        buildingType: ['greenhouse'],
        occupancyClass: ['U'],
        constructionType: ['all']
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });

    // Greenhouse-Specific Requirements
    this.addRequirement({
      id: 'NGMA-GLAZING',
      standardId: 'NGMA-2020',
      section: '3.1',
      title: 'Glazing Material Requirements',
      description: 'Safety glazing requirements for greenhouse structures',
      requirement: 'All glazing within 60 inches of floor level shall be safety glazing per ANSI Z97.1. Tempered glass minimum 3mm thickness.',
      applicability: {
        buildingType: ['greenhouse'],
        occupancyClass: ['all'],
        constructionType: ['all']
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });

    this.addRequirement({
      id: 'NGMA-STRUCTURE',
      standardId: 'NGMA-2020',
      section: '2.3',
      title: 'Structural Design Criteria',
      description: 'Design loads and factors for greenhouse structures',
      requirement: 'Structural design shall consider combined loads including dead, live, wind, snow, and seismic. Importance factor of 0.87 for agricultural buildings.',
      applicability: {
        buildingType: ['greenhouse'],
        occupancyClass: ['U'],
        constructionType: ['all']
      },
      enforcement: 'mandatory',
      lastUpdated: new Date()
    });
  }

  public addStandard(standard: CodeStandard): void {
    this.standards.set(standard.id, standard);
  }

  public addRequirement(requirement: CodeRequirement): void {
    this.requirements.set(requirement.id, requirement);
  }

  public addComplianceCheck(check: ComplianceCheck): void {
    this.checks.set(check.id, check);
  }

  public addAnnotation(annotation: ComplianceAnnotation): void {
    this.annotations.set(annotation.id, annotation);
  }

  /**
   * Check project compliance against applicable codes
   */
  public checkProjectCompliance(projectData: any): ComplianceReport {
    const applicableRequirements = this.getApplicableRequirements(projectData);
    const checks: ComplianceCheck[] = [];
    let compliantCount = 0;
    let nonCompliantCount = 0;
    let needsReviewCount = 0;

    for (const requirement of applicableRequirements) {
      const check = this.performComplianceCheck(requirement, projectData);
      checks.push(check);

      switch (check.status) {
        case 'compliant':
          compliantCount++;
          break;
        case 'non-compliant':
          nonCompliantCount++;
          break;
        case 'needs-review':
          needsReviewCount++;
          break;
      }
    }

    return {
      projectId: projectData.id,
      checkDate: new Date(),
      totalRequirements: applicableRequirements.length,
      compliantCount,
      nonCompliantCount,
      needsReviewCount,
      overallStatus: nonCompliantCount > 0 ? 'non-compliant' : 
                    needsReviewCount > 0 ? 'needs-review' : 'compliant',
      checks,
      summary: this.generateComplianceSummary(checks)
    };
  }

  private getApplicableRequirements(projectData: any): CodeRequirement[] {
    return Array.from(this.requirements.values()).filter(req => {
      const criteria = req.applicability;
      
      // Check building type
      if (!criteria.buildingType.includes(projectData.buildingType)) {
        return false;
      }

      // Check occupancy class
      if (!criteria.occupancyClass.includes('all') && 
          !criteria.occupancyClass.includes(projectData.occupancyClass)) {
        return false;
      }

      // Check area constraints
      if (criteria.area) {
        const projectArea = projectData.area;
        if (criteria.area.min && projectArea < criteria.area.min) return false;
        if (criteria.area.max && projectArea > criteria.area.max) return false;
      }

      // Check height constraints
      if (criteria.height) {
        const projectHeight = projectData.height;
        if (criteria.height.min && projectHeight < criteria.height.min) return false;
        if (criteria.height.max && projectHeight > criteria.height.max) return false;
      }

      return true;
    });
  }

  private performComplianceCheck(requirement: CodeRequirement, projectData: any): ComplianceCheck {
    // Automated compliance checking logic
    let status: ComplianceStatus = 'needs-review'; // Default to manual review

    // Specific automated checks based on requirement ID
    switch (requirement.id) {
      case 'IBC-1607-LIVE':
        status = this.checkLiveLoads(projectData) ? 'compliant' : 'non-compliant';
        break;
      case 'NEC-410-LIGHTING':
        status = this.checkLightingInstallation(projectData) ? 'compliant' : 'non-compliant';
        break;
      case 'IMC-403-VENTILATION':
        status = this.checkVentilationRequirements(projectData) ? 'compliant' : 'non-compliant';
        break;
      // Add more automated checks as needed
    }

    return {
      id: `check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requirementId: requirement.id,
      projectElement: this.getProjectElement(requirement, projectData),
      status,
      checkDate: new Date(),
      checker: 'Vibelux Automated Compliance System',
      notes: this.generateCheckNotes(requirement, projectData, status)
    };
  }

  private checkLiveLoads(projectData: any): boolean {
    // Check if equipment live loads are adequate
    const equipmentAreas = projectData.equipmentAreas || [];
    return equipmentAreas.every((area: any) => area.liveLoad >= 25);
  }

  private checkLightingInstallation(projectData: any): boolean {
    // Check if lighting fixtures are rated for wet locations
    const lightingFixtures = projectData.lighting?.fixtures || [];
    return lightingFixtures.every((fixture: any) => 
      fixture.wetLocationRated === true || projectData.environment !== 'high-humidity'
    );
  }

  private checkVentilationRequirements(projectData: any): boolean {
    // Check ventilation opening area
    const floorArea = projectData.area || 0;
    const ventilationArea = projectData.ventilation?.openingArea || 0;
    const requiredArea = floorArea * 0.04; // 4% of floor area
    return ventilationArea >= requiredArea;
  }

  private getProjectElement(requirement: CodeRequirement, projectData: any): string {
    // Map requirement to specific project element
    if (requirement.section.includes('1607')) return 'Structural System';
    if (requirement.section.includes('410')) return 'Lighting System';
    if (requirement.section.includes('403')) return 'Ventilation System';
    if (requirement.section.includes('547')) return 'Electrical System';
    return 'General';
  }

  private generateCheckNotes(requirement: CodeRequirement, projectData: any, status: ComplianceStatus): string {
    switch (status) {
      case 'compliant':
        return `Project meets requirements of ${requirement.standardId} Section ${requirement.section}`;
      case 'non-compliant':
        return `Project does not meet requirements of ${requirement.standardId} Section ${requirement.section}. Review and revise design.`;
      case 'needs-review':
        return `Manual review required for ${requirement.standardId} Section ${requirement.section}. Verify compliance with design documents.`;
      default:
        return 'Status to be determined';
    }
  }

  private generateComplianceSummary(checks: ComplianceCheck[]): ComplianceSummary {
    const categoryResults: Record<string, { total: number; compliant: number; nonCompliant: number }> = {};
    
    for (const check of checks) {
      const requirement = this.requirements.get(check.requirementId);
      if (!requirement) continue;
      
      const standard = this.standards.get(requirement.standardId);
      if (!standard) continue;
      
      const category = standard.type;
      if (!categoryResults[category]) {
        categoryResults[category] = { total: 0, compliant: 0, nonCompliant: 0 };
      }
      
      categoryResults[category].total++;
      if (check.status === 'compliant') {
        categoryResults[category].compliant++;
      } else if (check.status === 'non-compliant') {
        categoryResults[category].nonCompliant++;
      }
    }

    return {
      byCategory: categoryResults,
      criticalIssues: checks.filter(c => c.status === 'non-compliant').length,
      reviewItems: checks.filter(c => c.status === 'needs-review').length,
      overallScore: Math.round((checks.filter(c => c.status === 'compliant').length / checks.length) * 100)
    };
  }

  /**
   * Generate code compliance annotations for drawings
   */
  public generateComplianceAnnotations(drawingId: string, complianceReport: ComplianceReport): ComplianceAnnotation[] {
    const annotations: ComplianceAnnotation[] = [];
    let calloutNumber = 1;

    for (const check of complianceReport.checks) {
      if (check.status === 'non-compliant' || check.status === 'needs-review') {
        const requirement = this.requirements.get(check.requirementId);
        if (!requirement) continue;

        const annotation: ComplianceAnnotation = {
          id: `annotation-${Date.now()}-${calloutNumber}`,
          position: this.getAnnotationPosition(drawingId, check.projectElement),
          drawingId,
          requirementId: check.requirementId,
          annotationType: 'requirement',
          text: this.formatAnnotationText(requirement, check),
          calloutNumber: calloutNumber++,
          status: check.status,
          lastUpdated: new Date()
        };

        annotations.push(annotation);
      }
    }

    return annotations;
  }

  private getAnnotationPosition(drawingId: string, projectElement: string): [number, number] {
    // Logic to determine annotation position based on drawing type and element
    // This would integrate with the drawing system to place annotations appropriately
    
    // Placeholder positioning logic
    const positions: Record<string, [number, number]> = {
      'Structural System': [100, 50],
      'Lighting System': [200, 100],
      'Ventilation System': [300, 150],
      'Electrical System': [150, 200],
      'General': [250, 250]
    };

    return positions[projectElement] || [50, 50];
  }

  private formatAnnotationText(requirement: CodeRequirement, check: ComplianceCheck): string {
    const standard = this.standards.get(requirement.standardId);
    const standardName = standard ? standard.name : requirement.standardId;
    
    return `${standardName}\nSection ${requirement.section}\n${requirement.title}\n\nStatus: ${check.status.toUpperCase()}\n${check.notes || ''}`;
  }

  /**
   * Export compliance report
   */
  public exportComplianceReport(report: ComplianceReport, format: 'json' | 'pdf' | 'excel' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'pdf':
        return this.generatePDFReport(report);
      case 'excel':
        return this.generateExcelReport(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private generatePDFReport(report: ComplianceReport): string {
    // PDF generation logic would go here
    return `PDF report for project ${report.projectId}`;
  }

  private generateExcelReport(report: ComplianceReport): string {
    // Excel generation logic would go here
    return `Excel report for project ${report.projectId}`;
  }

  // Getter methods
  public getStandard(id: string): CodeStandard | undefined {
    return this.standards.get(id);
  }

  public getRequirement(id: string): CodeRequirement | undefined {
    return this.requirements.get(id);
  }

  public getAllStandards(): CodeStandard[] {
    return Array.from(this.standards.values());
  }

  public getAllRequirements(): CodeRequirement[] {
    return Array.from(this.requirements.values());
  }

  public getRequirementsByStandard(standardId: string): CodeRequirement[] {
    return Array.from(this.requirements.values()).filter(req => req.standardId === standardId);
  }
}

export interface ComplianceReport {
  projectId: string;
  checkDate: Date;
  totalRequirements: number;
  compliantCount: number;
  nonCompliantCount: number;
  needsReviewCount: number;
  overallStatus: 'compliant' | 'non-compliant' | 'needs-review';
  checks: ComplianceCheck[];
  summary: ComplianceSummary;
}

export interface ComplianceSummary {
  byCategory: Record<string, { total: number; compliant: number; nonCompliant: number }>;
  criticalIssues: number;
  reviewItems: number;
  overallScore: number;
}

// Export singleton instance
export const codeComplianceSystem = new CodeComplianceSystem();