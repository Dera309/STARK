import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Simple in-memory metrics store
const metrics = {
  requests: {
    total: 0,
    byMethod: {} as Record<string, number>,
    byPath: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  },
  errors: {
    total: 0,
    byType: {} as Record<string, number>,
  },
  responseTimes: [] as number[],
};

const MAX_RESPONSE_TIMES = 1000;

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const method = req.method;
  const path = req.path;

  // Increment total requests
  metrics.requests.total++;
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
  metrics.requests.byPath[path] = (metrics.requests.byPath[path] || 0) + 1;

  // Track response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    // Track response time
    metrics.responseTimes.push(duration);
    if (metrics.responseTimes.length > MAX_RESPONSE_TIMES) {
      metrics.responseTimes.shift();
    }

    // Track status codes
    metrics.requests.byStatus[status] = (metrics.requests.byStatus[status] || 0) + 1;

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn(`Slow request detected`, {
        method,
        path,
        duration: `${duration}ms`,
        status,
      });
    }

    // Track errors
    if (status >= 400) {
      metrics.errors.total++;
      const errorType = status >= 500 ? 'server_error' : 'client_error';
      metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
    }

    return originalSend.call(this, data);
  };

  next();
};

export const getMetrics = () => {
  const responseTimeStats = metrics.responseTimes.length > 0
    ? {
        min: Math.min(...metrics.responseTimes),
        max: Math.max(...metrics.responseTimes),
        avg: metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length,
        p95: metrics.responseTimes.sort((a, b) => a - b)[Math.floor(metrics.responseTimes.length * 0.95)],
      }
    : { min: 0, max: 0, avg: 0, p95: 0 };

  return {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requests: {
      total: metrics.requests.total,
      byMethod: metrics.requests.byMethod,
      byPath: metrics.requests.byPath,
      byStatus: metrics.requests.byStatus,
    },
    errors: {
      total: metrics.errors.total,
      byType: metrics.errors.byType,
      errorRate: metrics.requests.total > 0 ? (metrics.errors.total / metrics.requests.total) * 100 : 0,
    },
    responseTime: responseTimeStats,
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
    },
  };
};

export const resetMetrics = () => {
  metrics.requests.total = 0;
  metrics.requests.byMethod = {};
  metrics.requests.byPath = {};
  metrics.requests.byStatus = {};
  metrics.errors.total = 0;
  metrics.errors.byType = {};
  metrics.responseTimes = [];
};
