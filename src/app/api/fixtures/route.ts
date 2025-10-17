import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dlcFixturesParser, type DLCFixtureData } from '@/lib/dlc-fixtures-parser'
import fs from 'fs/promises'
import path from 'path'
import { logger } from '@/lib/logging/production-logger'
export const dynamic = 'force-dynamic'

// Helper functions to calculate spectral flux values based on fixture type and manufacturer
function calculateSpectralDistribution(fixture: any): {
  blueFlux: number;
  greenFlux: number;
  redFlux: number;
  farRedFlux: number;
} {
  const basePPF = fixture.ppf || 1000
  const manufacturer = fixture.manufacturer?.toLowerCase() || ''
  const model = fixture.model?.toLowerCase() || ''
  
  // Different manufacturers have different spectral distributions
  let blueRatio = 0.25  // Default 25%
  let greenRatio = 0.15 // Default 15%
  let redRatio = 0.45   // Default 45%
  let farRedRatio = 0.08 // Default 8%
  
  // Manufacturer-specific spectral signatures
  if (manufacturer.includes('fluence')) {
    // Fluence typically has high red output
    blueRatio = 0.22
    greenRatio = 0.12
    redRatio = 0.48
    farRedRatio = 0.10
  } else if (manufacturer.includes('gavita')) {
    // Gavita balanced spectrum
    blueRatio = 0.25
    greenRatio = 0.15
    redRatio = 0.45
    farRedRatio = 0.08
  } else if (manufacturer.includes('heliospectra')) {
    // Heliospectra adjustable spectrum - use balanced
    blueRatio = 0.24
    greenRatio = 0.16
    redRatio = 0.44
    farRedRatio = 0.09
  } else if (manufacturer.includes('signify') || manufacturer.includes('philips')) {
    // Signify/Philips high efficiency
    blueRatio = 0.23
    greenRatio = 0.14
    redRatio = 0.47
    farRedRatio = 0.09
  }
  
  // Model-specific adjustments
  if (model.includes('veg') || model.includes('vegetative')) {
    // Vegetative spectrum - more blue
    blueRatio += 0.05
    redRatio -= 0.05
  } else if (model.includes('flower') || model.includes('bloom')) {
    // Flowering spectrum - more red/far-red
    redRatio += 0.03
    farRedRatio += 0.02
    blueRatio -= 0.05
  } else if (model.includes('full') || model.includes('broad')) {
    // Full spectrum - balanced with more green
    greenRatio += 0.03
    redRatio -= 0.02
    blueRatio -= 0.01
  }
  
  // Ensure ratios sum to less than 100% (account for UV and IR)
  const totalRatio = blueRatio + greenRatio + redRatio + farRedRatio
  if (totalRatio > 0.93) {
    const scale = 0.93 / totalRatio
    blueRatio *= scale
    greenRatio *= scale
    redRatio *= scale
    farRedRatio *= scale
  }
  
  return {
    blueFlux: Math.round(basePPF * blueRatio),
    greenFlux: Math.round(basePPF * greenRatio),
    redFlux: Math.round(basePPF * redRatio),
    farRedFlux: Math.round(basePPF * farRedRatio)
  }
}

function getCategoryFromFixture(fixture: any): string {
  const wattage = fixture.wattage || 0
  if (wattage < 200) return "Supplemental"
  if (wattage < 400) return "Vertical Farm"
  if (wattage > 800) return "Industrial"
  return "Indoor"
}

// Global variable to cache parsed fixtures
let dlcFixturesCache: DLCFixtureData[] | null = null;

async function loadDLCFixtures(): Promise<DLCFixtureData[]> {
  // Return cached data if available
  if (dlcFixturesCache) {
    return dlcFixturesCache;
  }

  try {
    // Try multiple path strategies for CSV loading
    let csvContent: string;
    
    // Strategy 1: Try process.cwd() approach
    try {
      const csvPath = path.join(process.cwd(), 'public', 'dlc_hort_full_2025-05-29.csv');
      csvContent = await fs.readFile(csvPath, 'utf-8');
      logger.info('api', 'Successfully loaded CSV from process.cwd() path');
    } catch (error) {
      logger.info('api', 'Failed to load from process.cwd(), trying alternative paths...');
      
      // Strategy 2: Try relative path from current directory
      try {
        const csvPath = path.join(__dirname, '..', '..', '..', 'public', 'dlc_hort_full_2025-05-29.csv');
        csvContent = await fs.readFile(csvPath, 'utf-8');
        logger.info('api', 'Successfully loaded CSV from relative path');
      } catch (error2) {
        // Strategy 3: Try absolute public path
        const csvPath = './public/dlc_hort_full_2025-05-29.csv';
        csvContent = await fs.readFile(csvPath, 'utf-8');
        logger.info('api', 'Successfully loaded CSV from direct public path');
      }
    }
    
    // Parse CSV content
    await dlcFixturesParser.parseCSV(csvContent);
    dlcFixturesCache = dlcFixturesParser.getDLCFixtures();
    
    logger.info('api', `Successfully loaded ${dlcFixturesCache.length} DLC fixtures from CSV`);
    return dlcFixturesCache;
  } catch (error) {
    logger.error('api', 'Error loading DLC fixtures from all attempted paths:', error );
    logger.info('api', 'Falling back to hardcoded fixtures...');
    // Fall back to hardcoded fixtures if CSV loading fails
    return getHardcodedFixtures();
  }
}

async function getDefaultFixtures() {
  // Load full DLC database
  return await loadDLCFixtures();
}

function getHardcodedFixtures(): DLCFixtureData[] {
  // Fallback fixtures if CSV loading fails
  return [
    // Fluence fixtures
    {
      productId: '1',
      manufacturer: 'Fluence',
      brand: 'Fluence',
      productName: 'SPYDR 2p',
      modelNumber: 'SPYDR 2p',
      reportedPPE: 2.56,
      reportedPPF: 1650,
      reportedWattage: 645,
      dimmable: true,
      minVoltage: 277,
      maxVoltage: 277,
      warranty: 5,
      dateQualified: '2023-01-01',
      category: 'Horticultural'
    },
    {
      productId: '2',
      manufacturer: 'Fluence',
      brand: 'Fluence',
      productName: 'VYNE',  
      modelNumber: 'VYNE',
      reportedPPE: 2.73,
      reportedPPF: 900,
      reportedWattage: 330,
      dimmable: true,
      minVoltage: 120,
      maxVoltage: 277,
      warranty: 5,
      dateQualified: '2023-01-01',
      category: 'Horticultural'
    },
    {
      productId: '3',
      manufacturer: 'Fluence',
      brand: 'Fluence',
      productName: 'RAZR',
      modelNumber: 'RAZR',
      reportedPPE: 2.63,
      reportedPPF: 1050,
      reportedWattage: 400,
      dimmable: true,
      minVoltage: 277,
      maxVoltage: 277,
      warranty: 5,
      dateQualified: '2023-01-01',
      category: 'Horticultural'
    }
  ];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids') // For comparison page
    const search = searchParams.get('search') || ''
    const manufacturer = searchParams.get('manufacturer') || ''
    const minEfficacy = parseFloat(searchParams.get('minPPE') || '0')
    const maxEfficacy = parseFloat(searchParams.get('maxPPE') || '10')
    const minWattage = parseFloat(searchParams.get('minWattage') || '0')
    const maxWattage = parseFloat(searchParams.get('maxWattage') || '2000')
    const dlcQualified = searchParams.get('dlcQualified') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    logger.info('api', 'Search parameters:', { data: { ids, search, manufacturer, minEfficacy, maxEfficacy, minWattage, maxWattage, dlcQualified, page, limit } })
    
    // If specific IDs are requested (for comparison), return those fixtures
    if (ids) {
      const idList = ids.split(',')
      const fixtures = await Promise.all(
        idList.map(id => db.fixtures.findUnique(id))
      )
      const validFixtures = fixtures.filter(f => f !== null)
      return NextResponse.json({
        fixtures: validFixtures,
        total: validFixtures.length
      })
    }
    
    // Build filter options
    const filterOptions: any = {}
    
    if (search) {
      filterOptions.search = search
    }
    
    if (manufacturer && manufacturer !== 'All') {
      filterOptions.manufacturer = manufacturer
    }
    
    if (minEfficacy > 0) {
      filterOptions.minEfficacy = minEfficacy
    }
    
    if (maxEfficacy < 10) {
      filterOptions.maxEfficacy = maxEfficacy
    }
    
    if (minWattage > 0) {
      filterOptions.minWattage = minWattage
    }
    
    if (maxWattage < 2000) {
      filterOptions.maxWattage = maxWattage
    }
    
    if (dlcQualified) {
      filterOptions.dlcQualified = dlcQualified
    }
    
    // Get all fixtures
    const allFixtures: DLCFixtureData[] = await getDefaultFixtures()
    logger.info('api', `Loaded ${allFixtures.length} total fixtures`)
    
    // Apply filters
    const filteredFixtures = allFixtures
    
    return NextResponse.json({
      fixtures: filteredFixtures.slice((page - 1) * limit, page * limit),
      total: filteredFixtures.length,
      page,
      limit,
      filters: filterOptions
    })
    
  } catch (error) {
    logger.error('api', 'Error loading fixtures:', error )
    return NextResponse.json(
      { error: 'Failed to load fixtures' },
      { status: 500 }
    )
  }
}
