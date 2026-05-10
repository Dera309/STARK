import { Router } from 'express';
import { listTransactions, internalTransfer, downloadStatement } from '../controllers/transactionController';
import { protect } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { createTransactionSchema, listTransactionsQuerySchema } from '../validators/transactionValidators';

const router = Router();

// All transaction routes are protected
router.use(protect);

/**
 * @route GET /api/v1/transactions/statement
 * @desc  Download PDF statement
 */
router.get('/statement', downloadStatement);

/**
 * @route GET /api/v1/transactions
 * @desc  Get paginated transaction history
 */
router.get('/', validateQuery(listTransactionsQuerySchema), listTransactions);

/**
 * @route POST /api/v1/transactions/transfer
 * @desc  Initiate internal transfer
 */
router.post('/transfer', validateBody(createTransactionSchema), internalTransfer);

export default router;
