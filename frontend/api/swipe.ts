import { api } from './client';

export interface LikeReceivedItem {
  id: string;
  comment: string;
  photo: { id: string; url: string } | null;
  prompt: { id: string; question: string; answer: string } | null;
  likedBy: {
    id: string;
    profile: {
      name: string;
      photos: { id: string; url: string }[];
    } | null;
  };
}

export const swipeApi = {
  imageLiked: async (likedUserId: string, imageId: string, comment = '') => {
    await api.post('/users/imageLiked', { likedUserId, imageId, comment });
  },

  behaviourLiked: async (likedUserId: string, behaviourId: string, comment = '') => {
    await api.post('/users/behaviourLiked', { likedUserId, behaviourId, comment });
  },

  reject: async (rejectedUserId: string) => {
    await api.post('/users/reject', { rejectedUserId });
  },

  getAllLikes: async (): Promise<LikeReceivedItem[]> => {
    const res = await api.get<{ data: LikeReceivedItem[] }>('/users/allLikes');
    return res.data.data ?? [];
  },
};
