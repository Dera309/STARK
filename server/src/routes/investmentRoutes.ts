import { Router } from 'express';
import { createFixedDeposit, listFixedDeposits, liquidateFixedDeposit } from '../controllers/investmentController';
import { protect } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { placeFixedDepositSchema, liquidateFixedDepositSchema, listFixedDepositsQuerySchema } from '../validators/investmentValidators';

const router = Router();

router.use(protect);

/**
 * @route POST /api/v1/investments/fixed-deposit
 * @desc  Create a new fixed deposit
 */
router.post('/fixed-deposit', validateBody(placeFixedDepositSchema), createFixedDeposit);

/**
 * @route GET /api/v1/investments/fixed-deposit
 * @desc  List all user fixed deposits
 */
router.get('/fixed-deposit', validateQuery(listFixedDepositsQuerySchema), listFixedDeposits);

/**
 * @route POST /api/v1/investments/liquidate
 * @desc  Liquidate a fixed deposit
 */
router.post('/liquidate', validateBody(liquidateFixedDepositSchema), liquidateFixedDeposit);

export default router;
