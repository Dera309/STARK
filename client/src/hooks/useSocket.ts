import { useState, useEffect } from "react";
import { socketService } from "../services/socket";
import { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketService.getSocket());

  useEffect(() => {
    // Sync once on mount in case socket was connected before this hook ran
    setSocket(socketService.getSocket());
  }, []);

  // Expose a setter so CustomerLayout can notify this hook when socket changes
  useEffect(() => {
    const id = setInterval(() => {
      const current = socketService.getSocket();
      setSocket((prev) => (prev !== current ? current : prev));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return { socket };
};
