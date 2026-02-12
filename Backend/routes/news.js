const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');

// GET /api/news - Get news
router.get('/', async (req, res) => {
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
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching news'
    });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only authors and admins can view own news'
      });
    }

    const { page = 1, limit = 10, game, published } = req.query;

    const query = { author: req.user.id };
    if (typeof published !== 'undefined') {
      if (published === 'true') query.publishedAt = { $ne: null };
      if (published === 'false') query.publishedAt = null;
    }
    if (game) {
      query.game = new RegExp(game, 'i');
    }

    const news = await News.find(query)
      .populate('author', 'username')
      .sort({ updatedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching own news:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching own news'
    });
  }
});

// GET /api/news/:id - Get single news by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'username');
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Only return published news unless user is authenticated author
    if (!news.isPublished() && (!req.user || news.author._id.toString() !== req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching news'
    });
  }
});

// POST /api/news - Create new news (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, game } = req.body;
    
    // Validate required fields
    if (!title || !content || !game) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and game are required'
      });
    }
    
    // Check if user is author or admin
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only authors and admins can create news'
      });
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
    res.status(500).json({
      success: false,
      message: 'Server error while creating news'
    });
  }
});

// PUT /api/news/:id - Update news (requires auth)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, game } = req.body;
    
    // Find news
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Check if user is the author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this news'
      });
    }
    
    // Validate input data
    if (!title && !content && !game) {
      return res.status(400).json({
        success: false,
        message: 'At least title, content, or game must be provided'
      });
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
    res.status(500).json({
      success: false,
      message: 'Server error while updating news'
    });
  }
});

// DELETE /api/news/:id - Delete news (requires auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find news
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Check if user is the author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this news'
      });
    }
    
    // Delete news
    await News.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting news'
    });
  }
});

// PUT /api/news/:id/unpublish - Unpublish news (requires auth)
router.put('/:id/unpublish', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Check if user is the author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unpublish this news'
      });
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
    res.status(500).json({
      success: false,
      message: 'Server error while unpublishing news'
    });
  }
});

// PUT /api/news/:id/publish - Publish news (requires auth)
router.put('/:id/publish', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Check if user is author or admin
    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this news'
      });
    }
    
    // Check if user has author role to publish
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only authors and admins can publish news'
      });
    }
    
    await news.publish();
    await news.populate('author', 'username');
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error publishing news:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing news'
    });
  }
});

module.exports = router;
