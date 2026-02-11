const AppError = require('../utils/AppError');

const formatJoiErrors = (error) =>
  error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message
  }));

const validate = (schema) => (req, res, next) => {
  const errors = [];

  if (schema.params) {
    const { error, value } = schema.params.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    if (error) {
      errors.push(...formatJoiErrors(error));
    } else {
      req.params = value;
    }
  }

  if (schema.query) {
    const { error, value } = schema.query.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      allowUnknown: true
    });
    if (error) {
      errors.push(...formatJoiErrors(error));
    } else {
      req.query = value;
    }
  }

  if (schema.body) {
    const { error, value } = schema.body.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    if (error) {
      errors.push(...formatJoiErrors(error));
    } else {
      req.body = value;
    }
  }

  if (errors.length > 0) {
    return next(new AppError('Validation error', 400, errors));
  }

  return next();
};

module.exports = validate;
