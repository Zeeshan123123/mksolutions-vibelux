-- CreateEnum for GMP Document Types (only if not exists)
DO $$ BEGIN
    CREATE TYPE "DocumentType" AS ENUM ('SOP', 'BATCH_RECORD', 'SPECIFICATION', 'PROTOCOL', 'REPORT', 'POLICY', 'FORM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Document Status (only if not exists)
DO $$ BEGIN
    CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'OBSOLETE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Signature Types (only if not exists)
DO $$ BEGIN
    CREATE TYPE "SignatureType" AS ENUM ('AUTHOR', 'REVIEWER', 'APPROVER', 'QA', 'QU');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Batch Status (only if not exists)
DO $$ BEGIN
    CREATE TYPE "BatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'RELEASED', 'REJECTED', 'ON_HOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Deviation Severity (only if not exists)
DO $$ BEGIN
    CREATE TYPE "DeviationSeverity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Deviation Status (only if not exists)
DO $$ BEGIN
    CREATE TYPE "DeviationStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_REQUIRED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable for GMP Documents
CREATE TABLE "GMPDocument" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'Draft',
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "content" TEXT NOT NULL DEFAULT '',
    "distributionList" TEXT[],
    "trainingRequired" BOOLEAN NOT NULL DEFAULT false,
    "relatedDocuments" TEXT[],
    "tags" TEXT[],
    "facilityId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GMPDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Electronic Signatures
CREATE TABLE "ElectronicSignature" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerUserId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signatureType" "SignatureType" NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "biometricData" TEXT,
    "ipAddress" TEXT NOT NULL,
    "browserFingerprint" TEXT NOT NULL,

    CONSTRAINT "ElectronicSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Audit Trail
CREATE TABLE "AuditTrailEntry" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "fieldChanged" TEXT,
    "reason" TEXT,
    "ipAddress" TEXT NOT NULL,
    "browserInfo" TEXT NOT NULL,

    CONSTRAINT "AuditTrailEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Batch Records
CREATE TABLE "BatchRecord" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL UNIQUE,
    "masterRecordId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL UNIQUE,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'In_Progress',
    "qaReviewer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Process Steps
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepDescription" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "operatorId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "processParameters" JSONB NOT NULL DEFAULT '{}',
    "deviations" TEXT[],

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Deviations
CREATE TABLE "Deviation" (
    "id" TEXT NOT NULL,
    "deviationNumber" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "severity" "DeviationSeverity" NOT NULL,
    "status" "DeviationStatus" NOT NULL DEFAULT 'Open',
    "reportedBy" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "facilityId" TEXT NOT NULL,
    "batchId" TEXT,
    "investigation" JSONB,
    "capa" JSONB,

    CONSTRAINT "Deviation_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Quality Specifications
CREATE TABLE "QualitySpecification" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "testMethod" TEXT NOT NULL,
    "acceptanceCriteria" TEXT NOT NULL,

    CONSTRAINT "QualitySpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Test Results
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "unit" TEXT,
    "specification" TEXT NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "testedBy" TEXT NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL,
    "instrumentId" TEXT,
    "certificateNumber" TEXT,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Training Records
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,
    "passingScore" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "certificateNumber" TEXT,
    "validUntil" TIMESTAMP(3),
    "instructor" TEXT,
    "trainingMethods" TEXT[],
    "regulatoryRequirement" BOOLEAN NOT NULL DEFAULT false,
    "jobFunction" TEXT,
    "effectivenessAssessed" BOOLEAN NOT NULL DEFAULT false,
    "effectivenessScore" INTEGER,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Document Attachments
CREATE TABLE "DocumentAttachment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "fileUrl" TEXT,

    CONSTRAINT "DocumentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "GMPDocument_facilityId_idx" ON "GMPDocument"("facilityId");
CREATE INDEX "GMPDocument_documentType_idx" ON "GMPDocument"("documentType");
CREATE INDEX "GMPDocument_status_idx" ON "GMPDocument"("status");
CREATE INDEX "GMPDocument_documentNumber_idx" ON "GMPDocument"("documentNumber");

CREATE INDEX "ElectronicSignature_documentId_idx" ON "ElectronicSignature"("documentId");
CREATE INDEX "ElectronicSignature_signerUserId_idx" ON "ElectronicSignature"("signerUserId");
CREATE INDEX "ElectronicSignature_signedAt_idx" ON "ElectronicSignature"("signedAt");

CREATE INDEX "AuditTrailEntry_documentId_idx" ON "AuditTrailEntry"("documentId");
CREATE INDEX "AuditTrailEntry_userId_idx" ON "AuditTrailEntry"("userId");
CREATE INDEX "AuditTrailEntry_timestamp_idx" ON "AuditTrailEntry"("timestamp");

CREATE INDEX "BatchRecord_facilityId_idx" ON "BatchRecord"("facilityId");
CREATE INDEX "BatchRecord_status_idx" ON "BatchRecord"("status");
CREATE INDEX "BatchRecord_startDate_idx" ON "BatchRecord"("startDate");
CREATE INDEX "BatchRecord_lotNumber_idx" ON "BatchRecord"("lotNumber");

CREATE INDEX "ProcessStep_batchId_idx" ON "ProcessStep"("batchId");
CREATE INDEX "ProcessStep_operatorId_idx" ON "ProcessStep"("operatorId");

CREATE INDEX "Deviation_facilityId_idx" ON "Deviation"("facilityId");
CREATE INDEX "Deviation_severity_idx" ON "Deviation"("severity");
CREATE INDEX "Deviation_status_idx" ON "Deviation"("status");
CREATE INDEX "Deviation_reportedAt_idx" ON "Deviation"("reportedAt");

CREATE INDEX "QualitySpecification_batchId_idx" ON "QualitySpecification"("batchId");
CREATE INDEX "TestResult_batchId_idx" ON "TestResult"("batchId");
CREATE INDEX "TestResult_testedAt_idx" ON "TestResult"("testedAt");

CREATE INDEX "TrainingRecord_userId_idx" ON "TrainingRecord"("userId");
CREATE INDEX "TrainingRecord_courseId_idx" ON "TrainingRecord"("courseId");
CREATE INDEX "TrainingRecord_completedAt_idx" ON "TrainingRecord"("completedAt");
CREATE INDEX "TrainingRecord_validUntil_idx" ON "TrainingRecord"("validUntil");

CREATE INDEX "DocumentAttachment_documentId_idx" ON "DocumentAttachment"("documentId");

-- AddForeignKey
ALTER TABLE "GMPDocument" ADD CONSTRAINT "GMPDocument_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GMPDocument" ADD CONSTRAINT "GMPDocument_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ElectronicSignature" ADD CONSTRAINT "ElectronicSignature_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GMPDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElectronicSignature" ADD CONSTRAINT "ElectronicSignature_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditTrailEntry" ADD CONSTRAINT "AuditTrailEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GMPDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTrailEntry" ADD CONSTRAINT "AuditTrailEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BatchRecord" ADD CONSTRAINT "BatchRecord_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchRecord"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Deviation" ADD CONSTRAINT "Deviation_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deviation" ADD CONSTRAINT "Deviation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchRecord"("batchId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deviation" ADD CONSTRAINT "Deviation_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QualitySpecification" ADD CONSTRAINT "QualitySpecification_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchRecord"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchRecord"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_testedBy_fkey" FOREIGN KEY ("testedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GMPDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;