import request from 'supertest';
import app from '../index';

export const makeRequest = () => request(app);

export const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
