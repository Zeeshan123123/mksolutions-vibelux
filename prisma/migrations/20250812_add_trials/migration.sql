-- Trial models for randomized growth experiments
-- Tables: Trial, Treatment, TrialBlock, TrialUnit, Observation, Covariate

CREATE TABLE IF NOT EXISTS "Trial" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  "crop" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Treatment" (
  "id" TEXT PRIMARY KEY,
  "trialId" TEXT NOT NULL REFERENCES "Trial"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "factor" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TrialBlock" (
  "id" TEXT PRIMARY KEY,
  "trialId" TEXT NOT NULL REFERENCES "Trial"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TrialUnit" (
  "id" TEXT PRIMARY KEY,
  "trialId" TEXT NOT NULL REFERENCES "Trial"("id") ON DELETE CASCADE,
  "blockId" TEXT REFERENCES "TrialBlock"("id") ON DELETE SET NULL,
  "treatmentId" TEXT REFERENCES "Treatment"("id") ON DELETE SET NULL,
  "zone" TEXT,
  "replicate" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Observation" (
  "id" TEXT PRIMARY KEY,
  "trialId" TEXT NOT NULL REFERENCES "Trial"("id") ON DELETE CASCADE,
  "unitId" TEXT REFERENCES "TrialUnit"("id") ON DELETE SET NULL,
  "timestamp" TIMESTAMP NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "unit" TEXT,
  "metadata" JSONB
);

CREATE TABLE IF NOT EXISTS "Covariate" (
  "id" TEXT PRIMARY KEY,
  "trialId" TEXT NOT NULL REFERENCES "Trial"("id") ON DELETE CASCADE,
  "unitId" TEXT REFERENCES "TrialUnit"("id") ON DELETE SET NULL,
  "timestamp" TIMESTAMP NOT NULL,
  "name" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "unit" TEXT
);


