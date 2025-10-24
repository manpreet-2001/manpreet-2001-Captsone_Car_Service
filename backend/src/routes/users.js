const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Public routes (before protect middleware)
router.get('/mechanics', async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'mechanic', status: 'active' })
      .select('-password')
      .sort({ 'rating.average': -1 });

    res.json({ success: true, data: mechanics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch mechanics', error: error.message });
  }
});

// All other routes are protected
router.use(protect);

// Admin routes
// Create new user (admin only)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

router.get('/', authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

router.route('/:id')
  .get(validateObjectId('id'), async (req, res) => {
    try {
      let user;
      if (req.user.role === 'admin' || req.user.id === req.params.id) {
        user = await User.findById(req.params.id).select('-password');
      } else {
        // Public profile for mechanics
        user = await User.findById(req.params.id).select('-password -email -phone -address');
      }
      
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
    }
  })
  .put(validateObjectId('id'), authorize('admin'), async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
  })
  .delete(validateObjectId('id'), authorize('admin'), async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
  });

module.exports = router;
