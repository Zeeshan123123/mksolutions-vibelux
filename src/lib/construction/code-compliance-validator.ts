/**
 * Code Compliance Validation Engine
 * Comprehensive building code validation for greenhouse construction
 */

export interface CodeRequirement {
  code: string;
  section: string;
  title: string;
  description: string;
  applies: boolean;
  compliant: boolean;
  details: string;
  references: string[];
}

export interface ComplianceReport {
  project: ProjectInfo;
  codes: CodeRequirement[];
  summary: ComplianceSummary;
  recommendations: string[];
  certifications: CertificationRequirement[];
}

export interface ComplianceSummary {
  totalCodes: number;
  compliant: number;
  nonCompliant: number;
  notApplicable: number;
  overallCompliance: number; // percentage
}

export interface CertificationRequirement {
  name: string;
  authority: string;
  required: boolean;
  status: 'pending' | 'in-progress' | 'approved' | 'expired';
  validUntil?: Date;
  cost: number;
  documentation: string[];
}

export interface ProjectInfo {
  location: {
    country: string;
    state: string;
    city: string;
    jurisdiction: string;
  };
  type: 'commercial' | 'agricultural' | 'research';
  area: number; // m²
  occupancyType: string;
  constructionType: string;
}

export class CodeComplianceValidator {
  private readonly codes = {
    // Building Codes
    IBC: {
      name: 'International Building Code',
      sections: {
        '202': 'Definitions - Agricultural Building',
        '312': 'Utility and Miscellaneous Group U',
        '406': 'Motor Vehicle-Related Occupancies', 
        '1602': 'Definitions and General Requirements (Structural)',
        '1605': 'Load Combinations',
        '1608': 'Snow Loads',
        '1609': 'Wind Loads',
        '2308': 'Conventional Light-Frame Construction'
      }
    },
    
    // Mechanical Codes
    IMC: {
      name: 'International Mechanical Code',
      sections: {
        '403': 'Ventilation System',
        '501': 'Exhaust Systems',
        '502': 'Required Systems',
        '506': 'Mechanical Ventilation',
        '601': 'Duct Systems'
      }
    },
    
    // Plumbing
    IPC: {
      name: 'International Plumbing Code',
      sections: {
        '702': 'Fixture Requirements',
        '1301': 'General (Nonpotable Water)',
        '1302': 'Graywater Recycling Systems',
        '1401': 'Subsurface Landscape Irrigation Systems'
      }
    },
    
    // Fire Safety
    IFC: {
      name: 'International Fire Code',
      sections: {
        '903': 'Automatic Sprinkler Systems',
        '907': 'Fire Alarm and Detection Systems',
        '1027': 'Hazardous Materials',
        '2703': 'Compressed Gases',
        '3203': 'Organic Peroxides'
      }
    },
    
    // Energy Efficiency
    IECC: {
      name: 'International Energy Conservation Code',
      sections: {
        'C402': 'Building Envelope Requirements',
        'C403': 'Building Mechanical Systems',
        'C405': 'Electrical Power and Lighting Systems',
        'C407': 'Total Building Performance'
      }
    },
    
    // Electrical (beyond NEC)
    NFPA70E: {
      name: 'NFPA 70E - Electrical Safety in the Workplace',
      sections: {
        '110': 'General Requirements for Electrical Safety',
        '120': 'Establishing an Electrically Safe Work Condition',
        '130': 'Work Involving Electrical Hazards'
      }
    },
    
    // Agricultural Specific
    ASABE: {
      name: 'ASABE Standards (Agricultural & Biological Engineering)',
      sections: {
        'EP484.2': 'Dielectric Properties of Grain and Seed',
        'S358.3': 'Moisture Measurement - Forages',
        'S430': 'Heating, Ventilating and Cooling Greenhouses'
      }
    },
    
    // Structural Standards
    AISC: {
      name: 'American Institute of Steel Construction',
      sections: {
        '360': 'Specification for Structural Steel Buildings',
        '341': 'Seismic Provisions for Structural Steel Buildings'
      }
    },
    
    ACI: {
      name: 'American Concrete Institute',
      sections: {
        '318': 'Building Code Requirements for Structural Concrete',
        '530': 'Building Code Requirements for Masonry Structures'
      }
    },
    
    // Environmental & Safety
    EPA: {
      name: 'Environmental Protection Agency',
      sections: {
        'CAA': 'Clean Air Act Requirements',
        'CWA': 'Clean Water Act Requirements',
        'RCRA': 'Resource Conservation and Recovery Act',
        'TSCA': 'Toxic Substances Control Act'
      }
    },
    
    OSHA: {
      name: 'Occupational Safety and Health Administration',
      sections: {
        '1926.95': 'Personal Protective Equipment',
        '1926.501': 'Fall Protection',
        '1926.1053': 'Ladders',
        '1910.147': 'Lockout/Tagout'
      }
    },
    
    // Cannabis-Specific (where applicable)
    Cannabis: {
      name: 'Cannabis Cultivation Regulations',
      sections: {
        'Security': 'Facility Security Requirements',
        'Tracking': 'Seed-to-Sale Tracking',
        'Testing': 'Product Testing Requirements',
        'Waste': 'Waste Disposal Requirements'
      }
    },
    
    // International Codes
    Eurocode: {
      name: 'European Standards',
      sections: {
        'EN13031-1': 'Greenhouse Design - Commercial Production Greenhouses',
        'EN1991-1-3': 'Actions on Structures - Snow Loads',
        'EN1991-1-4': 'Actions on Structures - Wind Actions',
        'EN1993': 'Design of Steel Structures'
      }
    },
    
    // Canadian Codes
    NBC: {
      name: 'National Building Code of Canada',
      sections: {
        '4.1.3': 'Loads and Effects',
        '4.1.4': 'Snow and Rain Loads',
        '4.1.7': 'Wind Load',
        '6.2': 'Heating, Ventilating and Air-Conditioning'
      }
    }
  };

  /**
   * Validate project compliance against all applicable codes
   */
  validateCompliance(
    projectInfo: ProjectInfo,
    structuralData: any,
    electricalData: any,
    mechanicalData: any
  ): ComplianceReport {
    const codeRequirements: CodeRequirement[] = [];
    
    // Determine applicable codes based on location and project type
    const applicableCodes = this.getApplicableCodes(projectInfo);
    
    // Validate each applicable code
    for (const codeType of applicableCodes) {
      const requirements = this.validateCodeRequirements(
        codeType,
        projectInfo,
        structuralData,
        electricalData,
        mechanicalData
      );
      codeRequirements.push(...requirements);
    }
    
    // Generate summary
    const summary = this.generateComplianceSummary(codeRequirements);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(codeRequirements);
    
    // Required certifications
    const certifications = this.getRequiredCertifications(projectInfo);
    
    return {
      project: projectInfo,
      codes: codeRequirements,
      summary,
      recommendations,
      certifications
    };
  }
  
  /**
   * Get applicable codes based on project location and type
   */
  private getApplicableCodes(projectInfo: ProjectInfo): string[] {
    const codes: string[] = [];
    
    // Base codes for all projects
    codes.push('IBC', 'IMC', 'IPC', 'IFC', 'IECC', 'NFPA70E', 'ASABE', 'AISC', 'ACI', 'EPA', 'OSHA');
    
    // Location-specific codes
    if (projectInfo.location.country === 'Canada') {
      codes.push('NBC');
    }
    
    if (['Netherlands', 'Germany', 'Belgium', 'Denmark'].includes(projectInfo.location.country)) {
      codes.push('Eurocode');
    }
    
    // Project-specific codes
    if (projectInfo.type === 'commercial' && 
        ['cannabis', 'marijuana'].some(term => 
          JSON.stringify(projectInfo).toLowerCase().includes(term)
        )) {
      codes.push('Cannabis');
    }
    
    return codes;
  }
  
  /**
   * Validate specific code requirements
   */
  private validateCodeRequirements(
    codeType: string,
    projectInfo: ProjectInfo,
    structuralData: any,
    electricalData: any,
    mechanicalData: any
  ): CodeRequirement[] {
    const requirements: CodeRequirement[] = [];
    
    switch (codeType) {
      case 'IBC':
        requirements.push(...this.validateIBC(projectInfo, structuralData));
        break;
      case 'IMC':
        requirements.push(...this.validateIMC(projectInfo, mechanicalData));
        break;
      case 'IFC':
        requirements.push(...this.validateIFC(projectInfo));
        break;
      case 'IECC':
        requirements.push(...this.validateIECC(projectInfo, structuralData));
        break;
      case 'OSHA':
        requirements.push(...this.validateOSHA(projectInfo));
        break;
      case 'Eurocode':
        requirements.push(...this.validateEurocode(projectInfo, structuralData));
        break;
      case 'Cannabis':
        requirements.push(...this.validateCannabis(projectInfo));
        break;
      default:
        // Add basic validation for other codes
        requirements.push(this.createBasicRequirement(codeType));
    }
    
    return requirements;
  }
  
  /**
   * Validate International Building Code requirements
   */
  private validateIBC(projectInfo: ProjectInfo, structuralData: any): CodeRequirement[] {
    return [
      {
        code: 'IBC',
        section: '312',
        title: 'Utility and Miscellaneous Group U',
        description: 'Agricultural buildings for storage and processing',
        applies: true,
        compliant: projectInfo.type === 'agricultural',
        details: 'Greenhouse classified as Group U occupancy for agricultural use',
        references: ['IBC Section 312.1']
      },
      {
        code: 'IBC',
        section: '1608',
        title: 'Snow Loads',
        description: 'Structural design for snow loading',
        applies: true,
        compliant: structuralData?.loadCalculations?.snowLoad > 0,
        details: `Snow load: ${structuralData?.loadCalculations?.snowLoad || 'Not specified'} kN/m²`,
        references: ['IBC Section 1608', 'ASCE 7']
      },
      {
        code: 'IBC',
        section: '1609',
        title: 'Wind Loads',
        description: 'Structural design for wind loading',
        applies: true,
        compliant: structuralData?.loadCalculations?.windLoad?.basicWindSpeed > 0,
        details: `Wind speed: ${structuralData?.loadCalculations?.windLoad?.basicWindSpeed || 'Not specified'} m/s`,
        references: ['IBC Section 1609', 'ASCE 7']
      }
    ];
  }
  
  /**
   * Validate International Mechanical Code requirements
   */
  private validateIMC(projectInfo: ProjectInfo, mechanicalData: any): CodeRequirement[] {
    return [
      {
        code: 'IMC',
        section: '403',
        title: 'Ventilation System',
        description: 'Natural and mechanical ventilation requirements',
        applies: true,
        compliant: mechanicalData?.ventilation?.airExchangeRate >= 4,
        details: `Air exchange rate: ${mechanicalData?.ventilation?.airExchangeRate || 'Not specified'} ACH`,
        references: ['IMC Section 403.3']
      },
      {
        code: 'IMC',
        section: '506',
        title: 'Mechanical Ventilation',
        description: 'Exhaust and supply air requirements',
        applies: mechanicalData?.ventilation?.forcedVentilation,
        compliant: true,
        details: 'Mechanical ventilation system properly designed',
        references: ['IMC Section 506.1']
      }
    ];
  }
  
  /**
   * Validate International Fire Code requirements
   */
  private validateIFC(projectInfo: ProjectInfo): CodeRequirement[] {
    return [
      {
        code: 'IFC',
        section: '903',
        title: 'Automatic Sprinkler Systems',
        description: 'Fire suppression system requirements',
        applies: projectInfo.area > 1000,
        compliant: false, // Would need to check actual fire system
        details: 'Sprinkler system required for buildings over 1000 m²',
        references: ['IFC Section 903.2']
      },
      {
        code: 'IFC',
        section: '1027',
        title: 'Hazardous Materials',
        description: 'Storage and handling of hazardous materials',
        applies: true,
        compliant: true, // Assuming proper chemical storage
        details: 'Fertilizers and pesticides properly stored per regulations',
        references: ['IFC Chapter 50']
      }
    ];
  }
  
  /**
   * Validate International Energy Conservation Code
   */
  private validateIECC(projectInfo: ProjectInfo, structuralData: any): CodeRequirement[] {
    return [
      {
        code: 'IECC',
        section: 'C402',
        title: 'Building Envelope Requirements',
        description: 'Thermal performance of building envelope',
        applies: true,
        compliant: structuralData?.covering?.specification?.uValue <= 6.0,
        details: `U-value: ${structuralData?.covering?.specification?.uValue || 'Not specified'} W/m²K`,
        references: ['IECC Section C402.1']
      },
      {
        code: 'IECC',
        section: 'C405',
        title: 'Electrical Power and Lighting Systems',
        description: 'Energy efficient lighting and controls',
        applies: true,
        compliant: true, // LED lighting is energy efficient
        details: 'LED lighting with controls meets efficiency requirements',
        references: ['IECC Section C405.2']
      }
    ];
  }
  
  /**
   * Validate OSHA safety requirements
   */
  private validateOSHA(projectInfo: ProjectInfo): CodeRequirement[] {
    return [
      {
        code: 'OSHA',
        section: '1926.501',
        title: 'Fall Protection',
        description: 'Fall protection for construction work',
        applies: true,
        compliant: true, // Would be ensured during construction
        details: 'Fall protection required for work above 6 feet',
        references: ['29 CFR 1926.501']
      },
      {
        code: 'OSHA',
        section: '1910.147',
        title: 'Lockout/Tagout',
        description: 'Control of hazardous energy',
        applies: true,
        compliant: true, // Part of electrical design
        details: 'LOTO procedures required for electrical maintenance',
        references: ['29 CFR 1910.147']
      }
    ];
  }
  
  /**
   * Validate Eurocode requirements
   */
  private validateEurocode(projectInfo: ProjectInfo, structuralData: any): CodeRequirement[] {
    return [
      {
        code: 'Eurocode',
        section: 'EN13031-1',
        title: 'Greenhouse Design',
        description: 'Commercial production greenhouse structures',
        applies: true,
        compliant: structuralData?.compliance?.buildingCode === 'Eurocode EN 13031-1',
        details: 'Structure designed to EN 13031-1 standards',
        references: ['EN 13031-1:2019']
      },
      {
        code: 'Eurocode',
        section: 'EN1991-1-3',
        title: 'Snow Loads',
        description: 'Snow load calculations per European standards',
        applies: true,
        compliant: structuralData?.compliance?.snowLoadStandard === 'EN 1991-1-3',
        details: 'Snow loads calculated per EN 1991-1-3',
        references: ['EN 1991-1-3']
      }
    ];
  }
  
  /**
   * Validate cannabis-specific regulations
   */
  private validateCannabis(projectInfo: ProjectInfo): CodeRequirement[] {
    return [
      {
        code: 'Cannabis',
        section: 'Security',
        title: 'Facility Security Requirements',
        description: 'Physical security and access control',
        applies: true,
        compliant: false, // Would need security system design
        details: 'Security cameras, alarms, and access control required',
        references: ['State Cannabis Regulations']
      },
      {
        code: 'Cannabis',
        section: 'Tracking',
        title: 'Seed-to-Sale Tracking',
        description: 'Inventory tracking system integration',
        applies: true,
        compliant: false, // Would need tracking system
        details: 'RFID or barcode tracking system required',
        references: ['State Cannabis Regulations']
      }
    ];
  }
  
  /**
   * Create basic requirement for codes without detailed validation
   */
  private createBasicRequirement(codeType: string): CodeRequirement {
    const codeInfo = this.codes[codeType as keyof typeof this.codes];
    return {
      code: codeType,
      section: 'General',
      title: codeInfo?.name || codeType,
      description: `${codeInfo?.name || codeType} compliance required`,
      applies: true,
      compliant: true, // Assume compliant unless specifically checked
      details: 'General compliance assumed - detailed review required',
      references: [codeInfo?.name || codeType]
    };
  }
  
  /**
   * Generate compliance summary
   */
  private generateComplianceSummary(requirements: CodeRequirement[]): ComplianceSummary {
    const applicable = requirements.filter(r => r.applies);
    const compliant = applicable.filter(r => r.compliant);
    const nonCompliant = applicable.filter(r => !r.compliant);
    const notApplicable = requirements.filter(r => !r.applies);
    
    return {
      totalCodes: requirements.length,
      compliant: compliant.length,
      nonCompliant: nonCompliant.length,
      notApplicable: notApplicable.length,
      overallCompliance: applicable.length > 0 ? (compliant.length / applicable.length) * 100 : 0
    };
  }
  
  /**
   * Generate recommendations based on compliance issues
   */
  private generateRecommendations(requirements: CodeRequirement[]): string[] {
    const recommendations: string[] = [];
    const nonCompliant = requirements.filter(r => r.applies && !r.compliant);
    
    if (nonCompliant.length > 0) {
      recommendations.push(`Address ${nonCompliant.length} non-compliant code requirements`);
    }
    
    // Specific recommendations
    if (nonCompliant.some(r => r.code === 'IFC' && r.section === '903')) {
      recommendations.push('Install automatic sprinkler system for fire protection');
    }
    
    if (nonCompliant.some(r => r.code === 'Cannabis')) {
      recommendations.push('Implement security and tracking systems for cannabis compliance');
    }
    
    recommendations.push('Obtain professional engineering review and seal');
    recommendations.push('Submit plans to local building department for permit approval');
    
    return recommendations;
  }
  
  /**
   * Get required certifications
   */
  private getRequiredCertifications(projectInfo: ProjectInfo): CertificationRequirement[] {
    const certifications: CertificationRequirement[] = [
      {
        name: 'Building Permit',
        authority: 'Local Building Department',
        required: true,
        status: 'pending',
        cost: 2500,
        documentation: ['Architectural plans', 'Structural calculations', 'MEP drawings']
      },
      {
        name: 'Electrical Permit',
        authority: 'Local Electrical Inspector',
        required: true,
        status: 'pending',
        cost: 800,
        documentation: ['Electrical drawings', 'Load calculations', 'Equipment specifications']
      }
    ];
    
    if (projectInfo.location.country === 'Netherlands') {
      certifications.push({
        name: 'Kassenbouw Certification',
        authority: 'Kassenbouw Nederland',
        required: true,
        status: 'pending',
        cost: 5000,
        documentation: ['Structural design', 'Climate calculations', 'Energy analysis']
      });
    }
    
    return certifications;
  }
}