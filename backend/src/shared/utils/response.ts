import type { FastifyReply } from "fastify";
import type { ApiResponse } from "../types";

export function ok<T>(reply: FastifyReply, data: T, statusCode = 200) {
  const response: ApiResponse<T> = { success: true, data };
  return reply.status(statusCode).send(response);
}

export function created<T>(reply: FastifyReply, data: T) {
  return ok(reply, data, 201);
}

export function fail(reply: FastifyReply, statusCode: number, code: string, message: string) {
  const response: ApiResponse = { success: false, error: { code, message } };
  return reply.status(statusCode).send(response);
}
