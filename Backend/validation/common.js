const Joi = require('joi');

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message('Invalid id format');

module.exports = {
  objectId
};
