import { Router } from 'express';
import { listNotifications, markAllAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

/**
 * @route GET /api/v1/notifications
 * @desc  Get user notification feed
 */
router.get('/', listNotifications);

/**
 * @route PATCH /api/v1/notifications/read
 * @desc  Mark all as read
 */
router.patch('/read', markAllAsRead);

export default router;
