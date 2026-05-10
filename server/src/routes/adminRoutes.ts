import { Router } from 'express';
import { 
  getStats, 
  listUsers, 
  getUserDetail, 
  updateKycStatus, 
  manageAccountStatus,
  exportTransactionsCSV,
  creditAccount,
  debitAccount,
  closeAccount,
  manageUserStatus
} from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { validateBody, validateQuery, validateParams } from '../middleware/validateRequest';
import { 
  updateUserKycSchema, 
  updateUserStatusSchema, 
  updateAccountStatusSchema, 
  creditAccountSchema, 
  debitAccountSchema, 
  listUsersQuerySchema, 
  userIdParamSchema, 
  accountIdParamSchema 
} from '../validators/adminValidators';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(protect, isAdmin);

/**
 * @route POST /api/v1/admin/accounts/credit
 * @desc  Credit an account (add funds)
 */
router.post('/accounts/credit', validateBody(creditAccountSchema), creditAccount);

/**
 * @route POST /api/v1/admin/accounts/debit
 * @desc  Debit an account (remove funds)
 */
router.post('/accounts/debit', validateBody(debitAccountSchema), debitAccount);

/**
 * @route PATCH /api/v1/admin/accounts/:id/close
 * @desc  Close a user account
 */
router.patch('/accounts/:id/close', validateParams(accountIdParamSchema), closeAccount);

/**
 * @route GET /api/v1/admin/export/transactions
 * @desc  Export all transactions to CSV
 */
router.get('/export/transactions', exportTransactionsCSV);

/**
 * @route GET /api/v1/admin/stats
 * @desc  Get aggregated bank analytics
 */
router.get('/stats', getStats);

/**
 * @route GET /api/v1/admin/users
 * @desc  List all users with filters
 */
router.get('/users', validateQuery(listUsersQuerySchema), listUsers);

/**
 * @route GET /api/v1/admin/users/:id
 * @desc  Get detailed user profile
 */
router.get('/users/:id', validateParams(userIdParamSchema), getUserDetail);

/**
 * @route PATCH /api/v1/admin/users/:id/kyc
 * @desc  Review and update user KYC status
 */
router.patch('/users/:id/kyc', validateParams(userIdParamSchema), validateBody(updateUserKycSchema), updateKycStatus);

/**
 * @route PATCH /api/v1/admin/users/:id/status
 * @desc  Suspend or activate a user account
 */
router.patch('/users/:id/status', validateParams(userIdParamSchema), validateBody(updateUserStatusSchema), manageUserStatus);

/**
 * @route PATCH /api/v1/admin/accounts/:id/status
 * @desc  Freeze or unfreeze an account
 */
router.patch('/accounts/:id/status', validateParams(accountIdParamSchema), validateBody(updateAccountStatusSchema), manageAccountStatus);

export default router;
