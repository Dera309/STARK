import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initSocket } from './socket';
import mongoose from 'mongoose';
import { env, validateEnv } from './config/env';
import { errorHandler } from './middleware';
import { validateBody, validateQuery, validateParams } from './middleware/validateRequest';
import { monitoringMiddleware, getMetrics } from './middleware/monitoring';
import { prometheusMiddleware, metricsEndpoint, updateActiveConnections } from './middleware/prometheusMetrics';
import { seedRoles, seedAdminUser } from './seed';
import logger from './config/logger';

validateEnv();

import authRoutes from './routes/authRoutes';
import debugRoutes from './routes/debugRoutes';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import loanRoutes from './routes/loanRoutes';
import investmentRoutes from './routes/investmentRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const httpServer = createServer(app);

// Trust proxy so req.ip reflects the real client IP behind Render's load balancer
app.set('trust proxy', 1);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // raised — Render proxies all traffic through shared IPs
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use real client IP from X-Forwarded-For, fall back to req.ip
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip) || 'unknown';
    return ip.trim();
  },
});

// Only initialize socket in non-test environments
export const io = process.env.NODE_ENV === 'test' ? null : initSocket(httpServer);

// Basic middleware
app.use((req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = Array.from(new Set([clientUrl, 'http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174']));
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Apply compression middleware
app.use(compression());

// Apply monitoring middleware
app.use(monitoringMiddleware);

// Apply Prometheus metrics middleware
app.use(prometheusMiddleware);

// Apply rate limiting
app.use('/api/v1', limiter);

app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/debug', debugRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);

// Export validation middleware for use in routes
export { validateBody, validateQuery, validateParams };
export { getMetrics };

// Health check
app.get('/api/v1/health', (_req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };
  res.json(healthCheck);
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// Socket.io connection
if (io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    updateActiveConnections(io.engine.clientsCount);
    
    // Handle user joining their personal room
    socket.on('join', (room: string) => {
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', (_reason) => {
      logger.info(`Socket disconnected: ${socket.id}`);
      updateActiveConnections(io.engine.clientsCount);
    });
  });
}

// MongoDB connection
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 0, // No socket timeout
      family: 4 // Use IPv4, avoid trying IPv6 first
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    logger.error('CRITICAL: MongoDB connection failed. Exiting...');
    process.exit(1);
  }
};

// Start server (only when not in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(async () => {
      await seedRoles();
      await seedAdminUser();
      if (!(global as any).__SERVER_LISTENING) {
        (global as any).__SERVER_LISTENING = true;
        httpServer.listen(env.PORT, () => {
          logger.info(`🚀 Server running on port ${env.PORT}`);
          logger.info(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
          logger.info(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
      }
    })
    .catch((err) => {
      logger.error('Failed to start server:', err);
      process.exit(1);
    });
}

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received: starting graceful shutdown`);
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
    
    // Close MongoDB connection
    mongoose.connection.close().then(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    }).catch((err) => {
      logger.error('Error closing MongoDB connection:', err);
      process.exit(1);
    });
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, httpServer };
export default app;
