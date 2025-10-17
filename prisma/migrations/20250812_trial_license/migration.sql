-- Trial License Marketplace Tables

CREATE TABLE IF NOT EXISTS "TrialLicenseListing" (
  "id" TEXT PRIMARY KEY,
  "trialId" TEXT NOT NULL REFERENCES "Trial"("id") ON DELETE CASCADE,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "licenseType" TEXT NOT NULL,
  "usageRights" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "royaltyPercent" NUMERIC,
  "territory" TEXT[],
  "exclusive" BOOLEAN DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trial_license_listing_trial_idx ON "TrialLicenseListing"("trialId");
CREATE INDEX IF NOT EXISTS trial_license_listing_owner_idx ON "TrialLicenseListing"("ownerId");
CREATE INDEX IF NOT EXISTS trial_license_listing_status_idx ON "TrialLicenseListing"("status");

CREATE TABLE IF NOT EXISTS "TrialLicensePurchase" (
  "id" TEXT PRIMARY KEY,
  "listingId" TEXT NOT NULL REFERENCES "TrialLicenseListing"("id") ON DELETE CASCADE,
  "buyerId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "usageRights" TEXT NOT NULL,
  "territory" TEXT[],
  "exclusive" BOOLEAN DEFAULT FALSE,
  "stripePaymentIntentId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trial_license_purchase_listing_idx ON "TrialLicensePurchase"("listingId");
CREATE INDEX IF NOT EXISTS trial_license_purchase_buyer_idx ON "TrialLicensePurchase"("buyerId");


