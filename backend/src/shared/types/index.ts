export interface JwtPayload {
  userId: string;
  type: "access" | "refresh";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}
