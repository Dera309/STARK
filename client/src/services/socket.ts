import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3003";

class SocketService {
  private socket: Socket | null = null;

  getSocket() {
    return this.socket;
  }

  connect(userId: string) {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 60000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      this.socket?.emit("join", `user:${userId}`);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("disconnect", (_reason: string) => {
      // Socket disconnected
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T = unknown>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
export default socketService;
