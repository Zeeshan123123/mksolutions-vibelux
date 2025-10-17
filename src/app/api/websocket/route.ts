/**
 * WebSocket API Route Handler
 * Handles WebSocket upgrade requests in Next.js App Router
 */
export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server';
import { getWebSocketServer } from '@/lib/websocket/server';

export async function GET(request: NextRequest) {
  try {
    // Check if this is a WebSocket upgrade request
    const upgradeHeader = request.headers.get('upgrade');
    
    if (upgradeHeader !== 'websocket') {
      return new Response('This endpoint only accepts WebSocket connections', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // Get or create WebSocket server instance
    const wsServer = getWebSocketServer();
    
    // Return connection info
    return new Response(JSON.stringify({
      message: 'WebSocket server is running',
      stats: wsServer.getConnectionStats(),
      endpoint: process.env.WEBSOCKET_URL || 'ws://localhost:8080'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('WebSocket route error:', error);
    
    return new Response(JSON.stringify({
      error: 'WebSocket server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle WebSocket server status and stats
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const wsServer = getWebSocketServer();

    switch (action) {
      case 'broadcast_alert':
        wsServer.broadcastAlert(body.alert);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'broadcast_system_status':
        wsServer.broadcastSystemStatus(body.status);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'get_stats':
        return new Response(JSON.stringify({
          stats: wsServer.getConnectionStats()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('WebSocket POST route error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}