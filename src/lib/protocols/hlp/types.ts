/**
 * HLP (Horticulture Lighting Protocol) Type Definitions
 * Based on HLP Specification v1.1.0
 */

export interface HLPDevice {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  ipAddress: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  capabilities: HLPCapabilities;
  lastSeen: Date;
}

export interface HLPCapabilities {
  maxChannels: number;
  supportedChannelTypes: HLPChannelType[];
  supportsDimming: boolean;
  supportsScheduling: boolean;
  supportsGrouping: boolean;
  maxGroups: number;
  maxSchedules: number;
}

export enum HLPChannelType {
  WHITE = 'WHITE',
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  FAR_RED = 'FAR_RED',
  UV = 'UV',
  WARM_WHITE = 'WARM_WHITE',
  COOL_WHITE = 'COOL_WHITE'
}

export interface HLPMessage {
  version: string;
  messageType: HLPMessageType;
  timestamp: Date;
  deviceId: string;
  sequenceNumber: number;
  payload: any;
}

export enum HLPMessageType {
  // Discovery
  DISCOVER_REQUEST = 'DISCOVER_REQUEST',
  DISCOVER_RESPONSE = 'DISCOVER_RESPONSE',
  
  // Device Info
  DEVICE_INFO_REQUEST = 'DEVICE_INFO_REQUEST',
  DEVICE_INFO_RESPONSE = 'DEVICE_INFO_RESPONSE',
  
  // Control
  SET_INTENSITY = 'SET_INTENSITY',
  SET_SPECTRUM = 'SET_SPECTRUM',
  SET_SCHEDULE = 'SET_SCHEDULE',
  SET_GROUP = 'SET_GROUP',
  
  // Status
  STATUS_REQUEST = 'STATUS_REQUEST',
  STATUS_RESPONSE = 'STATUS_RESPONSE',
  
  // Acknowledgments
  ACK = 'ACK',
  NACK = 'NACK',
  
  // Events
  EVENT_NOTIFICATION = 'EVENT_NOTIFICATION'
}

export interface HLPChannel {
  channelId: number;
  type: HLPChannelType;
  intensity: number; // 0-100%
  actualPower: number; // Watts
  targetPower: number; // Watts
}

export interface HLPSchedule {
  scheduleId: string;
  name: string;
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  rampDuration: number; // minutes
  channels: HLPScheduleChannel[];
  repeatDays: number[]; // 0=Sunday, 6=Saturday
  // Advanced scheduling support
  advancedMode?: boolean;
  setpoints?: Array<{
    time: string;
    channels: HLPScheduleChannel[];
    transitionMinutes: number;
  }>;
  dimmingConfig?: {
    type: '0-10V' | 'PWM' | 'DALI' | 'Phase';
    voltageMin: number;
    voltageMax: number;
    curve: 'linear' | 'logarithmic' | 'square' | 'custom';
  };
}

export interface HLPScheduleChannel {
  channelId: number;
  intensity: number; // 0-100%
}

export interface HLPGroup {
  groupId: string;
  name: string;
  deviceIds: string[];
  channels: HLPGroupChannel[];
}

export interface HLPGroupChannel {
  channelType: HLPChannelType;
  intensity: number; // 0-100%
}

export interface HLPSetIntensityPayload {
  channels: Array<{
    channelId: number;
    intensity: number; // 0-100%
    rampTime?: number; // seconds
  }>;
}

export interface HLPSetSpectrumPayload {
  spectrum: {
    [key in HLPChannelType]?: number; // 0-100%
  };
  rampTime?: number; // seconds
  maintainPPFD?: boolean;
}

export interface HLPStatusPayload {
  deviceStatus: 'online' | 'offline' | 'error';
  channels: HLPChannel[];
  activeSchedule?: string;
  activeGroup?: string;
  temperature?: number; // Celsius
  totalPower: number; // Watts
  errors: string[];
}

export interface HLPEventPayload {
  eventType: 'schedule_start' | 'schedule_end' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

export interface HLPConfig {
  discoveryPort: number;
  discoveryTimeout: number;
  commandPort: number;
  commandTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableBroadcast: boolean;
  enableMulticast: boolean;
  multicastAddress?: string;
}

export const DEFAULT_HLP_CONFIG: HLPConfig = {
  discoveryPort: 50000,
  discoveryTimeout: 5000,
  commandPort: 50001,
  commandTimeout: 3000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableBroadcast: true,
  enableMulticast: true,
  multicastAddress: '239.255.255.250'
};