import { useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

// WS server runs on its own port (default 8080)
const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:8080';

export interface ChatPayload {
  senderId: string;
  message: string;
}

interface UseSocketOptions {
  onMessage: (msg: ChatPayload) => void;
}

interface UseSocketReturn {
  sendMessage: (receiverId: string, message: string) => void;
}

export function useSocket({ onMessage }: UseSocketOptions): UseSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    let ws: WebSocket;

    const connect = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;
      tokenRef.current = token;

      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        // Authenticate with the server
        ws.send(JSON.stringify({ type: 'join', payload: { token } }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat' && data.payload) {
            onMessageRef.current(data.payload as ChatPayload);
          }
        } catch (_) {}
      };

      ws.onerror = () => {};
      ws.onclose = () => { wsRef.current = null; };
    };

    connect();

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((receiverId: string, message: string) => {
    const ws = wsRef.current;
    const token = tokenRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !token) return;
    ws.send(JSON.stringify({ type: 'chat', payload: { token, receiverId, message } }));
  }, []);

  return { sendMessage };
}
