const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header) {
      return next();
    }

    const token = header.replace('Bearer ', '');
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('Token is valid but user not found', 401));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token is not valid', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    }

    return next(new AppError('Server error in authentication', 500));
  }
};

module.exports = optionalAuth;
