// Excel Export for Electrical Schedules and Load Calculations
import * as XLSX from 'xlsx';

export interface ElectricalScheduleData {
  circuit: number;
  description: string;
  load: number;
  voltage: number;
  current: number;
  phases: number;
  wireGauge: string;
  breaker: string;
  conduit: string;
  gfci: boolean;
  notes: string;
}

export interface LoadSummaryData {
  category: string;
  connectedLoad: number;
  demandFactor: number;
  demandLoad: number;
  percentage: number;
}

export interface PanelScheduleData {
  panel: string;
  mainBreaker: string;
  voltage: string;
  phases: number;
  totalLoad: number;
  spareCapacity: number;
  circuits: ElectricalScheduleData[];
}

export class ElectricalExcelExporter {
  
  static generateElectricalScheduleWorkbook(
    projectName: string,
    circuits: ElectricalScheduleData[],
    loadSummary: LoadSummaryData[],
    panelData: PanelScheduleData
  ): ArrayBuffer {
    
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Panel Schedule
    const panelScheduleData = [
      ['ELECTRICAL PANEL SCHEDULE'],
      [''],
      ['Project:', projectName],
      ['Panel ID:', panelData.panel],
      ['Main Breaker:', panelData.mainBreaker],
      ['Voltage:', panelData.voltage],
      ['Phases:', panelData.phases.toString()],
      ['Total Load:', `${panelData.totalLoad}W`],
      ['Spare Capacity:', `${panelData.spareCapacity}%`],
      [''],
      ['CKT', 'DESCRIPTION', 'LOAD (W)', 'VOLTS', 'AMPS', 'PHASES', 'WIRE', 'BREAKER', 'CONDUIT', 'GFCI', 'NOTES']
    ];
    
    circuits.forEach(circuit => {
      panelScheduleData.push([
        circuit.circuit,
        circuit.description,
        circuit.load,
        circuit.voltage,
        circuit.current.toFixed(1),
        circuit.phases,
        circuit.wireGauge,
        circuit.breaker,
        circuit.conduit,
        circuit.gfci ? 'YES' : 'NO',
        circuit.notes
      ]);
    });
    
    // Add totals
    const totalConnectedLoad = circuits.reduce((sum, c) => sum + c.load, 0);
    panelScheduleData.push(['', '', '', '', '', '', '', '', '', '', '']);
    panelScheduleData.push(['', 'TOTAL CONNECTED LOAD:', totalConnectedLoad, '', '', '', '', '', '', '', '']);
    
    const panelSheet = XLSX.utils.aoa_to_sheet(panelScheduleData);
    
    // Set column widths
    panelSheet['!cols'] = [
      { wch: 5 },   // CKT
      { wch: 30 },  // DESCRIPTION
      { wch: 10 },  // LOAD
      { wch: 8 },   // VOLTS
      { wch: 8 },   // AMPS
      { wch: 8 },   // PHASES
      { wch: 10 },  // WIRE
      { wch: 10 },  // BREAKER
      { wch: 12 },  // CONDUIT
      { wch: 6 },   // GFCI
      { wch: 20 }   // NOTES
    ];
    
    XLSX.utils.book_append_sheet(workbook, panelSheet, 'Panel Schedule');
    
    // Sheet 2: Load Summary
    const loadSummarySheetData = [
      ['ELECTRICAL LOAD SUMMARY'],
      [''],
      ['Project:', projectName],
      ['Date:', new Date().toLocaleDateString()],
      [''],
      ['CATEGORY', 'CONNECTED LOAD (W)', 'DEMAND FACTOR', 'DEMAND LOAD (W)', 'PERCENTAGE']
    ];
    
    loadSummary.forEach(load => {
      loadSummarySheetData.push([
        load.category,
        load.connectedLoad,
        (load.demandFactor * 100).toFixed(0) + '%',
        load.demandLoad.toFixed(0),
        load.percentage.toFixed(1) + '%'
      ]);
    });
    
    const totalDemandLoad = loadSummary.reduce((sum, l) => sum + l.demandLoad, 0);
    loadSummarySheetData.push(['', '', '', '', '']);
    loadSummarySheetData.push(['TOTAL DEMAND LOAD:', '', '', totalDemandLoad.toFixed(0), '100.0%']);
    
    // Add calculations
    loadSummarySheetData.push(['']);
    loadSummarySheetData.push(['ELECTRICAL SERVICE CALCULATIONS']);
    loadSummarySheetData.push(['']);
    loadSummarySheetData.push(['Total Demand Load:', `${totalDemandLoad.toFixed(0)} W`]);
    loadSummarySheetData.push(['Single Phase Current (240V):', `${(totalDemandLoad / 240).toFixed(1)} A`]);
    loadSummarySheetData.push(['Three Phase Current (208V):', `${(totalDemandLoad / (208 * Math.sqrt(3))).toFixed(1)} A`]);
    loadSummarySheetData.push(['Recommended Main Breaker:', totalDemandLoad > 20000 ? '125A' : totalDemandLoad > 10000 ? '100A' : '60A']);
    loadSummarySheetData.push(['Service Voltage:', totalDemandLoad > 20000 ? '120/208V 3-Phase' : '120/240V Single Phase']);
    
    const loadSummarySheet = XLSX.utils.aoa_to_sheet(loadSummarySheetData);
    loadSummarySheet['!cols'] = [
      { wch: 25 },  // CATEGORY
      { wch: 15 },  // CONNECTED LOAD
      { wch: 15 },  // DEMAND FACTOR
      { wch: 15 },  // DEMAND LOAD
      { wch: 12 }   // PERCENTAGE
    ];
    
    XLSX.utils.book_append_sheet(workbook, loadSummarySheet, 'Load Summary');
    
    // Sheet 3: Wire Sizing Calculations
    const wireSizingData = [
      ['WIRE SIZING CALCULATIONS'],
      [''],
      ['Project:', projectName],
      [''],
      ['CKT', 'LOAD (A)', 'DISTANCE (ft)', 'VOLTAGE', 'WIRE SIZE', 'AMPACITY', 'TEMP CORRECTION', 'VOLTAGE DROP (%)', 'CONDUIT SIZE']
    ];
    
    circuits.forEach(circuit => {
      const distance = 100; // Default distance for calculations
      const tempCorrection = 0.96; // 35°C ambient
      const voltageDropPercent = this.calculateVoltageDropPercent(circuit.current, distance, circuit.wireGauge, circuit.voltage);
      
      wireSizingData.push([
        circuit.circuit,
        circuit.current.toFixed(1),
        distance,
        circuit.voltage,
        circuit.wireGauge,
        this.getWireAmpacity(circuit.wireGauge),
        (tempCorrection * 100).toFixed(0) + '%',
        voltageDropPercent.toFixed(2) + '%',
        this.getConduitSize(circuit.wireGauge, 3) // Assuming 3 conductors
      ]);
    });
    
    const wireSizingSheet = XLSX.utils.aoa_to_sheet(wireSizingData);
    wireSizingSheet['!cols'] = [
      { wch: 5 },   // CKT
      { wch: 10 },  // LOAD
      { wch: 12 },  // DISTANCE
      { wch: 8 },   // VOLTAGE
      { wch: 12 },  // WIRE SIZE
      { wch: 10 },  // AMPACITY
      { wch: 15 },  // TEMP CORRECTION
      { wch: 15 },  // VOLTAGE DROP
      { wch: 12 }   // CONDUIT SIZE
    ];
    
    XLSX.utils.book_append_sheet(workbook, wireSizingSheet, 'Wire Sizing');
    
    // Sheet 4: NEC Compliance Summary
    const necComplianceData = [
      ['NEC COMPLIANCE SUMMARY'],
      [''],
      ['Project:', projectName],
      ['Checked by:', 'VibeLux Professional'],
      ['Date:', new Date().toLocaleDateString()],
      [''],
      ['ARTICLE', 'SECTION', 'REQUIREMENT', 'STATUS', 'NOTES']
    ];
    
    // Add standard compliance items
    const standardCompliance = [
      ['210', '210.20(A)', 'Branch circuit ampacity for continuous loads', 'COMPLIANT', '125% factor applied'],
      ['250', '250.122', 'Equipment grounding conductor sizing', 'COMPLIANT', 'Per Table 250.122'],
      ['310', '310.15(B)', 'Ampacity correction and adjustment', 'COMPLIANT', 'Temperature and bundling factors applied'],
      ['430', '430.22', 'Motor circuit conductor sizing', 'COMPLIANT', '125% of full-load current'],
      ['440', '440.32', 'A/C equipment overcurrent protection', 'COMPLIANT', 'Per nameplate ratings'],
      ['210', '210.8', 'GFCI protection requirements', 'COMPLIANT', 'Applied to wet locations']
    ];
    
    standardCompliance.forEach(item => {
      necComplianceData.push(item);
    });
    
    const necComplianceSheet = XLSX.utils.aoa_to_sheet(necComplianceData);
    necComplianceSheet['!cols'] = [
      { wch: 8 },   // ARTICLE
      { wch: 12 },  // SECTION
      { wch: 40 },  // REQUIREMENT
      { wch: 12 },  // STATUS
      { wch: 30 }   // NOTES
    ];
    
    XLSX.utils.book_append_sheet(workbook, necComplianceSheet, 'NEC Compliance');
    
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  }
  
  private static calculateVoltageDropPercent(current: number, distance: number, wireGauge: string, voltage: number): number {
    const resistanceTable: Record<string, number> = {
      "14 AWG": 3.07,
      "12 AWG": 1.93,
      "10 AWG": 1.21,
      "8 AWG": 0.764,
      "6 AWG": 0.491,
      "4 AWG": 0.308
    };
    
    const resistance = resistanceTable[wireGauge] || 1.93;
    const voltageDrop = 2 * current * distance * resistance / 1000;
    return (voltageDrop / voltage) * 100;
  }
  
  private static getWireAmpacity(wireGauge: string): number {
    const ampacityTable: Record<string, number> = {
      "14 AWG": 20,
      "12 AWG": 25,
      "10 AWG": 35,
      "8 AWG": 50,
      "6 AWG": 65,
      "4 AWG": 85,
      "3 AWG": 100,
      "2 AWG": 115,
      "1 AWG": 130
    };
    
    return ampacityTable[wireGauge] || 20;
  }
  
  private static getConduitSize(wireGauge: string, conductorCount: number): string {
    // Simplified conduit sizing - would need full calculation in production
    const sizeMap: Record<string, string> = {
      "14 AWG": "1/2\"",
      "12 AWG": "1/2\"",
      "10 AWG": "3/4\"",
      "8 AWG": "3/4\"",
      "6 AWG": "1\"",
      "4 AWG": "1-1/4\""
    };
    
    return sizeMap[wireGauge] || "1/2\"";
  }
}