import Joi from 'joi';

export const createAccountSchema = Joi.object({
  accountType: Joi.string().valid('CHECKING', 'SAVINGS').required().messages({
    'any.only': 'Account type must be either CHECKING or SAVINGS',
    'any.required': 'Account type is required'
  }),
  initialBalance: Joi.number().min(0).optional().messages({
    'number.min': 'Initial balance cannot be negative'
  })
});

export const updateAccountStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'FROZEN', 'CLOSED').required().messages({
    'any.only': 'Status must be either ACTIVE, FROZEN, or CLOSED',
    'any.required': 'Status is required'
  })
});

export const creditAccountSchema = Joi.object({
  accountId: Joi.string().required().messages({
    'any.required': 'Account ID is required'
  }),
  amount: Joi.number().integer().min(1).max(1000000000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer (in cents)',
    'number.min': 'Amount must be at least 1 cent',
    'number.max': 'Amount cannot exceed 1,000,000,000 cents',
    'any.required': 'Amount is required'
  }),
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Reason must not exceed 500 characters'
  })
});

export const debitAccountSchema = Joi.object({
  accountId: Joi.string().required().messages({
    'any.required': 'Account ID is required'
  }),
  amount: Joi.number().integer().min(1).max(1000000000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer (in cents)',
    'number.min': 'Amount must be at least 1 cent',
    'number.max': 'Amount cannot exceed 1,000,000,000 cents',
    'any.required': 'Amount is required'
  }),
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Reason must not exceed 500 characters'
  })
});
