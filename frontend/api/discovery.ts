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

export interface FeedProfile {
  id: string;       // profile id
  userId: string;
  name: string;
  dob: string;
  gender: string;
  bio: string | null;
  age: number | null;
  hometown: string | null;
  religion: string | null;
  occupation: string | null;
  datingType: string | null;
  latitude: number;
  longitude: number;
  photos: PhotoItem[];
  prompts: PromptItem[];
}

export const discoveryApi = {
  getFeed: async (): Promise<FeedProfile[]> => {
    const res = await api.get<{ data: FeedProfile[] }>('/users/matches');
    return res.data.data ?? [];
  },
};
