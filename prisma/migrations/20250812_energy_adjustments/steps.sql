-- Energy adjustments table for manual/operational changes not reflected in bills

CREATE TABLE IF NOT EXISTS "EnergyAdjustment" (
  "id" TEXT PRIMARY KEY,
  "facilityId" TEXT NOT NULL REFERENCES "Facility"("id") ON DELETE CASCADE,
  "effectiveStart" TIMESTAMP NOT NULL,
  "effectiveEnd" TIMESTAMP,
  "kwhDelta" DOUBLE PRECISION DEFAULT 0,           -- positive or negative monthly kWh delta
  "demandKwDelta" DOUBLE PRECISION DEFAULT 0,      -- positive or negative kW delta
  "ratePerKwh" DOUBLE PRECISION,                   -- optional override rate to value kWh delta
  "demandChargeRate" DOUBLE PRECISION,             -- optional override demand charge valuation
  "reason" TEXT,                                   -- short title (e.g., HPS retrofit in Zone A)
  "notes" TEXT,                                    -- details/explanation
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS energy_adjustment_facility_idx ON "EnergyAdjustment"("facilityId");
CREATE INDEX IF NOT EXISTS energy_adjustment_period_idx ON "EnergyAdjustment"("effectiveStart","effectiveEnd");


