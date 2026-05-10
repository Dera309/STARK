import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

/**
 * List all notifications for the authenticated user
 */
export const listNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for the authenticated user
 */
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
