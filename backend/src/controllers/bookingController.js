const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 100, status, date, role } = req.query;  // Increased default limit
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
    } else if (req.user.role === 'mechanic') {
      query.mechanic = req.user.id;
    }
    // Admin can see all bookings
    
    // Additional filters
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.bookingDate = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('owner', 'name email phone')
      .populate('mechanic', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('service', 'serviceName category baseCost estimatedDuration')
      .sort({ bookingDate: 1, bookingTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('owner', 'name email phone address')
      .populate('mechanic', 'name email phone')
      .populate('vehicle', 'make model year licensePlate vin color mileage')
      .populate('service', 'serviceName description category baseCost estimatedDuration');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access permissions
    const canAccess = req.user.role === 'admin' ||
                     booking.owner._id.toString() === req.user.id ||
                     booking.mechanic._id.toString() === req.user.id;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Owner)
const createBooking = async (req, res) => {
  try {
    // Only owners can create bookings
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only car owners can create bookings'
      });
    }

    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if (!vehicle || vehicle.owner.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle not found or does not belong to you'
      });
    }

    // Get service details
    const service = await Service.findById(req.body.service);
    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Service not found. Please make sure services are created in the system.'
      });
    }

    // Check if service is available
    if (!service.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Service is not currently available'
      });
    }

    // Check if mechanic is provided (user-selected) or use service mechanic as fallback
    let selectedMechanic = req.body.mechanic;
    
    if (!selectedMechanic && service.mechanic) {
      // Fallback to service mechanic if no mechanic selected
      selectedMechanic = service.mechanic;
    }
    
    if (!selectedMechanic) {
      return res.status(400).json({
        success: false,
        message: 'Please select a mechanic for this service.'
      });
    }

    // Verify mechanic exists and is active
    const mechanic = await User.findOne({ 
      _id: selectedMechanic, 
      role: 'mechanic',
      status: 'active'
    });
    
    if (!mechanic) {
      return res.status(400).json({
        success: false,
        message: 'Selected mechanic is not available.'
      });
    }

    // Set booking data
    req.body.mechanic = selectedMechanic;
    req.body.owner = req.user.id;
    req.body.estimatedCost = service.baseCost;
    req.body.estimatedDuration = service.estimatedDuration;
    
    // Set garage if service has one
    if (service.garage) {
      req.body.garage = service.garage;
    }

    // Check for conflicting bookings
    const bookingDateTime = new Date(req.body.bookingDate);
    const [hours, minutes] = req.body.bookingTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDateTime = new Date(bookingDateTime.getTime() + (service.estimatedDuration * 60000));

    const conflictingBooking = await Booking.findOne({
      mechanic: selectedMechanic,
      status: { $in: ['confirmed', 'in_progress'] },
      $or: [
        {
          bookingDate: req.body.bookingDate,
          bookingTime: req.body.bookingTime
        },
        {
          bookingDate: {
            $gte: bookingDateTime,
            $lt: endDateTime
          }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    const booking = await Booking.create(req.body);

    await booking.populate([
      { path: 'owner', select: 'name email phone' },
      { path: 'mechanic', select: 'name email phone' },
      { path: 'vehicle', select: 'make model year licensePlate' },
      { path: 'service', select: 'serviceName category baseCost estimatedDuration' }
    ]);

    // Update service booking count
    await Service.findByIdAndUpdate(req.body.service, {
      $inc: { totalBookings: 1 }
    });

    // Send email notifications
    try {
      await emailService.sendBookingCreatedEmails(booking);
    } catch (emailError) {
      console.error('Failed to send booking emails:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking: ' + error.message,
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes, cancellationReason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                     booking.mechanic.toString() === req.user.id ||
                     (booking.owner.toString() === req.user.id && ['cancelled'].includes(status));

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    const updateData = { status };
    
    if (notes) {
      if (req.user.role === 'mechanic') {
        updateData['notes.mechanic'] = notes;
      } else if (req.user.role === 'owner') {
        updateData['notes.customer'] = notes;
      } else if (req.user.role === 'admin') {
        updateData['notes.admin'] = notes;
      }
    }

    if (status === 'cancelled' && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'owner', select: 'name email phone' },
      { path: 'mechanic', select: 'name email phone' },
      { path: 'vehicle', select: 'make model year licensePlate' },
      { path: 'service', select: 'serviceName category baseCost estimatedDuration' }
    ]);

    // Send email notifications based on status
    try {
      if (status === 'confirmed') {
        await emailService.sendBookingConfirmedEmail(updatedBooking);
      } else if (status === 'cancelled') {
        const cancelledBy = req.user.role === 'owner' ? 'customer' : 'mechanic';
        await emailService.sendBookingCancelledEmail(updatedBooking, cancelledBy);
      } else if (status === 'completed') {
        await emailService.sendBookingCompletedEmail(updatedBooking);
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
const rescheduleBooking = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const canReschedule = req.user.role === 'admin' ||
                         booking.owner.toString() === req.user.id ||
                         booking.mechanic.toString() === req.user.id;

    if (!canReschedule) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this booking'
      });
    }

    // Add to reschedule history
    const rescheduleEntry = {
      originalDate: booking.bookingDate,
      originalTime: booking.bookingTime,
      newDate: newDate,
      newTime: newTime,
      reason: req.body.reason || 'Rescheduled by user',
      changedBy: req.user.id
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        bookingDate: newDate,
        bookingTime: newTime,
        status: 'rescheduled',
        $push: { rescheduleHistory: rescheduleEntry }
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'owner', select: 'name email phone' },
      { path: 'mechanic', select: 'name email phone' },
      { path: 'vehicle', select: 'make model year licensePlate' },
      { path: 'service', select: 'serviceName category baseCost estimatedDuration' }
    ]);

    // Send reschedule email notification
    try {
      await emailService.sendBookingRescheduledEmail(
        updatedBooking,
        booking.bookingDate,
        booking.bookingTime
      );
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError);
      // Don't fail the reschedule if email fails
    }

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error.message
    });
  }
};

// @desc    Get mechanic calendar
// @route   GET /api/bookings/calendar/:mechanicId
// @access  Private
const getMechanicCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Only admin or the mechanic can view calendar
    if (req.user.role !== 'admin' && req.user.id !== req.params.mechanicId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this calendar'
      });
    }

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter.bookingDate = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find({
      mechanic: req.params.mechanicId,
      ...dateFilter,
      status: { $in: ['confirmed', 'in_progress'] }
    })
      .populate('owner', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('service', 'serviceName category estimatedDuration')
      .sort({ bookingDate: 1, bookingTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get mechanic calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar',
      error: error.message
    });
  }
};

module.exports = {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  rescheduleBooking,
  getMechanicCalendar
};
