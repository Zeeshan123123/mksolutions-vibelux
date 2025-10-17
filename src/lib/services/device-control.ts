/**
 * Device Control Service
 * Provides control capabilities for BMS/SCADA devices
 */

import { EventEmitter } from 'events';
import { ModbusClient, ModbusRegister } from '../protocols/modbus-client';
import { BACnetClient, BACnetObjectType, BACnetPropertyId } from '../protocols/bacnet-client';
import { MqttClient } from '../protocols/mqtt-client';
import { OpcUaClient } from '../protocols/opcua-client';
import { prisma } from '@/lib/prisma';

export interface ControlCommand {
  deviceId: string;
  command: string;
  parameters?: any;
  zone?: string;
  priority?: number;
  override?: boolean;
  duration?: number; // seconds for temporary overrides
}

export interface ControlResponse {
  success: boolean;
  message?: string;
  actualValue?: any;
  timestamp: Date;
  error?: string;
}

export interface DeviceSetpoint {
  parameter: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  deadband?: number;
}

export interface ZoneControl {
  zoneId: string;
  enabled: boolean;
  mode: 'auto' | 'manual' | 'schedule';
  setpoints: DeviceSetpoint[];
  overrides: Map<string, any>;
}

export interface EmergencyStopConfig {
  deviceIds?: string[];
  zones?: string[];
  stopAll: boolean;
  reason: string;
  operator: string;
}

export class DeviceControlService extends EventEmitter {
  private controllers: Map<string, any> = new Map();
  private zoneControls: Map<string, ZoneControl> = new Map();
  private emergencyStopActive: boolean = false;
  
  constructor() {
    super();
  }
  
  // Initialize controller for a device
  async initializeController(
    deviceId: string,
    protocol: string,
    connection: any,
    mapping?: any
  ): Promise<void> {
    if (this.controllers.has(deviceId)) {
      throw new Error(`Controller already initialized for device ${deviceId}`);
    }
    
    let controller: any;
    
    switch (protocol) {
      case 'modbus':
        controller = new ModbusClient(connection, mapping);
        await controller.connect();
        break;
        
      case 'bacnet':
        controller = new BACnetClient(connection);
        controller.connect();
        break;
        
      case 'mqtt':
        controller = new MqttClient(connection);
        await controller.connect();
        if (mapping?.device) {
          controller.registerDevice(mapping.device);
        }
        break;
        
      case 'opcua':
        controller = new OpcUaClient(connection);
        await controller.connect();
        break;
        
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
    
    this.controllers.set(deviceId, {
      protocol,
      client: controller,
      mapping
    });
    
    this.emit('controllerInitialized', deviceId);
  }
  
  // Execute control command
  async executeCommand(command: ControlCommand): Promise<ControlResponse> {
    // Check emergency stop
    if (this.emergencyStopActive && command.command !== 'RESET_EMERGENCY_STOP') {
      return {
        success: false,
        error: 'Emergency stop is active. Reset required before executing commands.',
        timestamp: new Date()
      };
    }
    
    const controller = this.controllers.get(command.deviceId);
    if (!controller) {
      return {
        success: false,
        error: `No controller found for device ${command.deviceId}`,
        timestamp: new Date()
      };
    }
    
    try {
      // Log command for audit trail
      await this.logCommand(command);
      
      let response: ControlResponse;
      
      switch (controller.protocol) {
        case 'modbus':
          response = await this.executeModbusCommand(controller, command);
          break;
          
        case 'bacnet':
          response = await this.executeBACnetCommand(controller, command);
          break;
          
        case 'mqtt':
          response = await this.executeMqttCommand(controller, command);
          break;
          
        case 'opcua':
          response = await this.executeOpcUaCommand(controller, command);
          break;
          
        default:
          throw new Error(`Unsupported protocol: ${controller.protocol}`);
      }
      
      // Apply override duration if specified
      if (command.override && command.duration) {
        setTimeout(() => {
          this.releaseOverride(command.deviceId, command.parameters?.point);
        }, command.duration * 1000);
      }
      
      this.emit('commandExecuted', command, response);
      return response;
      
    } catch (error) {
      const response: ControlResponse = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      
      this.emit('commandError', command, error);
      return response;
    }
  }
  
  // Execute Modbus command
  private async executeModbusCommand(
    controller: any,
    command: ControlCommand
  ): Promise<ControlResponse> {
    const { client, mapping } = controller;
    
    switch (command.command) {
      case 'SET_SETPOINT':
        const register = mapping?.registers?.[command.parameters?.point];
        if (!register) {
          throw new Error(`Unknown register: ${command.parameters?.point}`);
        }
        
        await client.writeRegister(register, command.parameters?.value);
        
        // Read back to confirm
        const actualValue = await client.readRegister(register);
        
        return {
          success: true,
          message: `Set ${command.parameters?.point} to ${command.parameters?.value}`,
          actualValue,
          timestamp: new Date()
        };
        
      case 'ENABLE_DEVICE':
        if (mapping?.registers?.enable) {
          await client.writeRegister(mapping.registers.enable, 1);
        }
        return {
          success: true,
          message: 'Device enabled',
          timestamp: new Date()
        };
        
      case 'DISABLE_DEVICE':
        if (mapping?.registers?.enable) {
          await client.writeRegister(mapping.registers.enable, 0);
        }
        return {
          success: true,
          message: 'Device disabled',
          timestamp: new Date()
        };
        
      default:
        throw new Error(`Unknown command: ${command.command}`);
    }
  }
  
  // Execute BACnet command
  private async executeBACnetCommand(
    controller: any,
    command: ControlCommand
  ): Promise<ControlResponse> {
    const { client, mapping } = controller;
    const address = mapping?.address || command.parameters?.address;
    
    switch (command.command) {
      case 'SET_SETPOINT':
        const object = mapping?.objects?.[command.parameters?.point];
        if (!object) {
          throw new Error(`Unknown object: ${command.parameters?.point}`);
        }
        
        await client.writeProperty(
          address,
          object.type,
          object.instance,
          BACnetPropertyId.PRESENT_VALUE,
          [command.parameters?.value],
          command.priority
        );
        
        return {
          success: true,
          message: `Set ${command.parameters?.point} to ${command.parameters?.value}`,
          timestamp: new Date()
        };
        
      case 'RELEASE_OVERRIDE':
        const obj = mapping?.objects?.[command.parameters?.point];
        if (!obj) {
          throw new Error(`Unknown object: ${command.parameters?.point}`);
        }
        
        // Write null to release override at priority
        await client.writeProperty(
          address,
          obj.type,
          obj.instance,
          BACnetPropertyId.PRESENT_VALUE,
          [null],
          command.priority || 8
        );
        
        return {
          success: true,
          message: `Released override for ${command.parameters?.point}`,
          timestamp: new Date()
        };
        
      default:
        throw new Error(`Unknown command: ${command.command}`);
    }
  }
  
  // Execute MQTT command
  private async executeMqttCommand(
    controller: any,
    command: ControlCommand
  ): Promise<ControlResponse> {
    const { client } = controller;
    
    switch (command.command) {
      case 'SET_SETPOINT':
        await client.sendCommand(
          command.deviceId,
          command.parameters?.point,
          command.parameters?.value
        );
        
        return {
          success: true,
          message: `Sent ${command.parameters?.point} command with value ${command.parameters?.value}`,
          timestamp: new Date()
        };
        
      case 'SEND_COMMAND':
        await client.sendCommand(
          command.deviceId,
          command.parameters?.command,
          command.parameters?.payload
        );
        
        return {
          success: true,
          message: `Sent command ${command.parameters?.command}`,
          timestamp: new Date()
        };
        
      default:
        throw new Error(`Unknown command: ${command.command}`);
    }
  }
  
  // Execute OPC UA command
  private async executeOpcUaCommand(
    controller: any,
    command: ControlCommand
  ): Promise<ControlResponse> {
    const { client, mapping } = controller;
    
    switch (command.command) {
      case 'SET_SETPOINT':
        const nodeId = mapping?.nodes?.[command.parameters?.point];
        if (!nodeId) {
          throw new Error(`Unknown node: ${command.parameters?.point}`);
        }
        
        await client.write(nodeId, command.parameters?.value);
        
        // Read back to confirm
        const result = await client.read(nodeId);
        
        return {
          success: true,
          message: `Set ${command.parameters?.point} to ${command.parameters?.value}`,
          actualValue: result[0]?.value,
          timestamp: new Date()
        };
        
      case 'CALL_METHOD':
        const output = await client.callMethod(
          command.parameters?.objectId,
          command.parameters?.methodId,
          command.parameters?.arguments || []
        );
        
        return {
          success: true,
          message: `Called method ${command.parameters?.methodId}`,
          actualValue: output,
          timestamp: new Date()
        };
        
      default:
        throw new Error(`Unknown command: ${command.command}`);
    }
  }
  
  // Set zone control parameters
  async setZoneControl(
    zoneId: string,
    setpoints: DeviceSetpoint[]
  ): Promise<void> {
    const zone = this.zoneControls.get(zoneId) || {
      zoneId,
      enabled: true,
      mode: 'auto',
      setpoints: [],
      overrides: new Map()
    };
    
    // Validate setpoints
    for (const setpoint of setpoints) {
      if (setpoint.min !== undefined && setpoint.value < setpoint.min) {
        throw new Error(`${setpoint.parameter} value ${setpoint.value} is below minimum ${setpoint.min}`);
      }
      if (setpoint.max !== undefined && setpoint.value > setpoint.max) {
        throw new Error(`${setpoint.parameter} value ${setpoint.value} is above maximum ${setpoint.max}`);
      }
    }
    
    zone.setpoints = setpoints;
    this.zoneControls.set(zoneId, zone);
    
    // Apply setpoints to all devices in zone
    await this.applyZoneSetpoints(zoneId);
    
    this.emit('zoneControlUpdated', zoneId, zone);
  }
  
  // Apply zone setpoints to devices
  private async applyZoneSetpoints(zoneId: string): Promise<void> {
    const zone = this.zoneControls.get(zoneId);
    if (!zone || !zone.enabled || zone.mode === 'manual') {
      return;
    }
    
    // Get devices in zone from configuration
    const zoneConfig = await prisma.facilityZone.findUnique({
      where: { id: zoneId },
      include: { devices: true }
    });
    
    if (!zoneConfig) {
      return;
    }
    
    // Apply setpoints to each device
    for (const device of zoneConfig.devices) {
      for (const setpoint of zone.setpoints) {
        try {
          await this.executeCommand({
            deviceId: device.id,
            command: 'SET_SETPOINT',
            parameters: {
              point: setpoint.parameter,
              value: setpoint.value
            },
            zone: zoneId
          });
        } catch (error) {
          logger.error('api', `Failed to apply setpoint to device ${device.id}:`, error);
        }
      }
    }
  }
  
  // Emergency stop
  async emergencyStop(config: EmergencyStopConfig): Promise<void> {
    this.emergencyStopActive = true;
    
    // Log emergency stop
    await prisma.auditLog.create({
      data: {
        action: 'EMERGENCY_STOP',
        userId: config.operator,
        details: {
          reason: config.reason,
          devices: config.deviceIds,
          zones: config.zones,
          timestamp: new Date()
        },
        ip: '0.0.0.0' // Should be actual IP in production
      }
    });
    
    const deviceIds = config.stopAll 
      ? Array.from(this.controllers.keys())
      : config.deviceIds || [];
    
    // Add devices from specified zones
    if (config.zones) {
      const zoneDevices = await prisma.facilityZone.findMany({
        where: { id: { in: config.zones } },
        include: { devices: true }
      });
      
      zoneDevices.forEach(zone => {
        zone.devices.forEach(device => {
          if (!deviceIds.includes(device.id)) {
            deviceIds.push(device.id);
          }
        });
      });
    }
    
    // Execute emergency stop on all devices
    const results = await Promise.allSettled(
      deviceIds.map(deviceId => 
        this.executeCommand({
          deviceId,
          command: 'EMERGENCY_STOP',
          priority: 1 // Highest priority
        })
      )
    );
    
    this.emit('emergencyStop', {
      config,
      deviceIds,
      results
    });
  }
  
  // Reset emergency stop
  async resetEmergencyStop(operator: string): Promise<void> {
    this.emergencyStopActive = false;
    
    // Log reset
    await prisma.auditLog.create({
      data: {
        action: 'RESET_EMERGENCY_STOP',
        userId: operator,
        details: {
          timestamp: new Date()
        },
        ip: '0.0.0.0'
      }
    });
    
    this.emit('emergencyStopReset', operator);
  }
  
  // Release override
  private async releaseOverride(deviceId: string, point?: string): Promise<void> {
    try {
      await this.executeCommand({
        deviceId,
        command: 'RELEASE_OVERRIDE',
        parameters: { point }
      });
    } catch (error) {
      logger.error('api', `Failed to release override for ${deviceId}:`, error);
    }
  }
  
  // Log command for audit trail
  private async logCommand(command: ControlCommand): Promise<void> {
    try {
      await prisma.deviceCommand.create({
        data: {
          deviceId: command.deviceId,
          command: command.command,
          parameters: command.parameters as any,
          userId: 'system', // Should be actual user in production
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('api', 'Failed to log command:', error );
    }
  }
  
  // Get zone control status
  getZoneControl(zoneId: string): ZoneControl | undefined {
    return this.zoneControls.get(zoneId);
  }
  
  // Get all zone controls
  getAllZoneControls(): ZoneControl[] {
    return Array.from(this.zoneControls.values());
  }
  
  // Check if emergency stop is active
  isEmergencyStopActive(): boolean {
    return this.emergencyStopActive;
  }
  
  // Clean up resources
  async shutdown(): Promise<void> {
    // Disconnect all controllers
    for (const [deviceId, controller] of this.controllers) {
      try {
        if (controller.client.disconnect) {
          await controller.client.disconnect();
        }
      } catch (error) {
        logger.error('api', `Failed to disconnect controller for ${deviceId}:`, error);
      }
    }
    
    this.controllers.clear();
    this.zoneControls.clear();
  }
}

// Singleton instance
export const deviceControlService = new DeviceControlService();