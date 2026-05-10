import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Create a Registry
const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

const databaseConnections = new client.Gauge({
  name: 'database_connections',
  help: 'Number of database connections',
  registers: [register],
});

export const prometheusMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestTotal.inc({ method, route, status_code: statusCode });
  });
  
  next();
};

export const metricsEndpoint = (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};

export const updateActiveConnections = (count: number) => {
  activeConnections.set(count);
};

export const updateDatabaseConnections = (count: number) => {
  databaseConnections.set(count);
};

export { register };
