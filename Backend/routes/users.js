const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/validate');
const AppError = require('../utils/AppError');
const userValidation = require('../validation/users');

// POST /api/users/register - Register new user
router.post('/register', validate({ body: userValidation.register }), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return next(new AppError('User with this email or username already exists', 400));
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return next(error);
  }
});

// POST /api/users/login - Login user
router.post('/login', validate({ body: userValidation.login }), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return next(error);
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', auth, validate({ body: userValidation.updateProfile }), async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;
    
    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email }] : [])
      ]
    });
    
    if (existingUser) {
      return next(
        new AppError(
          existingUser.username === username ? 'Username already exists' : 'Email already exists',
          400
        )
      );
    }
    
    // Update user info
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }
    
    // Return updated profile without password
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return next(error);
  }
});

// PUT /api/users/:id/role - Update user role (admin only)
router.put(
  '/:id/role',
  auth,
  validate({ params: userValidation.userIdParam, body: userValidation.updateRole }),
  async (req, res, next) => {
    try {
      const { role } = req.body;
      const targetUserId = req.params.id;
      
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return next(new AppError('Only admins can update user roles', 403));
      }
      
      // Update user role
      const updatedUser = await User.findByIdAndUpdate(
        targetUserId,
        { role },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }
      
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return next(error);
    }
  }
);

// GET /api/users/profile - Fetch logged-in user profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    // Find user by ID (from auth middleware)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Return user profile without password
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return next(error);
  }
});

module.exports = router;
