/**
 * Sheet Reference Management System
 * Professional sheet organization and cross-referencing for architectural drawings
 */

export interface DrawingSheet {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  discipline: 'A' | 'S' | 'M' | 'E' | 'P' | 'L' | 'C' | 'T'; // Architectural, Structural, etc.
  type: 'plan' | 'elevation' | 'section' | 'detail' | 'schedule' | '3d' | 'diagram';
  scale: string;
  size: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'ARCH-E' | 'ARCH-D' | 'ARCH-C' | 'ARCH-B' | 'ARCH-A';
  level?: string;
  phase?: string;
  status: 'draft' | 'review' | 'approved' | 'issued' | 'archived';
  revision: string;
  revisionDate: Date;
  revisionHistory: RevisionRecord[];
  references: SheetReference[];
  backReferences: SheetReference[];
  titleBlock: TitleBlockData;
  viewport?: ViewportData;
  created: Date;
  lastModified: Date;
  filePath?: string;
}

export interface RevisionRecord {
  revision: string;
  date: Date;
  description: string;
  issuedBy: string;
  checkedBy?: string;
  approvedBy?: string;
}

export interface SheetReference {
  id: string;
  type: 'detail' | 'section' | 'elevation' | 'plan' | 'schedule' | 'note';
  targetSheetNumber: string;
  targetDetailNumber?: string;
  referenceNumber: string;
  description: string;
  location: { x: number; y: number };
  bubbleSize: number;
  showDescription: boolean;
}

export interface TitleBlockData {
  projectName: string;
  projectNumber: string;
  clientName: string;
  drawingTitle: string;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
  designDate: Date;
  plotDate: Date;
  scale: string;
  sheetSize: string;
}

export interface ViewportData {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  modelSpaceBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface SheetSet {
  id: string;
  name: string;
  description: string;
  sheets: string[]; // Sheet IDs
  discipline?: string;
  phase?: string;
  created: Date;
  lastModified: Date;
}

export class SheetReferenceManager {
  private sheets: Map<string, DrawingSheet> = new Map();
  private sheetSets: Map<string, SheetSet> = new Map();
  private disciplineCounters: Map<string, number> = new Map();
  private referenceIndex: Map<string, Set<string>> = new Map(); // target -> sources
  
  constructor() {
    this.initializeDisciplineCounters();
  }

  /**
   * Initialize discipline counters for sheet numbering
   */
  private initializeDisciplineCounters(): void {
    const disciplines = ['A', 'S', 'M', 'E', 'P', 'L', 'C', 'T'];
    disciplines.forEach(discipline => {
      this.disciplineCounters.set(discipline, 0);
    });
  }

  /**
   * Create a new drawing sheet
   */
  createSheet(
    title: string,
    discipline: DrawingSheet['discipline'],
    type: DrawingSheet['type'],
    options: {
      subtitle?: string;
      scale?: string;
      size?: DrawingSheet['size'];
      level?: string;
      phase?: string;
      customNumber?: string;
    } = {}
  ): DrawingSheet {
    const id = `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sheetNumber = options.customNumber || this.generateSheetNumber(discipline, type);
    
    const sheet: DrawingSheet = {
      id,
      number: sheetNumber,
      title,
      subtitle: options.subtitle,
      discipline,
      type,
      scale: options.scale || '1:100',
      size: options.size || 'ARCH-D',
      level: options.level,
      phase: options.phase,
      status: 'draft',
      revision: '1',
      revisionDate: new Date(),
      revisionHistory: [{
        revision: '1',
        date: new Date(),
        description: 'Initial issue',
        issuedBy: 'VibeLux CAD'
      }],
      references: [],
      backReferences: [],
      titleBlock: this.createDefaultTitleBlock(title, sheetNumber),
      created: new Date(),
      lastModified: new Date()
    };

    this.sheets.set(id, sheet);
    return sheet;
  }

  /**
   * Generate standard sheet number based on discipline and type
   */
  private generateSheetNumber(
    discipline: string,
    type: DrawingSheet['type']
  ): string {
    const counter = this.disciplineCounters.get(discipline) || 0;
    this.disciplineCounters.set(discipline, counter + 1);
    
    // Standard architectural numbering system
    const typeNumbers: Record<DrawingSheet['type'], string> = {
      'plan': '1',
      'elevation': '2', 
      'section': '3',
      'detail': '4',
      'schedule': '5',
      '3d': '6',
      'diagram': '9'
    };
    
    const typeNumber = typeNumbers[type] || '0';
    const sequenceNumber = (counter + 1).toString().padStart(2, '0');
    
    return `${discipline}${typeNumber}${sequenceNumber}`;
  }

  /**
   * Create default title block data
   */
  private createDefaultTitleBlock(
    drawingTitle: string,
    sheetNumber: string
  ): TitleBlockData {
    return {
      projectName: 'VibeLux Greenhouse Project',
      projectNumber: 'VLX-2024-001',
      clientName: 'Client Name',
      drawingTitle,
      drawnBy: 'VibeLux CAD',
      checkedBy: '',
      approvedBy: '',
      designDate: new Date(),
      plotDate: new Date(),
      scale: 'As Noted',
      sheetSize: 'ARCH-D (24" x 36")'
    };
  }

  /**
   * Add reference from one sheet to another
   */
  addSheetReference(
    fromSheetId: string,
    toSheetNumber: string,
    referenceData: {
      type: SheetReference['type'];
      referenceNumber: string;
      description: string;
      location: { x: number; y: number };
      targetDetailNumber?: string;
      bubbleSize?: number;
      showDescription?: boolean;
    }
  ): SheetReference | null {
    const fromSheet = this.sheets.get(fromSheetId);
    const toSheet = this.findSheetByNumber(toSheetNumber);
    
    if (!fromSheet || !toSheet) {
      console.error('Sheet not found for reference');
      return null;
    }

    const reference: SheetReference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: referenceData.type,
      targetSheetNumber: toSheetNumber,
      targetDetailNumber: referenceData.targetDetailNumber,
      referenceNumber: referenceData.referenceNumber,
      description: referenceData.description,
      location: referenceData.location,
      bubbleSize: referenceData.bubbleSize || 12,
      showDescription: referenceData.showDescription ?? true
    };

    // Add to source sheet references
    fromSheet.references.push(reference);
    fromSheet.lastModified = new Date();

    // Add to target sheet back-references
    toSheet.backReferences.push(reference);
    toSheet.lastModified = new Date();

    // Update reference index
    if (!this.referenceIndex.has(toSheetNumber)) {
      this.referenceIndex.set(toSheetNumber, new Set());
    }
    this.referenceIndex.get(toSheetNumber)!.add(fromSheet.number);

    return reference;
  }

  /**
   * Remove sheet reference
   */
  removeSheetReference(fromSheetId: string, referenceId: string): boolean {
    const fromSheet = this.sheets.get(fromSheetId);
    if (!fromSheet) return false;

    const referenceIndex = fromSheet.references.findIndex(ref => ref.id === referenceId);
    if (referenceIndex === -1) return false;

    const reference = fromSheet.references[referenceIndex];
    const toSheet = this.findSheetByNumber(reference.targetSheetNumber);

    // Remove from source sheet
    fromSheet.references.splice(referenceIndex, 1);
    fromSheet.lastModified = new Date();

    // Remove from target sheet back-references
    if (toSheet) {
      const backRefIndex = toSheet.backReferences.findIndex(ref => ref.id === referenceId);
      if (backRefIndex >= 0) {
        toSheet.backReferences.splice(backRefIndex, 1);
        toSheet.lastModified = new Date();
      }
    }

    // Update reference index
    const targetRefs = this.referenceIndex.get(reference.targetSheetNumber);
    if (targetRefs) {
      targetRefs.delete(fromSheet.number);
      if (targetRefs.size === 0) {
        this.referenceIndex.delete(reference.targetSheetNumber);
      }
    }

    return true;
  }

  /**
   * Create revision for sheet
   */
  createRevision(
    sheetId: string,
    description: string,
    issuedBy: string,
    options: {
      checkedBy?: string;
      approvedBy?: string;
      customRevision?: string;
    } = {}
  ): RevisionRecord | null {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return null;

    const newRevisionNumber = options.customRevision || this.getNextRevisionNumber(sheet.revision);
    
    const revision: RevisionRecord = {
      revision: newRevisionNumber,
      date: new Date(),
      description,
      issuedBy,
      checkedBy: options.checkedBy,
      approvedBy: options.approvedBy
    };

    sheet.revisionHistory.push(revision);
    sheet.revision = newRevisionNumber;
    sheet.revisionDate = revision.date;
    sheet.lastModified = new Date();

    return revision;
  }

  /**
   * Generate next revision number
   */
  private getNextRevisionNumber(currentRevision: string): string {
    // Handle numeric revisions (1, 2, 3, ...)
    const numericMatch = currentRevision.match(/^(\d+)$/);
    if (numericMatch) {
      return (parseInt(numericMatch[1]) + 1).toString();
    }

    // Handle alphabetic revisions (A, B, C, ..., Z, AA, AB, ...)
    const alphaMatch = currentRevision.match(/^([A-Z]+)$/);
    if (alphaMatch) {
      return this.incrementAlphaRevision(alphaMatch[1]);
    }

    // Default: append 'A' to current revision
    return currentRevision + 'A';
  }

  /**
   * Increment alphabetic revision (A->B, Z->AA, etc.)
   */
  private incrementAlphaRevision(revision: string): string {
    const chars = revision.split('');
    let carry = true;
    
    for (let i = chars.length - 1; i >= 0 && carry; i--) {
      if (chars[i] === 'Z') {
        chars[i] = 'A';
      } else {
        chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
        carry = false;
      }
    }
    
    if (carry) {
      chars.unshift('A');
    }
    
    return chars.join('');
  }

  /**
   * Create sheet set
   */
  createSheetSet(
    name: string,
    description: string,
    sheetIds: string[],
    options: {
      discipline?: string;
      phase?: string;
    } = {}
  ): SheetSet {
    const id = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sheetSet: SheetSet = {
      id,
      name,
      description,
      sheets: sheetIds,
      discipline: options.discipline,
      phase: options.phase,
      created: new Date(),
      lastModified: new Date()
    };

    this.sheetSets.set(id, sheetSet);
    return sheetSet;
  }

  /**
   * Generate sheet index/list
   */
  generateSheetIndex(): {
    discipline: string;
    sheets: Array<{
      number: string;
      title: string;
      type: string;
      scale: string;
      revision: string;
      revisionDate: string;
    }>;
  }[] {
    const disciplineGroups = new Map<string, DrawingSheet[]>();
    
    // Group sheets by discipline
    this.sheets.forEach(sheet => {
      if (!disciplineGroups.has(sheet.discipline)) {
        disciplineGroups.set(sheet.discipline, []);
      }
      disciplineGroups.get(sheet.discipline)!.push(sheet);
    });

    // Sort and format
    const index: Array<{
      discipline: string;
      sheets: Array<{
        number: string;
        title: string;
        type: string;
        scale: string;
        revision: string;
        revisionDate: string;
      }>;
    }> = [];

    const disciplineNames = {
      'A': 'Architectural',
      'S': 'Structural', 
      'M': 'Mechanical',
      'E': 'Electrical',
      'P': 'Plumbing',
      'L': 'Landscape',
      'C': 'Civil',
      'T': 'Telecommunications'
    };

    disciplineGroups.forEach((sheets, discipline) => {
      const sortedSheets = sheets.sort((a, b) => a.number.localeCompare(b.number));
      
      index.push({
        discipline: disciplineNames[discipline as keyof typeof disciplineNames] || discipline,
        sheets: sortedSheets.map(sheet => ({
          number: sheet.number,
          title: sheet.title,
          type: sheet.type,
          scale: sheet.scale,
          revision: sheet.revision,
          revisionDate: sheet.revisionDate.toLocaleDateString()
        }))
      });
    });

    return index.sort((a, b) => a.discipline.localeCompare(b.discipline));
  }

  /**
   * Generate cross-reference report
   */
  generateCrossReferenceReport(): {
    sheet: string;
    title: string;
    referencesTo: Array<{ sheet: string; type: string; description: string }>;
    referencedBy: Array<{ sheet: string; type: string; description: string }>;
    orphaned: boolean;
  }[] {
    const report: Array<{
      sheet: string;
      title: string;
      referencesTo: Array<{ sheet: string; type: string; description: string }>;
      referencedBy: Array<{ sheet: string; type: string; description: string }>;
      orphaned: boolean;
    }> = [];

    this.sheets.forEach(sheet => {
      const referencesTo = sheet.references.map(ref => ({
        sheet: ref.targetSheetNumber,
        type: ref.type,
        description: ref.description
      }));

      const referencedBy = sheet.backReferences.map(ref => {
        const sourceSheet = this.findSheetByReference(ref);
        return {
          sheet: sourceSheet?.number || 'Unknown',
          type: ref.type,
          description: ref.description
        };
      });

      const orphaned = referencesTo.length === 0 && referencedBy.length === 0;

      report.push({
        sheet: sheet.number,
        title: sheet.title,
        referencesTo,
        referencedBy,
        orphaned
      });
    });

    return report.sort((a, b) => a.sheet.localeCompare(b.sheet));
  }

  /**
   * Validate all sheet references
   */
  validateReferences(): {
    valid: boolean;
    errors: Array<{
      type: 'missing_target' | 'circular_reference' | 'duplicate_number';
      sheet: string;
      message: string;
    }>;
  } {
    const errors: Array<{
      type: 'missing_target' | 'circular_reference' | 'duplicate_number';
      sheet: string;
      message: string;
    }> = [];

    // Check for duplicate sheet numbers
    const sheetNumbers = new Map<string, string[]>();
    this.sheets.forEach(sheet => {
      if (!sheetNumbers.has(sheet.number)) {
        sheetNumbers.set(sheet.number, []);
      }
      sheetNumbers.get(sheet.number)!.push(sheet.id);
    });

    sheetNumbers.forEach((ids, number) => {
      if (ids.length > 1) {
        errors.push({
          type: 'duplicate_number',
          sheet: number,
          message: `Duplicate sheet number: ${number} (${ids.length} sheets)`
        });
      }
    });

    // Check for missing reference targets
    this.sheets.forEach(sheet => {
      sheet.references.forEach(ref => {
        const targetSheet = this.findSheetByNumber(ref.targetSheetNumber);
        if (!targetSheet) {
          errors.push({
            type: 'missing_target',
            sheet: sheet.number,
            message: `Reference to non-existent sheet: ${ref.targetSheetNumber}`
          });
        }
      });
    });

    // Check for circular references (simplified)
    this.sheets.forEach(sheet => {
      const visited = new Set<string>();
      if (this.hasCircularReference(sheet, visited)) {
        errors.push({
          type: 'circular_reference',
          sheet: sheet.number,
          message: 'Circular reference detected'
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for circular references (basic implementation)
   */
  private hasCircularReference(sheet: DrawingSheet, visited: Set<string>): boolean {
    if (visited.has(sheet.number)) {
      return true;
    }

    visited.add(sheet.number);

    for (const ref of sheet.references) {
      const targetSheet = this.findSheetByNumber(ref.targetSheetNumber);
      if (targetSheet && this.hasCircularReference(targetSheet, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Utility methods
   */
  findSheetByNumber(sheetNumber: string): DrawingSheet | null {
    for (const sheet of this.sheets.values()) {
      if (sheet.number === sheetNumber) {
        return sheet;
      }
    }
    return null;
  }

  private findSheetByReference(reference: SheetReference): DrawingSheet | null {
    for (const sheet of this.sheets.values()) {
      if (sheet.references.some(ref => ref.id === reference.id)) {
        return sheet;
      }
    }
    return null;
  }

  /**
   * Public API methods
   */
  getAllSheets(): DrawingSheet[] {
    return Array.from(this.sheets.values());
  }

  getSheet(id: string): DrawingSheet | null {
    return this.sheets.get(id) || null;
  }

  updateSheet(id: string, updates: Partial<DrawingSheet>): DrawingSheet | null {
    const sheet = this.sheets.get(id);
    if (!sheet) return null;

    const updatedSheet = {
      ...sheet,
      ...updates,
      lastModified: new Date()
    };

    this.sheets.set(id, updatedSheet);
    return updatedSheet;
  }

  deleteSheet(id: string): boolean {
    const sheet = this.sheets.get(id);
    if (!sheet) return false;

    // Remove all references to this sheet
    this.sheets.forEach(otherSheet => {
      otherSheet.references = otherSheet.references.filter(
        ref => ref.targetSheetNumber !== sheet.number
      );
      otherSheet.backReferences = otherSheet.backReferences.filter(
        ref => ref.targetSheetNumber !== sheet.number
      );
    });

    // Clean up reference index
    this.referenceIndex.delete(sheet.number);
    this.referenceIndex.forEach(refs => {
      refs.delete(sheet.number);
    });

    // Remove from sheet sets
    this.sheetSets.forEach(sheetSet => {
      sheetSet.sheets = sheetSet.sheets.filter(sheetId => sheetId !== id);
    });

    this.sheets.delete(id);
    return true;
  }

  getAllSheetSets(): SheetSet[] {
    return Array.from(this.sheetSets.values());
  }

  getSheetSet(id: string): SheetSet | null {
    return this.sheetSets.get(id) || null;
  }

  exportSheetData(): {
    sheets: DrawingSheet[];
    sheetSets: SheetSet[];
    exportDate: Date;
  } {
    return {
      sheets: this.getAllSheets(),
      sheetSets: this.getAllSheetSets(),
      exportDate: new Date()
    };
  }

  importSheetData(data: {
    sheets: DrawingSheet[];
    sheetSets: SheetSet[];
  }): boolean {
    try {
      // Import sheets
      data.sheets.forEach(sheet => {
        this.sheets.set(sheet.id, sheet);
        // Update discipline counter
        const currentMax = this.disciplineCounters.get(sheet.discipline) || 0;
        const sheetNum = parseInt(sheet.number.substr(2)) || 0;
        if (sheetNum > currentMax) {
          this.disciplineCounters.set(sheet.discipline, sheetNum);
        }
      });

      // Import sheet sets
      data.sheetSets.forEach(sheetSet => {
        this.sheetSets.set(sheetSet.id, sheetSet);
      });

      // Rebuild reference index
      this.rebuildReferenceIndex();

      return true;
    } catch (error) {
      console.error('Failed to import sheet data:', error);
      return false;
    }
  }

  private rebuildReferenceIndex(): void {
    this.referenceIndex.clear();
    
    this.sheets.forEach(sheet => {
      sheet.references.forEach(ref => {
        if (!this.referenceIndex.has(ref.targetSheetNumber)) {
          this.referenceIndex.set(ref.targetSheetNumber, new Set());
        }
        this.referenceIndex.get(ref.targetSheetNumber)!.add(sheet.number);
      });
    });
  }
}

export default SheetReferenceManager;