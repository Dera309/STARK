import Joi from 'joi';

export const createTransactionSchema = Joi.object({
  sourceAccountId: Joi.string().required().messages({
    'any.required': 'Source account ID is required'
  }),
  targetAccountNumber: Joi.string().required().messages({
    'any.required': 'Target account number is required'
  }),
  amount: Joi.number().integer().min(1).max(1000000000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer (in cents)',
    'number.min': 'Amount must be at least 1 cent',
    'number.max': 'Amount cannot exceed 1,000,000,000 cents',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY').default('USD').messages({
    'any.only': 'Currency must be a supported currency'
  }),
  category: Joi.string().valid('TRANSFER', 'PAYMENT', 'DEPOSIT', 'WITHDRAWAL').default('TRANSFER').messages({
    'any.only': 'Category must be TRANSFER, PAYMENT, DEPOSIT, or WITHDRAWAL'
  }),
  note: Joi.string().max(500).optional().messages({
    'string.max': 'Note must not exceed 500 characters'
  })
});

export const listTransactionsQuerySchema = Joi.object({
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
  }),
  accountId: Joi.string().optional().messages({
    'string.base': 'Account ID must be a string'
  }),
  type: Joi.string().valid('CREDIT', 'DEBIT', 'TRANSFER', 'ADMIN_CREDIT', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'FD_DEBIT', 'FD_CREDIT').optional().messages({
    'any.only': 'Type must be a valid transaction type'
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.format': 'Start date must be a valid ISO date'
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.format': 'End date must be a valid ISO date'
  })
});
