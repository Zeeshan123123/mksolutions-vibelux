-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('GT', 'GTE', 'LT', 'LTE', 'BETWEEN', 'RATE');

-- CreateTable
CREATE TABLE "AlertConfiguration" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "alertType" "AlertType" NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "thresholdMax" DOUBLE PRECISION,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "duration" INTEGER,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 15,
    "actions" JSONB NOT NULL,
    "notificationMessage" TEXT,
    "metadata" JSONB,
    "lastTriggeredAt" TIMESTAMP(3),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL,
    "alertConfigId" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "triggeredValue" DOUBLE PRECISION NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "sensorName" TEXT,
    "location" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertConfiguration_facilityId_idx" ON "AlertConfiguration"("facilityId");

-- CreateIndex
CREATE INDEX "AlertConfiguration_sensorId_idx" ON "AlertConfiguration"("sensorId");

-- CreateIndex
CREATE INDEX "AlertConfiguration_enabled_idx" ON "AlertConfiguration"("enabled");

-- CreateIndex
CREATE INDEX "AlertConfiguration_alertType_idx" ON "AlertConfiguration"("alertType");

-- CreateIndex
CREATE INDEX "AlertConfiguration_facilityId_sensorId_idx" ON "AlertConfiguration"("facilityId", "sensorId");

-- CreateIndex
CREATE INDEX "AlertConfiguration_enabled_sensorId_idx" ON "AlertConfiguration"("enabled", "sensorId");

-- CreateIndex
CREATE INDEX "AlertLog_alertConfigId_idx" ON "AlertLog"("alertConfigId");

-- CreateIndex
CREATE INDEX "AlertLog_sensorId_idx" ON "AlertLog"("sensorId");

-- CreateIndex
CREATE INDEX "AlertLog_facilityId_idx" ON "AlertLog"("facilityId");

-- CreateIndex
CREATE INDEX "AlertLog_status_idx" ON "AlertLog"("status");

-- CreateIndex
CREATE INDEX "AlertLog_severity_idx" ON "AlertLog"("severity");

-- CreateIndex
CREATE INDEX "AlertLog_createdAt_idx" ON "AlertLog"("createdAt");

-- CreateIndex
CREATE INDEX "AlertLog_facilityId_status_idx" ON "AlertLog"("facilityId", "status");

-- CreateIndex
CREATE INDEX "AlertLog_facilityId_createdAt_idx" ON "AlertLog"("facilityId", "createdAt");

-- CreateIndex
CREATE INDEX "AlertLog_sensorId_status_idx" ON "AlertLog"("sensorId", "status");

-- AddForeignKey
ALTER TABLE "AlertConfiguration" ADD CONSTRAINT "AlertConfiguration_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertConfiguration" ADD CONSTRAINT "AlertConfiguration_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "ZoneSensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_alertConfigId_fkey" FOREIGN KEY ("alertConfigId") REFERENCES "AlertConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "ZoneSensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


