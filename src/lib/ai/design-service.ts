/**
 * VibeLux AI Design Service
 * Handles AI-assisted MEP design generation and layout optimization with DLC fixture integration
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { DLCFixturesParser, type DLCFixtureData } from '@/lib/dlc-fixtures-parser'

export interface DesignRequest {
  prompt: string
  facilityType: 'greenhouse' | 'vertical_farm' | 'indoor_farm' | 'research_facility'
  dimensions?: {
    width: number
    length: number
    height?: number
  }
  requirements?: {
    lightingType?: 'led' | 'hps' | 'fluorescent'
    growMethod?: 'soil' | 'hydroponic' | 'aeroponic'
    climateControl?: boolean
    automation?: boolean
    // Professional lighting requirements
    targetPPFD?: number
    mountingHeight?: number
    spectrumPreference?: 'high-blue' | 'high-red' | 'full-spectrum' | 'custom'
    uniformityTarget?: number
    efficiencyPriority?: boolean
    cropType?: string
    growthStage?: string
    customSpectrum?: {
      blue?: number    // 400-500nm percentage
      green?: number   // 500-600nm percentage  
      red?: number     // 600-700nm percentage
      farRed?: number  // 700-800nm percentage
    }
    // Multi-tier racking system requirements
    rackingSystem?: {
      enabled: boolean
      tiers: number
      tierHeight: number      // inches between shelves
      shelfDepth: number      // inches depth of each shelf
      aisleWidth: number      // inches between rack rows
      rackWidth: number       // inches width of each rack section
      structuralMaterial: 'steel' | 'aluminum' | 'composite'
      lightingPerTier: boolean // Individual lighting per tier vs top-down
    }
    // Flood bench irrigation system requirements  
    floodBenchSystem?: {
      enabled: boolean
      benchType: 'flood' | 'ebb-flow' | 'drip' | 'misting'
      benchSize: {
        width: number         // feet - standard bench width
        length: number        // feet - standard bench length  
        depth: number         // inches - flood depth
      }
      pumpLocation: {
        distance: number      // feet from benches to pump room
        elevation: number     // feet elevation difference (+ = pump below benches)
      }
      floodCycle: {
        frequency: number     // floods per day
        floodTime: number     // minutes to flood
        drainTime: number     // minutes to drain
        floodDepth: number    // inches of water depth
      }
      systemPressure: number  // PSI required for distribution
      reservoirSize?: number  // gallons (auto-calculated if not provided)
    }
  }
}

export interface DesignComponent {
  id: string
  type: 'fixture' | 'sensor' | 'hvac' | 'irrigation' | 'structure' | 'bench' | 'rack' | 'shelf'
  name: string
  x: number
  y: number
  z?: number
  rotation?: number
  specifications: Record<string, any>
  // Multi-tier specific properties
  tier?: number
  parentRackId?: string
}

export interface DesignLayout {
  id: string
  name: string
  description: string
  components: DesignComponent[]
  dimensions: {
    width: number
    length: number
    height: number
  }
  metadata: {
    totalPower: number
    lightingUniformity: number
    estimatedCost: number
    implementationTime: string
  }
}

export interface DesignComplexity {
  score: number // 1-100
  tier: 'basic' | 'standard' | 'advanced' | 'enterprise'
  componentCount: number
  systemCount: number
  automationLevel: 'manual' | 'semi-auto' | 'fully-auto'
  estimatedCredits: number
}

class AIDesignService {
  private bedrockClient: BedrockRuntimeClient | null = null
  private modelId = 'us.anthropic.claude-4-opus-20250514' // Claude 4 for advanced design
  private dlcParser: DLCFixturesParser = new DLCFixturesParser()
  private dlcFixtures: DLCFixtureData[] = []

  constructor() {
    this.initializeClient()
    this.loadDLCFixtures()
  }

  private initializeClient() {
    const awsConfig = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    }

    // Only initialize if we have credentials
    if (awsConfig.credentials.accessKeyId && awsConfig.credentials.secretAccessKey) {
      this.bedrockClient = new BedrockRuntimeClient(awsConfig)
    }
  }

  private async loadDLCFixtures() {
    try {
      // Try loading from public directory
      await this.dlcParser.loadFromFile('/data/dlc-fixtures.csv')
      this.dlcFixtures = this.dlcParser.getAllFixtures()
      console.log(`Loaded ${this.dlcFixtures.length} DLC fixtures from database`)
    } catch (error) {
      console.warn('DLC fixture database not available, using high-quality fallback fixtures:', error.message)
      // Use comprehensive fallback fixtures based on real DLC data
      this.dlcFixtures = this.getFallbackFixtures()
      console.log(`Loaded ${this.dlcFixtures.length} fallback DLC fixtures`)
    }
  }

  /**
   * Analyze design prompt complexity
   */
  analyzeComplexity(prompt: string): DesignComplexity {
    const words = prompt.toLowerCase().split(' ')
    
    // Keywords that increase complexity
    const complexityKeywords = {
      basic: ['light', 'simple', 'basic', 'small'],
      standard: ['monitor', 'control', 'sensor', 'automation'],
      advanced: ['hvac', 'climate', 'multi-zone', 'integration', 'rack', 'tier', 'shelf', 'vertical'],
      enterprise: ['ai', 'machine learning', 'predictive', 'multi-facility', 'cloud', 'multi-tier', 'racking']
    }

    const scores = { basic: 0, standard: 0, advanced: 0, enterprise: 0 }
    
    words.forEach(word => {
      Object.entries(complexityKeywords).forEach(([tier, keywords]) => {
        if (keywords.some(keyword => word.includes(keyword))) {
          scores[tier as keyof typeof scores]++
        }
      })
    })

    // Calculate complexity score
    const totalScore = scores.basic + scores.standard * 2 + scores.advanced * 4 + scores.enterprise * 8
    const normalizedScore = Math.min(100, Math.max(1, totalScore * 3))

    // Determine tier
    let tier: DesignComplexity['tier'] = 'basic'
    if (normalizedScore > 75) tier = 'enterprise'
    else if (normalizedScore > 50) tier = 'advanced'
    else if (normalizedScore > 25) tier = 'standard'

    // Estimate components and credits
    const componentCount = Math.ceil(normalizedScore / 10) + 3
    const systemCount = Math.ceil(componentCount / 5)
    const automationLevel = normalizedScore > 60 ? 'fully-auto' : normalizedScore > 30 ? 'semi-auto' : 'manual'
    const estimatedCredits = Math.ceil(normalizedScore / 5) + 5

    return {
      score: normalizedScore,
      tier,
      componentCount,
      systemCount,
      automationLevel,
      estimatedCredits
    }
  }

  /**
   * Generate design layout from prompt
   */
  async generateDesign(request: DesignRequest): Promise<DesignLayout> {
    const complexity = this.analyzeComplexity(request.prompt)
    
    // Auto-detect racking system requirements from prompt
    const enhancedRequest = this.enhanceRequestWithRackingDetection(request)
    
    // If no AI client, return a rule-based design
    if (!this.bedrockClient) {
      return this.generateRuleBasedDesign(enhancedRequest, complexity)
    }

    try {
      // Create AI prompt for design generation
      const aiPrompt = this.buildDesignPrompt(enhancedRequest, complexity)
      
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
          messages: [{ role: "user", content: aiPrompt }]
        }),
        contentType: 'application/json'
      })

      const response = await this.bedrockClient.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      const aiResponse = responseBody.content[0].text

      // Parse AI response into design layout
      return this.parseAIResponse(aiResponse, enhancedRequest, complexity)
      
    } catch (error) {
      console.error('AI design generation failed, using rule-based fallback:', error)
      return this.generateRuleBasedDesign(enhancedRequest, complexity)
    }
  }

  /**
   * Auto-detect and enhance request with racking system requirements from prompt
   */
  private enhanceRequestWithRackingDetection(request: DesignRequest): DesignRequest {
    const prompt = request.prompt.toLowerCase()
    const enhancedRequest = { ...request }

    // Detect multi-tier racking system keywords
    const rackingKeywords = ['rack', 'tier', 'shelf', 'shelv', 'level', 'stack', 'vertical', 'multi-tier', 'racking']
    const hasRackingTerms = rackingKeywords.some(keyword => prompt.includes(keyword))

    // Extract number of tiers/levels
    const tierMatches = prompt.match(/(\d+)\s*(tier|level|shelf|shelv|layer)/i)
    const tiers = tierMatches ? parseInt(tierMatches[1]) : 8 // default 8 tiers

    // Extract PPFD requirements
    const ppfdMatches = prompt.match(/(\d+)\s*ppfd/i)
    const targetPPFD = ppfdMatches ? parseInt(ppfdMatches[1]) : 600 // default 600 PPFD

    // Detect vertical farm facility type
    const isVerticalFarm = prompt.includes('vertical') || hasRackingTerms || tiers > 3

    if (hasRackingTerms || isVerticalFarm) {
      enhancedRequest.facilityType = 'vertical_farm'
      
      if (!enhancedRequest.requirements) {
        enhancedRequest.requirements = {}
      }

      // Set or enhance racking system configuration
      enhancedRequest.requirements.rackingSystem = {
        enabled: true,
        tiers: Math.min(Math.max(tiers, 4), 12), // Clamp between 4-12 tiers
        tierHeight: 18,        // 18" standard tier height
        shelfDepth: 36,        // 36" standard shelf depth
        aisleWidth: 48,        // 48" aisle width for accessibility
        rackWidth: 96,         // 8' rack sections
        structuralMaterial: 'steel',
        lightingPerTier: true
      }

      // Set professional PPFD target
      enhancedRequest.requirements.targetPPFD = targetPPFD
      enhancedRequest.requirements.mountingHeight = enhancedRequest.requirements.rackingSystem.tierHeight / 12 // Convert to feet
      enhancedRequest.requirements.efficiencyPriority = true // High efficiency needed for heat management
      enhancedRequest.requirements.growMethod = 'hydroponic' // Typical for vertical farms

      console.log(`Detected ${tiers}-tier racking system at ${targetPPFD} PPFD`)
    }

    return enhancedRequest
  }

  private buildDesignPrompt(request: DesignRequest, complexity: DesignComplexity): string {
    return `
You are an expert MEP (Mechanical, Electrical, Plumbing) designer specializing in controlled environment agriculture.

Design Request: ${request.prompt}

Facility Details:
- Type: ${request.facilityType}
- Dimensions: ${request.dimensions?.width || 30}' x ${request.dimensions?.length || 60}' x ${request.dimensions?.height || 12}'
- Lighting: ${request.requirements?.lightingType || 'LED'}
- Growing Method: ${request.requirements?.growMethod || 'hydroponic'}
- Climate Control: ${request.requirements?.climateControl ? 'Yes' : 'No'}
- Automation Level: ${complexity.automationLevel}
${request.requirements?.rackingSystem?.enabled ? `
- RACKING SYSTEM SPECIFICATIONS:
  * Multi-tier vertical racking: ${request.requirements.rackingSystem.tiers} tiers
  * Tier height: ${request.requirements.rackingSystem.tierHeight}" between shelves
  * Shelf depth: ${request.requirements.rackingSystem.shelfDepth}" per side (double-sided racks)
  * Rack width: ${request.requirements.rackingSystem.rackWidth}" sections
  * Aisle width: ${request.requirements.rackingSystem.aisleWidth}" for access
  * Material: ${request.requirements.rackingSystem.structuralMaterial}
  * Per-tier lighting: ${request.requirements.rackingSystem.lightingPerTier ? 'Yes' : 'No'}
  * Target PPFD: ${request.requirements.targetPPFD || 600} μmol/m²/s per tier` : ''}

Please provide a detailed design layout including:

1. **Lighting Layout**: 
   - Fixture positions (x, y, z coordinates)
   - Fixture types and wattages
   - Electrical circuits and load distribution
   ${request.requirements?.rackingSystem?.enabled ? '- Per-tier lighting specifications and mounting details' : ''}

2. **HVAC System**:
   - Air handler locations
   - Ductwork routing
   - Temperature and humidity sensors
   ${request.requirements?.rackingSystem?.enabled ? '- Vertical air distribution for multi-tier systems' : ''}

3. **Irrigation/Fertigation**:
   - Water supply lines
   - Nutrient delivery points
   - Drainage systems
   ${request.requirements?.rackingSystem?.enabled ? '- Per-tier irrigation integration' : ''}

4. **Electrical Infrastructure**:
   - Main panel location
   - Circuit routing
   - Load calculations
   ${request.requirements?.rackingSystem?.enabled ? '- High-density power distribution for vertical systems' : ''}

5. **Control Systems**:
   - Sensor placement
   - Control panel locations
   - Network/communication infrastructure

${request.requirements?.rackingSystem?.enabled ? `
6. **Racking System Structure**:
   - Rack placement and orientation
   - Structural support and bracing
   - Shelf positioning for each tier
   - Aisle layout and accessibility
   - Load-bearing calculations
` : ''}

Format your response as JSON with this structure:
{
  "name": "Facility Name",
  "description": "Design description",
  "components": [
    {
      "id": "unique-id",
      "type": "fixture|sensor|hvac|irrigation|structure",
      "name": "Component Name",
      "x": 0,
      "y": 0,
      "specifications": {}
    }
  ],
  "metadata": {
    "totalPower": 0,
    "lightingUniformity": 0.9,
    "estimatedCost": 0,
    "implementationTime": "2-3 weeks"
  }
}

Focus on practical, buildable designs with proper spacing and professional MEP practices.
`
  }

  private parseAIResponse(aiResponse: string, request: DesignRequest, complexity: DesignComplexity): DesignLayout {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const designData = JSON.parse(jsonMatch[0])
        
        return {
          id: `design-${Date.now()}`,
          name: designData.name || `${request.facilityType} Design`,
          description: designData.description || `AI-generated ${request.facilityType} layout`,
          components: designData.components || [],
          dimensions: request.dimensions ? { 
            width: request.dimensions.width, 
            length: request.dimensions.length, 
            height: request.dimensions.height || 12 
          } : { width: 30, length: 60, height: 12 },
          metadata: {
            totalPower: designData.metadata?.totalPower || complexity.componentCount * 400,
            lightingUniformity: designData.metadata?.lightingUniformity || 0.85,
            estimatedCost: designData.metadata?.estimatedCost || complexity.componentCount * 1200,
            implementationTime: designData.metadata?.implementationTime || "2-4 weeks"
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response, using fallback:', error)
    }

    // Fallback to rule-based if parsing fails
    return this.generateRuleBasedDesign(request, complexity)
  }

  private generateRuleBasedDesign(request: DesignRequest, complexity: DesignComplexity): DesignLayout {
    const dimensions = request.dimensions ? {
      width: request.dimensions.width,
      length: request.dimensions.length,
      height: request.dimensions.height || 12
    } : { width: 30, length: 60, height: 12 }
    const components: DesignComponent[] = []

    // Generate lighting layout
    const fixtureSpacing = 8 // feet
    const lightingComponents = this.generateLightingLayout(dimensions, fixtureSpacing, request.requirements)
    components.push(...lightingComponents)

    // Add HVAC components
    const hvacComponents = this.generateHVACLayout(dimensions)
    components.push(...hvacComponents)

    // Add sensor network
    const sensorComponents = this.generateSensorLayout(dimensions)
    components.push(...sensorComponents)

    // Add irrigation if hydroponic
    if (request.requirements?.growMethod === 'hydroponic') {
      const irrigationComponents = this.generateIrrigationLayout(dimensions)
      components.push(...irrigationComponents)
    }

    // Add multi-tier racking system for vertical farms
    if (request.requirements?.rackingSystem?.enabled) {
      const rackingComponents = this.generateMultiTierRackingSystem(dimensions, request.requirements)
      components.push(...rackingComponents)
    } else if (request.facilityType === 'greenhouse' || request.facilityType === 'indoor_farm') {
      // Add traditional growing benches/tables for greenhouse operations
      const benchComponents = this.generateBenchLayout(dimensions, request.requirements)
      components.push(...benchComponents)
    }

    return {
      id: `design-${Date.now()}`,
      name: `${request.facilityType.replace('_', ' ')} Design`,
      description: `Rule-based ${request.facilityType} layout with ${components.length} components`,
      components,
      dimensions,
      metadata: {
        totalPower: lightingComponents.length * 400 + hvacComponents.length * 1200,
        lightingUniformity: 0.85,
        estimatedCost: components.length * 1200,
        implementationTime: complexity.tier === 'enterprise' ? '4-6 weeks' : '2-4 weeks'
      }
    }
  }

  private generateLightingLayout(dimensions: any, spacing: number, requirements?: any): DesignComponent[] {
    const components: DesignComponent[] = []
    const { width, length } = dimensions
    
    // Select appropriate DLC fixture based on facility size and requirements
    const selectedFixture = this.selectOptimalDLCFixture(dimensions, spacing, requirements)
    
    // Calculate layout based on PPFD requirements if specified
    let actualSpacingX, actualSpacingY, fixturesX, fixturesY, layoutInfo;
    
    if (requirements?.targetPPFD) {
      // Use PPFD-based calculation for professional applications
      layoutInfo = this.calculateLayoutForPPFD(
        selectedFixture, 
        { width, length }, 
        requirements.targetPPFD,
        requirements.mountingHeight || 8
      );
      
      actualSpacingX = layoutInfo.spacingX;
      actualSpacingY = layoutInfo.spacingY;
      fixturesX = Math.ceil(width / actualSpacingX);
      fixturesY = Math.ceil(length / actualSpacingY);
    } else {
      // Use fixture dimensions for standard spacing
      const fixtureWidthFt = (selectedFixture.width || 48) / 12; // Convert inches to feet
      const fixtureLengthFt = (selectedFixture.length || 48) / 12;
      
      actualSpacingX = Math.max(spacing, fixtureWidthFt * 1.1); // 10% overlap
      actualSpacingY = Math.max(spacing, fixtureLengthFt * 1.1);
      
      fixturesX = Math.ceil(width / actualSpacingX);
      fixturesY = Math.ceil(length / actualSpacingY);
    }
    
    for (let x = 0; x < fixturesX; x++) {
      for (let y = 0; y < fixturesY; y++) {
        components.push({
          id: `fixture-${x}-${y}`,
          type: 'fixture',
          name: `${selectedFixture.brand} ${selectedFixture.productName}`,
          x: (x + 0.5) * actualSpacingX,
          y: (y + 0.5) * actualSpacingY,
          z: 8,
          specifications: {
            ...this.getDLCFixtureSpecs(selectedFixture),
            dlcId: selectedFixture.productId,
            manufacturer: selectedFixture.manufacturer,
            modelNumber: selectedFixture.modelNumber,
            fixtureWidth: selectedFixture.width,
            fixtureLength: selectedFixture.length,
            fixtureHeight: selectedFixture.height,
            spacingX: actualSpacingX,
            spacingY: actualSpacingY,
            // Professional lighting analysis data
            mountingHeight: requirements?.mountingHeight || 8,
            targetPPFD: requirements?.targetPPFD,
            estimatedPPFD: layoutInfo?.actualPPFD || this.estimatePPFDAtDistance(selectedFixture, requirements?.mountingHeight || 8),
            spectrumPreference: requirements?.spectrumPreference,
            blueContent: selectedFixture.reportedBlueFlux ? `${Math.round((selectedFixture.reportedBlueFlux / ((selectedFixture.reportedBlueFlux || 0) + (selectedFixture.reportedGreenFlux || 0) + (selectedFixture.reportedRedFlux || 0))) * 100)}%` : 'Unknown',
            uniformityTarget: requirements?.uniformityTarget || 0.8,
            lightingAnalysis: {
              ppfdTarget: requirements?.targetPPFD || 'Not specified',
              actualPPFD: layoutInfo?.actualPPFD || this.estimatePPFDAtDistance(selectedFixture, requirements?.mountingHeight || 8),
              fixtureEfficiency: selectedFixture.reportedPPE || selectedFixture.testedPPE,
              spectrumType: this.analyzeSpectrumFromDLC(selectedFixture),
              mountingDistance: `${requirements?.mountingHeight || 8} feet`
            }
          }
        })
      }
    }
    
    return components
  }

  private generateHVACLayout(dimensions: any): DesignComponent[] {
    const components: DesignComponent[] = []
    const { width, length } = dimensions
    
    // Air handler in corner
    components.push({
      id: 'ahu-1',
      type: 'hvac',
      name: 'Air Handling Unit',
      x: width - 5,
      y: length - 5,
      specifications: {
        capacity: '5 tons',
        airflow: '2000 CFM',
        type: 'packaged-unit'
      }
    })
    
    return components
  }

  private generateSensorLayout(dimensions: any): DesignComponent[] {
    const components: DesignComponent[] = []
    const { width, length } = dimensions
    
    // Temperature/humidity sensors every 20 feet
    const sensorSpacing = 20
    const sensorsX = Math.ceil(width / sensorSpacing)
    const sensorsY = Math.ceil(length / sensorSpacing)
    
    for (let x = 0; x < sensorsX; x++) {
      for (let y = 0; y < sensorsY; y++) {
        components.push({
          id: `sensor-th-${x}-${y}`,
          type: 'sensor',
          name: 'Temperature/Humidity Sensor',
          x: (x + 0.5) * sensorSpacing,
          y: (y + 0.5) * sensorSpacing,
          z: 6,
          specifications: {
            type: 'temperature-humidity',
            range: '-10°C to 60°C, 0-100% RH',
            accuracy: '±0.3°C, ±2% RH'
          }
        })
      }
    }
    
    return components
  }

  private generateIrrigationLayout(dimensions: any): DesignComponent[] {
    const components: DesignComponent[] = []
    const { width, length } = dimensions
    
    // Main water supply
    components.push({
      id: 'water-supply',
      type: 'irrigation',
      name: 'Main Water Supply',
      x: 5,
      y: 5,
      specifications: {
        type: 'water-supply',
        capacity: '100 GPM',
        pressure: '40 PSI'
      }
    })
    
    // Nutrient tank
    components.push({
      id: 'nutrient-tank',
      type: 'irrigation',
      name: 'Nutrient Tank',
      x: 10,
      y: 5,
      specifications: {
        type: 'nutrient-reservoir',
        capacity: '500 gallons',
        mixingSystem: true
      }
    })
    
    return components
  }

  private generateBenchLayout(dimensions: any, requirements?: any): DesignComponent[] {
    const components: DesignComponent[] = []
    const { width, length } = dimensions
    
    // Professional greenhouse bench specifications
    const benchWidth = 4 // feet - standard commercial bench width
    const benchLength = 8 // feet - standard modular bench length
    const aisleWidth = 3 // feet - minimum aisle width for access
    const benchHeight = 32 // inches - standard bench height
    
    // Calculate optimal bench layout
    const availableWidth = width - 4 // Leave 2' on each side for walls/access
    const availableLength = length - 4
    
    // Determine bench arrangement pattern
    const benchesPerRow = Math.floor(availableWidth / (benchWidth + aisleWidth))
    const benchRows = Math.floor(availableLength / (benchLength + aisleWidth))
    
    let benchId = 0
    
    for (let row = 0; row < benchRows; row++) {
      for (let col = 0; col < benchesPerRow; col++) {
        const benchX = 2 + col * (benchWidth + aisleWidth) + benchWidth / 2
        const benchY = 2 + row * (benchLength + aisleWidth) + benchLength / 2
        
        benchId++
        
        components.push({
          id: `bench-${benchId}`,
          type: 'bench',
          name: `Growing Bench ${benchId}`,
          x: benchX,
          y: benchY,
          z: benchHeight / 12, // Convert inches to feet
          specifications: {
            structureType: 'growing-bench',
            material: 'Galvanized Steel Frame',
            surface: 'Expanded Metal Mesh',
            width: benchWidth,
            length: benchLength,
            height: benchHeight,
            loadCapacity: '40 lbs/sq ft',
            drainage: true,
            adjustableHeight: false,
            benchStyle: requirements?.benchStyle || 'stationary',
            surface_area: benchWidth * benchLength,
            growing_medium: requirements?.growMethod === 'hydroponic' ? 'Rockwool/Coco' : 'Soil Mix',
            irrigation_integration: requirements?.growMethod === 'hydroponic',
            appearance: {
              frameColor: '#C0C0C0', // Silver/galvanized
              surfaceColor: '#E0E0E0', // Light gray mesh
              showLegs: true,
              showFrame: true,
              showSurface: true,
              renderStyle: 'greenhouse-bench'
            },
            dimensions: {
              width: benchWidth * 12, // inches for detailed rendering
              length: benchLength * 12,
              height: benchHeight,
              legHeight: 30, // inches
              frameThickness: 2, // inches
              meshSpacing: 1 // inch grid
            }
          }
        })
      }
    }
    
    // Add end benches along walls if space permits
    const remainingWidth = availableWidth % (benchWidth + aisleWidth)
    if (remainingWidth > 2) {
      // Add narrow benches along the length walls
      const narrowBenchWidth = remainingWidth - 1 // Leave 1' clearance
      
      for (let row = 0; row < benchRows; row++) {
        benchId++
        components.push({
          id: `bench-end-${benchId}`,
          type: 'bench', 
          name: `End Bench ${benchId}`,
          x: width - 1 - narrowBenchWidth / 2,
          y: 2 + row * (benchLength + aisleWidth) + benchLength / 2,
          z: benchHeight / 12,
          specifications: {
            structureType: 'growing-bench',
            material: 'Galvanized Steel Frame',
            surface: 'Expanded Metal Mesh',
            width: narrowBenchWidth,
            length: benchLength,
            height: benchHeight,
            loadCapacity: '40 lbs/sq ft',
            drainage: true,
            benchStyle: 'end-bench',
            surface_area: narrowBenchWidth * benchLength,
            growing_medium: requirements?.growMethod === 'hydroponic' ? 'Rockwool/Coco' : 'Soil Mix',
            appearance: {
              frameColor: '#C0C0C0',
              surfaceColor: '#E0E0E0', 
              showLegs: true,
              showFrame: true,
              showSurface: true,
              renderStyle: 'greenhouse-bench'
            },
            dimensions: {
              width: narrowBenchWidth * 12,
              length: benchLength * 12,
              height: benchHeight,
              legHeight: 30,
              frameThickness: 2,
              meshSpacing: 1
            }
          }
        })
      }
    }
    
    return components
  }

  /**
   * Generate multi-tier racking system for vertical farming
   */
  private generateMultiTierRackingSystem(dimensions: any, requirements?: any): DesignComponent[] {
    const components: DesignComponent[] = []
    const { width, length } = dimensions
    const rackConfig = requirements?.rackingSystem

    if (!rackConfig) return components

    const {
      tiers = 8,
      tierHeight = 18, // inches between shelves
      shelfDepth = 36, // inches depth
      aisleWidth = 48, // inches between rack rows  
      rackWidth = 96, // inches width of rack section
      structuralMaterial = 'steel',
      lightingPerTier = true
    } = rackConfig

    // Convert dimensions to feet for calculations
    const shelfDepthFt = shelfDepth / 12
    const aisleWidthFt = aisleWidth / 12
    const rackWidthFt = rackWidth / 12
    const tierHeightFt = tierHeight / 12

    // Calculate how many rack rows fit in the facility
    const availableWidth = width - 4 // Leave 2' clearance on each side
    const availableLength = length - 4

    // Determine rack layout - double-sided racks with center aisle
    const racksPerRow = Math.floor(availableLength / rackWidthFt)
    const rackRows = Math.floor(availableWidth / (shelfDepthFt * 2 + aisleWidthFt))

    let rackId = 0
    let totalGrowingArea = 0

    // Generate rack structures and shelving
    for (let row = 0; row < rackRows; row++) {
      for (let section = 0; section < racksPerRow; section++) {
        rackId++
        
        // Calculate rack position (center of double-sided rack)
        const rackX = 2 + row * (shelfDepthFt * 2 + aisleWidthFt) + shelfDepthFt
        const rackY = 2 + section * rackWidthFt + rackWidthFt / 2

        // Create main rack structure
        components.push({
          id: `rack-structure-${rackId}`,
          type: 'rack',
          name: `Vertical Rack ${rackId}`,
          x: rackX,
          y: rackY,
          z: 0,
          specifications: {
            structureType: 'multi-tier-rack',
            material: structuralMaterial,
            tiers,
            tierHeight,
            shelfDepth,
            rackWidth,
            totalHeight: tiers * tierHeight,
            loadCapacity: '150 lbs per shelf',
            assemblyType: 'bolt-together',
            finish: structuralMaterial === 'steel' ? 'powder-coated' : 'anodized',
            appearance: {
              frameColor: structuralMaterial === 'steel' ? '#2C3E50' : '#95A5A6',
              showStructure: true,
              showBracing: true,
              renderStyle: 'industrial-rack'
            },
            dimensions: {
              width: rackWidth,
              depth: shelfDepth * 2, // Double-sided
              height: tiers * tierHeight,
              postThickness: 3, // inches
              beamThickness: 2
            }
          }
        })

        // Generate shelves for each tier
        for (let tier = 1; tier <= tiers; tier++) {
          const shelfZ = (tier * tierHeightFt) - (tierHeightFt / 2)
          
          // Left side shelf
          components.push({
            id: `shelf-${rackId}-${tier}-A`,
            type: 'shelf',
            name: `Shelf ${rackId}-${tier}A`,
            x: rackX - shelfDepthFt / 2,
            y: rackY,
            z: shelfZ,
            tier,
            parentRackId: `rack-structure-${rackId}`,
            specifications: {
              structureType: 'growing-shelf',
              side: 'A',
              material: 'wire-mesh',
              shelfDepth,
              rackWidth,
              surfaceArea: (shelfDepth * rackWidth) / 144, // sq ft
              drainage: true,
              loadCapacity: '40 lbs/sq ft',
              growingMedium: requirements?.growMethod === 'hydroponic' ? 'NFT channels' : 'grow-trays',
              irrigationIntegrated: requirements?.growMethod === 'hydroponic',
              appearance: {
                surfaceColor: '#F0F0F0',
                frameColor: '#C0C0C0',
                showWireMesh: true,
                showDrainageChannels: requirements?.growMethod === 'hydroponic',
                renderStyle: 'vertical-farm-shelf'
              },
              lighting: {
                requiresLighting: lightingPerTier,
                mountingHeight: tierHeight / 12, // feet above shelf
                targetPPFD: requirements?.targetPPFD || 600,
                lightingType: 'led-strip'
              }
            }
          })

          // Right side shelf  
          components.push({
            id: `shelf-${rackId}-${tier}-B`,
            type: 'shelf',
            name: `Shelf ${rackId}-${tier}B`,
            x: rackX + shelfDepthFt / 2,
            y: rackY,
            z: shelfZ,
            tier,
            parentRackId: `rack-structure-${rackId}`,
            specifications: {
              structureType: 'growing-shelf',
              side: 'B',  
              material: 'wire-mesh',
              shelfDepth,
              rackWidth,
              surfaceArea: (shelfDepth * rackWidth) / 144, // sq ft
              drainage: true,
              loadCapacity: '40 lbs/sq ft',
              growingMedium: requirements?.growMethod === 'hydroponic' ? 'NFT channels' : 'grow-trays',
              irrigationIntegrated: requirements?.growMethod === 'hydroponic',
              appearance: {
                surfaceColor: '#F0F0F0',
                frameColor: '#C0C0C0',
                showWireMesh: true,
                showDrainageChannels: requirements?.growMethod === 'hydroponic',
                renderStyle: 'vertical-farm-shelf'
              },
              lighting: {
                requiresLighting: lightingPerTier,
                mountingHeight: tierHeight / 12,
                targetPPFD: requirements?.targetPPFD || 600,
                lightingType: 'led-strip'
              }
            }
          })

          totalGrowingArea += 2 * ((shelfDepth * rackWidth) / 144) // Both sides
        }

        // Add per-tier lighting if enabled
        if (lightingPerTier) {
          const tierLightingComponents = this.generatePerTierLighting(
            rackId, rackX, rackY, tiers, tierHeightFt, rackWidthFt, requirements
          )
          components.push(...tierLightingComponents)
        }
      }
    }

    // Add main electrical distribution for high-density lighting
    components.push({
      id: 'electrical-main-panel',
      type: 'structure',
      name: 'Main Electrical Panel',
      x: width - 5,
      y: 5,
      z: 0,
      specifications: {
        type: 'electrical-panel',
        capacity: `${Math.ceil(totalGrowingArea * 40)}A`, // ~40W per sq ft
        voltage: '480V 3-phase',
        circuits: Math.ceil(rackId * tiers / 4), // 4 tiers per circuit
        safetyFeatures: ['GFCI', 'Arc-fault protection', 'Emergency stop'],
        rackingSystemIntegration: true
      }
    })

    // Add environmental controls optimized for vertical farming
    components.push({
      id: 'vertical-farm-hvac',
      type: 'hvac',
      name: 'Vertical Farm HVAC System',
      x: width / 2,
      y: length - 3,
      z: dimensions.height - 2,
      specifications: {
        type: 'precision-air-handler',
        capacity: `${Math.ceil(totalGrowingArea / 100)} tons`, // 1 ton per 100 sq ft growing area
        airflow: `${Math.ceil(totalGrowingArea * 20)} CFM`, // 20 CFM per sq ft
        features: ['dehumidification', 'CO2-injection', 'air-filtration'],
        temperatureControl: '±1°F precision',
        humidityControl: '±3% RH precision',
        airDistribution: 'laminar-flow-ceiling',
        verticalFarmOptimized: true
      }
    })

    console.log(`Generated ${rackId} multi-tier racks with ${tiers} tiers each`)
    console.log(`Total growing area: ${Math.round(totalGrowingArea)} sq ft`)
    console.log(`Growing area density: ${Math.round(totalGrowingArea / (width * length))}x footprint`)

    return components
  }

  /**
   * Generate individual lighting for each tier
   */
  private generatePerTierLighting(
    rackId: number, 
    rackX: number, 
    rackY: number, 
    tiers: number, 
    tierHeightFt: number, 
    rackWidthFt: number,
    requirements?: any
  ): DesignComponent[] {
    const components: DesignComponent[] = []
    const targetPPFD = requirements?.targetPPFD || 600

    // Select compact LED fixtures suitable for close mounting
    const selectedFixture = this.selectCompactLEDForVerticalFarm(targetPPFD, tierHeightFt)
    
    for (let tier = 1; tier <= tiers; tier++) {
      const lightingZ = tier * tierHeightFt - 0.1 // Just below the next shelf

      // Calculate number of fixtures needed per tier for target PPFD
      const shelfDepthFt = 36 / 12 // 3 feet
      const shelfAreaPerSide = shelfDepthFt * rackWidthFt // Each side of double-sided rack
      const fixturesPerSide = this.calculateFixturesForPPFD(
        selectedFixture, shelfAreaPerSide, targetPPFD, tierHeightFt
      )
      
      // Calculate optimal layout for fixtures on each side
      const layout = this.calculateOptimalLayout(
        shelfAreaPerSide, fixturesPerSide, rackWidthFt, shelfDepthFt
      )

      // Generate fixtures using optimal grid layout for each side
      let fixtureIndex = 0;
      
      // Left side lighting
      for (let x = 0; x < layout.fixturesX; x++) {
        for (let y = 0; y < layout.fixturesY; y++) {
          if (fixtureIndex >= fixturesPerSide) break;
          
          components.push({
            id: `tier-light-${rackId}-${tier}-A-${fixtureIndex}`,
            type: 'fixture',
            name: `Tier ${tier}A Light ${fixtureIndex + 1}`,
            x: rackX - shelfDepthFt / 2 + (x + 0.5) * (shelfDepthFt / layout.fixturesX),
            y: rackY - rackWidthFt/2 + (y + 0.5) * layout.spacingY,
            z: lightingZ,
            tier,
            parentRackId: `rack-structure-${rackId}`,
            specifications: {
              ...this.getDLCFixtureSpecs(selectedFixture),
              mountingType: 'under-shelf',
              tierSpecific: true,
              targetPPFD,
              mountingHeight: tierHeightFt,
              fixtureSpacingX: layout.spacingX,
              fixtureSpacingY: layout.spacingY,
              gridPosition: `${x + 1},${y + 1}`,
              verticalFarmOptimized: true,
              spectrum: this.analyzeSpectrumFromDLC(selectedFixture),
              estimatedPPFD: this.estimatePPFDAtDistance(selectedFixture, tierHeightFt),
              lightingAnalysis: {
                tierLevel: tier,
                ppfdTarget: targetPPFD,
                actualPPFD: this.estimatePPFDAtDistance(selectedFixture, tierHeightFt),
                fixtureEfficiency: selectedFixture.reportedPPE,
                mountingDistance: `${Math.round(tierHeightFt * 12)} inches`,
                verticalPosition: `Tier ${tier} of ${tiers}`,
                layoutOptimized: true,
                gridDimensions: `${layout.fixturesX} × ${layout.fixturesY}`
              }
            }
          })
          fixtureIndex++;
        }
      }

      // Right side lighting (mirror the left side)
      fixtureIndex = 0;
      for (let x = 0; x < layout.fixturesX; x++) {
        for (let y = 0; y < layout.fixturesY; y++) {
          if (fixtureIndex >= fixturesPerSide) break;
          
          components.push({
            id: `tier-light-${rackId}-${tier}-B-${fixtureIndex}`,
            type: 'fixture', 
            name: `Tier ${tier}B Light ${fixtureIndex + 1}`,
            x: rackX + shelfDepthFt / 2 - (x + 0.5) * (shelfDepthFt / layout.fixturesX), // Mirror X position
            y: rackY - rackWidthFt/2 + (y + 0.5) * layout.spacingY,
            z: lightingZ,
            tier,
            parentRackId: `rack-structure-${rackId}`,
            specifications: {
              ...this.getDLCFixtureSpecs(selectedFixture),
              mountingType: 'under-shelf',
              tierSpecific: true,
              targetPPFD,
              mountingHeight: tierHeightFt,
              fixtureSpacingX: layout.spacingX,
              fixtureSpacingY: layout.spacingY,
              gridPosition: `${x + 1},${y + 1}`,
              verticalFarmOptimized: true,
              spectrum: this.analyzeSpectrumFromDLC(selectedFixture),
              estimatedPPFD: this.estimatePPFDAtDistance(selectedFixture, tierHeightFt),
              lightingAnalysis: {
                tierLevel: tier,
                ppfdTarget: targetPPFD,
                actualPPFD: this.estimatePPFDAtDistance(selectedFixture, tierHeightFt),
                fixtureEfficiency: selectedFixture.reportedPPE,
                mountingDistance: `${Math.round(tierHeightFt * 12)} inches`,
                verticalPosition: `Tier ${tier} of ${tiers}`,
                layoutOptimized: true,
                gridDimensions: `${layout.fixturesX} × ${layout.fixturesY}`
              }
            }
          })
          fixtureIndex++;
        }
      }
    }

    return components
  }

  /**
   * Select compact LED fixtures optimized for vertical farming applications
   */
  private selectCompactLEDForVerticalFarm(targetPPFD: number, mountingHeight: number): DLCFixtureData {
    // Filter for compact, high-efficiency fixtures suitable for close mounting
    const verticalFarmFixtures = this.dlcFixtures.filter(fixture => {
      // Must be compact (under 48" length for tight spacing)
      if (!fixture.length || fixture.length > 48) return false;
      
      // Must be high efficiency for heat management
      if (fixture.reportedPPE < 2.5) return false;
      
      // Must have reasonable power for the space
      if (fixture.reportedWattage > 200) return false; // Avoid excessive heat
      
      return true;
    });

    if (verticalFarmFixtures.length === 0) {
      // Use specialized vertical farm fallback fixtures
      return this.getVerticalFarmFallbackFixtures()[0];
    }

    // Score fixtures for vertical farm suitability
    const scoredFixtures = verticalFarmFixtures.map(fixture => {
      let score = 0;
      
      // Compactness score (30% weight)
      const compactnessScore = Math.max(0, 30 - (fixture.length || 48) / 2);
      score += compactnessScore;
      
      // Efficiency score (40% weight) - critical for heat management
      score += (fixture.reportedPPE || 2.5) * 16;
      
      // PPFD capability at close range (30% weight)
      const estimatedPPFD = this.estimatePPFDAtDistance(fixture, mountingHeight);
      const ppfdScore = Math.max(0, 30 - Math.abs(estimatedPPFD - targetPPFD) / 20);
      score += ppfdScore;

      return { fixture, score };
    });

    scoredFixtures.sort((a, b) => b.score - a.score);
    return scoredFixtures[0]?.fixture || this.getVerticalFarmFallbackFixtures()[0];
  }

  /**
   * Calculate number of fixtures needed to achieve target PPFD with proper spacing logic
   */
  private calculateFixturesForPPFD(fixture: DLCFixtureData, area: number, targetPPFD: number, mountingHeight: number): number {
    // Calculate actual coverage area per fixture at the mounting height
    const beamAngle = this.estimateBeamAngle(fixture.length, fixture.width) || 120;
    const beamAngleRad = (beamAngle / 2) * (Math.PI / 180);
    const coverageRadius = mountingHeight * Math.tan(beamAngleRad);
    const coverageAreaPerFixture = Math.PI * Math.pow(coverageRadius, 2);
    
    // Ensure minimum coverage area for very close mounting
    const minCoverageArea = Math.max(coverageAreaPerFixture, 4);
    
    // Calculate PPFD that each fixture delivers at its coverage area
    const ppfPerFixture = fixture.reportedPPF || 1000;
    const efficiencyFactor = 0.8; // Account for real-world losses
    const ppfdPerFixture = (ppfPerFixture / minCoverageArea) * efficiencyFactor;
    
    // Step 1: Calculate minimum fixtures needed for area coverage (no gaps)
    const minFixturesForCoverage = Math.ceil(area / minCoverageArea);
    
    // Step 2: Calculate the PPFD these fixtures would provide
    const ppfdFromMinFixtures = ppfdPerFixture; // Assuming some overlap for uniformity
    
    // Step 3: Determine if we need additional fixtures for intensity
    let finalFixtureCount = minFixturesForCoverage;
    
    if (ppfdFromMinFixtures < targetPPFD) {
      // Need to increase fixture density for higher PPFD
      // Calculate required fixture density multiplier
      const intensityMultiplier = targetPPFD / ppfdFromMinFixtures;
      
      // For professional uniformity, limit overlap to reasonable levels
      const maxOverlapMultiplier = 2.5; // Maximum 2.5x overlap
      const practicalMultiplier = Math.min(intensityMultiplier, maxOverlapMultiplier);
      
      finalFixtureCount = Math.ceil(minFixturesForCoverage * practicalMultiplier);
      
      // If we hit the overlap limit but still need more PPFD, note this limitation
      if (intensityMultiplier > maxOverlapMultiplier) {
        console.warn(`Target PPFD ${targetPPFD} requires ${intensityMultiplier.toFixed(1)}x fixture density. Limited to ${maxOverlapMultiplier}x for practical installation.`);
      }
    }
    
    // Step 4: Ensure professional minimum density (1 fixture per 12 sq ft for vertical farms)
    const minProfessionalDensity = Math.ceil(area / 12);
    finalFixtureCount = Math.max(finalFixtureCount, minProfessionalDensity);
    
    // Step 5: Add modest buffer for edge uniformity (5% instead of 10%)
    const bufferedCount = Math.ceil(finalFixtureCount * 1.05);
    
    // Step 6: Verify the final design makes sense
    const finalPPFD = (bufferedCount * ppfPerFixture * minCoverageArea) / area;
    const fixtureSpacing = Math.sqrt(area / bufferedCount);
    
    console.log(`Fixture calculation: ${bufferedCount} fixtures, estimated ${Math.round(finalPPFD)} PPFD, ${fixtureSpacing.toFixed(1)}ft spacing`);
    
    return bufferedCount;
  }

  /**
   * Calculate optimal fixture grid layout for given space and fixture count
   */
  private calculateOptimalLayout(area: number, fixtureCount: number, spaceWidth: number, spaceLength: number): {
    fixturesX: number;
    fixturesY: number;
    spacingX: number;
    spacingY: number;
    actualPPFD: number;
  } {
    // Calculate aspect ratio of the space
    const aspectRatio = spaceWidth / spaceLength;
    
    // Find the grid arrangement that best fits the space
    let bestArrangement = { x: 1, y: fixtureCount, score: 0 };
    
    for (let x = 1; x <= fixtureCount; x++) {
      const y = Math.ceil(fixtureCount / x);
      if (x * y >= fixtureCount) {
        const gridAspectRatio = x / y;
        const aspectScore = 1 / (1 + Math.abs(gridAspectRatio - aspectRatio));
        const efficiency = fixtureCount / (x * y); // Prefer fewer wasted grid positions
        const totalScore = aspectScore * 0.7 + efficiency * 0.3;
        
        if (totalScore > bestArrangement.score) {
          bestArrangement = { x, y, score: totalScore };
        }
      }
    }
    
    const spacingX = spaceWidth / bestArrangement.x;
    const spacingY = spaceLength / bestArrangement.y;
    
    return {
      fixturesX: bestArrangement.x,
      fixturesY: bestArrangement.y,
      spacingX,
      spacingY,
      actualPPFD: 0 // Will be calculated by calling function
    };
  }

  /**
   * Specialized fallback fixtures for vertical farming
   */
  private getVerticalFarmFallbackFixtures(): DLCFixtureData[] {
    return [
      {
        productId: 'VERT-001',
        manufacturer: 'Vertical Farm Systems',
        brand: 'VFarmLED',
        productName: 'Compact Tier Light 150W',
        modelNumber: 'VF-150-CT',
        reportedPPE: 2.9,
        reportedPPF: 435,
        reportedWattage: 150,
        width: 8, // inches - very compact
        height: 2,
        length: 36, // fits standard rack width
        dimmable: true,
        warranty: 5,
        dateQualified: '2024-01-01',
        category: 'Vertical Farm LED',
        reportedBlueFlux: 87,  // 20% blue
        reportedGreenFlux: 43,  // 10% green
        reportedRedFlux: 305    // 70% red - optimized for leafy greens
      },
      {
        productId: 'VERT-002', 
        manufacturer: 'Close-Canopy Lighting',
        brand: 'CCL-Pro',
        productName: 'Ultra Compact 100W Strip',
        modelNumber: 'CCL-100-UC',
        reportedPPE: 3.1,
        reportedPPF: 310,
        reportedWattage: 100,
        width: 6,
        height: 1.5,
        length: 24, // Extra compact for tight spacing
        dimmable: true,
        warranty: 7,
        dateQualified: '2024-01-01',
        category: 'Vertical Farm LED',
        reportedBlueFlux: 62,   // 20% blue
        reportedGreenFlux: 31,  // 10% green  
        reportedRedFlux: 217    // 70% red
      }
    ];
  }

  /**
   * Select optimal DLC fixture based on facility requirements
   */
  private selectOptimalDLCFixture(dimensions: any, spacing: number, requirements?: any): DLCFixtureData {
    if (this.dlcFixtures.length === 0) {
      return this.getFallbackFixtures()[0];
    }

    const { width, length } = dimensions;
    const facilityArea = width * length;
    const mountingHeight = requirements?.mountingHeight || 8;
    const targetPPFD = requirements?.targetPPFD || 300;
    const spectrumPreference = requirements?.spectrumPreference;
    const efficiencyPriority = requirements?.efficiencyPriority || false;

    // Advanced filtering based on professional requirements
    let suitableFixtures = this.dlcFixtures.filter(fixture => {
      // Must have dimensions and power data
      if (!fixture.width || !fixture.reportedWattage || !fixture.reportedPPF) return false;
      
      // Efficiency criteria - higher for efficiency priority
      const minPPE = efficiencyPriority ? 2.5 : 1.8;
      if (fixture.reportedPPE < minPPE) return false;
      
      // Size appropriate for spacing
      const fixtureWidthFt = fixture.width / 12;
      if (fixtureWidthFt > spacing * 1.5) return false;
      
      // Spectrum filtering for high-blue preference
      if (spectrumPreference === 'high-blue') {
        const totalSpectralFlux = (fixture.reportedBlueFlux || 0) + 
                                 (fixture.reportedGreenFlux || 0) + 
                                 (fixture.reportedRedFlux || 0);
        if (totalSpectralFlux > 0) {
          const bluePercent = (fixture.reportedBlueFlux || 0) / totalSpectralFlux;
          if (bluePercent < 0.25) return false; // Must have >25% blue content
        }
      }
      
      return true;
    });

    if (suitableFixtures.length === 0) {
      suitableFixtures = this.getFallbackFixtures();
    }

    // Advanced scoring for professional requirements
    const scoredFixtures = suitableFixtures.map(fixture => {
      let score = 0;
      
      // PPFD capability score (35% weight for professional applications)
      const estimatedPPFD = this.estimatePPFDAtDistance(fixture, mountingHeight);
      const ppfdScore = Math.max(0, 35 - Math.abs(estimatedPPFD - targetPPFD) / 10);
      score += ppfdScore;
      
      // Efficiency score (25% weight, higher if efficiency priority)
      const efficiencyWeight = efficiencyPriority ? 35 : 25;
      score += (fixture.reportedPPE || 2.0) * (efficiencyWeight / 2.5);
      
      // Spectrum optimization (20% weight)
      if (spectrumPreference === 'high-blue') {
        const blueScore = this.calculateBlueContentScore(fixture);
        score += blueScore * 20;
      } else if (spectrumPreference === 'high-red') {
        const redScore = this.calculateRedContentScore(fixture);
        score += redScore * 20;
      } else {
        // Balanced spectrum bonus
        score += 15;
      }
      
      // Size and mounting suitability (10% weight)
      const fixtureWidthFt = (fixture.width || 48) / 12;
      const sizeScore = Math.max(0, 10 - Math.abs(fixtureWidthFt - spacing) * 2);
      score += sizeScore;
      
      // Brand reliability bonus (10% weight)
      const reliableBrands = ['fluence', 'signify', 'osram', 'philips', 'current', 'gavita'];
      if (reliableBrands.some(brand => fixture.brand.toLowerCase().includes(brand))) {
        score += 10;
      }

      return { fixture, score, estimatedPPFD, blueContent: this.calculateBlueContentScore(fixture) };
    });

    // Return highest scoring fixture
    scoredFixtures.sort((a, b) => b.score - a.score);
    return scoredFixtures[0]?.fixture || this.getFallbackFixtures()[0];
  }

  /**
   * Extract specifications from DLC fixture data
   */
  private getDLCFixtureSpecs(fixture: DLCFixtureData) {
    return {
      wattage: fixture.reportedWattage || fixture.testedWattage || 400,
      ppf: fixture.reportedPPF || fixture.testedPPF || 1000,
      ppe: fixture.reportedPPE || fixture.testedPPE || 2.5,
      spectrum: this.analyzeSpectrumFromDLC(fixture),
      voltage: `${fixture.minVoltage || 120}-${fixture.maxVoltage || 277}V`,
      dimmable: fixture.dimmable,
      warranty: `${fixture.warranty || 5} years`,
      category: fixture.category,
      dateQualified: fixture.dateQualified,
      blueFlux: fixture.reportedBlueFlux,
      greenFlux: fixture.reportedGreenFlux,
      redFlux: fixture.reportedRedFlux,
      farRedFlux: fixture.reportedFarRedFlux
    };
  }

  /**
   * Analyze spectrum composition from DLC flux data
   */
  private analyzeSpectrumFromDLC(fixture: DLCFixtureData): string {
    const totalFlux = (fixture.reportedBlueFlux || 0) + 
                     (fixture.reportedGreenFlux || 0) + 
                     (fixture.reportedRedFlux || 0);
    
    if (totalFlux === 0) return 'full-spectrum';
    
    const bluePercent = ((fixture.reportedBlueFlux || 0) / totalFlux) * 100;
    const redPercent = ((fixture.reportedRedFlux || 0) / totalFlux) * 100;
    
    if (redPercent > 60) return 'red-heavy';
    if (bluePercent > 40) return 'blue-heavy';
    if (redPercent > 40 && bluePercent > 20) return 'red-blue-optimized';
    return 'full-spectrum';
  }

  /**
   * Estimate PPFD at mounting distance using proper coverage area calculations
   */
  private estimatePPFDAtDistance(fixture: DLCFixtureData, mountingHeight: number): number {
    const ppf = fixture.reportedPPF || fixture.testedPPF || 1000;
    
    // Calculate actual light coverage area based on beam angle and mounting height
    const beamAngle = this.estimateBeamAngle(fixture.length, fixture.width) || 120; // degrees
    const beamAngleRad = (beamAngle / 2) * (Math.PI / 180); // Convert to radians, half angle
    
    // Coverage area using cone geometry: A = π * (h * tan(θ/2))²
    const coverageRadius = mountingHeight * Math.tan(beamAngleRad);
    const coverageArea = Math.PI * Math.pow(coverageRadius, 2); // sq ft
    
    // For very close mounting (vertical farms), ensure minimum coverage area
    const minCoverageArea = Math.max(coverageArea, 4); // Minimum 4 sq ft coverage
    
    // PPFD = PPF / Coverage Area (proper photometric calculation)
    const estimatedPPFD = ppf / minCoverageArea;
    
    // Account for fixture efficiency and uniformity losses (typical 15-25% loss)
    const efficiencyFactor = 0.8; // 80% efficiency accounting for real-world losses
    
    return Math.round(estimatedPPFD * efficiencyFactor);
  }

  /**
   * Estimate beam angle based on fixture dimensions and type
   */
  private estimateBeamAngle(length?: number, width?: number): number {
    if (!length || !width) return 120; // Default wide beam for unknown fixtures
    
    const aspectRatio = length / width;
    
    // Vertical farm fixtures are typically designed for close mounting with focused beams
    if (length <= 48 && width <= 12) {
      // Compact vertical farm fixtures - narrower beam for better coverage control
      return 90;
    }
    
    if (aspectRatio > 3) {
      // Long linear fixtures - wider beam for coverage
      return 140;
    } else if (aspectRatio > 2) {
      // Medium linear fixtures
      return 120;
    } else if (aspectRatio < 1.5) {
      // Square/round fixtures - more focused beam
      return 100;
    } else {
      // Standard rectangular fixtures
      return 110;
    }
  }

  /**
   * Calculate blue content score (0-1) for spectrum preference
   */
  private calculateBlueContentScore(fixture: DLCFixtureData): number {
    const totalFlux = (fixture.reportedBlueFlux || 0) + 
                     (fixture.reportedGreenFlux || 0) + 
                     (fixture.reportedRedFlux || 0);
                     
    if (totalFlux === 0) return 0.3; // Default moderate blue content
    
    const bluePercent = (fixture.reportedBlueFlux || 0) / totalFlux;
    return Math.min(1, bluePercent * 2.5); // Scale so 40% blue = 1.0 score
  }

  /**
   * Calculate red content score (0-1) for spectrum preference
   */
  private calculateRedContentScore(fixture: DLCFixtureData): number {
    const totalFlux = (fixture.reportedBlueFlux || 0) + 
                     (fixture.reportedGreenFlux || 0) + 
                     (fixture.reportedRedFlux || 0);
                     
    if (totalFlux === 0) return 0.5; // Default moderate red content
    
    const redPercent = (fixture.reportedRedFlux || 0) / totalFlux;
    return Math.min(1, redPercent * 1.67); // Scale so 60% red = 1.0 score
  }

  /**
   * Calculate fixture layout for specific PPFD target
   */
  private calculateLayoutForPPFD(fixture: DLCFixtureData, dimensions: any, targetPPFD: number, mountingHeight: number): {
    fixtureCount: number;
    spacingX: number;
    spacingY: number;
    actualPPFD: number;
  } {
    const { width, length } = dimensions;
    const ppf = fixture.reportedPPF || fixture.testedPPF || 1000;
    
    // Calculate required fixture density
    const totalPPFRequired = targetPPFD * width * length; // Total μmol/s needed
    const requiredFixtures = Math.ceil(totalPPFRequired / ppf);
    
    // Calculate optimal grid layout
    const aspectRatio = width / length;
    const fixturesY = Math.round(Math.sqrt(requiredFixtures / aspectRatio));
    const fixturesX = Math.ceil(requiredFixtures / fixturesY);
    
    const spacingX = width / fixturesX;
    const spacingY = length / fixturesY;
    
    // Calculate actual PPFD with this layout
    const actualPPFD = (fixturesX * fixturesY * ppf) / (width * length);
    
    return {
      fixtureCount: fixturesX * fixturesY,
      spacingX,
      spacingY,
      actualPPFD: Math.round(actualPPFD)
    };
  }

  /**
   * Fallback fixture data when DLC database is unavailable
   */
  private getFallbackFixtures(): DLCFixtureData[] {
    return [
      {
        productId: 'FALLBACK-001',
        manufacturer: 'Generic LED Systems',
        brand: 'ProGrow',
        productName: 'LED Grow Light Pro 400W',
        modelNumber: 'PGL-400-FS',
        reportedPPE: 2.5,
        reportedPPF: 1000,
        reportedWattage: 400,
        width: 48, // inches
        height: 3,
        length: 48,
        dimmable: true,
        warranty: 5,
        dateQualified: '2024-01-01',
        category: 'Horticultural Lighting Fixture',
        reportedBlueFlux: 200,
        reportedGreenFlux: 300,
        reportedRedFlux: 500
      },
      {
        productId: 'FALLBACK-002',
        manufacturer: 'Efficient Horticulture',
        brand: 'GrowMax',
        productName: 'High Efficiency 600W',
        modelNumber: 'GM-600-HE',
        reportedPPE: 2.8,
        reportedPPF: 1680,
        reportedWattage: 600,
        width: 60,
        height: 4,
        length: 60,
        dimmable: true,
        warranty: 7,
        dateQualified: '2024-01-01',
        category: 'Horticultural Lighting Fixture',
        reportedBlueFlux: 300,
        reportedGreenFlux: 480,
        reportedRedFlux: 900
      },
      {
        productId: 'FALLBACK-003',
        manufacturer: 'BlueMax Lighting',
        brand: 'BlueMax',
        productName: 'High Blue Research 300W',
        modelNumber: 'BM-300-HB',
        reportedPPE: 2.7,
        reportedPPF: 810,
        reportedWattage: 300,
        width: 36,
        height: 3,
        length: 36,
        dimmable: true,
        warranty: 5,
        dateQualified: '2024-01-01',
        category: 'Horticultural Lighting Fixture',
        reportedBlueFlux: 400, // High blue content for research
        reportedGreenFlux: 200,
        reportedRedFlux: 210
      },
      {
        productId: 'FALLBACK-004',
        manufacturer: 'Research Lighting Co',
        brand: 'ResearchPro',
        productName: 'Ultra Efficient Blue Enhanced 500W',
        modelNumber: 'RLC-500-BE',
        reportedPPE: 3.2,
        reportedPPF: 1600,
        reportedWattage: 500,
        width: 48,
        height: 4,
        length: 48,
        dimmable: true,
        warranty: 7,
        dateQualified: '2024-01-01',
        category: 'Horticultural Lighting Fixture',
        reportedBlueFlux: 600, // Very high blue content (37.5%)
        reportedGreenFlux: 400,
        reportedRedFlux: 600
      }
    ];
  }
}

export const aiDesignService = new AIDesignService()