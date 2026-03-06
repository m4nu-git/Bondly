/**
 * users.routes.ts
 *
 * All /users/* endpoints — replicating mohitejaikumar/Hinge1Backend
 * on our Fastify stack.
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../shared/middleware/authenticate";
import { ok, created, fail } from "../../shared/utils/response";
import * as svc from "./users.service";

// ─── validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  firstName:       z.string().min(1),
  lastName:        z.string().min(1),
  email:           z.string().email(),
  password:        z.string().min(6),
  gender:          z.string().min(1),
  phoneNumber:     z.string().min(10),
  preferredGender: z.string().min(1),
  latitude:        z.string(),
  longitude:       z.string(),
  occupation:      z.string(),
  region:          z.string(),
  religion:        z.string(),
  date_of_birth:   z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Format: dd-mm-yyyy"),
  home_town:       z.string(),
  dating_type:     z.string(),
  behaviours:      z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

const imageLikedSchema = z.object({
  likedUserId: z.string().uuid(),
  imageId:     z.string().uuid(),
  comment:     z.string().default(""),
});

const behaviourLikedSchema = z.object({
  likedUserId:  z.string().uuid(),
  behaviourId:  z.string().uuid(),
  comment:      z.string().default(""),
});

const rejectSchema = z.object({
  rejectedUserId: z.string().uuid(),
});

const acceptSchema = z.object({
  acceptedUserId: z.string().uuid(),
  message:        z.string().default(""),
});

// ─── helper ───────────────────────────────────────────────────────────────────

function handle(reply: Parameters<typeof fail>[0], err: unknown) {
  const e = err as { statusCode?: number; code?: string; message?: string };
  return fail(reply, e.statusCode ?? 500, e.code ?? "INTERNAL_ERROR", e.message ?? "Internal error");
}

// ─── route registration ───────────────────────────────────────────────────────

export async function usersRoutes(app: FastifyInstance) {

  // POST /users/register
  app.post("/register", async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return fail(reply, 400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    try {
      const data = await svc.registerUser(parsed.data);
      return created(reply, data);
    } catch (e) { return handle(reply, e); }
  });

  // POST /users/login
  app.post("/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return fail(reply, 400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    try {
      const { email, password } = parsed.data;
      const data = await svc.loginUser(email, password);
      return ok(reply, data);
    } catch (e) { return handle(reply, e); }
  });

  // POST /users/imageLiked  [auth]
  app.post("/imageLiked", { preHandler: authenticate }, async (req, reply) => {
    const parsed = imageLikedSchema.safeParse(req.body);
    if (!parsed.success) return fail(reply, 400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    try {
      const { likedUserId, imageId, comment } = parsed.data;
      await svc.imageLiked(req.userId, likedUserId, imageId, comment);
      return ok(reply, { message: "Image Liked" });
    } catch (e) { return handle(reply, e); }
  });

  // POST /users/behaviourLiked  [auth]
  app.post("/behaviourLiked", { preHandler: authenticate }, async (req, reply) => {
    const parsed = behaviourLikedSchema.safeParse(req.body);
    if (!parsed.success) return fail(reply, 400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    try {
      const { likedUserId, behaviourId, comment } = parsed.data;
      await svc.behaviourLiked(req.userId, likedUserId, behaviourId, comment);
      return ok(reply, { message: "Behaviour Liked" });
    } catch (e) { return handle(reply, e); }
  });

  // POST /users/reject  [auth]
  app.post("/reject", { preHandler: authenticate }, async (req, reply) => {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return fail(reply, 400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    try {
      await svc.rejectUser(req.userId, parsed.data.rejectedUserId);
      return ok(reply, { message: "Rejected successfully" });
    } catch (e) { return handle(reply, e); }
  });

  // POST /users/accept  [auth]
  app.post("/accept", { preHandler: authenticate }, async (req, reply) => {
    const parsed = acceptSchema.safeParse(req.body);
    if (!parsed.success) return fail(reply, 400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    try {
      await svc.acceptUser(req.userId, parsed.data.acceptedUserId, parsed.data.message);
      return ok(reply, { message: "Accepted successfully" });
    } catch (e) { return handle(reply, e); }
  });

  // GET /users/matches  [auth] — discovery feed
  app.get("/matches", { preHandler: authenticate }, async (req, reply) => {
    try {
      const feed = await svc.getDiscoveryFeed(req.userId);
      return ok(reply, feed);
    } catch (e) { return handle(reply, e); }
  });

  // GET /users/allLikes  [auth]
  app.get("/allLikes", { preHandler: authenticate }, async (req, reply) => {
    try {
      const likes = await svc.getAllLikes(req.userId);
      return ok(reply, likes);
    } catch (e) { return handle(reply, e); }
  });

  // GET /users/me  [auth]
  app.get("/me", { preHandler: authenticate }, async (req, reply) => {
    try {
      const user = await svc.getMe(req.userId);
      return ok(reply, user);
    } catch (e) { return handle(reply, e); }
  });

  // GET /users/profile/:id  [auth] — gated by incoming like
  app.get<{ Params: { id: string } }>("/profile/:id", { preHandler: authenticate }, async (req, reply) => {
    try {
      const user = await svc.getPublicProfile(req.userId, req.params.id);
      return ok(reply, user);
    } catch (e) { return handle(reply, e); }
  });

  // GET /users/chats/:id  [auth]
  app.get<{ Params: { id: string } }>("/chats/:id", { preHandler: authenticate }, async (req, reply) => {
    try {
      const messages = await svc.getChatHistory(req.userId, req.params.id);
      return ok(reply, messages);
    } catch (e) { return handle(reply, e); }
  });

  // GET /users/allMatches  [auth]
  app.get("/allMatches", { preHandler: authenticate }, async (req, reply) => {
    try {
      const result = await svc.getAllMatches(req.userId);
      return ok(reply, result);
    } catch (e) { return handle(reply, e); }
  });
}
