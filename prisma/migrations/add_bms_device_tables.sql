-- BMS Device Tables

-- Device registry
CREATE TABLE IF NOT EXISTS "BmsDevice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "port" INTEGER,
  "deviceType" TEXT,
  "manufacturer" TEXT,
  "model" TEXT,
  "serialNumber" TEXT,
  "status" TEXT NOT NULL DEFAULT 'offline',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "connectionConfig" JSONB NOT NULL,
  "mapping" JSONB,
  "metadata" JSONB,
  "discovered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeen" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Device readings (latest values)
CREATE TABLE IF NOT EXISTS "DeviceReading" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "deviceId" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "data" JSONB NOT NULL,
  "quality" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceReading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BmsDevice"("id") ON DELETE CASCADE
);

-- Device commands log
CREATE TABLE IF NOT EXISTS "DeviceCommand" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "deviceId" TEXT NOT NULL,
  "command" TEXT NOT NULL,
  "parameters" JSONB,
  "userId" TEXT NOT NULL,
  "success" BOOLEAN,
  "response" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceCommand_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BmsDevice"("id") ON DELETE CASCADE
);

-- Device alarms
CREATE TABLE IF NOT EXISTS "DeviceAlarm" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "deviceId" TEXT NOT NULL,
  "alarmType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "acknowledged" BOOLEAN NOT NULL DEFAULT false,
  "acknowledgedBy" TEXT,
  "acknowledgedAt" TIMESTAMP(3),
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceAlarm_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BmsDevice"("id") ON DELETE CASCADE
);

-- Zone device assignments
CREATE TABLE IF NOT EXISTS "ZoneDevice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "zoneId" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'sensor',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ZoneDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BmsDevice"("id") ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "BmsDevice_protocol_idx" ON "BmsDevice"("protocol");
CREATE INDEX IF NOT EXISTS "BmsDevice_status_idx" ON "BmsDevice"("status");
CREATE INDEX IF NOT EXISTS "DeviceReading_deviceId_timestamp_idx" ON "DeviceReading"("deviceId", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "DeviceCommand_deviceId_timestamp_idx" ON "DeviceCommand"("deviceId", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "DeviceAlarm_deviceId_resolved_idx" ON "DeviceAlarm"("deviceId", "resolved");
CREATE INDEX IF NOT EXISTS "ZoneDevice_zoneId_idx" ON "ZoneDevice"("zoneId");
CREATE INDEX IF NOT EXISTS "ZoneDevice_deviceId_idx" ON "ZoneDevice"("deviceId");