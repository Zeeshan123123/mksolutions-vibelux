/**
 * HLP Manager
 * High-level interface for managing HLP devices and integration with VibeLux
 */

import { EventEmitter } from 'events';
import { HLPClient } from './client';
import {
  HLPDevice,
  HLPChannelType,
  HLPSetSpectrumPayload,
  HLPSchedule,
  HLPGroup,
  HLPConfig,
  HLPStatusPayload
} from './types';
import { prisma } from '@/lib/prisma';

export interface HLPRecipeMapping {
  recipeId: string;
  deviceId: string;
  zoneId: string;
  channelMappings: {
    channelType: HLPChannelType;
    channelId: number;
  }[];
}

export class HLPManager extends EventEmitter {
  private client: HLPClient;
  private recipeMappings: Map<string, HLPRecipeMapping[]> = new Map();
  private deviceZoneMappings: Map<string, string> = new Map(); // deviceId -> zoneId
  private isStarted = false;

  constructor(config?: Partial<HLPConfig>) {
    super();
    this.client = new HLPClient(config);
    this.setupEventHandlers();
  }

  /**
   * Start HLP manager
   */
  async start(): Promise<void> {
    if (this.isStarted) return;
    
    await this.client.start();
    await this.loadMappings();
    this.isStarted = true;
    
    // Start periodic status polling
    setInterval(() => this.pollDeviceStatus(), 30000);
  }

  /**
   * Stop HLP manager
   */
  async stop(): Promise<void> {
    if (!this.isStarted) return;
    
    await this.client.stop();
    this.isStarted = false;
  }

  /**
   * Get all HLP devices
   */
  getDevices(): HLPDevice[] {
    return this.client.getDevices();
  }

  /**
   * Get devices in a specific zone
   */
  getDevicesByZone(zoneId: string): HLPDevice[] {
    const devices = this.client.getDevices();
    return devices.filter(device => 
      this.deviceZoneMappings.get(device.id) === zoneId
    );
  }

  /**
   * Apply recipe to zone
   */
  async applyRecipeToZone(recipeId: string, zoneId: string): Promise<boolean> {
    try {
      // Get recipe from database
      const recipe = await prisma.lightRecipe.findUnique({
        where: { id: recipeId }
      });

      if (!recipe) {
        logger.error('api', `Recipe ${recipeId} not found`);
        return false;
      }

      // Get devices in zone
      const devices = this.getDevicesByZone(zoneId);
      if (devices.length === 0) {
        logger.error('api', `No devices found in zone ${zoneId}`);
        return false;
      }

      // Convert recipe to HLP spectrum payload
      const spectrumPayload: HLPSetSpectrumPayload = {
        spectrum: {
          [HLPChannelType.BLUE]: recipe.spectrumBlue || 0,
          [HLPChannelType.GREEN]: recipe.spectrumGreen || 0,
          [HLPChannelType.RED]: recipe.spectrumRed || 0,
          [HLPChannelType.FAR_RED]: recipe.spectrumFarRed || 0,
          [HLPChannelType.UV]: recipe.spectrumUV || 0
        },
        rampTime: recipe.rampUpMinutes ? recipe.rampUpMinutes * 60 : 0,
        maintainPPFD: true
      };

      // Apply to all devices in zone
      const results = await Promise.all(
        devices.map(device => 
          this.client.setSpectrum(device.id, spectrumPayload)
        )
      );

      const success = results.every(r => r);
      
      if (success) {
        // Store mapping for future reference
        const mappings: HLPRecipeMapping[] = devices.map(device => ({
          recipeId,
          deviceId: device.id,
          zoneId,
          channelMappings: this.getDefaultChannelMappings(device)
        }));
        
        this.recipeMappings.set(`${recipeId}-${zoneId}`, mappings);
        this.emit('recipeApplied', { recipeId, zoneId, devices: devices.length });
      }

      return success;
    } catch (error) {
      logger.error('api', 'Error applying recipe to zone:', error );
      return false;
    }
  }

  /**
   * Apply schedule to zone
   */
  async applyScheduleToZone(
    scheduleData: Partial<HLPSchedule>,
    zoneId: string
  ): Promise<boolean> {
    try {
      const devices = this.getDevicesByZone(zoneId);
      if (devices.length === 0) return false;

      const schedule: HLPSchedule = {
        scheduleId: `zone-${zoneId}-${Date.now()}`,
        name: scheduleData.name || `Zone ${zoneId} Schedule`,
        enabled: true,
        startTime: scheduleData.startTime || '08:00',
        endTime: scheduleData.endTime || '20:00',
        rampDuration: scheduleData.rampDuration || 30,
        channels: scheduleData.channels || [],
        repeatDays: scheduleData.repeatDays || [0, 1, 2, 3, 4, 5, 6]
      };

      const results = await Promise.all(
        devices.map(device => 
          this.client.setSchedule(device.id, schedule)
        )
      );

      return results.every(r => r);
    } catch (error) {
      logger.error('api', 'Error applying schedule to zone:', error );
      return false;
    }
  }

  /**
   * Set intensity for zone
   */
  async setZoneIntensity(
    zoneId: string,
    intensity: number,
    rampTime?: number
  ): Promise<boolean> {
    try {
      const devices = this.getDevicesByZone(zoneId);
      if (devices.length === 0) return false;

      const results = await Promise.all(
        devices.map(device => {
          // Get all channels for device
          const channels = device.capabilities.supportedChannelTypes.map((type, index) => ({
            channelId: index,
            intensity,
            rampTime
          }));

          return this.client.setIntensity(device.id, { channels });
        })
      );

      return results.every(r => r);
    } catch (error) {
      logger.error('api', 'Error setting zone intensity:', error );
      return false;
    }
  }

  /**
   * Create device group
   */
  async createDeviceGroup(
    groupName: string,
    deviceIds: string[],
    channelSettings?: { [key in HLPChannelType]?: number }
  ): Promise<boolean> {
    try {
      const group: HLPGroup = {
        groupId: `group-${Date.now()}`,
        name: groupName,
        deviceIds,
        channels: Object.entries(channelSettings || {}).map(([type, intensity]) => ({
          channelType: type as HLPChannelType,
          intensity: intensity as number
        }))
      };

      // Send group to first device (it will propagate to others)
      if (deviceIds.length > 0) {
        return await this.client.setGroup(deviceIds[0], group);
      }

      return false;
    } catch (error) {
      logger.error('api', 'Error creating device group:', error );
      return false;
    }
  }

  /**
   * Get zone status
   */
  async getZoneStatus(zoneId: string): Promise<{
    online: number;
    offline: number;
    totalPower: number;
    averageIntensity: number;
  }> {
    const devices = this.getDevicesByZone(zoneId);
    let online = 0;
    let offline = 0;
    let totalPower = 0;
    let totalIntensity = 0;
    let channelCount = 0;

    for (const device of devices) {
      const status = await this.client.getStatus(device.id);
      
      if (status) {
        if (status.deviceStatus === 'online') {
          online++;
        } else {
          offline++;
        }
        
        totalPower += status.totalPower;
        
        // Calculate average intensity across all channels
        status.channels.forEach(channel => {
          totalIntensity += channel.intensity;
          channelCount++;
        });
      } else {
        offline++;
      }
    }

    return {
      online,
      offline,
      totalPower,
      averageIntensity: channelCount > 0 ? totalIntensity / channelCount : 0
    };
  }

  /**
   * Map device to zone
   */
  async mapDeviceToZone(deviceId: string, zoneId: string): Promise<void> {
    this.deviceZoneMappings.set(deviceId, zoneId);
    
    // Persist to database
    await prisma.lightingDevice.upsert({
      where: { deviceId },
      create: {
        deviceId,
        zoneId,
        protocol: 'HLP',
        manufacturer: this.client.getDevice(deviceId)?.manufacturer || 'Unknown',
        model: this.client.getDevice(deviceId)?.model || 'Unknown',
        status: 'online'
      },
      update: {
        zoneId
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('deviceDiscovered', (device: HLPDevice) => {
      logger.info('api', `HLP device discovered: ${device.name} (${device.id})`);
      this.emit('deviceDiscovered', device);
    });

    this.client.on('deviceEvent', (deviceId: string, event: any) => {
      logger.info('api', `HLP device event from ${deviceId}:`, { data: event });
      this.emit('deviceEvent', { deviceId, event });
    });

    this.client.on('deviceStatus', (deviceId: string, status: HLPStatusPayload) => {
      this.emit('deviceStatus', { deviceId, status });
    });
  }

  /**
   * Load mappings from database
   */
  private async loadMappings(): Promise<void> {
    try {
      const devices = await prisma.lightingDevice.findMany({
        where: { protocol: 'HLP' }
      });

      devices.forEach(device => {
        if (device.zoneId) {
          this.deviceZoneMappings.set(device.deviceId, device.zoneId);
        }
      });
    } catch (error) {
      logger.error('api', 'Error loading device mappings:', error );
    }
  }

  /**
   * Poll device status
   */
  private async pollDeviceStatus(): Promise<void> {
    const devices = this.client.getDevices();
    
    for (const device of devices) {
      try {
        const status = await this.client.getStatus(device.id);
        if (status) {
          await prisma.lightingDevice.update({
            where: { deviceId: device.id },
            data: {
              status: status.deviceStatus,
              lastSeen: new Date(),
              metadata: {
                totalPower: status.totalPower,
                temperature: status.temperature,
                errors: status.errors
              }
            }
          });
        }
      } catch (error) {
        logger.error('api', `Error polling status for device ${device.id}:`, error);
      }
    }
  }

  /**
   * Get default channel mappings for device
   */
  private getDefaultChannelMappings(device: HLPDevice): HLPRecipeMapping['channelMappings'] {
    return device.capabilities.supportedChannelTypes.map((type, index) => ({
      channelType: type,
      channelId: index
    }));
  }
}