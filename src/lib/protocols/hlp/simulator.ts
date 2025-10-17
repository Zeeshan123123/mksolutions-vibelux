/**
 * HLP Device Simulator
 * Simulates HLP-compatible lighting devices for testing
 */

import * as dgram from 'dgram';
import * as net from 'net';
import { HLPMessageFormatter } from './message-formatter';
import {
  HLPMessage,
  HLPMessageType,
  HLPChannel,
  HLPChannelType,
  HLPCapabilities,
  HLPStatusPayload,
  DEFAULT_HLP_CONFIG
} from './types';

export interface SimulatedDeviceConfig {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  capabilities: HLPCapabilities;
  initialChannels?: HLPChannel[];
}

export class HLPDeviceSimulator {
  private config: SimulatedDeviceConfig;
  private discoverySocket: dgram.Socket | null = null;
  private commandServer: net.Server | null = null;
  private channels: HLPChannel[] = [];
  private schedules: Map<string, any> = new Map();
  private groups: Map<string, any> = new Map();
  private isRunning = false;
  private commandPort: number;

  constructor(config: SimulatedDeviceConfig) {
    this.config = config;
    this.commandPort = 50001 + Math.floor(Math.random() * 1000); // Random port
    
    // Initialize channels
    if (config.initialChannels) {
      this.channels = config.initialChannels;
    } else {
      this.channels = this.createDefaultChannels();
    }
  }

  /**
   * Start the simulated device
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    await this.startDiscoveryListener();
    await this.startCommandServer();
    this.isRunning = true;
    
    logger.info('api', `HLP Device Simulator started: ${this.config.name} (${this.config.id})`);
  }

  /**
   * Stop the simulated device
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.discoverySocket) {
      this.discoverySocket.close();
      this.discoverySocket = null;
    }

    if (this.commandServer) {
      this.commandServer.close();
      this.commandServer = null;
    }

    this.isRunning = false;
    logger.info('api', `HLP Device Simulator stopped: ${this.config.name}`);
  }

  /**
   * Get command port
   */
  getCommandPort(): number {
    return this.commandPort;
  }

  /**
   * Create default channels based on capabilities
   */
  private createDefaultChannels(): HLPChannel[] {
    const channels: HLPChannel[] = [];
    const channelTypes = this.config.capabilities.supportedChannelTypes;
    
    channelTypes.forEach((type, index) => {
      channels.push({
        channelId: index,
        type: type as HLPChannelType,
        intensity: 0,
        actualPower: 0,
        targetPower: 0
      });
    });
    
    return channels;
  }

  /**
   * Start discovery listener
   */
  private async startDiscoveryListener(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.discoverySocket = dgram.createSocket('udp4');

      this.discoverySocket.on('error', (error) => {
        logger.error('api', 'Discovery socket error:', error );
        reject(error);
      });

      this.discoverySocket.on('listening', () => {
        const address = this.discoverySocket!.address();
        
        // Enable broadcast reception
        this.discoverySocket!.setBroadcast(true);
        
        // Join multicast group if configured
        if (DEFAULT_HLP_CONFIG.enableMulticast && DEFAULT_HLP_CONFIG.multicastAddress) {
          try {
            this.discoverySocket!.addMembership(DEFAULT_HLP_CONFIG.multicastAddress);
          } catch (error) {
            logger.warn('api', 'Could not join multicast group:', { data: error  });
          }
        }
        
        resolve();
      });

      this.discoverySocket.on('message', (msg, rinfo) => {
        this.handleDiscoveryRequest(msg, rinfo);
      });

      this.discoverySocket.bind(DEFAULT_HLP_CONFIG.discoveryPort);
    });
  }

  /**
   * Start command server
   */
  private async startCommandServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.commandServer = net.createServer((socket) => {
        socket.on('data', (data) => {
          this.handleCommand(data, socket);
        });
        
        socket.on('error', (error) => {
          logger.error('api', 'Command socket error:', error );
        });
      });

      this.commandServer.on('error', (error) => {
        logger.error('api', 'Command server error:', error );
        reject(error);
      });

      this.commandServer.listen(this.commandPort, '0.0.0.0', () => {
        resolve();
      });
    });
  }

  /**
   * Handle discovery request
   */
  private handleDiscoveryRequest(buffer: Buffer, rinfo: dgram.RemoteInfo): void {
    const message = HLPMessageFormatter.decodeMessage(buffer);
    if (!message || message.messageType !== HLPMessageType.DISCOVER_REQUEST) {
      return;
    }

    // Create discovery response
    const response: HLPMessage = {
      version: '1.1.0',
      messageType: HLPMessageType.DISCOVER_RESPONSE,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: message.sequenceNumber,
      payload: {
        name: this.config.name,
        manufacturer: this.config.manufacturer,
        model: this.config.model,
        serialNumber: this.config.serialNumber,
        firmwareVersion: this.config.firmwareVersion,
        commandPort: this.commandPort,
        capabilities: this.config.capabilities
      }
    };

    const responseBuffer = HLPMessageFormatter['encodeMessage'](response);
    this.discoverySocket!.send(responseBuffer, rinfo.port, rinfo.address);
  }

  /**
   * Handle command
   */
  private handleCommand(buffer: Buffer, socket: net.Socket): void {
    const message = HLPMessageFormatter.decodeMessage(buffer);
    if (!message || message.deviceId !== this.config.id) {
      return;
    }

    let response: HLPMessage | null = null;

    switch (message.messageType) {
      case HLPMessageType.DEVICE_INFO_REQUEST:
        response = this.handleDeviceInfoRequest(message);
        break;
        
      case HLPMessageType.SET_INTENSITY:
        response = this.handleSetIntensity(message);
        break;
        
      case HLPMessageType.SET_SPECTRUM:
        response = this.handleSetSpectrum(message);
        break;
        
      case HLPMessageType.SET_SCHEDULE:
        response = this.handleSetSchedule(message);
        break;
        
      case HLPMessageType.SET_GROUP:
        response = this.handleSetGroup(message);
        break;
        
      case HLPMessageType.STATUS_REQUEST:
        response = this.handleStatusRequest(message);
        break;
    }

    if (response) {
      const responseBuffer = HLPMessageFormatter['encodeMessage'](response);
      socket.write(responseBuffer);
    }
  }

  /**
   * Handle device info request
   */
  private handleDeviceInfoRequest(request: HLPMessage): HLPMessage {
    return {
      version: '1.1.0',
      messageType: HLPMessageType.DEVICE_INFO_RESPONSE,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: request.sequenceNumber,
      payload: {
        ...this.config,
        channels: this.channels,
        scheduleCount: this.schedules.size,
        groupCount: this.groups.size
      }
    };
  }

  /**
   * Handle set intensity
   */
  private handleSetIntensity(request: HLPMessage): HLPMessage {
    const { channels } = request.payload;
    
    // Update channel intensities
    channels.forEach((update: any) => {
      const channel = this.channels.find(c => c.channelId === update.channelId);
      if (channel) {
        channel.intensity = update.intensity;
        // Simulate power calculation (simplified)
        channel.targetPower = (update.intensity / 100) * 50; // 50W max per channel
        
        // Simulate ramp time
        if (update.rampTime) {
          setTimeout(() => {
            channel.actualPower = channel.targetPower;
          }, update.rampTime * 1000);
        } else {
          channel.actualPower = channel.targetPower;
        }
      }
    });

    return {
      version: '1.1.0',
      messageType: HLPMessageType.ACK,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: request.sequenceNumber,
      payload: { success: true }
    };
  }

  /**
   * Handle set spectrum
   */
  private handleSetSpectrum(request: HLPMessage): HLPMessage {
    const { spectrum, maintainPPFD } = request.payload;
    
    // Update channel intensities based on spectrum
    Object.entries(spectrum).forEach(([channelType, intensity]) => {
      const channel = this.channels.find(c => c.type === channelType);
      if (channel && typeof intensity === 'number') {
        channel.intensity = intensity;
        channel.targetPower = (intensity / 100) * 50;
        channel.actualPower = channel.targetPower;
      }
    });

    return {
      version: '1.1.0',
      messageType: HLPMessageType.ACK,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: request.sequenceNumber,
      payload: { success: true }
    };
  }

  /**
   * Handle set schedule
   */
  private handleSetSchedule(request: HLPMessage): HLPMessage {
    const schedule = request.payload;
    this.schedules.set(schedule.scheduleId, schedule);

    return {
      version: '1.1.0',
      messageType: HLPMessageType.ACK,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: request.sequenceNumber,
      payload: { success: true }
    };
  }

  /**
   * Handle set group
   */
  private handleSetGroup(request: HLPMessage): HLPMessage {
    const group = request.payload;
    this.groups.set(group.groupId, group);

    return {
      version: '1.1.0',
      messageType: HLPMessageType.ACK,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: request.sequenceNumber,
      payload: { success: true }
    };
  }

  /**
   * Handle status request
   */
  private handleStatusRequest(request: HLPMessage): HLPMessage {
    const totalPower = this.channels.reduce((sum, ch) => sum + ch.actualPower, 0);
    
    const status: HLPStatusPayload = {
      deviceStatus: 'online',
      channels: this.channels,
      totalPower,
      temperature: 25 + Math.random() * 10, // Simulate temperature
      errors: []
    };

    return {
      version: '1.1.0',
      messageType: HLPMessageType.STATUS_RESPONSE,
      timestamp: new Date(),
      deviceId: this.config.id,
      sequenceNumber: request.sequenceNumber,
      payload: status
    };
  }
}

/**
 * Create and start multiple simulated devices
 */
export async function startSimulatedHLPDevices(count: number = 3): Promise<HLPDeviceSimulator[]> {
  const simulators: HLPDeviceSimulator[] = [];
  
  const deviceConfigs: SimulatedDeviceConfig[] = [
    {
      id: 'sim-hlp-001',
      name: 'HLP Simulator - Zone 1',
      manufacturer: 'VibeLux',
      model: 'HLP-SIM-1000',
      serialNumber: 'SIM001',
      firmwareVersion: '1.0.0',
      capabilities: {
        maxChannels: 6,
        supportedChannelTypes: [
          HLPChannelType.RED,
          HLPChannelType.BLUE,
          HLPChannelType.GREEN,
          HLPChannelType.FAR_RED,
          HLPChannelType.UV,
          HLPChannelType.WHITE
        ],
        supportsDimming: true,
        supportsScheduling: true,
        supportsGrouping: true,
        maxGroups: 10,
        maxSchedules: 20
      }
    },
    {
      id: 'sim-hlp-002',
      name: 'HLP Simulator - Zone 2',
      manufacturer: 'VibeLux',
      model: 'HLP-SIM-2000',
      serialNumber: 'SIM002',
      firmwareVersion: '1.0.0',
      capabilities: {
        maxChannels: 4,
        supportedChannelTypes: [
          HLPChannelType.RED,
          HLPChannelType.BLUE,
          HLPChannelType.FAR_RED,
          HLPChannelType.WHITE
        ],
        supportsDimming: true,
        supportsScheduling: true,
        supportsGrouping: true,
        maxGroups: 5,
        maxSchedules: 10
      }
    },
    {
      id: 'sim-hlp-003',
      name: 'HLP Simulator - Greenhouse',
      manufacturer: 'VibeLux',
      model: 'HLP-SIM-3000',
      serialNumber: 'SIM003',
      firmwareVersion: '1.0.0',
      capabilities: {
        maxChannels: 8,
        supportedChannelTypes: [
          HLPChannelType.RED,
          HLPChannelType.BLUE,
          HLPChannelType.GREEN,
          HLPChannelType.FAR_RED,
          HLPChannelType.UV,
          HLPChannelType.WARM_WHITE,
          HLPChannelType.COOL_WHITE,
          HLPChannelType.WHITE
        ],
        supportsDimming: true,
        supportsScheduling: true,
        supportsGrouping: true,
        maxGroups: 20,
        maxSchedules: 50
      }
    }
  ];

  for (let i = 0; i < Math.min(count, deviceConfigs.length); i++) {
    const simulator = new HLPDeviceSimulator(deviceConfigs[i]);
    await simulator.start();
    simulators.push(simulator);
  }

  return simulators;
}