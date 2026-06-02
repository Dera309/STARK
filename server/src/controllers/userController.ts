import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { UnprocessableEntity } from '../middleware/errorHandler';

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/profile
 * Updates the authenticated user's profile (firstName, lastName, phone only)
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone } = req.body;

    if (!firstName && !lastName && !phone) {
      throw UnprocessableEntity('At least one field is required');
    }

    const updates: Record<string, string> = {};
    if (firstName?.trim()) updates.firstName = firstName.trim();
    if (lastName?.trim()) updates.lastName = lastName.trim();
    if (phone?.trim()) updates.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus,
        kycTier: user.kycTier,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
