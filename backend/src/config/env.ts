import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("30d"),

  // ── Cloudinary (active) ──────────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_UPLOAD_PRESET: z.string(), // unsigned upload preset from Cloudinary dashboard

  // ── AWS S3 (kept for future use — currently commented out in profile.service) ─
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),

  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
