/**
 * WebSocket Server for Real-time Greenhouse Data Streaming
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  facilityId?: string;
  designId?: string;
  subscriptions?: Set<string>;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: string;
}

interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  metadata?: Record<string, any>;
}

interface ClimateReading {
  zoneId: string;
  temperature: number;
  humidity: number;
  co2?: number;
  vpd?: number;
  lightLevel?: number;
  timestamp: string;
}

interface EquipmentStatus {
  equipmentId: string;
  status: string;
  isActive: boolean;
  powerUsage?: number;
  efficiency?: number;
  timestamp: string;
}

export class GreenhouseWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private subscriptions: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({
      port,
      verifyClient: this.verifyClient.bind(this)
    });

    this.setupEventHandlers();
    logger.info('api', `WebSocket server started on port ${port}`);
  }

  private async verifyClient(info: { req: IncomingMessage }): Promise<boolean> {
    try {
      const url = parse(info.req.url || '', true);
      const token = url.query.token as string;

      if (!token) {
        logger.warn('api', 'WebSocket connection attempted without token');
        return false;
      }

      // Verify JWT token (adjust based on your auth system)
      const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Store user info for later use
      (info.req as any).userId = decoded.userId;
      (info.req as any).facilityId = url.query.facilityId as string;
      (info.req as any).designId = url.query.designId as string;

      return true;
    } catch (error) {
      logger.error('api', 'WebSocket authentication failed:', error);
      return false;
    }
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupDeadConnections();
    }, 30000); // Every 30 seconds

    // Set up health check
    setInterval(() => {
      this.sendHeartbeat();
    }, 60000); // Every minute
  }

  private handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage): void {
    const userId = (req as any).userId;
    const facilityId = (req as any).facilityId;
    const designId = (req as any).designId;

    ws.userId = userId;
    ws.facilityId = facilityId;
    ws.designId = designId;
    ws.subscriptions = new Set();

    // Add to clients map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);

    logger.info('api', `Client connected: ${userId}`, {
      facilityId,
      designId,
      totalConnections: this.getTotalConnections()
    });

    // Send welcome message
    this.sendMessage(ws, {
      type: 'connection_established',
      payload: {
        userId,
        facilityId,
        designId,
        timestamp: new Date().toISOString()
      }
    });

    // Set up message handlers
    ws.on('message', (data: Buffer) => {
      this.handleMessage(ws, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      logger.error('api', 'WebSocket error:', error);
      this.handleDisconnection(ws);
    });

    // Send initial data
    this.sendInitialData(ws);
  }

  private async handleMessage(ws: AuthenticatedWebSocket, data: Buffer): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscription(ws, message.payload);
          break;
        case 'unsubscribe':
          await this.handleUnsubscription(ws, message.payload);
          break;
        case 'sensor_reading':
          await this.handleSensorReading(ws, message.payload);
          break;
        case 'climate_reading':
          await this.handleClimateReading(ws, message.payload);
          break;
        case 'equipment_status':
          await this.handleEquipmentStatus(ws, message.payload);
          break;
        case 'ping':
          this.sendMessage(ws, { type: 'pong', payload: {} });
          break;
        default:
          logger.warn('api', `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('api', 'Error handling WebSocket message:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { message: 'Invalid message format' }
      });
    }
  }

  private async handleSubscription(ws: AuthenticatedWebSocket, payload: any): Promise<void> {
    const { channels } = payload;
    
    for (const channel of channels) {
      ws.subscriptions!.add(channel);
      
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel)!.add(ws);
      
      logger.debug('websocket', `Client ${ws.userId} subscribed to ${channel}`);
    }

    this.sendMessage(ws, {
      type: 'subscription_confirmed',
      payload: { channels }
    });
  }

  private async handleUnsubscription(ws: AuthenticatedWebSocket, payload: any): Promise<void> {
    const { channels } = payload;
    
    for (const channel of channels) {
      ws.subscriptions!.delete(channel);
      this.subscriptions.get(channel)?.delete(ws);
      
      logger.debug('websocket', `Client ${ws.userId} unsubscribed from ${channel}`);
    }

    this.sendMessage(ws, {
      type: 'unsubscription_confirmed',
      payload: { channels }
    });
  }

  private async handleSensorReading(ws: AuthenticatedWebSocket, payload: SensorReading): Promise<void> {
    try {
      // Validate sensor ownership
      const sensor = await this.validateSensorAccess(ws.userId!, payload.sensorId);
      if (!sensor) {
        this.sendMessage(ws, {
          type: 'error',
          payload: { message: 'Sensor not found or access denied' }
        });
        return;
      }

      // Store reading in database
      await prisma.sensorReading.create({
        data: {
          value: payload.value,
          unit: payload.unit,
          quality: payload.quality,
          timestamp: new Date(payload.timestamp),
          metadata: payload.metadata || {},
          ...(sensor.type === 'zone' ? 
            { zoneSensorId: payload.sensorId } : 
            { equipmentSensorId: payload.sensorId }
          )
        }
      });

      // Broadcast to subscribers
      const channel = `sensor:${payload.sensorId}`;
      this.broadcastToChannel(channel, {
        type: 'sensor_reading',
        payload: {
          ...payload,
          sensorName: sensor.name,
          sensorType: sensor.sensorType
        }
      });

      // Check for alerts
      await this.checkSensorAlerts(sensor, payload);

    } catch (error) {
      logger.error('api', 'Error handling sensor reading:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { message: 'Failed to process sensor reading' }
      });
    }
  }

  private async handleClimateReading(ws: AuthenticatedWebSocket, payload: ClimateReading): Promise<void> {
    try {
      // Validate zone access
      const zone = await this.validateZoneAccess(ws.userId!, payload.zoneId);
      if (!zone) {
        this.sendMessage(ws, {
          type: 'error',
          payload: { message: 'Zone not found or access denied' }
        });
        return;
      }

      // Store reading in database
      await prisma.climateReading.create({
        data: {
          zoneId: payload.zoneId,
          temperature: payload.temperature,
          humidity: payload.humidity,
          co2: payload.co2,
          vpd: payload.vpd,
          lightLevel: payload.lightLevel,
          readingAt: new Date(payload.timestamp),
          metadata: {}
        }
      });

      // Broadcast to subscribers
      const channel = `climate:${payload.zoneId}`;
      this.broadcastToChannel(channel, {
        type: 'climate_reading',
        payload: {
          ...payload,
          zoneName: zone.name,
          zoneType: zone.zoneType
        }
      });

      // Check for climate alerts
      await this.checkClimateAlerts(zone, payload);

    } catch (error) {
      logger.error('api', 'Error handling climate reading:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { message: 'Failed to process climate reading' }
      });
    }
  }

  private async handleEquipmentStatus(ws: AuthenticatedWebSocket, payload: EquipmentStatus): Promise<void> {
    try {
      // Validate equipment access
      const equipment = await this.validateEquipmentAccess(ws.userId!, payload.equipmentId);
      if (!equipment) {
        this.sendMessage(ws, {
          type: 'error',
          payload: { message: 'Equipment not found or access denied' }
        });
        return;
      }

      // Update equipment status in database
      await prisma.greenhouseEquipment.update({
        where: { id: payload.equipmentId },
        data: {
          status: payload.status as any,
          isActive: payload.isActive,
          updatedAt: new Date()
        }
      });

      // Broadcast to subscribers
      const channel = `equipment:${payload.equipmentId}`;
      this.broadcastToChannel(channel, {
        type: 'equipment_status',
        payload: {
          ...payload,
          equipmentName: equipment.name,
          equipmentType: equipment.equipmentType
        }
      });

    } catch (error) {
      logger.error('api', 'Error handling equipment status:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { message: 'Failed to process equipment status' }
      });
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket): void {
    const userId = ws.userId;
    if (!userId) return;

    // Remove from clients
    this.clients.get(userId)?.delete(ws);
    if (this.clients.get(userId)?.size === 0) {
      this.clients.delete(userId);
    }

    // Remove from subscriptions
    ws.subscriptions?.forEach(channel => {
      this.subscriptions.get(channel)?.delete(ws);
      if (this.subscriptions.get(channel)?.size === 0) {
        this.subscriptions.delete(channel);
      }
    });

    logger.info('api', `Client disconnected: ${userId}`, {
      totalConnections: this.getTotalConnections()
    });
  }

  private async sendInitialData(ws: AuthenticatedWebSocket): Promise<void> {
    if (!ws.designId) return;

    try {
      // Get latest readings for the design
      const design = await prisma.greenhouseDesign.findFirst({
        where: {
          id: ws.designId,
          userId: ws.userId
        },
        include: {
          zones: {
            include: {
              climateData: {
                take: 1,
                orderBy: { readingAt: 'desc' }
              },
              sensors: {
                include: {
                  readings: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                  }
                }
              }
            }
          },
          equipment: {
            include: {
              sensors: {
                include: {
                  readings: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                  }
                }
              }
            }
          }
        }
      });

      if (design) {
        this.sendMessage(ws, {
          type: 'initial_data',
          payload: {
            design: {
              id: design.id,
              name: design.name,
              status: design.status
            },
            zones: design.zones.map(zone => ({
              id: zone.id,
              name: zone.name,
              latestClimate: zone.climateData[0] || null,
              sensorCount: zone.sensors.length,
              latestReadings: zone.sensors.map(sensor => ({
                sensorId: sensor.id,
                sensorType: sensor.sensorType,
                latestReading: sensor.readings[0] || null
              }))
            })),
            equipment: design.equipment.map(eq => ({
              id: eq.id,
              name: eq.name,
              status: eq.status,
              isActive: eq.isActive,
              sensorCount: eq.sensors.length
            }))
          }
        });
      }
    } catch (error) {
      logger.error('api', 'Error sending initial data:', error);
    }
  }

  private sendMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  private broadcastToChannel(channel: string, message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;

    const messageStr = JSON.stringify({
      ...message,
      channel,
      timestamp: new Date().toISOString()
    });

    subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });

    logger.debug('websocket', `Broadcasted to channel ${channel}`, {
      subscriberCount: subscribers.size
    });
  }

  private broadcastToUser(userId: string, message: WebSocketMessage): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const messageStr = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    userClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  private sendHeartbeat(): void {
    const heartbeat = {
      type: 'heartbeat',
      payload: {
        timestamp: new Date().toISOString(),
        connections: this.getTotalConnections()
      }
    };

    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(heartbeat));
      }
    });
  }

  private cleanupDeadConnections(): void {
    let cleaned = 0;
    
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        this.handleDisconnection(ws as AuthenticatedWebSocket);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      logger.info('api', `Cleaned up ${cleaned} dead connections`);
    }
  }

  private getTotalConnections(): number {
    return this.wss.clients.size;
  }

  // Validation helpers
  private async validateSensorAccess(userId: string, sensorId: string): Promise<any> {
    // Check zone sensors
    const zoneSensor = await prisma.zoneSensor.findFirst({
      where: {
        id: sensorId,
        zone: {
          design: { userId }
        }
      },
      include: {
        zone: true
      }
    });

    if (zoneSensor) {
      return { ...zoneSensor, type: 'zone' };
    }

    // Check equipment sensors
    const equipmentSensor = await prisma.equipmentSensor.findFirst({
      where: {
        id: sensorId,
        equipment: {
          design: { userId }
        }
      },
      include: {
        equipment: true
      }
    });

    return equipmentSensor ? { ...equipmentSensor, type: 'equipment' } : null;
  }

  private async validateZoneAccess(userId: string, zoneId: string): Promise<any> {
    return await prisma.greenhouseZone.findFirst({
      where: {
        id: zoneId,
        design: { userId }
      }
    });
  }

  private async validateEquipmentAccess(userId: string, equipmentId: string): Promise<any> {
    return await prisma.greenhouseEquipment.findFirst({
      where: {
        id: equipmentId,
        design: { userId }
      }
    });
  }

  private async checkSensorAlerts(sensor: any, reading: SensorReading): Promise<void> {
    // Implement sensor alert logic
    // This would check thresholds and create alerts as needed
  }

  private async checkClimateAlerts(zone: any, reading: ClimateReading): Promise<void> {
    // Implement climate alert logic
    // This would check temperature, humidity, etc. against targets
  }

  // Public API methods
  public broadcastAlert(alert: any): void {
    this.broadcastToChannel('alerts', {
      type: 'alert',
      payload: alert
    });
  }

  public broadcastSystemStatus(status: any): void {
    this.broadcastToChannel('system', {
      type: 'system_status',
      payload: status
    });
  }

  public getConnectionStats(): any {
    return {
      totalConnections: this.getTotalConnections(),
      uniqueUsers: this.clients.size,
      activeChannels: this.subscriptions.size
    };
  }

  public close(): void {
    this.wss.close();
    logger.info('api', 'WebSocket server closed');
  }
}

// Export singleton instance
let wsServer: GreenhouseWebSocketServer;

export function getWebSocketServer(): GreenhouseWebSocketServer {
  if (!wsServer) {
    wsServer = new GreenhouseWebSocketServer(
      parseInt(process.env.WEBSOCKET_PORT || '8080')
    );
  }
  return wsServer;
}