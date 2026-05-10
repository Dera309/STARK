import { Router } from 'express';
import { getProducts, applyForLoan, listMyLoans, repayLoan } from '../controllers/loanController';
import { protect } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { applyLoanSchema, repayLoanSchema, listLoansQuerySchema } from '../validators/loanValidators';

const router = Router();

// All loan routes are protected
router.use(protect);

/**
 * @route GET /api/v1/loans/products
 * @desc  Get available loan products
 */
router.get('/products', getProducts);

/**
 * @route POST /api/v1/loans/apply
 * @desc  Apply for a new loan
 */
router.post('/apply', validateBody(applyLoanSchema), applyForLoan);

/**
 * @route GET /api/v1/loans
 * @desc  List user loans
 */
router.get('/', validateQuery(listLoansQuerySchema), listMyLoans);

/**
 * @route POST /api/v1/loans/repay
 * @desc  Repay an active loan
 */
router.post('/repay', validateBody(repayLoanSchema), repayLoan);

export default router;
