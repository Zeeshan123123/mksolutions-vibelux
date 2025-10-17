import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const results: any[] = [];

    // Test Claude API (if enabled)
    if (process.env.CLAUDE_API_KEY) {
      try {
        const claudeTest = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        
        results.push({
          service: 'Claude AI',
          status: claudeTest.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          service: 'Claude AI',
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Test OpenAI API (if enabled)
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiTest = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });
        
        results.push({
          service: 'OpenAI',
          status: openaiTest.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          service: 'OpenAI',
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const responseTime = Date.now() - startTime;
    const healthyServices = results.filter(r => r.status === 'healthy').length;
    const overallStatus = results.length === 0 ? 'healthy' : 
                         healthyServices === results.length ? 'healthy' : 
                         healthyServices > 0 ? 'degraded' : 'down';

    return NextResponse.json({
      status: overallStatus,
      responseTime,
      details: results.length > 0 ? 
        `${healthyServices}/${results.length} AI services operational` : 
        'No AI services configured',
      metrics: {
        configuredServices: results.length,
        healthyServices,
        services: results
      }
    });

  } catch (error) {
    logger.error('system', 'AI health check failed:', error);
    
    return NextResponse.json({
      status: 'down',
      error: error instanceof Error ? error.message : 'AI health check failed',
      details: 'Unable to test AI services'
    }, { status: 500 });
  }
}