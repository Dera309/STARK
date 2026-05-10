import Joi from 'joi';

export const applyLoanSchema = Joi.object({
  productType: Joi.string().valid('PERSONAL', 'BUSINESS', 'EDUCATION').required().messages({
    'any.only': 'Product type must be PERSONAL, BUSINESS, or EDUCATION',
    'any.required': 'Product type is required'
  }),
  amount: Joi.number().integer().min(10000).max(100000000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer (in cents)',
    'number.min': 'Amount must be at least 10000 cents ($100)',
    'number.max': 'Amount cannot exceed 100,000,000 cents ($1,000,000)',
    'any.required': 'Amount is required'
  }),
  disbursementAccountId: Joi.string().required().messages({
    'any.required': 'Disbursement account ID is required'
  }),
  tenureMonths: Joi.number().integer().min(1).max(120).optional().messages({
    'number.base': 'Tenure must be a number',
    'number.integer': 'Tenure must be an integer',
    'number.min': 'Tenure must be at least 1 month',
    'number.max': 'Tenure cannot exceed 120 months'
  })
});

export const repayLoanSchema = Joi.object({
  loanId: Joi.string().required().messages({
    'any.required': 'Loan ID is required'
  }),
  accountId: Joi.string().required().messages({
    'any.required': 'Account ID is required'
  }),
  amount: Joi.number().integer().min(1).max(100000000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer (in cents)',
    'number.min': 'Amount must be at least 1 cent',
    'number.max': 'Amount cannot exceed 100,000,000 cents',
    'any.required': 'Amount is required'
  })
});

export const listLoansQuerySchema = Joi.object({
  status: Joi.string().valid('PENDING', 'ACTIVE', 'PAID', 'DEFAULTED').optional().messages({
    'any.only': 'Status must be PENDING, ACTIVE, PAID, or DEFAULTED'
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
