import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

export let io: SocketIOServer;

export const initSocket = (httpServer: Server) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = Array.from(new Set([clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173']));

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });
  return io;
};
