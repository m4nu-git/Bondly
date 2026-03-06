/**
 * ChatManager.ts
 *
 * Singleton WebSocket session manager — mirrors mohitejaikumar/Hinge1Backend's
 * ChatManager but adapted for our UUID user IDs and Chat model.
 *
 * Protocol:
 *   Client → Server  { type: "join", payload: { token } }
 *   Client → Server  { type: "chat", payload: { token, receiverId, message } }
 *   Server → Client  { type: "chat", payload: { senderId, message } }
 */

import type WebSocket from "ws";
import { verifyAccessToken } from "../shared/utils/jwt";
import { findUserById, persistChat } from "../modules/users/users.service";

interface Session {
  userId: string;
  socket: WebSocket;
}

class ChatManager {
  private static instance: ChatManager;
  private sessions = new Map<string, Session>();

  private constructor() {}

  static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  // ── Join — authenticate and register socket ──────────────────────────────────
  async join(token: string, socket: WebSocket) {
    let userId: string;
    try {
      const payload = verifyAccessToken(token);
      userId = payload.userId;
    } catch {
      socket.send(JSON.stringify({ type: "error", payload: { message: "Invalid token" } }));
      socket.close();
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      socket.send(JSON.stringify({ type: "error", payload: { message: "User not found" } }));
      socket.close();
      return;
    }

    this.sessions.set(userId, { userId, socket });
    socket.send(JSON.stringify({ type: "joined", payload: { userId } }));
  }

  // ── Send message — persist + deliver if receiver is online ──────────────────
  async sendMessage(token: string, receiverId: string, message: string, socket: WebSocket) {
    let senderId: string;
    try {
      const payload = verifyAccessToken(token);
      senderId = payload.userId;
    } catch {
      socket.send(JSON.stringify({ type: "error", payload: { message: "Invalid token" } }));
      return;
    }

    const [sender, receiver] = await Promise.all([
      findUserById(senderId),
      findUserById(receiverId),
    ]);

    if (!sender || !receiver) {
      socket.send(JSON.stringify({ type: "error", payload: { message: "User not found" } }));
      return;
    }

    // Persist message to DB
    await persistChat(senderId, receiverId, message);

    // Real-time delivery if receiver is connected
    const receiverSession = this.sessions.get(receiverId);
    if (receiverSession && receiverSession.socket.readyState === 1 /* OPEN */) {
      receiverSession.socket.send(
        JSON.stringify({ type: "chat", payload: { senderId, message } })
      );
    }
  }

  // ── Remove socket on disconnect ──────────────────────────────────────────────
  clearUser(socket: WebSocket) {
    for (const [userId, session] of this.sessions.entries()) {
      if (session.socket === socket) {
        this.sessions.delete(userId);
        break;
      }
    }
  }
}

export const chatManager = ChatManager.getInstance();
