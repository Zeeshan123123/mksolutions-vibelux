// DLC Fixtures Search Integration
export interface DLCFixtureData {
  id: string;
  manufacturer: string;
  brand: string;
  productName: string;
  modelNumber: string;
  dlcQualified: boolean;
  category: string;
  wattage: number;
  ppf: number; // Photosynthetic Photon Flux
  efficacy: number;
  spectrum: string;
  mountingType: string;
  dimmable: boolean;
  price?: number;
  dateQualified: string;
  width?: number;
  height?: number;
  length?: number;
  beamAngle?: number;
  fieldAngle?: number;
  lightingScheme?: string;
  controlledEnvironment?: string;
  keywords: string[];
}

// Parse DLC fixture data from CSV format
export function parseDLCFixture(csvRow: any): DLCFixtureData {
  const fixture: DLCFixtureData = {
    id: csvRow['Product ID'] || '',
    manufacturer: csvRow['Manufacturer'] || '',
    brand: csvRow['Brand'] || '',
    productName: csvRow['Product Name'] || '',
    modelNumber: csvRow['Model Number'] || '',
    dlcQualified: csvRow['Qualified Product List'] === 'Horticultural',
    category: csvRow['Category'] || 'Horticultural Lighting Fixture',
    wattage: parseFloat(csvRow['Reported Input Wattage']) || 0,
    ppf: parseFloat(csvRow['Reported Photosynthetic Photon Flux (400-700nm)']) || 0,
    efficacy: parseFloat(csvRow['Reported Photosynthetic Photon Efficacy (400-700nm)']) || 0,
    spectrum: determineSpectrum(csvRow),
    mountingType: determineMountingType(csvRow),
    dimmable: csvRow['Dimmable'] === 'true',
    dateQualified: csvRow['Date Qualified'] || '',
    width: parseFloat(csvRow['Width']) || undefined,
    height: parseFloat(csvRow['Height']) || undefined,
    length: parseFloat(csvRow['Length']) || undefined,
    beamAngle: parseFloat(csvRow['Reported Beam Angle']) || undefined,
    fieldAngle: parseFloat(csvRow['Reported Field Angle']) || undefined,
    lightingScheme: csvRow['Lighting Scheme (Position)'] || '',
    controlledEnvironment: csvRow['Controlled Environment'] || '',
    keywords: generateKeywords(csvRow)
  };

  return fixture;
}

// Determine spectrum type based on flux data
function determineSpectrum(csvRow: any): string {
  const blueFlux = parseFloat(csvRow['Reported Photon Flux Blue (400-500nm)']) || 0;
  const greenFlux = parseFloat(csvRow['Reported Photon Flux Green (500-600nm)']) || 0;
  const redFlux = parseFloat(csvRow['Reported Photon Flux Red (600-700nm)']) || 0;
  const farRedFlux = parseFloat(csvRow['Reported Photon Flux Far Red (700-800nm)']) || 0;
  
  const totalFlux = blueFlux + greenFlux + redFlux;
  
  if (totalFlux === 0) return 'Full Spectrum';
  
  const blueRatio = blueFlux / totalFlux;
  const redRatio = redFlux / totalFlux;
  const farRedRatio = farRedFlux / totalFlux;
  
  if (farRedRatio > 0.05) return 'Full Spectrum + Far Red';
  if (blueRatio > 0.4) return 'Vegetative';
  if (redRatio > 0.6) return 'Flowering';
  return 'Full Spectrum';
}

// Determine mounting type based on lighting scheme
function determineMountingType(csvRow: any): string {
  const lightingScheme = csvRow['Lighting Scheme (Position)'] || '';
  const environment = csvRow['Controlled Environment'] || '';
  
  if (lightingScheme.includes('Top light')) return 'overhead';
  if (lightingScheme.includes('Intra-canopy')) return 'vertical';
  if (environment.includes('Stacked')) return 'rack';
  return 'overhead';
}

// Generate searchable keywords for each fixture
function generateKeywords(csvRow: any): string[] {
  const keywords: string[] = [];
  
  // Basic info
  if (csvRow['Manufacturer']) keywords.push(csvRow['Manufacturer'].toLowerCase());
  if (csvRow['Brand']) keywords.push(csvRow['Brand'].toLowerCase());
  if (csvRow['Product Name']) keywords.push(...csvRow['Product Name'].toLowerCase().split(' '));
  if (csvRow['Model Number']) keywords.push(csvRow['Model Number'].toLowerCase());
  
  // Technical specs
  const wattage = parseFloat(csvRow['Reported Input Wattage']);
  if (wattage > 0) {
    keywords.push(`${wattage}w`, `${wattage}watt`);
    if (wattage < 200) keywords.push('low-power');
    if (wattage > 800) keywords.push('high-power');
  }
  
  const ppf = parseFloat(csvRow['Reported Photosynthetic Photon Flux (400-700nm)']);
  if (ppf > 0) {
    keywords.push(`${ppf}ppf`);
    if (ppf > 2000) keywords.push('high-ppf');
  }
  
  const efficacy = parseFloat(csvRow['Reported Photosynthetic Photon Efficacy (400-700nm)']);
  if (efficacy > 0) {
    keywords.push(`${efficacy}efficacy`);
    if (efficacy > 3.0) keywords.push('high-efficacy');
  }
  
  // Lighting scheme
  const lightingScheme = csvRow['Lighting Scheme (Position)'] || '';
  if (lightingScheme.includes('Top light')) keywords.push('toplighting', 'overhead');
  if (lightingScheme.includes('Intra-canopy')) keywords.push('interlighting', 'vertical');
  
  // Environment
  const environment = csvRow['Controlled Environment'] || '';
  if (environment.includes('Greenhouse')) keywords.push('greenhouse');
  if (environment.includes('Indoor')) keywords.push('indoor');
  if (environment.includes('Stacked')) keywords.push('vertical-farming', 'stacked');
  
  // Use case
  const useCase = csvRow['Lighting Scheme (Use Case)'] || '';
  if (useCase.includes('Sole-Source')) keywords.push('sole-source');
  if (useCase.includes('Supplemental')) keywords.push('supplemental');
  
  // Control features
  if (csvRow['Dimmable'] === 'true') keywords.push('dimmable');
  if (csvRow['Spectrally Tunable'] === 'Yes') keywords.push('tunable', 'spectrum-control');
  
  return [...new Set(keywords)]; // Remove duplicates
}

// Search function for DLC fixtures
export function searchDLCFixtures(fixtures: DLCFixtureData[], query: string): DLCFixtureData[] {
  if (!query.trim()) return fixtures.slice(0, 50); // Return first 50 fixtures for empty query
  
  const searchTerm = query.toLowerCase();
  
  return fixtures.filter(fixture => {
    // Search in basic info
    const basicMatch = (
      fixture.manufacturer.toLowerCase().includes(searchTerm) ||
      fixture.brand.toLowerCase().includes(searchTerm) ||
      fixture.productName.toLowerCase().includes(searchTerm) ||
      fixture.modelNumber.toLowerCase().includes(searchTerm)
    );
    
    // Search in technical specs
    const wattageMatch = searchTerm.includes('w') && fixture.wattage.toString().includes(searchTerm.replace('w', ''));
    const ppfMatch = searchTerm.includes('ppf') && fixture.ppf.toString().includes(searchTerm.replace('ppf', ''));
    const efficacyMatch = searchTerm.includes('efficacy') && fixture.efficacy.toString().includes(searchTerm.replace('efficacy', ''));
    
    // Search in keywords
    const keywordMatch = fixture.keywords.some(keyword => keyword.includes(searchTerm));
    
    return basicMatch || wattageMatch || ppfMatch || efficacyMatch || keywordMatch;
  }).slice(0, 50); // Limit results to 50
}

// Mock data for demonstration (normally would be loaded from CSV)
export const mockDLCFixtures: DLCFixtureData[] = [
  {
    id: 'H-XV5M01',
    manufacturer: 'Fluence Bioengineering',
    brand: 'Fluence',
    productName: 'SPYDR',
    modelNumber: 'SR-2I47-I-HV-S',
    dlcQualified: true,
    category: 'Horticultural Lighting Fixture',
    wattage: 639,
    ppf: 1702,
    efficacy: 2.66,
    spectrum: 'Full Spectrum',
    mountingType: 'overhead',
    dimmable: true,
    dateQualified: '2024-02-28',
    width: 42.8,
    height: 4,
    length: 46.8,
    beamAngle: 120,
    lightingScheme: 'Top light',
    controlledEnvironment: 'Indoor (Non-stacked), Indoor (Stacked)',
    keywords: ['fluence', 'spydr', 'toplighting', 'overhead', 'indoor', 'dimmable', 'high-efficacy']
  },
  {
    id: 'H-CTTPYG',
    manufacturer: 'Signify North America Corporation',
    brand: 'Philips',
    productName: 'GreenPower LED Toplighting Compact',
    modelNumber: 'GPL TLC 1850 DRW_LB',
    dlcQualified: true,
    category: 'Horticultural Lighting Fixture',
    wattage: 510,
    ppf: 1850,
    efficacy: 3.63,
    spectrum: 'Full Spectrum',
    mountingType: 'overhead',
    dimmable: true,
    dateQualified: '2024-07-31',
    width: 9.4,
    height: 3.5,
    length: 28.8,
    lightingScheme: 'Top light',
    controlledEnvironment: 'Indoor (Non-stacked), Indoor (Stacked), Greenhouse',
    keywords: ['signify', 'philips', 'greenpower', 'toplighting', 'compact', 'overhead', 'greenhouse', 'indoor', 'dimmable', 'high-efficacy']
  },
  {
    id: 'H-35VC7N',
    manufacturer: 'Thrive Agritech',
    brand: 'Thrive Agritech',
    productName: 'Pinnacle HP',
    modelNumber: 'PCL-840W-FS2',
    dlcQualified: true,
    category: 'Horticultural Lighting Fixture',
    wattage: 877,
    ppf: 2123,
    efficacy: 2.42,
    spectrum: 'Full Spectrum',
    mountingType: 'overhead',
    dimmable: true,
    dateQualified: '2024-08-08',
    width: 8,
    height: 4.4,
    length: 43.2,
    lightingScheme: 'Top light',
    controlledEnvironment: 'Indoor (Non-stacked), Indoor (Stacked), Greenhouse',
    keywords: ['thrive', 'pinnacle', 'hp', 'toplighting', 'overhead', 'greenhouse', 'indoor', 'dimmable', 'high-power']
  }
];

// Get top manufacturers
export function getTopManufacturers(fixtures: DLCFixtureData[]): string[] {
  const manufacturers = fixtures.map(f => f.manufacturer);
  const counts = manufacturers.reduce((acc, manufacturer) => {
    acc[manufacturer] = (acc[manufacturer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([manufacturer]) => manufacturer);
}