import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt";
import type { RegisterInput, LoginInput } from "./auth.schema";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const { email, phone, password } = input;

  // Check if already exists
  const existing = await prisma.user.findFirst({
    where: { OR: [email ? { email } : {}, phone ? { phone } : {}] },
  });

  if (existing) {
    throw Object.assign(new Error("User already exists"), { statusCode: 409, code: "USER_EXISTS" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      profile: {
        create: {
          name: "",
          dob: new Date(),
          gender: "",
        },
      },
      preferences: { create: {} },
    },
    select: { id: true, email: true, phone: true, createdAt: true },
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function loginUser(input: LoginInput) {
  const { email, phone, password } = input;

  const user = await prisma.user.findFirst({
    where: { OR: [email ? { email } : {}, phone ? { phone } : {}] },
    select: { id: true, email: true, phone: true, passwordHash: true },
  });

  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw Object.assign(new Error("Invalid credentials"), {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshTokens(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error("Invalid refresh token"), {
      statusCode: 401,
      code: "INVALID_TOKEN",
    });
  }

  if (payload.type !== "refresh") {
    throw Object.assign(new Error("Invalid token type"), {
      statusCode: 401,
      code: "INVALID_TOKEN",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404, code: "USER_NOT_FOUND" });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return { accessToken, refreshToken };
}

export async function logoutUser(token: string) {
  // Decode to get expiry without verifying (already authenticated)
  const parts = token.split(".");
  if (parts.length !== 3) return;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    const ttl = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 900;
    if (ttl > 0) {
      await redis.setex(`blacklist:${token}`, ttl, "1");
    }
  } catch {
    // ignore malformed token during logout
  }
}
