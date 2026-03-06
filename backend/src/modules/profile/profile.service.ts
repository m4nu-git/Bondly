import { prisma } from "../../config/db";
import type { UpdateProfileInput, UpdateLocationInput, UpdatePreferencesInput } from "./profile.schema";
import { encodeGeohash } from "../../helpers/geohash";

export async function getMyProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      photos: { orderBy: { order: "asc" } },
      prompts: true,
    },
  });

  if (!profile) {
    throw Object.assign(new Error("Profile not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  return profile;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.dob && { dob: new Date(input.dob) }),
      ...(input.gender && { gender: input.gender }),
      ...(input.hometown !== undefined && { hometown: input.hometown }),
      ...(input.religion !== undefined && { religion: input.religion }),
      ...(input.occupation !== undefined && { occupation: input.occupation }),
      ...(input.datingType !== undefined && { datingType: input.datingType }),
    },
    include: {
      photos: { orderBy: { order: "asc" } },
      prompts: true,
    },
  });

  return profile;
}

export async function updateLocation(userId: string, input: UpdateLocationInput) {
  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      latitude: input.latitude,
      longitude: input.longitude,
      locationUpdatedAt: new Date(),
      geohash: encodeGeohash(input.latitude, input.longitude, 4),
    },
    select: { id: true, latitude: true, longitude: true, locationUpdatedAt: true },
  });

  return profile;
}

export async function savePhotoFromCloudinary(userId: string, cloudinaryUrl: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) {
    throw Object.assign(new Error("Profile not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  const photoCount = await prisma.photo.count({ where: { profileId: profile.id } });
  const isFirst = photoCount === 0;

  const photo = await prisma.photo.create({
    data: {
      profileId: profile.id,
      url: cloudinaryUrl,
      order: photoCount,
      isPrimary: isFirst,
    },
  });

  return { photo };
}

export async function deletePhoto(userId: string, photoId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) {
    throw Object.assign(new Error("Profile not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, profileId: profile.id },
  });

  if (!photo) {
    throw Object.assign(new Error("Photo not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  await prisma.photo.delete({ where: { id: photoId } });

  if (photo.isPrimary) {
    const firstPhoto = await prisma.photo.findFirst({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
    });
    if (firstPhoto) {
      await prisma.photo.update({ where: { id: firstPhoto.id }, data: { isPrimary: true } });
    }
  }
}

export async function upsertPreferences(userId: string, input: UpdatePreferencesInput) {
  return prisma.preference.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}

export async function getPublicProfile(targetUserId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId: targetUserId },
    select: {
      id: true,
      userId: true,
      name: true,
      dob: true,
      gender: true,
      bio: true,
      latitude: true,
      longitude: true,
      photos:  { select: { id: true, url: true, order: true, isPrimary: true }, orderBy: { order: "asc" } },
      prompts: { select: { id: true, question: true, answer: true } },
    },
  });

  if (!profile) {
    throw Object.assign(new Error("Profile not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  return profile;
}

export interface SavePromptsInput {
  prompts: Array<{ question: string; answer: string }>;
}

export async function savePrompts(userId: string, input: SavePromptsInput) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) {
    throw Object.assign(new Error("Profile not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  await prisma.prompt.deleteMany({ where: { profileId: profile.id } });

  const created = await prisma.prompt.createMany({
    data: input.prompts.map((p) => ({
      profileId: profile.id,
      question: p.question,
      answer: p.answer,
    })),
  });

  return { count: created.count };
}
