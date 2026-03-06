/**
 * wsServer.ts
 *
 * Standalone WebSocket server on port 8080 — matches reference repo.
 *
 * Message formats:
 *   join : { type: "join",  payload: { token } }
 *   chat : { type: "chat",  payload: { token, receiverId, message } }
 */

import { WebSocketServer } from "ws";
import { chatManager } from "./ChatManager";

export function startWsServer(port = 8080) {
  const wss = new WebSocketServer({ port });

  wss.on("listening", () => {
    console.log(`[WS] WebSocket server listening on port ${port}`);
  });

  wss.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[WS] Port ${port} already in use — WebSocket server skipped`);
    } else {
      console.error("[WS] Server error:", err.message);
    }
  });

  wss.on("connection", (socket) => {
    socket.on("message", async (raw) => {
      let data: { type: string; payload: Record<string, string> };

      try {
        data = JSON.parse(raw.toString());
      } catch {
        socket.send(JSON.stringify({ type: "error", payload: { message: "Invalid JSON" } }));
        return;
      }

      const { type, payload } = data;

      if (type === "join") {
        await chatManager.join(payload.token, socket);
      } else if (type === "chat") {
        await chatManager.sendMessage(
          payload.token,
          payload.receiverId,
          payload.message,
          socket
        );
      } else {
        socket.send(JSON.stringify({ type: "error", payload: { message: "Unknown type" } }));
      }
    });

    socket.on("close", () => {
      chatManager.clearUser(socket);
    });

    socket.on("error", (err) => {
      console.error("[WS] Socket error:", err.message);
      chatManager.clearUser(socket);
    });
  });

  return wss;
}
