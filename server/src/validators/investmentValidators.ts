import Joi from 'joi';

export const placeFixedDepositSchema = Joi.object({
  amount: Joi.number().integer().min(10000).max(1000000000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer (in cents)',
    'number.min': 'Amount must be at least 10000 cents ($100)',
    'number.max': 'Amount cannot exceed 1,000,000,000 cents',
    'any.required': 'Amount is required'
  }),
  tenureMonths: Joi.number().integer().valid(3, 6, 12).required().messages({
    'number.base': 'Tenure must be a number',
    'number.integer': 'Tenure must be an integer',
    'any.only': 'Tenure must be 3, 6, or 12 months',
    'any.required': 'Tenure is required'
  }),
  sourceAccountId: Joi.string().required().messages({
    'any.required': 'Source account ID is required'
  }),
  destinationAccountId: Joi.string().optional().messages({
    'string.base': 'Destination account ID must be a string'
  })
});

export const liquidateFixedDepositSchema = Joi.object({
  fdId: Joi.string().required().messages({
    'any.required': 'Fixed deposit ID is required'
  })
});

export const listFixedDepositsQuerySchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'MATURED', 'LIQUIDATED').optional().messages({
    'any.only': 'Status must be ACTIVE, MATURED, or LIQUIDATED'
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  })
});
