const Joi = require('joi');

const transactionSave = Joi.object({
  type: Joi.string().valid('admin', 'wallet', 'withdraw').required(),
  amount: Joi.number().min(1000).required(),
  payment: Joi.string().valid('wallet', 'transfer', 'momo', 'transaction').required(),
  userId: Joi.string().required(),
  targetId: Joi.string().allow(''),
  targetName: Joi.string().allow(''),
});

module.exports = {
  transactionSave,
};
