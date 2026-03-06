import { useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Message } from '@/api/chat';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000';

interface UseSocketOptions {
  conversationId: string | undefined;
  onMessage: (msg: Message) => void;
}

interface UseSocketReturn {
  sendMessage: (conversationId: string, content: string) => void;
}

export function useSocket({ conversationId, onMessage }: UseSocketOptions): UseSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!conversationId) return;

    let ws: WebSocket;

    const connect = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      ws = new WebSocket(`${WS_URL}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // No join message needed — token in query param authenticates the connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message' && data.message?.conversationId === conversationId) {
            onMessageRef.current(data.message);
          }
        } catch (_) {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {};
      ws.onclose = () => {
        wsRef.current = null;
      };
    };

    connect();

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback((convId: string, content: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'send_message', conversationId: convId, content }));
  }, []);

  return { sendMessage };
}
