import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Simulate plant health analysis
    const analysisResult = {
      healthScore: Math.floor(Math.random() * 40) + 60, // 60-100% health
      conditions: generateConditions(),
      diseases: generateDiseases(),
      pests: generatePests(),
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
      recommendations: generateRecommendations(),
      timestamp: new Date().toISOString(),
      fileName: image.name,
      fileSize: image.size
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    })

  } catch (error) {
    console.error('Plant analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

function generateConditions(): string[] {
  const allConditions = [
    'Optimal leaf color detected',
    'Good leaf structure and thickness',
    'Healthy growth patterns observed',
    'Minor nutrient deficiency indicators',
    'Slight water stress visible',
    'Light burn on upper leaves',
    'Calcium deficiency spots'
  ]
  
  const numConditions = Math.floor(Math.random() * 3) + 1
  return allConditions.slice(0, numConditions)
}

function generateDiseases(): string[] {
  const allDiseases = [
    'Powdery Mildew',
    'Leaf Spot',
    'Bacterial Blight',
    'Fusarium Wilt'
  ]
  
  // 30% chance of disease detection
  if (Math.random() < 0.3) {
    return [allDiseases[Math.floor(Math.random() * allDiseases.length)]]
  }
  
  return []
}

function generatePests(): string[] {
  const allPests = [
    'Aphids',
    'Spider Mites',
    'Thrips',
    'Whiteflies'
  ]
  
  // 25% chance of pest detection
  if (Math.random() < 0.25) {
    return [allPests[Math.floor(Math.random() * allPests.length)]]
  }
  
  return []
}

function generateRecommendations(): string[] {
  const allRecommendations = [
    'Maintain current watering schedule',
    'Increase humidity to 60-70%',
    'Adjust LED spectrum for flowering stage',
    'Apply organic fertilizer with calcium',
    'Improve air circulation around plants',
    'Monitor pH levels daily',
    'Reduce light intensity by 10%',
    'Increase nutrient concentration slightly'
  ]
  
  const numRecommendations = Math.floor(Math.random() * 4) + 3
  return allRecommendations.slice(0, numRecommendations)
}