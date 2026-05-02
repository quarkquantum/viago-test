-- Make busId, driverId, departureTime, arrivalTime optional (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'departureTime' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "trips" ALTER COLUMN "departureTime" DROP NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'arrivalTime' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "trips" ALTER COLUMN "arrivalTime" DROP NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'busId' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "trips" ALTER COLUMN "busId" DROP NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'driverId' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "trips" ALTER COLUMN "driverId" DROP NOT NULL;
  END IF;
END $$;

-- AddColumn: Add departure and arrival city references (idempotent)
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "departureCityId" TEXT;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "arrivalCityId" TEXT;

-- AddForeignKey (idempotent, only if City exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'City') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'trips_departureCityId_fkey'
    ) THEN
      ALTER TABLE "trips"
        ADD CONSTRAINT "trips_departureCityId_fkey"
        FOREIGN KEY ("departureCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'City') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'trips_arrivalCityId_fkey'
    ) THEN
      ALTER TABLE "trips"
        ADD CONSTRAINT "trips_arrivalCityId_fkey"
        FOREIGN KEY ("arrivalCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
