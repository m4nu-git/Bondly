-- Track when a user last updated their location
ALTER TABLE "Profile" ADD COLUMN "locationUpdatedAt" TIMESTAMP(3);
