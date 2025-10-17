import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { trackAIUsage, checkAIUsageLimit } from '@/lib/ai-usage-tracker';
import { requireAccess } from '@/lib/auth/access-control';
import { FactBasedDesignAdvisor } from '@/lib/ai/fact-based-design-advisor';
import { noaaClient } from '@/lib/weather/noaa-client';
import { 
  parseComplexRequest, 
  generateActionSequence, 
  validateDesign,
  CROP_SPECIFICATIONS 
} from '@/lib/ai/enhanced-ai-parser';
import { 
  ADVANCED_CROP_DATABASE,
  calculateInterLightingPositions,
  calculateUnderCanopyLighting,
  calculateTotalLightRequirements,
  simulatePlantGrowth,
  type AdvancedCropSpec
} from '@/lib/plants/advanced-plant-system';

// API routes are dynamic by default in Next.js 13+

// Use the enhanced Claude AI service
// The service handles rate limiting, credit consumption, and error handling internally

// Designer action types
export type DesignerAction = 
  | { type: 'CREATE_ROOM'; params: CreateRoomParams }
  | { type: 'ADD_FIXTURE'; params: AddFixtureParams }
  | { type: 'ADD_FIXTURES_ARRAY'; params: AddFixturesArrayParams }
  | { type: 'REMOVE_FIXTURE'; params: RemoveFixtureParams }
  | { type: 'UPDATE_FIXTURE'; params: UpdateFixtureParams }
  | { type: 'ADD_EQUIPMENT'; params: AddEquipmentParams }
  | { type: 'ADD_BENCHING'; params: AddBenchingParams }
  | { type: 'UPDATE_ROOM'; params: UpdateRoomParams }
  | { type: 'OPTIMIZE_LAYOUT'; params: OptimizeLayoutParams }
  | { type: 'CALCULATE_METRICS'; params: {} }
  | { type: 'GENERATE_REPORT'; params: GenerateReportParams }
  | { type: 'SAVE_DESIGN'; params: SaveDesignParams }
  | { type: 'LOAD_DESIGN'; params: LoadDesignParams }
  | { type: 'CLEAR_CANVAS'; params: {} }
  | { type: 'SET_SPECTRUM'; params: SetSpectrumParams }
  | { type: 'SET_TARGET_PPFD'; params: SetTargetPPFDParams }
  | { type: 'ADD_WALLS'; params: AddWallsParams }
  | { type: 'ADD_OBSTACLE'; params: AddObstacleParams }
  | { type: 'CALCULATE_SURFACE'; params: CalculateSurfaceParams }
  | { type: 'OPTIMIZE_DLC_FIXTURES'; params: OptimizeDLCParams }
  | { type: 'ADD_PLANT'; params: AddPlantParams }
  | { type: 'ADD_PLANTS_ARRAY'; params: AddPlantsArrayParams }
  | { type: 'ADD_INTERLIGHTING'; params: AddInterlightingParams }
  | { type: 'ADD_UNDER_CANOPY_LIGHTING'; params: AddUnderCanopyLightingParams };

// Parameter types
interface CreateRoomParams {
  width: number;
  length: number;
  height: number;
  shape?: 'rectangle' | 'polygon';
  ceilingHeight?: number;
  workingHeight?: number;
  roomType?: string;
}

interface AddFixtureParams {
  x: number;
  y: number;
  z?: number;
  modelId?: string;
  modelName?: string;
  wattage?: number;
  ppf?: number;
  dimmingLevel?: number;
}

interface AddFixturesArrayParams {
  rows: number;
  columns: number;
  spacing?: number;
  centerX?: number;
  centerY?: number;
  modelId?: string;
  targetPPFD?: number;
}

interface RemoveFixtureParams {
  fixtureId: string;
}

interface UpdateFixtureParams {
  fixtureId: string;
  updates: {
    x?: number;
    y?: number;
    z?: number;
    rotation?: number;
    dimmingLevel?: number;
    enabled?: boolean;
  };
}

interface AddEquipmentParams {
  type: 'hvac' | 'fan' | 'dehumidifier' | 'co2' | 'irrigation';
  x: number;
  y: number;
  specs?: any;
}

interface AddBenchingParams {
  type: 'rolling' | 'fixed' | 'rack';
  rows: number;
  width: number;
  length: number;
  height?: number;
  tiers?: number;
}

interface UpdateRoomParams {
  width?: number;
  length?: number;
  height?: number;
  reflectances?: {
    ceiling?: number;
    walls?: number;
    floor?: number;
  };
}

interface OptimizeLayoutParams {
  targetPPFD: number;
  optimizeFor: 'uniformity' | 'efficiency' | 'coverage';
  constraints?: {
    maxPower?: number;
    minUniformity?: number;
    budgetLimit?: number;
  };
}

interface GenerateReportParams {
  reportType: 'pdf' | 'excel' | 'bom';
  includeCalculations?: boolean;
  includeVisualizations?: boolean;
}

interface SaveDesignParams {
  name: string;
  description?: string;
}

interface LoadDesignParams {
  designId: string;
}

interface SetSpectrumParams {
  spectrum: {
    red?: number;
    blue?: number;
    green?: number;
    farRed?: number;
    uv?: number;
  };
}

interface SetTargetPPFDParams {
  targetPPFD: number;
  dli?: number;
  photoperiod?: number;
}

interface AddWallsParams {
  walls: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    height?: number;
  }>;
}

interface AddObstacleParams {
  type: 'column' | 'beam' | 'equipment';
  x: number;
  y: number;
  width: number;
  length: number;
  height?: number;
}

interface CalculateSurfaceParams {
  x: number;
  y: number;
  width: number;
  length: number;
  height: number;
  targetPPFD: number;
  mountingHeight: number;
}

interface OptimizeDLCParams {
  surfaceWidth: number;
  surfaceLength: number;
  targetPPFD: number;
  mountingHeight: number;
  x?: number;
  y?: number;
  z?: number;
  preferredFormFactor?: 'bar' | 'panel' | 'compact';
  maxWattage?: number;
  minEfficacy?: number;
}

interface AddPlantParams {
  x: number;
  y: number;
  variety: 'lettuce' | 'hemp' | 'high-wire' | 'tomato' | 'cannabis' | 'herbs' | 'microgreens' | 'high-wire-tomato' | 'butterhead-lettuce' | 'cannabis-sativa' | 'genovese-basil' | 'strawberry';
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'harvest' | 'clone' | 'production' | 'flowering-early' | 'flowering-late';
  width?: number;
  length?: number;
  targetDLI?: number;
  cropId?: string; // Advanced crop spec ID
}

interface AddPlantsArrayParams {
  rows: number;
  columns: number;
  spacing?: number;
  variety: 'lettuce' | 'hemp' | 'high-wire' | 'tomato' | 'cannabis' | 'herbs' | 'microgreens' | 'high-wire-tomato' | 'butterhead-lettuce' | 'cannabis-sativa' | 'genovese-basil' | 'strawberry';
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'harvest' | 'clone' | 'production' | 'flowering-early' | 'flowering-late';
  centerX?: number;
  centerY?: number;
  cropId?: string; // Advanced crop spec ID
}

interface AddInterlightingParams {
  plantRows: Array<{ x: number; y: number; height: number }>;
  cropId: string;
  roomDimensions: { width: number; length: number; height: number };
}

interface AddUnderCanopyLightingParams {
  plantPositions: Array<{ x: number; y: number; canopyRadius: number }>;
  cropId: string;
}

// Helper function to map simple crop names to advanced crop IDs
function mapCropToAdvancedId(variety: string): string | null {
  const mappings: Record<string, string> = {
    'lettuce': 'butterhead-lettuce',
    'tomato': 'high-wire-tomato',
    'tomatoes': 'high-wire-tomato',
    'high-wire': 'high-wire-tomato',
    'cannabis': 'cannabis-sativa',
    'hemp': 'cannabis-sativa',
    'basil': 'genovese-basil',
    'herbs': 'genovese-basil',
    'strawberry': 'strawberry',
    'strawberries': 'strawberry'
  };
  return mappings[variety.toLowerCase()] || null;
}

// Helper function to parse natural language into designer actions
async function parseNaturalLanguageToActions(input: string, currentState: any, weatherData?: any, userId?: string): Promise<DesignerAction[]> {
  // First try our enhanced parser for complex requests
  try {
    const complexRequest = parseComplexRequest(input);
    const validation = validateDesign(complexRequest);
    
    // If we successfully parsed a complex request with multiple components
    if (complexRequest.room || complexRequest.racks || complexRequest.fixtures || complexRequest.airflow || complexRequest.plants) {
      logger.info('api', 'Enhanced parser detected complex request:', { data: complexRequest });
      logger.info('api', 'Validation:', { data: validation });
      
      // Generate optimized action sequence
      const actions = generateActionSequence(complexRequest);
      
      // If there are validation issues, add them to the response
      if (!validation.valid || validation.suggestions.length > 0) {
        // We'll return actions but also notify about issues
        logger.info('api', 'Design validation issues:', { data: validation.issues });
        logger.info('api', 'Design suggestions:', { data: validation.suggestions });
      }
      
      // Return the generated actions if we have any
      if (actions.length > 0) {
        // Add helpful message about auto-created room if applicable
        let message = `Found ${actions.length} action(s) to execute`;
        if (complexRequest.room && complexRequest.racks && !input.toLowerCase().includes('room')) {
          const room = complexRequest.room;
          message += `\n\n💡 I created a ${room.width}×${room.length}ft room to fit your ${complexRequest.racks[0].count} racks. You can adjust the room size if needed.`;
        }
        
        return actions;
      }
    }
  } catch (error) {
    logger.info('api', 'Enhanced parser could not handle request, falling back to Claude:', error);
  }
  
  // Fall back to Claude for requests the enhanced parser can't handle
  // Use the enhanced Claude service for natural language processing
  if (userId) {
    try {
      const { claudeAI } = await import('@/lib/ai/claude-service');
      const designResponse = await claudeAI.processDesignCommand(
        userId,
        input,
        currentState
      );
      
      if (designResponse.success && designResponse.data) {
        return (designResponse.data.actions || []) as any;
      }
    } catch (error) {
      logger.error('api', 'Failed to load Claude service:', error );
    }
  }
  
  // Fallback to empty actions if Claude fails
  return [];
}

// Original parseNaturalLanguageToActions backup method
async function parseNaturalLanguageToActionsBackup(input: string, currentState: any, weatherData?: any): Promise<DesignerAction[]> {
  const systemPrompt = `You are an AI assistant for a professional lighting design application. 
Convert natural language requests into specific designer actions.

Current state:
- Room: ${currentState.room ? `${currentState.room.width}x${currentState.room.length}x${currentState.room.height} ft` : 'None'}
- Fixtures: ${currentState.objects?.filter((o: any) => o.type === 'fixture').length || 0}
- Current PPFD: ${currentState.calculations?.averagePPFD || 0}
- Uniformity: ${currentState.calculations?.uniformity || 0}
${weatherData ? `
Weather conditions:
- Temperature: ${weatherData.current.temperature}°F
- Humidity: ${weatherData.current.humidity}%
- VPD: ${weatherData.metrics?.vpd?.toFixed(2) || 'N/A'} kPa
- Conditions: ${weatherData.current.conditions}
` : ''}

Available actions:
- CREATE_ROOM: Create a new room with dimensions
- ADD_FIXTURE: Add a single fixture at specific coordinates
- ADD_FIXTURES_ARRAY: Add multiple fixtures in a grid pattern
- REMOVE_FIXTURE: Remove a specific fixture
- UPDATE_FIXTURE: Update fixture properties
- ADD_EQUIPMENT: Add HVAC, fans, dehumidifiers, etc.
- ADD_BENCHING: Add benching or racking systems
- UPDATE_ROOM: Update room properties
- OPTIMIZE_LAYOUT: Optimize fixture placement
- CALCULATE_METRICS: Recalculate PPFD and other metrics
- SET_TARGET_PPFD: Set target PPFD and DLI
- ADD_WALLS: Add interior walls
- ADD_OBSTACLE: Add obstacles like columns
- CLEAR_CANVAS: Clear all objects from the canvas
- CALCULATE_SURFACE: Define a calculation surface for PPFD analysis
- OPTIMIZE_DLC_FIXTURES: Find and place the most efficient DLC fixtures for a specific surface
- ADD_PLANT: Add a single plant (lettuce, hemp, high-wire tomatoes, cannabis, herbs, microgreens)
- ADD_PLANTS_ARRAY: Add multiple plants in a grid pattern
- ADD_INTERLIGHTING: Add interlighting for tall crops like high-wire tomatoes
- ADD_UNDER_CANOPY_LIGHTING: Add under-canopy lighting for dense crops like cannabis

Parse the user's natural language input and return appropriate actions.

Examples:
"Create a 40x60 flowering room with 10 foot ceilings" -> CREATE_ROOM with width:40, length:60, height:10
"Build me a 20x20 room" -> CREATE_ROOM with width:20, length:20, height:10
"Add 4x8 rolling benches in 3 rows" -> ADD_BENCHING with type:'rolling', rows:3, width:4, length:8
"Fill it with fixtures for 800 PPFD" -> ADD_FIXTURES_ARRAY with targetPPFD:800
"Build me a 20x 20' room with 400 ppfd from siify fixture" -> [CREATE_ROOM with width:20, length:20, height:10] + [ADD_FIXTURES_ARRAY with targetPPFD:400]
"Add a 2 ton AC" -> ADD_EQUIPMENT with type:'hvac', specs:{tonnage:2}
"Optimize the layout" -> OPTIMIZE_LAYOUT with optimizeFor:'uniformity'
"I want a calculation surface of 2' x 30' and the lights are 2.5' away" -> CALCULATE_SURFACE with width:2, length:30, mountingHeight:2.5
"Find the best DLC fixture for a 2x30 surface with 400 PPFD" -> OPTIMIZE_DLC_FIXTURES with surfaceWidth:2, surfaceLength:30, targetPPFD:400
"Add lettuce plants in 4 rows" -> ADD_PLANTS_ARRAY with variety:'butterhead-lettuce', rows:4
"Place a high wire tomato plant at 10,20" -> ADD_PLANT with variety:'high-wire-tomato', x:10, y:20
"Add hemp plants in flowering stage" -> ADD_PLANTS_ARRAY with variety:'cannabis-sativa', growthStage:'flowering-late'
"Add interlighting for the tomatoes" -> ADD_INTERLIGHTING with cropId:'high-wire-tomato'
"Add under-canopy lighting for cannabis" -> ADD_UNDER_CANOPY_LIGHTING with cropId:'cannabis-sativa'

When users mention room dimensions like "20x20", "40x60", parse as width x length.
When users mention PPFD targets like "400 PPFD", "800 PPFD", use ADD_FIXTURES_ARRAY with targetPPFD.
When users say "build me" or "create", they typically want both room and fixtures.
Brand names like "siify", "signify", "philips" should be ignored for fixture selection - focus on the PPFD target.

For crop-specific requests:
- "high-wire tomatoes" or "tomatoes" -> variety:'high-wire-tomato' (needs interlighting at 15ft height)
- "lettuce" -> variety:'butterhead-lettuce' (compact 6" height)
- "cannabis" or "hemp" -> variety:'cannabis-sativa' (needs under-canopy lighting)
- "basil" or "herbs" -> variety:'genovese-basil'
- "strawberries" -> variety:'strawberry'

When adding tall crops (high-wire tomatoes), suggest interlighting.
When adding dense canopy crops (cannabis), suggest under-canopy lighting.

Return a JSON object with an "actions" array containing the parsed actions.`;

  try {
    // This is now a backup method - the main method uses claudeAI service
    return [];

    /* Commented out - old unused code
    // Extract JSON from Claude's response
    const content = response.content[0];
    if (content.type === 'text') {
      // Claude might include JSON in code blocks or plain text
      let jsonContent = content.text.trim();
      
      // Remove code block markers if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\s*|\s*```/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\s*|\s*```/g, '');
      }
      
      try {
        const result = JSON.parse(jsonContent);
        return result.actions || [];
      } catch (parseError) {
        logger.error('api', 'Error parsing JSON from Claude:', parseError);
        logger.error('api', 'Claude response:', jsonContent);
        return [];
      }
    }
    
    return [];
    */
  } catch (error) {
    logger.error('api', 'Error parsing natural language with Claude:', error );
    logger.error('api', 'Full error:', error );
    return [];
  }
}

// Helper function to generate suggestions based on current state and weather
function generateSuggestions(state: any, weatherData?: any): string[] {
  const suggestions: string[] = [];
  const fixtures = state.objects?.filter((o: any) => o.type === 'fixture') || [];
  const plants = state.objects?.filter((o: any) => o.type === 'plant') || [];
  const racks = state.objects?.filter((o: any) => o.type === 'rack' || o.type === 'bench') || [];
  const fans = state.objects?.filter((o: any) => o.type === 'equipment' && o.equipmentType === 'fan') || [];
  const avgPPFD = state.calculations?.averagePPFD || 0;
  const uniformity = state.calculations?.uniformity || 0;

  // No room created yet
  if (!state.room) {
    suggestions.push("Start by creating a room. Try: 'Create a 20x40 room with 12 foot ceilings'");
    suggestions.push("Complex example: 'Build a 20x40 room with 3 racks that are 2.5 feet apart'");
    return suggestions;
  }

  // Room exists but no infrastructure
  if (racks.length === 0 && state.room.width * state.room.length > 100) {
    suggestions.push("Add growing infrastructure. Try: 'Add 3 racks that are 5x20 feet, 2.5 feet apart'");
    suggestions.push("Or try: 'Add 4x8 rolling benches in 3 rows'");
  }

  // Has racks but no fixtures
  if (racks.length > 0 && fixtures.length === 0) {
    suggestions.push("Add lighting to your racks. Try: 'Place fixtures widthwise on each rack for 200 PPFD'");
    suggestions.push("Or: 'Add LED bars along the 5 foot width of each rack'");
  }

  // No fixtures yet (general)
  if (fixtures.length === 0 && racks.length === 0) {
    suggestions.push("Add fixtures to your room. Try: 'Add 4x8 grid of fixtures for 600 PPFD'");
    return suggestions;
  }

  // Has infrastructure but no plants
  if ((racks.length > 0 || fixtures.length > 0) && plants.length === 0) {
    suggestions.push("Add crops to your design. Try: 'Add butterhead lettuce with 8 inch spacing'");
    suggestions.push("Or: 'Place high-wire tomatoes with 18 inch spacing'");
    suggestions.push("Advanced: 'Add cannabis plants in flowering stage' (will suggest under-canopy lighting)");
  }
  
  // Check for crop-specific lighting needs
  if (plants.length > 0) {
    // Check for high-wire tomatoes without interlighting
    const hasTomatoes = plants.some((p: any) => 
      p.variety === 'high-wire-tomato' || p.variety === 'tomato' || p.variety === 'high-wire'
    );
    const hasInterlighting = state.objects?.some((o: any) => 
      o.type === 'fixture' && o.fixtureType === 'interlight'
    );
    
    if (hasTomatoes && !hasInterlighting) {
      suggestions.push("High-wire tomatoes benefit from interlighting. Try: 'Add interlighting for the tomatoes'");
    }
    
    // Check for cannabis without under-canopy lighting
    const hasCannabis = plants.some((p: any) => 
      p.variety === 'cannabis' || p.variety === 'cannabis-sativa' || p.variety === 'hemp'
    );
    const hasUnderCanopy = state.objects?.some((o: any) => 
      o.type === 'fixture' && o.fixtureType === 'under-canopy'
    );
    
    if (hasCannabis && !hasUnderCanopy) {
      suggestions.push("Cannabis has dense canopy. Try: 'Add under-canopy lighting for better lower bud development'");
    }
    
    // Basil benefits from end-of-day far-red
    const hasBasil = plants.some((p: any) => 
      p.variety === 'basil' || p.variety === 'genovese-basil' || p.variety === 'herbs'
    );
    if (hasBasil) {
      suggestions.push("Basil tip: Blue-heavy spectrum increases essential oil content");
    }
  }

  // Check airflow requirements
  if (fans.length === 0 && (plants.length > 0 || racks.length > 0)) {
    const cropType = plants.length > 0 ? plants[0].variety : 'general';
    const targetAirflow = CROP_SPECIFICATIONS[cropType]?.airflow?.optimal || 0.3;
    suggestions.push(`Add airflow for ${cropType}. Try: 'Place fans for ${targetAirflow} m/s airflow over the crop'`);
  }

  // Low PPFD
  if (avgPPFD < state.room.targetPPFD * 0.8) {
    suggestions.push(`Current PPFD (${avgPPFD.toFixed(0)}) is below target. Try: 'Add more fixtures' or 'Increase dimming levels'`);
  }

  // Poor uniformity
  if (uniformity < 0.7) {
    suggestions.push("Uniformity is low. Try: 'Optimize layout for better uniformity'");
  }

  // No environmental equipment
  const hasHVAC = state.objects?.some((o: any) => o.type === 'equipment' && o.equipmentType === 'hvac');
  if (!hasHVAC && state.room.width * state.room.length > 200) {
    suggestions.push("Consider adding HVAC. Try: 'Add 2 ton AC unit'");
  }

  // Suggest benching for larger rooms
  const hasBenching = state.objects?.some((o: any) => o.type === 'bench' || o.type === 'rack');
  if (!hasBenching && state.room.width * state.room.length > 100) {
    suggestions.push("Add benching to organize your grow space. Try: 'Add 3 rows of rolling benches'");
  }

  // Weather-based suggestions
  if (weatherData) {
    const temp = weatherData.current.temperature;
    const humidity = weatherData.current.humidity;
    const vpd = weatherData.metrics?.vpd;

    // Temperature-based HVAC suggestions
    if (temp > 85 && !state.objects?.some((o: any) => o.type === 'equipment' && o.equipmentType === 'hvac')) {
      suggestions.push(`Outside temp is ${temp}°F. Add cooling: 'Add 3 ton AC unit for heat management'`);
    }

    // Humidity-based suggestions
    if (humidity > 70 && !state.objects?.some((o: any) => o.type === 'equipment' && o.equipmentType === 'dehumidifier')) {
      suggestions.push(`High outdoor humidity (${humidity}%). Add: 'Add commercial dehumidifier'`);
    }

    // VPD optimization
    if (vpd && (vpd < 0.8 || vpd > 1.2)) {
      const vpdStatus = vpd < 0.8 ? 'low' : 'high';
      suggestions.push(`VPD is ${vpdStatus} (${vpd.toFixed(2)} kPa). Consider environmental controls for optimal growth.`);
    }

    // Frost risk warning
    if (weatherData.metrics?.frostRisk) {
      suggestions.push("⚠️ Frost risk detected! Ensure heating systems are operational.");
    }
  }

  return suggestions;
}

// Enhanced version of parseNaturalLanguageToActions that handles interlighting and under-canopy
async function parseNaturalLanguageToActionsEnhanced(input: string, currentState: any, weatherData?: any, userId?: string): Promise<DesignerAction[]> {
  const actions = await parseNaturalLanguageToActions(input, currentState, weatherData, userId);
  
  // Check if we're adding plants that need special lighting
  const plantActions = actions.filter(a => a.type === 'ADD_PLANT' || a.type === 'ADD_PLANTS_ARRAY');
  
  if (plantActions.length > 0) {
    // Simulate the plants that would be added
    const simulatedPlants: any[] = [];
    
    plantActions.forEach(action => {
      if (action.type === 'ADD_PLANT') {
        const params = action.params as AddPlantParams;
        const cropId = params.cropId || mapCropToAdvancedId(params.variety);
        simulatedPlants.push({
          ...params,
          cropId,
          type: 'plant'
        });
      } else if (action.type === 'ADD_PLANTS_ARRAY') {
        const params = action.params as AddPlantsArrayParams;
        const cropId = params.cropId || mapCropToAdvancedId(params.variety);
        // Simulate array of plants
        for (let i = 0; i < params.rows * params.columns; i++) {
          simulatedPlants.push({
            variety: params.variety,
            cropId,
            x: params.centerX || 0,
            y: params.centerY || 0,
            type: 'plant'
          });
        }
      }
    });
    
    // Generate smart lighting actions based on plant types
    if (simulatedPlants.length > 0 && currentState.room) {
      const lightingActions = generateSmartLightingActions(simulatedPlants, currentState.room);
      actions.push(...lightingActions);
    }
  }
  
  return actions;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication with better error handling
    let userId: string | null = null;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
    } catch (authError) {
      logger.error('api', 'Authentication error:', authError);
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please sign in to use the AI Designer'
      }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please sign in to use the AI Designer'
      }, { status: 401 });
    }

    // Check subscription access for AI Designer
    const accessCheck = await requireAccess('ai-designer', {
      module: 'advanced-designer-suite',
      credits: { type: 'aiDesigner', amount: 10 },
      userId: userId
    });
    
    if (!accessCheck.allowed) {
      return NextResponse.json({
        error: 'Access denied',
        message: accessCheck.reason,
        upgradeRequired: accessCheck.upgradeRequired
      }, { status: 403 });
    }

    // Check AI usage limits before processing
    const usageCheck = await checkAIUsageLimit(userId, 'FREE', 'basicChat');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'AI usage limit reached',
        message: 'You have reached your AI usage limit. Please try again later.',
        reason: usageCheck.reason,
        upgradeRequired: true
      }, { status: 429 });
    }

    const body = await req.json();
    const { message, currentState, mode = 'parse', location } = body;

    // Fetch weather data if location is provided
    let weatherData: any = null;
    if (location?.lat && location?.lon) {
      try {
        weatherData = await noaaClient.getWeather(location);
        const metrics = noaaClient.calculateAgriculturalMetrics(weatherData);
        weatherData.metrics = metrics;
      } catch (error) {
        logger.error('api', 'Failed to fetch weather data:', error );
      }
    }

    // Mode: parse - Convert natural language to actions
    if (mode === 'parse') {
      const actions = await parseNaturalLanguageToActionsEnhanced(message, currentState, weatherData, userId);
      const suggestions = generateSuggestions(currentState, weatherData);
      
      
      // TODO: Fix AI usage tracking function signature
      // await trackAIUsage(userId, 'ai_designer', {
      //   feature: 'parse',
      //   message: message,
      //   actionsGenerated: actions.length,
      //   inputTokens: Math.ceil(message.length / 4), // Rough token estimate
      //   outputTokens: Math.ceil(JSON.stringify(actions).length / 4)
      // });
      
      return NextResponse.json({
        success: true,
        actions,
        suggestions,
        message: `Found ${actions.length} action(s) to execute`
      });
    }

    // Mode: suggest - Generate contextual suggestions
    if (mode === 'suggest') {
      const suggestions = generateSuggestions(currentState);
      
      // TODO: Fix AI usage tracking function signature
      // await trackAIUsage(userId, 'ai_designer', {
      //   feature: 'suggest',
      //   suggestionsGenerated: suggestions.length,
      //   inputTokens: Math.ceil(JSON.stringify(currentState).length / 4),
      //   outputTokens: Math.ceil(JSON.stringify(suggestions).length / 4)
      // });
      
      return NextResponse.json({
        success: true,
        suggestions
      });
    }

    // Mode: analyze - Analyze current design and provide feedback
    if (mode === 'analyze') {
      const analysis = await analyzeDesign(currentState);
      
      // TODO: Fix AI usage tracking function signature
      // await trackAIUsage(userId, 'ai_designer', {
      //   feature: 'analyze',
      //   metricsAnalyzed: Object.keys(analysis.metrics || {}).length,
      //   recommendationsGenerated: analysis.recommendations?.length || 0,
      //   inputTokens: Math.ceil(JSON.stringify(currentState).length / 4),
      //   outputTokens: Math.ceil(JSON.stringify(analysis).length / 4)
      // });
      
      return NextResponse.json({
        success: true,
        analysis
      });
    }

    // Mode: fact-check - Provide fact-based design recommendations
    if (mode === 'fact-check') {
      const { cropType, growthStage, targetMetrics, environmentalFactors } = body;
      
      const advisor = new FactBasedDesignAdvisor();
      const context = {
        cropType,
        growthStage,
        roomDimensions: {
          width: currentState.room?.width || 0,
          length: currentState.room?.length || 0,
          height: currentState.room?.height || 0
        },
        currentFixtures: currentState.objects?.filter((o: any) => o.type === 'fixture') || [],
        targetMetrics,
        environmentalFactors
      };

      const recommendations = await advisor.analyzeDesignWithFacts(context);
      
      // TODO: Fix AI usage tracking function signature
      // await trackAIUsage(userId, 'ai_designer', {
      //   feature: 'fact-check',
      //   cropType,
      //   recommendationsGenerated: recommendations.length,
      //   inputTokens: Math.ceil(JSON.stringify(context).length / 4),
      //   outputTokens: Math.ceil(JSON.stringify(recommendations).length / 4)
      // });
      
      return NextResponse.json({
        success: true,
        recommendations,
        factBased: true
      });
    }

    return NextResponse.json({ 
      error: 'Invalid mode. Use parse, suggest, analyze, or fact-check' 
    }, { status: 400 });

  } catch (error) {
    logger.error('api', 'AI Designer API error:', error );
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

// Analyze current design and provide insights
async function analyzeDesign(state: any): Promise<any> {
  const fixtures = state.objects?.filter((o: any) => o.type === 'fixture') || [];
  const roomArea = state.room ? state.room.width * state.room.length : 0;
  const totalPower = fixtures.reduce((sum: number, f: any) => sum + (f.model?.wattage || 0) * (f.dimmingLevel || 100) / 100, 0);
  
  return {
    metrics: {
      fixtureCount: fixtures.length,
      totalPower,
      powerDensity: roomArea > 0 ? totalPower / roomArea : 0,
      averagePPFD: state.calculations?.averagePPFD || 0,
      uniformity: state.calculations?.uniformity || 0,
      coverage: calculateCoverage(state),
    },
    recommendations: [
      {
        category: 'efficiency',
        message: totalPower / roomArea > 30 ? 'Consider using more efficient fixtures' : 'Good power efficiency',
        priority: totalPower / roomArea > 30 ? 'high' : 'low'
      },
      {
        category: 'uniformity',
        message: state.calculations?.uniformity < 0.7 ? 'Improve light uniformity by adjusting fixture spacing' : 'Excellent uniformity',
        priority: state.calculations?.uniformity < 0.7 ? 'high' : 'low'
      }
    ],
    status: determineDesignStatus(state)
  };
}

function calculateCoverage(state: any): number {
  // Simple coverage calculation based on fixture footprint
  if (!state.room || !state.objects) return 0;
  
  const fixtures = state.objects.filter((o: any) => o.type === 'fixture');
  const roomArea = state.room.width * state.room.length;
  const fixtureArea = fixtures.length * 16; // Assume 4x4 ft coverage per fixture
  
  return Math.min(100, (fixtureArea / roomArea) * 100);
}

function determineDesignStatus(state: any): string {
  if (!state.room) return 'no-room';
  if (!state.objects || state.objects.length === 0) return 'empty';
  
  const fixtures = state.objects.filter((o: any) => o.type === 'fixture');
  if (fixtures.length === 0) return 'no-fixtures';
  
  const avgPPFD = state.calculations?.averagePPFD || 0;
  const targetPPFD = state.room.targetPPFD || 500;
  
  if (avgPPFD < targetPPFD * 0.8) return 'under-lit';
  if (avgPPFD > targetPPFD * 1.2) return 'over-lit';
  
  return 'optimal';
}

// Generate smart lighting actions based on plant types
function generateSmartLightingActions(plants: any[], room: any): DesignerAction[] {
  const actions: DesignerAction[] = [];
  
  // Group plants by crop type
  const plantsByType = plants.reduce((acc: any, plant: any) => {
    const cropId = plant.cropId || mapCropToAdvancedId(plant.variety);
    if (!cropId) return acc;
    
    if (!acc[cropId]) acc[cropId] = [];
    acc[cropId].push(plant);
    return acc;
  }, {});
  
  // Check each crop type for special lighting needs
  Object.entries(plantsByType).forEach(([cropId, plantGroup]: [string, any]) => {
    const cropSpec = ADVANCED_CROP_DATABASE[cropId];
    if (!cropSpec) return;
    
    // Check for interlighting needs (tall crops)
    if (cropSpec.lightingStrategies.interLighting?.recommended) {
      const plantRows = (plantGroup as any[]).map(p => ({
        x: p.x,
        y: p.y,
        height: cropSpec.architecture.matureHeight / 12 // Convert inches to feet
      }));
      
      actions.push({
        type: 'ADD_INTERLIGHTING',
        params: {
          plantRows,
          cropId,
          roomDimensions: room
        }
      });
    }
    
    // Check for under-canopy lighting needs (dense canopy crops)
    if (cropSpec.lightingStrategies.underCanopy?.beneficial) {
      const plantPositions = (plantGroup as any[]).map(p => ({
        x: p.x,
        y: p.y,
        canopyRadius: cropSpec.architecture.matureWidth / 24 // Convert inches to feet, then radius
      }));
      
      actions.push({
        type: 'ADD_UNDER_CANOPY_LIGHTING',
        params: {
          plantPositions,
          cropId
        }
      });
    }
  });
  
  return actions;
}