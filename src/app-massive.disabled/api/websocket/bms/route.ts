import { NextRequest } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Ensure this only runs in server runtime, not during build
  if (typeof window !== 'undefined') {
    return new Response('Not available in browser', { status: 400 });
  }
  
  // Skip WebSocket upgrade during build
  if (process.env.NODE_ENV === 'production' && !req.headers.get('upgrade')) {
    return new Response('WebSocket upgrade required', { status: 400 });
  }
  
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Upgrade to WebSocket
  const upgrade = req.headers.get('upgrade');
  if (upgrade !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }
  
  // Create WebSocket response
  const { socket, response } = upgradeWebSocket(req);
  
  // Handle WebSocket events
  socket.addEventListener('open', async () => {
    logger.info('api', 'BMS WebSocket connected');
    
    // Send initial stats
    try {
      const { dataCollectionService } = await import('@/lib/services/realtime-data-collection');
      const stats = dataCollectionService.getStats();
      socket.send(JSON.stringify({
        type: 'collectionStats',
        stats: Array.isArray(stats) ? stats : [stats]
      }));
    } catch (error) {
      logger.error('api', 'Failed to load data collection service:', error );
    }
  });
  
  // Subscribe to data collection events
  const handleDataCollected = (data: any) => {
    socket.send(JSON.stringify({
      type: 'deviceData',
      deviceId: data.deviceId,
      data
    }));
  };
  
  const handleCollectionError = (deviceId: string, error: Error) => {
    socket.send(JSON.stringify({
      type: 'collectionError',
      deviceId,
      error: error.message
    }));
  };
  
  const handleEmergencyStop = (data: any) => {
    socket.send(JSON.stringify({
      type: 'emergencyStop',
      active: true,
      ...data
    }));
  };
  
  const handleEmergencyStopReset = () => {
    socket.send(JSON.stringify({
      type: 'emergencyStop',
      active: false
    }));
  };
  
  // Register event listeners dynamically to avoid build-time issues
  try {
    const { dataCollectionService } = await import('@/lib/services/realtime-data-collection');
    const { deviceControlService } = await import('@/lib/services/device-control');
    
    dataCollectionService.on('dataCollected', handleDataCollected);
    dataCollectionService.on('collectionError', handleCollectionError);
    deviceControlService.on('emergencyStop', handleEmergencyStop);
    deviceControlService.on('emergencyStopReset', handleEmergencyStopReset);
  } catch (error) {
    logger.error('api', 'Failed to load services:', error );
  }
  
  // Handle client messages
  socket.addEventListener('message', async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'getStats':
          try {
            const { dataCollectionService } = await import('@/lib/services/realtime-data-collection');
            const stats = dataCollectionService.getStats(message.deviceId);
            socket.send(JSON.stringify({
              type: 'collectionStats',
              deviceId: message.deviceId,
              stats
            }));
          } catch (error) {
            logger.error('api', 'Failed to get stats:', error );
          }
          break;
          
        case 'subscribe':
          // Client wants to subscribe to specific device updates
          break;
          
        case 'unsubscribe':
          // Client wants to unsubscribe from device updates
          break;
      }
    } catch (error) {
      logger.error('api', 'WebSocket message error:', error );
    }
  });
  
  // Cleanup on disconnect
  socket.addEventListener('close', async () => {
    try {
      const { dataCollectionService } = await import('@/lib/services/realtime-data-collection');
      const { deviceControlService } = await import('@/lib/services/device-control');
      
      dataCollectionService.off('dataCollected', handleDataCollected);
      dataCollectionService.off('collectionError', handleCollectionError);
      deviceControlService.off('emergencyStop', handleEmergencyStop);
      deviceControlService.off('emergencyStopReset', handleEmergencyStopReset);
    } catch (error) {
      logger.error('api', 'Failed to cleanup services:', error );
    }
  });
  
  return response;
}

// WebSocket upgrade helper (using Deno.upgradeWebSocket or similar)
function upgradeWebSocket(req: NextRequest): { socket: any; response: Response } {
  // This is a placeholder - actual implementation depends on your runtime
  // For Next.js with Node.js, you might use a library like 'ws' or 'socket.io'
  // For edge runtime, you might use Deno.upgradeWebSocket
  
  // Return a mock socket that won't break during build
  const socket = {
    addEventListener: (event: string, handler: Function) => {
      // No-op during build
    },
    send: (data: string) => {
      // No-op during build
    }
  };
  
  const response = new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
    }
  });
  
  return { socket, response };
}