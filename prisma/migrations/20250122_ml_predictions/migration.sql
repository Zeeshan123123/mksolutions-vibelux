-- CreateTable
CREATE TABLE "MLPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "prediction" JSONB NOT NULL,
    "actual" JSONB,
    "feedback" JSONB,
    "accuracy" REAL,
    "modelVersion" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MLPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable  
CREATE TABLE "MLModelVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accuracy" REAL NOT NULL,
    "trainingDataPoints" INTEGER NOT NULL,
    "improvements" JSONB,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MLModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLLearningEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "facilityId" TEXT,
    "dataPoints" INTEGER NOT NULL,
    "modelType" TEXT NOT NULL,
    "beforeAccuracy" REAL,
    "afterAccuracy" REAL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLLearningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MLPrediction_facilityId_idx" ON "MLPrediction"("facilityId");
CREATE INDEX "MLPrediction_predictionType_idx" ON "MLPrediction"("predictionType");
CREATE INDEX "MLPrediction_timestamp_idx" ON "MLPrediction"("timestamp");
CREATE INDEX "MLPrediction_accuracy_idx" ON "MLPrediction"("accuracy");

-- CreateIndex
CREATE INDEX "MLModelVersion_modelType_idx" ON "MLModelVersion"("modelType");
CREATE INDEX "MLModelVersion_isActive_idx" ON "MLModelVersion"("isActive");

-- CreateIndex  
CREATE INDEX "MLLearningEvent_facilityId_idx" ON "MLLearningEvent"("facilityId");
CREATE INDEX "MLLearningEvent_modelType_idx" ON "MLLearningEvent"("modelType");