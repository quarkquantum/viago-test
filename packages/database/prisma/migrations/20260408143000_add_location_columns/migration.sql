-- Add missing location columns used by current Prisma schema (idempotent)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trips') THEN
    ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyMember') THEN
    ALTER TABLE "AgencyMember" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyRole') THEN
    ALTER TABLE "AgencyRole" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
  END IF;
END $$;

-- Add indexes (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trips') THEN
    CREATE INDEX IF NOT EXISTS "trips_locationId_idx" ON "trips"("locationId");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
    CREATE INDEX IF NOT EXISTS "Booking_locationId_idx" ON "Booking"("locationId");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyMember') THEN
    CREATE INDEX IF NOT EXISTS "AgencyMember_locationId_idx" ON "AgencyMember"("locationId");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyRole') THEN
    CREATE INDEX IF NOT EXISTS "AgencyRole_locationId_idx" ON "AgencyRole"("locationId");
  END IF;
END $$;

-- Add foreign keys (idempotent, only if both tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trips') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'trips_locationId_fkey'
    ) THEN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyLocation') THEN
        ALTER TABLE "trips"
          ADD CONSTRAINT "trips_locationId_fkey"
          FOREIGN KEY ("locationId") REFERENCES "AgencyLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'Booking_locationId_fkey'
    ) THEN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyLocation') THEN
        ALTER TABLE "Booking"
          ADD CONSTRAINT "Booking_locationId_fkey"
          FOREIGN KEY ("locationId") REFERENCES "AgencyLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyMember') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'AgencyMember_locationId_fkey'
    ) THEN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyLocation') THEN
        ALTER TABLE "AgencyMember"
          ADD CONSTRAINT "AgencyMember_locationId_fkey"
          FOREIGN KEY ("locationId") REFERENCES "AgencyLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyRole') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'AgencyRole_locationId_fkey'
    ) THEN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgencyLocation') THEN
        ALTER TABLE "AgencyRole"
          ADD CONSTRAINT "AgencyRole_locationId_fkey"
          FOREIGN KEY ("locationId") REFERENCES "AgencyLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;
