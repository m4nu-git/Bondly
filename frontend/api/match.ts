import { api } from './client';

export interface Match {
  id: string;
  conversationId: string;
  matchedAt: string;
  otherUser: {
    id: string;
    name: string;
    primaryPhoto: string | null;
  } | null;
  lastMessage?: string | null;
}

export const matchApi = {
  getMatches: async (): Promise<Match[]> => {
    const res = await api.get<{ data: Match[] }>('/matches');
    return res.data.data;
  },

  getMatch: async (id: string): Promise<Match> => {
    const res = await api.get<{ data: Match }>(`/matches/${id}`);
    return res.data.data;
  },

  unmatch: (id: string) => api.delete(`/matches/${id}`),
};
