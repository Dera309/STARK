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
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.socket?.emit("join", `user:${userId}`);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
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
