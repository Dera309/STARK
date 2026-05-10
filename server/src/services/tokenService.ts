import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  jti: string; // Unique session ID
}

class TokenService {
  /**
   * Generates a JWT token for a user session
   */
  generateToken(userId: string, jti: string): string {
    const payload: TokenPayload = { userId, jti };
    
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Verifies a JWT token and returns its payload
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const tokenService = new TokenService();
export default tokenService;
