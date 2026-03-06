import { api } from './client';

export interface PhotoItem {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface FeedProfile {
  id: string;
  userId: string;
  name: string;
  dob: string;
  gender: string;
  bio: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
  photos: PhotoItem[];
}

export interface FeedResponse {
  profiles: FeedProfile[];
  page: number;
  limit: number;
  count: number;
  locationStale?: boolean;
}

export const discoveryApi = {
  getFeed: async (page = 1, limit = 20): Promise<FeedResponse> => {
    const res = await api.get<{ data: FeedResponse }>('/discovery/feed', { params: { page, limit } });
    return res.data.data;
  },
};
