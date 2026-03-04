import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt";
import { redis } from "../../config/redis";
import { fail } from "../utils/response";

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return fail(reply, 401, "UNAUTHORIZED", "Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);

  // Check if token is blacklisted
  const blacklisted = await redis.get(`blacklist:${token}`);
  if (blacklisted) {
    return fail(reply, 401, "TOKEN_REVOKED", "Token has been revoked");
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
  } catch {
    return fail(reply, 401, "INVALID_TOKEN", "Invalid or expired token");
  }
}
