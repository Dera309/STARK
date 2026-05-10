import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Role } from '../models/Role';
import { Forbidden, Unauthorized } from './errorHandler';

/**
 * Middleware to restrict access to Admins only.
 * Must be used AFTER the 'protect' middleware.
 */
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw Unauthorized('Authentication required');
    }

    // Populate role if not already populated or if we only have the ID
    if (!req.user.roleId) {
      throw Forbidden('Access denied: No role assigned');
    }

    const role = await Role.findById(req.user.roleId);
    
    if (!role || role.name !== 'ADMIN') {
      throw Forbidden('Access denied: Admin privileges required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
