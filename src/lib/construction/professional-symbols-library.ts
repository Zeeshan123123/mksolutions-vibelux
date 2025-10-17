/**
 * Professional Symbols & Abbreviations Library
 * Comprehensive database of MEP symbols and abbreviations for construction documents
 * Compliant with industry standards (CSI, NEC, ASHRAE, etc.)
 */

import { jsPDF } from 'jspdf';

export interface Symbol {
  id: string;
  category: 'electrical' | 'mechanical' | 'structural' | 'architectural' | 'plumbing';
  name: string;
  description: string;
  scale: number;
  lineWeight: number;
  drawingFunction: (pdf: jsPDF, x: number, y: number, rotation?: number) => void;
}

export interface Abbreviation {
  abbreviation: string;
  fullText: string;
  category: 'electrical' | 'mechanical' | 'structural' | 'architectural' | 'plumbing' | 'general';
  description?: string;
}

export class ProfessionalSymbolsLibrary {
  private symbols: Map<string, Symbol> = new Map();
  private abbreviations: Map<string, Abbreviation> = new Map();

  constructor() {
    this.initializeElectricalSymbols();
    this.initializeMechanicalSymbols();
    this.initializeStructuralSymbols();
    this.initializeArchitecturalSymbols();
    this.initializePlumbingSymbols();
    this.initializeAbbreviations();
  }

  /**
   * Initialize electrical symbols
   */
  private initializeElectricalSymbols(): void {
    // Lighting fixtures
    this.addSymbol({
      id: 'led-fixture-630w',
      category: 'electrical',
      name: 'LED Fixture 630W',
      description: 'LED grow light fixture, 630W, full spectrum',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.rect(x - 0.15, y - 0.08, 0.3, 0.16);
        pdf.setFontSize(4);
        pdf.text('LED', x, y + 0.02, { align: 'center' });
        pdf.text('630W', x, y - 0.02, { align: 'center' });
      }
    });

    this.addSymbol({
      id: 'hps-fixture-1000w',
      category: 'electrical',
      name: 'HPS Fixture 1000W',
      description: 'High pressure sodium fixture, 1000W',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.circle(x, y, 0.12);
        pdf.setFontSize(4);
        pdf.text('HPS', x, y + 0.02, { align: 'center' });
        pdf.text('1000W', x, y - 0.02, { align: 'center' });
      }
    });

    // Electrical panels
    this.addSymbol({
      id: 'lighting-panel',
      category: 'electrical',
      name: 'Lighting Panel',
      description: 'Lighting distribution panel',
      scale: 1.0,
      lineWeight: 0.015,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.015);
        pdf.rect(x - 0.2, y - 0.3, 0.4, 0.6);
        pdf.line(x - 0.15, y - 0.2, x + 0.15, y - 0.2);
        pdf.line(x - 0.15, y, x + 0.15, y);
        pdf.line(x - 0.15, y + 0.2, x + 0.15, y + 0.2);
        pdf.setFontSize(6);
        pdf.text('LP', x, y, { align: 'center' });
      }
    });

    this.addSymbol({
      id: 'distribution-panel',
      category: 'electrical',
      name: 'Distribution Panel',
      description: 'Main distribution panel',
      scale: 1.0,
      lineWeight: 0.02,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.02);
        pdf.rect(x - 0.25, y - 0.4, 0.5, 0.8);
        pdf.line(x - 0.2, y - 0.3, x + 0.2, y - 0.3);
        pdf.line(x - 0.2, y - 0.1, x + 0.2, y - 0.1);
        pdf.line(x - 0.2, y + 0.1, x + 0.2, y + 0.1);
        pdf.line(x - 0.2, y + 0.3, x + 0.2, y + 0.3);
        pdf.setFontSize(6);
        pdf.text('DP', x, y, { align: 'center' });
      }
    });

    // Electrical devices
    this.addSymbol({
      id: 'duplex-receptacle',
      category: 'electrical',
      name: 'Duplex Receptacle',
      description: '120V duplex receptacle',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.circle(x, y, 0.08);
        pdf.line(x - 0.03, y - 0.03, x + 0.03, y + 0.03);
        pdf.line(x - 0.03, y + 0.03, x + 0.03, y - 0.03);
      }
    });

    this.addSymbol({
      id: 'gfci-receptacle',
      category: 'electrical',
      name: 'GFCI Receptacle',
      description: 'Ground fault circuit interrupter receptacle',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.circle(x, y, 0.08);
        pdf.line(x - 0.03, y - 0.03, x + 0.03, y + 0.03);
        pdf.line(x - 0.03, y + 0.03, x + 0.03, y - 0.03);
        pdf.setFontSize(3);
        pdf.text('GFI', x, y + 0.12, { align: 'center' });
      }
    });

    // Emergency lighting
    this.addSymbol({
      id: 'emergency-light',
      category: 'electrical',
      name: 'Emergency Light',
      description: 'Battery backup emergency lighting',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.rect(x - 0.1, y - 0.05, 0.2, 0.1);
        pdf.setFontSize(4);
        pdf.text('EM', x, y, { align: 'center' });
      }
    });

    this.addSymbol({
      id: 'exit-sign',
      category: 'electrical',
      name: 'Exit Sign',
      description: 'Illuminated exit sign',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.rect(x - 0.12, y - 0.06, 0.24, 0.12);
        pdf.setFontSize(4);
        pdf.text('EXIT', x, y, { align: 'center' });
      }
    });
  }

  /**
   * Initialize mechanical symbols
   */
  private initializeMechanicalSymbols(): void {
    // HVAC equipment
    this.addSymbol({
      id: 'air-handler',
      category: 'mechanical',
      name: 'Air Handling Unit',
      description: 'Air handling unit with heating/cooling coils',
      scale: 1.0,
      lineWeight: 0.015,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.015);
        pdf.rect(x - 0.4, y - 0.2, 0.8, 0.4);
        pdf.line(x - 0.3, y - 0.15, x - 0.1, y - 0.15);
        pdf.line(x + 0.1, y - 0.15, x + 0.3, y - 0.15);
        pdf.line(x - 0.3, y + 0.15, x - 0.1, y + 0.15);
        pdf.line(x + 0.1, y + 0.15, x + 0.3, y + 0.15);
        pdf.setFontSize(6);
        pdf.text('AHU', x, y, { align: 'center' });
      }
    });

    this.addSymbol({
      id: 'chiller',
      category: 'mechanical',
      name: 'Chiller',
      description: 'Water-cooled chiller unit',
      scale: 1.0,
      lineWeight: 0.02,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.02);
        pdf.rect(x - 0.5, y - 0.3, 1.0, 0.6);
        pdf.circle(x - 0.2, y, 0.15);
        pdf.circle(x + 0.2, y, 0.15);
        pdf.setFontSize(6);
        pdf.text('CH', x, y + 0.4, { align: 'center' });
      }
    });

    this.addSymbol({
      id: 'fan-coil-unit',
      category: 'mechanical',
      name: 'Fan Coil Unit',
      description: 'Fan coil unit with heating/cooling capacity',
      scale: 1.0,
      lineWeight: 0.015,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.015);
        pdf.rect(x - 0.15, y - 0.15, 0.3, 0.3);
        pdf.circle(x, y, 0.08);
        pdf.setFontSize(4);
        pdf.text('FCU', x, y + 0.02, { align: 'center' });
      }
    });

    // Ductwork symbols
    this.addSymbol({
      id: 'supply-duct',
      category: 'mechanical',
      name: 'Supply Duct',
      description: 'Supply air ductwork',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.setDrawColor(0, 0, 255);
        // This would draw a duct line - actual implementation would be more complex
        pdf.line(x - 0.5, y, x + 0.5, y);
        pdf.setDrawColor(0, 0, 0);
      }
    });

    this.addSymbol({
      id: 'return-duct',
      category: 'mechanical',
      name: 'Return Duct',
      description: 'Return air ductwork',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.setDrawColor(255, 0, 0);
        pdf.line(x - 0.5, y, x + 0.5, y);
        pdf.setDrawColor(0, 0, 0);
      }
    });

    // Diffusers and grilles
    this.addSymbol({
      id: 'supply-diffuser',
      category: 'mechanical',
      name: 'Supply Diffuser',
      description: '4-way supply air diffuser',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.rect(x - 0.08, y - 0.08, 0.16, 0.16);
        pdf.line(x - 0.06, y, x + 0.06, y);
        pdf.line(x, y - 0.06, x, y + 0.06);
      }
    });

    this.addSymbol({
      id: 'return-grille',
      category: 'mechanical',
      name: 'Return Grille',
      description: 'Return air grille',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.rect(x - 0.1, y - 0.08, 0.2, 0.16);
        for (let i = -0.06; i <= 0.06; i += 0.03) {
          pdf.line(x - 0.08, y + i, x + 0.08, y + i);
        }
      }
    });
  }

  /**
   * Initialize structural symbols
   */
  private initializeStructuralSymbols(): void {
    this.addSymbol({
      id: 'steel-column',
      category: 'structural',
      name: 'Steel Column',
      description: 'Structural steel column',
      scale: 1.0,
      lineWeight: 0.02,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.02);
        pdf.setFillColor(0, 0, 0);
        pdf.circle(x, y, 0.1, 'F');
        pdf.setFillColor(255, 255, 255);
      }
    });

    this.addSymbol({
      id: 'steel-beam',
      category: 'structural',
      name: 'Steel Beam',
      description: 'Structural steel beam',
      scale: 1.0,
      lineWeight: 0.015,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.015);
        pdf.setDrawColor(255, 0, 0);
        pdf.line(x - 0.5, y, x + 0.5, y);
        pdf.setDrawColor(0, 0, 0);
      }
    });

    this.addSymbol({
      id: 'foundation',
      category: 'structural',
      name: 'Foundation',
      description: 'Concrete foundation footing',
      scale: 1.0,
      lineWeight: 0.02,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.02);
        pdf.setFillColor(150, 150, 150);
        pdf.rect(x - 0.2, y - 0.2, 0.4, 0.4, 'F');
        pdf.setFillColor(255, 255, 255);
      }
    });
  }

  /**
   * Initialize architectural symbols
   */
  private initializeArchitecturalSymbols(): void {
    this.addSymbol({
      id: 'door-single',
      category: 'architectural',
      name: 'Single Door',
      description: 'Single leaf door',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.line(x - 0.15, y, x + 0.15, y);
        pdf.arc(x - 0.15, y, 0.3, 0, Math.PI/2);
      }
    });

    this.addSymbol({
      id: 'window',
      category: 'architectural',
      name: 'Window',
      description: 'Fixed window',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.rect(x - 0.2, y - 0.05, 0.4, 0.1);
        pdf.line(x, y - 0.05, x, y + 0.05);
      }
    });
  }

  /**
   * Initialize plumbing symbols
   */
  private initializePlumbingSymbols(): void {
    this.addSymbol({
      id: 'floor-drain',
      category: 'plumbing',
      name: 'Floor Drain',
      description: 'Floor drain with trap',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.circle(x, y, 0.06);
        pdf.line(x - 0.04, y - 0.04, x + 0.04, y + 0.04);
        pdf.line(x - 0.04, y + 0.04, x + 0.04, y - 0.04);
        pdf.setFontSize(3);
        pdf.text('FD', x, y + 0.1, { align: 'center' });
      }
    });

    this.addSymbol({
      id: 'water-meter',
      category: 'plumbing',
      name: 'Water Meter',
      description: 'Water service meter',
      scale: 1.0,
      lineWeight: 0.01,
      drawingFunction: (pdf: jsPDF, x: number, y: number, rotation = 0) => {
        pdf.setLineWidth(0.01);
        pdf.circle(x, y, 0.08);
        pdf.setFontSize(4);
        pdf.text('WM', x, y, { align: 'center' });
      }
    });
  }

  /**
   * Initialize comprehensive abbreviations
   */
  private initializeAbbreviations(): void {
    // Electrical abbreviations
    const electricalAbbrevs: Abbreviation[] = [
      { abbreviation: 'A', fullText: 'Ampere', category: 'electrical' },
      { abbreviation: 'AC', fullText: 'Alternating Current', category: 'electrical' },
      { abbreviation: 'AFF', fullText: 'Above Finished Floor', category: 'electrical' },
      { abbreviation: 'AHJ', fullText: 'Authority Having Jurisdiction', category: 'electrical' },
      { abbreviation: 'ANSI', fullText: 'American National Standards Institute', category: 'electrical' },
      { abbreviation: 'AWG', fullText: 'American Wire Gauge', category: 'electrical' },
      { abbreviation: 'BRK', fullText: 'Breaker', category: 'electrical' },
      { abbreviation: 'CB', fullText: 'Circuit Breaker', category: 'electrical' },
      { abbreviation: 'CKT', fullText: 'Circuit', category: 'electrical' },
      { abbreviation: 'CT', fullText: 'Current Transformer', category: 'electrical' },
      { abbreviation: 'DC', fullText: 'Direct Current', category: 'electrical' },
      { abbreviation: 'DP', fullText: 'Distribution Panel', category: 'electrical' },
      { abbreviation: 'EGC', fullText: 'Equipment Grounding Conductor', category: 'electrical' },
      { abbreviation: 'EM', fullText: 'Emergency', category: 'electrical' },
      { abbreviation: 'EMT', fullText: 'Electrical Metallic Tubing', category: 'electrical' },
      { abbreviation: 'FC', fullText: 'Foot Candle', category: 'electrical' },
      { abbreviation: 'GFI', fullText: 'Ground Fault Interrupter', category: 'electrical' },
      { abbreviation: 'GFCI', fullText: 'Ground Fault Circuit Interrupter', category: 'electrical' },
      { abbreviation: 'GND', fullText: 'Ground', category: 'electrical' },
      { abbreviation: 'HP', fullText: 'Horsepower', category: 'electrical' },
      { abbreviation: 'HPS', fullText: 'High Pressure Sodium', category: 'electrical' },
      { abbreviation: 'Hz', fullText: 'Hertz', category: 'electrical' },
      { abbreviation: 'IEEE', fullText: 'Institute of Electrical and Electronics Engineers', category: 'electrical' },
      { abbreviation: 'kVA', fullText: 'Kilovolt Ampere', category: 'electrical' },
      { abbreviation: 'kW', fullText: 'Kilowatt', category: 'electrical' },
      { abbreviation: 'kWh', fullText: 'Kilowatt Hour', category: 'electrical' },
      { abbreviation: 'LED', fullText: 'Light Emitting Diode', category: 'electrical' },
      { abbreviation: 'LP', fullText: 'Lighting Panel', category: 'electrical' },
      { abbreviation: 'MDP', fullText: 'Main Distribution Panel', category: 'electrical' },
      { abbreviation: 'MV', fullText: 'Medium Voltage', category: 'electrical' },
      { abbreviation: 'NEC', fullText: 'National Electrical Code', category: 'electrical' },
      { abbreviation: 'NEMA', fullText: 'National Electrical Manufacturers Association', category: 'electrical' },
      { abbreviation: 'OCPD', fullText: 'Overcurrent Protection Device', category: 'electrical' },
      { abbreviation: 'PF', fullText: 'Power Factor', category: 'electrical' },
      { abbreviation: 'PVC', fullText: 'Polyvinyl Chloride', category: 'electrical' },
      { abbreviation: 'RCPT', fullText: 'Receptacle', category: 'electrical' },
      { abbreviation: 'RMC', fullText: 'Rigid Metal Conduit', category: 'electrical' },
      { abbreviation: 'THHN', fullText: 'Thermoplastic High Heat-Resistant Nylon', category: 'electrical' },
      { abbreviation: 'THWN', fullText: 'Thermoplastic Heat and Water-Resistant Nylon', category: 'electrical' },
      { abbreviation: 'UL', fullText: 'Underwriters Laboratories', category: 'electrical' },
      { abbreviation: 'V', fullText: 'Volt', category: 'electrical' },
      { abbreviation: 'VA', fullText: 'Volt Ampere', category: 'electrical' },
      { abbreviation: 'VD', fullText: 'Voltage Drop', category: 'electrical' },
      { abbreviation: 'W', fullText: 'Watt', category: 'electrical' }
    ];

    // Mechanical abbreviations
    const mechanicalAbbrevs: Abbreviation[] = [
      { abbreviation: 'ACH', fullText: 'Air Changes per Hour', category: 'mechanical' },
      { abbreviation: 'AHU', fullText: 'Air Handling Unit', category: 'mechanical' },
      { abbreviation: 'ASHRAE', fullText: 'American Society of Heating, Refrigerating and Air-Conditioning Engineers', category: 'mechanical' },
      { abbreviation: 'BHP', fullText: 'Brake Horsepower', category: 'mechanical' },
      { abbreviation: 'BTU', fullText: 'British Thermal Unit', category: 'mechanical' },
      { abbreviation: 'CFM', fullText: 'Cubic Feet per Minute', category: 'mechanical' },
      { abbreviation: 'COP', fullText: 'Coefficient of Performance', category: 'mechanical' },
      { abbreviation: 'CW', fullText: 'Chilled Water', category: 'mechanical' },
      { abbreviation: 'CWR', fullText: 'Chilled Water Return', category: 'mechanical' },
      { abbreviation: 'CWS', fullText: 'Chilled Water Supply', category: 'mechanical' },
      { abbreviation: 'DB', fullText: 'Dry Bulb', category: 'mechanical' },
      { abbreviation: 'DDC', fullText: 'Direct Digital Control', category: 'mechanical' },
      { abbreviation: 'DX', fullText: 'Direct Expansion', category: 'mechanical' },
      { abbreviation: 'EA', fullText: 'Exhaust Air', category: 'mechanical' },
      { abbreviation: 'EAT', fullText: 'Entering Air Temperature', category: 'mechanical' },
      { abbreviation: 'EER', fullText: 'Energy Efficiency Ratio', category: 'mechanical' },
      { abbreviation: 'EWT', fullText: 'Entering Water Temperature', category: 'mechanical' },
      { abbreviation: 'FCU', fullText: 'Fan Coil Unit', category: 'mechanical' },
      { abbreviation: 'FPM', fullText: 'Feet per Minute', category: 'mechanical' },
      { abbreviation: 'GPM', fullText: 'Gallons per Minute', category: 'mechanical' },
      { abbreviation: 'HRV', fullText: 'Heat Recovery Ventilator', category: 'mechanical' },
      { abbreviation: 'HW', fullText: 'Hot Water', category: 'mechanical' },
      { abbreviation: 'HWR', fullText: 'Hot Water Return', category: 'mechanical' },
      { abbreviation: 'HWS', fullText: 'Hot Water Supply', category: 'mechanical' },
      { abbreviation: 'HVAC', fullText: 'Heating, Ventilating, and Air Conditioning', category: 'mechanical' },
      { abbreviation: 'LAT', fullText: 'Leaving Air Temperature', category: 'mechanical' },
      { abbreviation: 'LWT', fullText: 'Leaving Water Temperature', category: 'mechanical' },
      { abbreviation: 'MAU', fullText: 'Makeup Air Unit', category: 'mechanical' },
      { abbreviation: 'MBH', fullText: 'Thousand BTU per Hour', category: 'mechanical' },
      { abbreviation: 'OA', fullText: 'Outside Air', category: 'mechanical' },
      { abbreviation: 'OAT', fullText: 'Outside Air Temperature', category: 'mechanical' },
      { abbreviation: 'PSI', fullText: 'Pounds per Square Inch', category: 'mechanical' },
      { abbreviation: 'RA', fullText: 'Return Air', category: 'mechanical' },
      { abbreviation: 'RH', fullText: 'Relative Humidity', category: 'mechanical' },
      { abbreviation: 'RTU', fullText: 'Rooftop Unit', category: 'mechanical' },
      { abbreviation: 'SA', fullText: 'Supply Air', category: 'mechanical' },
      { abbreviation: 'SEER', fullText: 'Seasonal Energy Efficiency Ratio', category: 'mechanical' },
      { abbreviation: 'SF', fullText: 'Supply Fan', category: 'mechanical' },
      { abbreviation: 'SP', fullText: 'Static Pressure', category: 'mechanical' },
      { abbreviation: 'TAB', fullText: 'Testing, Adjusting, and Balancing', category: 'mechanical' },
      { abbreviation: 'TDH', fullText: 'Total Dynamic Head', category: 'mechanical' },
      { abbreviation: 'VAV', fullText: 'Variable Air Volume', category: 'mechanical' },
      { abbreviation: 'VFD', fullText: 'Variable Frequency Drive', category: 'mechanical' },
      { abbreviation: 'WB', fullText: 'Wet Bulb', category: 'mechanical' }
    ];

    // Structural abbreviations
    const structuralAbbrevs: Abbreviation[] = [
      { abbreviation: 'AISC', fullText: 'American Institute of Steel Construction', category: 'structural' },
      { abbreviation: 'ASCE', fullText: 'American Society of Civil Engineers', category: 'structural' },
      { abbreviation: 'ASTM', fullText: 'American Society for Testing and Materials', category: 'structural' },
      { abbreviation: 'AWS', fullText: 'American Welding Society', category: 'structural' },
      { abbreviation: 'CMU', fullText: 'Concrete Masonry Unit', category: 'structural' },
      { abbreviation: 'DL', fullText: 'Dead Load', category: 'structural' },
      { abbreviation: 'EL', fullText: 'Earthquake Load', category: 'structural' },
      { abbreviation: 'EOR', fullText: 'Engineer of Record', category: 'structural' },
      { abbreviation: 'FTG', fullText: 'Footing', category: 'structural' },
      { abbreviation: 'LL', fullText: 'Live Load', category: 'structural' },
      { abbreviation: 'PSF', fullText: 'Pounds per Square Foot', category: 'structural' },
      { abbreviation: 'PSI', fullText: 'Pounds per Square Inch', category: 'structural' },
      { abbreviation: 'SL', fullText: 'Snow Load', category: 'structural' },
      { abbreviation: 'TYP', fullText: 'Typical', category: 'structural' },
      { abbreviation: 'UBC', fullText: 'Uniform Building Code', category: 'structural' },
      { abbreviation: 'WL', fullText: 'Wind Load', category: 'structural' }
    ];

    // General abbreviations
    const generalAbbrevs: Abbreviation[] = [
      { abbreviation: 'ADA', fullText: 'Americans with Disabilities Act', category: 'general' },
      { abbreviation: 'AFF', fullText: 'Above Finished Floor', category: 'general' },
      { abbreviation: 'AGL', fullText: 'Above Ground Level', category: 'general' },
      { abbreviation: 'BOCA', fullText: 'Building Officials and Code Administrators', category: 'general' },
      { abbreviation: 'CL', fullText: 'Centerline', category: 'general' },
      { abbreviation: 'CLR', fullText: 'Clear', category: 'general' },
      { abbreviation: 'COL', fullText: 'Column', category: 'general' },
      { abbreviation: 'CONST', fullText: 'Construction', category: 'general' },
      { abbreviation: 'CONTR', fullText: 'Contractor', category: 'general' },
      { abbreviation: 'DIM', fullText: 'Dimension', category: 'general' },
      { abbreviation: 'DWG', fullText: 'Drawing', category: 'general' },
      { abbreviation: 'ELEV', fullText: 'Elevation', category: 'general' },
      { abbreviation: 'EXIST', fullText: 'Existing', category: 'general' },
      { abbreviation: 'FTG', fullText: 'Footing', category: 'general' },
      { abbreviation: 'GA', fullText: 'Gauge', category: 'general' },
      { abbreviation: 'GC', fullText: 'General Contractor', category: 'general' },
      { abbreviation: 'IBC', fullText: 'International Building Code', category: 'general' },
      { abbreviation: 'ICC', fullText: 'International Code Council', category: 'general' },
      { abbreviation: 'ID', fullText: 'Inside Diameter', category: 'general' },
      { abbreviation: 'MAX', fullText: 'Maximum', category: 'general' },
      { abbreviation: 'MIN', fullText: 'Minimum', category: 'general' },
      { abbreviation: 'NIC', fullText: 'Not in Contract', category: 'general' },
      { abbreviation: 'NTS', fullText: 'Not to Scale', category: 'general' },
      { abbreviation: 'OC', fullText: 'On Center', category: 'general' },
      { abbreviation: 'OD', fullText: 'Outside Diameter', category: 'general' },
      { abbreviation: 'PE', fullText: 'Professional Engineer', category: 'general' },
      { abbreviation: 'PROJ', fullText: 'Project', category: 'general' },
      { abbreviation: 'REQ\'D', fullText: 'Required', category: 'general' },
      { abbreviation: 'SCHED', fullText: 'Schedule', category: 'general' },
      { abbreviation: 'SECT', fullText: 'Section', category: 'general' },
      { abbreviation: 'SPEC', fullText: 'Specification', category: 'general' },
      { abbreviation: 'SQ FT', fullText: 'Square Feet', category: 'general' },
      { abbreviation: 'STD', fullText: 'Standard', category: 'general' },
      { abbreviation: 'THK', fullText: 'Thick', category: 'general' },
      { abbreviation: 'TYP', fullText: 'Typical', category: 'general' },
      { abbreviation: 'UNO', fullText: 'Unless Noted Otherwise', category: 'general' },
      { abbreviation: 'W/', fullText: 'With', category: 'general' },
      { abbreviation: 'W/O', fullText: 'Without', category: 'general' }
    ];

    // Add all abbreviations
    [...electricalAbbrevs, ...mechanicalAbbrevs, ...structuralAbbrevs, ...generalAbbrevs]
      .forEach(abbrev => this.abbreviations.set(abbrev.abbreviation, abbrev));
  }

  /**
   * Add a symbol to the library
   */
  private addSymbol(symbol: Symbol): void {
    this.symbols.set(symbol.id, symbol);
  }

  /**
   * Get symbol by ID
   */
  getSymbol(id: string): Symbol | undefined {
    return this.symbols.get(id);
  }

  /**
   * Get all symbols by category
   */
  getSymbolsByCategory(category: Symbol['category']): Symbol[] {
    return Array.from(this.symbols.values()).filter(symbol => symbol.category === category);
  }

  /**
   * Draw symbol on PDF
   */
  drawSymbol(pdf: jsPDF, symbolId: string, x: number, y: number, rotation: number = 0, scale: number = 1): boolean {
    const symbol = this.getSymbol(symbolId);
    if (!symbol) {
      return false;
    }

    // Save current state
    const currentLineWidth = pdf.getLineWidth();
    
    // Set symbol properties
    pdf.setLineWidth(symbol.lineWeight * scale);
    
    // Apply rotation if needed (simplified - would need transformation matrix for full implementation)
    symbol.drawingFunction(pdf, x, y, rotation);
    
    // Restore state
    pdf.setLineWidth(currentLineWidth);
    
    return true;
  }

  /**
   * Get abbreviation
   */
  getAbbreviation(abbrev: string): Abbreviation | undefined {
    return this.abbreviations.get(abbrev.toUpperCase());
  }

  /**
   * Get all abbreviations by category
   */
  getAbbreviationsByCategory(category: Abbreviation['category']): Abbreviation[] {
    return Array.from(this.abbreviations.values()).filter(abbrev => abbrev.category === category);
  }

  /**
   * Generate symbols legend for drawing
   */
  generateSymbolsLegend(pdf: jsPDF, x: number, y: number, categories: Symbol['category'][]): number {
    let currentY = y;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SYMBOLS LEGEND', x, currentY);
    currentY += 0.3;
    
    categories.forEach(category => {
      const symbols = this.getSymbolsByCategory(category);
      if (symbols.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(category.toUpperCase(), x, currentY);
        currentY += 0.2;
        
        pdf.setFont('helvetica', 'normal');
        symbols.forEach(symbol => {
          // Draw symbol
          this.drawSymbol(pdf, symbol.id, x + 0.3, currentY, 0, 0.5);
          
          // Draw description
          pdf.text(symbol.description, x + 0.8, currentY + 0.02);
          currentY += 0.2;
        });
        currentY += 0.1;
      }
    });
    
    return currentY - y;
  }

  /**
   * Generate abbreviations legend for drawing
   */
  generateAbbreviationsLegend(pdf: jsPDF, x: number, y: number, categories: Abbreviation['category'][]): number {
    let currentY = y;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ABBREVIATIONS', x, currentY);
    currentY += 0.3;
    
    categories.forEach(category => {
      const abbreviations = this.getAbbreviationsByCategory(category);
      if (abbreviations.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(category.toUpperCase(), x, currentY);
        currentY += 0.2;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        
        // Display in columns
        const columnsPerRow = 2;
        let column = 0;
        
        abbreviations.forEach((abbrev, index) => {
          const columnX = x + (column * 4);
          pdf.text(`${abbrev.abbreviation} = ${abbrev.fullText}`, columnX, currentY);
          
          column++;
          if (column >= columnsPerRow) {
            column = 0;
            currentY += 0.15;
          }
        });
        
        if (column > 0) currentY += 0.15;
        currentY += 0.1;
      }
    });
    
    return currentY - y;
  }

  /**
   * Get all symbol IDs
   */
  getAllSymbolIds(): string[] {
    return Array.from(this.symbols.keys());
  }

  /**
   * Get all abbreviation keys
   */
  getAllAbbreviationKeys(): string[] {
    return Array.from(this.abbreviations.keys());
  }
}

export const professionalSymbolsLibrary = new ProfessionalSymbolsLibrary();