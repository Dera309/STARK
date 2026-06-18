import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/tokenService';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { Unauthorized } from './errorHandler';
import firebaseAdmin from '../config/firebase';

export interface AuthRequest extends Request {
  user?: any;
  sessionInfo?: {
    userId: string;
    jti: string;
  };
  body: any;
  params: any;
  query: any;
  headers: any;
}

/**
 * Middleware to protect routes and verify JWT + Session or Firebase token
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw Unauthorized('Not authorized, please log in');
    }

    // Try to verify as Firebase token first
    if (firebaseAdmin) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        
        // Firebase token verified successfully
        const firebaseUid = decodedToken.uid;
        
        // Find user by Firebase UID
        const user = await User.findOne({ firebaseUid });
        
        if (!user) {
          throw Unauthorized('User not found in backend');
        }

        // Attach user to request
        req.user = user;
        req.sessionInfo = { userId: user._id.toString(), jti: firebaseUid };
        
        return next();
      } catch (firebaseError) {
        console.log('Firebase token verification failed, trying JWT:', firebaseError);
        // Firebase token verification failed, try JWT
      }
    }

    // 1. Verify token signature and expiry
    let payload;
    try {
      payload = tokenService.verifyToken(token);
    } catch (error) {
      throw Unauthorized('Not authorized, token invalid or expired');
    }

    const { userId, jti } = payload;

    // 2. Check if session is still valid in database
    const session = await Session.findOne({ token: jti, userId, invalidatedAt: null });

    if (!session) {
      throw Unauthorized('Session invalid or logged out');
    }

    // 3. Check if user still exists
    const user = await User.findById(userId);

    if (!user) {
      throw Unauthorized('User no longer exists');
    }

    // 4. Attach user and session info to request
    req.user = user;
    req.sessionInfo = { userId, jti };

    next();
  } catch (error) {
    next(error);
  }
};
