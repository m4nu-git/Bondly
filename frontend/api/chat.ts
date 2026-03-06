import { api } from './client';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export const chatApi = {
  getConversations: () => api.get('/conversations'),

  getMessages: async (conversationId: string, cursor?: string): Promise<Message[]> => {
    const res = await api.get<{ data: Message[] }>(
      `/conversations/${conversationId}/messages`,
      { params: cursor ? { cursor } : undefined }
    );
    return res.data.data;
  },
};
