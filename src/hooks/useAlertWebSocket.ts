import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface AlertEvent {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  sensorId: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export function useAlertWebSocket(facilityId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newAlert, setNewAlert] = useState<AlertEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!facilityId) return;

    // Connect to WebSocket server
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socketInstance;

    // Connection events
    socketInstance.on('connect', () => {
      console.log('WebSocket connected for facility:', facilityId);
      setIsConnected(true);
      
      // Join facility room
      socketInstance.emit('join', { facilityId });
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for alert events
    socketInstance.on('alert:created', (alert: AlertEvent) => {
      console.log('New alert received via WebSocket:', alert);
      setNewAlert(alert);
      
      // Request browser notification permission if not granted
      if (typeof window !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });

    // Listen for alert updates
    socketInstance.on('alert:updated', (alert: AlertEvent) => {
      console.log('Alert updated:', alert);
      // Optionally handle alert updates
    });

    // Listen for sensor updates
    socketInstance.on('sensor:update', (data: any) => {
      console.log('Sensor update:', data);
      // Optionally handle sensor data updates
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [facilityId]);

  // Clear new alert after it's been processed
  const clearNewAlert = () => {
    setNewAlert(null);
  };

  return {
    socket,
    newAlert,
    isConnected,
    clearNewAlert
  };
}

