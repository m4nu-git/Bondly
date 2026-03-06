import { api } from './client';

export interface PhotoItem {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface PromptItem {
  id: string;
  question: string;
  answer: string;
}

export interface MyProfile {
  id: string;
  userId: string;
  name: string;
  dob: string;
  gender: string;
  bio: string | null;
  photos: PhotoItem[];
  prompts: PromptItem[];
}

export interface PublicProfile {
  id: string;
  userId: string;
  name: string;
  dob: string;
  gender: string;
  bio: string | null;
  distance_km?: number;
  photos: PhotoItem[];
  prompts: PromptItem[];
}

export const profileApi = {
  getMe: async (): Promise<MyProfile> => {
    const res = await api.get<{ data: MyProfile }>('/profile/me');
    return res.data.data;
  },

  getProfile: async (userId: string): Promise<PublicProfile> => {
    const res = await api.get<{ data: PublicProfile }>(`/profile/${userId}`);
    return res.data.data;
  },

  update: (body: {
    name?: string;
    bio?: string;
    dob?: string;
    gender?: string;
    hometown?: string;
    religion?: string;
    occupation?: string;
    datingType?: string;
  }) => api.put('/profile', body),

  updateLocation: (body: { latitude: number; longitude: number }) =>
    api.put('/profile/location', body),

  // ── Cloudinary direct upload (active) ────────────────────────────────────────
  uploadPhotoViaCloudinary: async (localUri: string): Promise<PhotoItem> => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

    // Step 1: upload directly to Cloudinary
    const form = new FormData();
    form.append('file', { uri: localUri, type: 'image/jpeg', name: 'photo.jpg' } as any);
    form.append('upload_preset', uploadPreset);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form }
    );
    if (!cloudRes.ok) throw new Error('Cloudinary upload failed');
    const cloudData = await cloudRes.json();

    // Step 2: save the Cloudinary URL to our backend
    const res = await api.post<{ data: { photo: PhotoItem } }>('/profile/photos', { url: cloudData.secure_url });
    return res.data.data.photo;
  },

  // ── S3 presigned upload (kept for future use) ─────────────────────────────
  // getPhotoUploadUrl: async (contentType: string): Promise<{ photo: PhotoItem; uploadUrl: string }> => {
  //   const res = await api.post<{ data: { photo: PhotoItem; uploadUrl: string } }>('/profile/photos', { contentType });
  //   return res.data.data;
  // },
  // ─────────────────────────────────────────────────────────────────────────

  deletePhoto: (photoId: string) => api.delete(`/profile/photos/${photoId}`),

  upsertPreferences: (body: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
    maxDistance?: number;
  }) => api.put('/preferences', body),

  savePrompts: (prompts: { question: string; answer: string }[]) =>
    api.post('/profile/prompts', { prompts }),
};
