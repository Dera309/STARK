import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

export let io: SocketIOServer;

export const initSocket = (httpServer: Server) => {
  io = new SocketIOServer(httpServer, {
    cors: { 
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true 
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });
  return io;
};
