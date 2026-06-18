import { Router } from 'express';
import { register, login, logout, requestPasswordReset, confirmPasswordReset, firebaseSync } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validateRequest';
import { registerSchema, loginSchema, resetPasswordRequestSchema, resetPasswordConfirmSchema } from '../validators/authValidators';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc  Register a new customer account
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * @route POST /api/v1/auth/login
 * @desc  Authenticate user and return JWT
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * @route POST /api/v1/auth/logout
 * @desc  Invalidate user session
 */
router.post('/logout', protect, logout);

/**
 * @route POST /api/v1/auth/reset-password/request
 * @desc  Send password reset email
 */
router.post('/reset-password/request', validateBody(resetPasswordRequestSchema), requestPasswordReset);

/**
 * @route POST /api/v1/auth/reset-password/confirm
 * @desc  Confirm password reset with token
 */
router.post('/reset-password/confirm', validateBody(resetPasswordConfirmSchema), confirmPasswordReset);

/**
 * @route POST /api/v1/auth/firebase-sync
 * @desc  Sync Firebase user with backend
 */
router.post('/firebase-sync', firebaseSync);

export default router;
