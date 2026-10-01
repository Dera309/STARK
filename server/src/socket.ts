import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

export let io: SocketIOServer;

export const initSocket = (httpServer: Server) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const socketCorsOrigin = process.env.SOCKET_CORS_ORIGIN || clientUrl;
  const allowedOrigins = Array.from(new Set([
    clientUrl,
    socketCorsOrigin,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4173',
    'https://stark-h310.onrender.com',
    'https://stark-api-04gm.onrender.com'
  ]));

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  return io;
};
