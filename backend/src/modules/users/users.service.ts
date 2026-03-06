/**
 * users.service.ts
 *
 * Business logic for all /users/* endpoints — replicating the reference repo
 * (mohitejaikumar/Hinge1Backend) but using our Fastify / Prisma / Redis stack.
 */

import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { signAccessToken, signRefreshToken } from "../../shared/utils/jwt";
import { bloomAdd, bloomCheck } from "../../helpers/bloom";
import { encodeGeohash, expandGeohash } from "../../helpers/geohash";

const SALT_ROUNDS = 10;

// ─── helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string): number {
  // Expects "dd-mm-yyyy"
  const [day, month, year] = dob.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  const now   = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

function err(msg: string, status = 400, code = "BAD_REQUEST") {
  return Object.assign(new Error(msg), { statusCode: status, code });
}

// ─── register ─────────────────────────────────────────────────────────────────

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  preferredGender: string;
  latitude: string;
  longitude: string;
  occupation: string;
  region: string;
  religion: string;
  date_of_birth: string; // "dd-mm-yyyy"
  home_town: string;
  dating_type: string;
  behaviours?: Array<{ question: string; answer: string }>;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phone: input.phoneNumber }] },
  });
  if (existing) throw err("User already exists", 409, "USER_EXISTS");

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const lat          = parseFloat(input.latitude);
  const lng          = parseFloat(input.longitude);
  const geohash      = encodeGeohash(lat, lng, 4);
  const age          = calcAge(input.date_of_birth);
  const dobDate      = (() => {
    const [d, m, y] = input.date_of_birth.split("-").map(Number);
    return new Date(y, m - 1, d);
  })();

  const user = await prisma.user.create({
    data: {
      email:        input.email,
      phone:        input.phoneNumber,
      passwordHash,
      profile: {
        create: {
          name:       `${input.firstName} ${input.lastName}`,
          dob:        dobDate,
          gender:     input.gender,
          hometown:   input.home_town,
          religion:   input.religion,
          occupation: input.occupation,
          datingType: input.dating_type,
          latitude:   lat,
          longitude:  lng,
          geohash,
          age,
          bloomFilter: "",
          prompts: input.behaviours?.length
            ? { create: input.behaviours.map((b) => ({ question: b.question, answer: b.answer })) }
            : undefined,
        },
      },
      preferences: {
        create: {
          gender:      input.preferredGender,
          maxDistance: 100,
        },
      },
    },
    select: { id: true, email: true, phone: true },
  });

  return {
    token:        signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
    userId:       user.id,
  };
}

// ─── login ────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  if (!user) throw err("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw err("Invalid credentials", 401, "INVALID_CREDENTIALS");

  return {
    token:        signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
    userId:       user.id,
  };
}

// ─── imageLiked ───────────────────────────────────────────────────────────────

export async function imageLiked(callerId: string, likedUserId: string, imageId: string, comment: string) {
  const [caller, profile] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: callerId }, select: { id: true, bloomFilter: true } }),
    prisma.photo.findUnique({ where: { id: imageId } }),
  ]);
  if (!caller)  throw err("Profile not found", 404, "NOT_FOUND");
  if (!profile) throw err("Photo not found",   404, "NOT_FOUND");

  const newFilter = bloomAdd(caller.bloomFilter, likedUserId);

  await prisma.$transaction([
    // upsert avoids duplicate-key on @@unique([likedById, likedToId])
    prisma.like.upsert({
      where:  { likedById_likedToId: { likedById: callerId, likedToId: likedUserId } },
      create: { likedById: callerId, likedToId: likedUserId, photoId: imageId, comment },
      update: { photoId: imageId, comment },
    }),
    prisma.profile.update({
      where: { userId: callerId },
      data:  { bloomFilter: newFilter },
    }),
  ]);
}

// ─── behaviourLiked ───────────────────────────────────────────────────────────

export async function behaviourLiked(callerId: string, likedUserId: string, behaviourId: string, comment: string) {
  const [caller, prompt] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: callerId }, select: { id: true, bloomFilter: true } }),
    prisma.prompt.findUnique({ where: { id: behaviourId } }),
  ]);
  if (!caller) throw err("Profile not found", 404, "NOT_FOUND");
  if (!prompt) throw err("Prompt not found",  404, "NOT_FOUND");

  const newFilter = bloomAdd(caller.bloomFilter, likedUserId);

  await prisma.$transaction([
    prisma.like.upsert({
      where:  { likedById_likedToId: { likedById: callerId, likedToId: likedUserId } },
      create: { likedById: callerId, likedToId: likedUserId, promptId: behaviourId, comment },
      update: { promptId: behaviourId, comment },
    }),
    prisma.profile.update({
      where: { userId: callerId },
      data:  { bloomFilter: newFilter },
    }),
  ]);
}

// ─── reject ───────────────────────────────────────────────────────────────────

export async function rejectUser(callerId: string, rejectedUserId: string) {
  const caller = await prisma.profile.findUnique({
    where: { userId: callerId },
    select: { bloomFilter: true },
  });
  if (!caller) throw err("Profile not found", 404, "NOT_FOUND");

  const newFilter = bloomAdd(caller.bloomFilter, rejectedUserId);

  await prisma.$transaction([
    prisma.profile.update({
      where: { userId: callerId },
      data:  { bloomFilter: newFilter },
    }),
    // Remove any incoming like from rejected user so they don't stay in allLikes
    prisma.like.deleteMany({
      where: { likedById: rejectedUserId, likedToId: callerId },
    }),
  ]);
}

// ─── accept ───────────────────────────────────────────────────────────────────

export async function acceptUser(callerId: string, acceptedUserId: string, message: string) {
  const [callerProfile, accepted] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: callerId }, select: { bloomFilter: true } }),
    prisma.user.findUnique({ where: { id: acceptedUserId }, select: { id: true } }),
  ]);
  if (!callerProfile) throw err("Profile not found", 404, "NOT_FOUND");
  if (!accepted)      throw err("Accepted user not found", 404, "NOT_FOUND");

  const newFilter = bloomAdd(callerProfile.bloomFilter, acceptedUserId);

  // Determine canonical ordering for Match @@unique([user1Id, user2Id])
  const [u1, u2] = [acceptedUserId, callerId].sort();

  await prisma.$transaction([
    // Delete the like record that triggered this accept
    prisma.like.deleteMany({
      where: { likedById: acceptedUserId, likedToId: callerId },
    }),
    // Update caller's bloom filter
    prisma.profile.update({
      where: { userId: callerId },
      data:  { bloomFilter: newFilter },
    }),
    // Create Match
    prisma.match.upsert({
      where:  { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      create: { user1Id: u1, user2Id: u2 },
      update: { isActive: true },
    }),
    // Save opening message as a Chat record
    prisma.chat.create({
      data: { senderId: callerId, receiverId: acceptedUserId, message },
    }),
  ]);
}

// ─── discovery feed (GET /users/matches) ─────────────────────────────────────

export async function getDiscoveryFeed(callerId: string) {
  const profile = await prisma.profile.findUnique({
    where:  { userId: callerId },
    select: { geohash: true, latitude: true, longitude: true, bloomFilter: true },
    // also get preference for gender filter
  });
  const preference = await prisma.preference.findUnique({
    where:  { userId: callerId },
    select: { gender: true, maxDistance: true },
  });

  if (!profile?.latitude || !profile?.longitude || !profile?.geohash) {
    return [];
  }

  const geohashes    = expandGeohash(profile.geohash);
  const preferGender = preference?.gender ?? "any";
  const maxDistM     = (preference?.maxDistance ?? 100) * 1000;

  // Raw SQL: geohash approximate filter → PostGIS precise filter → group with photos + prompts
  type RawRow = {
    id: string;
    userId: string;
    name: string;
    dob: Date;
    gender: string;
    bio: string | null;
    age: number | null;
    hometown: string | null;
    religion: string | null;
    occupation: string | null;
    datingType: string | null;
    latitude: number;
    longitude: number;
    photos: Array<{ id: string; url: string; order: number; isPrimary: boolean }> | null;
    prompts: Array<{ id: string; question: string; answer: string }> | null;
  };

  const genderFilter = preferGender === "any" ? "" : `AND p.gender = '${preferGender.replace(/'/g, "''")}'`;

  const rows: RawRow[] = await prisma.$queryRaw`
    SELECT
      p.id,
      p."userId",
      p.name,
      p.dob,
      p.gender,
      p.bio,
      p.age,
      p.hometown,
      p.religion,
      p.occupation,
      p."datingType",
      p.latitude,
      p.longitude,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', ph.id, 'url', ph.url, 'order', ph."order", 'isPrimary', ph."isPrimary"
        )) FILTER (WHERE ph.id IS NOT NULL),
        '[]'
      ) AS photos,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', pr.id, 'question', pr.question, 'answer', pr.answer
        )) FILTER (WHERE pr.id IS NOT NULL),
        '[]'
      ) AS prompts
    FROM "Profile" p
    LEFT JOIN "Photo"  ph ON p.id = ph."profileId"
    LEFT JOIN "Prompt" pr ON p.id = pr."profileId"
    WHERE
      p.geohash = ANY(${geohashes})
      AND p."userId" != ${callerId}
      AND p.latitude  IS NOT NULL
      AND p.longitude IS NOT NULL
      AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${profile.longitude}, ${profile.latitude}), 4326)::geography,
            ${maxDistM}
          )
    GROUP BY p.id
    LIMIT 20
  `;

  // Phase 3: Bloom filter — exclude users already seen
  const bloom = profile.bloomFilter;
  return rows.filter((row) => !bloomCheck(bloom, row.userId));
}

// ─── allLikes — users who liked me ───────────────────────────────────────────

export async function getAllLikes(callerId: string) {
  return prisma.like.findMany({
    where: { likedToId: callerId },
    select: {
      id:      true,
      comment: true,
      photo:   { select: { id: true, url: true } },
      prompt:  { select: { id: true, question: true, answer: true } },
      likedBy: {
        select: {
          id:      true,
          profile: {
            select: {
              name:   true,
              photos: { where: { isPrimary: true }, select: { id: true, url: true }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── me ───────────────────────────────────────────────────────────────────────

export async function getMe(callerId: string) {
  const user = await prisma.user.findUnique({
    where: { id: callerId },
    select: {
      id:    true,
      email: true,
      phone: true,
      profile: {
        select: {
          name:       true,
          dob:        true,
          gender:     true,
          bio:        true,
          hometown:   true,
          religion:   true,
          occupation: true,
          datingType: true,
          age:        true,
          photos:     { orderBy: { order: "asc" } },
          prompts:    true,
        },
      },
    },
  });
  if (!user) throw err("User not found", 404, "NOT_FOUND");
  return user;
}

// ─── profile/:id — gated by incoming like ────────────────────────────────────

export async function getPublicProfile(callerId: string, targetUserId: string) {
  // Only allowed if targetUser has already liked the caller (reference-repo rule)
  const like = await prisma.like.findFirst({
    where: { likedById: targetUserId, likedToId: callerId },
  });
  if (!like) throw err("Not authorized", 403, "FORBIDDEN");

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id:    true,
      email: true,
      profile: {
        select: {
          name:       true,
          dob:        true,
          gender:     true,
          bio:        true,
          hometown:   true,
          religion:   true,
          occupation: true,
          datingType: true,
          age:        true,
          photos:     { orderBy: { order: "asc" } },
          prompts:    true,
        },
      },
    },
  });
  if (!user) throw err("User not found", 404, "NOT_FOUND");
  return user;
}

// ─── chats/:id — message history between two users ───────────────────────────

export async function getChatHistory(callerId: string, otherId: string) {
  const [sent, received] = await prisma.$transaction([
    prisma.chat.findMany({
      where:   { senderId: callerId, receiverId: otherId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chat.findMany({
      where:   { senderId: otherId, receiverId: callerId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return [...sent, ...received].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
}

// ─── allMatches ───────────────────────────────────────────────────────────────

export async function getAllMatches(callerId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: callerId }, { user2Id: callerId }],
      isActive: true,
    },
    select: {
      id:      true,
      user1Id: true,
      user2Id: true,
      user1: {
        select: {
          id:           true,
          chatsSent:    { where: { receiverId: callerId }, orderBy: { createdAt: "desc" }, take: 1 },
          chatsReceived:{ where: { senderId:   callerId }, orderBy: { createdAt: "desc" }, take: 1 },
          profile: {
            select: {
              name:   true,
              photos: { where: { isPrimary: true }, select: { id: true, url: true }, take: 1 },
            },
          },
        },
      },
      user2: {
        select: {
          id:           true,
          chatsSent:    { where: { receiverId: callerId }, orderBy: { createdAt: "desc" }, take: 1 },
          chatsReceived:{ where: { senderId:   callerId }, orderBy: { createdAt: "desc" }, take: 1 },
          profile: {
            select: {
              name:   true,
              photos: { where: { isPrimary: true }, select: { id: true, url: true }, take: 1 },
            },
          },
        },
      },
    },
  });

  // Return the "other" person in each match
  const seen = new Map<string, unknown>();
  for (const m of matches) {
    const partner = m.user1Id === callerId ? m.user2 : m.user1;
    if (!seen.has(partner.id)) seen.set(partner.id, partner);
  }

  return { people: Array.from(seen.values()), id: callerId };
}

// ─── update bloom filter (used by WS chatManager on reject too) ───────────────

export async function updateBloom(callerId: string, targetUserId: string) {
  const profile = await prisma.profile.findUnique({
    where:  { userId: callerId },
    select: { bloomFilter: true },
  });
  if (!profile) return;

  const newFilter = bloomAdd(profile.bloomFilter, targetUserId);
  await prisma.profile.update({
    where: { userId: callerId },
    data:  { bloomFilter: newFilter },
  });
}

// ─── persist a chat message (used by WebSocket ChatManager) ───────────────────

export async function persistChat(senderId: string, receiverId: string, message: string) {
  return prisma.chat.create({
    data: { senderId, receiverId, message },
  });
}

// ─── lookup user by id (used by WebSocket) ────────────────────────────────────

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
}

// ─── update profile + location + geohash (used in registration step 2) ───────

export async function updateProfileAfterRegister(
  userId: string,
  input: Partial<{
    name: string; bio: string; dob: string; gender: string;
    hometown: string; religion: string; occupation: string; datingType: string;
    latitude: number; longitude: number;
  }>,
) {
  const data: Record<string, unknown> = { ...input };

  if (input.latitude != null && input.longitude != null) {
    data.geohash = encodeGeohash(input.latitude, input.longitude, 4);
  }
  if (input.dob) {
    data.dob = new Date(input.dob);
    const now = new Date();
    const dob = new Date(input.dob);
    let age = now.getFullYear() - dob.getFullYear();
    if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age--;
    data.age = age;
    delete data.dob;
    data.dob = new Date(input.dob);
  }

  await prisma.profile.update({ where: { userId }, data });
}
