import type { FixtureModel } from '@/components/FixtureLibrary';
import { parseIESFile, type ParsedIESFile } from './ies-parser';

export interface DLCFixtureData {
  productId: string;
  manufacturer: string;
  brand: string;
  productName: string;
  modelNumber: string;
  reportedPPE: number; // Photosynthetic Photon Efficacy
  reportedPPF: number; // Photosynthetic Photon Flux
  reportedWattage: number;
  testedPPE?: number;
  testedPPF?: number;
  testedWattage?: number;
  reportedBlueFlux?: number;
  reportedGreenFlux?: number;
  reportedRedFlux?: number;
  reportedFarRedFlux?: number;
  width?: number; // inches
  height?: number; // inches
  length?: number; // inches
  dimmable: boolean;
  minVoltage?: number;
  maxVoltage?: number;
  warranty?: number; // years
  dateQualified: string;
  category: string;
  iesData?: ParsedIESFile; // IES photometric data if available
}

export class DLCFixturesParser {
  private dlcFixtures: DLCFixtureData[] = [];
  private fixtureModels: FixtureModel[] = [];

  async loadFromFile(filePath: string): Promise<void> {
    try {
      const response = await fetch(filePath);
      const csvText = await response.text();
      await this.parseCSV(csvText);
    } catch (error) {
      console.error('Error loading DLC fixtures file:', error);
      throw error;
    }
  }

  async parseCSV(csvText: string): Promise<void> {
    try {
      // Simple CSV parser without external dependencies
      const lines = csvText.split('\n');
      const headers = this.parseCSVLine(lines[0]);
      
      this.dlcFixtures = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCSVLine(lines[i]);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          const fixture = this.parseDLCRow(row);
          if (fixture.productId) {
            this.dlcFixtures.push(fixture);
          }
        }
      }
      
      this.fixtureModels = this.convertToFixtureModels();
    } catch (error) {
      logger.error('api', 'Error parsing CSV:', error );
      throw error;
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result;
  }

  private parseDLCRow(row: any): DLCFixtureData {
    return {
      productId: row['Product ID'] || '',
      manufacturer: row['Manufacturer'] || '',
      brand: row['Brand'] || '',
      productName: row['Product Name'] || '',
      modelNumber: row['Model Number'] || '',
      reportedPPE: parseFloat(row['Reported Photosynthetic Photon Efficacy (400-700nm)']) || 0,
      reportedPPF: parseFloat(row['Reported Photosynthetic Photon Flux (400-700nm)']) || 0,
      reportedWattage: parseFloat(row['Reported Input Wattage']) || 0,
      testedPPE: parseFloat(row['Tested Photosynthetic Photon Efficacy (400-700nm)']) || undefined,
      testedPPF: parseFloat(row['Tested Photosynthetic Photon Flux (400-700nm)']) || undefined,
      testedWattage: parseFloat(row['Tested Input Wattage']) || undefined,
      reportedBlueFlux: parseFloat(row['Reported Photon Flux Blue (400-500nm)']) || undefined,
      reportedGreenFlux: parseFloat(row['Reported Photon Flux Green (500-600nm)']) || undefined,
      reportedRedFlux: parseFloat(row['Reported Photon Flux Red (600-700nm)']) || undefined,
      reportedFarRedFlux: parseFloat(row['Reported Photon Flux Far Red (700-800nm)']) || undefined,
      width: parseFloat(row['Width']) || undefined,
      height: parseFloat(row['Height']) || undefined,
      length: parseFloat(row['Length']) || undefined,
      dimmable: row['Dimmable'] === 'true' || row['Dimmable'] === 'Yes',
      minVoltage: parseFloat(row['Reported Minimum Input Voltage']) || undefined,
      maxVoltage: parseFloat(row['Reported Maximum Input Voltage']) || undefined,
      warranty: parseFloat(row['Warranty']) || undefined,
      dateQualified: row['Date Qualified'] || '',
      category: row['Category'] || 'Horticultural'
    };
  }

  private convertToFixtureModels(): FixtureModel[] {
    return this.dlcFixtures
      .filter(dlc => dlc.reportedPPF > 0 && dlc.reportedWattage > 0)
      .map(dlc => {
        // Calculate spectrum percentages from flux values
        const totalFlux = (dlc.reportedBlueFlux || 0) + 
                         (dlc.reportedGreenFlux || 0) + 
                         (dlc.reportedRedFlux || 0) + 
                         (dlc.reportedFarRedFlux || 0);
        
        let spectrumData = {
          blue: 20,   // Default values if no spectrum data
          green: 10,
          red: 65,
          farRed: 5
        };

        if (totalFlux > 0) {
          spectrumData = {
            blue: Math.round(((dlc.reportedBlueFlux || 0) / totalFlux) * 100),
            green: Math.round(((dlc.reportedGreenFlux || 0) / totalFlux) * 100),
            red: Math.round(((dlc.reportedRedFlux || 0) / totalFlux) * 100),
            farRed: Math.round(((dlc.reportedFarRedFlux || 0) / totalFlux) * 100)
          };
        }

        // Ensure we have dimensions - use DLC data or estimate based on wattage/PPF
        let estimatedWidth = dlc.width;
        let estimatedLength = dlc.length;
        let estimatedHeight = dlc.height;
        
        // If any dimension is missing, estimate based on fixture power
        if (!estimatedWidth || !estimatedLength || !estimatedHeight) {
          const wattage = dlc.testedWattage || dlc.reportedWattage || 0;
          const ppf = dlc.reportedPPF || 0;
          
          if (wattage > 0) {
            // Estimate dimensions based on wattage patterns
            if (wattage < 100) {
              // Small fixtures: 12" x 24" x 3"
              estimatedWidth = estimatedWidth || 12;
              estimatedLength = estimatedLength || 24;
              estimatedHeight = estimatedHeight || 3;
            } else if (wattage < 300) {
              // Medium fixtures: 18" x 36" x 4"
              estimatedWidth = estimatedWidth || 18;
              estimatedLength = estimatedLength || 36;
              estimatedHeight = estimatedHeight || 4;
            } else if (wattage < 600) {
              // Large fixtures: 24" x 48" x 6"
              estimatedWidth = estimatedWidth || 24;
              estimatedLength = estimatedLength || 48;
              estimatedHeight = estimatedHeight || 6;
            } else {
              // Extra large fixtures: 36" x 60" x 8"
              estimatedWidth = estimatedWidth || 36;
              estimatedLength = estimatedLength || 60;
              estimatedHeight = estimatedHeight || 8;
            }
          } else if (ppf > 0) {
            // Fallback estimation based on PPF
            if (ppf < 1000) {
              estimatedWidth = estimatedWidth || 12;
              estimatedLength = estimatedLength || 24;
              estimatedHeight = estimatedHeight || 3;
            } else if (ppf < 2000) {
              estimatedWidth = estimatedWidth || 18;
              estimatedLength = estimatedLength || 36;
              estimatedHeight = estimatedHeight || 4;
            } else if (ppf < 3000) {
              estimatedWidth = estimatedWidth || 24;
              estimatedLength = estimatedLength || 48;
              estimatedHeight = estimatedHeight || 6;
            } else {
              estimatedWidth = estimatedWidth || 36;
              estimatedLength = estimatedLength || 60;
              estimatedHeight = estimatedHeight || 8;
            }
          } else {
            // Ultimate fallback for unknown fixtures
            estimatedWidth = estimatedWidth || 18;
            estimatedLength = estimatedLength || 36;
            estimatedHeight = estimatedHeight || 4;
          }
        }
        
        // Calculate coverage area from final dimensions (convert inches to feet)
        const coverage = (estimatedWidth / 12) * (estimatedLength / 12);

        return {
          id: `dlc-${dlc.productId}`,
          brand: dlc.brand,
          model: dlc.modelNumber,
          category: 'DLC Qualified',
          wattage: dlc.testedWattage || dlc.reportedWattage,
          ppf: dlc.testedPPF || dlc.reportedPPF,
          efficacy: dlc.testedPPE || dlc.reportedPPE,
          spectrum: this.categorizeSpectrum(spectrumData),
          spectrumData,
          coverage,
          price: this.estimatePrice(dlc.reportedWattage),
          voltage: dlc.maxVoltage ? `${dlc.minVoltage || 120}-${dlc.maxVoltage}V` : '120-277V',
          dimmable: dlc.dimmable,
          warranty: dlc.warranty,
          // Convert dimensions from inches to feet for calculations
          length: estimatedLength ? estimatedLength / 12 : undefined,
          beamAngle: this.estimateBeamAngle(estimatedLength, estimatedWidth),
          dlcData: {
            ...dlc,
            // Ensure dimensions are always provided in inches for design tools
            width: estimatedWidth,
            length: estimatedLength,
            height: estimatedHeight
          }
        };
      });
  }

  private categorizeSpectrum(spectrumData: any): string {
    const { blue, red, farRed } = spectrumData;
    
    if (red > 70) return 'Full Spectrum + Far Red';
    if (blue > 25) return 'Vegetative';
    if (red > 60 && farRed > 5) return 'Full Spectrum + Far Red';
    if (red > 60) return 'Flowering';
    return 'Full Spectrum';
  }

  private estimatePrice(wattage: number): number {
    // Rough price estimation based on wattage
    // Professional fixtures typically cost $1.5-3 per watt
    return Math.round(wattage * 2.25);
  }

  private estimateBeamAngle(length?: number, width?: number): number {
    // Estimate beam angle based on fixture form factor
    if (!length || !width) return 120; // Default wide beam
    
    const aspectRatio = length / width;
    
    if (aspectRatio > 3) {
      // Long linear fixtures tend to have wide beam angles (140-160°)
      return 150;
    } else if (aspectRatio > 2) {
      // Medium linear fixtures
      return 140;
    } else if (aspectRatio < 1.5) {
      // Square/round fixtures tend to have narrower beams (90-120°)
      return 100;
    } else {
      // Rectangular fixtures
      return 120;
    }
  }

  getFixtureModels(): FixtureModel[] {
    return this.fixtureModels;
  }

  getDLCFixtures(): DLCFixtureData[] {
    return this.dlcFixtures;
  }

  searchFixtures(query: string): FixtureModel[] {
    const searchTerm = query.toLowerCase();
    return this.fixtureModels.filter(fixture => 
      fixture.brand.toLowerCase().includes(searchTerm) ||
      fixture.model.toLowerCase().includes(searchTerm) ||
      fixture.spectrum.toLowerCase().includes(searchTerm) ||
      fixture.category.toLowerCase().includes(searchTerm)
    );
  }

  getFixtureByWattageRange(minWattage: number, maxWattage: number): FixtureModel[] {
    return this.fixtureModels.filter(fixture => 
      fixture.wattage >= minWattage && fixture.wattage <= maxWattage
    );
  }

  getFixtureByPPFRange(minPPF: number, maxPPF: number): FixtureModel[] {
    return this.fixtureModels.filter(fixture => 
      fixture.ppf >= minPPF && fixture.ppf <= maxPPF
    );
  }

  getTopEfficientFixtures(limit: number = 10): FixtureModel[] {
    return [...this.fixtureModels]
      .sort((a, b) => b.efficacy - a.efficacy)
      .slice(0, limit);
  }

  getBrandList(): string[] {
    const brands = new Set(this.fixtureModels.map(f => f.brand));
    return Array.from(brands).sort();
  }

  // Calculate photometric data for a specific fixture with IES data integration
  calculatePhotometry(fixture: FixtureModel, mountingHeight: number): any {
    const dlcData = (fixture as any).dlcData as DLCFixtureData;
    
    // Use IES data if available for precise photometric calculations
    if (dlcData?.iesData) {
      const iesPhotometry = dlcData.iesData.photometry;
      const area = fixture.coverage || 16; // sq ft
      
      // Calculate PPFD using IES data
      const totalPPF = fixture.ppf || iesPhotometry.totalLumens / 68; // Convert lumens to PPF
      const centerPPFD = this.calculatePPFDFromIES(iesPhotometry, mountingHeight, totalPPF);
      const averagePPFD = centerPPFD * 0.8; // Account for edge falloff
      
      return {
        ppfd: averagePPFD,
        distribution: this.getDistributionFromIES(iesPhotometry.analysis),
        beamAngle: iesPhotometry.beamAngle,
        fieldAngle: iesPhotometry.fieldAngle,
        maxPPFD: centerPPFD,
        uniformity: iesPhotometry.analysis.uniformityRatio,
        spectrumData: fixture.spectrumData,
        iesData: dlcData.iesData,
        photometricType: this.classifyPhotometricType(iesPhotometry.analysis)
      };
    }
    
    if (!dlcData) {
      // Fallback for non-DLC fixtures
      return {
        ppfd: fixture.ppf / (fixture.coverage || 16), // Simple average
        distribution: 'lambertian',
        beamAngle: 120,
        maxPPFD: (fixture.ppf / (fixture.coverage || 16)) * 1.3 // Peak in center
      };
    }

    // Standard DLC fixture calculations without IES data
    const area = fixture.coverage || 16; // sq ft
    const averagePPFD = fixture.ppf / area;
    
    // Estimate beam angle based on fixture dimensions
    const beamAngle = this.estimateBeamAngle(dlcData, mountingHeight);
    
    // Calculate center peak PPFD (typically 1.3-1.5x average for good uniformity)
    const peakFactor = 1.4;
    const maxPPFD = averagePPFD * peakFactor;
    
    return {
      ppfd: averagePPFD,
      distribution: 'gaussian', // Most LED fixtures have gaussian-like distribution
      beamAngle,
      maxPPFD,
      uniformity: 0.7, // Typical for quality fixtures
      spectrumData: fixture.spectrumData
    };
  }

  // Calculate PPFD from IES photometric data
  private calculatePPFDFromIES(iesPhotometry: any, mountingHeight: number, ppf: number): number {
    // Use inverse square law with IES candela distribution
    const centerCandela = iesPhotometry.maxCandela || iesPhotometry.analysis.nadir;
    
    // Convert candela to PPFD for horticultural applications
    // This is a simplified conversion - real calculation requires spectral data
    const distanceSquared = Math.pow(mountingHeight, 2);
    const ppfdFactor = 4.54; // Approximate conversion factor for horticulture lighting
    
    return (centerCandela * ppfdFactor) / distanceSquared;
  }

  // Map IES distribution analysis to standard types
  private getDistributionFromIES(analysis: any): string {
    switch (analysis.distribution) {
      case 'narrow': return 'focused';
      case 'medium': return 'gaussian';
      case 'wide': return 'cosine';
      case 'very-wide': return 'lambertian';
      default: return 'gaussian';
    }
  }

  // Classify photometric type based on IES analysis
  private classifyPhotometricType(analysis: any): string {
    const beamAngle = analysis.beamAngle;
    const uniformity = analysis.uniformityRatio;
    
    if (beamAngle < 40 && uniformity > 0.7) return 'Spot';
    if (beamAngle < 60 && uniformity > 0.6) return 'Flood';
    if (beamAngle < 100 && uniformity > 0.5) return 'Wide Flood';
    if (uniformity > 0.8) return 'High Uniformity';
    return 'General';
  }

  private estimateBeamAngle(dlcData: DLCFixtureData, mountingHeight: number): number {
    // Estimate beam angle based on fixture dimensions and typical optics
    if (dlcData.width && dlcData.length) {
      const avgDimension = (dlcData.width + dlcData.length) / 2 / 12; // Convert to feet
      const coverageRadius = Math.sqrt(16 / Math.PI); // Assume 16 sq ft coverage
      const angle = Math.atan(coverageRadius / mountingHeight) * 2 * (180 / Math.PI);
      return Math.min(120, Math.max(90, angle)); // Clamp between 90-120 degrees
    }
    return 120; // Default wide angle for LED fixtures
  }

  getAllFixtures(): DLCFixtureData[] {
    return this.dlcFixtures;
  }

  getFixtureModels(): FixtureModel[] {
    return this.fixtureModels;
  }

  searchFixtures(query: string): DLCFixtureData[] {
    const searchTerm = query.toLowerCase();
    return this.dlcFixtures.filter(fixture => 
      fixture.manufacturer.toLowerCase().includes(searchTerm) ||
      fixture.brand.toLowerCase().includes(searchTerm) ||
      fixture.productName.toLowerCase().includes(searchTerm) ||
      fixture.modelNumber.toLowerCase().includes(searchTerm)
    );
  }

  getFixturesByEfficiency(minPPE: number = 2.0): DLCFixtureData[] {
    return this.dlcFixtures.filter(fixture => fixture.reportedPPE >= minPPE);
  }

  getFixturesByPowerRange(minWatts: number, maxWatts: number): DLCFixtureData[] {
    return this.dlcFixtures.filter(fixture => 
      fixture.reportedWattage >= minWatts && fixture.reportedWattage <= maxWatts
    );
  }
}

// Singleton instance
export const dlcFixturesParser = new DLCFixturesParser();