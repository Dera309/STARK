import axios from "axios";
import { apiCache } from "../utils/cache";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api/v1";

export interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
      message?: string;
    };
  };
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isNetworkError = !error.response && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message === 'Network Error');
      const isConnectionReset = error.code === 'ECONNRESET' || error.message?.includes('ERR_CONNECTION_RESET');
      
      if (attempt === maxRetries - 1 || (!isNetworkError && !isConnectionReset)) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// Cached GET requests
export const cachedGet = async (url: string, ttl: number = 60000) => {
  const cacheKey = `GET:${url}`;
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return { data: cached };
  }

  const response = await retryWithBackoff(() => api.get(url));
  apiCache.set(cacheKey, response.data, ttl);
  return response;
};

// Clear cache for specific patterns
export const clearCache = (pattern?: string) => {
  if (pattern) {
    apiCache.clearPattern(pattern);
  } else {
    apiCache.clear();
  }
};

// Retry wrapper for all API methods
export const apiWithRetry = {
  get: (url: string, config?: any) => retryWithBackoff(() => api.get(url, config)),
  post: (url: string, data?: any, config?: any) => retryWithBackoff(() => api.post(url, data, config)),
  put: (url: string, data?: any, config?: any) => retryWithBackoff(() => api.put(url, data, config)),
  patch: (url: string, data?: any, config?: any) => retryWithBackoff(() => api.patch(url, data, config)),
  delete: (url: string, config?: any) => retryWithBackoff(() => api.delete(url, config)),
};

export default api;
