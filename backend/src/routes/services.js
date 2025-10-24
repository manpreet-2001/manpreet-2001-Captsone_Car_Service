const express = require('express');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');
const { validateService, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Public routes (for browsing services)
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, mechanic } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isAvailable: true, isActive: true };
    
    if (category) query.category = category;
    if (mechanic) query.mechanic = mechanic;
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query)
      .populate('mechanic', 'name email rating')
      .sort({ 'rating.average': -1, totalBookings: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      count: services.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
});

// Protected routes
router.use(protect);

// Admin routes for services
router.post('/admin', authorize('admin'), validateService, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    await service.populate('mechanic', 'name email');
    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create service', error: error.message });
  }
});

// Mechanic routes
router.post('/', authorize('mechanic'), validateService, async (req, res) => {
  try {
    req.body.mechanic = req.user.id;
    const service = await Service.create(req.body);
    await service.populate('mechanic', 'name email');
    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create service', error: error.message });
  }
});

router.route('/:id')
  .get(validateObjectId('id'), async (req, res) => {
    try {
      const service = await Service.findById(req.params.id).populate('mechanic', 'name email rating');
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, data: service });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch service', error: error.message });
    }
  })
  .put(validateObjectId('id'), authorize('mechanic'), validateService, async (req, res) => {
    try {
      let service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.mechanic.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json({ success: true, message: 'Service updated successfully', data: service });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update service', error: error.message });
    }
  })
  .delete(validateObjectId('id'), authorize('mechanic'), async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.mechanic.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      await Service.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete service', error: error.message });
    }
  });

module.exports = router;
