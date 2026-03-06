import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  dob: z.string().datetime().optional(),
  gender: z.string().optional(),
  hometown: z.string().max(100).optional().nullable(),
  religion: z.string().max(50).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  datingType: z.string().max(50).optional().nullable(),
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

export const savePromptsSchema = z.object({
  prompts: z
    .array(
      z.object({
        question: z.string().min(1).max(200),
        answer: z.string().min(1).max(150),
      })
    )
    .min(1)
    .max(3),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type SavePromptsInput = z.infer<typeof savePromptsSchema>;
