-- Make s3Key nullable to support Cloudinary uploads (no S3 key needed)
ALTER TABLE "Photo" ALTER COLUMN "s3Key" DROP NOT NULL;
