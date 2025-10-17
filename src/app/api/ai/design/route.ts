import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiDesignService, type DesignRequest } from '@/lib/ai/design-service'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, facilityType, dimensions, requirements } = body

    if (!prompt || !facilityType) {
      return NextResponse.json(
        { error: 'Prompt and facility type are required' },
        { status: 400 }
      )
    }

    // Create design request
    const designRequest: DesignRequest = {
      prompt,
      facilityType,
      dimensions,
      requirements
    }

    // Analyze complexity first
    const complexity = aiDesignService.analyzeComplexity(prompt)

    // TODO: Check user credits against estimated credits needed
    // For now, we'll proceed without credit checking

    // Generate the design
    const design = await aiDesignService.generateDesign(designRequest)

    // TODO: Deduct credits from user account
    // For now, we'll just return the design

    return NextResponse.json({
      success: true,
      design,
      complexity,
      creditsUsed: complexity.estimatedCredits
    })

  } catch (error) {
    console.error('AI design generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate design' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get('prompt')

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt parameter required for complexity analysis' },
        { status: 400 }
      )
    }

    // Analyze complexity without generating design
    const complexity = aiDesignService.analyzeComplexity(prompt)

    return NextResponse.json({
      success: true,
      complexity
    })

  } catch (error) {
    console.error('Complexity analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze complexity' },
      { status: 500 }
    )
  }
}