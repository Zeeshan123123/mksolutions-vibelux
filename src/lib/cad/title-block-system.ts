/**
 * Professional Title Block System
 * Customizable title blocks with standard architectural formats
 */

export interface TitleBlockTemplate {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  border: {
    thickness: number;
    color: string;
    margin: number;
  };
  fields: TitleBlockField[];
  logo?: LogoConfig;
  revisionTable?: RevisionTableConfig;
  customSVG?: string;
  isDefault: boolean;
  created: Date;
  lastModified: Date;
}

export interface TitleBlockField {
  id: string;
  type: 'text' | 'date' | 'number' | 'computed' | 'image' | 'qr_code';
  label: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  backgroundColor?: string;
  border?: {
    thickness: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  editable: boolean;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface LogoConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  altText: string;
  preserveAspectRatio: boolean;
}

export interface RevisionTableConfig {
  x: number;
  y: number;
  width: number;
  maxRows: number;
  rowHeight: number;
  columns: Array<{
    id: string;
    label: string;
    width: number;
    alignment: 'left' | 'center' | 'right';
  }>;
  headerStyle: {
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    backgroundColor: string;
    textColor: string;
  };
  cellStyle: {
    fontSize: number;
    textColor: string;
    borderColor: string;
  };
}

export interface TitleBlockInstance {
  id: string;
  templateId: string;
  sheetId: string;
  fieldValues: Map<string, string>;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  revisions: RevisionEntry[];
  created: Date;
  lastModified: Date;
}

export interface RevisionEntry {
  number: string;
  date: string;
  description: string;
  by: string;
  checked?: string;
  approved?: string;
}

export class TitleBlockSystem {
  private templates: Map<string, TitleBlockTemplate> = new Map();
  private instances: Map<string, TitleBlockInstance> = new Map();
  private projectDefaults: Map<string, string> = new Map();

  constructor() {
    this.initializeStandardTemplates();
    this.initializeProjectDefaults();
  }

  /**
   * Initialize standard architectural title block templates
   */
  private initializeStandardTemplates(): void {
    // Standard ARCH-D (24" x 36") title block
    this.createTemplate({
      name: 'Standard ARCH-D',
      description: 'Standard architectural title block for 24" x 36" sheets',
      width: 300,
      height: 120,
      fields: [
        {
          id: 'project_name',
          type: 'text',
          label: 'Project Name',
          value: '',
          x: 10,
          y: 10,
          width: 180,
          height: 20,
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        {
          id: 'drawing_title',
          type: 'text',
          label: 'Drawing Title',
          value: '',
          x: 10,
          y: 35,
          width: 180,
          height: 16,
          fontSize: 12,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        {
          id: 'sheet_number',
          type: 'text',
          label: 'Sheet',
          value: '',
          x: 210,
          y: 30,
          width: 80,
          height: 30,
          fontSize: 24,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'center'
        },
        {
          id: 'drawn_by',
          type: 'text',
          label: 'Drawn By',
          value: '',
          x: 10,
          y: 70,
          width: 80,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'checked_by',
          type: 'text',
          label: 'Checked By',
          value: '',
          x: 100,
          y: 70,
          width: 80,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'date',
          type: 'date',
          label: 'Date',
          value: '',
          x: 10,
          y: 90,
          width: 80,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'scale',
          type: 'text',
          label: 'Scale',
          value: 'As Noted',
          x: 100,
          y: 90,
          width: 80,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'project_number',
          type: 'text',
          label: 'Project No.',
          value: '',
          x: 200,
          y: 90,
          width: 90,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'center'
        }
      ],
      revisionTable: {
        x: 200,
        y: 5,
        width: 90,
        maxRows: 10,
        rowHeight: 15,
        columns: [
          { id: 'rev', label: 'Rev', width: 20, alignment: 'center' },
          { id: 'date', label: 'Date', width: 35, alignment: 'center' },
          { id: 'by', label: 'By', width: 35, alignment: 'center' }
        ],
        headerStyle: {
          fontSize: 8,
          fontWeight: 'bold',
          backgroundColor: '#E0E0E0',
          textColor: '#000000'
        },
        cellStyle: {
          fontSize: 7,
          textColor: '#000000',
          borderColor: '#000000'
        }
      }
    });

    // Compact title block for smaller sheets
    this.createTemplate({
      name: 'Compact',
      description: 'Compact title block for smaller sheets',
      width: 200,
      height: 80,
      fields: [
        {
          id: 'project_name',
          type: 'text',
          label: 'Project',
          value: '',
          x: 5,
          y: 5,
          width: 120,
          height: 16,
          fontSize: 12,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        {
          id: 'drawing_title',
          type: 'text',
          label: 'Title',
          value: '',
          x: 5,
          y: 25,
          width: 120,
          height: 14,
          fontSize: 10,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'sheet_number',
          type: 'text',
          label: 'Sheet',
          value: '',
          x: 140,
          y: 15,
          width: 55,
          height: 25,
          fontSize: 18,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'center'
        },
        {
          id: 'date',
          type: 'date',
          label: 'Date',
          value: '',
          x: 5,
          y: 50,
          width: 60,
          height: 10,
          fontSize: 8,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'scale',
          type: 'text',
          label: 'Scale',
          value: 'As Noted',
          x: 70,
          y: 50,
          width: 50,
          height: 10,
          fontSize: 8,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        }
      ]
    });

    // VibeLux branded title block
    this.createTemplate({
      name: 'VibeLux Standard',
      description: 'VibeLux branded title block with greenhouse-specific fields',
      width: 320,
      height: 140,
      fields: [
        {
          id: 'project_name',
          type: 'text',
          label: 'Greenhouse Project',
          value: '',
          x: 10,
          y: 10,
          width: 200,
          height: 18,
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        {
          id: 'client_name',
          type: 'text',
          label: 'Client',
          value: '',
          x: 10,
          y: 32,
          width: 200,
          height: 12,
          fontSize: 10,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'drawing_title',
          type: 'text',
          label: 'Drawing Title',
          value: '',
          x: 10,
          y: 48,
          width: 200,
          height: 16,
          fontSize: 12,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        {
          id: 'greenhouse_type',
          type: 'text',
          label: 'Greenhouse Type',
          value: '',
          x: 10,
          y: 68,
          width: 100,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'crop_type',
          type: 'text',
          label: 'Crop Type',
          value: '',
          x: 120,
          y: 68,
          width: 90,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'sheet_number',
          type: 'text',
          label: 'Sheet',
          value: '',
          x: 230,
          y: 30,
          width: 80,
          height: 35,
          fontSize: 28,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          textAlign: 'center'
        },
        {
          id: 'designed_by',
          type: 'text',
          label: 'Designed By',
          value: 'VibeLux Engineering',
          x: 10,
          y: 90,
          width: 100,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'date',
          type: 'date',
          label: 'Date',
          value: '',
          x: 10,
          y: 110,
          width: 60,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'scale',
          type: 'text',
          label: 'Scale',
          value: 'As Noted',
          x: 80,
          y: 110,
          width: 60,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left'
        },
        {
          id: 'project_number',
          type: 'text',
          label: 'Project No.',
          value: '',
          x: 230,
          y: 110,
          width: 80,
          height: 12,
          fontSize: 9,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'center'
        }
      ],
      logo: {
        x: 220,
        y: 5,
        width: 90,
        height: 20,
        imageUrl: '/logos/vibelux-logo.svg',
        altText: 'VibeLux Logo',
        preserveAspectRatio: true
      }
    });
  }

  /**
   * Initialize project defaults
   */
  private initializeProjectDefaults(): void {
    this.projectDefaults.set('project_name', 'VibeLux Greenhouse Project');
    this.projectDefaults.set('designed_by', 'VibeLux Engineering');
    this.projectDefaults.set('company_name', 'VibeLux');
    this.projectDefaults.set('phone', '+1 (555) 123-4567');
    this.projectDefaults.set('email', 'info@vibelux.com');
    this.projectDefaults.set('website', 'www.vibelux.com');
  }

  /**
   * Create a new title block template
   */
  createTemplate(templateData: {
    name: string;
    description: string;
    width: number;
    height: number;
    fields: Partial<TitleBlockField>[];
    logo?: LogoConfig;
    revisionTable?: RevisionTableConfig;
    customSVG?: string;
  }): TitleBlockTemplate {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const template: TitleBlockTemplate = {
      id,
      name: templateData.name,
      description: templateData.description,
      width: templateData.width,
      height: templateData.height,
      border: {
        thickness: 2,
        color: '#000000',
        margin: 5
      },
      fields: templateData.fields.map((field, index) => ({
        id: field.id || `field_${index}`,
        type: field.type || 'text',
        label: field.label || 'Field',
        value: field.value || '',
        x: field.x || 0,
        y: field.y || 0,
        width: field.width || 100,
        height: field.height || 20,
        fontSize: field.fontSize || 10,
        fontFamily: field.fontFamily || 'Arial',
        fontWeight: field.fontWeight || 'normal',
        textAlign: field.textAlign || 'left',
        textColor: field.textColor || '#000000',
        editable: field.editable ?? true,
        required: field.required ?? false
      })),
      logo: templateData.logo,
      revisionTable: templateData.revisionTable,
      customSVG: templateData.customSVG,
      isDefault: false,
      created: new Date(),
      lastModified: new Date()
    };

    this.templates.set(id, template);
    return template;
  }

  /**
   * Create title block instance for a sheet
   */
  createInstance(
    templateId: string,
    sheetId: string,
    position: { x: number; y: number },
    fieldValues: Record<string, string> = {}
  ): TitleBlockInstance | null {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return null;
    }

    const id = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Merge field values with project defaults
    const valueMap = new Map<string, string>();
    template.fields.forEach(field => {
      const defaultValue = this.projectDefaults.get(field.id) || field.value;
      const providedValue = fieldValues[field.id];
      valueMap.set(field.id, providedValue || defaultValue);
    });

    // Add computed fields
    if (!valueMap.has('date') || !valueMap.get('date')) {
      valueMap.set('date', new Date().toLocaleDateString());
    }

    const instance: TitleBlockInstance = {
      id,
      templateId,
      sheetId,
      fieldValues: valueMap,
      x: position.x,
      y: position.y,
      scale: 1.0,
      rotation: 0,
      revisions: [],
      created: new Date(),
      lastModified: new Date()
    };

    this.instances.set(id, instance);
    return instance;
  }

  /**
   * Generate SVG for title block instance
   */
  generateTitleBlockSVG(
    instanceId: string,
    options: {
      includeRevisionTable?: boolean;
      includeLogo?: boolean;
      showFieldLabels?: boolean;
    } = {}
  ): string {
    const instance = this.instances.get(instanceId);
    const template = instance ? this.templates.get(instance.templateId) : null;
    
    if (!instance || !template) {
      return '';
    }

    const { includeRevisionTable = true, includeLogo = true, showFieldLabels = false } = options;
    
    let svg = `<g id="title-block-${instanceId}" transform="translate(${instance.x}, ${instance.y}) scale(${instance.scale}) rotate(${instance.rotation})">`;
    
    // Main border
    svg += `
      <rect 
        x="0" y="0" 
        width="${template.width}" height="${template.height}"
        stroke="${template.border.color}" 
        stroke-width="${template.border.thickness}" 
        fill="white"
        class="title-block-border"
      />`;

    // Fields
    template.fields.forEach(field => {
      const value = instance.fieldValues.get(field.id) || field.value;
      
      // Field background (if specified)
      if (field.backgroundColor) {
        svg += `
          <rect 
            x="${field.x}" y="${field.y}" 
            width="${field.width}" height="${field.height}"
            fill="${field.backgroundColor}"
            class="field-background"
          />`;
      }

      // Field border (if specified)
      if (field.border) {
        svg += `
          <rect 
            x="${field.x}" y="${field.y}" 
            width="${field.width}" height="${field.height}"
            stroke="${field.border.color}" 
            stroke-width="${field.border.thickness}"
            stroke-dasharray="${field.border.style === 'dashed' ? '5,5' : field.border.style === 'dotted' ? '2,2' : 'none'}"
            fill="none"
            class="field-border"
          />`;
      }

      // Field label (if enabled)
      if (showFieldLabels && field.label) {
        svg += `
          <text 
            x="${field.x + 2}" y="${field.y - 2}"
            font-family="${field.fontFamily}" 
            font-size="${Math.max(6, field.fontSize - 2)}"
            fill="#666666"
            class="field-label"
          >${field.label}:</text>`;
      }

      // Field value
      const textY = field.y + field.height * 0.7; // Vertically center text
      let textX = field.x + 5; // Left padding
      
      if (field.textAlign === 'center') {
        textX = field.x + field.width / 2;
      } else if (field.textAlign === 'right') {
        textX = field.x + field.width - 5;
      }

      svg += `
        <text 
          x="${textX}" y="${textY}"
          font-family="${field.fontFamily}" 
          font-size="${field.fontSize}"
          font-weight="${field.fontWeight}"
          text-anchor="${field.textAlign === 'center' ? 'middle' : field.textAlign === 'right' ? 'end' : 'start'}"
          fill="${field.textColor}"
          class="field-text field-${field.id}"
        >${this.escapeXML(value)}</text>`;
    });

    // Logo
    if (includeLogo && template.logo) {
      svg += `
        <image 
          x="${template.logo.x}" y="${template.logo.y}" 
          width="${template.logo.width}" height="${template.logo.height}"
          href="${template.logo.imageUrl}"
          preserveAspectRatio="${template.logo.preserveAspectRatio ? 'xMidYMid meet' : 'none'}"
          class="title-block-logo"
        />`;
    }

    // Revision table
    if (includeRevisionTable && template.revisionTable && instance.revisions.length > 0) {
      svg += this.generateRevisionTableSVG(template.revisionTable, instance.revisions);
    }

    // Custom SVG
    if (template.customSVG) {
      svg += template.customSVG;
    }

    svg += '</g>';
    return svg;
  }

  /**
   * Generate revision table SVG
   */
  private generateRevisionTableSVG(
    config: RevisionTableConfig,
    revisions: RevisionEntry[]
  ): string {
    let svg = `<g class="revision-table">`;
    
    const tableWidth = config.width;
    const headerHeight = config.rowHeight;
    const totalHeight = headerHeight + (Math.min(revisions.length, config.maxRows) * config.rowHeight);
    
    // Table border
    svg += `
      <rect 
        x="${config.x}" y="${config.y}" 
        width="${tableWidth}" height="${totalHeight}"
        stroke="${config.cellStyle.borderColor}" 
        stroke-width="1" 
        fill="white"
      />`;

    // Header
    let currentX = config.x;
    config.columns.forEach((column, index) => {
      // Header cell background
      svg += `
        <rect 
          x="${currentX}" y="${config.y}" 
          width="${column.width}" height="${headerHeight}"
          fill="${config.headerStyle.backgroundColor}"
          stroke="${config.cellStyle.borderColor}"
          stroke-width="0.5"
        />`;
      
      // Header text
      const textX = currentX + column.width / 2;
      const textY = config.y + headerHeight * 0.7;
      
      svg += `
        <text 
          x="${textX}" y="${textY}"
          font-family="Arial" 
          font-size="${config.headerStyle.fontSize}"
          font-weight="${config.headerStyle.fontWeight}"
          text-anchor="middle"
          fill="${config.headerStyle.textColor}"
        >${column.label}</text>`;
      
      currentX += column.width;
    });

    // Revision rows
    const visibleRevisions = revisions.slice(-config.maxRows).reverse();
    visibleRevisions.forEach((revision, rowIndex) => {
      const rowY = config.y + headerHeight + (rowIndex * config.rowHeight);
      currentX = config.x;
      
      config.columns.forEach(column => {
        // Cell border
        svg += `
          <rect 
            x="${currentX}" y="${rowY}" 
            width="${column.width}" height="${config.rowHeight}"
            stroke="${config.cellStyle.borderColor}"
            stroke-width="0.5"
            fill="white"
          />`;
        
        // Cell text
        let cellValue = '';
        switch (column.id) {
          case 'rev':
            cellValue = revision.number;
            break;
          case 'date':
            cellValue = revision.date;
            break;
          case 'by':
            cellValue = revision.by;
            break;
          case 'description':
            cellValue = revision.description;
            break;
        }
        
        const textX = column.alignment === 'center' 
          ? currentX + column.width / 2
          : column.alignment === 'right'
          ? currentX + column.width - 3
          : currentX + 3;
        
        const textY = rowY + config.rowHeight * 0.7;
        
        svg += `
          <text 
            x="${textX}" y="${textY}"
            font-family="Arial" 
            font-size="${config.cellStyle.fontSize}"
            text-anchor="${column.alignment === 'center' ? 'middle' : column.alignment === 'right' ? 'end' : 'start'}"
            fill="${config.cellStyle.textColor}"
          >${this.escapeXML(cellValue)}</text>`;
        
        currentX += column.width;
      });
    });
    
    svg += '</g>';
    return svg;
  }

  /**
   * Update title block instance
   */
  updateInstance(
    instanceId: string,
    updates: {
      fieldValues?: Record<string, string>;
      position?: { x: number; y: number };
      scale?: number;
      rotation?: number;
    }
  ): TitleBlockInstance | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    if (updates.fieldValues) {
      Object.entries(updates.fieldValues).forEach(([fieldId, value]) => {
        instance.fieldValues.set(fieldId, value);
      });
    }

    if (updates.position) {
      instance.x = updates.position.x;
      instance.y = updates.position.y;
    }

    if (updates.scale !== undefined) {
      instance.scale = updates.scale;
    }

    if (updates.rotation !== undefined) {
      instance.rotation = updates.rotation;
    }

    instance.lastModified = new Date();
    return instance;
  }

  /**
   * Add revision to title block
   */
  addRevision(
    instanceId: string,
    revision: RevisionEntry
  ): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    instance.revisions.push(revision);
    instance.lastModified = new Date();
    return true;
  }

  /**
   * Validate field values
   */
  validateInstance(instanceId: string): {
    valid: boolean;
    errors: Array<{
      fieldId: string;
      message: string;
    }>;
  } {
    const instance = this.instances.get(instanceId);
    const template = instance ? this.templates.get(instance.templateId) : null;
    
    if (!instance || !template) {
      return {
        valid: false,
        errors: [{ fieldId: '', message: 'Instance or template not found' }]
      };
    }

    const errors: Array<{ fieldId: string; message: string }> = [];

    template.fields.forEach(field => {
      const value = instance.fieldValues.get(field.id) || '';
      
      // Required field validation
      if (field.required && !value.trim()) {
        errors.push({
          fieldId: field.id,
          message: `${field.label} is required`
        });
      }

      // Pattern validation
      if (field.validation?.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} format is invalid`
          });
        }
      }

      // Length validation
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        errors.push({
          fieldId: field.id,
          message: `${field.label} must be at least ${field.validation.minLength} characters`
        });
      }

      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        errors.push({
          fieldId: field.id,
          message: `${field.label} must not exceed ${field.validation.maxLength} characters`
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Utility methods
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Public API methods
   */
  getAllTemplates(): TitleBlockTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): TitleBlockTemplate | null {
    return this.templates.get(id) || null;
  }

  getInstance(id: string): TitleBlockInstance | null {
    return this.instances.get(id) || null;
  }

  getInstancesForSheet(sheetId: string): TitleBlockInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.sheetId === sheetId);
  }

  deleteTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (!template || template.isDefault) {
      return false; // Don't delete default templates
    }

    // Check if template is in use
    const instancesUsingTemplate = Array.from(this.instances.values())
      .filter(instance => instance.templateId === id);
    
    if (instancesUsingTemplate.length > 0) {
      console.warn(`Cannot delete template ${id}: ${instancesUsingTemplate.length} instances using it`);
      return false;
    }

    this.templates.delete(id);
    return true;
  }

  deleteInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  setProjectDefaults(defaults: Record<string, string>): void {
    Object.entries(defaults).forEach(([key, value]) => {
      this.projectDefaults.set(key, value);
    });
  }

  getProjectDefaults(): Record<string, string> {
    return Object.fromEntries(this.projectDefaults.entries());
  }

  exportTemplates(): TitleBlockTemplate[] {
    return this.getAllTemplates().filter(template => !template.isDefault);
  }

  importTemplates(templates: TitleBlockTemplate[]): boolean {
    try {
      templates.forEach(template => {
        this.templates.set(template.id, template);
      });
      return true;
    } catch (error) {
      console.error('Failed to import templates:', error);
      return false;
    }
  }
}

export default TitleBlockSystem;