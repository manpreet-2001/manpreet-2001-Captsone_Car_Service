const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Service must belong to a mechanic']
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'maintenance',
      'repair',
      'inspection',
      'diagnostic',
      'emergency',
      'preventive',
      'cosmetic'
    ]
  },
  subcategory: {
    type: String,
    enum: [
      'oil_change',
      'brake_service',
      'tire_service',
      'engine_repair',
      'transmission',
      'electrical',
      'ac_service',
      'exhaust',
      'suspension',
      'steering',
      'battery',
      'alternator',
      'starter',
      'fuel_system',
      'cooling_system',
      'general_inspection',
      'safety_inspection',
      'emissions_test',
      'roadside_assistance',
      'towing',
      'other'
    ]
  },
  baseCost: {
    type: Number,
    required: [true, 'Base cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  costType: {
    type: String,
    enum: ['fixed', 'hourly', 'variable'],
    default: 'fixed'
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [15, 'Minimum service duration is 15 minutes'],
    max: [480, 'Maximum service duration is 8 hours']
  },
  requiredSkills: [{
    type: String,
    enum: [
      'basic',
      'intermediate',
      'advanced',
      'specialized',
      'certified'
    ]
  }],
  requiredTools: [String],
  requiredParts: [{
    name: String,
    quantity: Number,
    cost: Number,
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  warranty: {
    duration: {
      type: Number, // in days
      default: 0
    },
    description: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  requiresInspection: {
    type: Boolean,
    default: false
  },
  maxAdvanceBooking: {
    type: Number, // in days
    default: 30
  },
  minAdvanceBooking: {
    type: Number, // in hours
    default: 2
  },
  suitableFor: [{
    type: String,
    enum: [
      'sedan',
      'suv',
      'truck',
      'coupe',
      'convertible',
      'hatchback',
      'wagon',
      'van',
      'motorcycle',
      'all'
    ]
  }],
  serviceAreas: [{
    type: String,
    enum: ['at_garage', 'mobile', 'pickup_delivery', 'roadside']
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
serviceSchema.index({ mechanic: 1, category: 1 });
serviceSchema.index({ category: 1, isAvailable: 1 });
serviceSchema.index({ isEmergency: 1, isAvailable: 1 });

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.estimatedDuration / 60);
  const minutes = this.estimatedDuration % 60;
  
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours}h ${minutes}m`;
  }
});

// Virtual for total cost with parts
serviceSchema.virtual('totalCost').get(function() {
  const partsCost = this.requiredParts.reduce((total, part) => {
    return total + (part.cost * part.quantity);
  }, 0);
  return this.baseCost + partsCost;
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);
