-- CreateTable
CREATE TABLE "AgencySubscription" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgencySubscription_agencyId_key" ON "AgencySubscription"("agencyId");

-- CreateIndex
CREATE INDEX "AgencySubscription_status_idx" ON "AgencySubscription"("status");

-- CreateIndex
CREATE INDEX "AgencySubscription_trialEndDate_idx" ON "AgencySubscription"("trialEndDate");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_status_idx" ON "Invoice"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- AddForeignKey (idempotent, only if agencies table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agencies') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'AgencySubscription_agencyId_fkey'
    ) THEN
      ALTER TABLE "AgencySubscription" ADD CONSTRAINT "AgencySubscription_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;

-- AddForeignKey (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_subscriptionId_fkey'
  ) THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AgencySubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Seed: Create trial subscriptions for existing agencies (idempotent, only if agencies table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agencies') THEN
    INSERT INTO "AgencySubscription" ("id", "agencyId", "status", "trialStartDate", "trialEndDate", "createdAt", "updatedAt")
    SELECT
        gen_random_uuid()::text,
        a."id",
        'TRIAL',
        a."createdAt",
        a."createdAt" + INTERVAL '6 months',
        NOW(),
        NOW()
    FROM "agencies" a
    WHERE NOT EXISTS (
        SELECT 1 FROM "AgencySubscription" s WHERE s."agencyId" = a."id"
    );
  END IF;
END $$;
