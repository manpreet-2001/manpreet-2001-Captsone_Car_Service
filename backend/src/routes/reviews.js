const express = require('express');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { validateReview, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, mechanic, service } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    // For mechanics viewing their own reviews, don't require verification
    // For public viewing, require verification
    if (mechanic) {
      query.mechanic = mechanic;
      // Don't add isVerified filter for mechanic's own reviews
    } else {
      query.isVerified = true;
    }
    
    if (service) query.service = service;

    const reviews = await Review.find(query)
      .populate('customer', 'name')
      .populate('mechanic', 'name')
      .populate('service', 'serviceName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
});

// Protected routes
router.use(protect);

router.post('/', validateReview, async (req, res) => {
  try {
    const { booking, rating, comment, detailedRatings, tags } = req.body;
    
    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Get booking details to set customer and mechanic
    const Booking = require('../models/Booking');
    const bookingDetails = await Booking.findById(booking)
      .populate('owner', 'id')
      .populate('mechanic', 'id')
      .populate('service', 'id');

    if (!bookingDetails) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the customer
    if (bookingDetails.owner._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer can review this booking'
      });
    }

    // Check if booking is completed
    if (bookingDetails.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    const reviewData = {
      booking,
      customer: req.user.id,
      mechanic: bookingDetails.mechanic._id,
      service: bookingDetails.service._id,
      rating,
      comment,
      detailedRatings,
      tags
    };

    const review = await Review.create(reviewData);
    
    await review.populate([
      { path: 'customer', select: 'name' },
      { path: 'mechanic', select: 'name' },
      { path: 'service', select: 'serviceName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create review', error: error.message });
  }
});

router.route('/:id')
  .get(validateObjectId('id'), async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
        .populate('customer', 'name')
        .populate('mechanic', 'name')
        .populate('service', 'serviceName');

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      // Check if user can view this review
      const canView = req.user.role === 'admin' ||
                     review.customer._id.toString() === req.user.id ||
                     review.mechanic._id.toString() === req.user.id ||
                     review.isPublic;

      if (!canView) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this review' });
      }

      res.json({ success: true, data: review });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch review', error: error.message });
    }
  })
  .put(validateObjectId('id'), async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      // Only customer can update their review
      if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
      }

      const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate([
        { path: 'customer', select: 'name' },
        { path: 'mechanic', select: 'name' },
        { path: 'service', select: 'serviceName' }
      ]);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: updatedReview
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update review', error: error.message });
    }
  })
  .delete(validateObjectId('id'), async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      // Only customer or admin can delete review
      if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      }

      await Review.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
    }
  });

module.exports = router;
