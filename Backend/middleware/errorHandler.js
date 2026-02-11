const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let details = err.details || null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
    details = [
      {
        field: err.path,
        message: err.message
      }
    ];
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate key error';
    details = Object.keys(err.keyValue || {}).map((field) => ({
      field,
      message: `${field} already exists`
    }));
  }

  const response = {
    success: false,
    message
  };

  if (details && details.length > 0) {
    response.errors = details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
