import { api } from './client';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export const chatApi = {
  // otherUserId = the other person's user ID (not a conversation ID)
  getMessages: async (otherUserId: string): Promise<Message[]> => {
    const res = await api.get<{ data: Message[] }>(`/users/chats/${otherUserId}`);
    return res.data.data ?? [];
  },
};
