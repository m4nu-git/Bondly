import type { FastifyInstance } from "fastify";
import { authenticate } from "../../shared/middleware/authenticate";
import { ok, fail } from "../../shared/utils/response";
import { updateProfileSchema, updateLocationSchema, updatePreferencesSchema } from "./profile.schema";
import {
  getMyProfile,
  updateProfile,
  updateLocation,
  getPhotoUploadUrl,
  deletePhoto,
  upsertPreferences,
} from "./profile.service";

export async function profileRoutes(app: FastifyInstance) {
  // All profile routes require auth
  const opts = { preHandler: authenticate };

  // GET /profile/me
  app.get("/profile/me", opts, async (req, reply) => {
    try {
      const profile = await getMyProfile(req.userId);
      return ok(reply, profile);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // PUT /profile
  app.put("/profile", opts, async (req, reply) => {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
      return fail(reply, 400, "VALIDATION_ERROR", result.error.issues[0].message);
    }

    try {
      const profile = await updateProfile(req.userId, result.data);
      return ok(reply, profile);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // PUT /profile/location
  app.put("/profile/location", opts, async (req, reply) => {
    const result = updateLocationSchema.safeParse(req.body);
    if (!result.success) {
      return fail(reply, 400, "VALIDATION_ERROR", result.error.issues[0].message);
    }

    try {
      const location = await updateLocation(req.userId, result.data);
      return ok(reply, location);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // POST /profile/photos
  app.post("/profile/photos", opts, async (req, reply) => {
    const body = req.body as { contentType?: string };
    const contentType = body?.contentType ?? "image/jpeg";

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(contentType)) {
      return fail(reply, 400, "INVALID_CONTENT_TYPE", "Allowed types: jpeg, png, webp");
    }

    try {
      const data = await getPhotoUploadUrl(req.userId, contentType);
      return ok(reply, data, 201);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // DELETE /profile/photos/:id
  app.delete("/profile/photos/:id", opts, async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      await deletePhoto(req.userId, id);
      return ok(reply, { message: "Photo deleted" });
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // PUT /preferences
  app.put("/preferences", opts, async (req, reply) => {
    const result = updatePreferencesSchema.safeParse(req.body);
    if (!result.success) {
      return fail(reply, 400, "VALIDATION_ERROR", result.error.issues[0].message);
    }

    try {
      const preferences = await upsertPreferences(req.userId, result.data);
      return ok(reply, preferences);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });
}
