import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  dob: z.string().datetime().optional(),
  gender: z.string().optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updatePreferencesSchema = z.object({
  minAge: z.number().int().min(18).max(100).optional(),
  maxAge: z.number().int().min(18).max(100).optional(),
  gender: z.string().optional(),
  maxDistance: z.number().int().min(1).max(500).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
