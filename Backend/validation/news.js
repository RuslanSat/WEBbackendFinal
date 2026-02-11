const Joi = require('joi');
const { objectId } = require('./common');

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  game: Joi.string().max(100)
});

const create = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().min(10).required(),
  game: Joi.string().max(100).required()
});

const update = Joi.object({
  title: Joi.string().max(200),
  content: Joi.string().min(10),
  game: Joi.string().max(100)
}).or('title', 'content', 'game');

const newsIdParam = Joi.object({
  id: objectId.required()
});

module.exports = {
  listQuery,
  create,
  update,
  newsIdParam
};
