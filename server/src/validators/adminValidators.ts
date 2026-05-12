import Joi from 'joi';

export const updateUserKycSchema = Joi.object({
  status: Joi.string().valid('VERIFIED', 'REJECTED').required().messages({
    'any.only': 'Status must be VERIFIED or REJECTED',
    'any.required': 'Status is required'
  }),
  tier: Joi.number().integer().min(1).max(3).default(1).messages({
    'number.base': 'Tier must be a number',
    'number.integer': 'Tier must be an integer',
    'number.min': 'Tier must be at least 1',
    'number.max': 'Tier cannot exceed 3'
  })
});

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'PENDING_KYC').required().messages({
    'any.only': 'Status must be ACTIVE, SUSPENDED, or PENDING_KYC',
    'any.required': 'Status is required'
  })
});

export const updateAccountStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'FROZEN', 'CLOSED').required().messages({
    'any.only': 'Status must be ACTIVE, FROZEN, or CLOSED',
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

export const listUsersQuerySchema = Joi.object({
  search: Joi.string().max(100).allow('').optional().messages({
    'string.max': 'Search term must not exceed 100 characters'
  }),
  kycStatus: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED', 'NOT_SUBMITTED').optional().messages({
    'any.only': 'kycStatus must be PENDING, VERIFIED, REJECTED, or NOT_SUBMITTED'
  }),
  status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'PENDING_KYC').optional().messages({
    'any.only': 'Status must be ACTIVE, SUSPENDED, or PENDING_KYC'
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

export const userIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'User ID is required'
  })
});

export const accountIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Account ID is required'
  })
});
