import { Router } from 'express';
import { listAccounts, createAccount } from '../controllers/accountController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validateRequest';
import { createAccountSchema } from '../validators/accountValidators';

const router = Router();

// All account routes are protected
router.use(protect);

/**
 * @route GET /api/v1/accounts
 * @desc  List all accounts for the authenticated user
 */
router.get('/', listAccounts);

/**
 * @route POST /api/v1/accounts
 * @desc  Create a new account
 */
router.post('/', validateBody(createAccountSchema), createAccount);

export default router;
