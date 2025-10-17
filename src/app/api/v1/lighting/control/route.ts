import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logging/production-logger'
export const dynamic = 'force-dynamic'

interface LightingControlRequest {
  action: 'set_intensity' | 'set_spectrum' | 'set_schedule' | 'toggle'
  target: 'system' | 'zone' | 'fixture'
  targetId?: string
  parameters: {
    intensity?: number // 0-100
    spectrum?: {
      red?: number
      blue?: number
      green?: number
      farRed?: number
      uv?: number
      white?: number
    }
    schedule?: {
      on: string // HH:MM
      off: string // HH:MM
      rampTime?: number // minutes
    }
    enabled?: boolean
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Add proper API key validation
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body: LightingControlRequest = await req.json()
    
    // Validate request
    if (!body.action || !body.target || !body.parameters) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }
    
    // Validate parameters based on action
    switch (body.action) {
      case 'set_intensity':
        if (typeof body.parameters.intensity !== 'number' || 
            body.parameters.intensity < 0 || 
            body.parameters.intensity > 100) {
          return NextResponse.json(
            { error: 'Intensity must be between 0 and 100' },
            { status: 400 }
          )
        }
        break
        
      case 'set_spectrum':
        if (!body.parameters.spectrum) {
          return NextResponse.json(
            { error: 'Spectrum parameters required' },
            { status: 400 }
          )
        }
        const spectrumTotal = Object.values(body.parameters.spectrum).reduce((sum, val) => sum + (val || 0), 0)
        if (Math.abs(spectrumTotal - 100) > 0.1) {
          return NextResponse.json(
            { error: 'Spectrum values must sum to 100%' },
            { status: 400 }
          )
        }
        break
        
      case 'set_schedule':
        if (!body.parameters.schedule) {
          return NextResponse.json(
            { error: 'Schedule parameters required' },
            { status: 400 }
          )
        }
        break
        
      case 'toggle':
        if (typeof body.parameters.enabled !== 'boolean') {
          return NextResponse.json(
            { error: 'Enabled parameter must be boolean' },
            { status: 400 }
          )
        }
        break
    }
    
    // Mock command execution (in production, send to hardware controller)
    const commandResult = {
      success: true,
      action: body.action,
      target: body.target,
      targetId: body.targetId,
      parameters: body.parameters,
      executedAt: new Date().toISOString(),
      affectedFixtures: body.target === 'system' ? 48 : body.target === 'zone' ? 24 : 1,
      estimatedCompletion: new Date(Date.now() + 5000).toISOString()
    }
    
    // Mock real-time update notification (in production, use WebSocket)
    setTimeout(() => {
    }, 5000)
    
    logger.info('api', `Lighting control command executed: ${body.action} on ${body.target}`)
    
    return NextResponse.json({
      ...commandResult,
      version: '1.0',
      command_id: `cmd_${Date.now()}`
    })
    
  } catch (error) {
    logger.error('api', 'Lighting control error:', error instanceof Error ? error : new Error(String(error)))
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}