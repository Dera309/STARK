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

// Cached GET requests
export const cachedGet = async (url: string, ttl: number = 60000) => {
  const cacheKey = `GET:${url}`;
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return { data: cached };
  }

  const response = await api.get(url);
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

export default api;
