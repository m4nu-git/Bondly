import { api } from './client';

export interface MatchPerson {
  id: string;
  profile: {
    name: string;
    photos: { id: string; url: string }[];
  } | null;
  chatsSent: { message: string; createdAt: string }[];
  chatsReceived: { message: string; createdAt: string }[];
}

export interface MatchesResponse {
  people: MatchPerson[];
  id: string; // callerId
}

export const matchApi = {
  getAllMatches: async (): Promise<MatchesResponse> => {
    const res = await api.get<{ data: MatchesResponse }>('/users/allMatches');
    return res.data.data ?? { people: [], id: '' };
  },

  accept: async (acceptedUserId: string, message = '') => {
    await api.post('/users/accept', { acceptedUserId, message });
  },
};
