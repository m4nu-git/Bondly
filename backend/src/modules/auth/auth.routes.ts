import type { FastifyInstance } from "fastify";
import { authenticate } from "../../shared/middleware/authenticate";
import { ok, created, fail } from "../../shared/utils/response";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schema";
import { registerUser, loginUser, refreshTokens, logoutUser } from "./auth.service";

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post("/register", async (req, reply) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return fail(reply, 400, "VALIDATION_ERROR", result.error.issues[0].message);
    }

    try {
      const data = await registerUser(result.data);
      return created(reply, data);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // POST /auth/login
  app.post("/login", async (req, reply) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return fail(reply, 400, "VALIDATION_ERROR", result.error.issues[0].message);
    }

    try {
      const data = await loginUser(result.data);
      return ok(reply, data);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // POST /auth/refresh
  app.post("/refresh", async (req, reply) => {
    const result = refreshSchema.safeParse(req.body);
    if (!result.success) {
      return fail(reply, 400, "VALIDATION_ERROR", result.error.issues[0].message);
    }

    try {
      const data = await refreshTokens(result.data.refreshToken);
      return ok(reply, data);
    } catch (err: any) {
      return fail(reply, err.statusCode ?? 500, err.code ?? "INTERNAL_ERROR", err.message);
    }
  });

  // POST /auth/logout
  app.post("/logout", { preHandler: authenticate }, async (req, reply) => {
    const token = req.headers.authorization!.slice(7);
    await logoutUser(token);
    return ok(reply, { message: "Logged out successfully" });
  });
}
