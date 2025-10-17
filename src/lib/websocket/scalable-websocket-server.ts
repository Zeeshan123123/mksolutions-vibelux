import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as HttpServer } from 'http';
import Redis from 'ioredis';
import { verifyToken } from '@/lib/auth/clerk-verify';
import { logger } from '@/lib/logging/production-logger';
import { db } from '@/lib/prisma';

// Redis configuration for pub/sub
const pubClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1 // Use different DB for pub/sub
});

const subClient = pubClient.duplicate();

// Handle Redis errors
pubClient.on('error', (err) => {
  logger.error('api', 'Redis pub client error', err);
});

subClient.on('error', (err) => {
  logger.error('api', 'Redis sub client error', err);
});

// WebSocket server interface
interface ScalableWebSocketServer {
  io: SocketIOServer;
  sendToUser: (userId: string, event: string, data: any) => void;
  sendToRoom: (roomId: string, event: string, data: any) => void;
  sendToFacility: (facilityId: string, event: string, data: any) => void;
  getConnectionCount: () => Promise<number>;
  getUserSockets: (userId: string) => Promise<string[]>;
}

// Create scalable WebSocket server
export function createScalableWebSocketServer(httpServer: HttpServer): ScalableWebSocketServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Use Redis adapter for horizontal scaling
  io.adapter(createAdapter(pubClient, subClient));

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = await verifyToken(token);
      if (!decoded || !decoded.sub) {
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket
      socket.data.userId = decoded.sub;
      socket.data.sessionId = decoded.sid;
      
      // Load user permissions
      const user = await db.user.findUnique({
        where: { clerkId: decoded.sub },
        select: { 
          id: true, 
          role: true, 
          organizationId: true,
          facilities: {
            select: { id: true }
          }
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.dbUserId = user.id;
      socket.data.role = user.role;
      socket.data.organizationId = user.organizationId;
      socket.data.facilityIds = user.facilities.map(f => f.id);

      logger.info('api', 'Client authenticated', {
        userId: decoded.sub,
        socketId: socket.id
      });

      next();
    } catch (error) {
      logger.error('api', 'Authentication failed', error as Error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const { userId, dbUserId, facilityIds } = socket.data;

    // Join user room
    socket.join(`user:${userId}`);
    socket.join(`dbuser:${dbUserId}`);

    // Join facility rooms
    facilityIds?.forEach((facilityId: string) => {
      socket.join(`facility:${facilityId}`);
    });

    // Track connection in Redis
    trackConnection(userId, socket.id, true);

    logger.info('api', 'Client connected', {
      userId,
      socketId: socket.id,
      transport: socket.conn.transport.name
    });

    // Handle subscription to channels
    socket.on('subscribe', async (channels: string[]) => {
      for (const channel of channels) {
        // Validate channel access
        if (await canAccessChannel(socket.data, channel)) {
          socket.join(channel);
          logger.debug('websocket', 'Subscribed to channel', { 
            userId, 
            channel 
          });
        }
      }
    });

    // Handle unsubscribe
    socket.on('unsubscribe', (channels: string[]) => {
      for (const channel of channels) {
        socket.leave(channel);
      }
    });

    // Real-time sensor data
    socket.on('sensor:subscribe', async (sensorIds: string[]) => {
      // Validate sensor access
      const accessibleSensors = await validateSensorAccess(dbUserId, sensorIds);
      
      accessibleSensors.forEach(sensorId => {
        socket.join(`sensor:${sensorId}`);
      });

      socket.emit('sensor:subscribed', accessibleSensors);
    });

    // Handle room updates
    socket.on('room:update', async (data: any) => {
      if (socket.data.role === 'admin' || socket.data.role === 'manager') {
        // Broadcast to all users in the facility
        io.to(`facility:${data.facilityId}`).emit('room:updated', data);
        
        // Log the update
        logger.info('api', 'Room updated', {
          userId,
          roomId: data.roomId,
          facilityId: data.facilityId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      trackConnection(userId, socket.id, false);
      
      logger.info('api', 'Client disconnected', {
        userId,
        socketId: socket.id,
        reason
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('api', 'Socket error', error);
    });
  });

  // Helper functions
  async function canAccessChannel(userData: any, channel: string): Promise<boolean> {
    // Implement channel access control
    if (channel.startsWith('user:') && channel === `user:${userData.userId}`) {
      return true;
    }
    
    if (channel.startsWith('facility:')) {
      const facilityId = channel.split(':')[1];
      return userData.facilityIds?.includes(facilityId) || false;
    }
    
    if (channel.startsWith('public:')) {
      return true;
    }
    
    return false;
  }

  async function validateSensorAccess(userId: string, sensorIds: string[]): Promise<string[]> {
    const sensors = await db.sensor.findMany({
      where: {
        id: { in: sensorIds },
        facility: {
          users: {
            some: { id: userId }
          }
        }
      },
      select: { id: true }
    });
    
    return sensors.map(s => s.id);
  }

  // Track connections in Redis for monitoring
  async function trackConnection(userId: string, socketId: string, connected: boolean) {
    const key = `ws:connections:${userId}`;
    
    if (connected) {
      await pubClient.sadd(key, socketId);
      await pubClient.expire(key, 3600); // 1 hour TTL
    } else {
      await pubClient.srem(key, socketId);
    }
  }

  // Public API
  const server: ScalableWebSocketServer = {
    io,
    
    sendToUser: (userId: string, event: string, data: any) => {
      io.to(`user:${userId}`).emit(event, data);
    },
    
    sendToRoom: (roomId: string, event: string, data: any) => {
      io.to(`room:${roomId}`).emit(event, data);
    },
    
    sendToFacility: (facilityId: string, event: string, data: any) => {
      io.to(`facility:${facilityId}`).emit(event, data);
    },
    
    getConnectionCount: async () => {
      const sockets = await io.fetchSockets();
      return sockets.length;
    },
    
    getUserSockets: async (userId: string) => {
      const key = `ws:connections:${userId}`;
      return await pubClient.smembers(key);
    }
  };

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('api', 'SIGTERM received, closing connections...');
    
    io.close(() => {
      logger.info('api', 'WebSocket server closed');
      pubClient.disconnect();
      subClient.disconnect();
    });
  });

  return server;
}

// Export singleton instance
let wsServer: ScalableWebSocketServer | null = null;

export function getWebSocketServer(httpServer?: HttpServer): ScalableWebSocketServer {
  if (!wsServer && httpServer) {
    wsServer = createScalableWebSocketServer(httpServer);
  }
  
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  
  return wsServer;
}