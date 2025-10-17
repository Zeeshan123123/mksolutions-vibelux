/**
 * WebSocket Client for Real-time Greenhouse Data
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  channel?: string;
}

interface WebSocketOptions {
  facilityId?: string;
  designId?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export class GreenhouseWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketOptions;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;

  public onConnectionChange?: (state: ConnectionState) => void;

  constructor(
    baseUrl: string = 'ws://localhost:8080',
    options: WebSocketOptions = {}
  ) {
    this.url = baseUrl;
    this.options = {
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...options
    };
    
    this.maxReconnectAttempts = this.options.maxReconnectAttempts!;
    this.reconnectInterval = this.options.reconnectInterval!;
  }

  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const params = new URLSearchParams({ token });
        if (this.options.facilityId) params.append('facilityId', this.options.facilityId);
        if (this.options.designId) params.append('designId', this.options.designId);

        const wsUrl = `${this.url}?${params.toString()}`;
        this.ws = new WebSocket(wsUrl);

        this.updateConnectionState({
          connected: false,
          connecting: true,
          error: null,
          reconnectAttempts: this.reconnectAttempts
        });

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.updateConnectionState({
            connected: true,
            connecting: false,
            error: null,
            reconnectAttempts: 0
          });
          
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.updateConnectionState({
            connected: false,
            connecting: false,
            error: event.reason || 'Connection closed',
            reconnectAttempts: this.reconnectAttempts
          });

          this.stopHeartbeat();
          
          if (this.options.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(token);
          }
        };

        this.ws.onerror = (error) => {
          this.updateConnectionState({
            connected: false,
            connecting: false,
            error: 'Connection error',
            reconnectAttempts: this.reconnectAttempts
          });
          
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.options.autoReconnect = false;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateConnectionState({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempts: 0
    });
  }

  public subscribe(channels: string[]): void {
    this.sendMessage({
      type: 'subscribe',
      payload: { channels }
    });
  }

  public unsubscribe(channels: string[]): void {
    this.sendMessage({
      type: 'unsubscribe',  
      payload: { channels }
    });
  }

  public sendSensorReading(reading: {
    sensorId: string;
    value: number;
    unit: string;
    quality?: 'GOOD' | 'UNCERTAIN' | 'BAD';
    metadata?: Record<string, any>;
  }): void {
    this.sendMessage({
      type: 'sensor_reading',
      payload: {
        ...reading,
        timestamp: new Date().toISOString(),
        quality: reading.quality || 'GOOD'
      }
    });
  }

  public sendClimateReading(reading: {
    zoneId: string;
    temperature: number;
    humidity: number;
    co2?: number;
    vpd?: number;
    lightLevel?: number;
  }): void {
    this.sendMessage({
      type: 'climate_reading',
      payload: {
        ...reading,
        timestamp: new Date().toISOString()
      }
    });
  }

  public sendEquipmentStatus(status: {
    equipmentId: string;
    status: string;
    isActive: boolean;
    powerUsage?: number;
    efficiency?: number;
  }): void {
    this.sendMessage({
      type: 'equipment_status',
      payload: {
        ...status,
        timestamp: new Date().toISOString()
      }
    });
  }

  public onMessage(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getConnectionState(): ConnectionState {
    return {
      connected: this.isConnected(),
      connecting: this.ws?.readyState === WebSocket.CONNECTING || false,
      error: null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  private sendMessage(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, message not sent:', message.type);
      return;
    }

    this.ws!.send(JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    }));
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      // Handle system messages
      switch (message.type) {
        case 'heartbeat':
          this.sendMessage({ type: 'ping', payload: {} });
          break;
        case 'error':
          console.error('WebSocket error:', message.payload);
          break;
      }

      // Notify handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.payload);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      }

      // Notify wildcard handlers
      const wildcardHandlers = this.messageHandlers.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in wildcard handler:', error);
          }
        });
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private scheduleReconnect(token: string): void {
    this.clearReconnectTimer();
    this.reconnectAttempts++;

    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.options.autoReconnect) {
        this.connect(token).catch(() => {
          // Reconnection failed, will try again if under limit
        });
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({ type: 'ping', payload: {} });
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private updateConnectionState(state: ConnectionState): void {
    if (this.onConnectionChange) {
      this.onConnectionChange(state);
    }
  }
}

// React Hook for WebSocket
export function useGreenhouseWebSocket(options: WebSocketOptions = {}) {
  const { getToken } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  });
  
  const clientRef = useRef<GreenhouseWebSocketClient | null>(null);
  const handlersRef = useRef<Map<string, () => void>>(new Map());

  const connect = useCallback(async () => {
    if (clientRef.current?.isConnected()) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      if (!clientRef.current) {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}`;
        clientRef.current = new GreenhouseWebSocketClient(wsUrl, options);
        clientRef.current.onConnectionChange = setConnectionState;
      }

      await clientRef.current.connect(token);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [getToken, options]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    clientRef.current?.subscribe(channels);
  }, []);

  const unsubscribe = useCallback((channels: string[]) => {
    clientRef.current?.unsubscribe(channels);
  }, []);

  const onMessage = useCallback((type: string, handler: (data: any) => void) => {
    if (!clientRef.current) return () => {};

    const unsubscribe = clientRef.current.onMessage(type, handler);
    const key = `${type}_${Math.random()}`;
    handlersRef.current.set(key, unsubscribe);

    return () => {
      const unsub = handlersRef.current.get(key);
      if (unsub) {
        unsub();
        handlersRef.current.delete(key);
      }
    };
  }, []);

  const sendSensorReading = useCallback((reading: Parameters<GreenhouseWebSocketClient['sendSensorReading']>[0]) => {
    clientRef.current?.sendSensorReading(reading);
  }, []);

  const sendClimateReading = useCallback((reading: Parameters<GreenhouseWebSocketClient['sendClimateReading']>[0]) => {
    clientRef.current?.sendClimateReading(reading);
  }, []);

  const sendEquipmentStatus = useCallback((status: Parameters<GreenhouseWebSocketClient['sendEquipmentStatus']>[0]) => {
    clientRef.current?.sendEquipmentStatus(status);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all handlers
      handlersRef.current.forEach(unsubscribe => unsubscribe());
      handlersRef.current.clear();
      
      // Disconnect client
      clientRef.current?.disconnect();
    };
  }, []);

  return {
    connectionState,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onMessage,
    sendSensorReading,
    sendClimateReading,
    sendEquipmentStatus,
    isConnected: connectionState.connected
  };
}