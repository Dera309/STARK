import { makeRequest } from './helpers';

describe('Health check', () => {
  it('GET /api/v1/health returns 200', async () => {
    const res = await makeRequest().get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
