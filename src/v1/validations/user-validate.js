const Joi = require('joi');

const deviceSave = Joi.object({
  deviceToken: Joi.string().required(),
  userId: Joi.string().required(),
}).required();

const statusNotification = Joi.object({
  status: Joi.boolean().required(),
}).required();

const bankSave = Joi.object({
  bankId: Joi.string().required(),
  userId: Joi.string().required(),
  name: Joi.string().max(200).required(),
  branch: Joi.string().allow(''),
  number: Joi.string().regex(/^\d+$/).required(),
  type: Joi.boolean().allow(false),
}).required();

const userSave = Joi.object({
  avatar: Joi.string().allow(''),
  coverImage: Joi.string().allow(''),
  fullName: Joi.string().min(6).max(100).required(),
  gender: Joi.number().required(),
  phone: Joi.string().allow(''),
  birthday: Joi.string().allow(''),
  address: Joi.string().max(200).allow(''),
  company: Joi.string().max(200).allow(''),
  introduce: Joi.string().max(1000).allow(''),
  professions: Joi.array(),
  languages: Joi.array(),
  topics: Joi.array(),
  interests: Joi.array(),
}).required();

module.exports = {
  deviceSave,
  statusNotification,
  bankSave,
  userSave,
};
