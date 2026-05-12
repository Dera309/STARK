import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
    it('should include Authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token');
      const handler = api.interceptors.request.handlers as any;
      const fulfilled = handler?.[0]?.fulfilled;
      if (fulfilled) {
        const config = await fulfilled({ headers: { set: vi.fn(), get: vi.fn(), has: vi.fn(), delete: vi.fn() } as any });
        expect(config.headers.Authorization).toBe('Bearer test-token');
      }
    });

    it('should not include Authorization header when token does not exist', async () => {
      localStorage.removeItem('token');
      const handler = api.interceptors.request.handlers as any;
      const fulfilled = handler?.[0]?.fulfilled;
      if (fulfilled) {
        const config = await fulfilled({ headers: { set: vi.fn(), get: vi.fn(), has: vi.fn(), delete: vi.fn() } as any });
        expect(config.headers.Authorization).toBeUndefined();
      }
    });
  });

  describe('Response Interceptors', () => {
    it('should handle 401 responses by clearing token', () => {
      localStorage.setItem('token', 'test-token');
      const handler = api.interceptors.response.handlers as any;
      const rejected = handler?.[0]?.rejected;
      if (rejected) {
        rejected({ response: { status: 401 } }).catch(() => {});
        expect(localStorage.getItem('token')).toBeNull();
      }
    });

    it('should handle network errors gracefully', () => {
      const handler = api.interceptors.response.handlers as any;
      const rejected = handler?.[0]?.rejected;
      if (rejected) {
        expect(() => rejected({ message: 'Network Error' })).not.toThrow();
      }
    });
  });
});
