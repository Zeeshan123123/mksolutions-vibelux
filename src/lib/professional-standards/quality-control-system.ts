/**
 * Professional Quality Control Standards System
 * Comprehensive QC system for ensuring professional drawing quality,
 * accuracy, and compliance with industry standards
 */

export interface QualityStandard {
  id: string;
  name: string;
  category: QualityCategory;
  description: string;
  criteria: QualityCriterion[];
  checkpoints: QualityCheckpoint[];
  tolerance: ToleranceSpecification;
  enforcement: EnforcementLevel;
  applicability: QualityApplicability;
  lastUpdated: Date;
}

export type QualityCategory = 
  | 'drawing-standards'
  | 'dimensional-accuracy'
  | 'code-compliance'
  | 'material-specifications'
  | 'construction-details'
  | 'annotation-standards'
  | 'title-block-standards'
  | 'line-weight-standards'
  | 'symbol-standards'
  | 'text-standards'
  | 'layer-standards'
  | 'file-standards';

export interface QualityCriterion {
  id: string;
  description: string;
  requirement: string;
  measurement: MeasurementMethod;
  acceptance: AcceptanceCriteria;
  severity: 'critical' | 'major' | 'minor' | 'informational';
}

export interface QualityCheckpoint {
  phase: 'design' | 'development' | 'review' | 'approval' | 'release';
  required: boolean;
  automated: boolean;
  checker: string; // role or system
  duration: string;
  deliverables: string[];
}

export interface ToleranceSpecification {
  dimensional: DimensionalTolerance;
  angular: AngularTolerance;
  positional: PositionalTolerance;
  textual: TextualTolerance;
}

export interface DimensionalTolerance {
  precision: number; // decimal places
  unitAccuracy: string; // ±1/16", ±1mm, etc.
  scalingAccuracy: number; // percentage
  coordinateAccuracy: number; // decimal places
}

export interface AngularTolerance {
  precision: number; // decimal places
  accuracy: string; // ±0.5°, etc.
}

export interface PositionalTolerance {
  placement: string; // ±1/8", ±2mm, etc.
  alignment: string; // ±1/16", ±1mm, etc.
}

export interface TextualTolerance {
  spelling: 'required' | 'checked' | 'none';
  grammar: 'required' | 'checked' | 'none';
  terminology: 'standard' | 'project-specific';
  abbreviations: 'standard' | 'approved-list';
}

export type EnforcementLevel = 'mandatory' | 'recommended' | 'optional' | 'project-specific';

export interface QualityApplicability {
  projectTypes: string[];
  drawingTypes: string[];
  phases: string[];
  exceptions?: string[];
}

export interface MeasurementMethod {
  type: 'automated' | 'manual' | 'calculation' | 'inspection';
  tool?: string;
  procedure: string;
  frequency: string;
  sample?: string; // percentage or count
}

export interface AcceptanceCriteria {
  target: string | number;
  minimum?: string | number;
  maximum?: string | number;
  unit?: string;
  condition?: string;
}

export interface QualityCheck {
  id: string;
  standardId: string;
  criterionId: string;
  projectId: string;
  drawingId?: string;
  elementId?: string;
  checkDate: Date;
  checker: string;
  method: 'automated' | 'manual';
  result: QualityResult;
  evidence?: QualityEvidence[];
  correctionRequired: boolean;
  correctionDeadline?: Date;
  followUpRequired: boolean;
  comments?: string;
}

export interface QualityResult {
  status: 'pass' | 'fail' | 'conditional' | 'needs-review';
  value?: string | number;
  deviation?: string | number;
  severity: 'critical' | 'major' | 'minor' | 'informational';
  confidence: number; // 0-100%
}

export interface QualityEvidence {
  type: 'screenshot' | 'measurement' | 'calculation' | 'report' | 'approval';
  description: string;
  reference: string;
  attachmentPath?: string;
  timestamp: Date;
}

export interface QualityMetrics {
  projectId: string;
  reportDate: Date;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  conditionalChecks: number;
  qualityScore: number; // 0-100%
  categoryScores: Record<QualityCategory, number>;
  trendData: QualityTrend[];
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
}

export interface QualityTrend {
  date: Date;
  qualityScore: number;
  category: QualityCategory;
  checkCount: number;
}

export interface QualityIssue {
  id: string;
  category: QualityCategory;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  frequency: number;
  impact: string;
  recommendation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'deferred';
}

export interface QualityRecommendation {
  category: QualityCategory;
  priority: 'high' | 'medium' | 'low';
  action: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface QualityReview {
  id: string;
  projectId: string;
  reviewType: 'design-review' | 'code-review' | 'quality-review' | 'final-review';
  reviewer: ReviewerInfo;
  reviewDate: Date;
  drawings: string[]; // drawing IDs
  checklist: ReviewChecklist;
  findings: ReviewFinding[];
  overallStatus: 'approved' | 'approved-with-comments' | 'revise-and-resubmit' | 'rejected';
  nextSteps: string[];
  dueDate?: Date;
}

export interface ReviewerInfo {
  name: string;
  role: string;
  qualifications: string[];
  licenseNumber?: string;
  certifications?: string[];
  experience: string;
}

export interface ReviewChecklist {
  categories: ReviewCategory[];
  completionRequired: number; // percentage
  overrideAllowed: boolean;
}

export interface ReviewCategory {
  name: string;
  items: ReviewItem[];
  weight: number; // for scoring
  required: boolean;
}

export interface ReviewItem {
  id: string;
  description: string;
  status: 'pass' | 'fail' | 'n/a' | 'pending';
  comments?: string;
  references?: string[];
  severity?: 'critical' | 'major' | 'minor';
}

export interface ReviewFinding {
  id: string;
  category: string;
  description: string;
  location: string; // drawing reference
  severity: 'critical' | 'major' | 'minor' | 'observation';
  requirement: string;
  recommendation: string;
  status: 'open' | 'resolved' | 'deferred';
  dueDate?: Date;
}

/**
 * Professional Quality Control Management System
 */
export class QualityControlSystem {
  private standards: Map<string, QualityStandard> = new Map();
  private checks: Map<string, QualityCheck> = new Map();
  private reviews: Map<string, QualityReview> = new Map();
  private metrics: Map<string, QualityMetrics> = new Map();

  constructor() {
    this.initializeQualityStandards();
  }

  private initializeQualityStandards(): void {
    // Drawing Standards
    this.addStandard(this.createDrawingStandard());
    this.addStandard(this.createDimensionalAccuracyStandard());
    this.addStandard(this.createAnnotationStandard());
    this.addStandard(this.createTitleBlockStandard());
    this.addStandard(this.createLineWeightStandard());
    this.addStandard(this.createSymbolStandard());
    
    // Compliance Standards
    this.addStandard(this.createCodeComplianceStandard());
    this.addStandard(this.createMaterialSpecificationStandard());
    this.addStandard(this.createConstructionDetailStandard());
  }

  private createDrawingStandard(): QualityStandard {
    return {
      id: 'QS-DWG-001',
      name: 'Professional Drawing Standards',
      category: 'drawing-standards',
      description: 'Comprehensive standards for professional drawing quality and presentation',
      criteria: [
        {
          id: 'DWG-001-01',
          description: 'Drawing completeness',
          requirement: 'All required views, details, and schedules present',
          measurement: {
            type: 'manual',
            procedure: 'Visual inspection against drawing checklist',
            frequency: 'Per drawing'
          },
          acceptance: {
            target: '100% complete',
            minimum: '95% complete'
          },
          severity: 'critical'
        },
        {
          id: 'DWG-001-02',
          description: 'Drawing clarity',
          requirement: 'All elements clearly visible and legible at plot scale',
          measurement: {
            type: 'inspection',
            procedure: 'Plot test at required scale',
            frequency: 'Sample basis'
          },
          acceptance: {
            target: 'All text legible',
            condition: 'At minimum plot scale'
          },
          severity: 'major'
        },
        {
          id: 'DWG-001-03',
          description: 'Drawing coordination',
          requirement: 'Information consistent across all drawings',
          measurement: {
            type: 'automated',
            tool: 'Drawing comparison software',
            procedure: 'Cross-reference check',
            frequency: 'Per drawing set'
          },
          acceptance: {
            target: '100% consistent',
            minimum: '98% consistent'
          },
          severity: 'critical'
        }
      ],
      checkpoints: [
        {
          phase: 'design',
          required: true,
          automated: false,
          checker: 'Design Team Lead',
          duration: '2 hours',
          deliverables: ['Design review checklist']
        },
        {
          phase: 'review',
          required: true,
          automated: true,
          checker: 'QC System',
          duration: '30 minutes',
          deliverables: ['Automated QC report']
        },
        {
          phase: 'approval',
          required: true,
          automated: false,
          checker: 'Licensed Professional',
          duration: '4 hours',
          deliverables: ['Professional review report', 'Stamped drawings']
        }
      ],
      tolerance: {
        dimensional: {
          precision: 2,
          unitAccuracy: '±1/16"',
          scalingAccuracy: 0.5,
          coordinateAccuracy: 3
        },
        angular: {
          precision: 1,
          accuracy: '±0.5°'
        },
        positional: {
          placement: '±1/8"',
          alignment: '±1/16"'
        },
        textual: {
          spelling: 'required',
          grammar: 'checked',
          terminology: 'standard',
          abbreviations: 'standard'
        }
      },
      enforcement: 'mandatory',
      applicability: {
        projectTypes: ['all'],
        drawingTypes: ['all'],
        phases: ['design', 'development', 'construction']
      },
      lastUpdated: new Date()
    };
  }

  private createDimensionalAccuracyStandard(): QualityStandard {
    return {
      id: 'QS-DIM-001',
      name: 'Dimensional Accuracy Standards',
      category: 'dimensional-accuracy',
      description: 'Standards for dimensional accuracy, scaling, and geometric precision',
      criteria: [
        {
          id: 'DIM-001-01',
          description: 'Dimensional precision',
          requirement: 'All dimensions accurate to specified tolerance',
          measurement: {
            type: 'automated',
            tool: 'CAD measurement tools',
            procedure: 'Automated dimension checking',
            frequency: 'Per drawing'
          },
          acceptance: {
            target: '±1/16"',
            condition: 'For architectural dimensions'
          },
          severity: 'critical'
        },
        {
          id: 'DIM-001-02',
          description: 'Scale accuracy',
          requirement: 'Drawing scale consistent and accurate',
          measurement: {
            type: 'calculation',
            procedure: 'Scale verification calculation',
            frequency: 'Per drawing'
          },
          acceptance: {
            target: '±0.1%',
            condition: 'Scale deviation'
          },
          severity: 'major'
        },
        {
          id: 'DIM-001-03',
          description: 'Geometric accuracy',
          requirement: 'Geometric relationships accurate (parallel, perpendicular, etc.)',
          measurement: {
            type: 'automated',
            tool: 'Geometric analysis software',
            procedure: 'Automated geometric checking',
            frequency: 'Per drawing'
          },
          acceptance: {
            target: '±0.5°',
            condition: 'Angular tolerance'
          },
          severity: 'major'
        }
      ],
      checkpoints: [
        {
          phase: 'development',
          required: true,
          automated: true,
          checker: 'CAD System',
          duration: '15 minutes',
          deliverables: ['Dimension accuracy report']
        }
      ],
      tolerance: {
        dimensional: {
          precision: 3,
          unitAccuracy: '±1/32"',
          scalingAccuracy: 0.1,
          coordinateAccuracy: 4
        },
        angular: {
          precision: 1,
          accuracy: '±0.5°'
        },
        positional: {
          placement: '±1/16"',
          alignment: '±1/32"'
        },
        textual: {
          spelling: 'none',
          grammar: 'none',
          terminology: 'standard',
          abbreviations: 'standard'
        }
      },
      enforcement: 'mandatory',
      applicability: {
        projectTypes: ['all'],
        drawingTypes: ['plans', 'elevations', 'sections', 'details'],
        phases: ['development', 'construction']
      },
      lastUpdated: new Date()
    };
  }

  private createCodeComplianceStandard(): QualityStandard {
    return {
      id: 'QS-CODE-001',
      name: 'Code Compliance Standards',
      category: 'code-compliance',
      description: 'Standards for building code compliance verification and documentation',
      criteria: [
        {
          id: 'CODE-001-01',
          description: 'Code compliance verification',
          requirement: 'All applicable codes identified and compliance verified',
          measurement: {
            type: 'manual',
            procedure: 'Code compliance checklist review',
            frequency: 'Per project phase'
          },
          acceptance: {
            target: '100% compliance',
            condition: 'All applicable codes'
          },
          severity: 'critical'
        },
        {
          id: 'CODE-001-02',
          description: 'Code annotation completeness',
          requirement: 'All code requirements properly annotated on drawings',
          measurement: {
            type: 'inspection',
            procedure: 'Drawing annotation review',
            frequency: 'Per drawing'
          },
          acceptance: {
            target: '100% annotated',
            condition: 'All applicable requirements'
          },
          severity: 'major'
        }
      ],
      checkpoints: [
        {
          phase: 'design',
          required: true,
          automated: false,
          checker: 'Code Specialist',
          duration: '4 hours',
          deliverables: ['Code compliance matrix']
        },
        {
          phase: 'review',
          required: true,
          automated: true,
          checker: 'Code Compliance System',
          duration: '1 hour',
          deliverables: ['Automated compliance report']
        }
      ],
      tolerance: {
        dimensional: {
          precision: 1,
          unitAccuracy: '±1/4"',
          scalingAccuracy: 1.0,
          coordinateAccuracy: 2
        },
        angular: {
          precision: 0,
          accuracy: '±1°'
        },
        positional: {
          placement: '±1/4"',
          alignment: '±1/8"'
        },
        textual: {
          spelling: 'required',
          grammar: 'required',
          terminology: 'standard',
          abbreviations: 'approved-list'
        }
      },
      enforcement: 'mandatory',
      applicability: {
        projectTypes: ['all'],
        drawingTypes: ['all'],
        phases: ['design', 'development', 'approval']
      },
      lastUpdated: new Date()
    };
  }

  // Additional standard creation methods...
  private createAnnotationStandard(): QualityStandard { /* Implementation */ return {} as QualityStandard; }
  private createTitleBlockStandard(): QualityStandard { /* Implementation */ return {} as QualityStandard; }
  private createLineWeightStandard(): QualityStandard { /* Implementation */ return {} as QualityStandard; }
  private createSymbolStandard(): QualityStandard { /* Implementation */ return {} as QualityStandard; }
  private createMaterialSpecificationStandard(): QualityStandard { /* Implementation */ return {} as QualityStandard; }
  private createConstructionDetailStandard(): QualityStandard { /* Implementation */ return {} as QualityStandard; }

  public addStandard(standard: QualityStandard): void {
    this.standards.set(standard.id, standard);
  }

  public addCheck(check: QualityCheck): void {
    this.checks.set(check.id, check);
  }

  public addReview(review: QualityReview): void {
    this.reviews.set(review.id, review);
  }

  /**
   * Perform automated quality control checks
   */
  public performQualityCheck(projectData: any): QualityCheckReport {
    const applicableStandards = this.getApplicableStandards(projectData);
    const checks: QualityCheck[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let conditionalChecks = 0;

    for (const standard of applicableStandards) {
      for (const criterion of standard.criteria) {
        const check = this.executeQualityCheck(standard, criterion, projectData);
        checks.push(check);
        totalChecks++;

        switch (check.result.status) {
          case 'pass':
            passedChecks++;
            break;
          case 'fail':
            failedChecks++;
            break;
          case 'conditional':
            conditionalChecks++;
            break;
        }
      }
    }

    const qualityScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    return {
      projectId: projectData.id,
      checkDate: new Date(),
      totalChecks,
      passedChecks,
      failedChecks,
      conditionalChecks,
      qualityScore,
      checks,
      recommendations: this.generateQualityRecommendations(checks),
      nextSteps: this.generateNextSteps(checks, qualityScore)
    };
  }

  private getApplicableStandards(projectData: any): QualityStandard[] {
    return Array.from(this.standards.values()).filter(standard => {
      return standard.applicability.projectTypes.includes('all') ||
             standard.applicability.projectTypes.includes(projectData.type);
    });
  }

  private executeQualityCheck(standard: QualityStandard, criterion: QualityCriterion, projectData: any): QualityCheck {
    let result: QualityResult = {
      status: 'needs-review',
      severity: criterion.severity,
      confidence: 50
    };

    // Implement specific check logic based on criterion type
    switch (criterion.measurement.type) {
      case 'automated':
        result = this.performAutomatedCheck(criterion, projectData);
        break;
      case 'calculation':
        result = this.performCalculationCheck(criterion, projectData);
        break;
      default:
        result = {
          status: 'needs-review',
          severity: criterion.severity,
          confidence: 0
        };
    }

    return {
      id: `qc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      standardId: standard.id,
      criterionId: criterion.id,
      projectId: projectData.id,
      checkDate: new Date(),
      checker: 'Vibelux QC System',
      method: criterion.measurement.type === 'automated' ? 'automated' : 'manual',
      result,
      correctionRequired: result.status === 'fail' || (result.status === 'conditional' && result.severity === 'critical'),
      followUpRequired: result.status !== 'pass'
    };
  }

  private performAutomatedCheck(criterion: QualityCriterion, projectData: any): QualityResult {
    // Implement automated checking logic
    // This would integrate with CAD systems, databases, etc.
    
    switch (criterion.id) {
      case 'DWG-001-03': // Drawing coordination
        return this.checkDrawingCoordination(projectData);
      case 'DIM-001-01': // Dimensional precision
        return this.checkDimensionalPrecision(projectData);
      case 'DIM-001-02': // Scale accuracy
        return this.checkScaleAccuracy(projectData);
      default:
        return {
          status: 'needs-review',
          severity: criterion.severity,
          confidence: 0
        };
    }
  }

  private performCalculationCheck(criterion: QualityCriterion, projectData: any): QualityResult {
    // Implement calculation-based checking logic
    switch (criterion.id) {
      case 'DIM-001-02': // Scale accuracy
        return this.calculateScaleAccuracy(projectData);
      default:
        return {
          status: 'needs-review',
          severity: criterion.severity,
          confidence: 0
        };
    }
  }

  private checkDrawingCoordination(projectData: any): QualityResult {
    // Simplified coordination check
    const coordinationErrors = projectData.coordinationErrors || 0;
    const totalElements = projectData.totalElements || 1;
    const errorRate = coordinationErrors / totalElements;
    
    if (errorRate === 0) {
      return { status: 'pass', severity: 'informational', confidence: 95 };
    } else if (errorRate <= 0.02) {
      return { status: 'conditional', severity: 'minor', confidence: 85, deviation: errorRate };
    } else {
      return { status: 'fail', severity: 'critical', confidence: 90, deviation: errorRate };
    }
  }

  private checkDimensionalPrecision(projectData: any): QualityResult {
    // Simplified dimensional precision check
    const dimensionalErrors = projectData.dimensionalErrors || 0;
    const totalDimensions = projectData.totalDimensions || 1;
    const errorRate = dimensionalErrors / totalDimensions;
    
    if (errorRate === 0) {
      return { status: 'pass', severity: 'informational', confidence: 95 };
    } else if (errorRate <= 0.01) {
      return { status: 'conditional', severity: 'minor', confidence: 85 };
    } else {
      return { status: 'fail', severity: 'major', confidence: 90 };
    }
  }

  private checkScaleAccuracy(projectData: any): QualityResult {
    // Simplified scale accuracy check
    const scaleDeviation = Math.abs(projectData.scaleDeviation || 0);
    
    if (scaleDeviation <= 0.001) {
      return { status: 'pass', severity: 'informational', confidence: 95, value: scaleDeviation };
    } else if (scaleDeviation <= 0.005) {
      return { status: 'conditional', severity: 'minor', confidence: 85, deviation: scaleDeviation };
    } else {
      return { status: 'fail', severity: 'major', confidence: 90, deviation: scaleDeviation };
    }
  }

  private calculateScaleAccuracy(projectData: any): QualityResult {
    // Calculate scale accuracy based on known dimensions
    const nominalScale = projectData.nominalScale || 1;
    const actualScale = projectData.actualScale || 1;
    const deviation = Math.abs((actualScale - nominalScale) / nominalScale);
    
    return this.checkScaleAccuracy({ scaleDeviation: deviation });
  }

  private generateQualityRecommendations(checks: QualityCheck[]): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];
    
    // Analyze failed checks for patterns
    const failedChecks = checks.filter(c => c.result.status === 'fail');
    const categoryFailures: Record<string, number> = {};
    
    for (const check of failedChecks) {
      const standard = this.standards.get(check.standardId);
      if (standard) {
        categoryFailures[standard.category] = (categoryFailures[standard.category] || 0) + 1;
      }
    }
    
    // Generate recommendations based on failure patterns
    for (const [category, count] of Object.entries(categoryFailures)) {
      if (count >= 3) {
        recommendations.push({
          category: category as QualityCategory,
          priority: 'high',
          action: `Review and improve ${category.replace('-', ' ')} procedures`,
          benefit: 'Reduce quality defects and improve drawing standards',
          effort: 'medium',
          timeline: '2-4 weeks'
        });
      }
    }
    
    return recommendations;
  }

  private generateNextSteps(checks: QualityCheck[], qualityScore: number): string[] {
    const nextSteps: string[] = [];
    
    if (qualityScore < 70) {
      nextSteps.push('Address critical quality issues before proceeding');
      nextSteps.push('Conduct thorough quality review with project team');
    } else if (qualityScore < 90) {
      nextSteps.push('Review and resolve identified quality issues');
      nextSteps.push('Consider additional quality checks for improvement');
    } else {
      nextSteps.push('Quality standards met - proceed with next phase');
      nextSteps.push('Continue monitoring quality metrics');
    }
    
    const criticalIssues = checks.filter(c => 
      c.result.status === 'fail' && c.result.severity === 'critical'
    ).length;
    
    if (criticalIssues > 0) {
      nextSteps.unshift(`Immediately address ${criticalIssues} critical quality issues`);
    }
    
    return nextSteps;
  }

  /**
   * Generate quality metrics and trends
   */
  public generateQualityMetrics(projectId: string, timeframe: 'week' | 'month' | 'quarter' = 'month'): QualityMetrics {
    const projectChecks = Array.from(this.checks.values()).filter(c => c.projectId === projectId);
    
    const totalChecks = projectChecks.length;
    const passedChecks = projectChecks.filter(c => c.result.status === 'pass').length;
    const failedChecks = projectChecks.filter(c => c.result.status === 'fail').length;
    const conditionalChecks = projectChecks.filter(c => c.result.status === 'conditional').length;
    
    const qualityScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    
    // Calculate category scores
    const categoryScores: Record<QualityCategory, number> = {} as Record<QualityCategory, number>;
    const categories = Array.from(new Set(projectChecks.map(c => {
      const standard = this.standards.get(c.standardId);
      return standard ? standard.category : 'unknown';
    }))) as QualityCategory[];
    
    for (const category of categories) {
      const categoryChecks = projectChecks.filter(c => {
        const standard = this.standards.get(c.standardId);
        return standard && standard.category === category;
      });
      
      const categoryPassed = categoryChecks.filter(c => c.result.status === 'pass').length;
      categoryScores[category] = categoryChecks.length > 0 ? 
        Math.round((categoryPassed / categoryChecks.length) * 100) : 0;
    }
    
    return {
      projectId,
      reportDate: new Date(),
      totalChecks,
      passedChecks,
      failedChecks,
      conditionalChecks,
      qualityScore,
      categoryScores,
      trendData: this.generateTrendData(projectId, timeframe),
      issues: this.generateQualityIssues(projectChecks),
      recommendations: this.generateQualityRecommendations(projectChecks)
    };
  }

  private generateTrendData(projectId: string, timeframe: string): QualityTrend[] {
    // Implementation would analyze historical quality data
    // This is a simplified version
    return [];
  }

  private generateQualityIssues(checks: QualityCheck[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const failedChecks = checks.filter(c => c.result.status === 'fail');
    
    // Group by category and severity
    const issueGroups: Record<string, QualityCheck[]> = {};
    
    for (const check of failedChecks) {
      const standard = this.standards.get(check.standardId);
      if (standard) {
        const key = `${standard.category}-${check.result.severity}`;
        if (!issueGroups[key]) {
          issueGroups[key] = [];
        }
        issueGroups[key].push(check);
      }
    }
    
    for (const [key, groupChecks] of Object.entries(issueGroups)) {
      const [category, severity] = key.split('-');
      issues.push({
        id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        category: category as QualityCategory,
        description: `${groupChecks.length} ${severity} issues in ${category.replace('-', ' ')}`,
        severity: severity as 'critical' | 'major' | 'minor',
        frequency: groupChecks.length,
        impact: this.calculateIssueImpact(groupChecks),
        recommendation: this.generateIssueRecommendation(category, severity, groupChecks.length),
        status: 'open'
      });
    }
    
    return issues;
  }

  private calculateIssueImpact(checks: QualityCheck[]): string {
    const criticalCount = checks.filter(c => c.result.severity === 'critical').length;
    const majorCount = checks.filter(c => c.result.severity === 'major').length;
    
    if (criticalCount > 0) {
      return `High impact: ${criticalCount} critical issues may block project approval`;
    } else if (majorCount > 2) {
      return `Medium impact: ${majorCount} major issues may delay project`;
    } else {
      return 'Low impact: Minor issues for improvement';
    }
  }

  private generateIssueRecommendation(category: string, severity: string, count: number): string {
    if (severity === 'critical') {
      return `Immediately review and correct all ${category} issues before proceeding`;
    } else if (count > 3) {
      return `Systematic review of ${category} procedures recommended`;
    } else {
      return `Address individual ${category} issues in next revision`;
    }
  }

  /**
   * Export quality report
   */
  public exportQualityReport(metrics: QualityMetrics, format: 'pdf' | 'excel' | 'json' = 'pdf'): string {
    switch (format) {
      case 'pdf':
        return this.generatePDFQualityReport(metrics);
      case 'excel':
        return this.generateExcelQualityReport(metrics);
      case 'json':
        return JSON.stringify(metrics, null, 2);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generatePDFQualityReport(metrics: QualityMetrics): string {
    // PDF generation implementation
    return `PDF quality report for project ${metrics.projectId}`;
  }

  private generateExcelQualityReport(metrics: QualityMetrics): string {
    // Excel generation implementation
    return `Excel quality report for project ${metrics.projectId}`;
  }

  // Getter methods
  public getStandard(id: string): QualityStandard | undefined {
    return this.standards.get(id);
  }

  public getAllStandards(): QualityStandard[] {
    return Array.from(this.standards.values());
  }

  public getStandardsByCategory(category: QualityCategory): QualityStandard[] {
    return Array.from(this.standards.values()).filter(s => s.category === category);
  }

  public getCheckHistory(projectId: string): QualityCheck[] {
    return Array.from(this.checks.values()).filter(c => c.projectId === projectId);
  }

  public getReviewHistory(projectId: string): QualityReview[] {
    return Array.from(this.reviews.values()).filter(r => r.projectId === projectId);
  }
}

export interface QualityCheckReport {
  projectId: string;
  checkDate: Date;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  conditionalChecks: number;
  qualityScore: number;
  checks: QualityCheck[];
  recommendations: QualityRecommendation[];
  nextSteps: string[];
}

// Export singleton instance
export const qualityControlSystem = new QualityControlSystem();