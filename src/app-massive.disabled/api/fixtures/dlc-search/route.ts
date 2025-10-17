import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

// This would normally parse the actual DLC CSV file
// For now, we'll use sample data that matches the DLC structure
interface DLCFixture {
  id: string;
  manufacturer: string;
  brand: string;
  productName: string;
  modelNumber: string;
  category: string;
  ppf: number; // Photosynthetic Photon Flux (μmol/s)
  ppe: number; // Photosynthetic Photon Efficacy (μmol/J)
  wattage: number;
  powerFactor: number;
  thd: number; // Total Harmonic Distortion %
  voltage: string;
  dimming: string[];
  spectrallyTunable: boolean;
  warranty: number; // years
  dateQualified: string;
  blueRatio: number;
  greenRatio: number;
  redRatio: number;
  farRedRatio: number;
  reportedBlueFlux?: number;
  reportedGreenFlux?: number;
  reportedRedFlux?: number;
  reportedFarRedFlux?: number;
  width?: number;
  height?: number;
  length?: number;
  price?: number;
}

// Sample DLC fixture data - in production this would be loaded from the CSV
const sampleDLCFixtures: DLCFixture[] = [
  {
    id: 'DLC001',
    manufacturer: 'Fluence Bioengineering',
    brand: 'Fluence',
    productName: 'SPYDR 2i',
    modelNumber: 'SPYDRx PLUS 645W',
    category: 'Indoor',
    ppf: 1700,
    ppe: 2.6,
    wattage: 645,
    powerFactor: 0.95,
    thd: 15,
    voltage: '120-277V',
    dimming: ['0-10V', 'DALI'],
    spectrallyTunable: true,
    warranty: 5,
    dateQualified: '2024-01-15',
    blueRatio: 15,
    greenRatio: 10,
    redRatio: 65,
    farRedRatio: 10,
    reportedBlueFlux: 255,
    reportedGreenFlux: 170,
    reportedRedFlux: 1105,
    reportedFarRedFlux: 170,
    width: 24,
    height: 3,
    length: 24,
    price: 1200
  },
  {
    id: 'DLC002',
    manufacturer: 'Gavita',
    brand: 'Gavita',
    productName: 'Pro 1700e LED',
    modelNumber: 'Pro 1700e',
    category: 'Greenhouse',
    ppf: 4200,
    ppe: 2.5,
    wattage: 1700,
    powerFactor: 0.98,
    thd: 12,
    voltage: '208-277V',
    dimming: ['0-10V'],
    spectrallyTunable: false,
    warranty: 5,
    dateQualified: '2024-02-01',
    blueRatio: 12,
    greenRatio: 8,
    redRatio: 70,
    farRedRatio: 10,
    reportedBlueFlux: 504,
    reportedGreenFlux: 336,
    reportedRedFlux: 2940,
    reportedFarRedFlux: 420,
    width: 48,
    height: 4,
    length: 48,
    price: 2800
  },
  {
    id: 'DLC003',
    manufacturer: 'California Lightworks',
    brand: 'CLW',
    productName: 'MegaDrive',
    modelNumber: 'MD-220W',
    category: 'Vertical Farm',
    ppf: 580,
    ppe: 2.8,
    wattage: 220,
    powerFactor: 0.92,
    thd: 18,
    voltage: '120-240V',
    dimming: ['PWM', 'Wireless'],
    spectrallyTunable: true,
    warranty: 3,
    dateQualified: '2024-03-10',
    blueRatio: 20,
    greenRatio: 15,
    redRatio: 55,
    farRedRatio: 10,
    reportedBlueFlux: 116,
    reportedGreenFlux: 87,
    reportedRedFlux: 319,
    reportedFarRedFlux: 58,
    width: 12,
    height: 2,
    length: 12,
    price: 450
  },
  {
    id: 'DLC004',
    manufacturer: 'Osram',
    brand: 'Osram',
    productName: 'Phytofy RL',
    modelNumber: 'RL 430W',
    category: 'Research',
    ppf: 1100,
    ppe: 2.6,
    wattage: 430,
    powerFactor: 0.94,
    thd: 16,
    voltage: '100-277V',
    dimming: ['0-10V', 'DALI', 'DMX'],
    spectrallyTunable: true,
    warranty: 3,
    dateQualified: '2024-01-20',
    blueRatio: 25,
    greenRatio: 20,
    redRatio: 45,
    farRedRatio: 10,
    reportedBlueFlux: 275,
    reportedGreenFlux: 220,
    reportedRedFlux: 495,
    reportedFarRedFlux: 110,
    width: 18,
    height: 3,
    length: 18,
    price: 850
  },
  {
    id: 'DLC005',
    manufacturer: 'Philips',
    brand: 'Philips',
    productName: 'GreenPower LED',
    modelNumber: 'DR/W 200W',
    category: 'Greenhouse',
    ppf: 500,
    ppe: 2.5,
    wattage: 200,
    powerFactor: 0.96,
    thd: 14,
    voltage: '120-277V',
    dimming: ['0-10V'],
    spectrallyTunable: false,
    warranty: 5,
    dateQualified: '2024-02-15',
    blueRatio: 8,
    greenRatio: 5,
    redRatio: 80,
    farRedRatio: 7,
    reportedBlueFlux: 40,
    reportedGreenFlux: 25,
    reportedRedFlux: 400,
    reportedFarRedFlux: 35,
    width: 14,
    height: 2,
    length: 14,
    price: 320
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'All';
    const manufacturer = searchParams.get('manufacturer') || 'All';
    const minPPE = parseFloat(searchParams.get('minPPE') || '0');
    const maxPPE = parseFloat(searchParams.get('maxPPE') || '10');
    const minPPF = parseFloat(searchParams.get('minPPF') || '0');
    const maxPPF = parseFloat(searchParams.get('maxPPF') || '10000');
    const minWattage = parseFloat(searchParams.get('minWattage') || '0');
    const maxWattage = parseFloat(searchParams.get('maxWattage') || '5000');
    const minPowerFactor = parseFloat(searchParams.get('minPowerFactor') || '0');
    const maxTHD = parseFloat(searchParams.get('maxTHD') || '100');
    const minBlue = parseFloat(searchParams.get('minBlue') || '0');
    const maxBlue = parseFloat(searchParams.get('maxBlue') || '100');
    const minGreen = parseFloat(searchParams.get('minGreen') || '0');
    const maxGreen = parseFloat(searchParams.get('maxGreen') || '100');
    const minRed = parseFloat(searchParams.get('minRed') || '0');
    const maxRed = parseFloat(searchParams.get('maxRed') || '100');
    const minFarRed = parseFloat(searchParams.get('minFarRed') || '0');
    const maxFarRed = parseFloat(searchParams.get('maxFarRed') || '100');
    const spectrallyTunable = searchParams.get('spectrallyTunable');
    const sortBy = searchParams.get('sortBy') || 'ppe';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Filter fixtures
    const filteredFixtures = sampleDLCFixtures.filter(fixture => {
      const matchesSearch = search === '' || 
        fixture.productName.toLowerCase().includes(search.toLowerCase()) ||
        fixture.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        fixture.modelNumber.toLowerCase().includes(search.toLowerCase()) ||
        fixture.brand.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'All' || fixture.category === category;
      const matchesManufacturer = manufacturer === 'All' || fixture.manufacturer === manufacturer;
      
      const matchesPPE = fixture.ppe >= minPPE && fixture.ppe <= maxPPE;
      const matchesPPF = fixture.ppf >= minPPF && fixture.ppf <= maxPPF;
      const matchesWattage = fixture.wattage >= minWattage && fixture.wattage <= maxWattage;
      const matchesPowerFactor = fixture.powerFactor >= minPowerFactor;
      const matchesTHD = fixture.thd <= maxTHD;
      
      const matchesBlue = fixture.blueRatio >= minBlue && fixture.blueRatio <= maxBlue;
      const matchesGreen = fixture.greenRatio >= minGreen && fixture.greenRatio <= maxGreen;
      const matchesRed = fixture.redRatio >= minRed && fixture.redRatio <= maxRed;
      const matchesFarRed = fixture.farRedRatio >= minFarRed && fixture.farRedRatio <= maxFarRed;
      
      const matchesSpectralTunable = spectrallyTunable === null || 
        spectrallyTunable === 'all' ||
        (spectrallyTunable === 'true' && fixture.spectrallyTunable) ||
        (spectrallyTunable === 'false' && !fixture.spectrallyTunable);

      return matchesSearch && matchesCategory && matchesManufacturer && 
             matchesPPE && matchesPPF && matchesWattage && matchesPowerFactor && 
             matchesTHD && matchesBlue && matchesGreen && matchesRed && 
             matchesFarRed && matchesSpectralTunable;
    });

    // Sort fixtures
    filteredFixtures.sort((a, b) => {
      switch (sortBy) {
        case 'ppe':
          return b.ppe - a.ppe;
        case 'ppf':
          return b.ppf - a.ppf;
        case 'wattage':
          return a.wattage - b.wattage;
        case 'powerFactor':
          return b.powerFactor - a.powerFactor;
        case 'thd':
          return a.thd - b.thd;
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'manufacturer':
          return a.manufacturer.localeCompare(b.manufacturer);
        case 'dateQualified':
          return new Date(b.dateQualified).getTime() - new Date(a.dateQualified).getTime();
        default:
          return 0;
      }
    });

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFixtures = filteredFixtures.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: filteredFixtures.length,
      page,
      pages: Math.ceil(filteredFixtures.length / limit),
      limit,
      averagePPE: filteredFixtures.length > 0 ? 
        filteredFixtures.reduce((sum, f) => sum + f.ppe, 0) / filteredFixtures.length : 0,
      maxPPE: filteredFixtures.length > 0 ? Math.max(...filteredFixtures.map(f => f.ppe)) : 0,
      averageWattage: filteredFixtures.length > 0 ? 
        filteredFixtures.reduce((sum, f) => sum + f.wattage, 0) / filteredFixtures.length : 0,
      manufacturerCount: new Set(filteredFixtures.map(f => f.manufacturer)).size,
      categories: Array.from(new Set(filteredFixtures.map(f => f.category))),
      manufacturers: Array.from(new Set(filteredFixtures.map(f => f.manufacturer)))
    };

    logger.info('api', 'DLC search completed', {
      searchTerm: search,
      resultsCount: filteredFixtures.length,
      page,
      sortBy
    });

    return NextResponse.json({
      success: true,
      data: paginatedFixtures,
      stats,
      filters: {
        categories: ['All', 'Indoor', 'Greenhouse', 'Vertical Farm', 'Supplemental', 'Research'],
        manufacturers: ['All', ...Array.from(new Set(sampleDLCFixtures.map(f => f.manufacturer)))],
        voltageOptions: ['All', '120V', '208V', '240V', '277V', '480V', '120-277V', '208-277V'],
        dimmingOptions: ['0-10V', 'DALI', 'PWM', 'Wireless', 'DMX']
      }
    });

  } catch (error) {
    logger.error('api', 'DLC search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search DLC fixtures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fixtureIds, action } = body;

    switch (action) {
      case 'compare':
        const compareFixtures = sampleDLCFixtures.filter(f => fixtureIds.includes(f.id));
        return NextResponse.json({
          success: true,
          data: {
            fixtures: compareFixtures,
            comparison: {
              maxPPE: Math.max(...compareFixtures.map(f => f.ppe)),
              minPPE: Math.min(...compareFixtures.map(f => f.ppe)),
              avgPPE: compareFixtures.reduce((sum, f) => sum + f.ppe, 0) / compareFixtures.length,
              totalWattage: compareFixtures.reduce((sum, f) => sum + f.wattage, 0),
              avgPowerFactor: compareFixtures.reduce((sum, f) => sum + f.powerFactor, 0) / compareFixtures.length
            }
          }
        });

      case 'export':
        // In a real implementation, this would generate a CSV/PDF export
        return NextResponse.json({
          success: true,
          data: {
            downloadUrl: '/api/fixtures/export/' + Date.now(),
            filename: `dlc-fixtures-${Date.now()}.csv`
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'DLC fixtures POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}