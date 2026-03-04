import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { prisma } from "../../config/db";
import { s3 } from "../../config/s3";
import { env } from "../../config/env";
import type { UpdateProfileInput, UpdateLocationInput, UpdatePreferencesInput } from "./profile.schema";

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
    data: { latitude: input.latitude, longitude: input.longitude },
    select: { id: true, latitude: true, longitude: true },
  });

  return profile;
}

export async function getPhotoUploadUrl(userId: string, contentType: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) {
    throw Object.assign(new Error("Profile not found"), { statusCode: 404, code: "NOT_FOUND" });
  }

  const ext = contentType.split("/")[1] ?? "jpg";
  const s3Key = `photos/${profile.id}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  // Count existing photos for order
  const photoCount = await prisma.photo.count({ where: { profileId: profile.id } });
  const isFirst = photoCount === 0;

  // Save placeholder record — URL will be the public CDN path
  const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`;
  const photo = await prisma.photo.create({
    data: {
      profileId: profile.id,
      url: publicUrl,
      s3Key,
      order: photoCount,
      isPrimary: isFirst,
    },
  });

  return { photo, uploadUrl };
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

  // Delete from S3
  await s3.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: photo.s3Key })
  );

  await prisma.photo.delete({ where: { id: photoId } });

  // If deleted primary, reassign to first remaining photo
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
  const preferences = await prisma.preference.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });

  return preferences;
}
