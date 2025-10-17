import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
export const dynamic = 'force-dynamic'

interface DesignParameters {
  roomWidth: number
  roomLength: number
  roomHeight: number
  targetPPFD: number
  cropType?: string
  mountingHeight?: number
  isRack?: boolean
  tiers?: number
  requestDLC?: boolean
  fixtureType?: string
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rl = await rateLimit(`ai-gendesign:${ip}`, 60, 10 * 60 * 1000)
    if (!rl.ok) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: rateLimitHeaders(rl, 60)
      })
    }
    const body = (await req.json()) as Partial<DesignParameters>

    const width = Math.max(2, Math.min(300, Number(body.roomWidth || 20)))
    const length = Math.max(2, Math.min(300, Number(body.roomLength || 20)))
    const height = Math.max(2, Math.min(60, Number(body.roomHeight || 10)))
    const mountingHeight = Math.max(1, Math.min(height - 1, Number(body.mountingHeight || 3)))
    const targetPPFD = Math.max(50, Math.min(2000, Number(body.targetPPFD || 400)))

    // Simple rule-based layout using a default professional fixture model
    const defaultFixture = {
      brand: 'Vibelux',
      model: 'VBX-Pro-400',
      wattage: 400,
      ppf: 1000,
      beamAngle: 120,
      efficacy: 2.5,
    }

    // Required total PPF to hit target (rough, assumes even distribution)
    const totalPPFRequired = targetPPFD * width * length
    const fixturesNeeded = Math.max(1, Math.ceil(totalPPFRequired / defaultFixture.ppf))

    // Grid layout close to square aspect
    const aspect = width / length
    let cols = Math.max(1, Math.round(Math.sqrt(fixturesNeeded * aspect)))
    let rows = Math.max(1, Math.ceil(fixturesNeeded / cols))
    // Rebalance if we overshoot by a lot
    if (cols * rows - fixturesNeeded > Math.max(2, fixturesNeeded * 0.25)) {
      cols = Math.max(1, cols - 1)
      rows = Math.max(1, Math.ceil(fixturesNeeded / cols))
    }

    const spacingX = width / (cols + 1)
    const spacingY = length / (rows + 1)

    const fixtures = [] as any[]
    let placed = 0
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        if (placed >= fixturesNeeded) break
        fixtures.push({
          id: `fx-${r}-${c}`,
          x: Number((c * spacingX).toFixed(2)),
          y: Number((r * spacingY).toFixed(2)),
          z: mountingHeight,
          rotation: 0,
          width: 4,
          length: 2,
          height: 0.5,
          enabled: true,
          dimmingLevel: 100,
          model: { ...defaultFixture },
        })
        placed++
      }
    }

    const averagePPFD = Math.round((fixtures.length * defaultFixture.ppf) / (width * length))

    const design = {
      room: {
        width,
        length,
        height,
        mountingHeight,
        canopyHeight: Math.max(1, Math.min(height - 1, mountingHeight - 1)),
        targetPPFD,
        targetDLI: Number((targetPPFD * 16 * 0.0036).toFixed(1)),
        reflectances: { ceiling: 0.8, walls: 0.5, floor: 0.2 },
      },
      fixtures,
      summary: {
        fixtureCount: fixtures.length,
        fixtureModel: `${defaultFixture.brand} ${defaultFixture.model}`,
        layout: `${cols}x${rows} grid`,
        expectedPPFD: averagePPFD,
        expectedDLI: Number((averagePPFD * 16 * 0.0036).toFixed(1)),
        totalPower: fixtures.length * defaultFixture.wattage,
        monthlyCost: '$—',
        tiers: body.tiers || 1,
      },
    }

    return NextResponse.json(design)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate design' }, { status: 500 })
  }
}

// Remove duplicate implementation below (kept minimal version above)
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';

// Common fixture recommendations based on room size and PPFD requirements
/* const FIXTURE_DATABASE = {
  small: { // Up to 100 sq ft
    low: { // 100-300 PPFD
      fixtures: [
        { name: 'LED Bar Light 150W', wattage: 150, ppf: 405, efficacy: 2.7, width: 4, length: 0.5 },
        { name: 'Compact Panel 200W', wattage: 200, ppf: 540, efficacy: 2.7, width: 2, length: 2 }
      ]
    },
    medium: { // 300-600 PPFD
      fixtures: [
        { name: 'LED Bar Light 320W', wattage: 320, ppf: 896, efficacy: 2.8, width: 4, length: 0.5 },
        { name: 'Pro Panel 400W', wattage: 400, ppf: 1120, efficacy: 2.8, width: 2, length: 4 }
      ]
    },
    high: { // 600-1000 PPFD
      fixtures: [
        { name: 'High Output Bar 640W', wattage: 640, ppf: 1920, efficacy: 3.0, width: 4, length: 0.5 },
        { name: 'Commercial Panel 800W', wattage: 800, ppf: 2400, efficacy: 3.0, width: 4, length: 4 }
      ]
    }
  },
  medium: { // 100-500 sq ft
    low: {
      fixtures: [
        { name: 'LED Bar Light 320W', wattage: 320, ppf: 896, efficacy: 2.8, width: 4, length: 0.5 },
        { name: 'Standard Panel 400W', wattage: 400, ppf: 1120, efficacy: 2.8, width: 2, length: 4 }
      ]
    },
    medium: {
      fixtures: [
        { name: 'Pro Bar Light 640W', wattage: 640, ppf: 1920, efficacy: 3.0, width: 4, length: 0.5 },
        { name: 'Commercial Panel 600W', wattage: 600, ppf: 1800, efficacy: 3.0, width: 4, length: 4 }
      ]
    },
    high: {
      fixtures: [
        { name: 'High Power Bar 800W', wattage: 800, ppf: 2560, efficacy: 3.2, width: 4, length: 0.5 },
        { name: 'Industrial Panel 1000W', wattage: 1000, ppf: 3200, efficacy: 3.2, width: 4, length: 4 }
      ]
    }
  },
  large: { // 500+ sq ft
    low: {
      fixtures: [
        { name: 'Commercial Bar 640W', wattage: 640, ppf: 1920, efficacy: 3.0, width: 6, length: 0.5 },
        { name: 'Large Panel 600W', wattage: 600, ppf: 1800, efficacy: 3.0, width: 4, length: 4 }
      ]
    },
    medium: {
      fixtures: [
        { name: 'Industrial Bar 800W', wattage: 800, ppf: 2560, efficacy: 3.2, width: 6, length: 0.5 },
        { name: 'Pro Panel 1000W', wattage: 1000, ppf: 3200, efficacy: 3.2, width: 4, length: 4 }
      ]
    },
    high: {
      fixtures: [
        { name: 'Max Output Bar 1000W', wattage: 1000, ppf: 3500, efficacy: 3.5, width: 6, length: 0.5 },
        { name: 'Mega Panel 1200W', wattage: 1200, ppf: 4200, efficacy: 3.5, width: 4, length: 4 }
      ]
    }
  }
} */

interface DesignRequest {
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  targetPPFD: number;
  cropType?: string;
  mountingHeight?: number;
  isRack?: boolean;
  tiers?: number;
  requestDLC?: boolean;
  fixtureType?: string;
}

/* export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: DesignRequest = await request.json()
    const { 
      roomWidth, 
      roomLength, 
      roomHeight = 10, 
      targetPPFD, 
      cropType = 'leafy greens',
      mountingHeight = 2,
      isRack = false,
      tiers = 1
    } = body

    // Calculate room area
    const roomArea = roomWidth * roomLength
    const roomAreaSqM = roomArea * 0.092903 // Convert sq ft to sq m

    // Determine room size category
    let sizeCategory: 'small' | 'medium' | 'large'
    if (roomArea <= 100) sizeCategory = 'small'
    else if (roomArea <= 500) sizeCategory = 'medium'
    else sizeCategory = 'large'

    // Determine PPFD category
    let ppfdCategory: 'low' | 'medium' | 'high'
    if (targetPPFD <= 300) ppfdCategory = 'low'
    else if (targetPPFD <= 600) ppfdCategory = 'medium'
    else ppfdCategory = 'high'

    // Get appropriate fixtures
    const fixtureOptions = FIXTURE_DATABASE[sizeCategory][ppfdCategory].fixtures
    const selectedFixture = fixtureOptions[0] // Use bar lights for better uniformity

    // Calculate required PPF
    const requiredPPF = targetPPFD * roomAreaSqM
    const ppfWithLosses = requiredPPF * 1.15 // Add 15% for wall losses

    // Calculate number of fixtures needed
    let fixturesNeeded = Math.ceil(ppfWithLosses / selectedFixture.ppf)
    
    // For racks, ensure at least 2 fixtures for uniformity on smaller areas
    if (isRack && roomArea <= 50 && fixturesNeeded === 1) {
      fixturesNeeded = 2
    }

    // Calculate optimal layout
    let rows: number, cols: number
    const aspectRatio = roomWidth / roomLength

    if (aspectRatio > 1.5) {
      // Wide room - more columns
      cols = Math.ceil(Math.sqrt(fixturesNeeded * aspectRatio))
      rows = Math.ceil(fixturesNeeded / cols)
    } else if (aspectRatio < 0.67) {
      // Narrow room - more rows
      rows = Math.ceil(Math.sqrt(fixturesNeeded / aspectRatio))
      cols = Math.ceil(fixturesNeeded / rows)
    } else {
      // Square-ish room
      rows = Math.ceil(Math.sqrt(fixturesNeeded))
      cols = Math.ceil(fixturesNeeded / rows)
    }

    // Adjust if we have too many fixtures
    if (rows * cols > fixturesNeeded + 2) {
      if (rows > cols) rows--
      else cols--
    }

    // Calculate spacing
    const rowSpacing = roomLength / (rows + 1)
    const colSpacing = roomWidth / (cols + 1)

    // Generate fixture positions
    const fixtures: any[] = []
    let fixtureCount = 0

    // For multi-tier racks, distribute fixtures across levels
    const levelsToUse = isRack && tiers > 1 ? Math.min(tiers, 3) : 1 // Cap at 3 levels for practical reasons
    const fixturesPerLevel = Math.ceil(fixturesNeeded / levelsToUse)
    
    for (let level = 0; level < levelsToUse; level++) {
      // Recalculate layout for each level
      const levelFixtures = Math.min(fixturesPerLevel, fixturesNeeded - fixtureCount)
      const levelRows = Math.ceil(Math.sqrt(levelFixtures * (roomLength / roomWidth)))
      const levelCols = Math.ceil(levelFixtures / levelRows)
      
      // Calculate spacing for this level
      const levelRowSpacing = roomLength / (levelRows + 1)
      const levelColSpacing = roomWidth / (levelCols + 1)
      
      // Height for each level (assuming 18" between rack levels)
      const levelHeight = isRack ? (level * 1.5) + mountingHeight : roomHeight - mountingHeight
      
      let levelFixtureCount = 0
      for (let row = 0; row < levelRows && fixtureCount < fixturesNeeded && levelFixtureCount < levelFixtures; row++) {
        for (let col = 0; col < levelCols && fixtureCount < fixturesNeeded && levelFixtureCount < levelFixtures; col++) {
          const x = levelColSpacing * (col + 1)
          const y = levelRowSpacing * (row + 1)
          const z = levelHeight

          fixtures.push({
            type: 'fixture',
            x: x,
            y: y,
            z: z,
            rotation: roomWidth > roomLength ? 0 : 90, // Rotate fixtures for optimal coverage
            width: selectedFixture.width,
            length: selectedFixture.length,
            height: 0.5,
            enabled: true,
            customName: levelsToUse > 1 ? `Level ${level + 1} - ${row + 1}x${col + 1}` : undefined,
            model: {
              name: selectedFixture.name,
              wattage: selectedFixture.wattage,
              ppf: selectedFixture.ppf,
              efficacy: selectedFixture.efficacy,
              beamAngle: 120,
              manufacturer: 'DLC Premium',
              spectrum: ppfdCategory === 'high' ? 'Full Spectrum Enhanced Red' : 'Full Spectrum',
              isDLC: true
            },
            dimmingLevel: 100
          })
          fixtureCount++
          levelFixtureCount++
        }
      }
    }

    // Calculate expected results
    const totalPPF = fixturesNeeded * selectedFixture.ppf
    const actualPPFD = Math.round(totalPPF / roomAreaSqM * 0.85) // Account for losses
    const totalPower = fixturesNeeded * selectedFixture.wattage
    const monthlyEnergy = totalPower * 16 * 30 / 1000 // 16h photoperiod, 30 days
    const dli = actualPPFD * 16 * 0.0036

    // Generate design summary
    const design = {
      room: {
        width: roomWidth,
        length: roomLength,
        height: roomHeight,
        workingHeight: isRack ? 0.5 : 2.5,
        ceilingHeight: roomHeight,
        reflectances: {
          ceiling: 80,
          walls: 50,
          floor: 20
        }
      },
      fixtures,
      summary: {
        fixtureModel: selectedFixture.name,
        fixtureCount: fixturesNeeded,
        layout: levelsToUse > 1 
          ? `${fixturesNeeded} fixtures across ${levelsToUse} levels` 
          : `${rows} rows × ${cols} columns`,
        spacing: `${colSpacing.toFixed(1)}' × ${rowSpacing.toFixed(1)}'`,
        mountingHeight: levelsToUse > 1 
          ? `${mountingHeight}' with ${1.5}' between levels` 
          : `${mountingHeight}' above ${isRack ? 'rack' : 'canopy'}`,
        tiers: levelsToUse,
        expectedPPFD: actualPPFD,
        expectedDLI: dli.toFixed(1),
        totalPower: totalPower,
        systemEfficacy: (totalPPF / totalPower).toFixed(2),
        monthlyEnergy: monthlyEnergy.toFixed(0),
        monthlyCost: `$${(monthlyEnergy * 0.12).toFixed(0)}`, // Assuming $0.12/kWh
        uniformityEstimate: fixturesNeeded <= 4 ? '>0.7' : '>0.8'
      },
      recommendations: generateRecommendations(cropType, actualPPFD, dli)
    }

    return NextResponse.json(design)

  } catch (error) {
    logger.error('api', 'Design generation error:', error )
    return NextResponse.json(
      { error: 'Failed to generate design' },
      { status: 500 }
    )
  }
} */

function generateRecommendations(): string[] { return [] }