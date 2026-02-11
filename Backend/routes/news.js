const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const validate = require('../middleware/validate');
const AppError = require('../utils/AppError');
const newsValidation = require('../validation/news');

// GET /api/news - Get all published news
router.get('/', validate({ query: newsValidation.listQuery }), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, game } = req.query;
    
    // Build query
    const query = { publishedAt: { $ne: null } };
    if (game) {
      query.game = new RegExp(game, 'i');
    }
    
    // Get news with pagination
    const news = await News.find(query)
      .populate('author', 'username')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const total = await News.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return next(error);
  }
});

// GET /api/news/:id - Get single news by ID
router.get('/:id', optionalAuth, validate({ params: newsValidation.newsIdParam }), async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'username');
    
    if (!news) {
      return next(new AppError('News not found', 404));
    }
    
    // Only return published news unless user is authenticated author
    if (!news.isPublished() && (!req.user || news.author._id.toString() !== req.user.id)) {
      return next(new AppError('News not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return next(error);
  }
});

// POST /api/news - Create new news (requires auth)
router.post('/', auth, validate({ body: newsValidation.create }), async (req, res, next) => {
  try {
    const { title, content, game } = req.body;
    
    // Check if user is author or admin
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return next(new AppError('Only authors and admins can create news', 403));
    }
    
    // Create news
    const news = new News({
      title,
      content,
      game,
      author: req.user.id
    });
    
    await news.save();
    
    // Populate author info
    await news.populate('author', 'username');
    
    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    return next(error);
  }
});

// PUT /api/news/:id - Update news (requires auth)
router.put(
  '/:id',
  auth,
  validate({ params: newsValidation.newsIdParam, body: newsValidation.update }),
  async (req, res, next) => {
    try {
      const { title, content, game } = req.body;
      
      // Find news
      const news = await News.findById(req.params.id);
      
      if (!news) {
        return next(new AppError('News not found', 404));
      }
      
      // Check if user is the author or admin
      if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this news', 403));
      }
      
      // Update news
      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (game) updateData.game = game;
      
      const updatedNews = await News.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('author', 'username');
      
      res.status(200).json({
        success: true,
        message: 'News updated successfully',
        data: updatedNews
      });
    } catch (error) {
      console.error('Error updating news:', error);
      return next(error);
    }
  }
);

// DELETE /api/news/:id - Delete news (requires auth)
router.delete('/:id', auth, validate({ params: newsValidation.newsIdParam }), async (req, res, next) => {
  try {
    // Find news
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return next(new AppError('News not found', 404));
    }
    
    // Check if user is the author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this news', 403));
    }
    
    // Delete news
    await News.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return next(error);
  }
});

// PUT /api/news/:id/unpublish - Unpublish news (requires auth)
router.put(
  '/:id/unpublish',
  auth,
  validate({ params: newsValidation.newsIdParam }),
  async (req, res, next) => {
    try {
      const news = await News.findById(req.params.id);
      
      if (!news) {
        return next(new AppError('News not found', 404));
      }
      
      // Check if user is the author or admin
      if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to unpublish this news', 403));
      }
      
      await news.unpublish();
      await news.populate('author', 'username');
      
      res.status(200).json({
        success: true,
        message: 'News unpublished successfully',
        data: news
      });
    } catch (error) {
      console.error('Error unpublishing news:', error);
      return next(error);
    }
  }
);

// PUT /api/news/:id/publish - Publish news (requires auth)
router.put(
  '/:id/publish',
  auth,
  validate({ params: newsValidation.newsIdParam }),
  async (req, res, next) => {
    try {
      const news = await News.findById(req.params.id);
      
      if (!news) {
        return next(new AppError('News not found', 404));
      }
      
      // Check if user is author or admin
      if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to publish this news', 403));
      }
      
      // Check if user has author role to publish
      if (req.user.role !== 'author' && req.user.role !== 'admin') {
        return next(new AppError('Only authors and admins can publish news', 403));
      }
      
      await news.publish();
      await news.populate('author', 'username');
      
      res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error('Error publishing news:', error);
      return next(error);
    }
  }
);

module.exports = router;
