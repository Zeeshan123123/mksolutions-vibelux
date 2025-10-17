import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ProfessionalReportData {
  // Project Overview
  project: {
    name: string;
    number: string;
    date: string;
    client: string;
    location: string;
    designer: string;
    totalValue: number;
    squareFootage: number;
  };

  // Detailed Cost Breakdown (matching Rough Brothers format)
  costBreakdown: {
    structure: { description: string; cost: number; costPerSqFt: number; }[];
    mechanical: { description: string; cost: number; costPerSqFt: number; }[];
    electrical: { description: string; cost: number; costPerSqFt: number; }[];
    irrigation: { description: string; cost: number; costPerSqFt: number; }[];
    controls: { description: string; cost: number; costPerSqFt: number; }[];
    equipment: { description: string; cost: number; costPerSqFt: number; }[];
    services: { description: string; cost: number; costPerSqFt: number; }[];
  };

  // Technical Specifications
  technicalSpecs: {
    structureType: string;
    dimensions: { width: number; length: number; height: number; count: number; };
    glazingType: string;
    ventilationType: string;
    heatingSystem: {
      boilers: { model: string; capacity: string; efficiency: string; quantity: number; }[];
      distribution: string;
      zones: number;
      totalCapacity: string;
    };
    coolingSystem: {
      chillers: { model: string; capacity: string; type: string; quantity: number; }[];
      fanCoils: { model: string; capacity: string; quantity: number; }[];
      zones: number;
      totalCapacity: string;
    };
    irrigationSystem: {
      tanks: { type: string; capacity: string; quantity: number; }[];
      pumps: { type: string; flowRate: string; pressure: string; quantity: number; }[];
      zones: { name: string; area: number; flowRate: string; fixtureCount: number; }[];
      waterTreatment: string[];
    };
    lightingSystem: {
      fixtures: { type: string; wattage: number; quantity: number; zone: string; }[];
      totalLoad: string;
      controlType: string;
      ppfd: { min: number; max: number; avg: number; };
    };
    controlSystem: {
      type: string;
      features: string[];
      ioPoints: number;
      interfaces: string[];
    };
  };

  // Equipment Schedules
  equipmentSchedules: {
    hvac: { tag: string; description: string; location: string; specs: string; }[];
    electrical: { panel: string; voltage: string; phase: number; amperage: number; circuits: number; }[];
    pumps: { tag: string; service: string; flow: string; head: string; hp: number; }[];
    tanks: { tag: string; service: string; capacity: string; material: string; }[];
  };

  // Installation Details
  installationDetails: {
    foundation: string;
    structuralConnections: string;
    mechanicalSupports: string;
    electricalRaceways: string;
    controlWiring: string;
  };

  // Drawings
  drawings: {
    architectural: string[]; // SVG or image data
    mechanical: string[];
    electrical: string[];
    plumbing: string[];
    details: string[];
  };
}

export async function generateProfessionalReport(data: ProfessionalReportData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter'
  });

  // Professional Title Page
  pdf.setFontSize(24);
  pdf.text(data.project.name, 5.5, 2, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text('Commercial Greenhouse Project', 5.5, 2.5, { align: 'center' });
  pdf.text(`Project #${data.project.number}`, 5.5, 3, { align: 'center' });
  
  // Client Info Box
  pdf.setFontSize(12);
  pdf.rect(1, 4, 4, 2);
  pdf.text('CLIENT:', 1.2, 4.3);
  pdf.text(data.project.client, 1.2, 4.6);
  pdf.text(data.project.location, 1.2, 4.9);
  
  // Project Info Box
  pdf.rect(6, 4, 4, 2);
  pdf.text('PROJECT VALUE:', 6.2, 4.3);
  pdf.text(`$${data.project.totalValue.toLocaleString()}`, 6.2, 4.6);
  pdf.text(`${data.project.squareFootage.toLocaleString()} sq ft`, 6.2, 4.9);
  pdf.text(`$${(data.project.totalValue / data.project.squareFootage).toFixed(2)}/sq ft`, 6.2, 5.2);
  
  // Cost Breakdown Page
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text('DETAILED COST BREAKDOWN', 5.5, 0.8, { align: 'center' });
  
  let yPos = 1.5;
  const sections = Object.entries(data.costBreakdown);
  
  pdf.setFontSize(10);
  // Header
  pdf.setFont(undefined, 'bold');
  pdf.text('Description', 0.5, yPos);
  pdf.text('Cost', 7.5, yPos);
  pdf.text('$/sq ft', 9.5, yPos);
  pdf.setFont(undefined, 'normal');
  
  yPos += 0.3;
  
  let totalCost = 0;
  sections.forEach(([section, items]) => {
    if (items.length > 0) {
      pdf.setFont(undefined, 'bold');
      pdf.text(section.toUpperCase(), 0.5, yPos);
      pdf.setFont(undefined, 'normal');
      yPos += 0.2;
      
      items.forEach(item => {
        pdf.text(item.description, 0.7, yPos);
        pdf.text(`$${item.cost.toLocaleString()}`, 7.5, yPos);
        pdf.text(`$${item.costPerSqFt.toFixed(2)}`, 9.5, yPos);
        totalCost += item.cost;
        yPos += 0.2;
      });
      yPos += 0.1;
    }
  });
  
  // Total
  pdf.line(0.5, yPos, 10.5, yPos);
  yPos += 0.2;
  pdf.setFont(undefined, 'bold');
  pdf.text('TOTAL PROJECT COST', 0.5, yPos);
  pdf.text(`$${totalCost.toLocaleString()}`, 7.5, yPos);
  pdf.text(`$${(totalCost / data.project.squareFootage).toFixed(2)}`, 9.5, yPos);
  
  // Technical Specifications Page
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text('TECHNICAL SPECIFICATIONS', 5.5, 0.8, { align: 'center' });
  
  // Structure
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('STRUCTURE', 0.5, 1.5);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text(`Type: ${data.technicalSpecs.structureType}`, 0.7, 1.8);
  pdf.text(`Dimensions: ${data.technicalSpecs.dimensions.width}' x ${data.technicalSpecs.dimensions.length}' x ${data.technicalSpecs.dimensions.height}' (${data.technicalSpecs.dimensions.count} units)`, 0.7, 2.0);
  pdf.text(`Glazing: ${data.technicalSpecs.glazingType}`, 0.7, 2.2);
  pdf.text(`Ventilation: ${data.technicalSpecs.ventilationType}`, 0.7, 2.4);
  
  // HVAC Systems
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('HVAC SYSTEMS', 0.5, 3.0);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  // Heating
  pdf.text('Heating:', 0.7, 3.3);
  data.technicalSpecs.heatingSystem.boilers.forEach((boiler, idx) => {
    pdf.text(`• ${boiler.quantity}x ${boiler.model} - ${boiler.capacity} @ ${boiler.efficiency}`, 1.0, 3.5 + idx * 0.2);
  });
  
  // Cooling
  pdf.text('Cooling:', 0.7, 4.2);
  data.technicalSpecs.coolingSystem.chillers.forEach((chiller, idx) => {
    pdf.text(`• ${chiller.quantity}x ${chiller.model} - ${chiller.capacity}`, 1.0, 4.4 + idx * 0.2);
  });
  
  // Irrigation System
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('IRRIGATION SYSTEM', 5.5, 3.0);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  pdf.text('Water Storage:', 5.7, 3.3);
  data.technicalSpecs.irrigationSystem.tanks.forEach((tank, idx) => {
    pdf.text(`• ${tank.quantity}x ${tank.capacity} ${tank.type}`, 6.0, 3.5 + idx * 0.2);
  });
  
  pdf.text('Irrigation Zones:', 5.7, 4.2);
  data.technicalSpecs.irrigationSystem.zones.forEach((zone, idx) => {
    pdf.text(`• ${zone.name}: ${zone.flowRate} for ${zone.fixtureCount} fixtures`, 6.0, 4.4 + idx * 0.2);
  });
  
  // Add drawings if available
  if (data.drawings.architectural.length > 0) {
    data.drawings.architectural.forEach((drawing, idx) => {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(`ARCHITECTURAL PLAN - SHEET ${idx + 1}`, 5.5, 0.5, { align: 'center' });
      // Add drawing (would need to convert SVG to image or embed)
    });
  }
  
  return pdf.output('blob');
}

// Enhanced report data generator for Lange project
export function generateLangeProfessionalData(): ProfessionalReportData {
  const sqft = 26873;
  
  return {
    project: {
      name: 'Lange Commercial Greenhouse',
      number: '16375-01',
      date: new Date().toLocaleDateString(),
      client: 'Lange Group',
      location: 'Oak Lawn, IL 60453',
      designer: 'Vibelux Industries',
      totalValue: 3097168,
      squareFootage: sqft
    },
    
    costBreakdown: {
      structure: [
        { description: 'Venlo Greenhouse Structure (5 units)', cost: 301921, costPerSqFt: 11.23 },
        { description: 'Gable Ends', cost: 51406, costPerSqFt: 1.91 },
        { description: 'Sidewalls', cost: 49199, costPerSqFt: 1.83 },
        { description: 'Doors & Misc. Framing', cost: 33544, costPerSqFt: 1.25 }
      ],
      mechanical: [
        { description: 'Heating System (Boilers, Pipes, Unit Heaters)', cost: 336515, costPerSqFt: 12.52 },
        { description: 'Cooling System (Chiller, Pipes, Fan Coils)', cost: 879265, costPerSqFt: 32.72 },
        { description: 'Ventilation', cost: 14385, costPerSqFt: 0.54 }
      ],
      electrical: [
        { description: 'Lighting System (987 fixtures)', cost: 408564, costPerSqFt: 15.20 },
        { description: 'Electrical Distribution', cost: 75000, costPerSqFt: 2.79 }
      ],
      irrigation: [
        { description: 'Irrigation Infrastructure', cost: 97413, costPerSqFt: 3.62 },
        { description: 'Water Storage Tanks', cost: 45000, costPerSqFt: 1.67 }
      ],
      controls: [
        { description: 'Environmental Controls (Priva)', cost: 203750, costPerSqFt: 7.58 },
        { description: 'Control Integration', cost: 25000, costPerSqFt: 0.93 }
      ],
      equipment: [
        { description: 'Process Equipment & Benching', cost: 470959, costPerSqFt: 17.53 },
        { description: 'Shade System', cost: 52530, costPerSqFt: 1.95 },
        { description: 'Blackout System', cost: 76694, costPerSqFt: 2.85 }
      ],
      services: [
        { description: 'Project Management', cost: 13000, costPerSqFt: 0.48 },
        { description: 'Drafting & Engineering', cost: 5000, costPerSqFt: 0.19 },
        { description: 'Freight & Delivery', cost: 43050, costPerSqFt: 1.60 }
      ]
    },
    
    technicalSpecs: {
      structureType: 'Gutter Connected Venlo',
      dimensions: { width: 31.5, length: 170.6, height: 18, count: 5 },
      glazingType: 'Diffused tempered glass, 50% haze factor',
      ventilationType: 'Roof vents with rack & pinion, 4 zones',
      heatingSystem: {
        boilers: [
          { model: 'RBI Futera III MB2500', capacity: '2.5M BTU/hr', efficiency: '95%', quantity: 2 }
        ],
        distribution: 'Delta Fin aluminum tube system',
        zones: 16,
        totalCapacity: '5.0M BTU/hr'
      },
      coolingSystem: {
        chillers: [
          { model: 'AWS 290', capacity: '290 tons', type: 'Air-cooled screw', quantity: 1 }
        ],
        fanCoils: [
          { model: 'Sigma Overhead', capacity: '2-ton', quantity: 67 }
        ],
        zones: 5,
        totalCapacity: '290 tons'
      },
      irrigationSystem: {
        tanks: [
          { type: 'Fresh Water', capacity: '7,000 gal', quantity: 1 },
          { type: 'Batch Tank', capacity: '7,000 gal', quantity: 2 },
          { type: 'Batch Tank', capacity: '4,000 gal', quantity: 2 }
        ],
        pumps: [
          { type: 'Submersible', flowRate: '60 GPM', pressure: '20 psi', quantity: 2 },
          { type: 'Submersible', flowRate: '110 GPM', pressure: '20 psi', quantity: 2 }
        ],
        zones: [
          { name: 'Zone 1 - Vegetation', area: 5375, flowRate: '50 GPM', fixtureCount: 147 },
          { name: 'Zone 2 - Flowering', area: 5375, flowRate: '90 GPM', fixtureCount: 210 },
          { name: 'Zone 3 - Flowering', area: 5375, flowRate: '90 GPM', fixtureCount: 210 },
          { name: 'Zone 4 - Flowering', area: 5375, flowRate: '50 GPM', fixtureCount: 210 },
          { name: 'Zone 5 - Flowering', area: 5375, flowRate: '50 GPM', fixtureCount: 210 }
        ],
        waterTreatment: ['Priva Neutralizer', 'Priva NutriJet', 'pH Control', 'EC Control']
      },
      lightingSystem: {
        fixtures: [
          { type: 'GAN Electronic', wattage: 400, quantity: 147, zone: 'Vegetation' },
          { type: 'GAN Electronic', wattage: 630, quantity: 840, zone: 'Flowering' }
        ],
        totalLoad: '591.6 kW',
        controlType: 'Priva integrated with sunrise/sunset simulation',
        ppfd: { min: 400, max: 500, avg: 450 }
      },
      controlSystem: {
        type: 'Priva Connext',
        features: [
          'Climate control',
          'Irrigation management',
          'Energy optimization',
          'Remote monitoring',
          'Data logging'
        ],
        ioPoints: 256,
        interfaces: ['Web', 'Mobile', 'SCADA']
      }
    },
    
    equipmentSchedules: {
      hvac: [
        { tag: 'B-1', description: 'Boiler #1', location: 'Mechanical Room', specs: 'RBI MB2500, 2.5M BTU/hr' },
        { tag: 'B-2', description: 'Boiler #2', location: 'Mechanical Room', specs: 'RBI MB2500, 2.5M BTU/hr' },
        { tag: 'CH-1', description: 'Chiller #1', location: 'Roof', specs: 'AWS 290, 290 tons' },
        { tag: 'FCU-1 to 67', description: 'Fan Coil Units', location: 'Throughout', specs: 'Sigma 2-ton' }
      ],
      electrical: [
        { panel: 'MDP', voltage: '480V', phase: 3, amperage: 2500, circuits: 5 },
        { panel: 'EP-1', voltage: '480V', phase: 3, amperage: 500, circuits: 42 },
        { panel: 'EP-2', voltage: '480V', phase: 3, amperage: 500, circuits: 42 },
        { panel: 'EP-3', voltage: '480V', phase: 3, amperage: 500, circuits: 42 },
        { panel: 'EP-4', voltage: '480V', phase: 3, amperage: 500, circuits: 42 },
        { panel: 'EP-5', voltage: '480V', phase: 3, amperage: 500, circuits: 42 }
      ],
      pumps: [
        { tag: 'P-1', service: 'Batch Tank 2', flow: '60 GPM', head: '46 ft', hp: 2 },
        { tag: 'P-2', service: 'Batch Tank 3', flow: '110 GPM', head: '46 ft', hp: 3 },
        { tag: 'P-3', service: 'Batch Tank 4', flow: '110 GPM', head: '46 ft', hp: 3 },
        { tag: 'P-4', service: 'Batch Tank 5', flow: '60 GPM', head: '46 ft', hp: 2 }
      ],
      tanks: [
        { tag: 'T-1', service: 'Fresh Water', capacity: '7,000 gal', material: 'Polyethylene' },
        { tag: 'T-2', service: 'Batch Tank Zone 1', capacity: '4,000 gal', material: 'Concrete' },
        { tag: 'T-3', service: 'Batch Tank Zone 2-3', capacity: '7,000 gal', material: 'Concrete' },
        { tag: 'T-4', service: 'Batch Tank Zone 4', capacity: '7,000 gal', material: 'Concrete' },
        { tag: 'T-5', service: 'Batch Tank Zone 5', capacity: '4,000 gal', material: 'Concrete' }
      ]
    },
    
    installationDetails: {
      foundation: 'Concrete piers on 13\'-1.5" centers, minimum 42" depth',
      structuralConnections: 'Galvanized steel posts with base plates, bolted connections',
      mechanicalSupports: 'Unistrut framework with seismic bracing',
      electricalRaceways: 'EMT conduit for branch circuits, rigid conduit for feeders',
      controlWiring: 'Shielded twisted pair in dedicated raceways'
    },
    
    drawings: {
      architectural: [], // Would be populated with actual drawing data
      mechanical: [],
      electrical: [],
      plumbing: [],
      details: []
    }
  };
}