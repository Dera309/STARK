import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(protect);

/**
 * @route GET /api/v1/users/me
 * @desc  Get authenticated user's profile
 */
router.get('/me', getProfile);

/**
 * @route PUT /api/v1/users/profile
 * @desc  Update authenticated user's profile
 */
router.put('/profile', updateProfile);

export default router;
