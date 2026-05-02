-- Create AgencyRole table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AgencyRole" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert AGENCY_MANAGER role if it doesn't exist (no extension dependencies)
INSERT INTO "AgencyRole" (id, name, "createdAt")
VALUES (md5(random()::text || clock_timestamp()::text), 'AGENCY_MANAGER', NOW())
ON CONFLICT ("name") DO NOTHING;
