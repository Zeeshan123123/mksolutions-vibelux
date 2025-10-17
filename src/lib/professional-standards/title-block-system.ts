/**
 * Professional Title Block System
 * Integrates Vibelux branding with professional drawing standards
 * Meets ANSI, ISO, and industry title block requirements
 */

export interface TitleBlockTemplate {
  id: string;
  name: string;
  type: TitleBlockType;
  size: DrawingSize;
  layout: TitleBlockLayout;
  branding: BrandingConfig;
  fields: TitleBlockField[];
  revision: RevisionTable;
  compliance: ComplianceStamp[];
  lastUpdated: Date;
}

export type TitleBlockType = 
  | 'architectural'
  | 'structural' 
  | 'mechanical'
  | 'electrical'
  | 'civil'
  | 'plumbing'
  | 'cover-sheet'
  | 'detail-sheet'
  | 'plan-sheet'
  | 'schedule-sheet';

export type DrawingSize = 
  | 'ANSI-A'   // 8.5" x 11"
  | 'ANSI-B'   // 11" x 17"
  | 'ANSI-C'   // 17" x 22"
  | 'ANSI-D'   // 22" x 34"
  | 'ANSI-E'   // 34" x 44"
  | 'ARCH-A'   // 9" x 12"
  | 'ARCH-B'   // 12" x 18"
  | 'ARCH-C'   // 18" x 24"
  | 'ARCH-D'   // 24" x 36"
  | 'ARCH-E';  // 36" x 48"

export interface TitleBlockLayout {
  position: 'bottom-right' | 'bottom-center' | 'right-side';
  width: number;
  height: number;
  borderStyle: BorderStyle;
  zones: LayoutZone[];
}

export interface BorderStyle {
  lineWeight: number;
  lineType: 'solid' | 'dashed';
  color: string;
  cornerRadius?: number;
}

export interface LayoutZone {
  id: string;
  name: string;
  position: [number, number]; // x, y coordinates
  size: [number, number];     // width, height
  purpose: ZonePurpose;
  content?: ZoneContent;
}

export type ZonePurpose = 
  | 'project-info'
  | 'drawing-info'
  | 'branding'
  | 'revision-table'
  | 'professional-seal'
  | 'approval-stamps'
  | 'compliance-marks'
  | 'code-references'
  | 'notes'
  | 'custom';

export interface ZoneContent {
  type: 'text' | 'image' | 'table' | 'logo' | 'seal' | 'barcode';
  data: any;
  formatting: ContentFormatting;
}

export interface ContentFormatting {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'light';
  color: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
}

export interface BrandingConfig {
  companyLogo: LogoConfig;
  companyName: string;
  companyAddress: AddressInfo;
  contact: ContactInfo;
  website: string;
  brandColors: BrandColors;
  typography: TypographyConfig;
}

export interface LogoConfig {
  imagePath: string;
  position: [number, number];
  size: [number, number];
  scalable: boolean;
  aspectRatio: number;
  format: 'svg' | 'png' | 'eps' | 'pdf';
  colorMode: 'full-color' | 'single-color' | 'grayscale';
  placement: 'primary' | 'secondary' | 'watermark';
}

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  text: string;
}

export interface TypographyConfig {
  primaryFont: string;
  secondaryFont: string;
  headingFont: string;
  sizes: FontSizes;
}

export interface FontSizes {
  title: number;
  heading: number;
  body: number;
  caption: number;
  small: number;
}

export interface TitleBlockField {
  id: string;
  label: string;
  value: string | number | Date;
  type: FieldType;
  position: [number, number];
  size: [number, number];
  formatting: ContentFormatting;
  editable: boolean;
  required: boolean;
  validation?: FieldValidation;
}

export type FieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'checkbox'
  | 'signature'
  | 'stamp'
  | 'barcode'
  | 'qr-code';

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  required?: boolean;
  custom?: (value: any) => boolean;
}

export interface RevisionTable {
  position: [number, number];
  size: [number, number];
  columns: RevisionColumn[];
  rows: RevisionRow[];
  maxRows: number;
}

export interface RevisionColumn {
  id: string;
  header: string;
  width: number;
  type: 'text' | 'date' | 'number';
  alignment: 'left' | 'center' | 'right';
}

export interface RevisionRow {
  revision: string;
  date: Date;
  description: string;
  by: string;
  checked?: string;
  approved?: string;
}

export interface ComplianceStamp {
  type: 'professional-seal' | 'code-compliance' | 'quality-mark' | 'certification';
  name: string;
  description: string;
  position: [number, number];
  size: [number, number];
  required: boolean;
  authority: string;
  validUntil?: Date;
}

export interface ProfessionalSeal {
  type: 'engineer' | 'architect' | 'surveyor' | 'geologist';
  name: string;
  licenseNumber: string;
  state: string;
  expirationDate: Date;
  sealImage?: string;
  signature?: string;
  dateStamped?: Date;
}

/**
 * Professional Title Block Management System
 */
export class TitleBlockSystem {
  private templates: Map<string, TitleBlockTemplate> = new Map();
  private vibeluxBranding: BrandingConfig;

  constructor() {
    this.initializeVibeluxBranding();
    this.initializeStandardTemplates();
  }

  private initializeVibeluxBranding(): void {
    this.vibeluxBranding = {
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
        primary: '#00A86B',    // Vibelux Green
        secondary: '#2E8B57',  // Sea Green
        accent: '#32CD32',     // Lime Green
        neutral: '#708090',    // Slate Gray
        text: '#2F4F4F'        // Dark Slate Gray
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
    };
  }

  private initializeStandardTemplates(): void {
    // Greenhouse Construction Drawing Template
    this.addTemplate(this.createGreenhouseTemplate());
    
    // Professional Architectural Template
    this.addTemplate(this.createArchitecturalTemplate());
    
    // Structural Engineering Template  
    this.addTemplate(this.createStructuralTemplate());
    
    // MEP (Mechanical/Electrical/Plumbing) Template
    this.addTemplate(this.createMEPTemplate());
    
    // Cover Sheet Template
    this.addTemplate(this.createCoverSheetTemplate());
    
    // Detail Sheet Template
    this.addTemplate(this.createDetailSheetTemplate());
  }

  private createGreenhouseTemplate(): TitleBlockTemplate {
    return {
      id: 'GREENHOUSE-ARCH-D',
      name: 'Greenhouse Construction - ARCH D (24" x 36")',
      type: 'architectural',
      size: 'ARCH-D',
      layout: {
        position: 'bottom-right',
        width: 8.5,
        height: 4.5,
        borderStyle: {
          lineWeight: 0.024,
          lineType: 'solid',
          color: '#000000'
        },
        zones: [
          {
            id: 'vibelux-branding',
            name: 'Vibelux Branding Zone',
            position: [0.25, 3.5],
            size: [3.0, 1.0],
            purpose: 'branding',
            content: {
              type: 'logo',
              data: this.vibeluxBranding.companyLogo,
              formatting: {
                fontFamily: 'Arial',
                fontSize: 10,
                fontWeight: 'normal',
                color: this.vibeluxBranding.brandColors.primary,
                alignment: 'left'
              }
            }
          },
          {
            id: 'project-info',
            name: 'Project Information',
            position: [3.5, 2.5],
            size: [4.5, 2.0],
            purpose: 'project-info'
          },
          {
            id: 'drawing-info',
            name: 'Drawing Information',
            position: [0.25, 1.5],
            size: [6.0, 1.0],
            purpose: 'drawing-info'
          },
          {
            id: 'professional-seal',
            name: 'Professional Engineer Seal',
            position: [6.5, 2.5],
            size: [1.75, 1.75],
            purpose: 'professional-seal'
          },
          {
            id: 'revision-table',
            name: 'Revision History',
            position: [0.25, 0.25],
            size: [7.75, 1.0],
            purpose: 'revision-table'
          },
          {
            id: 'code-compliance',
            name: 'Code Compliance Marks',
            position: [6.5, 0.75],
            size: [1.75, 0.75],
            purpose: 'compliance-marks'
          }
        ]
      },
      branding: this.vibeluxBranding,
      fields: [
        {
          id: 'project-name',
          label: 'Project Name',
          value: '',
          type: 'text',
          position: [3.75, 4.0],
          size: [4.0, 0.25],
          formatting: {
            fontFamily: 'Arial Black',
            fontSize: 14,
            fontWeight: 'bold',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'left'
          },
          editable: true,
          required: true
        },
        {
          id: 'project-number',
          label: 'Project No.',
          value: '',
          type: 'text',
          position: [3.75, 3.7],
          size: [2.0, 0.2],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 10,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'left'
          },
          editable: true,
          required: true
        },
        {
          id: 'drawing-title',
          label: 'Drawing Title',
          value: '',
          type: 'text',
          position: [0.5, 2.25],
          size: [5.5, 0.25],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'left'
          },
          editable: true,
          required: true
        },
        {
          id: 'drawing-number',
          label: 'Drawing No.',
          value: '',
          type: 'text',
          position: [0.5, 1.9],
          size: [2.0, 0.2],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 10,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'left'
          },
          editable: true,
          required: true
        },
        {
          id: 'scale',
          label: 'Scale',
          value: '',
          type: 'dropdown',
          position: [2.75, 1.9],
          size: [1.5, 0.2],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 10,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'center'
          },
          editable: true,
          required: true
        },
        {
          id: 'date',
          label: 'Date',
          value: new Date(),
          type: 'date',
          position: [4.5, 1.9],
          size: [1.5, 0.2],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 10,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'center'
          },
          editable: true,
          required: true
        },
        {
          id: 'drawn-by',
          label: 'Drawn By',
          value: '',
          type: 'text',
          position: [3.75, 3.4],
          size: [1.5, 0.2],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 8,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'center'
          },
          editable: true,
          required: true
        },
        {
          id: 'checked-by',
          label: 'Checked By',
          value: '',
          type: 'text',
          position: [5.5, 3.4],
          size: [1.5, 0.2],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 8,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'center'
          },
          editable: true,
          required: true
        },
        {
          id: 'approved-by',
          label: 'Approved By',
          value: '',
          type: 'signature',
          position: [3.75, 3.1],
          size: [3.0, 0.25],
          formatting: {
            fontFamily: 'Arial',
            fontSize: 8,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'center'
          },
          editable: true,
          required: false
        }
      ],
      revision: {
        position: [0.5, 0.5],
        size: [7.5, 0.75],
        maxRows: 6,
        columns: [
          {
            id: 'rev',
            header: 'REV',
            width: 0.5,
            type: 'text',
            alignment: 'center'
          },
          {
            id: 'date',
            header: 'DATE',
            width: 1.0,
            type: 'date',
            alignment: 'center'
          },
          {
            id: 'description',
            header: 'DESCRIPTION',
            width: 4.0,
            type: 'text',
            alignment: 'left'
          },
          {
            id: 'by',
            header: 'BY',
            width: 1.0,
            type: 'text',
            alignment: 'center'
          },
          {
            id: 'checked',
            header: 'CHK',
            width: 1.0,
            type: 'text',
            alignment: 'center'
          }
        ],
        rows: []
      },
      compliance: [
        {
          type: 'professional-seal',
          name: 'Professional Engineer Seal',
          description: 'Licensed Professional Engineer stamp and signature required',
          position: [6.75, 3.0],
          size: [1.25, 1.25],
          required: true,
          authority: 'State Engineering Board'
        },
        {
          type: 'code-compliance',
          name: 'IBC 2021 Compliance',
          description: 'Complies with International Building Code 2021',
          position: [6.75, 1.0],
          size: [1.25, 0.4],
          required: true,
          authority: 'ICC'
        },
        {
          type: 'quality-mark',
          name: 'Vibelux Quality Assured',
          description: 'Reviewed per Vibelux professional quality standards',
          position: [6.75, 0.5],
          size: [1.25, 0.4],
          required: false,
          authority: 'Vibelux Quality System'
        }
      ],
      lastUpdated: new Date()
    };
  }

  private createCoverSheetTemplate(): TitleBlockTemplate {
    return {
      id: 'COVER-SHEET-ARCH-D',
      name: 'Project Cover Sheet - ARCH D (24" x 36")',
      type: 'cover-sheet',
      size: 'ARCH-D',
      layout: {
        position: 'bottom-center',
        width: 20.0,
        height: 6.0,
        borderStyle: {
          lineWeight: 0.032,
          lineType: 'solid',
          color: this.vibeluxBranding.brandColors.primary
        },
        zones: [
          {
            id: 'vibelux-header',
            name: 'Vibelux Header Branding',
            position: [1.0, 4.5],
            size: [18.0, 1.5],
            purpose: 'branding',
            content: {
              type: 'logo',
              data: {
                ...this.vibeluxBranding.companyLogo,
                size: [200, 60],
                placement: 'primary'
              },
              formatting: {
                fontFamily: this.vibeluxBranding.typography.headingFont,
                fontSize: this.vibeluxBranding.typography.sizes.title,
                fontWeight: 'bold',
                color: this.vibeluxBranding.brandColors.primary,
                alignment: 'center'
              }
            }
          },
          {
            id: 'project-header',
            name: 'Project Title Section',
            position: [1.0, 3.0],
            size: [18.0, 1.5],
            purpose: 'project-info'
          },
          {
            id: 'project-details',
            name: 'Project Details Grid',
            position: [1.0, 1.5],
            size: [12.0, 1.5],
            purpose: 'project-info'
          },
          {
            id: 'drawing-index',
            name: 'Drawing Index',
            position: [13.5, 1.5],
            size: [5.5, 1.5],
            purpose: 'drawing-info'
          },
          {
            id: 'compliance-footer',
            name: 'Compliance & Contact Information',
            position: [1.0, 0.25],
            size: [18.0, 1.0],
            purpose: 'compliance-marks'
          }
        ]
      },
      branding: this.vibeluxBranding,
      fields: [
        {
          id: 'project-title',
          label: 'Project Title',
          value: '',
          type: 'text',
          position: [10, 3.75],
          size: [16.0, 0.5],
          formatting: {
            fontFamily: this.vibeluxBranding.typography.headingFont,
            fontSize: 24,
            fontWeight: 'bold',
            color: this.vibeluxBranding.brandColors.text,
            alignment: 'center'
          },
          editable: true,
          required: true
        },
        {
          id: 'project-subtitle',
          label: 'Project Subtitle',
          value: 'Professional Greenhouse Construction Documents',
          type: 'text',
          position: [10, 3.25],
          size: [16.0, 0.3],
          formatting: {
            fontFamily: this.vibeluxBranding.typography.primaryFont,
            fontSize: 16,
            fontWeight: 'normal',
            color: this.vibeluxBranding.brandColors.secondary,
            alignment: 'center'
          },
          editable: true,
          required: false
        }
      ],
      revision: {
        position: [1.0, 0.5],
        size: [11.0, 0.75],
        maxRows: 4,
        columns: [
          {
            id: 'rev',
            header: 'REV',
            width: 0.75,
            type: 'text',
            alignment: 'center'
          },
          {
            id: 'date',
            header: 'DATE',
            width: 1.5,
            type: 'date',
            alignment: 'center'
          },
          {
            id: 'description',
            header: 'REVISION DESCRIPTION',
            width: 6.0,
            type: 'text',
            alignment: 'left'
          },
          {
            id: 'by',
            header: 'BY',
            width: 1.25,
            type: 'text',
            alignment: 'center'
          },
          {
            id: 'approved',
            header: 'APPROVED',
            width: 1.5,
            type: 'text',
            alignment: 'center'
          }
        ],
        rows: []
      },
      compliance: [
        {
          type: 'professional-seal',
          name: 'Professional Engineer Seal',
          description: 'Sealed by Licensed Professional Engineer',
          position: [14.0, 0.5],
          size: [2.0, 2.0],
          required: true,
          authority: 'State Engineering Board'
        },
        {
          type: 'quality-mark',
          name: 'Vibelux Professional Standards',
          description: 'Designed using Vibelux professional standards system',
          position: [16.5, 0.5],
          size: [2.5, 0.75],
          required: false,
          authority: 'Vibelux'
        }
      ],
      lastUpdated: new Date()
    };
  }

  // Additional template creation methods...
  private createArchitecturalTemplate(): TitleBlockTemplate { 
    // Implementation would create architectural-specific template
    return {} as TitleBlockTemplate; 
  }
  
  private createStructuralTemplate(): TitleBlockTemplate { 
    // Implementation would create structural engineering template
    return {} as TitleBlockTemplate; 
  }
  
  private createMEPTemplate(): TitleBlockTemplate { 
    // Implementation would create MEP template
    return {} as TitleBlockTemplate; 
  }
  
  private createDetailSheetTemplate(): TitleBlockTemplate { 
    // Implementation would create detail sheet template
    return {} as TitleBlockTemplate; 
  }

  public addTemplate(template: TitleBlockTemplate): void {
    this.templates.set(template.id, template);
  }

  public getTemplate(id: string): TitleBlockTemplate | undefined {
    return this.templates.get(id);
  }

  public getTemplatesByType(type: TitleBlockType): TitleBlockTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.type === type);
  }

  public getTemplatesBySize(size: DrawingSize): TitleBlockTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.size === size);
  }

  public getAllTemplates(): TitleBlockTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Generate title block as SVG with Vibelux branding
   */
  public generateTitleBlockSVG(templateId: string, data: TitleBlockData): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const { width, height } = this.getDrawingDimensions(template.size);
    const titleBlock = template.layout;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
                   viewBox="0 0 ${width * 72} ${height * 72}"
                   width="${width}in" height="${height}in">
      <defs>
        <style>
          .title-block-border { 
            stroke: ${titleBlock.borderStyle.color}; 
            stroke-width: ${titleBlock.borderStyle.lineWeight * 72}; 
            fill: none; 
          }
          .vibelux-primary { fill: ${this.vibeluxBranding.brandColors.primary}; }
          .vibelux-text { fill: ${this.vibeluxBranding.brandColors.text}; }
          .field-text { 
            font-family: ${this.vibeluxBranding.typography.primaryFont}; 
            font-size: 10px; 
          }
          .title-text { 
            font-family: ${this.vibeluxBranding.typography.headingFont}; 
            font-size: 14px; 
            font-weight: bold; 
          }
        </style>
      </defs>`;

    // Add title block border
    const tbX = (width - titleBlock.width) * 72;
    const tbY = (height - titleBlock.height) * 72;
    svg += `<rect x="${tbX}" y="${tbY}" 
                 width="${titleBlock.width * 72}" 
                 height="${titleBlock.height * 72}" 
                 class="title-block-border"/>`;

    // Add Vibelux logo
    const logoZone = titleBlock.zones.find(z => z.purpose === 'branding');
    if (logoZone && this.vibeluxBranding.companyLogo.imagePath) {
      const logoX = tbX + (logoZone.position[0] * 72);
      const logoY = tbY + (logoZone.position[1] * 72);
      const logoW = logoZone.size[0] * 72;
      const logoH = logoZone.size[1] * 72;

      svg += `<g transform="translate(${logoX}, ${logoY})">
        <rect width="${logoW}" height="${logoH}" fill="${this.vibeluxBranding.brandColors.primary}" opacity="0.1"/>
        <text x="${logoW/2}" y="${logoH/2}" 
              text-anchor="middle" dominant-baseline="middle"
              class="vibelux-primary title-text">
          ${this.vibeluxBranding.companyName}
        </text>
        <text x="${logoW/2}" y="${logoH/2 + 20}" 
              text-anchor="middle" dominant-baseline="middle"
              class="vibelux-text field-text">
          Professional Greenhouse Solutions
        </text>
      </g>`;
    }

    // Add fields with data
    for (const field of template.fields) {
      const fieldValue = data.fields[field.id] || field.value || '';
      const fieldX = tbX + (field.position[0] * 72);
      const fieldY = tbY + (field.position[1] * 72);

      svg += `<text x="${fieldX}" y="${fieldY}" 
                   class="field-text vibelux-text">
        ${field.label}: ${fieldValue}
      </text>`;
    }

    // Add revision table
    if (data.revisions && data.revisions.length > 0) {
      svg += this.generateRevisionTableSVG(template.revision, data.revisions, tbX, tbY);
    }

    // Add compliance stamps
    for (const stamp of template.compliance) {
      if (stamp.required || data.includeOptionalStamps) {
        const stampX = tbX + (stamp.position[0] * 72);
        const stampY = tbY + (stamp.position[1] * 72);
        const stampW = stamp.size[0] * 72;
        const stampH = stamp.size[1] * 72;

        svg += `<g transform="translate(${stampX}, ${stampY})">
          <rect width="${stampW}" height="${stampH}" 
                stroke="${this.vibeluxBranding.brandColors.secondary}" 
                stroke-width="1" fill="none"/>
          <text x="${stampW/2}" y="${stampH/2}" 
                text-anchor="middle" dominant-baseline="middle"
                class="field-text vibelux-text">
            ${stamp.name}
          </text>
        </g>`;
      }
    }

    svg += '</svg>';
    return svg;
  }

  private generateRevisionTableSVG(revisionTable: RevisionTable, revisions: RevisionRow[], offsetX: number, offsetY: number): string {
    const tableX = offsetX + (revisionTable.position[0] * 72);
    const tableY = offsetY + (revisionTable.position[1] * 72);
    const tableW = revisionTable.size[0] * 72;
    const tableH = revisionTable.size[1] * 72;

    let svg = `<g transform="translate(${tableX}, ${tableY})">`;
    
    // Table border
    svg += `<rect width="${tableW}" height="${tableH}" 
            stroke="${this.vibeluxBranding.brandColors.text}" 
            stroke-width="1" fill="white"/>`;

    // Column headers
    let colX = 0;
    const headerH = 20;
    for (const col of revisionTable.columns) {
      const colW = col.width * 72;
      svg += `<rect x="${colX}" y="0" width="${colW}" height="${headerH}" 
              stroke="${this.vibeluxBranding.brandColors.text}" 
              stroke-width="0.5" fill="${this.vibeluxBranding.brandColors.primary}" opacity="0.1"/>`;
      svg += `<text x="${colX + colW/2}" y="${headerH/2}" 
              text-anchor="middle" dominant-baseline="middle"
              class="field-text vibelux-text" font-weight="bold">
        ${col.header}
      </text>`;
      colX += colW;
    }

    // Revision rows
    const rowH = (tableH - headerH) / revisionTable.maxRows;
    for (let i = 0; i < Math.min(revisions.length, revisionTable.maxRows); i++) {
      const revision = revisions[i];
      const rowY = headerH + (i * rowH);
      
      colX = 0;
      for (const col of revisionTable.columns) {
        const colW = col.width * 72;
        let cellValue = '';
        
        switch (col.id) {
          case 'rev': cellValue = revision.revision; break;
          case 'date': cellValue = revision.date.toLocaleDateString(); break;
          case 'description': cellValue = revision.description; break;
          case 'by': cellValue = revision.by; break;
          case 'checked': cellValue = revision.checked || ''; break;
          case 'approved': cellValue = revision.approved || ''; break;
        }

        svg += `<rect x="${colX}" y="${rowY}" width="${colW}" height="${rowH}" 
                stroke="${this.vibeluxBranding.brandColors.text}" 
                stroke-width="0.25" fill="none"/>`;
        svg += `<text x="${colX + 4}" y="${rowY + rowH/2}" 
                dominant-baseline="middle"
                class="field-text vibelux-text">
          ${cellValue}
        </text>`;
        colX += colW;
      }
    }

    svg += '</g>';
    return svg;
  }

  private getDrawingDimensions(size: DrawingSize): { width: number; height: number } {
    const dimensions = {
      'ANSI-A': { width: 11, height: 8.5 },
      'ANSI-B': { width: 17, height: 11 },
      'ANSI-C': { width: 22, height: 17 },
      'ANSI-D': { width: 34, height: 22 },
      'ANSI-E': { width: 44, height: 34 },
      'ARCH-A': { width: 12, height: 9 },
      'ARCH-B': { width: 18, height: 12 },
      'ARCH-C': { width: 24, height: 18 },
      'ARCH-D': { width: 36, height: 24 },
      'ARCH-E': { width: 48, height: 36 }
    };
    return dimensions[size];
  }

  /**
   * Update Vibelux branding configuration
   */
  public updateVibeluxBranding(branding: Partial<BrandingConfig>): void {
    this.vibeluxBranding = { ...this.vibeluxBranding, ...branding };
    
    // Update all templates with new branding
    for (const template of this.templates.values()) {
      template.branding = this.vibeluxBranding;
    }
  }

  /**
   * Get Vibelux branding configuration
   */
  public getVibeluxBranding(): BrandingConfig {
    return this.vibeluxBranding;
  }
}

export interface TitleBlockData {
  fields: Record<string, string | number | Date>;
  revisions: RevisionRow[];
  includeOptionalStamps?: boolean;
  professionalSeal?: ProfessionalSeal;
}

// Export singleton instance
export const titleBlockSystem = new TitleBlockSystem();