import { useState, useEffect } from "react";
import { socketService } from "../services/socket";
import { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketService.getSocket());

  useEffect(() => {
    // The socket might be connected/disconnected elsewhere
    // We poll for its state here or could implement an event emitter in socketService
    // For now, simple polling or just returning the current instance is fine
    // since connect() is called in Layout components.
    const interval = setInterval(() => {
      const currentSocket = socketService.getSocket();
      if (currentSocket !== socket) {
        setSocket(currentSocket);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [socket]);

  return { socket };
};
