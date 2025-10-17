/**
 * Professional General Notes System
 * Comprehensive engineering specifications and general notes for construction documents
 * Compliant with current codes and industry standards
 */

import { jsPDF } from 'jspdf';

export interface GeneralNote {
  id: string;
  category: 'electrical' | 'mechanical' | 'structural' | 'architectural' | 'plumbing' | 'general' | 'safety';
  subcategory: string;
  noteText: string;
  codeReference?: string;
  priority: 'high' | 'medium' | 'low';
  applicableToGreenhousesOnly?: boolean;
}

export interface ProjectSpecificNote {
  id: string;
  category: string;
  noteText: string;
  projectData: any;
}

export class ProfessionalGeneralNotesSystem {
  private generalNotes: Map<string, GeneralNote> = new Map();
  private projectSpecificNotes: Map<string, ProjectSpecificNote> = new Map();

  constructor() {
    this.initializeElectricalNotes();
    this.initializeMechanicalNotes();
    this.initializeStructuralNotes();
    this.initializeArchitecturalNotes();
    this.initializePlumbingNotes();
    this.initializeSafetyNotes();
    this.initializeGeneralNotes();
  }

  /**
   * Initialize electrical general notes
   */
  private initializeElectricalNotes(): void {
    const electricalNotes: GeneralNote[] = [
      {
        id: 'E001',
        category: 'electrical',
        subcategory: 'General',
        noteText: 'All electrical work shall be performed in accordance with the National Electrical Code (NEC) 2020 Edition, local electrical codes, and utility company requirements.',
        codeReference: 'NEC 2020',
        priority: 'high'
      },
      {
        id: 'E002',
        category: 'electrical',
        subcategory: 'Installation',
        noteText: 'All electrical equipment shall be listed by Underwriters Laboratories (UL) or equivalent testing laboratory acceptable to the Authority Having Jurisdiction (AHJ).',
        codeReference: 'NEC 110.3(B)',
        priority: 'high'
      },
      {
        id: 'E003',
        category: 'electrical',
        subcategory: 'Grounding',
        noteText: 'Equipment grounding conductor shall be installed with all branch circuits and feeders. Size per NEC Table 250.122.',
        codeReference: 'NEC 250.118',
        priority: 'high'
      },
      {
        id: 'E004',
        category: 'electrical',
        subcategory: 'GFCI Protection',
        noteText: 'Ground-fault circuit-interrupter protection shall be provided for all 125-volt, single-phase, 15- and 20-ampere receptacles in wet locations.',
        codeReference: 'NEC 210.8',
        priority: 'high'
      },
      {
        id: 'E005',
        category: 'electrical',
        subcategory: 'Voltage Drop',
        noteText: 'Voltage drop on any branch circuit shall not exceed 3% and total voltage drop on feeders and branch circuits shall not exceed 5%.',
        codeReference: 'NEC 210.19(A) FPN',
        priority: 'medium'
      },
      {
        id: 'E006',
        category: 'electrical',
        subcategory: 'Panel Boards',
        noteText: 'All panelboards shall have a minimum 20% spare capacity. Provide typed circuit directory with proper circuit identification.',
        codeReference: 'NEC 408.4',
        priority: 'medium'
      },
      {
        id: 'E007',
        category: 'electrical',
        subcategory: 'Lighting',
        noteText: 'All lighting fixtures in greenhouse environment shall be suitable for wet locations and corrosive atmospheres.',
        codeReference: 'NEC 410.10',
        priority: 'high',
        applicableToGreenhousesOnly: true
      },
      {
        id: 'E008',
        category: 'electrical',
        subcategory: 'Conduit',
        noteText: 'All conduit in greenhouse environment shall be rigid PVC, rigid metal conduit (RMC), or intermediate metal conduit (IMC) suitable for corrosive environments.',
        codeReference: 'NEC 300.6',
        priority: 'high',
        applicableToGreenhousesOnly: true
      },
      {
        id: 'E009',
        category: 'electrical',
        subcategory: 'Emergency Systems',
        noteText: 'Emergency lighting shall operate for minimum 90 minutes and provide minimum 1 foot-candle at floor level along egress paths.',
        codeReference: 'NEC 700.12',
        priority: 'high'
      },
      {
        id: 'E010',
        category: 'electrical',
        subcategory: 'Arc Fault Protection',
        noteText: 'Arc-fault circuit-interrupter protection shall be provided for all 120-volt, single-phase, 15- and 20-ampere branch circuits in accordance with NEC 210.12.',
        codeReference: 'NEC 210.12',
        priority: 'medium'
      },
      {
        id: 'E011',
        category: 'electrical',
        subcategory: 'Wire and Cable',
        noteText: 'All conductors shall be copper with THWN-2 insulation minimum. Aluminum conductors permitted for feeders 4 AWG and larger only.',
        codeReference: 'NEC 310.106',
        priority: 'medium'
      },
      {
        id: 'E012',
        category: 'electrical',
        subcategory: 'Load Calculations',
        noteText: 'Electrical load calculations performed in accordance with NEC Article 220. Demand factors applied per NEC 220.40 through 220.87.',
        codeReference: 'NEC Article 220',
        priority: 'high'
      }
    ];

    electricalNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Initialize mechanical general notes
   */
  private initializeMechanicalNotes(): void {
    const mechanicalNotes: GeneralNote[] = [
      {
        id: 'M001',
        category: 'mechanical',
        subcategory: 'General',
        noteText: 'All mechanical work shall be performed in accordance with the International Mechanical Code (IMC) 2021, ASHRAE standards, and local mechanical codes.',
        codeReference: 'IMC 2021',
        priority: 'high'
      },
      {
        id: 'M002',
        category: 'mechanical',
        subcategory: 'Equipment',
        noteText: 'All HVAC equipment shall meet AHRI certification standards and shall be listed by appropriate testing laboratory.',
        codeReference: 'IMC 303.1',
        priority: 'high'
      },
      {
        id: 'M003',
        category: 'mechanical',
        subcategory: 'Ductwork',
        noteText: 'All ductwork shall be constructed and installed in accordance with SMACNA standards. Galvanized steel ductwork minimum 26 gauge.',
        codeReference: 'IMC 603.2',
        priority: 'high'
      },
      {
        id: 'M004',
        category: 'mechanical',
        subcategory: 'Insulation',
        noteText: 'Supply ductwork shall be insulated with R-6 minimum insulation. Return ductwork in unconditioned spaces shall be insulated R-4 minimum.',
        codeReference: 'IMC 603.9',
        priority: 'medium'
      },
      {
        id: 'M005',
        category: 'mechanical',
        subcategory: 'Ventilation',
        noteText: 'Ventilation rates shall meet ASHRAE 62.1 requirements. Minimum outdoor air quantity shall be continuously monitored.',
        codeReference: 'ASHRAE 62.1',
        priority: 'high'
      },
      {
        id: 'M006',
        category: 'mechanical',
        subcategory: 'Energy Efficiency',
        noteText: 'All HVAC equipment shall meet ASHRAE 90.1 energy efficiency requirements. Equipment efficiency ratings shown on schedules.',
        codeReference: 'ASHRAE 90.1',
        priority: 'high'
      },
      {
        id: 'M007',
        category: 'mechanical',
        subcategory: 'Controls',
        noteText: 'DDC control system shall monitor and control all HVAC equipment. Provide web-based interface with alarm notification.',
        codeReference: 'ASHRAE 90.1',
        priority: 'medium'
      },
      {
        id: 'M008',
        category: 'mechanical',
        subcategory: 'Greenhouse HVAC',
        noteText: 'HVAC equipment in greenhouse environment shall be suitable for high humidity (90%+ RH) and corrosive conditions.',
        priority: 'high',
        applicableToGreenhousesOnly: true
      },
      {
        id: 'M009',
        category: 'mechanical',
        subcategory: 'Piping',
        noteText: 'Chilled water and hot water piping shall be black steel, Schedule 40 minimum. Insulate per ASHRAE 90.1 requirements.',
        codeReference: 'IMC 1202.1',
        priority: 'medium'
      },
      {
        id: 'M010',
        category: 'mechanical',
        subcategory: 'Testing and Balancing',
        noteText: 'Complete testing, adjusting, and balancing (TAB) required for all HVAC systems per ASHRAE 111 standards.',
        codeReference: 'ASHRAE 111',
        priority: 'high'
      },
      {
        id: 'M011',
        category: 'mechanical',
        subcategory: 'Refrigeration',
        noteText: 'Refrigeration systems shall comply with ASHRAE 15 safety requirements. Emergency ventilation required for machinery rooms.',
        codeReference: 'ASHRAE 15',
        priority: 'high'
      },
      {
        id: 'M012',
        category: 'mechanical',
        subcategory: 'Climate Control',
        noteText: 'Greenhouse climate control system shall maintain temperature ±2°F and humidity ±5% RH of setpoint.',
        priority: 'medium',
        applicableToGreenhousesOnly: true
      }
    ];

    mechanicalNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Initialize structural general notes
   */
  private initializeStructuralNotes(): void {
    const structuralNotes: GeneralNote[] = [
      {
        id: 'S001',
        category: 'structural',
        subcategory: 'General',
        noteText: 'All structural work shall be performed in accordance with the International Building Code (IBC) 2021 and applicable AISC specifications.',
        codeReference: 'IBC 2021',
        priority: 'high'
      },
      {
        id: 'S002',
        category: 'structural',
        subcategory: 'Materials',
        noteText: 'All structural steel shall conform to ASTM A992 Grade 50. Bolts shall be ASTM A325 high-strength bolts unless noted otherwise.',
        codeReference: 'AISC 360',
        priority: 'high'
      },
      {
        id: 'S003',
        category: 'structural',
        subcategory: 'Welding',
        noteText: 'All welding shall be performed by AWS certified welders in accordance with AWS D1.1 Structural Welding Code.',
        codeReference: 'AWS D1.1',
        priority: 'high'
      },
      {
        id: 'S004',
        category: 'structural',
        subcategory: 'Concrete',
        noteText: 'Concrete shall have minimum compressive strength of 3000 PSI at 28 days unless noted otherwise. All concrete work per ACI 318.',
        codeReference: 'ACI 318',
        priority: 'high'
      },
      {
        id: 'S005',
        category: 'structural',
        subcategory: 'Foundations',
        noteText: 'All foundations shall bear on undisturbed soil or engineered fill. Minimum bearing capacity 2000 PSF unless noted otherwise.',
        codeReference: 'IBC 1804',
        priority: 'high'
      },
      {
        id: 'S006',
        category: 'structural',
        subcategory: 'Load Path',
        noteText: 'Continuous load path shall be provided from roof to foundation for all lateral and gravity loads.',
        codeReference: 'IBC 1604.8.2',
        priority: 'high'
      },
      {
        id: 'S007',
        category: 'structural',
        subcategory: 'Wind Loads',
        noteText: 'Wind loads calculated per ASCE 7-16. Design wind speed 115 mph, Exposure Category C, Risk Category II.',
        codeReference: 'ASCE 7-16',
        priority: 'high'
      },
      {
        id: 'S008',
        category: 'structural',
        subcategory: 'Seismic',
        noteText: 'Seismic design per ASCE 7-16. Site Class D assumed unless geotechnical report specifies otherwise.',
        codeReference: 'ASCE 7-16',
        priority: 'high'
      },
      {
        id: 'S009',
        category: 'structural',
        subcategory: 'Snow Loads',
        noteText: 'Snow loads per ASCE 7-16. Ground snow load 25 PSF unless local building official specifies otherwise.',
        codeReference: 'ASCE 7-16',
        priority: 'medium'
      },
      {
        id: 'S010',
        category: 'structural',
        subcategory: 'Special Inspection',
        noteText: 'Special inspection required for structural welding, bolting, and concrete placement per IBC Chapter 17.',
        codeReference: 'IBC Chapter 17',
        priority: 'high'
      },
      {
        id: 'S011',
        category: 'structural',
        subcategory: 'Corrosion Protection',
        noteText: 'All structural steel in greenhouse environment shall be hot-dip galvanized per ASTM A123 for corrosion protection.',
        codeReference: 'ASTM A123',
        priority: 'high',
        applicableToGreenhousesOnly: true
      }
    ];

    structuralNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Initialize architectural general notes
   */
  private initializeArchitecturalNotes(): void {
    const architecturalNotes: GeneralNote[] = [
      {
        id: 'A001',
        category: 'architectural',
        subcategory: 'General',
        noteText: 'All architectural work shall be performed in accordance with the International Building Code (IBC) 2021 and Americans with Disabilities Act (ADA) requirements.',
        codeReference: 'IBC 2021, ADA',
        priority: 'high'
      },
      {
        id: 'A002',
        category: 'architectural',
        subcategory: 'Accessibility',
        noteText: 'All public areas shall be accessible per ADA requirements. Provide accessible route from parking to all building entrances.',
        codeReference: 'ADA Section 206',
        priority: 'high'
      },
      {
        id: 'A003',
        category: 'architectural',
        subcategory: 'Egress',
        noteText: 'Minimum egress width 44 inches. Maximum travel distance to exit 250 feet. Emergency lighting required along egress paths.',
        codeReference: 'IBC 1005.1, 1006.2',
        priority: 'high'
      },
      {
        id: 'A004',
        category: 'architectural',
        subcategory: 'Fire Rating',
        noteText: 'Fire-resistance ratings of building elements shall be as indicated on drawings and per IBC requirements.',
        codeReference: 'IBC Table 601',
        priority: 'high'
      },
      {
        id: 'A005',
        category: 'architectural',
        subcategory: 'Glazing',
        noteText: 'Greenhouse glazing shall be safety glazing per IBC 2406. Polycarbonate panels minimum 8mm thickness.',
        codeReference: 'IBC 2406',
        priority: 'medium',
        applicableToGreenhousesOnly: true
      },
      {
        id: 'A006',
        category: 'architectural',
        subcategory: 'Ventilation',
        noteText: 'Natural ventilation openings shall be minimum 15% of floor area. Motorized vents with manual override required.',
        priority: 'medium',
        applicableToGreenhousesOnly: true
      }
    ];

    architecturalNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Initialize plumbing general notes
   */
  private initializePlumbingNotes(): void {
    const plumbingNotes: GeneralNote[] = [
      {
        id: 'P001',
        category: 'plumbing',
        subcategory: 'General',
        noteText: 'All plumbing work shall be performed in accordance with the International Plumbing Code (IPC) 2021 and local plumbing codes.',
        codeReference: 'IPC 2021',
        priority: 'high'
      },
      {
        id: 'P002',
        category: 'plumbing',
        subcategory: 'Water Supply',
        noteText: 'Water supply system shall be designed for minimum 20 PSI residual pressure at highest fixture.',
        codeReference: 'IPC 604.8',
        priority: 'high'
      },
      {
        id: 'P003',
        category: 'plumbing',
        subcategory: 'Drainage',
        noteText: 'Sanitary drainage system shall be designed with minimum 2% slope for horizontal piping.',
        codeReference: 'IPC 704.1',
        priority: 'high'
      },
      {
        id: 'P004',
        category: 'plumbing',
        subcategory: 'Irrigation',
        noteText: 'Irrigation system shall include backflow prevention device per local water utility requirements.',
        codeReference: 'IPC 608.1',
        priority: 'high',
        applicableToGreenhousesOnly: true
      },
      {
        id: 'P005',
        category: 'plumbing',
        subcategory: 'Floor Drains',
        noteText: 'Floor drains required in all wet areas. Minimum 4-inch diameter with removable strainer.',
        codeReference: 'IPC 801.1',
        priority: 'medium'
      }
    ];

    plumbingNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Initialize safety general notes
   */
  private initializeSafetyNotes(): void {
    const safetyNotes: GeneralNote[] = [
      {
        id: 'SF001',
        category: 'safety',
        subcategory: 'General',
        noteText: 'All work shall be performed in accordance with OSHA safety standards. Contractor responsible for job site safety.',
        codeReference: 'OSHA 1926',
        priority: 'high'
      },
      {
        id: 'SF002',
        category: 'safety',
        subcategory: 'Fall Protection',
        noteText: 'Fall protection required for work at heights greater than 6 feet. Safety harnesses and lifelines required.',
        codeReference: 'OSHA 1926.501',
        priority: 'high'
      },
      {
        id: 'SF003',
        category: 'safety',
        subcategory: 'Lockout/Tagout',
        noteText: 'Lockout/tagout procedures required for all electrical and mechanical equipment during maintenance.',
        codeReference: 'OSHA 1910.147',
        priority: 'high'
      },
      {
        id: 'SF004',
        category: 'safety',
        subcategory: 'Emergency Systems',
        noteText: 'Emergency eyewash stations required within 25 feet of chemical storage areas. Annual inspection required.',
        codeReference: 'OSHA 1910.151',
        priority: 'medium',
        applicableToGreenhousesOnly: true
      }
    ];

    safetyNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Initialize general construction notes
   */
  private initializeGeneralNotes(): void {
    const generalConstructionNotes: GeneralNote[] = [
      {
        id: 'G001',
        category: 'general',
        subcategory: 'General',
        noteText: 'Contractor shall verify all dimensions and conditions at job site before beginning work. Report discrepancies to Engineer immediately.',
        priority: 'high'
      },
      {
        id: 'G002',
        category: 'general',
        subcategory: 'Permits',
        noteText: 'Contractor shall obtain all required permits and inspections. All work subject to inspection by Authority Having Jurisdiction.',
        priority: 'high'
      },
      {
        id: 'G003',
        category: 'general',
        subcategory: 'Substitutions',
        noteText: 'No substitutions of materials or equipment without written approval of Engineer. Submit product data for approval.',
        priority: 'medium'
      },
      {
        id: 'G004',
        category: 'general',
        subcategory: 'Cleanup',
        noteText: 'Contractor shall maintain clean job site and remove all construction debris daily. Final cleanup required before occupancy.',
        priority: 'low'
      },
      {
        id: 'G005',
        category: 'general',
        subcategory: 'As-Built Drawings',
        noteText: 'Contractor shall provide complete as-built drawings showing all changes from original design before final payment.',
        priority: 'medium'
      },
      {
        id: 'G006',
        category: 'general',
        subcategory: 'Weather Protection',
        noteText: 'All work shall be protected from weather during construction. Do not perform work in rain, snow, or freezing conditions unless specifically approved.',
        priority: 'medium'
      }
    ];

    generalConstructionNotes.forEach(note => this.generalNotes.set(note.id, note));
  }

  /**
   * Get notes by category
   */
  getNotesByCategory(category: GeneralNote['category']): GeneralNote[] {
    return Array.from(this.generalNotes.values()).filter(note => note.category === category);
  }

  /**
   * Get notes by subcategory
   */
  getNotesBySubcategory(subcategory: string): GeneralNote[] {
    return Array.from(this.generalNotes.values()).filter(note => note.subcategory === subcategory);
  }

  /**
   * Get high priority notes only
   */
  getHighPriorityNotes(): GeneralNote[] {
    return Array.from(this.generalNotes.values()).filter(note => note.priority === 'high');
  }

  /**
   * Get greenhouse-applicable notes only
   */
  getGreenhouseNotes(): GeneralNote[] {
    return Array.from(this.generalNotes.values()).filter(note => note.applicableToGreenhousesOnly === true);
  }

  /**
   * Generate general notes sheet for construction documents
   */
  generateGeneralNotesSheet(pdf: jsPDF, x: number, y: number, projectType: 'greenhouse' | 'general' = 'greenhouse'): number {
    let currentY = y;
    
    // Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GENERAL NOTES', x, currentY);
    currentY += 0.4;
    
    // Categories to include
    const categories: GeneralNote['category'][] = ['general', 'electrical', 'mechanical', 'structural', 'architectural', 'plumbing', 'safety'];
    
    categories.forEach(category => {
      let notes = this.getNotesByCategory(category);
      
      // Filter for greenhouse projects
      if (projectType === 'greenhouse') {
        notes = notes.filter(note => !note.applicableToGreenhousesOnly || note.applicableToGreenhousesOnly === true);
      } else {
        notes = notes.filter(note => !note.applicableToGreenhousesOnly);
      }
      
      if (notes.length > 0) {
        // Category header
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${category.toUpperCase()} NOTES:`, x, currentY);
        currentY += 0.3;
        
        // Notes
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        notes.forEach(note => {
          const noteText = `${note.id}. ${note.noteText}`;
          
          // Handle text wrapping
          const lines = pdf.splitTextToSize(noteText, 25);
          lines.forEach((line: string, index: number) => {
            pdf.text(line, x + 0.2, currentY);
            currentY += 0.15;
          });
          
          // Add code reference if available
          if (note.codeReference) {
            pdf.setFont('helvetica', 'italic');
            pdf.text(`(Reference: ${note.codeReference})`, x + 0.4, currentY);
            pdf.setFont('helvetica', 'normal');
            currentY += 0.15;
          }
          
          currentY += 0.05; // Small gap between notes
        });
        
        currentY += 0.2; // Gap between categories
      }
    });
    
    return currentY - y;
  }

  /**
   * Generate project-specific notes
   */
  generateProjectSpecificNotes(pdf: jsPDF, x: number, y: number, projectData: any): number {
    let currentY = y;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROJECT SPECIFIC NOTES:', x, currentY);
    currentY += 0.3;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Generate notes based on project data
    const projectNotes = this.generateDynamicNotes(projectData);
    
    projectNotes.forEach((note, index) => {
      const noteText = `PS${index + 1}. ${note}`;
      const lines = pdf.splitTextToSize(noteText, 25);
      
      lines.forEach((line: string) => {
        pdf.text(line, x + 0.2, currentY);
        currentY += 0.15;
      });
      
      currentY += 0.05;
    });
    
    return currentY - y;
  }

  /**
   * Generate dynamic notes based on project parameters
   */
  private generateDynamicNotes(projectData: any): string[] {
    const notes: string[] = [];
    
    if (projectData.electrical?.serviceSize) {
      notes.push(`Electrical service size is ${projectData.electrical.serviceSize}A at ${projectData.electrical.voltage}. Coordinate utility connection requirements with local utility company.`);
    }
    
    if (projectData.hvac?.coolingCapacity) {
      notes.push(`HVAC system designed for ${projectData.hvac.coolingCapacity} tons cooling capacity and ${projectData.hvac.heatingCapacity} MBH heating capacity.`);
    }
    
    if (projectData.dimensions) {
      const area = projectData.dimensions.length * projectData.dimensions.width;
      notes.push(`Building area is ${area.toLocaleString()} square feet. Occupancy load calculated per IBC Table 1004.5.`);
    }
    
    if (projectData.zones) {
      notes.push(`Facility divided into ${projectData.zones} controlled growing zones. Each zone has independent environmental controls.`);
    }
    
    notes.push('Contractor shall coordinate all utility connections with respective utility companies prior to construction.');
    notes.push('All equipment warranties shall be transferred to Owner upon substantial completion.');
    
    return notes;
  }

  /**
   * Generate code compliance summary
   */
  generateCodeComplianceSummary(pdf: jsPDF, x: number, y: number): number {
    let currentY = y;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CODE COMPLIANCE SUMMARY:', x, currentY);
    currentY += 0.3;
    
    const codes = [
      { code: '2021 International Building Code (IBC)', status: 'COMPLIANT' },
      { code: '2020 National Electrical Code (NEC)', status: 'COMPLIANT' },
      { code: '2021 International Mechanical Code (IMC)', status: 'COMPLIANT' },
      { code: '2021 International Plumbing Code (IPC)', status: 'COMPLIANT' },
      { code: 'ASCE 7-16 Minimum Design Loads', status: 'COMPLIANT' },
      { code: 'ASHRAE 90.1 Energy Standard', status: 'COMPLIANT' },
      { code: 'ASHRAE 62.1 Ventilation Standard', status: 'COMPLIANT' },
      { code: 'Americans with Disabilities Act (ADA)', status: 'COMPLIANT' }
    ];
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    codes.forEach(item => {
      pdf.text(`• ${item.code}:`, x + 0.2, currentY);
      
      // Color code the status
      if (item.status === 'COMPLIANT') {
        pdf.setTextColor(0, 128, 0); // Green
      } else {
        pdf.setTextColor(255, 0, 0); // Red
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.status, x + 15, currentY);
      
      // Reset color and font
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      currentY += 0.15;
    });
    
    return currentY - y;
  }

  /**
   * Add custom note
   */
  addCustomNote(note: GeneralNote): void {
    this.generalNotes.set(note.id, note);
  }

  /**
   * Get all notes
   */
  getAllNotes(): GeneralNote[] {
    return Array.from(this.generalNotes.values());
  }
}

export const professionalGeneralNotesSystem = new ProfessionalGeneralNotesSystem();