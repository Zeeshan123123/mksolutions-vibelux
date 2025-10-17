/**
 * HLP Client
 * Handles network communication for HLP protocol
 */

import * as dgram from 'dgram';
import * as net from 'net';
import { EventEmitter } from 'events';
import { HLPMessageFormatter } from './message-formatter';
import {
  HLPDevice,
  HLPMessage,
  HLPMessageType,
  HLPConfig,
  DEFAULT_HLP_CONFIG,
  HLPSetIntensityPayload,
  HLPSetSpectrumPayload,
  HLPSchedule,
  HLPGroup,
  HLPStatusPayload
} from './types';

export class HLPClient extends EventEmitter {
  private config: HLPConfig;
  private discoverySocket: dgram.Socket | null = null;
  private commandSockets: Map<string, net.Socket> = new Map();
  private devices: Map<string, HLPDevice> = new Map();
  private messageHandlers: Map<number, (message: HLPMessage) => void> = new Map();
  private discoveryInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<HLPConfig> = {}) {
    super();
    this.config = { ...DEFAULT_HLP_CONFIG, ...config };
  }

  /**
   * Start HLP client and device discovery
   */
  async start(): Promise<void> {
    await this.startDiscovery();
    this.emit('started');
  }

  /**
   * Stop HLP client
   */
  async stop(): Promise<void> {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }

    if (this.discoverySocket) {
      this.discoverySocket.close();
      this.discoverySocket = null;
    }

    for (const [deviceId, socket] of this.commandSockets) {
      socket.destroy();
    }
    this.commandSockets.clear();

    this.emit('stopped');
  }

  /**
   * Get all discovered devices
   */
  getDevices(): HLPDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): HLPDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Set light intensity
   */
  async setIntensity(
    deviceId: string,
    payload: HLPSetIntensityPayload
  ): Promise<boolean> {
    const message = HLPMessageFormatter.createSetIntensityCommand(deviceId, payload);
    return await this.sendCommand(deviceId, message);
  }

  /**
   * Set light spectrum
   */
  async setSpectrum(
    deviceId: string,
    payload: HLPSetSpectrumPayload
  ): Promise<boolean> {
    const message = HLPMessageFormatter.createSetSpectrumCommand(deviceId, payload);
    return await this.sendCommand(deviceId, message);
  }

  /**
   * Set schedule
   */
  async setSchedule(
    deviceId: string,
    schedule: HLPSchedule
  ): Promise<boolean> {
    const message = HLPMessageFormatter.createSetScheduleCommand(deviceId, schedule);
    return await this.sendCommand(deviceId, message);
  }

  /**
   * Set group
   */
  async setGroup(
    deviceId: string,
    group: HLPGroup
  ): Promise<boolean> {
    const message = HLPMessageFormatter.createSetGroupCommand(deviceId, group);
    return await this.sendCommand(deviceId, message);
  }

  /**
   * Get device status
   */
  async getStatus(deviceId: string): Promise<HLPStatusPayload | null> {
    const message = HLPMessageFormatter.createStatusRequest(deviceId);
    const response = await this.sendCommandWithResponse(deviceId, message);
    
    if (response && response.messageType === HLPMessageType.STATUS_RESPONSE) {
      return response.payload as HLPStatusPayload;
    }
    
    return null;
  }

  /**
   * Start device discovery
   */
  private async startDiscovery(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.discoverySocket = dgram.createSocket('udp4');

      this.discoverySocket.on('error', (error) => {
        logger.error('api', 'Discovery socket error:', error );
        reject(error);
      });

      this.discoverySocket.on('listening', () => {
        const address = this.discoverySocket!.address();
        logger.info('api', `HLP discovery listening on ${address.address}:${address.port}`);
        
        // Enable broadcast
        if (this.config.enableBroadcast) {
          this.discoverySocket!.setBroadcast(true);
        }

        // Join multicast group
        if (this.config.enableMulticast && this.config.multicastAddress) {
          this.discoverySocket!.addMembership(this.config.multicastAddress);
        }

        // Send initial discovery
        this.sendDiscoveryRequest();

        // Set up periodic discovery
        this.discoveryInterval = setInterval(() => {
          this.sendDiscoveryRequest();
        }, 30000); // Every 30 seconds

        resolve();
      });

      this.discoverySocket.on('message', (msg, rinfo) => {
        this.handleDiscoveryMessage(msg, rinfo);
      });

      this.discoverySocket.bind(this.config.discoveryPort);
    });
  }

  /**
   * Send discovery request
   */
  private sendDiscoveryRequest(): void {
    if (!this.discoverySocket) return;

    const message = HLPMessageFormatter.createDiscoveryRequest();
    
    // Broadcast
    if (this.config.enableBroadcast) {
      this.discoverySocket.send(message, this.config.discoveryPort, '255.255.255.255');
    }

    // Multicast
    if (this.config.enableMulticast && this.config.multicastAddress) {
      this.discoverySocket.send(message, this.config.discoveryPort, this.config.multicastAddress);
    }
  }

  /**
   * Handle discovery message
   */
  private handleDiscoveryMessage(buffer: Buffer, rinfo: dgram.RemoteInfo): void {
    const message = HLPMessageFormatter.decodeMessage(buffer);
    if (!message) return;

    if (message.messageType === HLPMessageType.DISCOVER_RESPONSE) {
      const device: HLPDevice = {
        id: message.deviceId,
        name: message.payload.name,
        manufacturer: message.payload.manufacturer,
        model: message.payload.model,
        serialNumber: message.payload.serialNumber,
        firmwareVersion: message.payload.firmwareVersion,
        ipAddress: rinfo.address,
        port: message.payload.commandPort || this.config.commandPort,
        status: 'online',
        capabilities: message.payload.capabilities,
        lastSeen: new Date()
      };

      const isNew = !this.devices.has(device.id);
      this.devices.set(device.id, device);

      if (isNew) {
        this.emit('deviceDiscovered', device);
      }
    }
  }

  /**
   * Get or create command socket for device
   */
  private async getCommandSocket(deviceId: string): Promise<net.Socket> {
    const existingSocket = this.commandSockets.get(deviceId);
    if (existingSocket && !existingSocket.destroyed) {
      return existingSocket;
    }

    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      
      socket.on('connect', () => {
        this.commandSockets.set(deviceId, socket);
        resolve(socket);
      });

      socket.on('error', (error) => {
        logger.error('api', `Command socket error for ${deviceId}:`, error);
        reject(error);
      });

      socket.on('close', () => {
        this.commandSockets.delete(deviceId);
      });

      socket.on('data', (data) => {
        this.handleCommandResponse(data);
      });

      socket.connect(device.port, device.ipAddress);
    });
  }

  /**
   * Send command to device
   */
  private async sendCommand(deviceId: string, message: Buffer): Promise<boolean> {
    try {
      const socket = await this.getCommandSocket(deviceId);
      
      return new Promise((resolve) => {
        socket.write(message, (error) => {
          if (error) {
            logger.error('api', `Error sending command to ${deviceId}:`, error);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      logger.error('api', `Failed to send command to ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Send command and wait for response
   */
  private async sendCommandWithResponse(
    deviceId: string,
    message: Buffer
  ): Promise<HLPMessage | null> {
    const decodedMessage = HLPMessageFormatter.decodeMessage(message);
    if (!decodedMessage) return null;

    return new Promise(async (resolve) => {
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(decodedMessage.sequenceNumber);
        resolve(null);
      }, this.config.commandTimeout);

      this.messageHandlers.set(decodedMessage.sequenceNumber, (response) => {
        clearTimeout(timeout);
        this.messageHandlers.delete(decodedMessage.sequenceNumber);
        resolve(response);
      });

      const sent = await this.sendCommand(deviceId, message);
      if (!sent) {
        clearTimeout(timeout);
        this.messageHandlers.delete(decodedMessage.sequenceNumber);
        resolve(null);
      }
    });
  }

  /**
   * Handle command response
   */
  private handleCommandResponse(buffer: Buffer): void {
    const message = HLPMessageFormatter.decodeMessage(buffer);
    if (!message) return;

    // Check if we have a handler waiting for this sequence number
    const handler = this.messageHandlers.get(message.sequenceNumber);
    if (handler) {
      handler(message);
      return;
    }

    // Handle unsolicited messages
    switch (message.messageType) {
      case HLPMessageType.EVENT_NOTIFICATION:
        this.emit('deviceEvent', message.deviceId, message.payload);
        break;
      
      case HLPMessageType.STATUS_RESPONSE:
        const device = this.devices.get(message.deviceId);
        if (device) {
          device.status = message.payload.deviceStatus;
          device.lastSeen = new Date();
          this.emit('deviceStatus', message.deviceId, message.payload);
        }
        break;
    }
  }
}