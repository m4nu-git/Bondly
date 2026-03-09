import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({ baseURL: BASE_URL });

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: try to refresh the access token once, then retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Only retry once, and skip for auth routes themselves
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return Promise.reject(error);

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        await SecureStore.setItemAsync('token', newToken);
        await SecureStore.setItemAsync('refreshToken', newRefresh);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Refresh failed — clear tokens so AuthGuard redirects to login
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
