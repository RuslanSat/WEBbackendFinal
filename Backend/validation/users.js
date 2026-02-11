const Joi = require('joi');
const { objectId } = require('./common');

const register = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const updateProfile = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email()
}).or('username', 'email');

const updateRole = Joi.object({
  role: Joi.string().valid('user', 'author', 'admin').required()
});

const userIdParam = Joi.object({
  id: objectId.required()
});

module.exports = {
  register,
  login,
  updateProfile,
  updateRole,
  userIdParam
};
