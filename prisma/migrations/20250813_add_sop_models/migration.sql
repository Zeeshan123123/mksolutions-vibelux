-- Create SOP tables and indexes

-- SOPDocument
CREATE TABLE IF NOT EXISTS "SOPDocument" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subcategory" TEXT,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "description" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "materials" TEXT[] NOT NULL,
  "safetyNotes" TEXT[] NOT NULL,
  "tags" TEXT[] NOT NULL,
  "estimatedTime" INTEGER NOT NULL,
  "difficulty" TEXT NOT NULL,
  "frequency" TEXT,
  "createdBy" TEXT NOT NULL,
  "reviewedBy" TEXT[] NOT NULL,
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP(3),
  "facilityId" TEXT,
  "views" INTEGER NOT NULL DEFAULT 0,
  "completions" INTEGER NOT NULL DEFAULT 0,
  "averageRating" DOUBLE PRECISION,
  "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "reviewDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- FKs for SOPDocument
DO $$ BEGIN
  ALTER TABLE "SOPDocument"
    ADD CONSTRAINT "SOPDocument_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SOPDocument"
    ADD CONSTRAINT "SOPDocument_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes for SOPDocument
CREATE INDEX IF NOT EXISTS "SOPDocument_category_status_idx" ON "SOPDocument" ("category", "status");
CREATE INDEX IF NOT EXISTS "SOPDocument_facilityId_idx" ON "SOPDocument" ("facilityId");
CREATE INDEX IF NOT EXISTS "SOPDocument_createdBy_idx" ON "SOPDocument" ("createdBy");

-- SOPCheckIn
CREATE TABLE IF NOT EXISTS "SOPCheckIn" (
  "id" TEXT PRIMARY KEY,
  "sopId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "endTime" TIMESTAMP(3),
  "completedSteps" JSONB NOT NULL,
  "notes" TEXT,
  "issues" TEXT[] NOT NULL,
  "facilityId" TEXT,
  "locationId" TEXT,
  "batchId" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "clientIp" TEXT,
  "userAgent" TEXT,
  "status" TEXT NOT NULL DEFAULT 'in_progress',
  "completionRate" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- FKs for SOPCheckIn
DO $$ BEGIN
  ALTER TABLE "SOPCheckIn"
    ADD CONSTRAINT "SOPCheckIn_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOPDocument"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SOPCheckIn"
    ADD CONSTRAINT "SOPCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SOPCheckIn"
    ADD CONSTRAINT "SOPCheckIn_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes for SOPCheckIn
CREATE INDEX IF NOT EXISTS "SOPCheckIn_sopId_idx" ON "SOPCheckIn" ("sopId");
CREATE INDEX IF NOT EXISTS "SOPCheckIn_userId_idx" ON "SOPCheckIn" ("userId");
CREATE INDEX IF NOT EXISTS "SOPCheckIn_facilityId_idx" ON "SOPCheckIn" ("facilityId");
CREATE INDEX IF NOT EXISTS "SOPCheckIn_status_idx" ON "SOPCheckIn" ("status");

-- SOPRevision
CREATE TABLE IF NOT EXISTS "SOPRevision" (
  "id" TEXT PRIMARY KEY,
  "sopId" TEXT NOT NULL,
  "previousVersion" TEXT NOT NULL,
  "newVersion" TEXT NOT NULL,
  "changeLog" TEXT NOT NULL,
  "changedBy" TEXT NOT NULL,
  "diffSummary" TEXT,
  "reviewedByUserId" TEXT,
  "previousContent" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- FKs for SOPRevision
DO $$ BEGIN
  ALTER TABLE "SOPRevision"
    ADD CONSTRAINT "SOPRevision_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOPDocument"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes for SOPRevision
CREATE INDEX IF NOT EXISTS "SOPRevision_sopId_idx" ON "SOPRevision" ("sopId");


