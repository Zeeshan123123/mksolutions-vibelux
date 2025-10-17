/**
 * HLP Message Formatter
 * Handles encoding/decoding of HLP protocol messages
 */

import {
  HLPMessage,
  HLPMessageType,
  HLPSetIntensityPayload,
  HLPSetSpectrumPayload,
  HLPStatusPayload,
  HLPEventPayload,
  HLPSchedule,
  HLPGroup
} from './types';

export class HLPMessageFormatter {
  private static sequenceNumber = 0;
  private static readonly PROTOCOL_VERSION = '1.1.0';

  /**
   * Create a discovery request message
   */
  static createDiscoveryRequest(): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.DISCOVER_REQUEST,
      timestamp: new Date(),
      deviceId: 'controller',
      sequenceNumber: this.getNextSequence(),
      payload: {}
    };
    return this.encodeMessage(message);
  }

  /**
   * Create a device info request
   */
  static createDeviceInfoRequest(deviceId: string): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.DEVICE_INFO_REQUEST,
      timestamp: new Date(),
      deviceId,
      sequenceNumber: this.getNextSequence(),
      payload: {}
    };
    return this.encodeMessage(message);
  }

  /**
   * Create set intensity command
   */
  static createSetIntensityCommand(
    deviceId: string,
    payload: HLPSetIntensityPayload
  ): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.SET_INTENSITY,
      timestamp: new Date(),
      deviceId,
      sequenceNumber: this.getNextSequence(),
      payload
    };
    return this.encodeMessage(message);
  }

  /**
   * Create set spectrum command
   */
  static createSetSpectrumCommand(
    deviceId: string,
    payload: HLPSetSpectrumPayload
  ): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.SET_SPECTRUM,
      timestamp: new Date(),
      deviceId,
      sequenceNumber: this.getNextSequence(),
      payload
    };
    return this.encodeMessage(message);
  }

  /**
   * Create set schedule command
   */
  static createSetScheduleCommand(
    deviceId: string,
    schedule: HLPSchedule
  ): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.SET_SCHEDULE,
      timestamp: new Date(),
      deviceId,
      sequenceNumber: this.getNextSequence(),
      payload: schedule
    };
    return this.encodeMessage(message);
  }

  /**
   * Create set group command
   */
  static createSetGroupCommand(
    deviceId: string,
    group: HLPGroup
  ): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.SET_GROUP,
      timestamp: new Date(),
      deviceId,
      sequenceNumber: this.getNextSequence(),
      payload: group
    };
    return this.encodeMessage(message);
  }

  /**
   * Create status request
   */
  static createStatusRequest(deviceId: string): Buffer {
    const message: HLPMessage = {
      version: this.PROTOCOL_VERSION,
      messageType: HLPMessageType.STATUS_REQUEST,
      timestamp: new Date(),
      deviceId,
      sequenceNumber: this.getNextSequence(),
      payload: {}
    };
    return this.encodeMessage(message);
  }

  /**
   * Encode HLP message to binary format
   */
  private static encodeMessage(message: HLPMessage): Buffer {
    // HLP Binary Format:
    // [Header: 16 bytes]
    // - Protocol version: 4 bytes
    // - Message type: 2 bytes
    // - Sequence number: 4 bytes
    // - Timestamp: 6 bytes
    // [Body: variable length]
    // - Device ID length: 2 bytes
    // - Device ID: variable
    // - Payload length: 4 bytes
    // - Payload: variable (JSON)
    // [Checksum: 4 bytes]

    const header = Buffer.alloc(16);
    
    // Protocol version (4 bytes)
    const versionParts = this.PROTOCOL_VERSION.split('.').map(Number);
    header.writeUInt8(versionParts[0], 0);
    header.writeUInt8(versionParts[1], 1);
    header.writeUInt8(versionParts[2], 2);
    header.writeUInt8(0, 3); // Reserved

    // Message type (2 bytes)
    const messageTypeCode = this.getMessageTypeCode(message.messageType);
    header.writeUInt16BE(messageTypeCode, 4);

    // Sequence number (4 bytes)
    header.writeUInt32BE(message.sequenceNumber, 6);

    // Timestamp (6 bytes) - milliseconds since epoch
    const timestamp = message.timestamp.getTime();
    header.writeUIntBE(timestamp, 10, 6);

    // Device ID
    const deviceIdBuffer = Buffer.from(message.deviceId, 'utf8');
    const deviceIdLength = Buffer.alloc(2);
    deviceIdLength.writeUInt16BE(deviceIdBuffer.length, 0);

    // Payload
    const payloadJson = JSON.stringify(message.payload);
    const payloadBuffer = Buffer.from(payloadJson, 'utf8');
    const payloadLength = Buffer.alloc(4);
    payloadLength.writeUInt32BE(payloadBuffer.length, 0);

    // Combine all parts
    const fullMessage = Buffer.concat([
      header,
      deviceIdLength,
      deviceIdBuffer,
      payloadLength,
      payloadBuffer
    ]);

    // Calculate checksum (CRC32)
    const checksum = this.calculateChecksum(fullMessage);
    const checksumBuffer = Buffer.alloc(4);
    checksumBuffer.writeUInt32BE(checksum, 0);

    return Buffer.concat([fullMessage, checksumBuffer]);
  }

  /**
   * Decode HLP message from binary format
   */
  static decodeMessage(buffer: Buffer): HLPMessage | null {
    try {
      if (buffer.length < 26) { // Minimum message size
        return null;
      }

      let offset = 0;

      // Read header
      const version = `${buffer.readUInt8(offset)}.${buffer.readUInt8(offset + 1)}.${buffer.readUInt8(offset + 2)}`;
      offset += 4;

      const messageTypeCode = buffer.readUInt16BE(offset);
      const messageType = this.getMessageTypeFromCode(messageTypeCode);
      offset += 2;

      const sequenceNumber = buffer.readUInt32BE(offset);
      offset += 4;

      const timestampMs = buffer.readUIntBE(offset, 6);
      const timestamp = new Date(timestampMs);
      offset += 6;

      // Read device ID
      const deviceIdLength = buffer.readUInt16BE(offset);
      offset += 2;
      const deviceId = buffer.toString('utf8', offset, offset + deviceIdLength);
      offset += deviceIdLength;

      // Read payload
      const payloadLength = buffer.readUInt32BE(offset);
      offset += 4;
      const payloadJson = buffer.toString('utf8', offset, offset + payloadLength);
      const payload = JSON.parse(payloadJson);
      offset += payloadLength;

      // Verify checksum
      const messageData = buffer.slice(0, offset);
      const expectedChecksum = buffer.readUInt32BE(offset);
      const actualChecksum = this.calculateChecksum(messageData);

      if (expectedChecksum !== actualChecksum) {
        logger.error('api', 'HLP message checksum mismatch');
        return null;
      }

      return {
        version,
        messageType,
        timestamp,
        deviceId,
        sequenceNumber,
        payload
      };
    } catch (error) {
      logger.error('api', 'Error decoding HLP message:', error );
      return null;
    }
  }

  /**
   * Get next sequence number
   */
  private static getNextSequence(): number {
    this.sequenceNumber = (this.sequenceNumber + 1) % 0xFFFFFFFF;
    return this.sequenceNumber;
  }

  /**
   * Get numeric code for message type
   */
  private static getMessageTypeCode(type: HLPMessageType): number {
    const codes: { [key in HLPMessageType]: number } = {
      [HLPMessageType.DISCOVER_REQUEST]: 0x0001,
      [HLPMessageType.DISCOVER_RESPONSE]: 0x0002,
      [HLPMessageType.DEVICE_INFO_REQUEST]: 0x0010,
      [HLPMessageType.DEVICE_INFO_RESPONSE]: 0x0011,
      [HLPMessageType.SET_INTENSITY]: 0x0100,
      [HLPMessageType.SET_SPECTRUM]: 0x0101,
      [HLPMessageType.SET_SCHEDULE]: 0x0102,
      [HLPMessageType.SET_GROUP]: 0x0103,
      [HLPMessageType.STATUS_REQUEST]: 0x0200,
      [HLPMessageType.STATUS_RESPONSE]: 0x0201,
      [HLPMessageType.ACK]: 0x0300,
      [HLPMessageType.NACK]: 0x0301,
      [HLPMessageType.EVENT_NOTIFICATION]: 0x0400
    };
    return codes[type] || 0;
  }

  /**
   * Get message type from numeric code
   */
  private static getMessageTypeFromCode(code: number): HLPMessageType {
    const types: { [key: number]: HLPMessageType } = {
      0x0001: HLPMessageType.DISCOVER_REQUEST,
      0x0002: HLPMessageType.DISCOVER_RESPONSE,
      0x0010: HLPMessageType.DEVICE_INFO_REQUEST,
      0x0011: HLPMessageType.DEVICE_INFO_RESPONSE,
      0x0100: HLPMessageType.SET_INTENSITY,
      0x0101: HLPMessageType.SET_SPECTRUM,
      0x0102: HLPMessageType.SET_SCHEDULE,
      0x0103: HLPMessageType.SET_GROUP,
      0x0200: HLPMessageType.STATUS_REQUEST,
      0x0201: HLPMessageType.STATUS_RESPONSE,
      0x0300: HLPMessageType.ACK,
      0x0301: HLPMessageType.NACK,
      0x0400: HLPMessageType.EVENT_NOTIFICATION
    };
    return types[code] || HLPMessageType.NACK;
  }

  /**
   * Calculate CRC32 checksum
   */
  private static calculateChecksum(buffer: Buffer): number {
    let crc = 0xFFFFFFFF;
    const polynomial = 0xEDB88320;

    for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >>> 1) ^ polynomial;
        } else {
          crc = crc >>> 1;
        }
      }
    }

    return crc ^ 0xFFFFFFFF;
  }
}