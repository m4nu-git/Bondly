import { api } from './client';

export interface SwipeResult {
  matched: boolean;
  matchId?: string;
}

export interface LikeReceived {
  userId: string;
  name: string | null;
  primaryPhoto: string | null;
  likedAt: string;
}

export const swipeApi = {
  swipe: async (targetUserId: string, action: 'LIKE' | 'PASS'): Promise<SwipeResult> => {
    const res = await api.post<{ data: SwipeResult }>('/swipe', { targetUserId, action });
    return res.data.data;
  },

  getLikesReceived: async (): Promise<LikeReceived[]> => {
    const res = await api.get<{ data: LikeReceived[] }>('/swipe/likes-received');
    return res.data.data;
  },
};
