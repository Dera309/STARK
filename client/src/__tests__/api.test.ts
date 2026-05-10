import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Configuration', () => {
    it('should have correct base URL', () => {
      expect(api.defaults.baseURL).toBeDefined();
    });

    it('should have timeout configured', () => {
      expect(api.defaults.timeout).toBeGreaterThan(0);
    });
  });

  describe('Request Interceptors', () => {
    it('should include Authorization header when token exists', () => {
      localStorage.setItem('token', 'test-token');
      // Trigger request interceptor
      const config = api.interceptors.request.handlers[0].fulfilled({ headers: {} });
      expect(config.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not include Authorization header when token does not exist', () => {
      localStorage.removeItem('token');
      const config = api.interceptors.request.handlers[0].fulfilled({ headers: {} });
      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptors', () => {
    it('should handle 401 responses by clearing token', () => {
      localStorage.setItem('token', 'test-token');
      const error = {
        response: { status: 401 }
      };
      
      api.interceptors.response.handlers[0].rejected(error);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle network errors gracefully', () => {
      const error = {
        message: 'Network Error'
      };
      
      expect(() => {
        api.interceptors.response.handlers[0].rejected(error);
      }).not.toThrow();
    });
  });
});
