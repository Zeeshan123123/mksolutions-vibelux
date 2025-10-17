-- Energy adjustments table for manual/operational changes not reflected in bills

CREATE TABLE IF NOT EXISTS "EnergyAdjustment" (
  "id" TEXT PRIMARY KEY,
  "facilityId" TEXT NOT NULL,
  "effectiveStart" TIMESTAMP NOT NULL,
  "effectiveEnd" TIMESTAMP,
  "kwhDelta" DOUBLE PRECISION DEFAULT 0,
  "demandKwDelta" DOUBLE PRECISION DEFAULT 0,
  "ratePerKwh" DOUBLE PRECISION,
  "demandChargeRate" DOUBLE PRECISION,
  "reason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS energy_adjustment_facility_idx ON "EnergyAdjustment"("facilityId");
CREATE INDEX IF NOT EXISTS energy_adjustment_period_idx ON "EnergyAdjustment"("effectiveStart","effectiveEnd");


