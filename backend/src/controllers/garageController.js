const Garage = require('../models/Garage');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Get all garages
// @route   GET /api/garages
// @access  Public
const getGarages = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, state, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true, isVerified: true };
    
    // Filter by location
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    const garages = await Garage.find(query)
      .populate('owner', 'name email phone')
      .populate('mechanics', 'name email phone specialization')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Garage.countDocuments(query);

    res.json({
      success: true,
      count: garages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: garages
    });
  } catch (error) {
    console.error('Get garages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch garages',
      error: error.message
    });
  }
};

// @desc    Get single garage
// @route   GET /api/garages/:id
// @access  Public
const getGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('mechanics', 'name email phone specialization rating')
      .populate('services', 'serviceName description baseCost estimatedDuration category');

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: 'Garage not found'
      });
    }

    res.json({
      success: true,
      data: garage
    });
  } catch (error) {
    console.error('Get garage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch garage',
      error: error.message
    });
  }
};

// @desc    Create new garage
// @route   POST /api/garages
// @access  Private (Mechanic or Admin)
const createGarage = async (req, res) => {
  try {
    // Only mechanics and admins can create garages
    if (req.user.role !== 'mechanic' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only mechanics can create garages'
      });
    }

    // Add owner to request body
    req.body.owner = req.user.id;

    const garage = await Garage.create(req.body);

    // Populate owner information
    await garage.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Garage created successfully',
      data: garage
    });
  } catch (error) {
    console.error('Create garage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create garage',
      error: error.message
    });
  }
};

// @desc    Update garage
// @route   PUT /api/garages/:id
// @access  Private
const updateGarage = async (req, res) => {
  try {
    let garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: 'Garage not found'
      });
    }

    // Check ownership or admin access
    if (garage.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this garage'
      });
    }

    garage = await Garage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Garage updated successfully',
      data: garage
    });
  } catch (error) {
    console.error('Update garage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update garage',
      error: error.message
    });
  }
};

// @desc    Delete garage
// @route   DELETE /api/garages/:id
// @access  Private
const deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: 'Garage not found'
      });
    }

    // Check ownership or admin access
    if (garage.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this garage'
      });
    }

    // Soft delete by setting isActive to false
    await Garage.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Garage deleted successfully'
    });
  } catch (error) {
    console.error('Delete garage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete garage',
      error: error.message
    });
  }
};

// @desc    Add mechanic to garage
// @route   POST /api/garages/:id/mechanics
// @access  Private
const addMechanic = async (req, res) => {
  try {
    const { mechanicId } = req.body;
    
    const garage = await Garage.findById(req.params.id);
    if (!garage) {
      return res.status(404).json({
        success: false,
        message: 'Garage not found'
      });
    }

    // Check ownership
    if (garage.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add mechanics to this garage'
      });
    }

    // Check if mechanic exists and is a mechanic
    const mechanic = await User.findById(mechanicId);
    if (!mechanic || mechanic.role !== 'mechanic') {
      return res.status(400).json({
        success: false,
        message: 'Invalid mechanic ID'
      });
    }

    // Check if mechanic is already in garage
    if (garage.mechanics.includes(mechanicId)) {
      return res.status(400).json({
        success: false,
        message: 'Mechanic is already in this garage'
      });
    }

    garage.mechanics.push(mechanicId);
    await garage.save();

    await garage.populate('mechanics', 'name email phone specialization');

    res.json({
      success: true,
      message: 'Mechanic added successfully',
      data: garage
    });
  } catch (error) {
    console.error('Add mechanic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add mechanic',
      error: error.message
    });
  }
};

// @desc    Remove mechanic from garage
// @route   DELETE /api/garages/:id/mechanics/:mechanicId
// @access  Private
const removeMechanic = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) {
      return res.status(404).json({
        success: false,
        message: 'Garage not found'
      });
    }

    // Check ownership
    if (garage.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove mechanics from this garage'
      });
    }

    garage.mechanics = garage.mechanics.filter(
      mechanicId => mechanicId.toString() !== req.params.mechanicId
    );
    await garage.save();

    await garage.populate('mechanics', 'name email phone specialization');

    res.json({
      success: true,
      message: 'Mechanic removed successfully',
      data: garage
    });
  } catch (error) {
    console.error('Remove mechanic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove mechanic',
      error: error.message
    });
  }
};

// @desc    Get garage services
// @route   GET /api/garages/:id/services
// @access  Public
const getGarageServices = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) {
      return res.status(404).json({
        success: false,
        message: 'Garage not found'
      });
    }

    const services = await Service.find({ 
      garage: req.params.id,
      isActive: true,
      isAvailable: true
    })
    .populate('mechanic', 'name email phone specialization rating')
    .sort({ category: 1, baseCost: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get garage services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch garage services',
      error: error.message
    });
  }
};

module.exports = {
  getGarages,
  getGarage,
  createGarage,
  updateGarage,
  deleteGarage,
  addMechanic,
  removeMechanic,
  getGarageServices
};

