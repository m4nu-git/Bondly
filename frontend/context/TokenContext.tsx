import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface TokenContextType {
  token: string | null;
  userId: string | null;
  setToken: (token: string | null) => Promise<void>;
  setUserId: (userId: string | null) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const TokenContext = createContext<TokenContextType>({
  token: null,
  userId: null,
  setToken: () => {},
  setUserId: () => {},
  logout: async () => {},
  loading: true,
});

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('token'),
      SecureStore.getItemAsync('userId'),
    ])
      .then(([t, u]) => {
        setTokenState(t);
        setUserIdState(u);
      })
      .catch(() => {
        // SecureStore unavailable (e.g. simulator issue) — treat as logged out
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setToken = async (t: string | null) => {
    setTokenState(t);
    if (t) await SecureStore.setItemAsync('token', t);
    else await SecureStore.deleteItemAsync('token');
  };

  const setUserId = async (u: string | null) => {
    setUserIdState(u);
    if (u) await SecureStore.setItemAsync('userId', u);
    else await SecureStore.deleteItemAsync('userId');
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userId');
    setTokenState(null);
    setUserIdState(null);
  };

  return (
    <TokenContext.Provider value={{ token, userId, setToken, setUserId, logout, loading }}>
      {children}
    </TokenContext.Provider>
  );
}

export const useToken = () => useContext(TokenContext);
