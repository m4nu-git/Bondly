import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env";
import { redis } from "./config/redis";
import { authRoutes } from "./modules/auth/auth.routes";
import { profileRoutes } from "./modules/profile/profile.routes";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // Plugins
  await app.register(cors, {
    origin: env.NODE_ENV === "production" ? false : true,
    credentials: true,
  });

  await app.register(helmet, { global: true });

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    redis,
  });

  // Health check
  app.get("/health", async () => ({
    success: true,
    data: { status: "ok", uptime: process.uptime() },
  }));

  // Routes
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(profileRoutes, { prefix: "" });

  // Global error handler
  app.setErrorHandler((err: FastifyError, _req, reply) => {
    app.log.error(err);
    const statusCode = err.statusCode ?? 500;
    reply.status(statusCode).send({
      success: false,
      error: {
        code: err.code ?? "INTERNAL_ERROR",
        message: statusCode === 500 ? "Internal server error" : err.message,
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  return app;
}
