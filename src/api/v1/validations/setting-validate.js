const Joi = require('joi');

const languageSave = Joi.object({
  locale: Joi.string().required(),
  name: Joi.string().max(200).required(),
  image: Joi.string().allow(''),
  sort: Joi.number().required(),
  createdBy: Joi.string().required(),
}).required();

const countrySave = Joi.object({
  iso: Joi.string().required(),
  name: Joi.string().max(200).required(),
  image: Joi.string().required(),
  sort: Joi.number().required(),
  createdBy: Joi.string().required(),
}).required();

const regionSave = Joi.object({
  name: Joi.string().max(200).required(),
  shortName: Joi.string().required(),
  iso: Joi.string().required(),
  countryId: Joi.string().required(),
  image: Joi.string().allow(''),
  parentId: Joi.string().allow(''),
  location: Joi.object().required(),
  type: Joi.string().required(),
  sort: Joi.number().required(),
  createdBy: Joi.string().required(),
}).required();

const currentSave = Joi.object({
  iso: Joi.string().required(),
  name: Joi.string().max(200).required(),
  current: Joi.string().required(),
  sort: Joi.number().required(),
  rate: Joi.number().required(),
  currentType: Joi.boolean().required(),
  createdBy: Joi.string().required(),
}).required();

const bankSave = Joi.object({
  shortName: Joi.string().required(),
  name: Joi.string().max(200).required(),
  countryId: Joi.string().required(),
  createdBy: Joi.string().required(),
  image: Joi.string().required(),
}).required();

module.exports = {
  languageSave,
  countrySave,
  currentSave,
  bankSave,
  regionSave,
};
