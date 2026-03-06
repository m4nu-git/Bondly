import { api } from './client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

interface RegisterResponse {
  user: { id: string; email?: string; phone?: string };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (body: { email?: string; phone?: string; password: string }): Promise<AuthTokens> => {
    const res = await api.post<{ data: RegisterResponse }>('/auth/register', body);
    const { user, accessToken, refreshToken } = res.data.data;
    return { accessToken, refreshToken, userId: user.id };
  },

  login: async (body: { email?: string; phone?: string; password: string }): Promise<AuthTokens> => {
    const res = await api.post<{ data: RegisterResponse }>('/auth/login', body);
    const { user, accessToken, refreshToken } = res.data.data;
    return { accessToken, refreshToken, userId: user.id };
  },

  logout: () => api.post('/auth/logout'),

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await api.post<{ data: AuthTokens }>('/auth/refresh', { refreshToken });
    return res.data.data;
  },
};
