const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get all vehicles for a user
// @route   GET /api/vehicles
// @access  Private (Owner or Admin)
const getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // If not admin, only show user's vehicles
    if (req.user.role !== 'admin') {
      query.owner = req.user.id;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      count: vehicles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('serviceHistory.mechanic', 'name email');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check ownership or admin access
    if (vehicle.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this vehicle'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Owner)
const createVehicle = async (req, res) => {
  try {
    // Add owner to request body
    req.body.owner = req.user.id;

    // Fix empty VIN issue - convert empty string to undefined
    if (req.body.vin === '' || req.body.vin === null) {
      delete req.body.vin; // Remove empty VIN to avoid duplicate key error
    }

    const vehicle = await Vehicle.create(req.body);

    // Populate owner information
    await vehicle.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    // Fix empty VIN issue - convert empty string to undefined
    if (req.body.vin === '' || req.body.vin === null) {
      delete req.body.vin; // Remove empty VIN to avoid duplicate key error
    }

    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vehicle'
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
};

// @desc    Add service history
// @route   POST /api/vehicles/:id/service-history
// @access  Private
const addServiceHistory = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add service history'
      });
    }

    const serviceEntry = {
      ...req.body,
      date: req.body.date || new Date(),
      mechanic: req.user.role === 'mechanic' ? req.user.id : req.body.mechanic
    };

    vehicle.serviceHistory.push(serviceEntry);
    await vehicle.save();

    await vehicle.populate('serviceHistory.mechanic', 'name email');

    res.status(201).json({
      success: true,
      message: 'Service history added successfully',
      data: vehicle.serviceHistory
    });
  } catch (error) {
    console.error('Add service history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service history',
      error: error.message
    });
  }
};

// @desc    Get vehicles by owner (for mechanics/admins)
// @route   GET /api/vehicles/owner/:ownerId
// @access  Private (Admin or Mechanic)
const getVehiclesByOwner = async (req, res) => {
  try {
    // Only admin or mechanic can access this
    if (req.user.role !== 'admin' && req.user.role !== 'mechanic') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    const vehicles = await Vehicle.find({ owner: req.params.ownerId })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles by owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addServiceHistory,
  getVehiclesByOwner
};
