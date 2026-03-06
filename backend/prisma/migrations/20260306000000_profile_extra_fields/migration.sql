-- Add optional profile fields for onboarding
ALTER TABLE "Profile"
  ADD COLUMN "hometown"   TEXT,
  ADD COLUMN "religion"   TEXT,
  ADD COLUMN "occupation" TEXT,
  ADD COLUMN "datingType" TEXT;
